/**
 * @file timezone-utils.ts
 * @description Utilidades centralizadas para el manejo de zonas horarias y timestamps
 */

import moment from 'moment-timezone';
import { config } from '../core/config';

/**
 * Clase con utilidades centralizadas para manejo de timezone
 */
export class TimezoneUtils {
    /**
     * Obtiene el momento actual en la timezone configurada
     * @returns Moment object en timezone local
     */
    public static now(): moment.Moment {
        return moment().tz(config.timezone);
    }

    /**
     * Obtiene timestamp actual formateado para logs
     * @returns String con formato YYYY-MM-DD HH:mm:ss en timezone local
     */
    public static getTimestamp(): string {
        return this.now().format('YYYY-MM-DD HH:mm:ss');
    }

    /**
     * Obtiene fecha actual en formato ISO para logs extendidos
     * @returns String con formato ISO completo en timezone local
     */
    public static getISOTimestamp(): string {
        return this.now().format();
    }

    /**
     * Obtiene fecha actual en formato YYYY-MM-DD
     * @returns String con formato YYYY-MM-DD en timezone local
     */
    public static getDateString(): string {
        return this.now().format('YYYY-MM-DD');
    }

    /**
     * Obtiene fecha para títulos en formato DD/MM/YYYY
     * @returns String con formato DD/MM/YYYY en timezone local
     */
    public static getDateForTitle(): string {
        return this.now().format('DD/MM/YYYY');
    }

    /**
     * Convierte una fecha/hora UTC a timezone local
     * @param utcDate Fecha en UTC
     * @returns Moment object en timezone local
     */
    public static utcToLocal(utcDate: string | Date): moment.Moment {
        return moment.utc(utcDate).tz(config.timezone);
    }

    /**
     * Formatea una fecha UTC para mostrar en timezone local
     * @param utcDate Fecha en UTC
     * @param format Formato deseado (default: 'YYYY-MM-DD HH:mm:ss')
     * @returns String formateado en timezone local
     */
    public static formatUtcToLocal(utcDate: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
        return this.utcToLocal(utcDate).format(format);
    }

    /**
     * Obtiene información de la timezone configurada
     * @returns Objeto con información de timezone
     */
    public static getTimezoneInfo(): { name: string; offset: string; abbreviation: string } {
        const now = this.now();
        return {
            name: config.timezone,
            offset: now.format('Z'),
            abbreviation: now.format('z')
        };
    }
}

/**
 * Funciones de conveniencia para compatibilidad hacia atrás
 */

/**
 * Obtiene fecha modificada restando tiempo en timezone local
 * @param quantity Cantidad a restar
 * @param unit Unidad de tiempo
 * @returns String con formato YYYY-MM-DD
 */
export const obtenerFechaModificada = (cantidad: number, unidad: "days" | "months"): string => {
    const fecha = TimezoneUtils.now();
    unidad === "days" ? fecha.subtract(cantidad, 'days') : fecha.subtract(cantidad, 'months');
    return fecha.format('YYYY-MM-DD');
};

/**
 * Obtiene timestamp actual para logs
 * @returns String formateado para logs
 */
export const getLogTimestamp = (): string => {
    return TimezoneUtils.getTimestamp();
};

/**
 * Obtiene fecha actual en formato YYYY-MM-DD
 * @returns String con fecha actual
 */
export const getCurrentDateString = (): string => {
    return TimezoneUtils.getDateString();
};