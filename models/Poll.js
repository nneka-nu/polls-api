var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PollSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  date_created: {
    type: Date,
    default: Date.now
  },
  question: {
    type: String,
    required: true
  },
  choices: [{
    type: Schema.Types.ObjectId,
    ref: 'Choice'
  }]
});

module.exports = mongoose.model('Poll', PollSchema);