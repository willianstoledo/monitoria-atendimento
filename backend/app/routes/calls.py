from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import Call, User

bp = Blueprint('calls', __name__, url_prefix='/api/calls')

@bp.route('', methods=['GET'])
@bp.route('/', methods=['GET'])
@jwt_required()
def get_calls():
    """Lista todas as chamadas com filtros opcionais"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    # Parâmetros de filtro
    operator_id = request.args.get('operator_id', type=int)
    status = request.args.get('status')
    call_type = request.args.get('call_type')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Query base
    query = Call.query
    
    # Se for operador, só vê suas próprias chamadas
    if user.role == 'operator':
        query = query.filter_by(operator_id=current_user_id)
    elif operator_id:
        query = query.filter_by(operator_id=operator_id)
    
    # Aplicar filtros
    if status:
        query = query.filter_by(status=status)
    if call_type:
        query = query.filter_by(call_type=call_type)
    if start_date:
        query = query.filter(Call.call_date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Call.call_date <= datetime.fromisoformat(end_date))
    
    # Ordenar por data mais recente
    query = query.order_by(Call.call_date.desc())
    
    # Paginação
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'calls': [call.to_dict() for call in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@bp.route('/<int:call_id>', methods=['GET'])
@jwt_required()
def get_call(call_id):
    """Retorna detalhes de uma chamada específica"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    call = Call.query.get(call_id)
    
    if not call:
        return jsonify({'error': 'Chamada não encontrada'}), 404
    
    # Operadores só podem ver suas próprias chamadas
    if user.role == 'operator' and call.operator_id != current_user_id:
        return jsonify({'error': 'Acesso negado'}), 403
    
    result = call.to_dict()
    
    # Incluir avaliação se existir
    if call.evaluation:
        result['evaluation'] = call.evaluation.to_dict()
    
    return jsonify(result), 200

@bp.route('', methods=['POST'])
@bp.route('/', methods=['POST'])
@jwt_required()
def create_call():
    """Cria uma nova chamada"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    data = request.get_json()
    
    # Validações
    if not data or not data.get('customer_name') or not data.get('call_type'):
        return jsonify({'error': 'Dados incompletos'}), 400
    
    # Gerar protocolo único
    import random
    import string
    protocol = f"CALL-{datetime.now().strftime('%Y%m%d')}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
    
    # Determinar operador
    operator_id = data.get('operator_id', current_user_id)
    
    # Apenas supervisores e admins podem criar chamadas para outros operadores
    if user.role == 'operator' and operator_id != current_user_id:
        return jsonify({'error': 'Acesso negado'}), 403
    
    call = Call(
        protocol=protocol,
        operator_id=operator_id,
        customer_name=data['customer_name'],
        customer_phone=data.get('customer_phone'),
        customer_email=data.get('customer_email'),
        call_type=data['call_type'],
        call_date=datetime.fromisoformat(data['call_date']) if data.get('call_date') else datetime.utcnow(),
        duration_seconds=data.get('duration_seconds'),
        recording_url=data.get('recording_url'),
        transcript=data.get('transcript'),
        notes=data.get('notes')
    )
    
    db.session.add(call)
    db.session.commit()
    
    return jsonify({
        'message': 'Chamada criada com sucesso',
        'call': call.to_dict()
    }), 201

@bp.route('/<int:call_id>', methods=['PUT'])
@jwt_required()
def update_call(call_id):
    """Atualiza uma chamada existente"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    call = Call.query.get(call_id)
    
    if not call:
        return jsonify({'error': 'Chamada não encontrada'}), 404
    
    # Operadores só podem editar suas próprias chamadas
    if user.role == 'operator' and call.operator_id != current_user_id:
        return jsonify({'error': 'Acesso negado'}), 403
    
    data = request.get_json()
    
    # Atualizar campos permitidos
    if 'customer_name' in data:
        call.customer_name = data['customer_name']
    if 'customer_phone' in data:
        call.customer_phone = data['customer_phone']
    if 'customer_email' in data:
        call.customer_email = data['customer_email']
    if 'call_type' in data:
        call.call_type = data['call_type']
    if 'duration_seconds' in data:
        call.duration_seconds = data['duration_seconds']
    if 'recording_url' in data:
        call.recording_url = data['recording_url']
    if 'transcript' in data:
        call.transcript = data['transcript']
    if 'notes' in data:
        call.notes = data['notes']
    if 'status' in data and user.role in ['supervisor', 'admin']:
        call.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Chamada atualizada com sucesso',
        'call': call.to_dict()
    }), 200

@bp.route('/<int:call_id>', methods=['DELETE'])
@jwt_required()
def delete_call(call_id):
    """Deleta uma chamada (apenas admin)"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Acesso negado'}), 403
    
    call = Call.query.get(call_id)
    
    if not call:
        return jsonify({'error': 'Chamada não encontrada'}), 404
    
    db.session.delete(call)
    db.session.commit()
    
    return jsonify({'message': 'Chamada deletada com sucesso'}), 200
