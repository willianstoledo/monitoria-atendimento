from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import Evaluation, Call, User

bp = Blueprint('evaluations', __name__, url_prefix='/api/evaluations')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_evaluations():
    """Lista todas as avaliações com filtros opcionais"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    # Parâmetros de filtro
    operator_id = request.args.get('operator_id', type=int)
    evaluator_id = request.args.get('evaluator_id', type=int)
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Query base
    query = Evaluation.query.join(Call)
    
    # Se for operador, só vê suas próprias avaliações
    if user.role == 'operator':
        query = query.filter(Call.operator_id == current_user_id)
    elif operator_id:
        query = query.filter(Call.operator_id == operator_id)
    
    if evaluator_id:
        query = query.filter(Evaluation.evaluator_id == evaluator_id)
    
    if status:
        query = query.filter(Evaluation.status == status)
    
    # Ordenar por data mais recente
    query = query.order_by(Evaluation.created_at.desc())
    
    # Paginação
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    results = []
    for evaluation in pagination.items:
        eval_dict = evaluation.to_dict()
        eval_dict['call'] = evaluation.call.to_dict()
        results.append(eval_dict)
    
    return jsonify({
        'evaluations': results,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@bp.route('/<int:evaluation_id>', methods=['GET'])
@jwt_required()
def get_evaluation(evaluation_id):
    """Retorna detalhes de uma avaliação específica"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    evaluation = Evaluation.query.get(evaluation_id)
    
    if not evaluation:
        return jsonify({'error': 'Avaliação não encontrada'}), 404
    
    # Operadores só podem ver suas próprias avaliações
    if user.role == 'operator' and evaluation.call.operator_id != current_user_id:
        return jsonify({'error': 'Acesso negado'}), 403
    
    result = evaluation.to_dict()
    result['call'] = evaluation.call.to_dict()
    
    return jsonify(result), 200

@bp.route('', methods=['POST'])
@bp.route('/', methods=['POST'])
@jwt_required()
def create_evaluation():
    """Cria uma nova avaliação (apenas supervisor e admin)"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if user.role not in ['supervisor', 'admin']:
        return jsonify({'error': 'Acesso negado. Apenas supervisores podem criar avaliações'}), 403
    
    data = request.get_json()
    
    # Validações
    if not data or not data.get('call_id'):
        return jsonify({'error': 'ID da chamada é obrigatório'}), 400
    
    call = Call.query.get(data['call_id'])
    
    if not call:
        return jsonify({'error': 'Chamada não encontrada'}), 404
    
    # Verifica se já existe avaliação para esta chamada
    if call.evaluation:
        return jsonify({'error': 'Esta chamada já possui uma avaliação'}), 400
    
    evaluation = Evaluation(
        call_id=data['call_id'],
        evaluator_id=current_user_id,
        greeting_score=data.get('greeting_score'),
        communication_score=data.get('communication_score'),
        knowledge_score=data.get('knowledge_score'),
        problem_solving_score=data.get('problem_solving_score'),
        empathy_score=data.get('empathy_score'),
        closing_score=data.get('closing_score'),
        positive_points=data.get('positive_points'),
        improvement_points=data.get('improvement_points'),
        feedback_to_operator=data.get('feedback_to_operator'),
        status=data.get('status', 'draft')
    )
    
    # Calcular nota geral
    evaluation.calculate_overall_score()
    
    # Se enviando diretamente, marcar data de envio
    if evaluation.status == 'sent':
        evaluation.sent_at = datetime.utcnow()
        call.status = 'evaluated'
    
    db.session.add(evaluation)
    db.session.add(call)
    db.session.commit()
    
    return jsonify({
        'message': 'Avaliação criada com sucesso',
        'evaluation': evaluation.to_dict()
    }), 201

@bp.route('/<int:evaluation_id>', methods=['PUT'])
@jwt_required()
def update_evaluation(evaluation_id):
    """Atualiza uma avaliação existente"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    evaluation = Evaluation.query.get(evaluation_id)
    
    if not evaluation:
        return jsonify({'error': 'Avaliação não encontrada'}), 404
    
    # Apenas o avaliador original ou admin pode editar
    if user.role != 'admin' and evaluation.evaluator_id != current_user_id:
        return jsonify({'error': 'Acesso negado'}), 403
    
    data = request.get_json()
    
    # Atualizar scores
    if 'greeting_score' in data:
        evaluation.greeting_score = data['greeting_score']
    if 'communication_score' in data:
        evaluation.communication_score = data['communication_score']
    if 'knowledge_score' in data:
        evaluation.knowledge_score = data['knowledge_score']
    if 'problem_solving_score' in data:
        evaluation.problem_solving_score = data['problem_solving_score']
    if 'empathy_score' in data:
        evaluation.empathy_score = data['empathy_score']
    if 'closing_score' in data:
        evaluation.closing_score = data['closing_score']
    
    # Atualizar textos
    if 'positive_points' in data:
        evaluation.positive_points = data['positive_points']
    if 'improvement_points' in data:
        evaluation.improvement_points = data['improvement_points']
    if 'feedback_to_operator' in data:
        evaluation.feedback_to_operator = data['feedback_to_operator']
    
    # Atualizar status
    if 'status' in data:
        old_status = evaluation.status
        evaluation.status = data['status']
        
        # Se mudou de draft para sent
        if old_status == 'draft' and evaluation.status == 'sent':
            evaluation.sent_at = datetime.utcnow()
            evaluation.call.status = 'evaluated'
    
    # Recalcular nota geral
    evaluation.calculate_overall_score()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Avaliação atualizada com sucesso',
        'evaluation': evaluation.to_dict()
    }), 200

@bp.route('/<int:evaluation_id>/acknowledge', methods=['POST'])
@jwt_required()
def acknowledge_evaluation(evaluation_id):
    """Marca avaliação como lida pelo operador"""
    current_user_id = int(get_jwt_identity())
    
    evaluation = Evaluation.query.get(evaluation_id)
    
    if not evaluation:
        return jsonify({'error': 'Avaliação não encontrada'}), 404
    
    # Apenas o operador da chamada pode marcar como lida
    if evaluation.call.operator_id != current_user_id:
        return jsonify({'error': 'Acesso negado'}), 403
    
    if evaluation.status != 'sent':
        return jsonify({'error': 'Avaliação não está no status enviada'}), 400
    
    evaluation.status = 'acknowledged'
    evaluation.acknowledged_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Avaliação marcada como lida',
        'evaluation': evaluation.to_dict()
    }), 200

@bp.route('/<int:evaluation_id>', methods=['DELETE'])
@jwt_required()
def delete_evaluation(evaluation_id):
    """Deleta uma avaliação (apenas admin)"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Acesso negado'}), 403
    
    evaluation = Evaluation.query.get(evaluation_id)
    
    if not evaluation:
        return jsonify({'error': 'Avaliação não encontrada'}), 404
    
    # Atualizar status da chamada
    evaluation.call.status = 'pending'
    
    db.session.delete(evaluation)
    db.session.commit()
    
    return jsonify({'message': 'Avaliação deletada com sucesso'}), 200
