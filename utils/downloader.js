//config
var configlib = require('./config.js');

var downloadrequestlist = {};

function generateDownloadID(programname){

    let id = generate_string(15)
    downloadrequestlist[id] = programname
    
    console.log(`requesting download ${programname}`)
    console.log(downloadrequestlist)
    return id
}

function download(id, res){
    let filename = downloadrequestlist[id]

    delete downloadrequestlist[id]
  
    console.log(`downloader with id ${id} correspond to ${filename} deleted`)

    switch(filename){

    }
    
    
}




function generate_string(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}



module.exports = {
    generateDownloadID,
    downloadcheat,
    generate_string
}
