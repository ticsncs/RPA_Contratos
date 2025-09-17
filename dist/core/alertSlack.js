"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSlackMessage = void 0;
const web_api_1 = require("@slack/web-api");
const clientSlack = new web_api_1.WebClient(process.env.SLACK_TOKEN || '');
const token = process.env.SLACK_BOT_TOKEN || 'TU_TOKEN_AQUÍ';
const web = new web_api_1.WebClient(token);
async function testAuth() {
    try {
        const response = await web.auth.test();
        console.log(response);
    }
    catch (error) {
        console.error("Error de autenticación:", error);
    }
}
const sendSlackMessage = async (message) => {
    try {
        /* console.log('Slack Token:', process.env.SLACK_TOKEN);
         console.log('Slack Channel ID:', process.env.SLACK_CHANNEL_ID);
         
         testAuth();
         await clientSlack.chat.postMessage({
             channel: process.env.SLACK_CHANNEL_ID || '',
             text: message
         });
         console.log(message);*/
    }
    catch (error) {
        console.error('Error enviando notificación a Slack:', error);
    }
};
exports.sendSlackMessage = sendSlackMessage;
