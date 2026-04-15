var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Actor sub-schema
var ActorSchema = new Schema({
  actorName: { type: String, required: true },
  characterName: { type: String, required: true }
});

// Movie schema
var MovieSchema = new Schema({
  title: { type: String, required: true },
  releaseDate: { type: Number },
  genre: { type: String },

  imageUrl: { type: String },   

  actors: [ActorSchema]         
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);