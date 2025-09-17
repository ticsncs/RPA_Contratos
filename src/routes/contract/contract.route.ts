import { Page } from 'playwright';
import { Logger } from '../../utils/logger';
import { interactWithElement } from '../../utils/handler-elements';
const DEFAULT_TIMEOUT = 10000;

// Logger instance
const logger = new Logger('contract-export');
const CONTRACT_MODULE = 'https://erp.nettplus.net/web#menu_id=385&cids=1&action=576&model=contract.contract&view_type=list';

/**
 * Navigate to contract dashboard
 */
export async function navigateToContractDashboard(page: Page): Promise<Page> {
    
    await page.goto(CONTRACT_MODULE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    logger.info('Navigating to contract dashboard');
    if (!page) throw new Error('Page not initialized');

    try {
        // Intentar buscar el elemento hasta 10 veces con 1 segundo de espera entre intentos
        var tried = 0;
        while (page.url() !== 'https://erp.nettplus.net/web#menu_id=385&cids=1&action=576&model=contract.contract&view_type=list') {
            await page.waitForTimeout(1000);
            tried++;
            if (tried > 30) { // Esperar máximo 30 segundos
                console.log('❌ Error: No se pudo iniciar sesión. Verifica tus credenciales.');
                process.exit(1);
            }
        }
        // Esperar a que aparezca el nombre de usuario en la barra superior
        const ContractsModule = await interactWithElement(
            page,
            'span:has-text("Contratos")',
            'wait',
            { waitTime: 1000 } // Espera máxima de 1 segundo
        );
        console.log('Contracts module appeared:', ContractsModule);
        logger.success('Contract dashboard loaded (skip wait for Contratos)');
        return page;
    } catch (error) {
        logger.error('Failed to load contract dashboard', error);
        throw new Error('Navigation to contract dashboard failed');
    }
}
