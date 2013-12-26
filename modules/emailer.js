var nodemailer = require("nodemailer");
var mail = require('../modules/setting.js')('default').mail;
var alertsTo = require('../modules/setting.js')('default').alerts_to;
var util = require("util");
var events = require("events");

function Emailer()
{
    events.EventEmitter.call(this);
    this.smtpTransport = nodemailer.createTransport("SMTP",{
        host: mail.host,
        port: mail.port,
        auth: {
            user: mail.auth.user,
            pass: mail.auth.pass
        }
    });
};

util.inherits(Emailer, events.EventEmitter);

Emailer.prototype.sendPropertyAlerts = function (properties, callback){
    var self = this;
    for (var index in properties) {
        if (properties.hasOwnProperty(index)) {
            var message = "A property found: " + properties[index].displayable_address + ". Link is:" +  properties[index].url ;
            var mailOptions = {
                from: "Mizan Syed <mizansyed@withdigital.net>",
                to: alertsTo,
                subject: "Property Alert",
                html: message
            }
            self.send(mailOptions, callback)
        }
    };
}


Emailer.prototype.sendPropertyAlert = function (property, callback){

    var self = this;
    var message = "A property found: " + property['address'] + ". Link is: " +  property['url'] ;
    var mailOptions = {
        from: mail.from,
        to: alertsTo,
        subject: "Property Alert",
        html: message,
        additional: property
    }

    self.send(mailOptions, callback);
}


Emailer.prototype.send = function (mailOptions, callback){
    var self = this;
    self.smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            callback(error);
        }else{
            console.log("Message sent: " + response.message);
            self.emit("MailSent");
            callback(null, response.message)
        }
        self.emit("AlertSent", mailOptions.additional);
    });

};

module.exports =  Emailer;