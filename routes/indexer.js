var async = require('async');
var Repository = new require('../modules/repository.js');
var property = require('../modules/property.js');
var path = require('path');
var Emailer = new require('../modules/emailer.js');
var UrlShortener = require('../modules/urlshortener.js');

exports.index = function(req, res, next) {
    var cbResults = {};
    var alertedProp = [];
    async.waterfall([
        function (callback) {
            property.properties(function (err, list_result) {
                if (err) return callback(err);
                cbResults.properties = list_result;
                callback(null, cbResults.properties);
            });
        },
        function (props, callback) {
            new Repository().saveToDb(props, function (err, db_result) {
                if (err) return callback(err);
                cbResults.saveResult = db_result;});
                callback(null, props);
        },
        function (props, callback) {
            new Repository().getUnalertedProperties(function (err, db_result) {
                if (err) return callback(err);
                cbResults.alertedProperties = db_result;
                callback(null, db_result);
            });
        },
        function (props, callback) {
            if (props === null) return callback(null);
            props.forEach(function(property) {
                var urls = new UrlShortener();
                urls.shorten(property['details_url'], function(err, url){}) ;
                urls.on('Shortend', function(data){
                    property['url'] = data;
                    var emailer = new Emailer();
                    emailer.sendPropertyAlert(property, function (err, email_result) {
                        if (err) return callback(null);
                        cbResults.emailResult = email_result;
                    });
                    emailer.on('AlertSent', function(alertedProperty)
                    {
                        new Repository().updateAlertedProperty(alertedProperty, function (err, db_result) {})
                    });

                });

            })
            callback(null, props);
        }

    ],  function (err, result) {
        res.render('indexer');
    });
};