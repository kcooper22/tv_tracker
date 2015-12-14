// ======
// DEPENDENCIES
var express      = require('express'),
    mongoose     = require('mongoose'),
    bodyParser   = require('body-parser'),
    md5          = require('md5'),
    cookieParser = require('cookie-parser');

var port         = process.env.PORT || 3000;
var app          = express();

// ======
// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(cookieParser());

// ======
// DATABASE
var mongoUri =  process.env.MONGOLAB_URI || 'mongodb://localhost/tv_tracker';
mongoose.connect(mongoUri);

// ======
// LISTENER
app.listen(port);

// ======
// MODELS
var User = require('./models/user.js');
var Show = require('./models/show.js');

// ROutes

// ===============
// USER RELATED ROUTES
// =============== 

// This route creates the user
app.route('/users')

    .post(function(req, res) {

        var newUser = new User ({
                email: req.body.email,
                password: md5(req.body.password),
                name: req.body.name
            });

        newUser.save(function(err) {

            if (err) {

                console.log(err);

            } else {

                console.log("New user created!");

                res.cookie("tvTrackerUser", newUser.id);

                // Send all of the user's info except the password.
                res.send(newUser.id, newUser.email, newUser.name, newUser.orders);

            }

        });

    });

// Grab single user
app.route('/users/:id')

    .get(function(req,res){
        User.findById(req.params.id).then(function(user) {

            res.send(user)
    });
});


// This route signs in the user.
app.route('/signin')

    .post(function(req, res){

        User.findOne( { email: req.body.email }).then(function(user) {

            if (user.password === md5(req.body.password)) {

                res.cookie("tvTrackerUser", user.id);

                res.send(user);

            }

        });

    });




// This is the route that the user will see upon logging in.
// It shows all of that user's orders.
app.route('/users/:id/shows')

    .get(function(req, res) {

        User.findById(req.params.id).then(function(user) {
            // Just making sure that we are getting the right user.
            console.log(user);
            // Just making sure that we are getting the user's orders.
            console.log(user.shows);

            res.send(user);

        });

    })
    // This route creates a new order
    .post(function(req,res){

        User.findById(req.params.id).then(function(user) {
            Show.create(req.body).then(function(show) {

                console.log(user);
                console.log(show);
                user.shows.push(show)
                user.save()
                res.send(user);
            });
        });

    });