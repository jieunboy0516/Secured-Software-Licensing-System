var database = require("./../database/database.js")


function IsLoginSucessbyEmailPass(email,password,callback){
    database.User.findOne({email: email, password: password}, function (err, user) { 
        if(user == null) return callback(false)
    
        if(user.password == password) return callback(true)
        return callback(false)
      });
}




function updatePassword(email, password, callback){ 

    database.User.findOne({email: email}, function (err, user) { 
      if(user == null) return callback("error update password")

      user.password = password

      database.User.findOneAndUpdate({_id: user._id}, user, {upsert: false}, function(err, doc) {
          if (err) return callback("error update password");

          return callback('Succesfully update password');
        });
    });

} 



module.exports = {
  IsLoginSucessbyEmailPass,
  updatePassword,
  
}
