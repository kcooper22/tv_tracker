var mongoose = require('mongoose');
var ShowSchema = require('./show').schema;

var UserSchema = new mongoose.Schema({
	email: String,
	password: String,
	name: String,
	shows: [ShowSchema]
});

var User = mongoose.model('User', UserSchema);
module.exports = User;