/**
 * @file date-utils.ts
 * @description Utilidades para el manejo de fechas
 */

/**
 * Clase con utilidades para manipulación de fechas
 */
export class DateUtils {
    /**
     * Obtiene una fecha en formato "YYYY-MM-DD" restando días o meses
     * @param quantity Cantidad de días o meses a restar
     * @param unit Unidad de tiempo ('days' o 'months')
     * @returns String con formato YYYY-MM-DD
     */
    public getModifiedDate(quantity: number, unit: "days" | "months"): string {
      const date = new Date();
      if (unit === "days") {
        date.setDate(date.getDate() - quantity);
      } else {
        date.setMonth(date.getMonth() - quantity);
      }
      return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }
  
    /**
     * Obtiene la fecha actual en formato "YYYY-MM-DD"
     * @returns String con la fecha actual en formato YYYY-MM-DD
     */
    public getCurrentDate(): string {
      return new Date().toISOString().split('T')[0];
    }
  
    /**
     * Formatea la fecha actual para el título del ticket
     * @returns String con la fecha formateada (DD/MM/YYYY)
     */
    public formatDateForTitle(): string {
      return new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    }
  }