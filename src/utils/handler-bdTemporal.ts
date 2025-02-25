import fs from 'fs';
const TICKETS_FILE = 'tickets_generados.json';

/**
 * Cargar los tickets ya generados desde un archivo JSON.
 */
export function loadGeneratedTickets(): Set<string> {
    if (!fs.existsSync(TICKETS_FILE)) {
        fs.writeFileSync(TICKETS_FILE, JSON.stringify([])); // Crear archivo si no existe
    }

    const rawData = fs.readFileSync(TICKETS_FILE, 'utf8');
    const tickets: string[] = JSON.parse(rawData);
    return new Set(tickets); // Usamos un Set para búsqueda rápida
}

/**
 * Guardar nuevos tickets generados en el archivo JSON.
 */
export function saveGeneratedTickets(generatedTickets: string): void {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(Array.from(generatedTickets), null, 2));
}

/**
 * Verificar si un cliente ya tiene un ticket generado.
 */
export function hasTicketAlreadyGenerated(clientId: string, generatedTickets: Set<string>): boolean {
    return generatedTickets.has(clientId);
}
