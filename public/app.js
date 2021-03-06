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
        $('#header').append("<a href='#' id='signout' class=' inline'>Sign Out</a>");
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

        $('#header').append("<a href='#' id = 'signin'>Sign In</a><br>");
        $('#header').append("<a href='#' id = 'signup'>Create Account</a>");

        $('body').css("background", "url('static_gif.gif')");

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
    $('#show-display-container').empty();
    $('#signin').hide();
    $('#signup').show();

    var $template = Handlebars.compile($('#log-in-screen').html());

    $('#show-display-container').append($template);

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
    $('#show-display-container').empty();
    $('#signup').hide();
    $('#signin').show();

    var $template = Handlebars.compile($('#sign-up-screen').html());

    $('#show-display-container').append($template);

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
        $('#show-display-container').empty();

        // Invoke the startApp function to go through the process of signup/sign in all over again.
        startApp(data);

    });

}

// ===============================
// FUNCTIONS FOR DISPLAYING SHOWS
// ===============================


var renderShows = function(data){

    $('body').css("background", "");

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


    // HIDE SEASON EPISODE DATA UNDER CERTAIN CONDITIONS
    if($filter === 'bailed' || $filter === 'want'){

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
                var showId = $(this).attr('data-id');

                updateSeasonEp(seasonVal, episodeVal, showId);
                console.log(seasonVal,episodeVal,showId)

            })
        })
    }


    // UPDATE LIST LOGIC
    var changeListDrop = $('.move_list');
    
    for(var p=0; p<changeListDrop.length; p++){

        var origList = $(changeListDrop[p]).val();

        $(changeListDrop[p]).change(function(){

            var moveToList = $(this).val();
            var showId = $(this).attr('data-id');

            moveList(showId, moveToList, origList);
        })
        
    }


    // ADD FUNCTIONALITY TO BUTTONS
    newShowButton();

    deleteShow();


    // FILTER LIST CHANGE LOGIC
    $filter.change(function () {

        var filterData = ($filter.val())

        $.ajax({
            url: '/users/' +  Cookies.get('tvTrackerUser'),
            method: 'GET',
        }).done(function(newData){
        
        displayShows(newData, filterData);
    });

        
        
    });
}


var displayShows = function(data, filter){

    var showsRenderList = [];

    data.shows.forEach(function(show) {

        if (show.list === filter) {

            showsRenderList.push(show);
        }

    });

    console.log(showsRenderList)

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

        
        var origList = $(changeListDrop[p]).val();

        $(changeListDrop[p]).change(function(){

            var moveToList = $(this).val();
            var showId = $(this).attr('data-id');

            console.log(showId)
            console.log(moveToList)
            console.log(origList)

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
                var showId = $(this).attr('data-id');

                updateSeasonEp(seasonVal, episodeVal, showId);

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

    var showDescrip = null;
    var showImg = null;
    var list = $('#filter').val();

    $.ajax({
        url: '/tvsearch/description/' + t,
        method: 'GET',
        dataType: 'JSON'
    }).done(function(data){

        if(data.Response == 'False'){
            console.log("ERROR");

            $('#add-response').html('Show Not Found').show();
            setTimeout(function(){
                $('#add-response').hide(1000)
            }, 2000);
        }else{
            showDescrip = data;

            $.ajax({
                url: '/tvsearch/image/' + t,
                method: 'GET',
                dataType: 'JSON'
            }).done(function(data){
                
                showImg = "http://image.tmdb.org/t/p/w500/"+data.results[0].poster_path;
                
                var newShowData = {
                   show_name: showDescrip.Title,
                   img_URL: showImg,
                   description: showDescrip.Plot,
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
                     $('#add-response').html('Show Added!').show();
                    setTimeout(function(){
                        $('#add-response').hide(1000)
                    }, 2000);
                });
        })
      }  
    })
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

        var showData = {
            show_name: data.show_name,
            img_URL: data.img_URL,
            description: data.description,
            season: data.season,
            episode: data.episode,
            list: moveToList
        }      

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

        var $showId = $(this).attr('data-id');

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
