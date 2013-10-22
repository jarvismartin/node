
/*
 * POST to check for a unique username
 */

exports.uniqueUser = function(req, res){
  var User = res.getUserProvider();
  var username = req.body.username;
    User.findOne({ username: username }, function(err, user) {
      
      // error with query (return error and false for unique)
      if (err) { 
        console.log(err);
        res.json({error: err, unique: false});
      } else if (!user) {
        // no error with query and username was not found (it's unique)
        console.log({ message: 'Incorrect username.' });
        res.json({error: null, unique: true});
      } else {
        // no error with query and username was found (it's not unique)
        res.json({error: null, unique: false});
      }
    });
};