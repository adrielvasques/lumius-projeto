#!/bin/bash

# Script de compilação para o projeto quadrature_encoder

# Definir caminho do Pico SDK
export PICO_SDK_PATH=/home/lumius/pico/pico-sdk

echo "=== Compilando projeto quadrature_encoder ==="
echo "Usando PICO_SDK_PATH: $PICO_SDK_PATH"

# Criar diretório build se não existir
if [ ! -d "build" ]; then
    echo "Criando diretório build..."
    mkdir build
fi

# Entrar no diretório build
cd build

# Executar cmake se necessário
if [ ! -f "Makefile" ]; then
    echo "Configurando projeto com CMake..."
    cmake ..
    if [ $? -ne 0 ]; then
        echo "Erro na configuração do CMake!"
        exit 1
    fi
fi

# Compilar o projeto
echo "Compilando..."
make -j4

if [ $? -eq 0 ]; then
    echo "=== Compilação concluída com sucesso! ==="
    echo "Arquivos gerados:"
    ls -la pio_quadrature_encoder.*
else
    echo "=== Erro na compilação! ==="
    exit 1
fi