"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGeneratedTickets = loadGeneratedTickets;
exports.saveGeneratedTickets = saveGeneratedTickets;
exports.hasTicketAlreadyGenerated = hasTicketAlreadyGenerated;
const fs_1 = __importDefault(require("fs"));
const TICKETS_FILE = 'tickets_generados.json';
/**
 * Cargar los tickets ya generados desde un archivo JSON.
 */
function loadGeneratedTickets() {
    if (!fs_1.default.existsSync(TICKETS_FILE)) {
        fs_1.default.writeFileSync(TICKETS_FILE, JSON.stringify([])); // Crear archivo si no existe
    }
    const rawData = fs_1.default.readFileSync(TICKETS_FILE, 'utf8');
    const tickets = JSON.parse(rawData);
    return new Set(tickets); // Usamos un Set para búsqueda rápida
}
/**
 * Guardar nuevos tickets generados en el archivo JSON.
 */
function saveGeneratedTickets(generatedTickets) {
    fs_1.default.writeFileSync(TICKETS_FILE, JSON.stringify(Array.from(generatedTickets), null, 2));
}
/**
 * Verificar si un cliente ya tiene un ticket generado.
 */
function hasTicketAlreadyGenerated(clientId, generatedTickets) {
    return generatedTickets.has(clientId);
}
