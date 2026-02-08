# 🚀 Guia de Deploy - Sistema de Monitoria de Atendimento

Este guia explica como fazer o deploy do sistema em plataformas gratuitas e permanentes.

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Render](https://render.com) (para backend e banco de dados)
- Conta no [Vercel](https://vercel.com) (para frontend)

## 🗄️ Passo 1: Criar Repositório no GitHub

1. Crie um novo repositório no GitHub (público ou privado)
2. Clone o repositório localmente ou use o GitHub CLI:

```bash
cd /home/ubuntu/monitoria-atendimento
git init
git add .
git commit -m "Initial commit - Sistema de Monitoria"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/monitoria-atendimento.git
git push -u origin main
```

## 🐘 Passo 2: Deploy do Banco de Dados (Render)

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `monitoria-db`
   - **Database**: `monitoria_db`
   - **User**: `monitoria_user`
   - **Region**: Escolha a mais próxima
   - **Plan**: Free
4. Clique em "Create Database"
5. **Copie a "Internal Database URL"** (usaremos no próximo passo)

## 🔧 Passo 3: Deploy do Backend (Render)

1. No Render Dashboard, clique em "New +" → "Web Service"
2. Conecte seu repositório do GitHub
3. Configure:
   - **Name**: `monitoria-backend`
   - **Region**: Mesma do banco de dados
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT run:app`
   - **Plan**: Free

4. Adicione as variáveis de ambiente:
   - `FLASK_ENV` = `production`
   - `SECRET_KEY` = (gere uma chave aleatória)
   - `JWT_SECRET_KEY` = (gere outra chave aleatória)
   - `DATABASE_URL` = (cole a Internal Database URL do Passo 2)

5. Clique em "Create Web Service"

6. **Aguarde o deploy completar** (pode levar 5-10 minutos)

7. **Inicialize o banco de dados**:
   - No Render Dashboard, vá para seu serviço backend
   - Clique em "Shell" no menu lateral
   - Execute:
   ```bash
   python init_db.py
   ```

8. **Copie a URL do backend** (ex: `https://monitoria-backend.onrender.com`)

## 🎨 Passo 4: Deploy do Frontend (Vercel)

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em "Add New..." → "Project"
3. Importe seu repositório do GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`

5. Adicione a variável de ambiente:
   - `VITE_API_URL` = (cole a URL do backend do Passo 3)

6. Clique em "Deploy"

7. **Aguarde o deploy completar** (2-3 minutos)

8. **Copie a URL do frontend** (ex: `https://monitoria-atendimento.vercel.app`)

## ✅ Passo 5: Configurar CORS no Backend

1. Volte ao Render Dashboard → Backend Service
2. Vá em "Environment"
3. Adicione uma nova variável:
   - `FRONTEND_URL` = (cole a URL do frontend do Passo 4)

4. Clique em "Save Changes" (o serviço será reiniciado automaticamente)

## 🧪 Passo 6: Testar o Sistema

1. Acesse a URL do frontend
2. Faça login com:
   - **Usuário**: `admin`
   - **Senha**: `admin123`

3. Teste as funcionalidades principais

## 🔄 Atualizações Futuras

Para atualizar o sistema:

```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

O Render e o Vercel farão o deploy automático das mudanças!

## 📝 Notas Importantes

- **Plano Free do Render**: O backend pode "dormir" após 15 minutos de inatividade. O primeiro acesso após isso pode demorar 30-60 segundos.
- **Banco de Dados Free**: Limitado a 1GB de armazenamento.
- **Vercel Free**: Sem limitações significativas para este projeto.

## 🆘 Solução de Problemas

### Backend não inicia
- Verifique os logs no Render Dashboard
- Confirme que todas as variáveis de ambiente estão configuradas

### Frontend não conecta ao backend
- Verifique se `VITE_API_URL` está configurado corretamente
- Confirme que `FRONTEND_URL` está configurado no backend

### Banco de dados vazio
- Execute `python init_db.py` no Shell do Render

---

**Pronto! Seu sistema está no ar 24/7! 🎉**
