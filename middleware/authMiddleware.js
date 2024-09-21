import jwt from 'jsonwebtoken';
import userModels from '../models/userModels.js';

// Función middleware de autenticación que se ejecuta antes de acceder a ciertas rutas protegidas.
const authMiddleware = async (req, res, next) => {

  // Inicializa una variable para almacenar el token si está presente en los headers de la petición.
  let token;

  // Verifica si la petición contiene un header de autorización y si éste comienza con "Bearer".
  if (req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')) {

    try {

      // Extrae el token de la cabecera de autorización (separado después de "Bearer").
      token = req.headers.authorization.split(" ")[1];

      // Verifica el token usando la clave secreta (almacenada en las variables de entorno).
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca al usuario en la base de datos usando el ID decodificado del token.
      // Selecciona todos los campos excepto la contraseña, el token y si está confirmado.
      req.user = await userModels.findById(decoded.id).select( '-password -token -confirmado' );

      // Llama a la siguiente función o middleware si la autenticación fue exitosa.
      return next();

    } catch (error) {

      // Si hay un error (como un token no válido o expirado), se lanza un mensaje de error.
      const e = new Error('Bearer Token no válido: 401 Unauthorized');
      return res.status(403).json({ msg: e.message });

    };
  };

  // Si no se encontró ningún token en los headers, se responde con un error de token inexistente.
  if (!token) {
    const error = new Error('Token inexistente');
    res.status(403).json({ msg: error.message });
  };

  // Si todo está correcto, pasa al siguiente middleware o función de la ruta.
  next();
};

// Exporta el middleware para que pueda ser usado en otros archivos.
export default authMiddleware;

// ↓ Resumen ↓
// El middleware se encarga de verificar si el cliente que realiza la petición ha enviado un token JWT en la cabecera de autorización y si este token es válido. JWT (JSON Web Token): Es un estándar para transmitir información entre dos partes (cliente y servidor) de manera segura a través de un token firmado. En este caso, se utiliza para autenticar al usuario.

// ↓ Función del Middleware ↓
// 1. Revisa si la petición incluye un token de tipo Bearer en los headers.
// 2. Si el token está presente, lo verifica usando una clave secreta.
// 3. Si el token es válido, busca al usuario correspondiente en la base de datos y excluye ciertos campos confidenciales (contraseña, token de confirmación, etc.).
// 4. Si todo es correcto, permite que la petición continúe hacia la ruta protegida.
// 5. Si el token es inválido o no está presente, devuelve un error 403 (prohibido) con un mensaje apropiado.

// ↓ Importancia ↓
// Seguridad: Este middleware asegura que solo los usuarios autenticados puedan acceder a ciertas rutas o recursos protegidos de la API.
// Protección de rutas: Es crucial en aplicaciones que requieren que los usuarios inicien sesión o proporcionen pruebas de autenticación para realizar ciertas acciones, como ver perfiles, hacer pedidos, etc.
// Eficiencia: Permite que las rutas protegidas verifiquen la autenticidad del usuario de manera automatizada sin necesidad de hacerlo manualmente en cada controlador.
