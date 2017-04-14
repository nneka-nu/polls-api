var express = require('express');
var jwt = require('jsonwebtoken');

var pollController = require('./controllers/pollController');
var userController = require('./controllers/userController');
var config = require('./config');

var router = express.Router();
var authMiddleware = function(req, res, next) {
  if (!req.headers.authorization) {
    res.json({'message': 'Authorization token is required.'});
  } else {
    try {
      var decoded = jwt.verify(req.headers.authorization.slice(7), config.jwtSecret);

      next();
    } catch(err) {
      var msg = err.name === 'TokenExpiredError' ? 'The token has expired. Login to receive a new one.' : 'Invalid Authorization Token.';

      res.status(400).json({ message: msg });
    }
  }

}
// USER ROUTES
// returns user jwt token
router.post('/user/create', userController.createUser);

// also returns user jwt token
router.post('/user/login', userController.loginUser);

// POLL ROUTES
// Get all polls in the database
router.get('/polls', pollController.getPolls);

// Get polls by creator
router.get('/polls/:username', pollController.getPollsByUser);

// Get one poll by name
router.get('/poll/:name', pollController.getPollByName)

// Create a new poll
router.post('/poll/create', authMiddleware, pollController.createPoll);

// Delete a poll
router.delete('/poll/:name/delete', authMiddleware, pollController.deletePoll);

// Edit a poll question
router.put('/poll/:name/question/edit', authMiddleware, pollController.editPollQuestion);

// Add choice or choices to a poll
router.post('/poll/:name/choices/add', authMiddleware, pollController.addChoicesToPoll);

// Edit choice by id
router.put('/choice/:id/edit', authMiddleware, pollController.editChoice);

// Delete choice by id
router.delete('/choice/:id/delete', authMiddleware, pollController.deleteChoice);

//edit choices sends array of objs that get merged to db
module.exports = router;