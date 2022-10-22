//mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://messi10:messi10@ds363008.mlab.com:63008/origin-v7-server', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("database connnetcted");
});

var UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  hwid: String,
  payment: String,
  discord: String,
  vouched: String,
  extra: String,
  //next_hwid_date: Date,
  //licenses: String,
});
var User = mongoose.model('User', UserSchema, 'UserCollection');


const SchemaFields = ["email","password","hwid","payment","discord","vouched", "extra"]
const ExtraFields = ["license", "hwid_change_left", "city"]



var LicensecodeSchema = new mongoose.Schema({
  licensecode: String,
  type: String,
});
var Licensecode = mongoose.model('Licensecode', LicensecodeSchema, 'LicensecodeCollection');



function NewUser(newuser, callback){

  let error = false;

  //make sure has all schema fields
  SchemaFields.forEach(field => {
    if(!(field in newuser)) 
      error = true;
  });
  if(error==true) return callback("missing a field in schema");

  //make sure has all extra fields
  ExtraFields.forEach(field => {
    if(!(field in JSON.parse(newuser.extra)))
     error = true;
  });
  if(error==true) return callback("missing a field in extra");
  
  User.findOne({email: newuser.email}, function (err, user) { 
    if(user != null) return callback("user with the same email already exists");


    let _newuser = new User(newuser) 
    _newuser.save(function (err, saveduser) {
      if (err){
        console.error(err);
        return callback("error saving new user");
      }
      console.log(`created new user:`);
      console.log(saveduser);
      return callback("success");
    });

  });


}

function DeleteUser(email, callback){


  User.findOne({email: email}, function (err, user) { 
      if(user == null) return callback("user doesnt exist")

      //discord
      var discordlib = require('./../utils/discord.js');  
      
      user.remove()
      console.log(`user with email ${email} is removed from database`)
      discordlib.LogToChannel(`user with email ${email} is removed from database`)

      return callback("user removed from database");
  });
  
}


function RetrieveUserbyEmail(email, callback){
  User.findOne({email: email}, function (err, user) { 
    if(user == null) return callback(null)
    
    return callback(user);
  });
}


function RetrieveExtrabyEmail(email, callback){
  User.findOne({email: email}, function (err, user) { 
    if(user == null) return callback(null)
    
    return callback(JSON.parse(user.extra));
  });
}


function ResetExtraField(email,fieldname,callback){
  User.findOne({email: email}, function (err, user) { 
    if(user == null) return callback("fail");

    let _extra = JSON.parse(user.extra)
    

    switch(fieldname){
      case "license":
        _extra["license"] = {}
        break;
      case "hwid_change_left":
        _extra["hwid_change_left"] = 1;
        break;
      case "city":
        _extra["city"] = "unset";
        break;
      
      default:
        return callback("this field name is not supposed to be existed");
    }
  
    user.extra = JSON.stringify(_extra)

    User.findOneAndUpdate({_id: user._id}, user, {upsert: false}, function(err, doc) {
      if (err) return callback("fail");
      return callback('Succesfully reset');
    });

  });
}

function ValidateAllExtraFields(email){

  RetrieveExtrabyEmail(email,(extra)=>{

    ExtraFields.forEach((fieldname)=>{
      if(!(fieldname in extra)) ResetExtraField(email,fieldname,(status)=>console.log(`${status} ${fieldname} ${email} `))
    })
    
  })
  
}



module.exports = {
  User,SchemaFields,ExtraFields,
  Licensecode,
  NewUser,
  DeleteUser,
  RetrieveUserbyEmail,
  RetrieveExtrabyEmail,
  ResetExtraField,
  ValidateAllExtraFields
}

