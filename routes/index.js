
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
 */

exports.vendors = function(req, res){
  res.render('vendors', { title: 'VenFu - Vendors' });
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


