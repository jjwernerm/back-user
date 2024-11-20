import express from 'express';
// Importa el framework Express para crear y gestionar el servidor web.

import dotenv from 'dotenv';
// Importa dotenv para cargar las variables de entorno desde un archivo .env.

import cors from 'cors';
// Importa cors para manejar las políticas de acceso entre dominios (CORS).

import connectDB from './config/connectDB.js';
// Importa la función personalizada para conectar a la base de datos MongoDB.

import userRoutes from './routes/userRoutes.js';
// Importa las rutas relacionadas con los usuarios.

const app = express();
// Crea una instancia de la aplicación Express.

app.use(express.json());
// Habilita el middleware para procesar solicitudes con datos JSON.

dotenv.config();
// Carga las variables de entorno desde el archivo .env.

connectDB();
// Establece una conexión con la base de datos MongoDB usando la función `connectDB`.

const allowedDomains = [process.env.FRONTEND_URL];
// Define un arreglo con los dominios permitidos para el acceso CORS.

const corsOptions = {
  origin: function (origin, callback) {
    // Define una función para verificar si el dominio de la solicitud está permitido.

    if (!origin || allowedDomains.indexOf(origin) !== -1) {
      callback(null, true);
      // Si el dominio está permitido, permite el acceso CORS.
    } else {
      callback(new Error('Not allowed by CORS'));
      // Si el dominio no está permitido, devuelve un error.
    };
  },
};

app.use(cors(corsOptions));
// Aplica el middleware de CORS con las opciones definidas.

app.use('/user', userRoutes);
// Registra las rutas relacionadas con usuarios bajo el prefijo `/user`.

const PORT = process.env.PORT || 4000;
// Obtiene el puerto desde las variables de entorno o usa el puerto 4000 por defecto.

app.listen(PORT, () => {
  console.log(`Server connected to port ${PORT}`);
});
// Inicia el servidor y muestra un mensaje en la consola indicando el puerto usado.


// Propósito:
//  Este archivo configura y arranca el servidor Express.

// Configuraciones clave:
//  -Carga variables de entorno con dotenv.
//  -Conecta a la base de datos MongoDB mediante la función connectDB.
//  -Define políticas de acceso entre dominios (CORS) para controlar qué dominios pueden acceder al servidor.

// Rutas:
//  -Registra las rutas de usuario con el prefijo /user.

// Puerto del Servidor:
//  -Se configura para escuchar en el puerto definido en process.env.PORT o en el puerto 4000 como predeterminado.