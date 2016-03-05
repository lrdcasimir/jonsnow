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
  fs.readFile('./known-capture-index',function(e,data){
    if(!e){
      knownCaptures = JSON.parse(data);
    } 
  })
  var watcher = fs.watch('/tmp/motion', {persistent: true});
  console.log("Watching /tmp/motion");
  watcher.on('change', function(e, filename){
      fs.readdir('/tmp/motion/',function(e,files){
        var newMpgFiles = files.filter(function(f){
          return f.indexOf('jpg') > -1 && !knownCaptures[f];
        });
        if(newMpgFiles.length > 0){
          var knownCaptureIndex = fs.createWriteStream('./known-capture-index');
          knownCaptureIndex.end(JSON.stringify(knownCaptures));
          newMpgFiles.forEach(function(f){
            knownCaptures[f] = true;
            var mailOptions = {
             attachments: [
              {
               contentType:"image/jpeg",
               filename:"capture.jpg",
               path:"/tmp/motion/"+f
              }
             ],
             from:"tyler.v@gmail.com",
             to:"2067472820@mms.att.net,4252394186@mms.att.net"
            };
            transport.sendMail(mailOptions,function(e,response){
              if(e){
               console.error(e);
              } else {
               console.log("Text message sent /tmp/motion/"+ f);
               fs.unlink("/tmp/motion/"+f,function(e){
                console.error(e);
               });
              }
            });
          });
        }
      });
  });
});
