import mongoose from 'mongoose'; 
// Importa Mongoose, una biblioteca que permite interactuar con MongoDB desde Node.js.

const connectDB = async () => {
  // Define una función asíncrona para conectar a la base de datos MongoDB.

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, 
      { 
        useNewUrlParser: true,        // Usa el nuevo parser de URL para evitar advertencias.
        useUnifiedTopology: true     // Usa el nuevo motor de gestión de conexiones.
      },
    );
    // Establece una conexión con MongoDB utilizando la URI almacenada en las variables de entorno.

    const url = `${db.connection.host}:${db.connection.port}`;
    // Obtiene la dirección del host y el puerto donde está corriendo MongoDB.

    console.log(`MongoDB connected on ${url}`);
    // Imprime un mensaje en la consola confirmando la conexión exitosa con MongoDB.

  } catch (error) {
    console.log(`error: ${error.message}`);
    // Si ocurre un error durante la conexión, lo muestra en la consola.

    process.exit(1);
    // Finaliza el proceso con un estado de error (1) si no puede conectarse a la base de datos.
  };
};

export default connectDB;
// Exporta la función `connectDB` para que pueda ser utilizada en otros archivos.


// Propósito:
// Este archivo contiene una función llamada connectDB que establece una conexión con una base de datos MongoDB utilizando Mongoose. La URI de conexión se obtiene de las variables de entorno (process.env.MONGO_URI) para mantener las credenciales seguras. Si la conexión tiene éxito, se imprime un mensaje en la consola indicando el host y el puerto de la base de datos. En caso de error, el proceso finaliza y se muestra un mensaje con los detalles del problema.