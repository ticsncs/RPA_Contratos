# Usa la imagen oficial de Playwright con Node.js
FROM mcr.microsoft.com/playwright:v1.51.1-noble

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia solo los archivos necesarios para instalar dependencias primero
COPY package*.json ./
COPY .env ./
COPY tsconfig.json .

# Instala las dependencias del proyecto y Playwright browsers en un solo paso
RUN npm ci --quiet && \
    npx playwright install chromium --with-deps && \
    npm install -g ts-node && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/cache/apt/* && \
    rm -rf /tmp/*

# Copia el código fuente (se hace después para aprovechar el cache de Docker)
COPY src/ ./src/

# Crea directorios necesarios y establece permisos
RUN mkdir -p /app/src/Files /app/src/Session && \
    chmod -R 777 /app/src/Files /app/src/Session

# Especifica el usuario no-root para seguridad
USER playwright

# Define volúmenes para persistencia de datos
VOLUME ["/app/src/Files", "/app/src/Session"]

# Comando de inicio (usa nodemon para desarrollo o ts-node para producción)
CMD ["ts-node", "src/rpa_contratos_full.ts"]