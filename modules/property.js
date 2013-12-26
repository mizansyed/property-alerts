var superagent = require('superagent')
var async = require('async');
var accounting = require('accounting');
var zoopla = require('../modules/setting.js')('default').zoopla;
var util = require("util");
var events = require("events");

function Property() {
    events.EventEmitter.call(this);
};

util.inherits(Property, events.EventEmitter);

Property.prototype.properties = function(callback) {
    var self = this;
    var sa = superagent.get('http://api.zoopla.co.uk/api/v1/property_listings.json');
    sa.query(zoopla);
    sa.end(function(err, res){
        if (err) {
            return callback(err, null);
        }

        if (res.ok) {
            callback(null, res.body.listing);
            self.emit('apiDataAvailable', res.body.listing)
        } else {
            callback(null);
        }
    });
};

Property.prototype.attributes = function(callback){
    var data = zoopla;
    data.min_price_in_pound = accounting.formatMoney(data.minimum_price, "£ ", 0);
    data.max_price_in_pound = accounting.formatMoney(data.maximum_price, "£ ", 0);
    return callback(null, data);
}

var property = new Property();
module.exports = property;