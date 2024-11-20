import mongoose from 'mongoose';
import userModels from '../models/userModels.js';
import sendEmailCreateUser from '../helpers/emailCreateUser.js';
import sendEmailRecoverPassword from '../helpers/emailRecoverPassword.js';
import jwtHelpers from '../helpers/jwtHelpers.js';
import tokenHelpers from '../helpers/tokenHelpers.js';
import bcrypt from 'bcrypt';


// *****************************************
//  ↓ Métodos y Funciones de Verificación  ↓
// *****************************************

// Métodos <findOne> para buscar coincidencias en la colección (email)
const methodFindOneEmail = async (email) => {

  return await userModels.findOne({ email });

};

// Métodos <findOne> para buscar coincidencias en la colección (token)
const methodFindOneToken = async (token) => {

  return await userModels.findOne({ token });

};

// Función para verificar si email existe y enviar el msg de error al front-end
const emailExists = async (findOneEmail, email) => {

  if (findOneEmail) {
    throw new Error(`El email ${email} ya está registrado, intenta con otro`);
  };

};

// Función para verificar que el email no existe y enviar el msg al front-end
const emailNotExists = async (findOneEmail, email) => {

  if (!findOneEmail) {
    throw new Error(`El email ${email} no está registrado, intenta con otro`);
  };

};

// Función para verificar si la cuenta ya fue confirmada por el usuario a través de su correo
const noConfirm = async (findOneEmail) => {

  if (!findOneEmail.confirm) {
    throw new Error(`La cuenta no está activa, revisa tu email para activar cuenta`);
  };

};

// Función para verificar que el token no existe y enviar el msg al front-end
const tokenNotExists = async (a, findOneToken) => {

  if (!findOneToken) {
    throw new Error(a + ' 404 Not Found');
  };

};

// Función para verificar si el id es un ObjectId válido
const objectId = async (id) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('ID inválido, informe al administrador');
  };

};

// Función para validar al usuario con el id
const userId = async (id) => {

  const user = await userModels.findById(id);

  if (!user) {
    throw new Error('Usuario no encontrado, informe al administrador');
  };

  return user; // Retorna el usuario encontrado

};

// **********
//  ↓ CRUD  ↓
// **********

// Función para crear un nuevo usuario
const createUser = async (userData) => {

  const user = new userModels(userData);
  await user.save();
  return user;

};

// Función para generar el <Bearer Token> una vez el usuario haya iniciado sesión
const readUser = async (findOneEmail, password, res) => {

  if (await findOneEmail.checkPassword(password)) {

    res.json({
      _id: findOneEmail._id,
      name: findOneEmail.name,
      email: findOneEmail.email,
      phone: findOneEmail.phone,
      address: findOneEmail.address,
      bearer_token: jwtHelpers(findOneEmail.id),
    });

  } else {
    throw new Error(`La contraseña es incorrecta, intenta de nuevo: 401 Unauthorized`);
  };

};

// Función para actualizar las propiedades <token> y <confirm>
const confirmUser = async (findOneToken) => {

  findOneToken.token = null;
  findOneToken.confirm = true;
  await findOneToken.save();

};

// Función para actualizar la propiedad <token> con la ayuda de <tokenHelpers>
const recoverPasswordEmail = async (findOneEmail) => {

  findOneEmail.token = tokenHelpers();
  await findOneEmail.save();

};

// Función para actualizar la propiedad <token> y <password> para recuperar password
const recoverPasswordNew = async (findOneToken, password) => {

  findOneToken.token = null;
  findOneToken.password = password;
  await findOneToken.save();

};

// Función para actualizar datos del usuario
const updatedUser = async (user, req) => {

  user.name = req.body.name;
  user.address = req.body.address;
  user.phone = req.body.phone;
  await user.save()

};

// Función para actualizar la contraseña
const updatedPassword = async (user, req) => {

  user.password = req.body.password;
  await user.save()

};

// *********************
//  ↓ Bloque try-catch ↓
// *********************

// Función para capturar errores cuando el usuario esté iniciando sesión
const POSTreadUser = async (req, res) => {

  const { email, password } = req.body;

  try {

    const findOneEmail = await methodFindOneEmail(email);

    await emailNotExists(findOneEmail, email);

    await noConfirm(findOneEmail);

    await readUser(findOneEmail, password, res);

  } catch (error) {

    // Manejo de errores
    res.status(401).json({ msg: error.message });

  };

};

// Función para capturar errores al momento de crear un nuevo usuario
const POSTcreateUser = async (req, res) => {

  const { name, email } = req.body;

  try {

    const findOneEmail = await methodFindOneEmail(email);

    await emailExists(findOneEmail, email);

    const user = await createUser(req.body);

    await sendEmailCreateUser(name, email, user.token);

    // Responder al cliente
    res.status(201).json({
      msg: 'Usuario creado con éxito, hemos enviado un email con las instrucciones de acceso',
    });

  } catch (error) {

    // Manejo de errores
    res.status(400).json({ msg: error.message });

  };

};

// Función para capturar errores cuando se activa la cuenta desde el correo electrónico
const GETconfirmUser = async (req, res) => {

  const { token } = req.params;

  try {

    const findOneToken = await methodFindOneToken(token);

    await tokenNotExists('Token inválido, no es posible Activar tu Cuenta:', findOneToken);

    await confirmUser(findOneToken);

    // Responder al cliente
    res.status(201).json({
      msg: 'Tu cuenta se activó correctamente, ya puedes iniciar sesión',
    });

  } catch (error) {

    // Manejo de errores
    res.status(404).json({ msg: error.message });

  };

};

// Función para capturar errores al momento de recuperar la contraseña
const POSTrecoverPasswordEmail = async (req, res) => {

  const { email } = req.body;

  try {

    const findOneEmail = await methodFindOneEmail(email);

    await emailNotExists(findOneEmail, email);

    await noConfirm(findOneEmail);

    await recoverPasswordEmail(findOneEmail);

    await sendEmailRecoverPassword(findOneEmail.name, email, findOneEmail.token);

    // Responder al cliente
    res.status(201).json({
      msg: 'Hemos enviado un email con las instrucciones para que recuperes la contraseña',
    });

  } catch (error) {

    // Manejo de errores
    res.status(401).json({ msg: error.message });

  };

};

// Función para capturar errores al momento de recuperar el token
const GETrecoverPasswordToken = async (req, res) => {

  const { token } = req.params;

  try {

    const findOneToken = await methodFindOneToken(token);

    await tokenNotExists('Token inválido, no es posible Recuperar tu Contraseña:', findOneToken);

    res.status(201).json({
      msg: 'Aquí puedes recuperar tu contraseña',
    });

  } catch (error) {

    // Manejo de errores
    res.status(404).json({ msg: error.message });

  };

};

// Función para capturar errores al momento de crear una nueva contraseña
const POSTrecoverPasswordNew = async (req, res) => {

  const { token } = req.params;
  const { password } = req.body;

  try {

    const findOneToken = await methodFindOneToken(token);

    await tokenNotExists('Token inválido para Recuperar tu Contraseña:', findOneToken);

    await recoverPasswordNew(findOneToken, password)

    // Responder al cliente
    res.status(201).json({
      msg: 'Nueva contraseña creada con éxito',
    });

  } catch (error) {

    // Manejo de errores
    res.status(404).json({ msg: error.message });

  };

};

const GETdashboardUser = (req, res) => {

  const { user } = req;

  res.json(user);

};

// Función para capturar errores al momento de mostrar los datos del usuario
const GETuserInformation = async (req, res) => {

  const { id } = req.params;

  try {

    await objectId(id);

    // Se captura el valor de 'user'
    const user = await userId(id);

    // Responder al cliente
    res.json({
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
    });

  } catch (error) {

    // Manejo de errores
    res.status(400).json({ msg: error.message });

  };

};

// Función para capturar errores al momento de actualizar los datos del usuario
const PUTupdateUser = async (req, res) => {

  const { id } = req.params;

  try {

    await objectId(id);

    // Se captura el valor de 'user'
    const user = await userId(id);

    // Se pasa 'user' a la función 'updatedUser'
    updatedUser(user, req);

    // Responder al cliente
    res.status(200).json({
      msg: 'Datos actualizados con éxito',
    });

  } catch (error) {

    // Manejo de errores
    res.status(400).json({ msg: error.message });

  };

};

// Función para comparar los password ingresado por el usuario y el de la DB
const POSTverifyPassword = async (req, res) => {

  const { id } = req.params;
  const { password } = req.body;

  try {

    await objectId(id);

    // Se captura el valor de 'user'
    const user = await userId(id);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ msg: 'Contraseña Actual es incorrecta' });
    }

    res.status(200).json({ msg: 'Contraseña Actual es correcta' });

  } catch (error) {

    res.status(500).json({ msg: 'Error en el servidor' });

  };

};

// Función para capturar errores al momento de actualizar la contraseña
const PUTupdatePassword= async (req, res) => {

  const { id } = req.params;

  try {

    await objectId(id);

    // Se captura el valor de 'user'
    const user = await userId(id);

    // Se pasa 'user' a la función 'updatedUser'
    updatedPassword(user, req);

    // Responder al cliente
    res.status(200).json({
      msg: 'La nueva contraseña se guardó con éxito',
    });

  } catch (error) {

    // Manejo de errores
    res.status(400).json({ msg: error.message });

  };

};

// Función para capturar errores al momento de eliminar un usuario
const DELETEdeleteUser = async (req, res) => {

  const { id } = req.params;

  try {

    await objectId(id);

    // Se captura el valor de 'user'
    const user = await userId(id);

    // Elimina el usuario
    await user.deleteOne();

    // Responder con un mensaje de éxito
    res.status(200).json({
      msg: 'Usuario eliminado con éxito'
    });

  } catch (error) {

    // Manejo de errores
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