var User = require('../models/User');
var config = require('../config');

/*
POST /user/create
{
  "username": "username",
  "password": "password"
}
*/
exports.createUser = function(req, res) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      'message': 'Username and password are required.'
    });
  }

  if (typeof req.body.username !== 'string' || typeof req.body.password !== 'string') {
    return res.status(400).json({
      'message': 'Please enter a valid username and/or password.'
    });
  }
  
  // Check if user exists, then save user
  User.findOne({ username: req.body.username }, function(err, foundUser) {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    if (foundUser) {
      return res.status(400).json({
        message: 'The username already exists.'
      });
    }

    var newUser = new User({
      username: req.body.username
    });

    newUser.generatePasswordHash(req.body.password, 10, function(err, hash) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: 'There was a problem saving your credentials. Please try again later.'
        });
      }

      newUser.password = hash;

      newUser.save(function(err, user, numAffected) {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }

        createAndSaveToken(user, res);
      });
    });
  });
};

/**
 POST /user/login
 {
   "username": "username",
   "password": "password"
 }
*/
exports.loginUser = function(req, res) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      'message': 'Username and password are required.'
    });
  }

  User.findOne({username: req.body.username }, function(err, foundUser) {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    if (foundUser) {
      var theUser = new User();

      theUser.checkPassword(
        req.body.password,
        foundUser.password,
        function(err, response) {
          if (err) {
            console.log(err);
            return res.status(500).json(err);
          }

          if (response === true) {
            createAndSaveToken(foundUser, res);
          } else {
            res.status(400).json({
              message: 'The username and/or password is incorrect.'
            });
          }
        }
      );
    } else {
      res.status(400).json({
        message: 'The username does not exist.'
      });
    }
  })
};

function createAndSaveToken(user, res) {
  var payload = {
    _id: user._id,
    username: user.username
  }
  var userInstance = new User();

  userInstance.generateJWT(payload, config.jwtSecret, function(err, token) {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    User.findByIdAndUpdate(user._id, { token: token }, { new: true }, function(err, updatedUser) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }

      res.json({
        token: updatedUser.token
      });
    });
    
  });
}