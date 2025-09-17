"use strict";
/**
 * @file date-utils.ts
 * @description Utilidades para el manejo de fechas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
/**
 * Clase con utilidades para manipulación de fechas
 */
class DateUtils {
    /**
     * Obtiene una fecha en formato "YYYY-MM-DD" restando días o meses
     * @param quantity Cantidad de días o meses a restar
     * @param unit Unidad de tiempo ('days' o 'months')
     * @returns String con formato YYYY-MM-DD
     */
    getModifiedDate(quantity, unit) {
        const date = new Date();
        if (unit === "days") {
            date.setDate(date.getDate() - quantity);
        }
        else {
            date.setMonth(date.getMonth() - quantity);
        }
        return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }
    /**
     * Obtiene la fecha actual en formato "YYYY-MM-DD"
     * @returns String con la fecha actual en formato YYYY-MM-DD
     */
    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }
    /**
     * Formatea la fecha actual para el título del ticket
     * @returns String con la fecha formateada (DD/MM/YYYY)
     */
    formatDateForTitle() {
        return new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}
exports.DateUtils = DateUtils;
