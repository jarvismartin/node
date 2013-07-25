
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'VenFu' });
};

/*
 * GET customers page.
 */

exports.customers = function(req, res){
  res.render('customers', { title: 'VenFu' });
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
  res.getUserProvider().getVendors(function(results) {
    console.log(results);
    // res.json(results);
    res.render('vendors', { title: 'VenFu - Vendors', vendors: results });
  });
};

/*
 * GET delivery page.
 */

exports.delivery = function(req, res){
  res.render('delivery', { title: 'VenFu - Delivery' });
};

/*
 * GET suggestions page.
 */

exports.suggestions = function(req, res){
  res.render('suggestions', { title: 'VenFu - Suggestions' });
};

/*
 * GET customer service page.
 */

exports.customerService = function(req, res){
  res.render('customerService', { title: 'VenFu - Customer Service' });
};


