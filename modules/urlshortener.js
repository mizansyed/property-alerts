var googl = require('goo.gl');
var util = require("util");
var events = require("events");

function UrlShortener() {
    events.EventEmitter.call(this);
}

util.inherits(UrlShortener, events.EventEmitter);


UrlShortener.prototype.shorten =  function(urlToShorten, callback) {
    var self = this;
    googl.shorten(urlToShorten, function (shortUrl) {
        //if (!shortUrl || shortUrl.length == 0) callback(new Error('Cannot shorten'), null);
        callback(null,shortUrl.id);
        self.emit("Shortend", shortUrl.id);
    });
}

module.exports = UrlShortener