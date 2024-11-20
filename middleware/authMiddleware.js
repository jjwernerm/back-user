import jwt from 'jsonwebtoken';
// Importa jsonwebtoken para generar, decodificar y verificar tokens JWT.

import userModels from '../models/userModels.js';
// Importa el modelo de usuarios para interactuar con la base de datos.

const authMiddleware = async (req, res, next) => {
  // Middleware para autenticar rutas protegidas.

  let bearer_token; 
  // Declara una variable para almacenar el token extraído de los headers.

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Verifica si existe un encabezado de autorización y si comienza con "Bearer".

    try {
      bearer_token = req.headers.authorization.split(" ")[1];
      // Extrae el token eliminando la palabra "Bearer".

      const decoded = jwt.verify(bearer_token, process.env.JWT_SECRET);
      // Decodifica y verifica el token usando la clave secreta del servidor.

      req.user = await userModels.findById(decoded.id).select('-password -token -confirm -__v');
      // Busca al usuario en la base de datos usando el ID decodificado.
      // Excluye campos sensibles como la contraseña, el token y otros datos innecesarios.

      if (!req.user) {
        // Si el usuario no existe, envía una respuesta de error.
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }

      next(); 
      // Si todo es válido, continúa hacia el siguiente middleware o controlador.

    } catch (error) {
      // Maneja errores en la verificación del token o problemas con la base de datos.

      return res.status(403).json({ msg: 'Bearer Token no válido: 401 Unauthorized' });
      // Envía un error 403 indicando que el token no es válido.
    }
  } else {
    // Si no hay token en el encabezado de autorización, envía un error.

    return res.status(403).json({ msg: 'Token inexistente' });
    // Responde con un error indicando que no se proporcionó un token.
  }
};

export default authMiddleware;
// Exporta el middleware para que pueda ser utilizado en las rutas protegidas.


// Propósito:
// Este archivo define un middleware para proteger rutas que requieren autenticación.

// Validación del token:
//  -Verifica si el token JWT está presente en el encabezado Authorization.
//  -Decodifica el token y obtiene el ID del usuario.
//  -Usa el ID para buscar al usuario en la base de datos.

// Protección de rutas:
//  -Permite el acceso solo si el token es válido y el usuario existe en la base de datos.
//  -Bloquea solicitudes no autorizadas o con tokens inválidos.

// Respuestas:
//  -Devuelve errores 403 o 404 según el caso:
//  -403: Token inexistente o no válido.
//  -404: Usuario no encontrado.

// Importancia:
// Este middleware es esencial para controlar el acceso a las rutas protegidas de tu aplicación, asegurando que solo usuarios autenticados puedan realizar ciertas acciones.