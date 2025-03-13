import nodemailer from 'nodemailer';
import path from 'path';

// Configurar el transporte SMTP con credenciales de tu empresa
const transporter = nodemailer.createTransport({
    host: 'mail.nettplus.net', // Cambia esto por el host SMTP de tu empresa
    port: 587,  // Usa 465 para SSL o 587 para TLS
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
export async function enviarCorreo(destinatario: string, archivoAdjunto: string, mensaje: string = '', asunto:string = '') {
    const nombreArchivo = path.basename(archivoAdjunto);
    let mailOptions = {
        from: '"SOPORTE TICS" <ticsncs@nettplus.net>',
        to: destinatario,
        subject: asunto, 
        cc: 'bherrera@nettplus.net',
        html:`
        <p>Saludos cordiales,</p>
        <p>${mensaje}</p>
        <img src="cid:firmaLogo" width="350" height="150"/>
        ` ,
        attachments: [
            {
                filename: nombreArchivo,
                path: path.resolve(archivoAdjunto),
                contentType: 'application/pdf'
            },
            {
                filename: 'logo.png', // Nombre del archivo adjunto
                path: path.resolve('./src/resources/firma.png'), // Ruta del archivo adjunto
                cid: 'firmaLogo' // Este ID se usa en el HTML para mostrar la imagen
            }
        ]
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('✅ Correo enviado:', info.response);
    } catch (error) {
        console.error('❌ Error al enviar el correo:', error);
    }
}


/*
// Enviar el PDF por correo
enviarCorreo('bherrera@nettplus.net', './src/utils/tickets.pdf', 'Adjunto los tickets generados.', 'Tickets Generados');
*/
