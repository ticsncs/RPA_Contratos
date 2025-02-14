import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    baseUrl: process.env.BASE_URL || 'https://default-url.com',
    downloadPath: path.resolve(__dirname, '..', process.env.DOWNLOAD_PATH || './downloads'),
    sessionsPath: path.resolve(__dirname, '..', process.env.SESSION_PATH || './sessions'),
    slackToken: process.env.SLACK_TOKEN || '',
    slackChannelId: process.env.SLACK_CHANNEL_ID || '',
    user: process.env.USER || '',
    pass: process.env.PASS || ''
};


