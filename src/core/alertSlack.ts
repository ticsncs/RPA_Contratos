import { WebClient } from '@slack/web-api';

const clientSlack = new WebClient(process.env.SLACK_TOKEN || '');


const token = process.env.SLACK_BOT_TOKEN || 'TU_TOKEN_AQUÍ';
const web = new WebClient(token);

async function testAuth() {
    try {
        const response = await web.auth.test();
        console.log(response);
    } catch (error) {
        console.error("Error de autenticación:", error);
    }
}



export const sendSlackMessage = async (message: string): Promise<void> => {
    try {
       /* console.log('Slack Token:', process.env.SLACK_TOKEN);
        console.log('Slack Channel ID:', process.env.SLACK_CHANNEL_ID);
        
        testAuth();
        await clientSlack.chat.postMessage({
            channel: process.env.SLACK_CHANNEL_ID || '',
            text: message
        });
        console.log(message);*/
    } catch (error) {
        console.error('Error enviando notificación a Slack:', error);
    }
};

