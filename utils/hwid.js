var database = require("./../database/database.js")



function RetrieveHWIDbyEmail(email,callback){
    database.User.findOne({email: email}, function (err, user) { 
        if(user == null) return callback(null)
        
        return callback(user.hwid)
      });
}


function updateHWID(email, hwid, callback){ 

    database.User.findOne({email: email}, function (err, user) { 
      if(user == null) return callback("error update hwid")

      user.hwid = hwid

      database.User.findOneAndUpdate({_id: user._id}, user, {upsert: false}, function(err, doc) {
          if (err) return callback("error update hwid");
          
          return callback('Succesfully update hwid');
        });
    });

} 


function getHWIDleft(email, callback){

    database.RetrieveExtrabyEmail(email, (extra)=>{
        if(extra == null) return callback("error get hwid left")

        return callback(extra.hwid_change_left)
    })

}


function setHWIDleft(email, hwidleft, callback){ 

    database.RetrieveUserbyEmail(email, (user) => {

        let _extra = JSON.parse(user.extra)
    

        _extra["hwid_change_left"] = hwidleft;
        
        user.extra = JSON.stringify(_extra)
        
        database.User.findOneAndUpdate({_id: user._id}, user, {upsert: false}, function(err, doc) {

            if (err) return callback("error set hwid left");
            return callback(`Succesfully set ${email} hwid left to ${hwidleft}`);

        });


    })


}


function addHWIDleft(email, addcount, callback){

        
    database.RetrieveUserbyEmail(email, (user) => {

        let _extra = JSON.parse(user.extra)
    

        _extra["hwid_change_left"] = _extra["hwid_change_left"] + addcount;
        
        user.extra = JSON.stringify(_extra)
        
        database.User.findOneAndUpdate({_id: user._id}, user, {upsert: false}, function(err, doc) {

            if (err) return callback("error add hwid left", false);
            return callback(`Succesfully set ${email} hwid left to ${_extra["hwid_change_left"]}`, true);

        });


    })


}



function ApplyHWIDLicense(email, licensetype, callback){

    let count = 0;

    
    switch(licensetype){
        case "hwid_add2":
            count = 2;
            break;

        default:
            return callback("invalid license type")
    }


    addHWIDleft(email, count, callback)
}



module.exports = {
    
  RetrieveHWIDbyEmail,
  updateHWID,
  getHWIDleft,
  setHWIDleft,
  addHWIDleft,
  ApplyHWIDLicense

}
