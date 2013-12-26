var async = require('async');
var Repository = new require('../modules/repository.js');
var property = require('../modules/property.js');
var path = require('path');

    
exports.index = function(req, res, next) {
    var locals = {title: 'Property'};
    var cbResults = {};
    var urls = [];
    async.parallel(
        [
            function(callback){
                new Repository().getLatestProperties(function (err, db_result) {
                    if (err) return callback(err);
                    locals.properties = db_result;
                    callback(null, db_result);
                });
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