// DEPENDENCIES

var express      = require('express'),
    mongoose     = require('mongoose'),
    bodyParser   = require('body-parser'),
    md5          = require('md5'),
    cookieParser = require('cookie-parser');

var port         = process.env.PORT || 3000;
var app          = express();

// MIDDLEWARE

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(cookieParser());

// DATABASE

var mongoUri =  process.env.MONGOLAB_URI || 'mongodb://localhost/feed_me';
mongoose.connect(mongoUri);

// LISTENER

app.listen(port);

// MODELS
// var User = require('./models/user.js');
// var Show = require('./models/show.js');