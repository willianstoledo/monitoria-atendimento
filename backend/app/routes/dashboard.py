from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app import db
from app.models import Call, Evaluation, User

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Retorna estatísticas gerais do sistema"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    # Parâmetros de filtro
    operator_id = request.args.get('operator_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Definir período padrão (últimos 30 dias)
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = datetime.utcnow().isoformat()
    
    # Query base para chamadas
    calls_query = Call.query.filter(
        and_(
            Call.call_date >= datetime.fromisoformat(start_date),
            Call.call_date <= datetime.fromisoformat(end_date)
        )
    )
    
    # Se for operador, filtrar apenas suas chamadas
    if user.role == 'operator':
        calls_query = calls_query.filter_by(operator_id=current_user_id)
    elif operator_id:
        calls_query = calls_query.filter_by(operator_id=operator_id)
    
    # Estatísticas de chamadas
    total_calls = calls_query.count()
    evaluated_calls = calls_query.filter_by(status='evaluated').count()
    pending_calls = calls_query.filter_by(status='pending').count()
    
    # Duração média das chamadas
    avg_duration = db.session.query(func.avg(Call.duration_seconds)).filter(
        Call.id.in_([c.id for c in calls_query.all()])
    ).scalar() or 0
    
    # Distribuição por tipo de chamada
    call_types = db.session.query(
        Call.call_type,
        func.count(Call.id)
    ).filter(
        Call.id.in_([c.id for c in calls_query.all()])
    ).group_by(Call.call_type).all()
    
    call_types_dist = {ct[0]: ct[1] for ct in call_types}
    
    # Query para avaliações
    evaluations_query = Evaluation.query.join(Call).filter(
        and_(
            Call.call_date >= datetime.fromisoformat(start_date),
            Call.call_date <= datetime.fromisoformat(end_date)
        )
    )
    
    if user.role == 'operator':
        evaluations_query = evaluations_query.filter(Call.operator_id == current_user_id)
    elif operator_id:
        evaluations_query = evaluations_query.filter(Call.operator_id == operator_id)
    
    # Média geral de avaliações
    avg_overall_score = db.session.query(func.avg(Evaluation.overall_score)).filter(
        Evaluation.id.in_([e.id for e in evaluations_query.all()])
    ).scalar() or 0
    
    # Média por critério
    criteria_averages = {
        'greeting': db.session.query(func.avg(Evaluation.greeting_score)).filter(
            Evaluation.id.in_([e.id for e in evaluations_query.all()])
        ).scalar() or 0,
        'communication': db.session.query(func.avg(Evaluation.communication_score)).filter(
            Evaluation.id.in_([e.id for e in evaluations_query.all()])
        ).scalar() or 0,
        'knowledge': db.session.query(func.avg(Evaluation.knowledge_score)).filter(
            Evaluation.id.in_([e.id for e in evaluations_query.all()])
        ).scalar() or 0,
        'problem_solving': db.session.query(func.avg(Evaluation.problem_solving_score)).filter(
            Evaluation.id.in_([e.id for e in evaluations_query.all()])
        ).scalar() or 0,
        'empathy': db.session.query(func.avg(Evaluation.empathy_score)).filter(
            Evaluation.id.in_([e.id for e in evaluations_query.all()])
        ).scalar() or 0,
        'closing': db.session.query(func.avg(Evaluation.closing_score)).filter(
            Evaluation.id.in_([e.id for e in evaluations_query.all()])
        ).scalar() or 0
    }
    
    return jsonify({
        'period': {
            'start_date': start_date,
            'end_date': end_date
        },
        'calls': {
            'total': total_calls,
            'evaluated': evaluated_calls,
            'pending': pending_calls,
            'avg_duration_seconds': round(avg_duration, 2),
            'by_type': call_types_dist
        },
        'evaluations': {
            'avg_overall_score': round(avg_overall_score, 2),
            'criteria_averages': {k: round(v, 2) for k, v in criteria_averages.items()}
        }
    }), 200

@bp.route('/recent-activity', methods=['GET'])
@jwt_required()
def get_recent_activity():
    """Retorna atividades recentes do sistema"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    limit = request.args.get('limit', 10, type=int)
    
    # Chamadas recentes
    calls_query = Call.query
    if user.role == 'operator':
        calls_query = calls_query.filter_by(operator_id=current_user_id)
    
    recent_calls = calls_query.order_by(Call.created_at.desc()).limit(limit).all()
    
    # Avaliações recentes
    evaluations_query = Evaluation.query.join(Call)
    if user.role == 'operator':
        evaluations_query = evaluations_query.filter(Call.operator_id == current_user_id)
    
    recent_evaluations = evaluations_query.order_by(Evaluation.created_at.desc()).limit(limit).all()
    
    return jsonify({
        'recent_calls': [call.to_dict() for call in recent_calls],
        'recent_evaluations': [
            {**eval.to_dict(), 'call': eval.call.to_dict()} 
            for eval in recent_evaluations
        ]
    }), 200

@bp.route('/operators-ranking', methods=['GET'])
@jwt_required()
def get_operators_ranking():
    """Retorna ranking de operadores por desempenho (apenas supervisor e admin)"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if user.role not in ['supervisor', 'admin']:
        return jsonify({'error': 'Acesso negado'}), 403
    
    # Parâmetros
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = datetime.utcnow().isoformat()
    
    # Query para ranking
    ranking = db.session.query(
        User.id,
        User.full_name,
        func.count(Call.id).label('total_calls'),
        func.avg(Evaluation.overall_score).label('avg_score')
    ).join(
        Call, Call.operator_id == User.id
    ).outerjoin(
        Evaluation, Evaluation.call_id == Call.id
    ).filter(
        and_(
            User.role == 'operator',
            Call.call_date >= datetime.fromisoformat(start_date),
            Call.call_date <= datetime.fromisoformat(end_date)
        )
    ).group_by(User.id, User.full_name).order_by(func.avg(Evaluation.overall_score).desc()).all()
    
    results = []
    for rank, (user_id, full_name, total_calls, avg_score) in enumerate(ranking, 1):
        results.append({
            'rank': rank,
            'operator_id': user_id,
            'operator_name': full_name,
            'total_calls': total_calls,
            'avg_score': round(avg_score, 2) if avg_score else None
        })
    
    return jsonify({
        'period': {
            'start_date': start_date,
            'end_date': end_date
        },
        'ranking': results
    }), 200
