from app import create_app, db
from app.models import User, Call, Evaluation
from datetime import datetime, timedelta
import random

app = create_app()

with app.app_context():
    # Criar tabelas
    db.create_all()
    print("✅ Tabelas criadas!")
    
    # Verificar se já existem usuários
    if User.query.count() > 0:
        print("⚠️  Banco já possui dados. Pulando seed.")
        exit(0)
    
    # Criar usuários
    users_data = [
        {'username': 'admin', 'password': 'admin123', 'email': 'admin@monitoria.com', 'full_name': 'Administrador', 'role': 'admin'},
        {'username': 'supervisor', 'password': 'super123', 'email': 'supervisor@monitoria.com', 'full_name': 'Supervisor', 'role': 'supervisor'},
        {'username': 'operador1', 'password': 'oper123', 'email': 'operador1@monitoria.com', 'full_name': 'João Operador', 'role': 'operator'},
        {'username': 'operador2', 'password': 'oper123', 'email': 'operador2@monitoria.com', 'full_name': 'Maria Atendente', 'role': 'operator'},
    ]
    
    users = []
    for user_data in users_data:
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            full_name=user_data['full_name'],
            role=user_data['role']
        )
        user.set_password(user_data['password'])
        db.session.add(user)
        users.append(user)
    
    db.session.commit()
    print(f"✅ {len(users)} usuários criados!")
    
    # Criar chamadas
    call_types = ['complaint', 'information', 'sales', 'support']
    operators = [u for u in users if u.role == 'operator']
    
    calls = []
    for i in range(1, 21):
        call = Call(
            protocol=f'CALL-20260121-{str(i).zfill(4)}',
            operator_id=random.choice(operators).id,
            customer_name=f'Cliente {i}',
            customer_phone=f'(11) 9{random.randint(1000,9999)}-{random.randint(1000,9999)}',
            customer_email=f'cliente{i}@email.com',
            call_type=random.choice(call_types),
            call_date=datetime.now() - timedelta(days=random.randint(1, 30)),
            duration_seconds=random.randint(180, 900),
            status='pending'
        )
        db.session.add(call)
        calls.append(call)
    
    db.session.commit()
    print(f"✅ {len(calls)} chamadas criadas!")
    
    # Criar avaliações para 75% das chamadas
    evaluator = [u for u in users if u.role in ['admin', 'supervisor']][0]
    evaluated_calls = random.sample(calls, 15)
    
    evaluations = []
    for call in evaluated_calls:
        evaluation = Evaluation(
            call_id=call.id,
            evaluator_id=evaluator.id,
            greeting_score=random.randint(3, 5),
            communication_score=random.randint(3, 5),
            empathy_score=random.randint(3, 5),
            knowledge_score=random.randint(3, 5),
            problem_solving_score=random.randint(3, 5),
            closing_score=random.randint(3, 5),
            feedback_to_operator='Bom atendimento no geral.',
            status='sent',
            sent_at=datetime.now()
        )
        db.session.add(evaluation)
        call.status = 'evaluated'
        db.session.add(call)
        evaluations.append(evaluation)
    
    db.session.commit()
    print(f"✅ {len(evaluations)} avaliações criadas!")
    print("\n🎉 Banco de dados inicializado com sucesso!")
