
/*
 * GET home page.
 */

exports.index = function(req, res){
  // console.log(req);
  // res.json(req.user);
  res.render('index', { 
    title: 'VenFu', 
    msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
    user: req.user, loggedIn: req.isAuthenticated()
  });
};

/*
 * GET register page.
 */

exports.register = function(req, res){
  res.render('register', { 
    title: 'VenFu - Register',
    msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
    user: req.user, loggedIn: req.isAuthenticated()
  });
};

/*
 * GET login page.
 */

exports.login = function(req, res){
  res.render('login', { 
    title: 'VenFu - Log in', 
    msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
    user: req.user, loggedIn: req.isAuthenticated()
  });
};

/*
 * GET customers page.
 */

exports.customers = function(req, res){
  res.render('customers', { 
    title: 'VenFu',
    msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
    user: req.user, loggedIn: req.isAuthenticated()
  });
};

/*
 * GET vendors page.
 *
 * This route uses the database function 'getUserProvider()' (associated in app.js).
 * The UserProvider object has a function for getting a list of vendors which 
 * requires a callback function. This callback function handles the database 
 * results, including any errors (not yet). Then, for debug sake, it logs the results
 * and sends the vendor list to the vendors view.
 */
exports.vendors = function(req, res){
  //res.getUserProvider().getVendors(function(results) {
    //console.log(results);
    // res.json(results);
    //res.render('vendors', { title: 'VenFu - Vendors', vendors: results });
  //});
  
  res.render('vendors', { 
    title: 'VenFu - Vendors',
    msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
    user: req.user, loggedIn: req.isAuthenticated()
  });
};

/*
 * GET delivery page.
 */

exports.delivery = function(req, res){
  res.render('delivery', { 
    title: 'VenFu - Delivery', 
    msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
    user: req.user, loggedIn: req.isAuthenticated()
  });
};

/*
 * GET suggestions page.
 */

exports.suggestions = function(req, res){
  res.render('suggestions', { 
    title: 'VenFu - Suggestions', 
    msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
    user: req.user, loggedIn: req.isAuthenticated()
  });
};

/*
 * GET customer service page.
 */

exports.customerService = function(req, res){
  res.render('customerService', { 
    title: 'VenFu - Customer Service', 
    msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
    user: req.user, loggedIn: req.isAuthenticated()
  });
};

/*
 * GET about page.
 */

exports.about = function(req, res){
  res.render('about', { 
    title: 'How to VenFu', 
    msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
    user: req.user, loggedIn: req.isAuthenticated()
  });
};

/*
 * GET user page.
 */

exports.user = function(req, res){
  if (req.user ){
    res.render('user', { 
      title: 'My VenFu', 
      msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
      user: req.user, loggedIn: req.isAuthenticated()
    });
  }
  else {
    req.flash('err', ['Please sign in.']);
    res.redirect('/');
  }
};

/*
 * GET forgot password page.
 */

exports.forgotPassword = function(req, res){
  // res.render('user', { 
  //   title: 'My VenFu', 
  //   msg: req.flash('info'), err: req.flash('err'), success: req.flash('success'),
  //   user: req.user, loggedIn: req.isAuthenticated()
  // });
};

