const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs')
var bodyParser = require('body-parser');

var encryptionLib = require('./utils/encryption.js');

//express
const app = express();
app.use(express.static(path.join(__dirname, 'client/build')));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: false }));

//databse
//var database = require("./database/database.js")



//discord
var discordlib = require('./utils/discord.js');


//license
var licenselib = require('./utils/license.js');
//login
var loginlib = require('./utils/login.js');
//location
var locationlib = require('./utils/location.js');
//config
var configlib = require('./utils/config.js');
//downloader
var downloaderlib = require('./utils/downloader.js');
//vouch
var vouchlib = require('./utils/vouch.js');
//hwid
var hwidlib = require('./utils/hwid.js');





const loaderversion = "30/4/2020"


const ADSlinks = [
    "https://stfly.io/testttetsttstts",
    "https://uiz.io/fHtI0",
    "http://gestyy.com/w8V79C"
]



app.get('/test', (req, res) => {

    let j1 = JSONtoObject("config/weapons/R4C/11_11_83_A.json")
    let j2 = JSONtoObject("config/weapons/41C-carbine/11_11_83_B.json")
    let a = [j1,j2]
    let j = {
        weapon_configs: a
    }
    RespondObject(j,"abcdefghijklmnop",res)


});

app.post('/test2', (req, res) => {

    let decrytped = DecryptPostObject(req.body,"abcdefghijklmnop","abcdefghijklmnop","abcdefghijklmnop")
    console.log(decrytped)
    //RespondString("asd",decrytped.time, res)
    RespondObject({a:"asd",b:"sss"},decrytped.time,res)
});


app.get('/test3', (req, res) => {
    RespondString("asd","abcdefghijklmnop", res)
});

app.get('/test4', (req, res) => {
    database.ResetExtraField("email1","hwid_change_left", (status)=>{
        console.log(status)
        res.send(status)
    })
});

app.get('/test5', (req, res) => {
    locationlib.RetrieveLocation("email1",(city)=>{
        if(city == null) return res.send("user doesnt exist")
        return res.send(city)
    })
});

app.get('/test6', (req, res) => {
    licenselib.RetrieveLicenses("email1",(license)=>{
        if(license == null) return res.send("user doesnt exist")
        return res.json(license)
    })
});



app.get('/testnewuser', (req, res) => {


    database.NewUser({
        email:"email1",
        password: "passwrod",
        hwid: "hwid",
        payment:"paypal",
        discord:"gtaurbissh",
        extra: JSON.stringify({
            license:{sadasv7:"yes"},
            hwid_change_left: 2,
            city: "unset"
        })     
    },
    (status)=> {
        switch(status){
            case "success":
                return res.send("success");
            case "missing a field in schema":
                return res.send("missing a field in schema");
            case "missing a field in extra":
                return res.send("missing a field in extra");
            case "user with the same email already exists":
                return res.send("user with the same email already exists");
            default:
                return res.send("failed")
        }
        
    })
    
});

app.get('/testnewtester', (req, res) => {


    database.NewUser({
        email:"email2",
        password: "passwrod",
        hwid: "hwid",
        payment:"paypal",
        discord:"gtaurbissh",
        vouched: "default not vouched",
        extra: JSON.stringify({
            license:{sadasd:"yes"},
            hwid_change_left: 2,
            city: "unset"
        })     
    },
    (status)=> {
        switch(status){
            case "success":
                return res.send("success");
            case "missing a field in schema":
                return res.send("missing a field in schema");
            case "missing a field in extra":
                return res.send("missing a field in extra");
            case "user with the same email already exists":
                return res.send("user with the same email already exists");
            default:
                return res.send("failed")
        }
        
    })
    
});



//version

app.post('/loaderversion', (req, res) => {
    let decrytped = DecryptPostObject(req.body,"abcdefghijklmnop","abcdefghijklmnop","abcdefghijklmnop")
    console.log(decrytped)
    RespondString(loaderversion,decrytped.time, res)
});

//logins

app.post('/loader/login', (req, res) => {

    let decrytped = DecryptPostObject(req.body,"abcdefghijklmnop","abcdefghijklmnop","abcdefghijklmnop")
    console.log(decrytped)

    database.User.findOne({email: decrytped.payload.email}, function (err, user) { 
        if(user == null) return RespondObject({license: "login fail"},decrytped.time,res)
        
        if(user.password == decrytped.payload.password){

            database.ValidateAllExtraFields(decrytped.payload.email)
            setTimeout(()=>{
                database.RetrieveExtrabyEmail(decrytped.payload.email, (extra) =>{
                    if(extra == null) return RespondObject({license: "fail"}, decrytped.time, res)

                    if(extra.city == "unset") locationlib.SetLocation(decrytped.payload.email, decrytped.payload.city, (status)=>console.log(`${decrytped.payload.email} ${status}`))
                    
                    let resobj = {
                        license: JSON.stringify(extra.license),
                        hwid: user.hwid,
                        city: extra.city,
                        payment: user.payment,
                        discord: user.discod
                    }
                    return RespondObject(resobj, decrytped.time, res)
                })

            }, 1500);
            
        } 

        if(user.password != decrytped.payload.password) return RespondObject({license: "wrong password"},decrytped.time,res)
    });


    
});


app.post('/sadasv7/login', (req, res) => {

    let decrytped = DecryptPostObject(req.body,"abcdefghijklmnop","abcdefghijklmnop","abcdefghijklmnop")
    console.log(decrytped)

    loginlib.IsLoginSucessbyEmailPass(decrytped.payload.email,decrytped.payload.password,(loginsucess)=>{
        if(!loginsucess) return RespondString("login failed",decrytped.time, res)

        hwidlib.RetrieveHWIDbyEmail(decrytped.payload.email,(hwid)=>{ 
            if(hwid != decrytped.payload.hwid) return RespondString("login failed",decrytped.time, res)

            locationlib.RetrieveLocation(decrytped.payload.email, (city) => { 
                if(city != decrytped.payload.city) return RespondString("login failed",decrytped.time, res)
                
                discordlib.LogToChannel(`${decrytped.payload.email} is logging in sadas v7`)
                return RespondString("login sucess",decrytped.time, res)
            })

        })
    })
    
});


app.post('/asd/login', (req, res) => {

    let decrytped = DecryptPostObject(req.body,"abcdefghijklmnop","abcdefghijklmnop","abcdefghijklmnop")
    console.log(decrytped)

    loginlib.IsLoginSucessbyEmailPass(decrytped.payload.email,decrytped.payload.password,(loginsucess)=>{
        if(!loginsucess) return RespondString("login failed",decrytped.time, res)

        hwidlib.RetrieveHWIDbyEmail(decrytped.payload.email,(hwid)=>{ 
            if(hwid != decrytped.payload.hwid) return RespondString("login failed",decrytped.time, res)

            locationlib.RetrieveLocation(decrytped.payload.email, (city) => { 
                if(city != decrytped.payload.city) return RespondString("login failed",decrytped.time, res)
                
                discordlib.LogToChannel(`${decrytped.payload.email} is logging in sad`)
                return RespondString("login sucess",decrytped.time, res)
            })

        })
    })
    
});





//download

app.post('/generatedownload/', function(req, res) {

    let decrytped = DecryptPostObject(req.body,"abcdefghijklmnop","abcdefghijklmnop","abcdefghijklmnop")
    console.log(decrytped)

    discordlib.LogToChannel(`${decrytped.payload.email} trying to download ${decrytped.payload.programname} from ${decrytped.payload.city}`)

    let licensename;
    let filename;
    
    switch(decrytped.payload.programname){
        case "asdasd":
            licensename = "d-license";
            filename = "asd";
            break;

        case "sad":
            licensename = "asd";
            filename = "asd";
            break;
        default:
            return res.end()
    }
    
    loginlib.IsLoginSucessbyEmailPass(decrytped.payload.email,decrytped.payload.password,(loginsucess)=>{ 
        if(!loginsucess) return RespondString("login failed",decrytped.time, res)

        hwidlib.RetrieveHWIDbyEmail(decrytped.payload.email,(hwid)=>{ 
            if(hwid != decrytped.payload.hwid) return RespondString("wrong hwid",decrytped.time, res)

            locationlib.RetrieveLocation(decrytped.payload.email, (city) => { 
                if(city != decrytped.payload.city) return RespondString("wrong location",decrytped.time, res)
                
                licenselib.HasLicenseField(decrytped.payload.email, licensename, (haslicensefield)=>{
                    if(!haslicensefield) return RespondString("doesnt have license",decrytped.time, res)
                    
                    licenselib.IsLicenseExpired(decrytped.payload.email, licensename, (LicenseExpired)=>{
                        if(LicenseExpired) return RespondString("doesnt have license",decrytped.time, res)
                        
                        let id = downloaderlib.generateDownloadID(filename)
                        return RespondString(id, decrytped.time, res)
                    })
                })

            })

        })
    })
  
});
  

app.get('/downloadcheat/:id', (req, res) => {

    downloaderlib.downloadcheat(req.params.id, res)
});




//sadas v7

app.post('/getweaponconfig', (req, res) => {

    let decrytped = DecryptPostObject(req.body,"abcdefghijklmnop","abcdefghijklmnop","abcdefghijklmnop")
    RespondObject({
        weapon_configs: configlib.getConfigsForAllWeapons()
    },decrytped.time,res)

    //deleted for private use
    //
    // let decrytped = DecryptPostObject(req.body,"abcdefghijklmnop","abcdefghijklmnop","abcdefghijklmnop")
    // console.log(decrytped)

    // loginlib.IsLoginSucessbyEmailPass(decrytped.payload.email,decrytped.payload.password,(status)=>{
        
    //     licenselib.HasLicenseEqualSth(decrytped.payload.email,"sadasv7_tester","yes",(isSuccess)=>{
    //         console.log(isSuccess)

    //         if(isSuccess) return RespondObject({
    //             weapon_configs: configlib.getConfigsForAllWeapons()
    //         },decrytped.time,res)
            
    //         return RespondObject({},decrytped.time,res)

    //     })

    // })

    
});

app.post('/sadasv7/watchads', (req, res) => {

    let decrytped = DecryptPostObject(req.body,"abcdefghijklmnop","abcdefghijklmnop","abcdefghijklmnop")
    console.log(decrytped)

    licenselib.HasLicenseField(decrytped.payload.email, "sadasv7_skipads_license", (hasfield)=>{

        if(!hasfield) return RespondString("no bypass", decrytped.time, res);
        
        if(hasfield){

            licenselib.IsLicenseExpired(decrytped.payload.email, "sadasv7_skipads_license", (isexpired)=>{
        
                let reply = isexpired? "no bypass" : "yes bypass"
        
                return RespondString(reply, decrytped.time, res)
        
            })
        }

    })

    
});

app.get('/sadasv7/getadslink', (req, res) => {

    function randomNoRepeats(array) {
        var copy = array.slice(0);
        return function() {
          if (copy.length < 1) { copy = array.slice(0); }
          var index = Math.floor(Math.random() * copy.length);
          var item = copy[index];
          copy.splice(index, 1);
          return item;
        };
      }
    
    let links = randomNoRepeats(ADSlinks)
    
    
    RespondObject({
        link1: links(),
        link2: links(),
        link3: links()
    },"abcdefghijklmnop",res)


});


//asd configs
app.get('/asd/sad', (req, res) => {

    let configs = configlib.getConfigsForAllWeapons() 
    let text = ""
    configs.forEach(config=>{ 

        if(config.methodC == null) return;
        
        text += "==========================<br/>"
        text += `weapon: ${config.WeaponName}<br/>`
        text += `sens: ${config.sens_vertical} ${config.sens_horizontal} ${config.sens_ads}<br/>`
        text += `display settings and weapon attachments: same as my settings in my youtube videos<br/>`
        text += `attachments: ${config.attachments}<br/>`
        text += `notes: ${config.notes}<br/>`
        text += `shakness: ${config.methodC.mouseX[1]}<br/>`
        text += `horizontal drag: ${config.methodC.mouseX[0] + config.methodC.mouseX[5]}<br/>`
        text += `vertical drag: ${config.methodC.mouseY[0] + config.methodC.mouseY[5]}<br/>`
        text += `sleep1: ${config.methodC.sleep1 + config.methodC.sleep6}<br/>`
        text += `sleep2: ${config.methodC.sleep2}<br/>`
        text += `extra horizontal drag: ${config.methodC.thread2_mouseX}<br/>`
        text += `extra vertical drag: ${config.methodC.thread2_mouseY}<br/>`
        text += `extra sleep: ${config.methodC.thread2_sleep}<br/>`
        text += "==========================<br/>"
        text += "<br/><br/><br/>"
    })

    res.send(text)
});


//admin panel
app.get('/admin/:key', (req, res) => {

    if(req.params.key == "boi"){

        database.User.find({}, function (err, users) {
            if(users == null) return;
            
            return res.send(JSON.stringify(users))
        });
        
    }
});




//test stuff
var testingjs = require('./testing.js');





app.get('*', (req, res) => {
    //res.sendFile(path.join(__dirname+'/client/build/index.html'));
    res.end()
});




const port = process.env.PORT || 5000;
app.listen(port);
  
console.log(`listening on ${port}`);



function DecryptPostObject(obj, decryptdatakey, decryptdatekey, decryptpacketkey){

  var resobj = {}  

  var s_l1 = encryptionLib.decrypt(obj.bushit, decryptpacketkey)
  //console.log(s_l1)
  var l1 = JSON.parse(s_l1);

  //console.log(l1["payload"])

  var s_payload = encryptionLib.decrypt(l1["payload"], decryptdatakey);
  var payload = JSON.parse(s_payload)
  resobj["payload"] = payload

  var s_time = encryptionLib.decrypt(l1["time"], decryptdatekey)
  resobj["time"] = s_time

  //console.log(payload.email)
  //console.log(payload.password)
  //console.log(payload.filename)
  //console.log(s_time)

  return resobj;
}

function RespondObject(obj,key,res){
    let j = JSON.stringify(obj)
    let restext = encryptionLib.encrypt(j, key)
    res.send(restext)
}

function RespondString(words,key,res){
    let restext = encryptionLib.encrypt(words, key)
    res.send(restext)
}

function JSONtoObject(path){
    var obj = JSON.parse(fs.readFileSync(path, 'utf8'));
    return obj
}






