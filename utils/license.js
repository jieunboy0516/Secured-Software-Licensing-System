var database = require("./../database/database.js")

//hwid
var hwidlib = require('./hwid.js');




function getDateAfterDays(days){
    
    let currentdate = new Date()
    return new Date(currentdate.setTime( currentdate.getTime() + days * 86400000 ));
}



function RetrieveLicenses(email, callback){


    database.RetrieveExtrabyEmail(email, (extra) =>{

        if(extra == null) return callback(null)

        if("license" in extra){
            let license = extra.license
            return callback(license)
        }

        if(!("license" in extra)) database.ResetExtraField(email, "license", (status) =>{

            switch(status){

                case "Succesfully reset":
                    console.log(`successfully reset license field of ${email}`)                                   
                    return RetrieveLicenses(email, callback)
                    break;

                case "fail":
                    console.log(`fail to update license field of ${email}`)
                    return callback("fail")
                    break;

                default:
                    console.log(`fail to update license field of ${email}`)
                    return callback("fail")
            }


        })

                    
    })
}


function HasLicenseEqualSth(email, licensename, licensecorrectcondition, callback){

    RetrieveLicenses(email,(license)=>{
        if(license == "fail") return callback(false)
        if(licensename in license && license[licensename] == licensecorrectcondition) return callback(true)
        return callback(false)
    })

}


function HasLicenseField(email, licensename, callback){

    RetrieveLicenses(email,(license)=>{
        if(license == "fail") return callback(false)
        if(licensename in license) return callback(true)
        return callback(false)
    })

}


function RemoveLicenseField(email, licensename, callback){
    
    database.RetrieveUserbyEmail(email, (user) =>{

        if(user == null) return callback(null)

        let _extra = JSON.parse(user.extra)
        
        delete _extra.license[licensename]
        
        user.extra = JSON.stringify(_extra)

        database.User.findOneAndUpdate({_id: user._id}, user, {upsert: false}, function(err, doc) {
            if (err) return callback("fail");
            return callback(`Succesfully removed license field`);
          });


                    
    })
}


function SetLicensebyString(email, licensename, licensecondition, callback){

    database.RetrieveUserbyEmail(email, (user) =>{

        if(user == null) return callback(null)

        let _extra = JSON.parse(user.extra)

        _extra.license[licensename] = licensecondition

        user.extra = JSON.stringify(_extra)

        database.User.findOneAndUpdate({_id: user._id}, user, {upsert: false}, function(err, doc) {
            if (err) return callback("fail");
            return callback(`Succesfully set license by string`);
          });


                    
    })

}

function SetLicenseExpire(email, licensename, date, callback){

    database.RetrieveUserbyEmail(email, (user) =>{

        if(user == null) return callback(null)

        let _extra = JSON.parse(user.extra)

        let expirestring = `expire on ${date.toString()}`

        _extra.license[licensename] = expirestring

        user.extra = JSON.stringify(_extra)

        database.User.findOneAndUpdate({_id: user._id}, user, {upsert: false}, function(err, doc) {
            if (err) return callback("fail");
            return callback(`Succesfully set expire date`);
          });


                    
    })

}



function IsLicenseExpired(email, licensename, callback){

    RetrieveLicenses(email,(licenses)=>{
        if(licenses == "fail") return callback(true)

        let license = licenses[licensename] 
        license = license.replace("expire on ", "")
        
        let expiredate = Date.parse(license)
        let currentdate = new Date()

        console.log(expiredate - currentdate)

        if(expiredate - currentdate < 0) return callback(true)

        return callback(false)
    })

}


function ApplyLicenseType(email, licensetype, callback){
   
    let licensename;
    let licenseday;
    
    switch(licensetype){


        case "hwid_add2":
            hwidlib.ApplyHWIDLicense(email, licensetype, callback)   //rubbish code (can directly call addHWIDcount)
            return;
            break;
        
        default:
            return callback("invalid license type", false)
    }
    
    HasLicenseField(email,licensename,(HasLicense)=>{

        if(!HasLicense) {
            SetLicenseExpire(email, licensename, getDateAfterDays(licenseday), (status)=>{
                if(status == "Succesfully set expire date") return callback("successfully applied license", true)
            })
        }

        if(HasLicense){
            IsLicenseExpired(email,licensename,(isexpired)=>{

                if(!isexpired){
                    return callback("license not yet expired", false)
                }

                if(isexpired){
                    SetLicenseExpire(email, licensename, getDateAfterDays(licenseday), (status)=>{
                        if(status == "Succesfully set expire date") return callback("successfully applied license", true)
                    })
                }

            })
        }

    })


    
}


function GetLicenseTypeByCode(licensecode, callback){
    
    database.Licensecode.findOne({licensecode: licensecode}, function (err, license) { 
        if(license == null) return callback(null)
        
        return callback(license.type);
    });
}


function ApplyLicenseCode(email, licensecode, callback){

    GetLicenseTypeByCode(licensecode, (type)=>{
        if(type == null) return callback("fail apply license code")

        ApplyLicenseType(email,type,callback)
    })
}

function AddLicenseCodeToDatabase(licensecode, type, callback){

    let license = new database.Licensecode({
        licensecode:licensecode,
        type: type
    })

    license.save(function (err, savedlicense) {
      if (err){
        console.error(err);
        return callback("error saving new licensecode");
      }
      console.log(`created new licensecode: ${savedlicense} of type ${type}`);
      return callback("successfully created new licensecode");
    });
}


function DeleteLicenseCodeFromDatabase(licensecode, callback){

    //discord
    var discordlib = require('./discord.js');
    
    database.Licensecode.findOne({licensecode: licensecode}, function (err, license) { 
        if(license == null) return callback("license doesnt exist")

        GetLicenseTypeByCode(licensecode, (type)=>{
            license.remove()
            console.log(`license ${licensecode} of type ${type} is removed from database`)
            discordlib.LogToChannel(`license ${licensecode} of type ${type} is removed from database`)
        })
        
        return callback("license removed from database");
    });
    
}


function GenerateLicenses(type, amount){

    let licenses = []


    for(let i = 0; i < amount; i++){

        let license = new database.Licensecode({
            licensecode: generate_licensecode(20),
            type: type
        })

        licenses.push(license)
    }


    licenses.forEach(license=>{
            
        license.save(function (err, savedlicense) {

            if (err){
              console.error(err);
            }

            console.log(`created new licensecode ${savedlicense.licensecode} of type ${savedlicense.type}`)
            require('./discord.js').LogToChannel(`created new licensecode ${savedlicense.licensecode} of type ${savedlicense.type}`);
            
        });
  
    })

}


function generate_licensecode(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function GetAllLicensesByType(type, callback){

    database.Licensecode.find({type: type}, function (err, licenses) { 
        if(licenses == null) return callback(null)
        
        return callback(licenses);
    });

}

function DeleteLicense(licensecode, callback){


    database.Licensecode.findOne({licensecode: licensecode}, function (err, license) { 
        if(license == null) return callback("license doesnt exist")
  
        //discord
        var discordlib = require('./../utils/discord.js');  
        
        license.remove()
        console.log(`license of type ${license.type} ${licensecode} is removed from database`)
        discordlib.LogToChannel(`license of type ${license.type} ${licensecode} is removed from database`)
        
        return callback("license removed from database");
    });
    
}

module.exports = {

    getDateAfterDays,
    RetrieveLicenses,
    HasLicenseEqualSth,
    HasLicenseField,
    RemoveLicenseField,
    SetLicensebyString,
    SetLicenseExpire,
    IsLicenseExpired,
    ApplyLicenseType,
    GetLicenseTypeByCode,
    ApplyLicenseCode,
    AddLicenseCodeToDatabase,
    DeleteLicenseCodeFromDatabase,
    GenerateLicenses,
    GetAllLicensesByType,
    DeleteLicense
    
}
  