import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para enviar correo
const emailRecoverPassword = async (name, userEmail, token) => {

  if (!userEmail) {
    throw new Error("No se ha definido un destinatario");
  };

  try {

    // Definir el asunto y mensaje del correo
    const subject = 'Recuperar tu Contraseña';
    const message = `${name}, el equipo de soporte te ha enviado el siguiente enlace para que recuperes tu contraseña: 
    <a href="${process.env.BACKEND_URL}/recover-password/${token}">Recuperar Contraseña</a>`;

    // Función para el envío del correo
    await transporter.sendMail({

      from: '"Soporte: Recuperar la Contraseña" <joannywerner@gmail.com>', // Remitente
      to: userEmail, // Dirección de correo del usuario
      subject: subject, // Asunto del correo
      text: `${name}, el equipo de soporte te ha enviado el siguiente enlace para que recuperes tu contraseña: ${process.env.BACKEND_URL}/recover-password/${token}`, // Texto plano como respaldo
      html: `<p>${message}</p>`, // HTML del cuerpo del correo

    });


  } catch (error) {

    throw new Error(`Error sendEmailRecoverPassword: ${error.message}`);

  };

};

export default emailRecoverPassword;