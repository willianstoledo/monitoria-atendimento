from datetime import datetime
from app import db
import bcrypt

class User(db.Model):
    """Modelo de usuário do sistema"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='operator')  # operator, supervisor, admin
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    calls_as_operator = db.relationship('Call', foreign_keys='Call.operator_id', backref='operator', lazy='dynamic')
    evaluations_made = db.relationship('Evaluation', foreign_keys='Evaluation.evaluator_id', backref='evaluator', lazy='dynamic')
    
    def set_password(self, password):
        """Hash da senha usando bcrypt"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Verifica se a senha está correta"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Serializa o usuário para dicionário"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Call(db.Model):
    """Modelo de chamada/atendimento"""
    __tablename__ = 'calls'
    
    id = db.Column(db.Integer, primary_key=True)
    protocol = db.Column(db.String(50), unique=True, nullable=False)
    operator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    customer_name = db.Column(db.String(200), nullable=False)
    customer_phone = db.Column(db.String(20))
    customer_email = db.Column(db.String(120))
    call_type = db.Column(db.String(50), nullable=False)  # suporte, vendas, reclamacao, etc
    call_date = db.Column(db.DateTime, nullable=False)
    duration_seconds = db.Column(db.Integer)
    status = db.Column(db.String(20), default='pending')  # pending, evaluated, archived
    recording_url = db.Column(db.String(500))
    transcript = db.Column(db.Text)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    evaluation = db.relationship('Evaluation', backref='call', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Serializa a chamada para dicionário"""
        return {
            'id': self.id,
            'protocol': self.protocol,
            'operator_id': self.operator_id,
            'operator_name': self.operator.full_name if self.operator else None,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'customer_email': self.customer_email,
            'call_type': self.call_type,
            'call_date': self.call_date.isoformat() if self.call_date else None,
            'duration_seconds': self.duration_seconds,
            'status': self.status,
            'recording_url': self.recording_url,
            'transcript': self.transcript,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'has_evaluation': self.evaluation is not None
        }


class Evaluation(db.Model):
    """Modelo de avaliação de atendimento"""
    __tablename__ = 'evaluations'
    
    id = db.Column(db.Integer, primary_key=True)
    call_id = db.Column(db.Integer, db.ForeignKey('calls.id'), nullable=False, unique=True)
    evaluator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Critérios de avaliação (escala 1-5)
    greeting_score = db.Column(db.Integer)  # Saudação e apresentação
    communication_score = db.Column(db.Integer)  # Clareza e comunicação
    knowledge_score = db.Column(db.Integer)  # Conhecimento técnico
    problem_solving_score = db.Column(db.Integer)  # Resolução do problema
    empathy_score = db.Column(db.Integer)  # Empatia e cordialidade
    closing_score = db.Column(db.Integer)  # Encerramento adequado
    
    overall_score = db.Column(db.Float)  # Nota geral calculada
    
    positive_points = db.Column(db.Text)
    improvement_points = db.Column(db.Text)
    feedback_to_operator = db.Column(db.Text)
    
    status = db.Column(db.String(20), default='draft')  # draft, sent, acknowledged
    sent_at = db.Column(db.DateTime)
    acknowledged_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def calculate_overall_score(self):
        """Calcula a nota geral baseada nos critérios"""
        scores = [
            self.greeting_score,
            self.communication_score,
            self.knowledge_score,
            self.problem_solving_score,
            self.empathy_score,
            self.closing_score
        ]
        valid_scores = [s for s in scores if s is not None]
        if valid_scores:
            self.overall_score = sum(valid_scores) / len(valid_scores)
        return self.overall_score
    
    def to_dict(self):
        """Serializa a avaliação para dicionário"""
        return {
            'id': self.id,
            'call_id': self.call_id,
            'evaluator_id': self.evaluator_id,
            'evaluator_name': self.evaluator.full_name if self.evaluator else None,
            'greeting_score': self.greeting_score,
            'communication_score': self.communication_score,
            'knowledge_score': self.knowledge_score,
            'problem_solving_score': self.problem_solving_score,
            'empathy_score': self.empathy_score,
            'closing_score': self.closing_score,
            'overall_score': self.overall_score,
            'positive_points': self.positive_points,
            'improvement_points': self.improvement_points,
            'feedback_to_operator': self.feedback_to_operator,
            'status': self.status,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'acknowledged_at': self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
