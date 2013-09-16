/**
 * Extension:
 * - added http agent support
 * - added catch for json parse exception
 */


/**
 * Module dependencies.
 */
var https = require("https");
var url = require("url");
var util = require("util");
var btceCore = require("btce");
var winston = require("winston");
var log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, level: "debug"})
  ]
});

module.exports = BTCE;

util.inherits(BTCE, btceCore);

function BTCE(params) {
  if (!params) params = {};

  this.key = params.key;
  this.secret = params.secret;
  this.agent = params.agent;

  this.urlPost = "https://btc-e.com:443/tapi";
  this.urlGet = "https://btc-e.com:443/api/2/";
  this.nonce = this.getTimestamp(Date.now());
}

BTCE.prototype.getHTTPS = function (getUrl, callback) {
  var options = url.parse(getUrl);
  options.method = "GET";
  options.agent = this.agent;
  var req = https.request(options, function (res) {
    var data = "";
    res.setEncoding("utf8");
    res.on("data", function (chunk) {
      data += chunk;
    });
    res.on("end", function () {
      var jsonData, err;
      try {
        err = false
        jsonData = JSON.parse(data);
      } catch (e) {
        err = data;
        jsonData = null;
      }
      callback(err, jsonData);
    });
  });

  req.on("error", function (err) {
    callback(err, null)
  });

  req.end();
};

/**
 * query: Executes raw query to the API
 *
 * @param {String} method
 * @param {Object} params
 * @param {Function} callback(err, data)
 */
BTCE.prototype.query = function (method, params, callback) {
  var _this = this
  var content = {
    'method': method,
    'nonce': ++this.nonce,
  }

  if (!!params && typeof(params) == 'object') {
    Object.keys(params).forEach(function (key) {
      if (key == 'since' || key == 'end') {
        value = _this.getTimestamp(params[key])
      }
      else {
        value = params[key]
      }
      content[key] = value
    })
  }

  content = querystring.stringify(content)

  var sign = crypto
    .createHmac('sha512', new Buffer(this.secret, 'utf8'))
    .update(new Buffer(content, 'utf8'))
    .digest('hex')

  var options = url.parse(this.urlPost)
  options.method = 'POST';
  options.agent = this.agent;
  options.headers = {
    'Key': this.key,
    'Sign': sign,
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': content.length,
  }

  var req = https.request(options, function (res) {
    var data = ''
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
      data += chunk
    })
    res.on('end', function () {
      var jsonData, err;
      try {
        err = false
        jsonData = JSON.parse(data);
      } catch (e) {
        err = data;
        jsonData = null;
      }
      callback(err, jsonData);
    })
  })

  req.on('error', function (err) {
    callback(err, null)
  })

  req.write(content)
  req.end()
}