"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerFechaModificada = void 0;
const obtenerFechaModificada = (cantidad, unidad) => {
    const fecha = new Date();
    unidad === "days" ? fecha.setDate(fecha.getDate() - cantidad) : fecha.setMonth(fecha.getMonth() - cantidad);
    return fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};
exports.obtenerFechaModificada = obtenerFechaModificada;
