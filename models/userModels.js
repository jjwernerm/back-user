import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import tokenHelpers from '../helpers/tokenHelpers.js';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: tokenHelpers(),
  },
  confirm: {
    type: Boolean,
    default: false
  },

});

// Método para hashear el password.
userSchema.pre('save', async function(next) {

  // Si existe una modificación en el body, no hashear el password porque el password ya está hasheado.
  if(!this.isModified('password')) {
    next();
  };

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

// Método que compara la contraseña ingresada por el usuario (passwordBody) con la contraseña encriptada en la DB (this.password).
userSchema.methods.checkPassword = async function (passwordBody) {
  return await bcrypt.compare(passwordBody, this.password);
};

const user = mongoose.model('users', userSchema);

export default user;