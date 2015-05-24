var fs = require('fs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

fs.readFile("./gmail-app-passwd", function(e, appPasswd){
  if(e){
    console.log(e);
    return;
  }
  var transport = nodemailer.createTransport(smtpTransport({
    service: "gmail",
    auth: {
      user: "tyler.v@gmail.com",
      pass: appPasswd
    }
  }));
  var knownCaptures = {};
  var watcher = fs.watch('/tmp/motion', {persistent: true});
  console.log("Watching /tmp/motion");
  watcher.on('change', function(e, filename){
      fs.readdir(function(e,files){
        var newMpgFiles = files.filter(function(f){
          return f.indexOf('mpg') > -1 && !knownCaptures[f];
        });
        if(newMpgFiles.length > 0){
          newMpgFiles.forEach(function(f){
            var mailOptions = {
             attachments: [
              {
               fileName:"capture.mpg",
               filePath:"/tmp/motion/"+f
              }
             ],
             from:"tyler.v@gmail.com",
             to:"2067472820@mms.att.net"
            };
            transport.sendMail(mailOptions,function(e,response){
              if(e){
               console.error(e);
              } else {
               console.log("Text message sent");
              }
            });
          });
        }
      });
  });
})


