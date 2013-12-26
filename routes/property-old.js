var async = require('async');
var Repository = new require('../modules/repository.js');
var property = require('../modules/property.js');
var path = require('path');
var Emailer = new require('../modules/emailer.js');
//var shorten = require('../modules/shorten.js');
var UrlShortener = require('../modules/urlshortener.js');
    
exports.index = function(req, res, next) {
    var locals = {title: 'Property'};
    var cbResults = {};
    var urls = [];
    async.series(
        [
            function(callback){
                async.waterfall([
                    function (callback) {
                        property.properties(function (err, list_result) {
                            if (err) return callback(err);
                            locals.properties = cbResults.properties = list_result;

                            callback(null, cbResults.properties);
                        });
                    },
                    function (props, callback) {
                        new Repository().saveToDb(props, function (err, db_result) {
                            if (err) return callback(err);
                            cbResults.saveResult = db_result;
                            callback(null, props);
                        });
                    },
                    function (props, callback) {

                        props.forEach(function(property) {
                            var urls = new UrlShortener();
                            urls.shorten(property['details_url'], function(err, url){}) ;
                            urls.on('Shortend', function(data){
                                property['url'] = data;
                                 new Emailer().sendPropertyAlert(property, function (err, email_result) {
                                 if (err) return callback(null);
                                 cbResults.emailResult = email_result;
                                });
                            });

                        })
                        callback(null, props);
                    }

                ], callback);
            },
            function(callback){
                property.attributes(function (err, data) {
                    if (err) return callback(err);
                    locals.search_meta = data;
                    callback(null, data);
                });
            }
        ],

        function(err, allResults) {
            if (err) return next(err);

            res.render('property', locals);
    });
};