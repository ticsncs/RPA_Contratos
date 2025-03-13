export const obtenerFechaModificada = (cantidad: number, unidad: "days" | "months"): string => {
    const fecha = new Date();
    unidad === "days" ? fecha.setDate(fecha.getDate() - cantidad) : fecha.setMonth(fecha.getMonth() - cantidad);
    return fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};
