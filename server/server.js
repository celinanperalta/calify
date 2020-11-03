/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const config = require('./../config.json');

var client_id = config.spotify.client_id; // Your client id
var client_secret = config.spotify.client_secret; // Your secret
var redirect_uri = config.spotify.redirect_uri; // Your redirect uri
var scope = config.spotify.scope;

// Firebase setup
const serviceAccount = require('./../service-account.json');
const { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require('constants');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

/**
 * Creates a Firebase account with the given user profile and returns a custom auth token allowing
 * signing-in this account.
 * Also saves the accessToken to the datastore at /instagramAccessToken/$uid
 *
 * @returns {Promise<string>} The Firebase custom auth token in a promise.
 */
function createFirebaseAccount(spotifyID, displayName, photoURL, accessToken) {
    // The UID we'll assign to the user.
    const uid = `${spotifyID}`;

    // Save the access token to the Firebase Realtime Database.
    const databaseTask = admin.database().ref(`/users/${uid}`)
        .set(accessToken);

    // Create or update the user account.
    const userCreationTask = admin.auth().updateUser(uid, {
        displayName: displayName,
        photoURL: photoURL
    }).catch(error => {
        // If user does not exists we create it.
        if (error.code === 'auth/user-not-found') {
            return admin.auth().createUser({
                uid: uid,
                displayName: displayName,
                photoURL: photoURL
            });
        }
        throw error;
    });

    const tokenTask = admin.auth().createCustomToken(uid);


    // Wait for all async task to complete then generate and return a custom auth token.
    return Promise.all([userCreationTask, databaseTask]).then(() => {
        // Create a Firebase custom auth token.
        // console.log("TOKEN ", token);
        // token.then((tok) => {
        //     console.log('Created Custom token for UID "', uid, '" Token:', tok);
        //     return tok;
        // })   
        return tokenTask;
    });
}

/**
 * Generates the HTML template that signs the user in Firebase using the given token and closes the
 * popup.
 */
function signInFirebaseTemplate(token) {
    return `
    <script src="https://www.gstatic.com/firebasejs/3.6.0/firebase.js"></script>
    <script>
      var token = '${token}';
      var config = {
        apiKey: '${config.firebase.apiKey}',
        databaseURL: '${config.firebase.databaseURL}'
      };
      var app = firebase.initializeApp(config);
      app.auth().signInWithCustomToken(token).then(function() {
        window.close();
      });
    </script>`;
}

app.get('/api/login', (req, res) => {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = config.scope;
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    // res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    console.log("redirect to auth");
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/api/callback', function (req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter
    console.log("at callback");

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    },
                    json: true
                };

                // use the access token to access the Spotify Web API
                request.get(options, function (error, response, body) {
                    console.log(body.uri);
                    console.log(body);

                    createFirebaseAccount(body.uri, body.id, body.photoURL, access_token).then((firebaseToken) => {
                        console.log("Firebase token: ", firebaseToken);
                        res.send(signInFirebaseTemplate(firebaseToken, body.id, body.photoURL, access_token));
                    }).catch(error => {
                        console.log(error);
                        throw error;
                    });
                });

                // we can also pass the token to the browser to make requests from there
               res.redirect('localhost:3000/#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    })); 
                
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

app.get('/api/refresh_token', function (req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

app.get('/api/hello', function (req, res) {
    console.log("it works");
});

//todo: add api endpoint for getting playlists, user info, and controlling playback

console.log('Listening on 8888');
app.listen(8888);