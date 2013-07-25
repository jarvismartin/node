// Mongo DB 
//var databaseUrl = "venfu:ufnev@dharma.mongohq.com:10057/app16932282"; // "username:password@example.com/mydb"
// var collections = ["users"]
//varr db = require("mongojs").connect(databaseUrl, collections);

var mongojs = require('mongojs');

var UserProvider = function(databaseUrl, collections) {
    this.db = mongojs.connect(databaseUrl, collections);
};

UserProvider.prototype.find = function(query, callback) {
      this.db.users.find(query, callback);
};

UserProvider.prototype.getVendors = function(callback) {
    return this.find({vendor: true}, function(err, users) {
      if( err || !users) {
          callback({error: "No vendors found"});
      }
      else
          return callback(users);
    });
};

// TESTING MONGO
// db.users.find({vendor: true}, function(err, users) {
//   if( err || !users) console.log("No vendors found");
//   else users.forEach( function(user) {
//   console.log(user);
//   } );
// });

exports.UserProvider = UserProvider;