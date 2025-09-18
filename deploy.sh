#!/bin/bash

# Script de despliegue manual para RPA_Contratos
# Este script puede ser ejecutado directamente en el servidor si es necesario

set -e  # Salir en caso de error

echo "🚀 Iniciando despliegue de RPA_Contratos..."

# Configuración
IMAGE_NAME="alexhm95/rpa_odoo:latest"
CONTAINER_NAME="rpa_odoo"

# Descargar imagen más reciente
echo "📥 Descargando imagen Docker actualizada..."
docker pull $IMAGE_NAME

# Detener y eliminar contenedor existente si existe
echo "🔍 Verificando contenedor existente..."
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "⏹️  Deteniendo contenedor existente..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    
    echo "🗑️  Eliminando contenedor existente..."
    docker rm $CONTAINER_NAME 2>/dev/null || true
fi

# Limpiar imágenes no utilizadas
echo "🧹 Limpiando imágenes Docker no utilizadas..."
docker image prune -f

# Crear y ejecutar nuevo contenedor
echo "🏗️  Creando nuevo contenedor..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -e NODE_ENV=production \
  -e TZ=America/Guayaquil \
  -v rpa_files:/app/src/Files \
  -v rpa_sessions:/app/src/Session \
  $IMAGE_NAME

# Verificar que el contenedor esté corriendo
echo "✅ Verificando estado del contenedor..."
sleep 5
docker ps --filter "name=$CONTAINER_NAME"

# Mostrar logs iniciales
echo "📋 Mostrando logs iniciales..."
docker logs --tail 50 $CONTAINER_NAME

echo ""
echo "🎉 ¡Despliegue completado exitosamente!"
echo ""
echo "📌 Comandos útiles:"
echo "   Ver logs:           docker logs -f $CONTAINER_NAME"
echo "   Reiniciar:          docker restart $CONTAINER_NAME"
echo "   Detener:            docker stop $CONTAINER_NAME"
echo "   Estado:             docker ps --filter name=$CONTAINER_NAME"
echo ""