/**
 * @file test-timezone.ts
 * @description Archivo de prueba para verificar que los timestamps ahora se muestran en timezone de América/Guayaquil
 */

import { Logger } from '../utils/logger';
import { TimezoneUtils } from '../utils/timezone-utils';
import { DateUtils } from '../utils/date-utils';

// Crear instancia del logger
const logger = new Logger('TIMEZONE-TEST');

// Función para probar los timestamps
async function testTimezone() {
    logger.info('=== PRUEBA DE TIMEZONE ===');
    
    // Mostrar información de timezone
    const tzInfo = TimezoneUtils.getTimezoneInfo();
    logger.info(`Timezone configurado: ${tzInfo.name}`);
    logger.info(`Offset: ${tzInfo.offset}`);
    logger.info(`Abreviación: ${tzInfo.abbreviation}`);
    
    // Probar diferentes formatos de fecha
    logger.info(`Timestamp para logs: ${TimezoneUtils.getTimestamp()}`);
    logger.info(`Fecha actual (YYYY-MM-DD): ${TimezoneUtils.getDateString()}`);
    logger.info(`Fecha para títulos (DD/MM/YYYY): ${TimezoneUtils.getDateForTitle()}`);
    logger.info(`ISO timestamp: ${TimezoneUtils.getISOTimestamp()}`);
    
    // Probar DateUtils
    const dateUtils = new DateUtils();
    logger.info(`Fecha actual (DateUtils): ${dateUtils.getCurrentDate()}`);
    logger.info(`Fecha modificada -1 día: ${dateUtils.getModifiedDate(1, 'days')}`);
    logger.info(`Fecha modificada -1 mes: ${dateUtils.getModifiedDate(1, 'months')}`);
    
    // Mostrar diferencia entre UTC y hora local
    const utcNow = new Date().toISOString();
    const localNow = TimezoneUtils.formatUtcToLocal(utcNow);
    logger.info(`UTC: ${utcNow}`);
    logger.info(`Local (América/Guayaquil): ${localNow}`);
    
    logger.success('Prueba de timezone completada');
}

// Ejecutar prueba
testTimezone().catch(error => {
    logger.error('Error en prueba de timezone', error);
});

export { testTimezone };