console.log("Init function");

var Promise = require('promise');
var redis = require("redis");
var client;

var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+=";

function toBase64(number) {
    if (isNaN(Number(number)) || number === null ||
        number === Number.POSITIVE_INFINITY)
        throw "The input is not valid";
    if (number < 0)
        throw "Can't represent negative numbers now";

    var rixit; // like 'digit', only in some non-decimal radix
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

exports.shortener = function(event, context, callback) {
    client = redis.createClient({
        host: event.redis.host,
        port: event.redis.port
    });
    var start = event.offset;
    var end = start + event.limit;
    if (start > 1073741824) {
        callback(null, {});
        client.quit();
    }
    if (end > 1073741824) {
        end = 1073741824;
    }
    var response = {};
    var next = function(key) {
        console.log (key);
        getFromRedis(key).then(function(reply) {
            start++;
            if (reply) {
                response[key] = reply;
            }
            if (start < end) {
                var nextKey = toBase64(start);
                next(nextKey);
            } else {
                callback(null, response);
                client.quit();
            }
        });
    };
    var firstKey = toBase64(start);
    next(firstKey);
};