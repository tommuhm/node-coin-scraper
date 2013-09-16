/**
 * Module dependencies.
 */
var HttpsAgent = require("agentkeepalive").HttpsAgent;
var BTCE = require("./btce-ext");
var db = require("./db");
var winston = require("winston");
var async = require("async");
var _ = require("lodash");
var log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, level: "debug"})
  ]
});

var agent = new HttpsAgent({
  maxSockets: 100,
  maxKeepAliveRequests: 0, // max requests per keepalive socket, default is 0, no limit.
  maxKeepAliveTime: 300000 // keepalive for 5 minutes
});
var btce = new BTCE({agent: agent});

var Scraper = function (pairs, time) {
  var that = this;
  that.count = 5;
  that.pairs = pairs;
  that.scheduleTimer = time;
  that.schedulerRunning = false;
  that.schedule = {};
};

Scraper.prototype.scrapPair = function (pair, count, cb) {
  var that = this;
  btce.trades({pair: pair, count: count}, function (err, trades) {
    that.scrapPairCb(err, pair, trades);
    cb && cb();
  });
};

Scraper.prototype.scrapPairs = function (count, cb) {
  var that = this;
  log.debug("starting pairs " + that.pairs);

  async.forEach(that.pairs,
    function (pair, asyncCb) {
      that.scrapPair(pair, count, asyncCb);
    }, function () {
      cb && cb();
    });
};

Scraper.prototype.runSchedule = function (pair, count) {
  var that = this;
  if (that.schedulerRunning === true) {
    function schedule() {
      that.schedule[pair] = setTimeout(function () {
        that.runSchedule(pair, that.count);
      }, that.scheduleTimer);
    }

    that.scrapPair(pair, count, schedule);
  }
};

//Scraper.prototype.runSchedule = function (count) {
//  var that = this;
//  if (that.schedulerRunning === true) {
//    that.scrapPairs(count, function () {
//      that.schedulerWaiting = setTimeout(function () {
//        that.runSchedule(10);
//      }, that.scheduleTimer);
//    })
//  }
//};

Scraper.prototype.startSchedule = function (cb) {
  var that = this;
  that.schedulerRunning = true;
  _.forEach(that.pairs, function (pair) {
    that.runSchedule(pair, 2000)
  });
  cb && cb();
};

Scraper.prototype.stopSchedule = function (cb) {
  var that = this;
  that.schedulerRunning = false;
  _.forEach(that.schedule, function (schedule) {
    clearTimeout(schedule);
  });
  cb && cb();
};

Scraper.prototype.scrapPairCb = function (err, pair, trades) {
  var that = this;
  if (err) {
    log.error("trades - error: " + pair);
    log.error(err);
  } else {
    function scrapMax() {
      that.scrapPair(pair, 2000);
    }
    db.saveTrades(pair, trades, scrapMax);
  }
}

module.exports = Scraper;