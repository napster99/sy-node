'use strict';

const co = require('co');
const redis = require('redis');
const wrapper = require('co-redis');

var defaultProps = {
    port: 6379,
    host: 'localhost',
    opts: {}
}

var redisSettings = {}

if (process.env.APP_ENV == 'prerelease') {
    redisSettings = {
        'Cache': {
            host: 'localhost',
            auth: 'root',
            port: 6379,
            opts: {}
        },
        'Storage': {
            host: 'localhost',
            auth: 'root',
            port: 6379,
            opts: {}
        },
        'User': {
            host: 'localhost',
            auth: 'root',
            port: 6379,
            opts: {}
        }
    }
}

//
if (process.env.APP_ENV == 'master' || process.argv[2] == 'master') { //线上
    redisSettings = {
        'Cache': {
            host: 'localhost',
            port: 6379,
            opts: {
                'password': 'XXXX',
                'no_ready_check': true
            }
        },
        'Storage': {
            host: 'localhost',
            port: 6379,
            opts: {
                'password': 'XXXX',
                'no_ready_check': true
            }
        },
        'User': {
            host: 'localhost',
            port: 6379,
            opts: {
                'password': 'XXXX',
                'no_ready_check': true
            }
        }
    }
}


function Redis(options) {

    if (process.env.APP_ENV == 'local' || (!process.env.APP_ENV && process.argv[2] != 'master')) {
        this.options = Object.assign(defaultProps, options);
        var client = this.initRedis();
        client.on('connect', function() {});
    } else {
        var clientObj = this.initRedis();
        this.clientObj = clientObj;
    }

    var cacheClient = null;
    var storageClient = null;
    var userClient = null;

    if (process.env.APP_ENV == 'local' || (!process.env.APP_ENV && process.argv[2] != 'master')) {
        cacheClient = client;
        storageClient = client;
        userClient = client;
    } else {
        cacheClient = this.clientObj['Cache'];
        storageClient = this.clientObj['Storage'];
        userClient = this.clientObj['User'];
    }


    this.setSessionToRedis = function(uid, username, isAdmin) {

    }
}

Redis.prototype.initRedis = function() {
    return this.createClient();
}

Redis.prototype.createClient = function() {
    if (process.env.APP_ENV == 'local' || (!process.env.APP_ENV && process.argv[2] != 'master')) {
        return wrapper(this.client = redis.createClient(
            this.options['port'], this.options['host'], this.options['opts']));
    } else {
        var redisObj = {};
        for (var i in redisSettings) {
            redisObj[i] = wrapper(redis.createClient(
                redisSettings[i]['port'], redisSettings[i]['host'], redisSettings[i]['opts']));
        }
        return redisObj;
    }
}

var redisInstance = new Redis();

module.exports.redisInstance = redisInstance;