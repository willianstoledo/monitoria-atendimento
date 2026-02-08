#!/bin/bash

# Script de inicialização do banco de dados PostgreSQL

echo "Criando banco de dados monitoria_atendimento..."

# Criar banco de dados como usuário postgres
sudo -u postgres psql -c "CREATE DATABASE monitoria_atendimento;"

# Criar usuário se necessário (opcional)
# sudo -u postgres psql -c "CREATE USER monitoria_user WITH PASSWORD 'monitoria_pass';"
# sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE monitoria_atendimento TO monitoria_user;"

echo "Banco de dados criado com sucesso!"
echo ""
echo "Configuração:"
echo "  Database: monitoria_atendimento"
echo "  User: postgres"
echo "  Host: localhost"
echo "  Port: 5432"
