// SMELL: [MEDIUM]
// var usage should be replaced with const.
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, // using bcrypt for secure password hashing
        required: true
    },
    role: {
        type: String,
        default: 'user' // SMELL: [MEDIUM]
// Magic string should be a constant.
// either 'user' or 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
