#!/bin/bash

# Script para detener y limpiar el entorno de desarrollo
# Usage: ./infrastructure/scripts/dev-teardown.sh

set -e

echo "🛑 Deteniendo servicios de desarrollo..."

# Detener todos los contenedores
docker-compose down

echo "✅ Servicios detenidos"

# Preguntar si se desea eliminar volúmenes
read -p "¿Deseas eliminar los volúmenes (datos de DB)? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo "🗑️  Eliminando volúmenes..."
  docker-compose down -v
  echo "✅ Volúmenes eliminados"
fi

echo ""
echo "✅ Limpieza completada"
