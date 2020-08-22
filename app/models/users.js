const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  twitter: {
    id: String,
    displayName: String,
    username: String,
    imageUrl: String,
  },
});

module.exports = mongoose.model('User', User);
