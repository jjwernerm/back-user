import userModels from '../models/userModels.js';
import sendEmailCreateUser from '../helpers/emailCreateUser.js';
import sendEmailRecoverPassword from '../helpers/emailRecoverPassword.js';
import jwtHelpers from '../helpers/jwtHelpers.js';
import tokenHelpers from '../helpers/tokenHelpers.js';

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

// Función para verificar que el token no existe y enviar el msg al front-end
const tokenNotExists = async (a, findOneToken) => {

  if (!findOneToken) {
    throw new Error(a + ' 404 Not Found');
  };

};

// Función para crear un nuevo usuario
const createUser = async (userData) => {

  const user = new userModels(userData);
  await user.save();
  return user;

};

// Función para generar el <Bearer Token> una vez el usuario haya iniciado sesión
const readUser = async (findOneEmail, password, res) => {

  if (!findOneEmail.confirm) {
    throw new Error(`La cuenta no está activa, revisa tu email para activar cuenta`);
  };

  if (await findOneEmail.checkPassword(password)) {
    res.json({
      //     _id: usuario._id,
      //     nombre: usuario.nombre,
      //     email: usuario.email,
      bearerToken: jwtHelpers(findOneEmail.id),
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

// *********************
//  ↓ Bloque try-catch ↓
// *********************

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

// Función para capturar errores cuando el usuario esté iniciando sesión
const POSTreadUser = async (req, res) => {

  const { email, password } = req.body;

  try {

    const findOneEmail = await methodFindOneEmail(email);

    await emailNotExists(findOneEmail, email);

    await readUser(findOneEmail, password, res);

  } catch (error) {

    // Manejo de errores
    res.status(401).json({ msg: error.message });

  };

};

// const updateUser = (req, res) => {

//   // Actualizar usuario

// };

// const deleteUser = (req, res) => {

//   // Eliminar usuario

// };

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

// Función que permite mostrar el dashboard una vez el usuario haya sido identificado
const GETdashboardUser = (req, res) => {

  const { user } = req;

  res.json(`¡Hola! ${user.name}`);

};

// Función para capturar errores al momento de recuperar la contraseña
const POSTrecoverPasswordEmail = async (req, res) => {

  const { email } = req.body;

  try {

    const findOneEmail = await methodFindOneEmail(email);

    await emailNotExists(findOneEmail, email);

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

const POSTrecoverPasswordNew = async (req, res) => {

  const { token } = req.params;
  const { password } = req.body;

  try {

    const findOneToken = await methodFindOneToken(token);

    await tokenNotExists('Token inválido para Recuperar tu Contraseña:', findOneToken);

    await recoverPasswordNew(findOneToken, password)

    // Responder al cliente
    res.status(201).json({
      msg: 'Contraseña recuperada con éxito, espera unos segundos para iniciar sesión',
    });

  } catch (error) {

    // Manejo de errores
    res.status(404).json({ msg: error.message });

  };

};

export {
  POSTcreateUser,
  POSTreadUser,
  // updateUser,
  // deleteUser,
  GETconfirmUser,
  GETdashboardUser,
  POSTrecoverPasswordEmail,
  GETrecoverPasswordToken,
  POSTrecoverPasswordNew,
};