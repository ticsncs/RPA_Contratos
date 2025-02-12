# RPA para Exportación de Contratos en Odoo

Este proyecto implementa dos bots RPA utilizando Playwright para automatizar la exportación de contratos desde Odoo.

## 📌 Funcionalidades
- Inicio de sesión automático con almacenamiento de sesión.
- Selección y aplicación de filtros en la vista de contratos.
- Exportación de datos en formato CSV.
- Manejo de errores y reintentos en caso de fallos.
- Notificaciones a Slack sobre el estado de la ejecución.

## 📂 Estructura del Proyecto
```
📦 rpa_contratos
 ┣ 📂 src
 ┃ ┣ 📜 config.js         # Configuración del RPA (URL, credenciales, rutas)
 ┃ ┣ 📜 alertSlack.js     # Módulo para enviar notificaciones a Slack
 ┣ 📜 rpa_contratos_full.js   # Script para la exportación de todos los contratos
 ┣ 📜 rpa_cortados.js         # Script para la exportación de contratos cortados
 ┣ 📜 package.json       # Configuración de dependencias y scripts npm
 ┗ 📜 README.md         # Documentación del proyecto
```

## ⚙️ Instalación
1. Clonar el repositorio:
   ```sh
   git clone https://github.com/usuario/rpa_contratos.git
   cd rpa_contratos
   ```
2. Instalar dependencias:
   ```sh
   npm install
   ```

## 🚀 Ejecución
Ejecutar los siguientes comandos según el tipo de exportación:

- **Exportar todos los contratos:**
  ```sh
  npm run contratos
  ```

- **Exportar contratos cortados:**
  ```sh
  npm run cortados
  ```

## 🔧 Configuración
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
BASE_URL=https://erp.nettplus.net/web
USER=usuario@nettplus.net
PASSWORD=tu_contraseña
DOWNLOAD_PATH=./Files
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...  # URL para notificaciones en Slack
```

## 📢 Notificaciones a Slack
El bot envía notificaciones automáticas a un canal de Slack configurado en el archivo `.env`. Se informa sobre:
- Inicio y finalización del proceso.
- Estado de la descarga del archivo CSV.
- Errores durante la ejecución.

## ❗ Posibles Errores y Soluciones
- **Problema:** No encuentra la sesión guardada después de la primera ejecución.
  - **Solución:** Verificar que la carpeta `Session/` existe y tiene permisos de escritura.
- **Problema:** Error al descargar el archivo CSV.
  - **Solución:** Revisar si los filtros aplicados devuelven resultados en Odoo.
- **Problema:** Error de credenciales.
  - **Solución:** Asegurar que `USER` y `PASSWORD` en `.env` son correctos.

## 🛠 Tecnologías Utilizadas
- **Node.js**
- **Playwright**
- **Dotenv** (para variables de entorno)
- **Slack API** (para notificaciones)

## 📜 Licencia
Este proyecto es de uso interno y no está disponible para distribución pública.

