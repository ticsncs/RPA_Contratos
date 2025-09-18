#!/bin/bash

# Configuración
IMAGE_NAME="alexhm95/rpa_odoo"
CONTAINER_NAME="rpa_odoo"
PORT="80"

echo "Iniciando despliegue de $CONTAINER_NAME..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "Esperando 10 segundos para que Docker se inicie..."
    sleep 10
fi

# Obtener la imagen más reciente
echo "Obteniendo la imagen más reciente..."
docker pull $IMAGE_NAME:latest

# Detener y eliminar contenedor existente si existe
if docker ps -a --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "$CONTAINER_NAME"; then
    echo "Deteniendo y eliminando contenedor existente..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# Ejecutar nuevo contenedor
echo "Creando nuevo contenedor..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:80 \
  $IMAGE_NAME:latest

# Limpieza de recursos no utilizados
echo "Limpiando recursos Docker no utilizados..."
docker image prune -a -f --filter "until=24h"

echo "Despliegue completado exitosamente!"
echo "Contenedor $CONTAINER_NAME está en ejecución en el puerto $PORT"