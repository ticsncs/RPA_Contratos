"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarCorreo = enviarCorreo;
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
// Configurar el transporte SMTP con credenciales de tu empresa
const transporter = nodemailer_1.default.createTransport({
    host: 'mail.nettplus.net', // Cambia esto por el host SMTP de tu empresa
    port: 587, // Usa 465 para SSL o 587 para TLS
    secure: false, // false para TLS, true para SSL
    auth: {
        user: 'ticsncs@nettplus.net',
        pass: 'Adm1n1234' // O usa una clave generada si tu empresa lo requiere
    },
    tls: {
        rejectUnauthorized: false // Permite certificados autofirmados si es necesario
    }
});
// Función para enviar el correo
async function enviarCorreo(destinatario, ccusers, ccousers, archivoAdjunto, mensaje = '', asunto = '') {
    const nombreArchivo = path_1.default.basename(archivoAdjunto);
    let mailOptions = {
        from: '"SOPORTE TICS" <ticsncs@nettplus.net>',
        to: destinatario,
        subject: asunto,
        cc: ccusers, // Añadir otro correo en CC
        bcc: ccousers, // Añadir otro correo en CCO
        html: `
        <p>Saludos cordiales,</p>
        <p>${mensaje}</p>
        <img src="cid:firmaLogo" width="350" height="150"/>
        `,
        attachments: [
            {
                filename: nombreArchivo,
                path: path_1.default.resolve(archivoAdjunto),
                contentType: 'application/pdf'
            },
            {
                filename: 'logo.png', // Nombre del archivo adjunto
                path: path_1.default.resolve('./src/resources/firma.png'), // Ruta del archivo adjunto
                cid: 'firmaLogo' // Este ID se usa en el HTML para mostrar la imagen
            }
        ]
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('✅ Correo enviado:', info.response);
        return true;
    }
    catch (error) {
        console.error('❌ Error al enviar el correo:', error);
        return false;
    }
}
/*
// Enviar el PDF por correo
enviarCorreo(
    'bherrera@nettplus.net', // Destinatario
    ['byron.herrera@unl.edu.ec'], // Correos con copia cc
    ['byron.herrera@unl.edu.ec'], // Correos con copia oculta cco
    './src/Files/ticketsCobranzas.pdf', // Archivo adjunto
    'Adjunto el reporte de tickets', // Mensaje
    'Reporte de tickets' // Asunto
);
*/
