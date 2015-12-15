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
                res.send(newUser);

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


// =============================
// SHOW RELATED ROUTES
// =============================

// This is the route that the user will see upon logging in.
// It shows all of that user's shows.
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
    // This route creates a new show
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


// This route E/{sshows the user's single show.
app.get('/users/:id/shows/:show_id', function(req, res) {

    User.findById(req.params.id).then(function(user) {

        // After grabbing all of the user's shows, iterate through them to find the single one.
        user.shows.forEach(function(show) {

            // Compare each order's id to the id entered in in the request's params
            if (show._id == req.params.show_id) {

                // Send that order back to the frontend if there is a match.
                res.send(show);

            }

        });

});

// This route is for editing an order.
app.put('/users/:id/shows/:show_id', function(req, res) {

        Show.findByIdAndUpdate(req.params.show_id, req.body, function(err, show) {

            if (err) {

                console.log(err);

            }


        });

        User.findById(req.params.id).then(function(user) {

            user.shows.forEach(function(show) {

                if (show._id == req.params.show_id) {

                    var index = user.shows.indexOf(show);
                    user.shows.splice(index, 1);
                    user.save();

                    var newShow = {

                        show_name: req.body.show_name,
                        img_URL: req.body.img_URL,
                        description: req.body.description,
                        season: req.body.season,
                        episode: req.body.episode,
                        list: req.body.list

                    };

                    user.shows.push(newShow);

                    user.save();

                    res.send(user);

                }

            });

        });

    });

});


// This route delets an order from the user's orders key, and from the orders collection
app.delete('/users/:id/shows/:show_id', function(req, res) {

    Show.remove({ _id: req.params.show_id }, function(err){

        if (err) {

            console.log(err);

        }

    });

    User.findById(req.params.id).then(function(user) {

        user.shows.forEach(function(show) {

            if (show._id == req.params.show_id) {

                console.log(show._id);
                console.log("if statement matched");

                var index = user.shows.indexOf(show);
                user.shows.splice(index, 1);

            }

        });

        user.save();

        res.send(user);

    });

});