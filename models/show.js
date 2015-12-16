var mongoose = require('mongoose');


var ShowSchema = new mongoose.Schema({
	show_name: String,
	img_URL: String,
	description: String,
	season: Number,
	episode: Number,
	list: String,
	created_at: {type: Date, default: Date.now}
});

var Show = mongoose.model('Show', ShowSchema);
module.exports = Show;