var database = require("./../database/database.js")


function setVouched(email, status, callback){
    database.User.findOne({email: email}, function (err, user) { 
        if(user == null) return callback("error set vouched")
    
        user.vouched = status

        database.User.findOneAndUpdate({_id: user._id}, user, {upsert: false}, function(err, doc) {
            if (err) return callback("error set vouched");

            return callback('Succesfully set vouched');
          });
      });
}


function getVouched(email, callback){
    database.User.findOne({email: email}, function (err, user) { 
        if(user == null) return callback("error get vouched")
    
        return callback(user.vouched)
      });
}

module.exports = {
    setVouched,
    getVouched
}
