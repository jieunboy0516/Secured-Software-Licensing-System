//databse
var database = require("./../database/database.js")


//license
var licenselib = require('./license.js');
//login
var loginlib = require('./login.js');
//location
var locationlib = require('./location.js');
//config
var configlib = require('./config.js');
//downloader
var downloaderlib = require('./downloader.js');
//vouch
var vouchlib = require('./vouch.js');
//hwid
var hwidlib = require('./hwid.js');




const Discord = require('discord.js');
const client = new Discord.Client();

const mod_channel_id = '690484212008091680';
//686970503789150223

const prefix = "!"
const updatepassword = "updatepassword"
const updatehwid = "updatehwid"
const accountinfo = "accountinfo"
const applylicense = "applylicense"

const admins =["grandtheftautorubbish#1530", "BinaryC#6969", "TyronesaurusRex#0001"]


function isAdmin(tag){
    let isadmin = false;
    admins.forEach(admin=>{
        if(tag == admin) isadmin = true;
    })
    return isadmin
}


client.once('ready', () => {
  console.log('Discord Ready!');
});


client.on('message', message => {

  //is bot
  if(message.author.id === client.user.id) return;

  //console.log(`${message.author.tag} ${message.channel.id}`)
  client.channels.get(mod_channel_id).send(`${message.author.tag} \n  ${message.content}`)


  //message author
  let author = message.author.tag

  //commands
  if(message.content.startsWith(prefix)){

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    //client.channels.get(mod_channel_id).send(`[${author}] Command name: ${command} - Arguments: ${args}`)


    //update password
    if(command == updatepassword){

      //invalid arg length
      if(args.length != 3) return ReplyAndLog(author,message,client,"invalid args length")

      let email = args[0]
      let original_password = args[1]
      let new_password = args[2]

      loginlib.IsLoginSucessbyEmailPass(email, original_password, (valid)=>{

          if(!valid) return ReplyAndLog(author, message, client, "invalid credentials")

          loginlib.updatePassword(email, new_password, (status)=>{

              if(status == "error update password") return ReplyAndLog(author, message, client, "error update password")

              if(status == "Succesfully update password") return ReplyAndLog(author, message, client, "Succesfully changed password")

          })

      })


    }


    //update hwid
    if(command == updatehwid){

        //invalid arg length
        if(args.length != 3) return ReplyAndLog(author,message,client,"invalid args length")

        let email = args[0]
        let password = args[1]
        let new_hwid = args[2]


        loginlib.IsLoginSucessbyEmailPass(email, password, (valid)=>{

            if(!valid) return ReplyAndLog(author, message, client, "invalid credentials")

            hwidlib.getHWIDleft(email, (hwid_left)=>{

                if(hwid_left == "error get hwid left") return ReplyAndLog(author, message, client, "error update hwid")

                if(hwid_left <= 0 ) return ReplyAndLog(author,message,client,"No More HWID Change Left! - Please contact dev")

                if(hwid_left > 0 ){

                    hwidlib.updateHWID(email, new_hwid, (status)=>{

                        if(status == "error update hwid") return ReplyAndLog(author, message, client, "error update hwid")
        
                        if(status == "Succesfully update hwid"){

                            ReplyAndLog(author, message, client, "Succesfully update hwid")
                            hwidlib.setHWIDleft(email, hwid_left - 1 , (status)=>console.log(status))
                            
                        } 
        
                    })

                }

                
            })

          
        })

      

    }   


    //get account info
    if(command == accountinfo){

        //invalid arg length
        if(args.length != 2) return ReplyAndLog(author,message,client,"invalid args length")

        let email = args[0]
        let password = args[1]

        loginlib.IsLoginSucessbyEmailPass(email, password, (valid)=>{

            if(!valid) return ReplyAndLog(author, message, client, "invalid credentials")

            licenselib.RetrieveLicenses(email, (licenses)=>{

                hwidlib.getHWIDleft(email, (hwid_left)=>{

                    return ReplyAndLog(author, message, client, `licensetest(ignore me): ${licenses.licensetest} \noriginv7-license: ${licenses["originv7-license"]} \noriginv7_skipads_license: ${licenses["originv7_skipads_license"]} \nelaboy_license: ${licenses["elaboy_license"]} \nhwid left: ${hwid_left}`)

                })

            })

        })

    }



    

    //apply license
    if(command == applylicense){

        //invalid arg length
        if(args.length != 3) return ReplyAndLog(author,message,client,"invalid args length")

        let email = args[0]
        let password = args[1]
        let licensecode = args[2]

        loginlib.IsLoginSucessbyEmailPass(email, password, (valid)=>{
            
            if(!valid) return ReplyAndLog(author, message, client, "invalid credentials")
            
            licenselib.ApplyLicenseCode(email, licensecode, function(applystatus, applysuccessed){
                
                ReplyAndLog(author, message, client, applystatus)     
                
                if(applysuccessed) licenselib.DeleteLicenseCodeFromDatabase(licensecode, (deletestatus)=> {} )
                
            })

        })

    }

    
    
    //admin: newuser
    if(command == "newuser" && isAdmin(author)){

        //invalid arg length
        if(args.length != 3) return ReplyAndLog(author,message,client,"invalid args length")

        let email = args[0]
        let discord = args[1]
        let payment = args[2]

        database.NewUser({
            email: email,
            password: "mypassword",
            hwid: "hwid",
            payment: payment,
            discord: discord,
            vouched: "default not vouched",
            extra: JSON.stringify({
                license:{originv7_tester:"yes"},
                hwid_change_left: 2,
                city: "unset"
            })     
        },
        (status)=> {
            switch(status){
                case "success":
                    return LogToChannel("success created new user");
                case "missing a field in schema":
                    return LogToChannel("missing a field in schema");
                case "missing a field in extra":
                    return LogToChannel("missing a field in extra");
                case "user with the same email already exists":
                    return LogToChannel("user with the same email already exists");
                default:
                    return LogToChannel("failed")
            }
            
        })
    }

    
    //admin: deleteuser
    if(command == "deleteuser" && isAdmin(author)){

        //invalid arg length
        if(args.length != 1) return LogToChannel("invalid args length")
        
        let email = args[0]

        database.DeleteUser(email, (status)=>LogToChannel(status))
    }    
    

    //admin: getuserinfo
    if(command == "getuserinfo" && isAdmin(author)){

        //invalid arg length
        if(args.length != 1) return LogToChannel("invalid args length")
        
        let email = args[0]

        database.User.findOne({email: email}, function (err, user) {
            if(user == null) return LogToChannel(null)
            
            return LogToChannel(JSON.stringify(user));
          });
    }
    
    
    //admin: getdiscordbyemail
    if(command == "getdiscordbyemail" && isAdmin(author)){
        
        //invalid arg length
        if(args.length != 1) return LogToChannel("invalid args length")
        
        let email = args[0]

        database.User.findOne({email: email}, function (err, user) {
            if(user == null) return LogToChannel(null)
            
            return LogToChannel(user.discord);
        });
    }
        
    

    //admin: unsetlocation
    if(command == "unsetlocation" && isAdmin(author)){

        //invalid arg length
        if(args.length != 1) return LogToChannel("invalid args length")
        
        let email = args[0]

        database.ResetExtraField(email, "city", (status)=>LogToChannel(status))
    }

    
    //admin: setpayment 
    if(command == "setpayment" && isAdmin(author)){
        
        //invalid arg length
        if(args.length != 2) return LogToChannel("invalid args length")
        
        let email = args[0]
        let payment = args[1]
        
        database.User.findOne({email: email}, function (err, user) { 
            if(user == null) return LogToChannel("error set payment")
        
            user.payment = payment
            
            database.User.findOneAndUpdate({_id: user._id}, user, {upsert: false}, function(err, doc) {
                if (err) return LogToChannel("error set payment");
                
                return LogToChannel('Succesfully set payment');
              });
          });

    }

    //admin: setvouched
    if(command == "setvouched" && isAdmin(author)){
        
        //invalid arg length
        if(args.length != 2) return LogToChannel("invalid args length")
        
        let email = args[0]
        let vouched = args[1]
        
        vouchlib.setVouched(email, vouched, (status)=> LogToChannel(status))
    }    

    //admin: unsetvouched
    if(command == "unsetvouched" && isAdmin(author)){
        
        //invalid arg length
        if(args.length != 1) return LogToChannel("invalid args length")
        
        let email = args[0]
        
        vouchlib.setVouched(email, "unvouched", (status)=> LogToChannel(status))
    }   
    
    //admin: deletelicensefield
    if(command == "deletelicensefield" && isAdmin(author)){
        
        //invalid arg length
        if(args.length != 2) return LogToChannel("invalid args length")
        
        let email = args[0]
        let licensename = args[1]

        licenselib.RemoveLicenseField(email, licensename, (status)=> LogToChannel(status))
    }   

    
    //admin: getalllicenses
    if(command == "getalllicenses" && isAdmin(author)){

        //invalid arg length
        if(args.length != 1) return LogToChannel("invalid args length")

        let type = args[0]

        licenselib.GetAllLicensesByType(type,(licenses)=>{
            let reply = ""
            licenses.forEach(license => {
                reply += `${license.licensecode}\n`
            });
            LogToChannel(reply)
        })

    }

    //admin: getrandomlicense
    if(command == "getrandomlicense" && isAdmin(author)){

        //invalid arg length
        if(args.length != 1) return LogToChannel("invalid args length")

        let type = args[0]

        licenselib.GetAllLicensesByType(type,(licenses)=>{
            let license = licenses[Math.floor(Math.random() * licenses.length)]

            LogToChannel(license.licensecode)
        })
        
    }    

    //admin: generatelicenses
    if(command == "generatelicenses" && isAdmin(author)){

        //invalid arg length
        if(args.length != 2) return LogToChannel("invalid args length")

        let type = args[0]
        let amount = args[1]

        licenselib.GenerateLicenses(type, amount)

    }


    //admin: deletelicense
    if(command == "deletelicense" && isAdmin(author)){

        //invalid arg length
        if(args.length != 1) return LogToChannel("invalid args length")

        let licensecode = args[0]

        licenselib.DeleteLicense(licensecode, (status)=> LogToChannel(status))

    }



  }


});



function ReplyAndLog(author,message,client,msgtxt){
  let reply = `[${author}] ${msgtxt}`
  message.reply(reply)
  client.channels.get(mod_channel_id).send(`replied ${author}: ${msgtxt}`)
}

function LogToChannel(text){
  client.channels.get(mod_channel_id).send(text)
}

client.login('Njg2OTY4NTcxNDc3MzYwNjU5.Xme8iw.EHzsfMyQVmPIES4cRjQvnMGcXyw');



module.exports = {
  LogToChannel,
}
