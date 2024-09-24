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
const emailCreateUser = async (name, userEmail, token) => {

  if (!userEmail) {
    throw new Error("No se ha definido un destinatario");
  };

  try {

    // Definir el asunto y mensaje del correo
    const subject = 'Activar tu Cuenta';
    const message = `${name}, te damos la bienvenida a nuestra plataforma. Haz clic en el siguiente enlace para activar tu cuenta: 
    <a href="${process.env.FRONTEND_URL}/confirm-user/${token}">Activar cuenta</a>`;

    // Función para el envío del correo
    await transporter.sendMail({

      from: '"Soporte: Registro de Usuario" <joannywerner@gmail.com>', // Remitente
      to: userEmail, // Dirección de correo del usuario
      subject: subject, // Asunto del correo
      text: `${name}, te damos la bienvenida a nuestra plataforma. Haz clic en el siguiente enlace para activar tu cuenta: ${process.env.FRONTEND_URL}/confirm-user/${token}`, // Texto plano como respaldo
      html: `<p>${message}</p>`, // HTML del cuerpo del correo

    });


  } catch (error) {

    throw new Error(`Error sendEmailCreateUser: ${error.message}`);

  };

};

export default emailCreateUser;