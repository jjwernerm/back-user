import jwt from 'jsonwebtoken';
// Importa la biblioteca `jsonwebtoken` para generar y manejar tokens JWT.

const jwtHelpers = (id) => {
  // Define una función para generar un token JWT basado en un ID.

  return jwt.sign(
    { id }, // Payload: contiene el ID del usuario que se incluirá en el token.
    process.env.JWT_SECRET, // Clave secreta: se usa para firmar y verificar el token.
    {
      expiresIn: '30d', // Opciones: el token expira en 30 días.
    }
  );
  // Genera y devuelve un token JWT firmado.
};

export default jwtHelpers;
// Exporta la función para que pueda ser utilizada en otros archivos.


// Propósito:
// Esta función genera un token JWT (JSON Web Token) que contiene el id de un usuario.

// Componentes del Token:
// -Payload: Incluye el id del usuario para identificarlo.
// -Clave Secreta: Usa process.env.JWT_SECRET para firmar el token y asegurar que sea confiable.
// -Expiración: Configura el token para que expire en 30 días.

// Importancia:
// Este archivo permite generar tokens JWT que se utilizan para autenticar a los usuarios en rutas protegidas de la aplicación. El uso de un token con tiempo de expiración garantiza que los usuarios tengan que autenticarse nuevamente después de cierto tiempo, mejorando la seguridad.