var Poll = require('../models/Poll');
var Choice = require('../models/Choice');

/**
 PUT /api/poll/:name/question/edit
 {
   "question": "My new question?",
 }
*/
exports.editPollQuestion = function(req, res) {
  Poll.findOneAndUpdate(
    { name: req.params.name },
    req.body,
    { new: true },
    function(err, updatedPoll) {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
      message: 'Poll updated successfully.',
      poll: updatedPoll
    });
    }
  );
};

/**
 PUT /api/choice/:id/edit
 {
   "choice": "Ice Cream",
   "votes": 70
 }
*/
exports.editChoice = function(req, res) {
  Choice.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    function(err, updatedChoice) {
      if (err) {
        var code = err.name === 'CastError' ? 400 : 500;
        return res.status(code).json(err);
      }

      res.json({
        message: 'Choice successfully updated.',
        choice: updatedChoice
      });
    }
  );
};