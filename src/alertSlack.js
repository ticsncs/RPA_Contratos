require('dotenv').config();
const { WebClient } = require('@slack/web-api');

// Inicializar cliente de Slack
const clientSlack = new WebClient(process.env.SLACK_TOKEN);

// Función para enviar notificación a Slack
const alertSlack = async (message) => {
    try {
        // Enviar mensaje a Slack
        await clientSlack.chat.postMessage({
            channel: process.env.SLACK_CHANNEL_ID,
            text: message,
        });
        console.log(message)
    } catch (error) {
        console.error('Error enviando notificación a Slack:', error);
    }
};

module.exports = alertSlack;
