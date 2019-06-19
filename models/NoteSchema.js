var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  body: {
    type: String
  }
});

var Note = mongoose.model("Notes", NoteSchema);

module.exports = Note;
