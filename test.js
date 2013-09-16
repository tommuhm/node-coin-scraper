/**
 * Module dependencies.
 */
var db = require("./db");
var Scraper = require("./ascraper");
var BtceUtil = require("./btce-util");
var BTCE = require("./btce-ext");
var winston = require("winston");
var moment = require("moment");
var _ = require("lodash");
var log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, level: "debug"})
  ]
});

db.findFirst(db.TradeInfo, function (err, first) {
  db.findLast(db.TradeInfo, function (err, last) {
    db.getCount(db.TradeInfo, function (err, count) {
      var missingTradeCount = last._id - first._id - count;
      if (missingTradeCount > 0) {
        log.warn("There are some trades missing count: " + missingTradeCount);
      }
    });
  });
});


//var btce = new BTCE();
//var start = moment();
//btce.trades({pair: "btc_usd", count: 100000}, function (err, trades) {
//  log.debug(trades.length);
//  log.debug(moment().milliseconds((_.first(trades)).date).format("YYYY.MM.DD HH:mm:ss"));
//  log.debug(moment(moment().diff(start)).format("mm[min] ss[sec] SSS[ms]"));
//});

//var scraper = new Scraper(BtceUtil.getPairs(), 5000);
////scraper.startSchedule();
//
//DB.findLastTrade("btc_usd", function (err, model) {
//  console.log(model);
//});
//
//scraper.scrapPairs(30, function () {
//  console.log("done");
//});