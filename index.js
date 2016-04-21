console.log("Init function");

var domain = "bmsg.io";
var Promise = require('promise');
var redis = require("redis");
var random = require('random-seed');
var validUrl = require('valid-url');
var client;

var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+=";

function toBase64(number) {
    if (isNaN(Number(number)) || number === null ||
        number === Number.POSITIVE_INFINITY)
        throw "The input is not valid";
    if (number < 0)
        throw "Can't represent negative numbers now";

    var rixit;
    var residual = Math.floor(number);
    var result = '';
    while (true) {
        rixit = residual % 64;
        result = alphabet.charAt(rixit) + result;
        residual = Math.floor(residual / 64);
        if (residual == 0)
            break;
    }
    return result;
}

function getFromRedis(key) {
    return new Promise(function(resolve, reject) {
        client.get(key, function(err, reply) {
            if(err) {
                reject(err);
            } else {
                resolve(reply);
            }
        })
    });
}

/**
 * Try to save a new key with the given value on Redis, if the key already exists the promise will
 * be rejected.
 * @param {String} key Of the value
 * @param {String} value To store in Redis
 * @param {String} [expiration] in seconds
 * @returns {Promise} Promise will be rejected if the calls to redis fail or if the key already
 * exists
 */
function setOnRedis(key, value, expiration) {
    return new Promise(function(resolve, reject) {
        getFromRedis(key).then(function(reply) {
            if(reply) {
                reject("Key already exists");
            } else {
                var callback = function (err, replies) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(replies);
                    }
                };
                if (expiration) {
                    client.setex(key, expiration, value, callback)
                } else {
                    client.set(key, value, callback)
                }
            }
        }, function(err) {
            reject(err);
        })
    });
}

function getRandomKey() {
    var rand = random.create(new Date().getTime());
    var number = rand.range(1073741824);
    rand.done();
    return toBase64(number);
}

exports.shortener = function(event, context, callback) {
    client = redis.createClient({
        host: event.redis.host,
        port: event.redis.port
    });
    console.log("Running function");
    client.on("error", function (err) {
        console.log("Error " + err);
    });
    if (event.url) {
        if (!validUrl.isUri(event.url)){
            callback("InvalidUrl");
            client.quit();
            return;
        }
        var key = getRandomKey();
        var success = function() {
            var result = {};
            var currentDomain = event.host ? event.host : domain;
            result.url = "http://" + currentDomain + "/" + key;
            console.log(result);
            callback(null, result);
            client.quit();
        };
        var fail = function(err) {
            console.log(err);
            key = getRandomKey();
            console.log("Retry with key: " + key);
            setOnRedis(key, event.url, event.expiration).then(success, fail);
        };
        setOnRedis(key, event.url, event.expiration).then(success, fail);
    }
    else if (event.id) {
        client.get(event.id, function(err, reply) {
            if (reply == null) {
                callback("NotFound");
            } else {
                callback(null, reply);
            }
            client.quit();
        });
    } else {
        console.log("Empty Call");
        callback("NotFound");
        client.quit();
    }
    console.log("End function");
};