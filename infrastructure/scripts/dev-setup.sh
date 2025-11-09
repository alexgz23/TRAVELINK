#!/bin/bash

# Script para configuración inicial de desarrollo
# Usage: ./infrastructure/scripts/dev-setup.sh

set -e

echo "🚀 Configurando entorno de desarrollo de Viajero Conectado..."
echo ""

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker no está corriendo"
  echo "Por favor inicia Docker Desktop e intenta de nuevo"
  exit 1
fi

echo "✅ Docker está corriendo"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
  echo "⚠️  pnpm no está instalado"
  echo "Instalando pnpm..."
  npm install -g pnpm@8.10.0
fi

echo "✅ pnpm instalado"

# Copiar archivos .env si no existen
if [ ! -f apps/backend/.env ]; then
  echo "📝 Copiando .env.example -> .env para backend..."
  cp apps/backend/.env.example apps/backend/.env
fi

if [ ! -f apps/web/.env.local ]; then
  echo "📝 Copiando .env.example -> .env.local para web..."
  cp apps/web/.env.example apps/web/.env.local
fi

if [ ! -f apps/mobile/.env ]; then
  echo "📝 Copiando .env.example -> .env para mobile..."
  cp apps/mobile/.env.example apps/mobile/.env
fi

echo "✅ Archivos de configuración creados"

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
pnpm install

echo "✅ Dependencias instaladas"

# Levantar servicios de Docker
echo ""
echo "🐳 Levantando servicios de Docker..."
docker-compose up -d postgres mongodb redis typesense minio mailhog

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar salud de servicios
echo ""
echo "🔍 Verificando servicios..."
docker-compose ps

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Servicios disponibles:"
echo "  - PostgreSQL:  localhost:5432"
echo "  - MongoDB:     localhost:27017"
echo "  - Redis:       localhost:6379"
echo "  - Typesense:   localhost:8108"
echo "  - MinIO API:   localhost:9000"
echo "  - MinIO UI:    http://localhost:9001 (minioadmin/minioadmin123)"
echo "  - Mailhog UI:  http://localhost:8025"
echo ""
echo "🎯 Próximos pasos:"
echo "  1. Ejecuta las migraciones de DB: cd apps/backend && pnpm run migration:run"
echo "  2. Inicia el backend: cd apps/backend && pnpm dev"
echo "  3. Inicia el frontend: cd apps/web && pnpm dev"
echo "  4. Visita http://localhost:3000"
echo ""
