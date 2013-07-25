
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , UserProvider = require('./db').UserProvider;

var app = express();

// MONGO DB
// Needs to be up top in order to setup database middleware (ie. app.use())
var databaseUrl = "venfu:ufnev@dharma.mongohq.com:10057/app16932282";
var collections = ["users"];
var userProvider = new UserProvider(databaseUrl, collections);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Adds a `getUserProvider` function to each response object which gives access to the database connection
app.use(function(req, res, next) {
    res.getUserProvider = function() {
        return userProvider;
    };
    next();
});
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
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

// app.get('/vendor_list', function(req, res){
//     userProvider.getVendors(function(results) {
//         res.json(results);
//         console.log(res.json(results));
//     });
// });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
