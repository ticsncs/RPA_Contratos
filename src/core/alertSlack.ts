import { WebClient } from '@slack/web-api';

const clientSlack = new WebClient(process.env.SLACK_TOKEN || '');

export const sendSlackMessage = async (message: string): Promise<void> => {
    try {
        await clientSlack.chat.postMessage({
            channel: process.env.SLACK_CHANNEL_ID || '',
            text: message
        });
        console.log(message);
    } catch (error) {
        console.error('Error enviando notificación a Slack:', error);
    }
};
