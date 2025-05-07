import { Browser, Page } from 'playwright';
import { login } from '../core/login';
import { Logger } from '../utils/logger';
const DEFAULT_TIMEOUT = 10000;

// Logger instance
const logger = new Logger('contract-export');

export async function initialize( page:Page, browser:Browser,active:boolean): Promise<{page:Page,browser:Browser}> {
    logger.info('Initializing automation session');
    try {
        const session = await login(active);
        browser = session.browser;
        page = session.page;
        logger.success('Session initialized successfully');
        return { page, browser };
    } catch (error) {
        logger.error('Failed to initialize session', error);
        throw new Error('Login failed');
    }
}