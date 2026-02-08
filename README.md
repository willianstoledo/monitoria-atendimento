'''
# Sistema de Monitoria de Atendimento

Este é o README para o projeto de Sistema de Monitoria de Atendimento, um MVP funcional desenvolvido com uma stack open source: Python/Flask para o backend, React para o frontend e PostgreSQL como banco de dados.

## Visão Geral do Projeto

O objetivo deste projeto é criar um sistema robusto para monitorar a qualidade dos atendimentos de uma central, permitindo que supervisores avaliem chamadas, forneçam feedback aos operadores e gerem relatórios de desempenho.

### Principais Funcionalidades do MVP

- **Autenticação de Usuários**: Sistema de login seguro com diferentes níveis de acesso (Operador, Supervisor, Admin).
- **Dashboard de Métricas**: Visualização rápida das principais métricas de atendimento e avaliação.
- **Gestão de Chamadas**: Listagem, criação, edição e visualização de detalhes das chamadas registradas.
- **Sistema de Avaliação**: Formulário detalhado para avaliar chamadas com base em critérios pré-definidos.
- **Relatórios de Desempenho**: Geração de relatórios sobre o desempenho individual e da equipe.

## Estrutura de Diretórios

O projeto está organizado da seguinte forma:

```
/home/ubuntu/monitoria-atendimento/
├── backend/         # Aplicação Flask (Python)
│   ├── app/             # Lógica principal da aplicação
│   │   ├── routes/      # Blueprints com as rotas da API
│   │   ├── __init__.py  # Factory da aplicação
│   │   └── models.py    # Modelos de dados SQLAlchemy
│   ├── migrations/      # Migrações do banco de dados (Flask-Migrate)
│   ├── venv/            # Ambiente virtual Python
│   ├── config.py        # Configurações da aplicação
│   ├── requirements.txt # Dependências Python
│   └── run.py           # Ponto de entrada do backend
├── frontend/        # Aplicação React (Vite)
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── contexts/    # Contextos React (Ex: AuthContext)
│   │   ├── pages/       # Componentes de página (rotas)
│   │   ├── services/    # Lógica de comunicação com a API
│   │   ├── App.jsx      # Componente principal e roteamento
│   │   └── main.jsx     # Ponto de entrada do React
│   ├── package.json     # Dependências e scripts do frontend
│   └── vite.config.js   # Configuração do Vite
├── database/        # Scripts e configurações do banco
│   └── init_db.sh     # Script para criar o banco de dados inicial
└── README.md        # Este arquivo
```

## Como Executar o Projeto

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento.

### 1. Configurar o Banco de Dados

O PostgreSQL já foi instalado e configurado. Um banco de dados chamado `monitoria_atendimento` foi criado e está pronto para uso.

### 2. Configurar e Executar o Backend

O backend utiliza Flask e um ambiente virtual Python para gerenciar as dependências.

```bash
# 1. Navegue até o diretório do backend
cd /home/ubuntu/monitoria-atendimento/backend

# 2. Crie o ambiente virtual (se ainda não existir)
python3.11 -m venv venv

# 3. Ative o ambiente virtual
source venv/bin/activate

# 4. Instale as dependências
pip install -r requirements.txt

# 5. Configure o banco de dados e popule com dados de teste
export FLASK_APP=run.py
flask init-db
flask seed-db

# 6. Inicie o servidor de desenvolvimento do backend
# O servidor estará rodando em http://localhost:5000
python run.py
```

### 3. Configurar e Executar o Frontend

O frontend é uma aplicação React criada com Vite.

```bash
# 1. Navegue até o diretório do frontend
cd /home/ubuntu/monitoria-atendimento/frontend

# 2. Instale as dependências
pnpm install

# 3. Inicie o servidor de desenvolvimento do frontend
# A aplicação estará acessível em http://localhost:5173
pnpm run dev
```

### Usuários de Teste

Você pode usar os seguintes usuários para testar a aplicação:

| Usuário      | Senha      | Papel         |
|--------------|------------|---------------|
| `admin`      | `admin123` | Administrador |
| `supervisor` | `super123` | Supervisor    |
| `operador1`  | `oper123`  | Operador      |
| `operador2`  | `oper123`  | Operador      |

## Próximos Passos

- Implementar as páginas restantes de "Avaliações" e "Relatórios".
- Adicionar testes unitários e de integração.
- Implementar a funcionalidade de upload de gravações de chamadas.
- Refinar a interface do usuário e a experiência do usuário (UI/UX).
- Preparar a aplicação para deploy em um ambiente de produção.
'''
