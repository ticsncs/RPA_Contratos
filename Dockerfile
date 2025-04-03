# Stage 1: Build Stage
FROM mcr.microsoft.com/playwright/python:v1.36.0-slim AS builder

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración
COPY package.json package-lock.json tsconfig.json ./

# Instala las dependencias del proyecto
RUN npm ci && npx playwright install --with-deps

# Instala las dependencias de Playwright y limpia la caché de npm
RUN npm ci && npx playwright install --with-deps && npm cache clean --force

# Copia todo el código fuente
COPY src/ ./src/

# Stage 2: Runtime Stage
FROM node:18-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios del stage anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./

# Instala ts-node globalmente
RUN npm install -g ts-node

# Crea directorios para los archivos generados
RUN mkdir -p /app/src/Files /app/src/Session

# Define volúmenes para los directorios donde se almacenarán los archivos
VOLUME ./Files_rpa:/app/src/Files
VOLUME ./Session_rpa:/app/src/Session

# Comando de inicio (modifícalo según el bot que quieres ejecutar)
CMD ["ts-node", "src/rpa_contratos_full.ts"]
