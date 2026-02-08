from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models import User

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    """Registra um novo usuário"""
    data = request.get_json()
    
    # Validações básicas
    if not data or not data.get('username') or not data.get('password') or not data.get('email'):
        return jsonify({'error': 'Dados incompletos'}), 400
    
    # Verifica se usuário já existe
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Nome de usuário já existe'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    # Cria novo usuário
    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data.get('full_name', data['username']),
        role=data.get('role', 'operator')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Usuário criado com sucesso',
        'user': user.to_dict()
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    """Autentica um usuário e retorna tokens JWT"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Credenciais incompletas'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Credenciais inválidas'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Usuário inativo'}), 403
    
    # Gera tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200

@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Renova o access token usando refresh token"""
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': access_token}), 200

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Retorna informações do usuário autenticado"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

@bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Altera a senha do usuário autenticado"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Dados incompletos'}), 400
    
    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Senha atual incorreta'}), 401
    
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Senha alterada com sucesso'}), 200
