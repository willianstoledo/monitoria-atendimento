#!/usr/bin/env bash
# exit on error
set -o errexit

python3.11 -m pip install --upgrade pip
python3.11 -m pip install -r requirements.txt

# Database initialization will be done manually or via migration
