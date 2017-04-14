var Poll = require('../models/Poll');
var User = require('../models/User');

/**
  GET /api/polls
*/
exports.getPolls = function(req, res) {
  Poll.find()
    .populate('creator', 'username')
    .populate('choices')
    .exec(function(err, polls) {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      if (polls.length > 0) {
        res.json(polls);
      } else {
        res.send('No polls found.');
      }
    });
};

/**
  GET /api/polls/:username
*/
exports.getPollsByUser = function(req, res) {
  var pattern = '^' + req.params.username + '$';

  User.find({ username: { $regex: new RegExp(pattern, 'i') } }, function(err, foundUser) {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    if (foundUser.length > 0) {
      var userId = foundUser[0]._id;
      Poll.find({ creator: userId }, function(err, polls) {
        res.json({
          creator: foundUser[0].username,
          polls: polls
        });
      });
    } else {
      res.json({ message: 'The user does not exist.', pattern: pattern });
    }
  });
};

/**
 GET /api/poll/:name
*/
exports.getPollByName = function(req, res) {
  var pattern = '^' + req.params.name + '$';

  Poll.find({ name: { $regex: new RegExp(pattern, 'i') } })
    .populate('creator', 'username')
    .populate('choices')
    .exec(function(err, poll) {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      
      if (poll.length > 0) {
        res.json(poll);
      } else {
        res.status(400).json({ message: 'The poll does not exist.' });
      }
  });
};
