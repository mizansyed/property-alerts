var superagent = require('superagent')
var cronConfig = require('../modules/setting.js')('default').cron;
var cronJob = require('cron').CronJob;

exports.index = function(req, res, next){

    var job = new cronJob({
        cronTime: cronConfig.frequency,
        onTick: function() {
            var sa = superagent.get(cronConfig.service_url);
            sa.end();
        },
        start: true
    });
    job.start();

    res.render('index', {
        locals: {
            title: 'Property Alert'
        }
    });

};


