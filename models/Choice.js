var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ChoiceSchema = new Schema({
  choice: {
    type: String,
    required: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Choice', ChoiceSchema);