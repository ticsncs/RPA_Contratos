"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSlackMessage = void 0;
const web_api_1 = require("@slack/web-api");
const clientSlack = new web_api_1.WebClient(process.env.SLACK_TOKEN || '');
const sendSlackMessage = async (message) => {
    try {
        await clientSlack.chat.postMessage({
            channel: process.env.SLACK_CHANNEL_ID || '',
            text: message
        });
        console.log(message);
    }
    catch (error) {
        console.error('Error enviando notificación a Slack:', error);
    }
};
exports.sendSlackMessage = sendSlackMessage;
