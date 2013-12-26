
var setting = function(env)
{
    if (!env) {
        env = process.env.NODE_ENV || 'default';
    }

    var yamlConfig = require('yaml-config');
    var settings = yamlConfig.readConfig('./config/application.yaml', env);
    return settings;
}

module.exports = setting