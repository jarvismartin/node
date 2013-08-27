
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , ensureLogin = require('connect-ensure-login')
  , bcrypt = require('bcrypt')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema;
//  , mongooseAuth = require('mongoose-auth');
//  , UserProvider = require('./db').UserProvider

var app = express();

// MONGO DB

var UserSchema = Schema({
    classification: { type: String, required: true },
    email: { type: String, required: true, index: { unique: true } },
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    salt: { type: String, required: true }
    
});

/*
 *
 */
UserSchema.statics.getVendors = function (callback) {
  return this.find({vendor: true}, function(err, users) {
      if( err || !users) {
          callback({error: "No vendors found"});
      }
      else {
          callback(users);
      }
    });
};

var SALT_WORK_FACTOR = 10;
UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // set the hashed password back on our user document
            user.password = hash;
            user.salt = salt;
            next();
        });
    });
});

UserSchema.methods.validatePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

var User = mongoose.model('User', UserSchema);

// Needs to be up top in order to setup database middleware (ie. app.use())
//var databaseUrl = "venfu:ufnev@dharma.mongohq.com:10057/app16932282";
//var collections = ["users"];
//var userProvider = new UserProvider(databaseUrl, collections);
mongoose.connect('venfu:ufnev@dharma.mongohq.com:10057/app16932282');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Passport
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { 
        console.log(err);
        return done(err); 
      }
      if (!user) {
        console.log({ message: 'Incorrect username.' });
        return done(null, false, { message: 'Incorrect username.' });
      }
      if(!user.validatePassword(password)) {
          console.log({ message: 'Incorrect password.' });
          // console.log(password);
          // console.log(user);
          return done(null, false, { message: 'Incorrect password.' });
      }
      // console.log(user);
      return done(null, user);
    });
  }
));

// passport.use(new FacebookStrategy({
//     clientID: 568769829839972,
//     clientSecret: "d259c829db17890a5b543ac1eb5e2383",
//     callbackURL: "http://venfu.jarvism.c9.io/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     console.log(profile);
//     done(null, false);

// passport.use(new FacebookStrategy({
//     clientID: 568769829839972,
//     clientSecret: "d259c829db17890a5b543ac1eb5e2383",
//     callbackURL: "http://venfu.jarvism.c9.io/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     console.log(profile);
//     done(null, false);

    
    // User.findOne({ username: username }, function(err, user) {
    //   if (err) { 
    //     console.log(err);
    //     return done(err); 
    //   }
    //   if (!user) {
    //     console.log({ message: 'Incorrect username.' });
    //     return done(null, false, { message: 'Incorrect username.' });
    //   }
    //   if(!user.validatePassword(password)) {
    //       console.log({ message: 'Incorrect password.' });
    //       // console.log(password);
    //       // console.log(user);
    //       return done(null, false, { message: 'Incorrect password.' });
    //   }
    //   // console.log(user);
    //   return done(null, user);
    // });
    
    // User.findOrCreate(profile.value, function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
//  }
//));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Adds a `getUserProvider` function to each response object which gives access to the database connection
// app.use(function(req, res, next) {
//     res.getUserProvider = function() {
//         return User;
//     };
//     next();
// });
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser('mr ripley')); // HOW DO WE NEED TO CHANGE THIS ???????????????????
app.use(express.session({ secret: 'SECRET'})); // HOW DO WE NEED TO CHANGE THIS ???????????????????
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/users', user.list);
app.get('/customers', routes.customers);
app.get('/vendors', routes.vendors);
app.get('/delivery', routes.delivery);
app.get('/suggestions', routes.suggestions);
app.get('/customerService', routes.customerService);
//app.get('/login', routes.login);
//app.get('/register', routes.register);
app.get('/about', routes.about);
app.get('/settings', routes.settings);

app.get('/logout', function(req, res){
  // console.log("Logging Out Now...");
  req.logout();
  // console.log(req.user);
  // console.log(req.session);
  res.redirect('/');
});

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
//app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
//app.get('/auth/facebook/callback', 
//  passport.authenticate('facebook', { successRedirect: '/',
//                                      failureRedirect: '/' }));

// app.post('/login',
//  passport.authenticate('local', { successRedirect: '/',
//                                   failureRedirect: '/'})
// );

// function authenticatedOrNot(req, res, next){
//     if(req.isAuthenticated()){
//         next();
//     }else{
//         res.redirect("/login");
//     }
// }

// app.get('/user', 
//   authenticatedOrNot,
//   // passport.authenticate('local', { failureRedirect: '/login' }),
//   function(req, res) {
//     console.log(req.user);
//     res.json(req.user);
//   }
// );

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }));

app.post('/register',
  // passport.authenticate('local', { successRedirect: '/',
    // failureRedirect: '/register'}),
  function(req, res) {
    console.log(req);
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var classification = req.body.classification;

    var user = new User({username: username, email: email, classification: classification, password: password, salt: "no-salt-please"});
    user.save(function(err) {
      if (err) { 
        console.log(err);
      }
    });
   // res.redirect('#');
  }
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({_id: id}, function(err, user) {
    done(err, user);
  });
});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
