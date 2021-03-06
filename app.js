const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors'); // addition we make
const fileUpload = require('express-fileupload'); //addition we make
config = require( "./config" );
// const UserModel = require('./models/User'); 
// const User = require('./models/User')

// const mongoose = require('mongoose');

// const uri = "mongodb+srv://Gopa:" + config.password + "@cluster0-rmrcx.mongodb.net/test?retryWrites=true&w=majority";
const uri = "mongodb://localhost/video-cut-tool";

// mongoose.connect(uri, { useNewUrlParser: true }, (err) => {
//   console.log(err);
//   // console.log(connected);
// });

const index = require('./routes/index');
const users = require('./routes/users');
const app = express();

var passport = require( "passport" ),
    MediaWikiStrategy = require( "passport-mediawiki-oauth" ).OAuthStrategy,
    session = require( "express-session" );

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/video-cut-tool-back-end/public', express.static(path.join(__dirname, 'public')));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Use CORS and File Upload modules here
app.use(cors());
app.use(fileUpload());

app.use( passport.initialize() );
app.use( passport.session() );

app.use(
   session({
    secret: "OAuth Session",
    saveUninitialized: true,
    resave: true
  })
);

passport.use(new MediaWikiStrategy({
  baseURL: 'https://commons.wikimedia.org/',
  consumerKey: config.consumer_key,
  consumerSecret: config.consumer_secret
},
  (token, tokenSecret, profile, done) => {
    // asynchronous verification, for effect...
    process.nextTick(() => {
      const newUserData = { mediawikiId: profile.id, username: profile.displayName, mediawikiToken: token, mediawikiTokenSecret: tokenSecret };
      return done(null, newUserData);
      // UserModel.findOne({ mediawikiId: profile.id }, (err, userInfo) => {
      //   if (err) return done(err)
      //   if (userInfo) {
      //     // User already exists, update access token and secret
      //     const userData = {
      //       mediawikiId: profile.id,
      //       username: profile.displayName,
      //       mediawikiToken: token,
      //       mediawikiTokenSecret: tokenSecret,
      //     };

      //     UserModel.findByIdAndUpdate(userInfo._id, { $set: { mediawikiToken: token, mediawikiTokenSecret: tokenSecret } }, { new: true }, (err, userInfo) => {
      //       if (err) return done(err);
      //       return done(null, {
      //         _id: userInfo._id,
      //         mediawikiId: profile.id,
      //         username: profile.displayName,
      //         mediawikiToken: token,
      //         mediawikiTokenSecret: tokenSecret,
      //       })
      //     })
      //   } else {
      //     // User dont exst, create one
      //     const newUserData = { mediawikiId: profile.id, username: profile.displayName, mediawikiToken: token, mediawikiTokenSecret: tokenSecret };
      //     const newUser = new UserModel(newUserData)

      //     newUser.save((err) => {
      //       if (err) return done(err)
      //       return done(null, newUser)
      //     })
      //   }
      // })
    })
  },
))

passport.serializeUser( function ( user, done ) {
    done( null, user );
});

passport.deserializeUser( function ( obj, done ) {
    done( null, obj );
});

app.use('/routes', express.static(__dirname + '/routes'));

app.use('/', index);
app.use('/login', (req, res) => {
  console.log("sample requst");
  res.send(res.redirect( req.baseUrl + "/auth/mediawiki/callback" ))
}
); // login

app.get( "/logout" , function ( req, res ) {
	delete req.session.user;
	res.redirect( req.baseUrl + "/" );
} );

app.get('/video-cut-tool-back-end', function(req, res, next) {
  res.render('index', {
   title: 'VideoCutTool',
   user: req && req.session && req.session.user,
   url: req.baseUrl
  });
 });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;