

/**
 * @file interface-client.ts
 * @description Interfaces para la gestión de clientes y tickets
 */

export interface ClientOffData {
    /**
     * Código identificador del cliente
     */
    Código: string;
    
    /**
     * Código alternativo (para compatibilidad)
     */
    Codigo?: string;
    
    /**
     * Nombre del cliente
     */
    Cliente?: string;
    
    /**
     * Número de cédula o identificación del cliente
     */
    Cedula: string;
    
    /**
     * Fecha en que se realizó el corte del servicio
     */
    FechaCorte?: string;
    
    /**
     * Descripción del periodo de corte (5 días, 20 días, 1 mes)
     */
    descripcion?: string;
    
    /**
     * Campos adicionales que puedan venir en el CSV
     */
    [key: string]: any;
  }
  
  /**
   * Detalles de un ticket individual
   */
  export interface TicketDetails {
    /**
     * Código identificador del ticket
     */
    Código: string;
    
    /**
     * Fecha de inicio del ticket
     */
    FechaInicio: string;
    
    /**
     * Estado actual del ticket
     */
    Estado: string;
  }
  
  /**
   * Resumen de tickets asociados a un cliente
   */
  export interface ClientTicketSummary {
    /**
     * Código identificador del cliente
     */
    Código: string;
    
    /**
     * Descripción del periodo de corte
     */
    Descripcion: string;
    
    /**
     * Cantidad de tickets encontrados
     */
    Cantidad: number;
    
    /**
     * Lista de detalles de cada ticket
     */
    Detalles: TicketDetails[];
  }
  
  /**
   * Configuración para la creación de un nuevo ticket
   */
  export interface TicketCreationConfig {
    /**
     * ID del usuario relacionado al ticket
     */
    user: string;
    
    /**
     * Título del ticket
     */
    title: string;
    
    /**
     * Equipo asignado
     */
    team: string;
    
    /**
     * Usuario responsable del ticket
     */
    assignedUser: string;
    
    /**
     * Canal de comunicación
     */
    channel: string;
    
    /**
     * Categoría del ticket
     */
    category: string;
    
    /**
     * Etiqueta para clasificación
     */
    tag: string;
  }