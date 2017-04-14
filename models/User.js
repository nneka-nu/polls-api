var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  token: String
});

UserSchema.methods.generatePasswordHash = function(password, saltRounds, callback) {
  bcrypt.hash(password, saltRounds, function(err, hash) {
    callback(err, hash);
  });
}

UserSchema.methods.checkPassword = function(password, hash, callback) {
  bcrypt.compare(password, hash, function(err, response) {
    callback(err, response);
  });
}

UserSchema.methods.generateJWT = function(payload, secret, callback) {
  var token = jwt.sign(payload, secret, { expiresIn: '1d'}, function(err, token) {
    callback(err, token);
  }); 
}

module.exports = mongoose.model('User', UserSchema);