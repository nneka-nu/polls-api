var pollGetController = require('./pollGetController');
var pollCreateController = require('./pollCreateController');
var pollEditController = require('./pollEditController');
var pollDeleteController = require('./pollDeleteController');

exports.getPolls = pollGetController.getPolls;
exports.getPollsByUser = pollGetController.getPollsByUser;
exports.getPollByName = pollGetController.getPollByName;

exports.createPoll = pollCreateController.createPoll;
exports.addChoicesToPoll = pollCreateController.addChoicesToPoll;

exports.deletePoll = pollDeleteController.deletePoll;
exports.deleteChoice = pollDeleteController.deleteChoice;

exports.editPollQuestion = pollEditController.editPollQuestion;
exports.editChoice = pollEditController.editChoice;