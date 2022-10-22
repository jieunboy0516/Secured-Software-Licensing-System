var database = require("./../database/database.js")

function RetrieveLocation(email, callback){

    database.RetrieveExtrabyEmail(email, (extra) =>{

        if(extra == null) return callback(null)

        if("city" in extra){
            let city = extra.city
            return callback(city)
        }

        if(!("city" in extra)) database.ResetExtraField(email, "city", (status) =>{

            switch(status){

                case "Succesfully reset":
                    console.log(`successfully reset city field of ${email}`)                                   
                    return RetrieveLocation(email, callback)
                    break;

                case "fail":
                    console.log(`fail to update city field of ${email}`)
                    return callback("fail")
                    break;

                default:
                    console.log(`fail to update city field of ${email}`)
                    return callback("fail")
            }


        })

                    
    })

}


function SetLocation(email, city, callback){

    database.RetrieveUserbyEmail(email, (user) => {

        let _extra = JSON.parse(user.extra)
    

        _extra["city"] = city;
      
        user.extra = JSON.stringify(_extra)
        
        database.User.findOneAndUpdate({_id: user._id}, user, {upsert: false}, function(err, doc) {
          if (err) return callback("fail");
          return callback('Succesfully set city');
        });


    })

}


function ResetLocation(email,callback){
    database.ResetExtraField(email, "city", callback)
}


module.exports = {
    RetrieveLocation,
    SetLocation,
    ResetLocation
}