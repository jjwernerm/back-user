import express from 'express';
// Importa Express para crear rutas y gestionar solicitudes HTTP.

import {
  // Public Area 
  POSTcreateUser,           // Controlador para registrar un nuevo usuario.
  POSTreadUser,             // Controlador para iniciar sesión.
  GETconfirmUser,           // Controlador para confirmar una cuenta con un token.
  POSTrecoverPasswordEmail, // Controlador para enviar correo de recuperación.
  GETrecoverPasswordToken,  // Controlador para validar el token de recuperación.
  POSTrecoverPasswordNew,   // Controlador para establecer una nueva contraseña.

  // Private Area
  GETdashboardUser,         // Controlador para mostrar el dashboard del usuario.
  GETuserInformation,       // Controlador para obtener información del usuario.
  PUTupdateUser,            // Controlador para actualizar datos del usuario.
  POSTverifyPassword,       // Controlador para verificar la contraseña actual.
  PUTupdatePassword,        // Controlador para actualizar la contraseña.
  DELETEdeleteUser,         // Controlador para eliminar un usuario.

} from '../controllers/userControllers.js';
// Importa todos los controladores necesarios para las rutas.

import authMiddleware from '../middleware/authMiddleware.js';
// Importa el middleware de autenticación para proteger rutas privadas.

const router = express.Router();
// Crea una instancia del enrutador de Express.

// Public Routes
router.post('/loging', POSTreadUser);
// Ruta para iniciar sesión (acceso público).

router.post('/create', POSTcreateUser);
// Ruta para registrar un nuevo usuario (acceso público).

router.get('/confirm-user/:token', GETconfirmUser);
// Ruta para confirmar una cuenta usando un token único (acceso público).

router.post('/recover-password', POSTrecoverPasswordEmail);
// Ruta para enviar un correo de recuperación de contraseña (acceso público).

router.get('/recover-password/:token', GETrecoverPasswordToken);
// Ruta para validar el token de recuperación de contraseña (acceso público).

router.post('/recover-password/:token', POSTrecoverPasswordNew);
// Ruta para establecer una nueva contraseña después de validar el token (acceso público).

// Private Routes
router.get('/dashboard', authMiddleware, GETdashboardUser);
// Ruta para acceder al dashboard del usuario (requiere autenticación).

router.get('/information/:id', authMiddleware, GETuserInformation);
// Ruta para obtener la información del usuario (requiere autenticación).

router.put('/update/:id', authMiddleware, PUTupdateUser);
// Ruta para actualizar datos del usuario (requiere autenticación).

router.post('/verify-password/:id', authMiddleware, POSTverifyPassword);
// Ruta para verificar la contraseña actual del usuario (requiere autenticación).

router.put('/update-password/:id', authMiddleware, PUTupdatePassword);
// Ruta para actualizar la contraseña del usuario (requiere autenticación).

router.delete('/delete/:id', authMiddleware, DELETEdeleteUser);
// Ruta para eliminar al usuario (requiere autenticación).

export default router;
// Exporta el enrutador para que pueda ser utilizado en otros archivos.


// Propósito:
// Este archivo define todas las rutas relacionadas con los usuarios, separadas en dos áreas:

// Rutas Públicas:
// -Accesibles sin autenticación.
// -Manejan el registro de usuarios, confirmación de cuentas, y recuperación de contraseñas.

// Rutas Privadas:
// -Requieren autenticación (verificada mediante el middleware authMiddleware).
// -Incluyen operaciones como actualización de datos, verificación de contraseñas, y eliminación de usuarios.

// Importancia:
// Centraliza y organiza las rutas de usuarios, haciendo que el código sea más legible y mantenible. Además, garantiza que las rutas protegidas sean accesibles solo para usuarios autenticados.