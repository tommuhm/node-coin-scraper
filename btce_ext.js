var https = require('https');
var url = require('url');
var util = require('util');
var BTCE_CORE = require('btce');
var cur = require('./btce_currencies');

module.exports = BTCE;

util.inherits(BTCE, BTCE_CORE);

function BTCE(params) {
    if (!params) params = {};

    this.key = params.key;
    this.secret = params.secret;
    this.agent = params.agent;

    this.urlPost = 'https://btc-e.com:443/tapi';
    this.urlGet = 'https://btc-e.com:443/api/2/';
    this.nonce = this.getTimestamp(Date.now());

    this.currency_pairs = [
        [cur.BTC, cur.USD],
        [cur.BTC, cur.RUR],
        [cur.BTC, cur.EUR],
        [cur.LTC, cur.BTC],
        [cur.LTC, cur.USD],
        [cur.LTC, cur.RUR],
        [cur.NMC, cur.BTC],
        [cur.USD, cur.RUR],
        [cur.EUR, cur.USD],
        [cur.NVC, cur.BTC],
        [cur.TRC, cur.BTC],
        [cur.PPC, cur.BTC],
        [cur.FTC, cur.BTC],
        [cur.CNC, cur.BTC]
    ];
}

BTCE.prototype.getHTTPS = function (getUrl, callback) {
    var options = url.parse(getUrl);
    options.method = 'GET';
    options.agent = this.agent;
    var req = https.request(options, function (res) {
        var data = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            callback(false, JSON.parse(data));
        });
    });

    req.on('error', function (err) {
        callback(err, null)
    });

    req.end();
}

BTCE.prototype.getPairs = function () {
    var pairs = new Array();
    for (var i in this.currency_pairs) {
        pairs.push(this.currency_pairs[i].join('_').toLowerCase());
    }
    return pairs;
}

