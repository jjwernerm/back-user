import nodemailer from 'nodemailer';
// Importa Nodemailer para enviar correos electrónicos.

import dotenv from 'dotenv';
// Importa dotenv para cargar variables de entorno desde el archivo `.env`.

dotenv.config();
// Carga las variables de entorno definidas en el archivo `.env`.

const transporter = nodemailer.createTransport({
  // Configura un transporte SMTP para enviar correos electrónicos.

  host: "smtp.gmail.com", // Servidor SMTP de Gmail.
  port: 465,              // Puerto seguro para conexiones SMTP.
  secure: true,           // Habilita SSL/TLS para la conexión.
  auth: {
    user: process.env.EMAIL_USER, // Usuario de Gmail (desde las variables de entorno).
    pass: process.env.EMAIL_PASS, // Contraseña de aplicación o token (desde las variables de entorno).
  },
});
// `transporter` es la instancia configurada para enviar correos.

const emailRecoverPassword = async (name, userEmail, token) => {
  // Define una función para enviar un correo de recuperación de contraseña.

  if (!userEmail) {
    // Si no se proporciona un destinatario, lanza un error.
    throw new Error("No se ha definido un destinatario");
  };

  try {
    const subject = 'Recuperar tu Contraseña';
    // Define el asunto del correo.

    const message = `${name}, el equipo de soporte te ha enviado el siguiente enlace para que recuperes tu contraseña: 
    <a href="${process.env.FRONTEND_URL}/recover-password/${token}">Recuperar Contraseña</a>`;
    // Define el mensaje en HTML para incluir un enlace de recuperación.

    await transporter.sendMail({
      from: '"Soporte: Recuperar la Contraseña" <joannywerner@gmail.com>', // Remitente del correo.
      to: userEmail,                                                     // Destinatario del correo.
      subject: subject,                                                  // Asunto del correo.
      text: `${name}, el equipo de soporte te ha enviado el siguiente enlace para que recuperes tu contraseña: ${process.env.FRONTEND_URL}/recover-password/${token}`, 
      // Texto plano como respaldo.
      html: `<p>${message}</p>`,                                         // Versión en HTML del mensaje.
    });
    // Envía el correo utilizando el transporte configurado.

  } catch (error) {
    // Si ocurre un error, lanza una excepción personalizada con detalles del problema.
    throw new Error(`Error sendEmailRecoverPassword: ${error.message}`);
  };
};

export default emailRecoverPassword;
// Exporta la función para que pueda ser utilizada en otros archivos.


// Propósito:
// Este archivo define la función emailRecoverPassword para enviar un correo electrónico a los usuarios que han solicitado recuperar su contraseña.

// Configuración del transporte SMTP:
// Usa Nodemailer para conectarse al servidor SMTP de Gmail con credenciales almacenadas en las variables de entorno (EMAIL_USER y EMAIL_PASS).

// Generación del mensaje:
// Crea un correo con un asunto claro y un enlace para que el usuario recupere su contraseña.

// Envío del correo:
// Utiliza el transporte configurado para enviar el correo al destinatario especificado.

// Importancia:
// Automatiza el proceso de recuperación de contraseñas, mejorando la experiencia del usuario y asegurando que solo el propietario del correo pueda recuperar el acceso.