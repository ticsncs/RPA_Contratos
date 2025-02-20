

# Usa la imagen oficial de Playwright con Node.js
FROM mcr.microsoft.com/playwright:focal

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración
COPY package.json package-lock.json tsconfig.json ./ 

# Instala las dependencias del proyecto
RUN npm install && npx playwright install --with-deps

# Instala ts-node globalmente
RUN npm install -g ts-node

# Copia todo el código fuente
COPY src/ ./src/

# Crea directorios para los archivos generados
RUN mkdir -p /app/src/Files /app/src/Session

# Comando de inicio (modifícalo según el bot que quieres ejecutar)
CMD ["ts-node", "src/rpa_contratos_full.ts"]