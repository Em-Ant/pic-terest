const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Pic = new Schema({
  url: { type: String, required: true },
  webUrl: String,
  description: {
    type: String,
    maxlength: 120,
  },
  width: Number,
  height: Number,
  format: String,
  date: { type: Date, default: Date.now },
  ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  likers: [Schema.Types.ObjectId],
  data: Buffer,
});

module.exports = mongoose.model('Pic', Pic);
