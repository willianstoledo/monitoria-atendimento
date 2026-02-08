from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='default'):
    """Factory para criar a aplicação Flask"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Inicializar extensões
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configurar CORS com suporte completo
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })
    
    # Registrar blueprints
    from app.routes import auth, calls, evaluations, reports, dashboard
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(calls.bp)
    app.register_blueprint(evaluations.bp)
    app.register_blueprint(reports.bp)
    app.register_blueprint(dashboard.bp)
    
    # Rota de health check
    @app.route('/health')
    def health_check():
        return {'status': 'ok', 'message': 'Sistema de Monitoria de Atendimento'}, 200
    
    return app
