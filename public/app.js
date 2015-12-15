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


    // APPEND HEADER FILTER AND SEACH TO MAIN SCREEN
    var $container = $('#container');

    $container.empty();

    var template = Handlebars.compile($('#main-screen').html());

    $container.append(template());

    var $filter = $('#filter');


    // DISPLAY SHOWS
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

    // UPDATE SEASON EP LOGIC
    var seasonEp = $('.season_ep');

    for(var i=0;i< seasonEp.length; i++){

        $(seasonEp[i]).children('#update_fields').hide();

        $(seasonEp[i]).dblclick(function(){

            $(this).children('#sea_ep_nums').hide();
            $(this).children('#update_fields').show();

            $(this).children('#update_fields').children('#sea_ep_submit').click(function(){

                var seasonVal = $(this).parent().children("#update_season").val(); 
                var episodeVal = $(this).parent().children("#update_episode").val();
                var showId = $(this).parent().parent().parent().attr('data-id');

                updateSeasonEp(seasonVal, episodeVal, showId);

                // $(this).parent().parent().children('#sea_ep_nums').show();
                // $(this).parent('#update_fields').hide();
            })
        })
    }

    // ADD FUNCTIONALITY TO BUTTONS
    newShowButton();

    deleteShow();

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

    // UPDATE LIST LOGIC
    // by default, select the list that it already was set to

    $.each( $('.option'), function( index, option ){

        if (option.value == filter) {

            $(option).attr('selected', 'selected');
        }
    });


    var changeListDrop = $('.move_list');
    
    for(var p=0; p<changeListDrop.length; p++){

        var showId = $(changeListDrop[p]).parent().attr('data-id');
        var origList = $(changeListDrop[p]).val();

        $(changeListDrop[p]).change(function(){

            var moveToList = $(this).val()

            // console.log(showId)
            // console.log(moveToList)
            // console.log(origList)

            moveList(showId, moveToList, origList);
        })
        
    }





    // UPDATE SEASON EP LOGIC
    var seasonEp = $('.season_ep');

    for(var i=0;i< seasonEp.length; i++){

        $(seasonEp[i]).children('#update_fields').hide();

        $(seasonEp[i]).dblclick(function(){

            $(this).children('#sea_ep_nums').hide();
            $(this).children('#update_fields').show();

            $(this).children('#update_fields').children('#sea_ep_submit').click(function(){

                var seasonVal = $(this).parent().children("#update_season").val(); 
                var episodeVal = $(this).parent().children("#update_episode").val();
                var showId = $(this).parent().parent().parent().attr('data-id');

                updateSeasonEp(seasonVal, episodeVal, showId);

                $(this).parent().parent().children('#sea_ep_nums').show();
                $(this).parent('#update_fields').hide();
            })
        })
    }

    deleteShow();
}


// ===============================
// FUNCTIONS FOR CREATING SHOWS
// ===============================
var newShowButton = function(){

    $('#new-show-submit').click(function() {

        searchNewShow();
    })
}

var searchNewShow = function(){

    var t = $('#show-name').val();

    $('#show-name').val('');

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
                $('#show-display-container').empty();
                displayShows(data, list);
            });
        }
   });

}


// ===============================
// FUNCTIONS FOR EDITING SHOWS
// ===============================
var updateSeasonEp = function(season, episode, showId){
    $.ajax({
        url: '/users/' +  Cookies.get('tvTrackerUser') + '/shows/' + showId,
        method: 'GET',
    }).done(function(data){
        console.log(data)

        var showData = {
            show_name: data.show_name,
            img_URL: data.img_URL,
            description: data.description,
            season: season,
            episode: episode,
            list: data.list
        }

        var rerenderList = data.list;

        // console.log(showData)
        $.ajax({
           url: '/users/' +  Cookies.get('tvTrackerUser') + '/shows/' + showId,
           method: 'PUT',
           data: showData
        }).done(function(data){
            console.log(data)

            displayShows(data, rerenderList);
       });
    })    
};



var moveList = function(showId, moveToList, origList){
    $.ajax({
        url: '/users/' +  Cookies.get('tvTrackerUser') + '/shows/' + showId,
        method: 'GET',
    }).done(function(data){

        console.log(showId)
        console.log(moveToList)
        console.log(origList)
        var showData = {
            show_name: data.show_name,
            img_URL: data.img_URL,
            description: data.description,
            season: data.season,
            episode: data.episode,
            list: moveToList
        }      

        console.log(showData)  

        $.ajax({
           url: '/users/' +  Cookies.get('tvTrackerUser') + '/shows/' + showId,
           method: 'PUT',
           data: showData
        }).done(function(data){
            console.log(data)

            displayShows(data, origList);
       });
    })    
}



// ===============================
// FUNCTIONS FOR DELETEING SHOWS
// ===============================
var deleteShow = function(){

    $('.delete-button').click(function(){

        // console.log($(this).parent().attr('data-id'))
        // console.log($('#filter').val());
        console.log('button clicked')

        var $showId = $(this).parent().attr('data-id');

        $.ajax({

            url: "/users/" + Cookies.get('tvTrackerUser') + "/shows/" + $showId,
            method: "DELETE"

        }).done(function(data) {
            console.log(data);
            console.log("deleted");
            displayShows(data, $('#filter').val());

        });

    });

}
