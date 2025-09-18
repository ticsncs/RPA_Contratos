/**
 * @file date-utils.ts
 * @description Utilidades para el manejo de fechas
 */

import { TimezoneUtils } from './timezone-utils';

/**
 * Clase con utilidades para manipulación de fechas
 */
export class DateUtils {
    /**
     * Obtiene una fecha en formato "YYYY-MM-DD" restando días o meses en timezone local
     * @param quantity Cantidad de días o meses a restar
     * @param unit Unidad de tiempo ('days' o 'months')
     * @returns String con formato YYYY-MM-DD
     */
    public getModifiedDate(quantity: number, unit: "days" | "months"): string {
      const date = TimezoneUtils.now();
      if (unit === "days") {
        date.subtract(quantity, 'days');
      } else {
        date.subtract(quantity, 'months');
      }
      return date.format('YYYY-MM-DD');
    }
  
    /**
     * Obtiene la fecha actual en formato "YYYY-MM-DD" en timezone local
     * @returns String con la fecha actual en formato YYYY-MM-DD
     */
    public getCurrentDate(): string {
      return TimezoneUtils.getDateString();
    }
  
    /**
     * Formatea la fecha actual para el título del ticket en timezone local
     * @returns String con la fecha formateada (DD/MM/YYYY)
     */
    public formatDateForTitle(): string {
      return TimezoneUtils.getDateForTitle();
    }
  }