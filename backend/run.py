#!/usr/bin/env python3
import os
from datetime import datetime, timedelta
import random
from app import create_app, db
from app.models import User, Call, Evaluation

app = create_app(os.getenv('FLASK_ENV', 'development'))

@app.shell_context_processor
def make_shell_context():
    """Contexto para Flask shell"""
    return {
        'db': db,
        'User': User,
        'Call': Call,
        'Evaluation': Evaluation
    }

@app.cli.command()
def init_db():
    """Inicializa o banco de dados"""
    db.create_all()
    print('Banco de dados inicializado com sucesso!')

@app.cli.command()
def seed_db():
    """Popula o banco com dados de exemplo"""
    # Verificar se já existem usuários
    if User.query.count() > 0:
        print('Banco já possui dados. Limpando...')
        db.session.query(Evaluation).delete()
        db.session.query(Call).delete()
        db.session.query(User).delete()
        db.session.commit()
    
    # Criar usuários de exemplo
    admin = User(
        username='admin',
        email='admin@monitoria.com',
        full_name='Administrador',
        role='admin'
    )
    admin.set_password('admin123')
    
    supervisor = User(
        username='supervisor',
        email='supervisor@monitoria.com',
        full_name='Supervisor Silva',
        role='supervisor'
    )
    supervisor.set_password('super123')
    
    operator1 = User(
        username='operador1',
        email='operador1@monitoria.com',
        full_name='João Operador',
        role='operator'
    )
    operator1.set_password('oper123')
    
    operator2 = User(
        username='operador2',
        email='operador2@monitoria.com',
        full_name='Maria Atendente',
        role='operator'
    )
    operator2.set_password('oper123')
    
    db.session.add_all([admin, supervisor, operator1, operator2])
    db.session.commit()
    
    # Criar chamadas de exemplo
    call_types = ['support', 'sales', 'complaint', 'information']
    operators = [operator1, operator2]
    
    calls = []
    for i in range(20):
        days_ago = random.randint(0, 30)
        call_date = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
        
        call = Call(
            protocol=f'CALL-{datetime.utcnow().strftime("%Y%m%d")}-{str(i+1).zfill(4)}',
            operator_id=random.choice(operators).id,
            customer_name=f'Cliente {i+1}',
            customer_phone=f'(11) 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}',
            call_type=random.choice(call_types),
            call_date=call_date,
            duration_seconds=random.randint(60, 600),
            status='evaluated' if i < 15 else 'pending',
            notes=f'Chamada de exemplo {i+1}'
        )
        calls.append(call)
    
    db.session.add_all(calls)
    db.session.commit()
    
    # Criar avaliações para as chamadas avaliadas
    for call in calls[:15]:
        evaluation = Evaluation(
            call_id=call.id,
            evaluator_id=supervisor.id,
            greeting_score=random.randint(3, 5),
            communication_score=random.randint(3, 5),
            knowledge_score=random.randint(3, 5),
            problem_solving_score=random.randint(3, 5),
            empathy_score=random.randint(3, 5),
            closing_score=random.randint(3, 5),
            positive_points='Atendimento cordial e profissional',
            improvement_points='Pode melhorar o tempo de resposta',
            feedback_to_operator='Bom trabalho! Continue assim.',
            status='sent'
        )
        evaluation.calculate_overall_score()
        db.session.add(evaluation)
    
    db.session.commit()
    
    print('Dados de exemplo criados com sucesso!')
    print('\nUsuários criados:')
    print('- admin / admin123 (Administrador)')
    print('- supervisor / super123 (Supervisor)')
    print('- operador1 / oper123 (Operador)')
    print('- operador2 / oper123 (Operador)')
    print(f'\n{len(calls)} chamadas criadas')
    print(f'15 avaliações criadas')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
