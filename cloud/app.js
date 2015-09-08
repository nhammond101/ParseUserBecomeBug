// These two lines are required to initialize Express in Cloud Code.
express = require( 'express' );

var parseExpressCookieSession = require( 'parse-express-cookie-session' );
var parseExpressHttpsRedirect = require( 'parse-express-https-redirect' );

app = express();

// Global app configuration section
app.set( 'views', 'cloud/views' );  // Specify the folder to find templates
app.set( 'view engine', 'ejs' );    // Set the template engine
app.use( parseExpressHttpsRedirect() );
app.use( express.bodyParser() );    // Middleware for reading request body
app.use( express.cookieParser( 'test_cookie_1' ) );
//app.use( parseExpressCookieSession( {fetchUser: true} ) );
app.use( parseExpressCookieSession( {cookie: {maxAge: 3600000}, fetchUser: true} ) );
app.use( express.cookieSession() );   //Cookies


app.get( '/', function ( req, res )
{

    console.log( "/ called root" );
    res.redirect( '/login' );
} );

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get( '/new', function ( req, res )
{
    console.log( "1" );
    var user = new Parse.User();
    user.set( "username", "user1" );
    user.set( "password", "password" );
    user.set( "email", "email@example.com" );

    user.signUp( null, {
        success: function ( user )
        {
            console.log( user.get( 'username' ) + "is created. logging in" );
            res.redirect( "/login" );
        },
        error: function ( user, error )
        {
            // Show the error message somewhere and let the user try again.
            console.log( "Error: " + error.code + " " + error.message );
            res.send( "failed" )
        }
    } );
} );

app.get( '/login', function ( req, res )
{
    console.log( "logging user1 into system" );
    Parse.User.logIn( "user1", "password", {
        success: function ( user )
        {
            // Hooray! Let them use the app now.
            console.log( "logged in successfully" );
            res.redirect( "/user" );
        },
        error: function ( user, error )
        {
            // Show the error message somewhere and let the user try again.
            alert( "Error: " + error.code + " " + error.message );
        }
    } );
} );


app.get( '/logout', function ( req, res )
{
    console.log( "logging user1 out of system" );
    Parse.User.logOut();
    if ( Parse.User.current() )
    {
        // Show the error message somewhere and let the user try again.
        alert( "Error: " + error.code + " " + error.message );
        res.send( "failed to log out user1..." );
    }
    else
    {
        // Hooray! Let them use the app now.
        console.log( "logged out successfully" );
        res.send( "logged out..." )

    }
} );


// // Example reading from the request query string of an HTTP get request.
app.get( '/user', function ( req, res )
{

    if ( Parse.User.current() )
    {
        var user = Parse.User.current();
        console.log( user );
        res.send( user._sessionToken );
    }
    else
    {
        res.send( "no user logged in" );
    }

} );

/**
 * https://stackoverflow.parseapp.com/become/?t=###
 * get the 't' value from the /user response
 */
app.get( '/become', function ( req, res )
{
    Parse.User.become( req.params.t ).then( function ( user )
    {
        console.log( "became user..." );
        console.log( Parse.User.current() );

        console.log( req.cookies );
        console.log( req.signedCookies );
        res.redirect( '/user' )


    }, function ( error )
    {
        console.log( error );
        res.send( "failed to become more than a man" );
    } );
} );


// Attach the Express app to Cloud Code.
app.listen();
