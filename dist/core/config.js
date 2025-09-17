"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.config = {
    baseUrl: process.env.BASE_URL || 'https://default-url.com',
    downloadPath: path_1.default.resolve(__dirname, '..', process.env.DOWNLOAD_PATH || './downloads'),
    sessionsPath: path_1.default.resolve(__dirname, '..', process.env.SESSION_PATH || './sessions'),
    slackToken: process.env.SLACK_TOKEN || '',
    slackChannelId: process.env.SLACK_CHANNEL_ID || '',
    user: process.env.USER || '',
    pass: process.env.PASS || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || 587,
    smtpSecure: process.env.SMTP_SECURE || false,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpRejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED || false,
    apiMongoUrl: process.env.API_MONGO_URL || 'http://190.96.96.20:3050/api/',
};
