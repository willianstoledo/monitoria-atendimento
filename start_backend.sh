#!/bin/bash

cd /home/ubuntu/monitoria-atendimento/backend

# Ativar ambiente virtual
source venv/bin/activate

# Exportar variáveis
export FLASK_APP=run.py
export FLASK_ENV=development

# Iniciar servidor
echo "Iniciando servidor Flask na porta 5000..."
python run.py
