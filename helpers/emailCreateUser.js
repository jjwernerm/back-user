import nodemailer from 'nodemailer';
// Importa Nodemailer para enviar correos electrónicos.

import dotenv from 'dotenv';
// Importa dotenv para cargar las variables de entorno desde el archivo `.env`.

dotenv.config();
// Carga las variables de entorno en `process.env`.

const transporter = nodemailer.createTransport({
  // Configura un transporte de correo para enviar emails.

  host: "smtp.gmail.com", // Servidor SMTP de Gmail.
  port: 465,              // Puerto seguro para conexiones SMTP.
  secure: true,           // Usa SSL/TLS para la conexión.
  auth: {
    user: process.env.EMAIL_USER, // Correo electrónico del remitente (desde `.env`).
    pass: process.env.EMAIL_PASS, // Contraseña de aplicación o token (desde `.env`).
  },
});
// El `transporter` es la conexión que usará Nodemailer para enviar correos.

const emailCreateUser = async (name, userEmail, token) => {
  // Define una función para enviar un correo electrónico de activación de cuenta.

  if (!userEmail) {
    // Si no se proporciona un correo electrónico, lanza un error.
    throw new Error("No se ha definido un destinatario");
  };

  try {
    const subject = 'Activar tu Cuenta';
    // Asunto del correo.

    const message = `${name}, te damos la bienvenida a nuestra plataforma. Haz clic en el siguiente enlace para activar tu cuenta: 
    <a href="${process.env.FRONTEND_URL}/confirm-user/${token}">Activar cuenta</a>`;
    // Mensaje HTML para incluir en el cuerpo del correo.

    // Usa el transporte para enviar el correo.
    await transporter.sendMail({
      from: '"Soporte: Registro de Usuario" <joannywerner@gmail.com>', // Remitente.
      to: userEmail,                                                 // Destinatario.
      subject: subject,                                              // Asunto del correo.
      text: `${name}, te damos la bienvenida a nuestra plataforma. Haz clic en el siguiente enlace para activar tu cuenta: ${process.env.FRONTEND_URL}/confirm-user/${token}`, 
      // Versión en texto plano del mensaje.
      html: `<p>${message}</p>`,                                     // Versión en HTML del mensaje.
    });

  } catch (error) {
    // Si ocurre un error al enviar el correo, lanza una excepción personalizada.
    throw new Error(`Error sendEmailCreateUser: ${error.message}`);
  };
};

export default emailCreateUser;
// Exporta la función para que pueda ser usada en otros archivos.


// Propósito:
// Este archivo define la función emailCreateUser para enviar un correo de activación de cuenta a un usuario registrado.

// Configuración del transporte SMTP:
// Usa Nodemailer para conectarse al servidor de Gmail, utilizando credenciales almacenadas en el archivo .env.

// Generación del mensaje:
// Crea un mensaje personalizado con un enlace para que el usuario active su cuenta.

// Envío del correo:
// Utiliza el transporte configurado para enviar el correo al destinatario proporcionado.

// Importancia:
// Este archivo permite automatizar el envío de correos electrónicos de activación, lo que mejora la experiencia del usuario y asegura la autenticación de los registros.