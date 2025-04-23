

  import { Browser } from 'playwright';
import { Logger } from './logger';  // Logger instance
  const logger = new Logger('contract-export');


 export async function cleanup(browser:Browser): Promise<void> {
    logger.info('Cleaning up resources');
    if (browser) {
      await browser.close();
      logger.success('Browser closed');
    }
  }