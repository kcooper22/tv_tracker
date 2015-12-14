// console.log('connected')

$(function() {

    startApp();

});

var startApp = function(data) {

    // If a user is signed in, show different things,
    // else show only sign in and create account links.
    if (Cookies.get('tvTrackerUser') !== undefined) {

        console.log(data)

        console.log("logged in user cookie present");
        $('.form').empty();
        $('#header').empty();
        $('#header').append("<a href='#' id = 'signout'>Sign Out</a>");
        invokeSignOut();

        $.ajax({
            url: '/users/' +  Cookies.get('tvTrackerUser'),
            method: 'GET',
        }).done(function(data){
            console.log(data)
            $('#container').empty();
            renderShows(data);
    });

    } else {

        console.log("no logged in user cookie");

        $('#header').append("<a href='#' id = 'signin'>Sign In</a>");
        $('#header').append("<a href='#' id = 'signup'>Create Account</a>");

        invokeSignInForm();
        invokeSignUpForm();
    }
}

// Start of the signin process

var invokeSignInForm = function() {

    var $signInBtn = $('#signin');

    $signInBtn.click(function() {

        showSignInForm();

    });

}

var showSignInForm = function() {

    // Empty the container before appending anything.
    $('#container').empty();
    $('#signin').hide();
    $('#signup').show();

    var $template = Handlebars.compile($('#log-in-screen').html());

    $('#container').append($template);

    signInUser();

}

var signInUser = function() {

    var $signInSubmit = $('#signin-submit'),
        $email = $('#email-field'),
        $password = $('#password-field');

    $signInSubmit.click(function() {

        console.log("about to sign in user");

        user = {
            email: $email.val(),
            password: $password.val()
        }

        $.post('/signin', user)
        .done(function(data) {

            // When the user is signed in, remove the sign in and sign up links and the respective form rendered, and only show the sign out link.
            $('.form').empty();
            $('#header').empty();
            $('#header').append("<a href='#' id = 'signout'>Sign Out</a>");

            invokeSignOut(data);

            renderShows(data);

        });

    })

}

// End of signin process


// Start of signup process

var invokeSignUpForm = function() {

    var $signUpBtn = $('#signup');

    $signUpBtn.click(function() {

        showSignUpForm();

    });

}

var showSignUpForm = function() {

    // Empty the container before appending anything.
    $('#container').empty();
    $('#signup').hide();
    $('#signin').show();

    var $template = Handlebars.compile($('#sign-up-screen').html());

    $('#container').append($template);

    signUpUser();

}

var signUpUser = function() {

    var $signUpSubmit = $('#signup-submit'),
        $email = $('#email-field'),
        $name = $('#username-field'),
        $password = $('#password-field'),
        $passwordConfirm = $('#password-confirm-field');

    $signUpSubmit.click(function() {

        // check if password confirmation is same as entered password.

        if ($password.val() !== $passwordConfirm.val()) {

            alert("Your password confirmation does not match!");
            console.log($password.val(), $passwordConfirm.val());

            showSignUpForm();

        } else {

            console.log("about to sign up user");

            user = {
                email: $email.val(),
                name: $name.val(),
                password: $password.val()
            }

            $.post('/users', user)
            .done(function(data) {

                console.log(data);

                // When the user is signed in, remove the sign in and sign up links and the respective form rendered, and only show the sign out link.
                $('.form').empty();
                $('#header').empty();
                $('#header').append("<a href='#' id = 'signout'>Sign Out</a>");

                invokeSignOut(data);

                renderShows(data);

            });

        }

    })

}

var invokeSignOut = function(data){

    var $signOut = $('#signout');

    $signOut.click(function() {

        console.log("About to sign out user");

        Cookies.remove("tvTrackerUser");
        console.log(Cookies.get("tvTrackerUser"));

        // After signing out, empty the container that contains all of the previous user's orders
        // Also, remove the sign out link.
        $('#container').empty();
        $('#header').empty();

        // Invoke the startApp function to go through the process of signup/sign in all over again.
        startApp(data);

    });

}

// ===============================
// FUNCTIONS FOR DISPLAYING SHOWS
// ===============================


var renderShows = function(data){
    
    var $container = $('#container');

    $container.empty();

    var template = Handlebars.compile($('#main-screen').html());

    $container.append(template());

    var $filter = $('#filter');
    
    renderList = $filter.val();

    var showsRenderList = [];

    data.shows.forEach(function(show) {

        if (show.list === renderList) {

            showsRenderList.push(show);
        }

    });

    var $showContainer = $('#show-display-container');

    var templateTwo = Handlebars.compile($('#display-shows').html());

    $showContainer.append(templateTwo(showsRenderList));

    newShowButton();

    

    $filter.change(function () {

        var filterData = ($filter.val())

        displayShows(data, filterData);
        
    });
}


var displayShows = function(data, filter){

    var showsRenderList = [];

    data.shows.forEach(function(show) {

        if (show.list === filter) {

            showsRenderList.push(show);
        }

    });

    var $showContainer = $('#show-display-container');

    $showContainer.empty();

    var template = Handlebars.compile($('#display-shows').html());

    $showContainer.append(template(showsRenderList));

    newShowButton();

}


// ===============================
// FUNCTIONS FOR CREATING SHOWS
// ===============================
var newShowButton = function(){

    // $('#container').empty();

    // var template = Handlebars.compile($('#new-order-template').html());

    // $('#container').append(template);

    $('#new-show-submit').click(function() {

        searchNewShow();
    })
}

var searchNewShow = function(){

    var t = $('#show-name').val();

    $.ajax({
       url: 'http://www.omdbapi.com/?t='+ t +'&y=&plot=short&r=json&type=series',
       method: 'GET',
       dataType: 'JSON'
    }).done(function(data){

        if(data.Response == "False"){
            console.log("ERROR")
        } else{
            var list = $('#filter').val()
            var newShowData = {
               show_name: data.Title,
               img_URL: data.Poster,
               description: data.Plot,
               season: 1,
               episode: 1,
               list: list
            }

            $.ajax({
                url: '/users/' +  Cookies.get('tvTrackerUser') + '/shows',
                method: 'POST',
                data: newShowData
            }).done(function(data){
                console.log(data)
                $('#container').empty();
                renderShows(data);
            });
        }
   });

}

// var createNewOrder = function(){

//     console.log("reached create new order")
//     var restName = $('#rest-name').val();
//     var details = $('#order-details').val();
//     var cuisine = $('#cuisine-type').val();
//     var image = $('#order-image').val();
//     var favorite = $('#meal-favorite');


//     // check if the meal-favorite checkbox is checked, if it is, set favorite to true,
//     // else, to false.
//     if (favorite.is(":checked")) {

//         favorite = true;

//     } else {

//         favorite = false;
//     }

//     // check to make sure the favorite is sending the right boolean value
//     console.log(favorite);

//     var orderData = {
//         restaurant_name: restName,
//         details: details,
//         cuisine: cuisine,
//         img_url: image,
//         favorite: favorite
//     }

//     $.ajax({
//        url: '/users/' +  Cookies.get('tvTrackerUser') + '/orders',
//        method: 'POST',
//        data: orderData
//     }).done(function(data){
//         console.log(data)
//         $('#container').empty();
//         renderMeals(data);
//    });

// }

