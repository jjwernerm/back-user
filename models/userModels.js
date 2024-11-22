import mongoose from "mongoose";
// Importa Mongoose, una biblioteca para modelar datos en MongoDB.

import bcrypt from 'bcrypt';
// Importa bcrypt para encriptar y comparar contraseñas de manera segura.

import tokenHelpers from '../helpers/tokenHelpers.js';
// Importa una función personalizada para generar tokens.

const userSchema = mongoose.Schema({
  // Define un esquema para los documentos de la colección "users".

  name: {
    type: String,       // El nombre del usuario es un string.
    required: true,     // Este campo es obligatorio.
    trim: true          // Elimina espacios en blanco al inicio y al final del valor.
  },
  email: {
    type: String,       // El email es un string.
    required: true,     // Este campo es obligatorio.
    unique: true,       // No se permiten emails duplicados.
    trim: true          // Elimina espacios en blanco al inicio y al final del valor.
  },
  password: {
    type: String,       // La contraseña es un string.
    required: true,     // Este campo es obligatorio.
  },
  token: {
    type: String,       // El token es un string.
  },
  confirm: {
    type: Boolean,      // Este campo indica si el usuario está confirmado.
    default: false      // Por defecto, el usuario no está confirmado.
  },
  address: {
    type: String,       // Dirección del usuario (opcional).
    trim: true          // Elimina espacios en blanco al inicio y al final.
  },
  phone: {
    type: String,       // Teléfono del usuario (opcional).
    trim: true          // Elimina espacios en blanco al inicio y al final.
  },

});

userSchema.pre('save', async function (next) {
  // Genera un token único si no existe
  if (!this.token) {
    this.token = tokenHelpers();
  };

  // Hashea la contraseña solo si ha sido modificada
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10); // Genera el salt
      this.password = await bcrypt.hash(this.password, salt); // Hashea la contraseña
    } catch (error) {
      throw new Error(error);
    };
  };

  next(); // Finaliza el middleware correctamente

});

// Método que compara la contraseña ingresada con la almacenada en la base de datos.
userSchema.methods.checkPassword = async function (passwordBody) {
  return await bcrypt.compare(passwordBody, this.password);
  // Compara la contraseña ingresada (`passwordBody`) con el hash almacenado (`this.password`).
};

const user = mongoose.model('users', userSchema);
// Crea el modelo "user" basado en el esquema definido y lo vincula a la colección "users".

export default user;
// Exporta el modelo para que pueda ser usado en otros archivos.


// Propósito:
// Este archivo define el esquema y modelo de datos para los usuarios en MongoDB. También implementa lógica adicional para:

// -Hash de contraseñas: Antes de guardar un usuario, la contraseña es encriptada usando bcrypt.
// -Comparación de contraseñas: Permite verificar si una contraseña ingresada coincide con la almacenada.
// -Generación de tokens: Asigna un token único a los usuarios de manera predeterminada.

// Este modelo es esencial para gestionar usuarios, validar credenciales y proteger información sensible como contraseñas.

// Incorporación del try-catch:
// Se asegura que cualquier error durante el proceso de hasheo (como problemas con bcrypt) sea capturado y manejado adecuadamente.
// Sin try-catch, cualquier error en el hasheo podría haber interrumpido el middleware, dejando la contraseña sin procesar.
// Por ejemplo, si había un problema en la conexión a la base de datos o en la configuración de Mongoose, podría haber evitado que el código del pre('save') se completara correctamente.