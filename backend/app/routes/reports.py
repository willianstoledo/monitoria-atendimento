from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app import db
from app.models import Call, Evaluation, User

bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@bp.route('/performance', methods=['GET'])
@jwt_required()
def performance_report():
    """Relatório de desempenho detalhado"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    operator_id = request.args.get('operator_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Validações de acesso
    if user.role == 'operator':
        operator_id = current_user_id
    elif not operator_id:
        return jsonify({'error': 'operator_id é obrigatório para supervisores'}), 400
    
    # Período padrão
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = datetime.utcnow().isoformat()
    
    operator = User.query.get(operator_id)
    if not operator:
        return jsonify({'error': 'Operador não encontrado'}), 404
    
    # Chamadas no período
    calls = Call.query.filter(
        and_(
            Call.operator_id == operator_id,
            Call.call_date >= datetime.fromisoformat(start_date),
            Call.call_date <= datetime.fromisoformat(end_date)
        )
    ).all()
    
    # Avaliações no período
    evaluations = Evaluation.query.join(Call).filter(
        and_(
            Call.operator_id == operator_id,
            Call.call_date >= datetime.fromisoformat(start_date),
            Call.call_date <= datetime.fromisoformat(end_date)
        )
    ).all()
    
    # Calcular métricas
    total_calls = len(calls)
    total_evaluations = len(evaluations)
    
    if evaluations:
        avg_scores = {
            'overall': sum(e.overall_score for e in evaluations if e.overall_score) / len([e for e in evaluations if e.overall_score]),
            'greeting': sum(e.greeting_score for e in evaluations if e.greeting_score) / len([e for e in evaluations if e.greeting_score]),
            'communication': sum(e.communication_score for e in evaluations if e.communication_score) / len([e for e in evaluations if e.communication_score]),
            'knowledge': sum(e.knowledge_score for e in evaluations if e.knowledge_score) / len([e for e in evaluations if e.knowledge_score]),
            'problem_solving': sum(e.problem_solving_score for e in evaluations if e.problem_solving_score) / len([e for e in evaluations if e.problem_solving_score]),
            'empathy': sum(e.empathy_score for e in evaluations if e.empathy_score) / len([e for e in evaluations if e.empathy_score]),
            'closing': sum(e.closing_score for e in evaluations if e.closing_score) / len([e for e in evaluations if e.closing_score])
        }
        avg_scores = {k: round(v, 2) for k, v in avg_scores.items()}
    else:
        avg_scores = None
    
    # Evolução temporal (por semana)
    weekly_performance = []
    current_date = datetime.fromisoformat(start_date)
    end = datetime.fromisoformat(end_date)
    
    while current_date < end:
        week_end = min(current_date + timedelta(days=7), end)
        
        week_evals = [e for e in evaluations if current_date <= e.created_at < week_end]
        
        if week_evals:
            week_avg = sum(e.overall_score for e in week_evals if e.overall_score) / len([e for e in week_evals if e.overall_score])
        else:
            week_avg = None
        
        weekly_performance.append({
            'week_start': current_date.isoformat(),
            'week_end': week_end.isoformat(),
            'evaluations_count': len(week_evals),
            'avg_score': round(week_avg, 2) if week_avg else None
        })
        
        current_date = week_end
    
    return jsonify({
        'operator': operator.to_dict(),
        'period': {
            'start_date': start_date,
            'end_date': end_date
        },
        'summary': {
            'total_calls': total_calls,
            'total_evaluations': total_evaluations,
            'evaluation_rate': round((total_evaluations / total_calls * 100), 2) if total_calls > 0 else 0,
            'avg_scores': avg_scores
        },
        'weekly_performance': weekly_performance
    }), 200

@bp.route('/team-overview', methods=['GET'])
@jwt_required()
def team_overview_report():
    """Relatório geral da equipe (apenas supervisor e admin)"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role not in ['supervisor', 'admin']:
        return jsonify({'error': 'Acesso negado'}), 403
    
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = datetime.utcnow().isoformat()
    
    # Operadores ativos
    operators = User.query.filter_by(role='operator', is_active=True).all()
    
    team_data = []
    
    for operator in operators:
        # Chamadas do operador
        calls_count = Call.query.filter(
            and_(
                Call.operator_id == operator.id,
                Call.call_date >= datetime.fromisoformat(start_date),
                Call.call_date <= datetime.fromisoformat(end_date)
            )
        ).count()
        
        # Avaliações do operador
        evaluations = Evaluation.query.join(Call).filter(
            and_(
                Call.operator_id == operator.id,
                Call.call_date >= datetime.fromisoformat(start_date),
                Call.call_date <= datetime.fromisoformat(end_date)
            )
        ).all()
        
        evaluations_count = len(evaluations)
        
        if evaluations:
            avg_score = sum(e.overall_score for e in evaluations if e.overall_score) / len([e for e in evaluations if e.overall_score])
        else:
            avg_score = None
        
        team_data.append({
            'operator_id': operator.id,
            'operator_name': operator.full_name,
            'calls_count': calls_count,
            'evaluations_count': evaluations_count,
            'avg_score': round(avg_score, 2) if avg_score else None
        })
    
    # Ordenar por média de score
    team_data.sort(key=lambda x: x['avg_score'] if x['avg_score'] else 0, reverse=True)
    
    # Estatísticas gerais
    total_calls = sum(op['calls_count'] for op in team_data)
    total_evaluations = sum(op['evaluations_count'] for op in team_data)
    
    scores = [op['avg_score'] for op in team_data if op['avg_score']]
    team_avg_score = sum(scores) / len(scores) if scores else None
    
    return jsonify({
        'period': {
            'start_date': start_date,
            'end_date': end_date
        },
        'team_summary': {
            'total_operators': len(operators),
            'total_calls': total_calls,
            'total_evaluations': total_evaluations,
            'team_avg_score': round(team_avg_score, 2) if team_avg_score else None
        },
        'operators': team_data
    }), 200

@bp.route('/quality-trends', methods=['GET'])
@jwt_required()
def quality_trends_report():
    """Relatório de tendências de qualidade ao longo do tempo"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    operator_id = request.args.get('operator_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Validações
    if user.role == 'operator':
        operator_id = current_user_id
    
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=90)).isoformat()
    if not end_date:
        end_date = datetime.utcnow().isoformat()
    
    # Query base
    query = Evaluation.query.join(Call).filter(
        and_(
            Call.call_date >= datetime.fromisoformat(start_date),
            Call.call_date <= datetime.fromisoformat(end_date)
        )
    )
    
    if operator_id:
        query = query.filter(Call.operator_id == operator_id)
    elif user.role not in ['supervisor', 'admin']:
        return jsonify({'error': 'Acesso negado'}), 403
    
    evaluations = query.order_by(Call.call_date).all()
    
    # Agrupar por mês
    monthly_trends = {}
    
    for evaluation in evaluations:
        month_key = evaluation.call.call_date.strftime('%Y-%m')
        
        if month_key not in monthly_trends:
            monthly_trends[month_key] = {
                'month': month_key,
                'evaluations': [],
                'scores': {
                    'greeting': [],
                    'communication': [],
                    'knowledge': [],
                    'problem_solving': [],
                    'empathy': [],
                    'closing': [],
                    'overall': []
                }
            }
        
        monthly_trends[month_key]['evaluations'].append(evaluation.id)
        
        if evaluation.greeting_score:
            monthly_trends[month_key]['scores']['greeting'].append(evaluation.greeting_score)
        if evaluation.communication_score:
            monthly_trends[month_key]['scores']['communication'].append(evaluation.communication_score)
        if evaluation.knowledge_score:
            monthly_trends[month_key]['scores']['knowledge'].append(evaluation.knowledge_score)
        if evaluation.problem_solving_score:
            monthly_trends[month_key]['scores']['problem_solving'].append(evaluation.problem_solving_score)
        if evaluation.empathy_score:
            monthly_trends[month_key]['scores']['empathy'].append(evaluation.empathy_score)
        if evaluation.closing_score:
            monthly_trends[month_key]['scores']['closing'].append(evaluation.closing_score)
        if evaluation.overall_score:
            monthly_trends[month_key]['scores']['overall'].append(evaluation.overall_score)
    
    # Calcular médias
    trends = []
    for month_data in sorted(monthly_trends.values(), key=lambda x: x['month']):
        avg_scores = {}
        for criterion, scores in month_data['scores'].items():
            avg_scores[criterion] = round(sum(scores) / len(scores), 2) if scores else None
        
        trends.append({
            'month': month_data['month'],
            'evaluations_count': len(month_data['evaluations']),
            'avg_scores': avg_scores
        })
    
    return jsonify({
        'period': {
            'start_date': start_date,
            'end_date': end_date
        },
        'operator_id': operator_id,
        'trends': trends
    }), 200
