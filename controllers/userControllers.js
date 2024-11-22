import mongoose from 'mongoose'; 
// Importa Mongoose, que es la biblioteca para interactuar con MongoDB, donde se almacenan los datos.

import userModels from '../models/userModels.js'; 
// Importa el modelo de usuario, que define el esquema y las operaciones sobre los documentos de usuario en la base de datos.

import sendEmailCreateUser from '../helpers/emailCreateUser.js'; 
// Importa la función que se utilizará para enviar correos electrónicos de activación de cuenta.

import sendEmailRecoverPassword from '../helpers/emailRecoverPassword.js'; 
// Importa la función que se utilizará para enviar correos electrónicos de recuperación de contraseña.

import jwtHelpers from '../helpers/jwtHelpers.js'; 
// Importa la función para generar y verificar tokens JWT, usados para la autenticación de usuarios.

import tokenHelpers from '../helpers/tokenHelpers.js'; 
// Importa la función que genera un token aleatorio, usado en procesos como la recuperación de contraseña.

import bcrypt from 'bcrypt'; 
// Importa bcrypt, una librería para encriptar contraseñas y compararlas de forma segura.
  

// *****************************************
//  ↓ Métodos y Funciones de Verificación ↓
// *****************************************

// Método para encontrar un usuario por su email
const methodFindOneEmail = async (email) => {
  return await userModels.findOne({ email });
  // Busca un usuario en la base de datos por su email. Retorna el usuario si lo encuentra.
};

// Método para encontrar un usuario por su token
const methodFindOneToken = async (token) => {
  return await userModels.findOne({ token });
  // Busca un usuario en la base de datos por su token. Retorna el usuario si lo encuentra.
};

// Función para verificar si el email existe en la base de datos
const emailExists = async (findOneEmail, email) => {
  if (findOneEmail) {
    // Si el email ya existe, lanza un error
    throw new Error(`El email ${email} ya está registrado, intenta con otro`);
  };
  // Si no existe, simplemente retorna sin hacer nada
};

// Función para verificar si el email no existe en la base de datos
const emailNotExists = async (findOneEmail, email) => {
  if (!findOneEmail) {
    // Si el email no está registrado, lanza un error
    throw new Error(`El email ${email} no está registrado, intenta con otro`);
  };
  // Si existe, simplemente retorna sin hacer nada
};

// Función para verificar si la cuenta ha sido confirmada
const noConfirm = async (findOneEmail) => {
  if (!findOneEmail.confirm) {
    // Si el campo `confirm` es falso (lo que significa que el usuario no ha confirmado su cuenta), lanza un error
    throw new Error(`La cuenta no está activa, revisa tu email para activar cuenta`);
  };
  // Si la cuenta ya está confirmada, no hace nada.
};

// Función para verificar si el token existe en la base de datos
const tokenNotExists = async (a, findOneToken) => {
  if (!findOneToken) {
    // Si no se encuentra el token, lanza un error con el mensaje proporcionado y código de error 404
    throw new Error(a + ' 404 Not Found');
  };
  // Si el token existe, no hace nada y continúa con la ejecución.
};

// Función para verificar si el ID es un ObjectId válido
const objectId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    // Si el ID no es válido según MongoDB, lanza un error con el mensaje indicado.
    throw new Error('ID inválido, informe al administrador');
  };
  // Si el ID es válido, no hace nada y continúa con la ejecución.
};

// Función para validar si el usuario existe por su ID
const userId = async (id) => {
  const user = await userModels.findById(id);
  // Busca al usuario en la base de datos por su ID.
  if (!user) {
    // Si no se encuentra el usuario, lanza un error con el mensaje indicado.
    throw new Error('Usuario no encontrado, informe al administrador');
  };

  return user; // Retorna el usuario encontrado si existe.
};

// **********
//  ↓ CRUD ↓
// **********

// Función para crear un nuevo usuario
const createUser = async (userData) => {
  const user = new userModels(userData);
  // Crea un nuevo documento de usuario con los datos proporcionados.
  await user.save();
  // Guarda el nuevo usuario en la base de datos.
  return user; // Retorna el usuario creado.
};

// Función para autenticar al usuario e iniciar sesión, generando un token de autenticación
const readUser = async (findOneEmail, password, res) => {
  if (await findOneEmail.checkPassword(password)) {
    // Si la contraseña proporcionada coincide con la almacenada en la base de datos, se genera un token JWT.
    res.json({
      _id: findOneEmail._id, // Devuelve el ID del usuario
      name: findOneEmail.name, // Devuelve el nombre del usuario
      email: findOneEmail.email, // Devuelve el email del usuario
      phone: findOneEmail.phone, // Devuelve el teléfono del usuario
      address: findOneEmail.address, // Devuelve la dirección del usuario
      bearer_token: jwtHelpers(findOneEmail.id), // Devuelve el token JWT para la autenticación del usuario
    });
  } else {
    // Si la contraseña no coincide, lanza un error con el mensaje de error correspondiente.
    throw new Error(`La contraseña es incorrecta, intenta de nuevo: 401 Unauthorized`);
  };
};

// Función para actualizar las propiedades <token> y <confirm>
const confirmUser = async (findOneToken) => {
  findOneToken.token = null; // Establece el token a null, indicando que ya no es válido para la activación.
  findOneToken.confirm = true; // Marca el usuario como confirmado, indicando que su cuenta ha sido activada.
  await findOneToken.save(); // Guarda los cambios en la base de datos.
};

// Función para actualizar la propiedad <token> con la ayuda de <tokenHelpers>
const recoverPasswordEmail = async (findOneEmail) => {
  findOneEmail.token = tokenHelpers(); // Genera un nuevo token usando la función de ayuda 'tokenHelpers'.
  await findOneEmail.save(); // Guarda el nuevo token en la base de datos.
};

// Función para actualizar la propiedad <token> y <password> para recuperar la contraseña
const recoverPasswordNew = async (findOneToken, password) => {
  findOneToken.token = null; // Establece el token a null, ya que después de usarlo para recuperar la contraseña, ya no es necesario.
  findOneToken.password = password; // Actualiza la contraseña del usuario con la nueva contraseña proporcionada.
  await findOneToken.save(); // Guarda los cambios en la base de datos.
};

// Función para actualizar los datos del usuario (nombre, dirección, teléfono)
const updatedUser = async (user, req) => {
  user.name = req.body.name; // Actualiza el nombre del usuario con el nuevo nombre proporcionado en el cuerpo de la solicitud.
  user.address = req.body.address; // Actualiza la dirección del usuario con la nueva dirección proporcionada.
  user.phone = req.body.phone; // Actualiza el teléfono del usuario con el nuevo teléfono proporcionado.
  await user.save(); // Guarda los cambios en la base de datos.
};

// Función para actualizar la contraseña del usuario
const updatedPassword = async (user, req) => {
  user.password = req.body.password; // Actualiza la contraseña del usuario con la nueva contraseña proporcionada.
  await user.save(); // Guarda los cambios en la base de datos.
};

// *********************
//  ↓ Bloque try-catch ↓
// *********************

// Función para capturar errores cuando el usuario esté iniciando sesión
const POSTreadUser = async (req, res) => {
  const { email, password } = req.body; 
  // Desestructura el correo electrónico y la contraseña del cuerpo de la solicitud.

  try {
    const findOneEmail = await methodFindOneEmail(email); 
    // Busca un usuario en la base de datos usando el email proporcionado.

    await emailNotExists(findOneEmail, email); 
    // Verifica que el email exista, si no lo encuentra lanza un error.

    await noConfirm(findOneEmail); 
    // Verifica si la cuenta del usuario está confirmada, si no lo está lanza un error.

    await readUser(findOneEmail, password, res); 
    // Llama a la función `readUser` para autenticar al usuario y generar el token de sesión.

  } catch (error) {
    res.status(401).json({ msg: error.message }); 
    // Si ocurre un error, se maneja y responde al cliente con un código 401 (No autorizado) y el mensaje de error.
  };
};

// Función para capturar errores al momento de crear un nuevo usuario
const POSTcreateUser = async (req, res) => {
  const { name, email } = req.body; 
  // Desestructura el nombre y el correo del cuerpo de la solicitud.

  try {
    const findOneEmail = await methodFindOneEmail(email); 
    // Busca en la base de datos si el email ya está registrado.

    await emailExists(findOneEmail, email); 
    // Verifica si el email ya está registrado, si es así lanza un error.

    const user = await createUser(req.body); 
    // Crea un nuevo usuario con los datos proporcionados en el cuerpo de la solicitud.

    await sendEmailCreateUser(name, email, user.token); 
    // Envía un correo electrónico con el token de activación al usuario.

    res.status(201).json({
      msg: 'Usuario creado con éxito, hemos enviado un email con las instrucciones de acceso',
    }); 
    // Responde con un código de estado 201 (creado) y un mensaje de éxito.
  } catch (error) {
    res.status(400).json({ msg: error.message }); 
    // Si ocurre un error, responde con un código 400 (mala solicitud) y el mensaje de error.
  };
};

// Función para capturar errores cuando se activa la cuenta desde el correo electrónico
const GETconfirmUser = async (req, res) => {
  const { token } = req.params; 
  // Desestructura el token de los parámetros de la solicitud (URL).

  try {
    const findOneToken = await methodFindOneToken(token); 
    // Busca en la base de datos si el token de activación es válido.

    await tokenNotExists('Token inválido, no es posible Activar tu Cuenta:', findOneToken); 
    // Verifica si el token existe, si no lo encuentra lanza un error.

    await confirmUser(findOneToken); 
    // Confirma la cuenta del usuario (marca el usuario como activado y elimina el token).

    res.status(201).json({
      msg: 'Tu cuenta se activó correctamente, ya puedes iniciar sesión',
    }); 
    // Responde con un código de estado 201 (creado) y un mensaje de éxito de activación.
  } catch (error) {
    res.status(404).json({ msg: error.message }); 
    // Si ocurre un error, responde con un código de estado 404 (no encontrado) y el mensaje de error.
  };
};

// Función para capturar errores al momento de recuperar la contraseña
const POSTrecoverPasswordEmail = async (req, res) => {
  
  const { email } = req.body;
  // Extrae el email del cuerpo de la solicitud (req.body).

  try {
    
    const findOneEmail = await methodFindOneEmail(email);
    // Busca en la base de datos si existe un usuario con el email proporcionado.

    await emailNotExists(findOneEmail, email);
    // Verifica si el email no está registrado. Si no está, lanza un error.

    await noConfirm(findOneEmail);
    // Verifica si el usuario ha confirmado su cuenta. Si no lo ha hecho, lanza un error.

    await recoverPasswordEmail(findOneEmail);
    // Llama a la función para generar un token de recuperación de contraseña y lo guarda en la base de datos.

    await sendEmailRecoverPassword(findOneEmail.name, email, findOneEmail.token);
    // Envía un correo con el token de recuperación de contraseña al usuario.

    res.status(201).json({
      msg: 'Hemos enviado un email con las instrucciones para que recuperes la contraseña',
    });
    // Responde con un código de estado 201 (creado) y un mensaje de éxito.
  
  } catch (error) {
    res.status(401).json({ msg: error.message });
    // Si ocurre un error, responde con un código de estado 401 (No autorizado) y el mensaje de error.
  };
};

// Función para capturar errores al momento de recuperar el token
const GETrecoverPasswordToken = async (req, res) => {
  
  const { token } = req.params;
  // Extrae el token de los parámetros de la solicitud (URL).

  try {
    
    const findOneToken = await methodFindOneToken(token);
    // Busca en la base de datos si existe un usuario con el token proporcionado.

    await tokenNotExists('Token inválido, no es posible Recuperar tu Contraseña:', findOneToken);
    // Verifica si el token existe. Si no es válido, lanza un error.

    res.status(201).json({
      msg: 'Aquí puedes recuperar tu contraseña',
    });
    // Responde con un código de estado 201 (creado) y un mensaje indicando que el token es válido para recuperar la contraseña.

  } catch (error) {
    res.status(404).json({ msg: error.message });
    // Si el token no es válido o hay otro error, responde con un código de estado 404 (no encontrado) y el mensaje de error.
  };
};

// Función para capturar errores al momento de crear una nueva contraseña
const POSTrecoverPasswordNew = async (req, res) => {

  const { token } = req.params;
  const { password } = req.body;
  // Extrae el token de los parámetros y la nueva contraseña del cuerpo de la solicitud.

  try {
    
    const findOneToken = await methodFindOneToken(token);
    // Busca el token en la base de datos.

    await tokenNotExists('Token inválido para Recuperar tu Contraseña:', findOneToken);
    // Verifica si el token es válido. Si no es válido, lanza un error.

    await recoverPasswordNew(findOneToken, password);
    // Llama a la función para actualizar la contraseña del usuario con la nueva contraseña proporcionada.

    res.status(201).json({
      msg: 'Nueva contraseña creada con éxito',
    });
    // Responde con un código de estado 201 (creado) y un mensaje indicando que la contraseña fue actualizada exitosamente.

  } catch (error) {
    res.status(404).json({ msg: error.message });
    // Si ocurre un error en cualquier punto, responde con un código 404 (no encontrado) y el mensaje de error.
  };
};

// Función para obtener la información del usuario desde el dashboard
const GETdashboardUser = (req, res) => {
  
  const { user } = req;
  // Extrae el usuario del objeto `req` (generalmente, lo asigna un middleware de autenticación).

  res.json(user);
  // Responde con los datos del usuario (generalmente, información como nombre, email, etc.).
};

// Función para capturar errores al momento de mostrar los datos del usuario
const GETuserInformation = async (req, res) => {
  
  const { id } = req.params;
  // Extrae el ID del usuario desde los parámetros de la solicitud (URL).

  try {
    
    await objectId(id);
    // Verifica si el ID proporcionado es válido utilizando la función `objectId`.

    // Se captura el valor de 'user'
    const user = await userId(id);
    // Busca el usuario en la base de datos utilizando el ID proporcionado.

    // Responder al cliente con los datos del usuario
    res.json({
      name: user.name, // Devuelve el nombre del usuario.
      email: user.email, // Devuelve el correo electrónico del usuario.
      address: user.address, // Devuelve la dirección del usuario.
      phone: user.phone, // Devuelve el teléfono del usuario.
    });

  } catch (error) {
    
    // Si ocurre un error, maneja el error y responde con un código de estado 400 y el mensaje de error.
    res.status(400).json({ msg: error.message });

  };
};

// Función para capturar errores al momento de actualizar los datos del usuario
const PUTupdateUser = async (req, res) => {
  
  const { id } = req.params;
  // Extrae el ID del usuario desde los parámetros de la solicitud (URL).

  try {
    
    await objectId(id);
    // Verifica si el ID proporcionado es válido utilizando la función `objectId`.

    // Se captura el valor de 'user'
    const user = await userId(id);
    // Busca al usuario en la base de datos utilizando el ID proporcionado.

    // Se pasa 'user' a la función 'updatedUser'
    updatedUser(user, req);
    // Llama a la función `updatedUser` para actualizar los datos del usuario con la información proporcionada en la solicitud.

    // Responder al cliente con un mensaje de éxito
    res.status(200).json({
      msg: 'Datos actualizados con éxito',
    });

  } catch (error) {
    
    // Si ocurre un error, maneja el error y responde con un código de estado 400 y el mensaje de error.
    res.status(400).json({ msg: error.message });

  };
};

// Función para comparar los password ingresado por el usuario y el de la DB
const POSTverifyPassword = async (req, res) => {
  
  const { id } = req.params;
  const { password } = req.body;
  // Extrae el ID del usuario y la contraseña desde los parámetros de la solicitud (URL y cuerpo).

  try {
    
    await objectId(id);
    // Verifica si el ID proporcionado es válido utilizando la función `objectId`.

    // Se captura el valor de 'user'
    const user = await userId(id);
    // Busca al usuario en la base de datos utilizando el ID proporcionado.

    const isMatch = await bcrypt.compare(password, user.password);
    // Compara la contraseña proporcionada por el usuario con la almacenada en la base de datos utilizando bcrypt.

    if (!isMatch) {
      return res.status(401).json({ msg: 'Contraseña Actual es incorrecta' });
      // Si las contraseñas no coinciden, responde con un código 401 (No autorizado) y el mensaje correspondiente.
    }

    res.status(200).json({ msg: 'Contraseña Actual es correcta' });
    // Si las contraseñas coinciden, responde con un código 200 (OK) y un mensaje de éxito.

  } catch (error) {
    
    res.status(500).json({ msg: 'Error en el servidor' });
    // Si ocurre un error en el servidor, responde con un código 500 (Error interno del servidor) y un mensaje de error.
  };
};

// Función para capturar errores al momento de actualizar la contraseña
const PUTupdatePassword = async (req, res) => {

  const { id } = req.params; 
  // Extrae el ID del usuario desde los parámetros de la solicitud (URL).

  try {
    
    await objectId(id);
    // Verifica si el ID proporcionado es válido utilizando la función `objectId`.

    // Se captura el valor de 'user'
    const user = await userId(id);
    // Busca al usuario en la base de datos utilizando el ID proporcionado.

    // Se pasa 'user' a la función 'updatedPassword'
    await updatedPassword(user, req);
    // Llama a la función `updatedPassword` para actualizar la contraseña del usuario con la nueva contraseña proporcionada en la solicitud.

    // Responder al cliente con un mensaje de éxito
    res.status(200).json({
      msg: 'La nueva contraseña se guardó con éxito',
    });

  } catch (error) {
    
    // Si ocurre un error, maneja el error y responde con un código de estado 400 y el mensaje de error.
    res.status(400).json({ msg: error.message });

  };
};

// Función para capturar errores al momento de eliminar un usuario
const DELETEdeleteUser = async (req, res) => {

  const { id } = req.params; 
  // Extrae el ID del usuario desde los parámetros de la solicitud (URL).

  try {
    
    await objectId(id);
    // Verifica si el ID proporcionado es válido utilizando la función `objectId`.

    // Se captura el valor de 'user'
    const user = await userId(id);
    // Busca al usuario en la base de datos utilizando el ID proporcionado.

    // Elimina el usuario
    await user.deleteOne();
    // Elimina el usuario de la base de datos.

    // Responder con un mensaje de éxito
    res.status(200).json({
      msg: 'Usuario eliminado con éxito',
    });

  } catch (error) {
    
    // Si ocurre un error, maneja el error y responde con un código de estado 400 y el mensaje de error.
    res.status(400).json({ msg: error.message });

  };
};

export {
  // Public Area
  POSTreadUser,
  POSTcreateUser,
  GETconfirmUser,
  POSTrecoverPasswordEmail,
  GETrecoverPasswordToken,
  POSTrecoverPasswordNew,

  // Private Area
  GETdashboardUser,
  GETuserInformation,
  PUTupdateUser,
  POSTverifyPassword,
  PUTupdatePassword,
  DELETEdeleteUser,
};

// Resumen General:
// Este archivo contiene diversas funciones que gestionan las operaciones de usuario en la aplicación, organizadas en torno a la autenticación, la gestión de cuentas de usuario, la recuperación de contraseñas y la actualización de datos. A continuación un resumen por secciones de las funciones implementadas.

// * * * Funciones de Verificación (Métodos de Validación) * * *
// methodFindOneEmail y methodFindOneToken:
// Estas funciones buscan un usuario en la base de datos utilizando el correo electrónico o el token, respectivamente. Son utilizadas en varias funciones para verificar la existencia de un usuario o validar el token de recuperación.

// emailExists y emailNotExists:
// Son funciones que verifican si un email ya está registrado en la base de datos o si el email proporcionado no está registrado. Se utilizan durante el proceso de creación de usuario o recuperación de contraseñas.

// noConfirm:
// Verifica si la cuenta del usuario ha sido activada (confirmada) a través de un email. Si no está activada, lanza un error.

// tokenNotExists:
// Verifica que el token proporcionado para la recuperación de contraseña o confirmación de cuenta exista y sea válido.

// objectId y userId:
// objectId valida si un ID proporcionado es un ObjectId válido de MongoDB, y userId busca al usuario en la base de datos utilizando ese ID. Son funciones de validación previas a la actualización o eliminación de usuarios.

// * * * Funciones CRUD y Actualización de Contraseña * * *
// createUser:
// Crea un nuevo usuario en la base de datos con la información proporcionada, y guarda los detalles en MongoDB.

// readUser:
// Compara la contraseña proporcionada por el usuario con la contraseña almacenada en la base de datos (usando bcrypt). Si la contraseña es correcta, genera y devuelve un token JWT para la autenticación del usuario.

// confirmUser:
// Activa la cuenta del usuario al eliminar el token de confirmación y actualizar el estado de confirmación del usuario.

// recoverPasswordEmail:
// Genera un nuevo token de recuperación de contraseña para el usuario y lo guarda en la base de datos, luego envía un correo con el enlace para recuperar la contraseña.

// recoverPasswordNew:
// Utiliza el token de recuperación para actualizar la contraseña del usuario en la base de datos.

// updatedUser:
// Actualiza los datos del usuario (como nombre, dirección, teléfono) en la base de datos.

// updatedPassword:
// Actualiza la contraseña del usuario en la base de datos.

// * * * Funciones para Manejar Rutas y Acciones Específicas * * *
// POSTreadUser:
// Esta función maneja la autenticación del usuario al recibir su correo electrónico y contraseña, verificando si el correo está registrado y si la cuenta está confirmada. Si todo es correcto, devuelve un token de autenticación.

// POSTcreateUser:
// Maneja el proceso de registro de un nuevo usuario, verificando si el email ya está en uso. Si no lo está, crea un nuevo usuario y le envía un correo de activación.

// GETconfirmUser:
// Activa la cuenta de usuario usando un token de confirmación. Si el token es válido, cambia el estado de la cuenta a "confirmada".

// POSTrecoverPasswordEmail:
// Maneja el proceso de recuperación de contraseña, enviando un correo con un token para la recuperación de la contraseña al usuario que lo solicita.

// GETrecoverPasswordToken:
// Verifica si el token de recuperación proporcionado es válido para proceder con la recuperación de la contraseña.

// POSTrecoverPasswordNew:
// Permite al usuario actualizar su contraseña si proporciona un token válido para la recuperación.

// GETdashboardUser:
// Obtiene y responde con los datos del usuario autenticado. Utiliza la información del req.user para devolver los datos relevantes.

// GETuserInformation:
// Devuelve la información del usuario específico según su ID, como nombre, correo, dirección y teléfono.

// PUTupdateUser:
// Permite actualizar los datos del usuario, como nombre, dirección y teléfono.

// POSTverifyPassword:
// Compara la contraseña proporcionada por el usuario con la almacenada en la base de datos para verificar si la contraseña ingresada es correcta.

// PUTupdatePassword:
// Permite al usuario actualizar su contraseña, utilizando un ID para identificar al usuario y un nuevo valor de contraseña.

// DELETEdeleteUser:
// Elimina un usuario de la base de datos. Verifica que el ID proporcionado sea válido antes de proceder con la eliminación.

// Resumen General
// El archivo userControllers.js contiene funciones cruciales para la gestión de usuarios, incluyendo:

// Autenticación: Registro, inicio de sesión, verificación de contraseñas y generación de tokens de sesión.
// Confirmación de cuentas: Verificación y activación de cuentas de usuario a través de un token enviado por correo electrónico.
// Recuperación de contraseñas: Envío de tokens para recuperación de contraseñas y actualización de contraseñas de manera segura.
// Actualización de datos: Modificación de los datos del usuario, incluida la actualización de la contraseña.
// Este archivo es esencial para mantener la seguridad y la integridad de la información de los usuarios en la aplicación, asegurando que solo los usuarios autenticados puedan acceder a las rutas protegidas y que sus datos sean gestionados de manera eficiente y segura.