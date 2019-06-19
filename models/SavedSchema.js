var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SavedSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  },

  author: {
    type: String
  }
});

var SavedArticle = mongoose.model("SavedArticle", SavedSchema);

module.exports = SavedArticle;
