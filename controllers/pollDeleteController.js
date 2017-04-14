var async = require('async');

var Poll = require('../models/Poll');
var Choice = require('../models/Choice');

/**
 DELETE /api/poll/:name/delete
*/
exports.deletePoll = function(req, res) {
  async.waterfall([
    function(callback) {
      // Find the poll
      Poll.findOne({ name: req.params.name }, function(err, foundPoll) {
        if (err) {
          return callback(err);
        }

        if (foundPoll) {
          callback(null, foundPoll)
        } else {
          callback({
            status: 400,
            message: 'The poll does not exist.'
          });
        }
      });
    },
    function(foundPoll, callback) {
      // Delete the poll's choices
      Choice.deleteMany({ _id: { $in: foundPoll.choices } }, function(err) {
        if (err) {
          return callback(err);
        }

        callback();
      })
    },
    function(callback) {
      // Delete the poll
      Poll.findOneAndRemove({ name: req.params.name }, function(err, deletedPoll) {
        if (err) {
          return callback(err);
        }

        callback(null, deletedPoll);
      });
    }
  ], function(err, result) {
    if (err) {
      var code = err.status || 500;
      if (code !== 400) console.log(err);
      return res.status(code).json(err);
    }

    res.json({
      message: 'Poll deleted successfully.',
      poll: result
    });
  });
};

/**
 DELETE /api/choice/:id/delete
*/
exports.deleteChoice = function(req, res) {
  Choice.findByIdAndRemove(req.params.id, function(err, deletedChoice) {
    if (err) {
      if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Choice ID is invalid.' });
      } else {
        console.log(err);
        return res.status(500).json(err);
      }
    }

    res.json({
      message: 'Choice successfully deleted.',
      choice: deletedChoice
    });
  });
};