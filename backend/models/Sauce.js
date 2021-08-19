const mongoose = require('mongoose');

const thingSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: String, required: true },
    likes: { type: Number, required: true },
    dislikes: { type: Number, required: true },
    // usersLiked: { type: Array[String], required: true },
    // usersDisliked: { type: Array[String], required: true },
});

module.exports = mongoose.model('Thing', thingSchema);