var async = require('async');

var Poll = require('../models/Poll');
var Choice = require('../models/Choice');
var User = require('../models/User');

/**
 POST /api/poll/create
 {
   "name": "poll-name",
   "question": "What is your favorite snack?",
   "choices": ["Cake", "Chips", "Popcorn"]
 }
*/
exports.createPoll = function(req, res) {
  var bearerToken = req.headers.authorization.slice(7);
  
  User.findOne({ token: bearerToken }, function(err, authUser) {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    var userId = authUser._id;

    // Validate data
    var newPoll = new Poll({
        name: req.body.name,
        creator: userId,
        question: req.body.question
    });
    var validationError = newPoll.validateSync();

    if (validationError) {
      return res.status(400).json(validationError);
    }

    if (req.body.choices instanceof Array === false) {
      return res.status(400).json({
        message: '"Choices" must be an array.'
      });
    }

    // Create the poll
    async.waterfall([
      function(callback) {
        // Check if poll already exists
        Poll.find({ name: req.body.name }, function(err, foundPoll) {
          if (err) {
            return callback(err);
          }

          if (foundPoll.length > 0) {
            callback({
              status: 400,
              message: 'The poll name, ' + req.body.name + ', already exists.',
              poll: foundPoll
            });
          } else {
            var newChoices = req.body.choices.map(function(choice) {
              return { choice: choice };
            });

            callback(null, newChoices);
          }
        });
      },
      function(newChoices, callback) {
        // Save the choices
        Choice.create(newChoices, function(err, choices) {
          if (err) {
            return callback(err);
          }

          var choicesIds = choices.map(function(choice) {
            return choice._id;
          });

          callback(null, choicesIds);
        });
      },
      function(choicesIds, callback) {
        // Save the poll
        newPoll.choices = choicesIds;
        newPoll.save(function(err, poll, numAffected) {
          if(err) {
            return callback(err);
          }

          callback(null, poll);
        });
      }
    ], function(err, poll) {
      if (err) {
        var code = err.status || 500;
        if (code !== 400) console.log(err);
        return res.status(code).json(err);
      }

      Poll.findById(poll._id)
        .populate('creator', 'username')
        .populate('choices')
        .exec(function(err, thePoll) {
          if (err) {
            console.log(err);
            return res.status(500).json(err);
          }

          res.json({
            message: 'Poll successfully created.',
            poll: thePoll
          });
        });
      
    }); // async.waterfall

  }); // User.find token

};

/**
 POST /api/poll/:name/choices/add
 {
   "choices": ["snack"]
 }
*/
exports.addChoicesToPoll = function(req, res) {
  async.waterfall([
    function(callback) {
      // Find the poll
      Poll.findOne({ name: req.params.name })
        .populate('choices', 'choice')
        .exec(function(err, foundPoll) {
          if (err) {
            return callback(err);
          }

          if (foundPoll) {
            callback(null, foundPoll.choices);
          } else {
            callback({
              status: 400,
              message: 'Poll name is invalid.'
            })
          }
        });
    },
    function(oldChoices, callback) {
      // Check for duplicate choices
      var duplicates = oldChoices.filter(function(choice) {
        return req.body.choices.indexOf(choice.choice) > -1;
      }).map(function(filteredChoice) {
        return filteredChoice.choice;
      });

      if (duplicates.length > 0) {
        return callback({
          status: 400,
          message: 'Some or all of the choices already exist in the poll.',
          duplicates: duplicates
        });
      }

      callback();
    },
    function(callback) {
      // Create and save choices
      var newChoices = req.body.choices.map(function(choice) {
        return { choice: choice };
      });

      Choice.create(newChoices, function(err, choices) {
        if (err) {
          return callback(err);
        }

        var choicesIds = choices.map(function(choice) {
          return choice._id;
        });

        callback(null, choicesIds);
      });
    },
    function(choicesIds, callback) {
      // Save the new choices ObjectIds to the Poll
      Poll.findOneAndUpdate(
        { name: req.params.name },
        { $push: { choices: { $each: choicesIds } } },
        function(err, updatedPoll) {
          err ? callback(err) : callback();
        }
      );
    }
  ], function(err) {
    if (err) {
      var code = err.status || 500;
      if (code !== 400) console.log(err);
      return res.status(code).json(err);
    }

    Poll.find({ name: req.params.name })
      .populate('creator', 'username')
      .populate('choices')
      .exec(function(err, foundPoll) {
        if (err) {
          console.log(err);
          return res.status(500).json(err);
        }

        res.json({
          message: 'Choice(s) added successfully.',
          poll: foundPoll
        });
      });
  });
};