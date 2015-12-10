var mongoose = require('mongoose');


var ShowSchema = new mongoose.Schema({
	show_name: String,
	img_URL: String,
	description: String
});

var Show = mongoose.model('Show', ShowSchema);
module.exports = Show;