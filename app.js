

/**
 * Module dependencies.
 */

var express = require('express')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , ConnectEnsureLogin = require('connect-ensure-login')
  , bcrypt = require('bcrypt')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , nodemailer = require('nodemailer')
  , flash = require('connect-flash')
  , MongoClient = require('mongodb').MongoClient
  , fs = require('fs') // file system
  , util = require("util")
  ;
//  , mongooseAuth = require('mongoose-auth');
//  , UserProvider = require('./db').UserProvider

var app = express();

// MONGO DB

// Connect to the db
//MongoClient.connect("mongodb://127.4.192.1:27017", function(err, db) {
// MongoClient.connect("mongodb://venfu:1qazse4$ESZAQ!@dharma.mongohq.com:10057/app16932282", function(err, db) {
//   if(err) {
//     throw err;
//   }
//   else {
//     console.log("Mongo is connected");
//   }
// });

var UserSchema = new Schema({
    classification: { type: String, required: true },
    tel: {type: String, required: false},
    email: { type: String, required: true, index: { unique: true } },
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    salt: { type: String, required: true }
});
UserSchema.add({ products: [{type: Schema.Types.ObjectId, ref: 'Product'}] });

// Should probably add numerical validation to price and time instead of using strings
var ProductSchema = new Schema({
    userID: {type: Schema.Types.ObjectId, ref: 'users'}, 
    username: String,
    name: String,
    price: Number,
    category: String,
    description: String,
    ingredients: String,
    instructions: String,
    tags: [String],
    time: Number,
    format: String,
});

var SALT_WORK_FACTOR = 10;
UserSchema.pre('save', function(next) {
    var user = this;
    console.log('pre-save');

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
      console.log('password not modified');
      return next();
    }

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
          console.log('salt error: ' + err);
          return next(err);
        }

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
          if (err) {
            console.log('hash error: ' + err);
            return next(err);
          }

            // set the hashed password back on our user document
            user.password = hash;
            user.salt = salt;
            
            console.log('post-salt');
            next();
        });
    });
});

UserSchema.methods.validatePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

var User = mongoose.model('User', UserSchema);
var Product = mongoose.model('Product', ProductSchema);

// this must be after the mongoose.model call.
// http://stackoverflow.com/questions/18420920/missingschemaerror-schema-hasnt-been-registered-for-model
var routes = require('./routes');

// Needs to be up top in order to setup database middleware (ie. app.use())
//var databaseUrl = "venfu:ufnev@dharma.mongohq.com:10057/app16932282";
//var collections = ["users"];
//var userProvider = new UserProvider(databaseUrl, collections);
mongoose.connect('venfu:1qazse4$ESZAQ!@dharma.mongohq.com:10057/app16932282');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Passport
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    User.findOne({ username: username }).populate('products').exec(function(err, user) {
      if (err) { 
        console.log(err);
        return done(err); 
      }
      if (!user) {
        console.log({ err: 'Incorrect username.' });
        return done(null, false);
      }
      if(!user.validatePassword(password)) {
          console.log({ err: 'Incorrect password.' });
          // console.log(password);
          // console.log(user);
          return done(null, false);
      }
      // console.log(user);
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({_id: id}).populate('products').exec(function(err, user) {
    done(err, user);
  });
});

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

// Nodemailer
var mailOpts, smtpTrans;
  //Setup Nodemailer transport, I chose gmail. Create an application-specific password to avoid problems.
  smtpTrans = nodemailer.createTransport('SMTP', {
      service: 'Gmail',
      auth: {
          user: "jarvis.martin75@gmail.com",
          pass: "kjyewvkjiorxkqym" 
      }
  });

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Adds a `getUserProvider` function to each response object which gives access to the database connection
app.use(function(req, res, next) {
    res.getUserProvider = function() {
        return User;
    };
    res.getProductProvider = function() {
        return Product;
    };
    next();
});

app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser('mr ripley')); // HOW DO WE NEED TO CHANGE THIS ???????????????????
app.use(express.session({ secret: 'SECRET'}, { cookie: { maxAge: 60000 }})); // HOW DO WE NEED TO CHANGE THIS ???????????????????
app.use(flash());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
//app.use(express.static('public'));
//app.use('/public', express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
   app.use(express.errorHandler());
}

//app.get('/', routes.index);

app.get('/',function(req, res){
  
  MongoClient.connect("mongodb://venfu:1qazse4$ESZAQ!@dharma.mongohq.com:10057/app16932282", function(err, mc) {
    if(err) {
      throw err;
    }
    else {
      console.log("MongoClient connected");
      
      var query = ({});
      
      mc.collection('products').find(query).toArray(function(err, products){

        if(err) throw err;

        //console.dir(products);
        
        res.render('index', { 
          title: 'VenFu', 
          msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
          user: req.user, loggedIn: req.isAuthenticated(), products: products //products: JSON.stringify(products)
        });
        
      });
    }
  });
  
  
  
});

//app.get('/users', user.list);
app.get('/customers', routes.customers);
app.get('/vendors', routes.vendors);
app.get('/delivery', routes.delivery);

app.get('/customerService', routes.customerService);
app.get('/about', routes.about);
app.get('/user', routes.user);

app.get('/logout', function(req, res){
  // console.log("Logging Out Now...");
  req.logout();
  // console.log(req.user);
  // console.log(req.session);
  req.flash('info', ['Goodbye']);
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

// *** Register / Sign up ***
app.get('/register', routes.register);
app.post('/register', 
  function(req, res) {
    //console.log(req);
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var classification = req.body.classification;
    var tel = req.body.tel;
    
    var user = new User({
      username: username, 
      email: email, 
      classification: classification,
      tel: tel,
      password: password, 
      salt: "no-salt-please"});
      
    user.save(function(err) {
      if (err) { 
        console.log(err);
        req.flash('err', err);
        res.redirect('back');
      }
      else {
        // After successful Sign Up, Sign In
        req.flash('success', ['Welcome, ' + username]);
        passport.authenticate('local')(req, res, function () {
          res.redirect('back');
        });
      }
    });
});

// ********** LOG IN ***********

app.get('/login', routes.login);
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return (req.flash('err', ['Incorrect Password and/or Username']) && res.redirect('back')); }
    req.logIn(user, function(err) {
      if (err) { return req.flash('err', ['Something went wrong.  Please log in again.']); }
      return (req.flash('success', ['Welcome, ' + user.username]) && res.redirect('back'));
    });
  })(req, res, next);
});

app.post('/ajaxLogin', function(req, res, next) {
  var User = res.getUserProvider();
  var username = req.body.username; 
  var password = req.body.password; 
  //console.log(req.body);
  if((password === undefined || password === "") || (username === undefined  || username === "")) {
    res.json({error: 'Please enter a Username and Password'});
  }
  User.findOne({ 'username': username }).populate('products').exec(function(err, user) {
      // error with query (return error and false for unique)
      if (err) { 
        console.log(err);
        res.json({error: err});
      } else if (!user) {
        // no error with query and user was not found (it's unique)
        res.json({error: 'Incorrect username'});
      } else {
        if(!user.validatePassword(password)) {
            console.log({ error: 'Incorrect password.' });
            // console.log(password);
            // console.log(user);
            // return done(null, false);
            res.json({error: 'Incorrect password'});
        } else {
          req.logIn(user, function(err) {
            if (err) {
              res.json({error: 'Something went wrong.  Please log in again.'});
            }
            console.log({error: null, success: true});
            res.json({error: null});
            // console.log(req.user);
            req.flash('success', ['Welcome, ' + req.user.username]);
            // req.flash('success', ['Welcome']);
            res.redirect('back');
            return req.user;
          });
        }
      }
    });
});

// Suggestions
app.get('/suggestions', routes.suggestions);
app.post('/suggestions', function (req, res) {
  
  //Mail options
  mailOpts = {
      //- from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
      from: 'suggestions@venfu.com',
      to: 'jarvis.martin75@gmail.com',
      subject: 'Suggestion(s) from venfu.com',
      text: req.body.email + ' says ' + req.body.message
  };
    
    smtpTrans.sendMail(mailOpts, function (error, response) {

      //Email not sent
      if (error) {
        req.flash('err', [error + response]); 
        res.render('suggestions', { title: "VenFu - Suggestions"});
      }
      //Yay!! Email sent
      else {
        req.flash('success', ['Message received.  Thank you.']);
        res.redirect('/');
      }
    });
});

function randomString(length, chars) {
  if(chars === undefined) {
      chars = '!@#$%^&*0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

// Forgot Password and/or Username
app.get('/loginHelp', routes.suggestions); //<-- Is this really necessary?
app.post('/loginHelp', function (req, res) {
  // Get the info from the db
  var UserProvider = res.getUserProvider();
  var email = req.body.email;
  UserProvider.findOne({ 'email': email }, function(err, user) {
    // error with query (return error and false for unique)
    if (err) { 
      console.log(err);
      res.json({error: err, unique: false});
      req.flash('err', ['Error. VenFu masters are seeking a solution...']);
    } else if (!user) {
      // no error with query and username was not found (it's unique)
      //console.log({ message: 'No username found: ' + username });
      res.json({error: null, unique: true});
    } 
    else {
      // no error with query and username was found (it's not unique)
      //console.log({ message: 'Username found.' });
      //res.json({error: null, unique: false});
      // *** MAKE NEW PASSWORD??? ***
      
      user.password = randomString(10);
      user.save();
      
      //return user;
      //console.log(user);
  
      //Mail options
      mailOpts = {
        //- from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
        from: 'DoNotReply@venfu.com',
        to: req.body.email,
        subject: 'VenFu Login Help',
        html: '<p>Greetings, ' + user.username + '!<br>Your login information is provided below.<br>Once you sign in, you should <strong>change your password immediately</strong>.<br><br> Username: ' + user.username + '<br> password: ' + user.password + "<br><br>Ten Thousand Blessings,<br> VenFu"
      };
        
      smtpTrans.sendMail(mailOpts, function (error, response) {
  
        //Email not sent
        if (error) {
          alert(error);
          req.flash('err', [error + response]); 
          res.render('back');
        }
        //Yay!! Email sent
        else {
          req.flash('success', ['Please check your email.']);
          res.redirect('/');
        }
      });
    }
  });
  console.log('user= ' + user);
});

// Update User Info
//app.get('/updateUserInfo', routes.updateUserInfo);
app.post('/updateUserInfo', function (req, res) {
  // Get the info from the db
  var UserProvider = res.getUserProvider();
  var username = req.user.username;
  console.log(req.body);
  console.log('existing user: ' + req.user);
  // console.log(res);
  
  // res.json({})
  UserProvider.findOne({ 'username': username }, function(err, user) {
    // error with query (return error and false for unique)
    if (err) { 
      console.log(err);
      res.json({error: err, unique: false});
      req.flash('err', ['Error. VenFu masters are seeking a solution...']);
    } else if (!user) {
      // no error with query and username was not found (it's unique)
      console.log({ message: 'User not found.'});
      req.flash('err', ['Something went wrong.']);
    } 
    else {
      // no error with query and username was found (it's not unique)
      //console.log({ message: 'Username found.' });
      //console.log(req.body);
      
      // Make changes to user info
      // console.log('changing type: ' + type);
      
      for (var attrname in req.body) {
        if(attrname == 'classification') {
          if(user[attrname] && typeof(user[attrname]) == 'object')
            user[attrname] = req.body[attrname].join();
          else if(user[attrname] && typeof(user[attrname]) == 'string')
            user[attrname] = req.body[attrname];
          else
            user[attrname] = 'C';
        } else {
          user[attrname] = req.body[attrname];
        }
      }

      console.log('updated user: ' + user);

      // Let the user know it worked
      // req.flash('success', ['Profile updated.']);

      // Save the updated user info
      user.save();

      // Put the user on the same page.
      // res.redirect('back');
      res.send(user[attrname]);
      // Send updated user data back to the page.
      // return user[attrname];
    }
  });
  //console.log('user = ' + user);
  
});

// **********************************************
//                Add Product 
//***********************************************
//app.get('/addProduct', routes.register);
app.post('/addProduct', 
  function(req, res) {
    var query = { 
      userID: req.user._id,
      username: req.user.username,
      name: req.body.productName, 
      price: req.body.price, 
      category: req.body.productCategory,
      description: req.body.productDescription,
      ingredients: req.body.productIngredients, 
      instructions: req.body.productInstructions,
      tags: req.body.productTags,
      time: req.body.productTime,
      format: req.files.productImg.name.slice(-3)};
    
    var product = new Product(query);
    req.user.products.push(product._id);
    
    req.user.save(function(err, user) {
      if(err) throw err;

    });
    
    product.save(function(err, user, next) {
      if(err) throw err;
      
      // After successfully inserting product into user document
      next;
    });
    
    req.flash('success', ['Product Added']);
    
    //------------------------------
    //  Handle PRODUCT IMAGES
    //------------------------------
    
    // Get product ID
    var id = product._id;

    // Get image info
    var img = req.files.productImg;
    //console.dir(img);
    
    // Get image format
    var format = img.name.slice(-3);
    //console.log(format);
    
    // tmp_path
    var tmp_path = 'tmp' + img.path.slice(4);
    //console.log(tmp_path);

    // target_path
    var target_path = 'public/productImages/' + id + '.' + format;
    
    // Put the image into the proper folder
    fs.readFile(req.files.productImg.path, function (err, data) {
      //var newPath = __dirname + "/uploads/uploadedFileName";
      fs.writeFile(target_path, data, function (err) {
        res.redirect("back");
      });
    });
    
  });

//******************************************
//          GET PRODUCT PAGE
//******************************************
app.get('/product:id', function(req, res) {
  // Then you can use the value of the id with req.params.id
  // So you use it to get the data from your database:
  req.flash('msg', ['Soon this will take you to a product page.']);
  res.redirect("back");

});

// CHECK EMAIL IN REGISTRATION FORM
app.post('/checkEmail', function(req, res){
  var User = res.getUserProvider();
  var email = req.body.email;
  //console.log(req.body);
  if(email === undefined) {
    res.json({error: null, unique: false});
    return;
  }
  User.findOne({ 'email': email }, function(err, user) {
      // error with query (return error and false for unique)
      if (err) { 
        console.log(err);
        res.json({error: err, unique: false});
        req.flash('err', ['Error. VenFu masters are seeking a solution...']);
      } else if (!user) {
        // no error with query and username was not found (it's unique)
        //console.log({ message: 'No username found: ' + username });
        res.json({error: null, unique: true});
      } else {
        // no error with query and username was found (it's not unique)
        //console.log({ message: 'Username found.' });
        res.json({error: null, unique: false});
      }
    });
});

// CHECK USERNAME 
app.post('/checkUsername', function(req, res){
  var User = res.getUserProvider();
  var username = req.body.username;
  //console.log(req.body);
  if(username === undefined) {
    res.json({error: null, unique: false});
    return;
  }
  User.findOne({ 'username': username }, function(err, user) {
      // error with query (return error and false for unique)
      if (err) { 
        console.log(err);
        res.json({error: err, unique: false});
        req.flash('err', ['Error. VenFu masters are seeking a solution...']);
      } else if (!user) {
        // no error with query and username was not found (it's unique)
        //console.log({ message: 'No username found: ' + username });
        res.json({error: null, unique: true});
      } else {
        // no error with query and username was found (it's not unique)
        //console.log({ message: 'Username found.' });
        res.json({error: null, unique: false});
      }
    });
});

// CHECK LOGIN PASSWORD 
// app.post('/checkPassword', function(req, res){
//   var User = res.getUserProvider();
//   var password = req.body.password; // ???
//   //console.log(req.body);
//   if(password === undefined) {
//     res.json({error: null, unique: false});
//     return;
//   }
//   User.findOne({ 'password': password }, function(err, user) {
//       // error with query (return error and false for unique)
//       if (err) { 
//         console.log(err);
//         res.json({error: err, unique: false});
//         req.flash('err', ['Error. VenFu masters are seeking a solution...']);
//       } else if (!user) {
//         // no error with query and password was not found (it's unique)
//         //console.log({ message: 'Unrecognized Password: ' + password });
//         res.json({error: null, unique: true});
//       } else {
//         // no error with query and password was found (it's not unique)
//         //console.log({ message: 'Password found.' });
//         res.json({error: null, unique: false});
//       }
//     });
// });

//In case GET fails
// app.get('*', function(req, res){
//   res.send('Page not found', 404);
// });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
