const mongoose = require('../config/database');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const genPass = require('generate-password');
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nome não pode ser vazio"]
  },
  email: {
    type: String,
    unique: true,
    required: [true, "E-mail não pode ser vazio"],
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'E-mail é inválido'],
    index: true
  },
  role: {
    type: String,
    required: true,
    lowercase: true,
    enum: ['admin','supervisor','user']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  inactive: {
    type: Boolean,
    default: false
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  salt: String,
  hash: String,
  lastAccess: {
    type: Date
  }
}, { timestamps: true });

// plugin validator for unique properties
UserSchema.plugin(uniqueValidator, { message: 'E-mail já está em uso' });

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.getRandomPassword = function(length) {
  return genPass.generate({
    length: length, 
    symbols: false, 
    uppercase: false,
    numbers: true
  });
}

UserSchema.methods.isValidPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');

  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
  let today = new Date();
  let exp = new Date(today);
  exp.setDate(today.getDate() + 1);

  return jwt.sign({
    id: this.id,
    role: this.role,
    exp: parseInt(exp.getTime() / 1000)
  }, secret);
};

UserSchema.methods.toAuthJSON = function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    department: this.department ? {id: this.department.id, name: this.department.name} : undefined,
    role: this.role,
    token: this.generateJWT()
  }
}

UserSchema.methods.toProfileJSON = function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    role: this.role,
    inactive: this.inactive,
    department: this.department ? {id: this.department.id, name: this.department.name} : undefined,
  }
}

UserSchema.methods.toCrudJSON = function() {
  return {
    id: this.id,
    name: this.name,
    department: this.department ? this.department.toCrudJSON() : undefined,
    email: this.email,
    role: this.role,
    inactive: this.inactive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lastAccess: this.lastAccess
  }
}

const User = mongoose.model('User', UserSchema);

module.exports = User;