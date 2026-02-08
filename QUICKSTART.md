# Guia Rápido - Sistema de Monitoria de Atendimento

## 🚀 Início Rápido em 3 Passos

### 1️⃣ Iniciar o Backend

```bash
cd /home/ubuntu/monitoria-atendimento/backend
source venv/bin/activate
python run.py
```

O servidor estará disponível em: **http://localhost:5000**

### 2️⃣ Iniciar o Frontend

```bash
cd /home/ubuntu/monitoria-atendimento/frontend
pnpm run dev
```

A aplicação estará disponível em: **http://localhost:5173**

### 3️⃣ Fazer Login

Acesse a aplicação no navegador e use uma das credenciais:

- **Admin**: `admin` / `admin123`
- **Supervisor**: `supervisor` / `super123`
- **Operador**: `operador1` / `oper123`

---

## 📋 Comandos Úteis

### Backend

```bash
# Criar banco de dados
flask init-db

# Popular com dados de teste
flask seed-db

# Acessar shell interativo
flask shell
```

### Frontend

```bash
# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm run dev

# Build para produção
pnpm run build
```

### Banco de Dados

```bash
# Iniciar PostgreSQL
sudo service postgresql start

# Parar PostgreSQL
sudo service postgresql stop

# Acessar console do PostgreSQL
sudo -u postgres psql monitoria_atendimento
```

---

## 🔗 URLs Importantes

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

---

## 📚 Estrutura de Pastas

```
monitoria-atendimento/
├── backend/          # API Flask
├── frontend/         # Interface React
├── database/         # Scripts de banco
└── docs/            # Documentação
```

---

## ⚡ Resolução de Problemas

### Porta já em uso

```bash
# Verificar processo na porta 5000
lsof -i :5000

# Matar processo
kill -9 <PID>
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Reiniciar PostgreSQL
sudo service postgresql restart
```

### Erro de dependências

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
pnpm install
```

---

## 🎯 Próximos Passos

1. Explore o Dashboard
2. Crie uma nova chamada
3. Avalie uma chamada (como supervisor)
4. Visualize os relatórios

**Divirta-se explorando o sistema! 🎉**
