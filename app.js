/**
 * Module dependencies.
 */
var Scraper = require("./scraper");
var BtceUtil = require("./btce-util");
var winston = require("winston");
var log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, level: "debug"})
  ]
});

var pairs = BtceUtil.getPairs();
//var pairs = ["btc_usd"];

var scraper = new Scraper(pairs, 5000);
scraper.startSchedule(function () {
  log.debug("scraper started");
});

//setTimeout(function () {
//  scraper.stopSchedule(function () {
//    log.debug("scraper stopped");
//  });
//}, 120000);