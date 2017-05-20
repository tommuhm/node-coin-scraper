/**
 * Module dependencies.
 */
var _ = require("lodash");
var mongoose = require("mongoose");
var BtceUtil = require("./btce-util");
var winston = require("winston");
var log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, level: "debug"})
  ]
});

mongoose.connect("mongodb://localhost/coin_btce");
var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

var trade = new mongoose.Schema({
  _id: Number,
  date: Date,
  price: Number,
  amount: Number,
  trade_type: String
}, {versionKey: false});

var tradeInfo = new mongoose.Schema({
  _id: Number,
  date: Date,
  currency: String,
  counter_currency: String
}, {versionKey: false});


var PairModel = {};
_.forEach(BtceUtil.getPairs(), function (pair) {
  PairModel[pair] = mongoose.model(pair, trade, pair);
});

var firstTrade;

var DB = {
  PairModel: PairModel,
  TradeInfo: mongoose.model("TradeInfo", tradeInfo, "trades"),

  saveTrades: function (pair, trades, rescrap) {
    var that = this;

    // transform to trades model
    _.map(trades, function (trade) {
      trade._id = trade.tid;
      trade.date = trade.date * 1000;
      trade.currency = trade.price_currency;
      trade.counter_currency = trade.item;
    });

    // check for missing trades - send notification if there are any
    if (firstTrade === undefined) {
      if (pair === "btc_usd") {
        firstTrade = _.first(trades);
      }
    } else {
      that.findLast(that.TradeInfo, function (err, lastTrade) {
        that.getCount(that.TradeInfo, {_id: {$gt: firstTrade._id}}, function (err, tradeCount) {
          var missingTradeCount = lastTrade._id - firstTrade._id - tradeCount;
          if (missingTradeCount > 0) {
            log.warn("There are some trades missing count: " + missingTradeCount);
          }
        });
      });
    }

    that.bulkInsert(that.TradeInfo, trades, function (err) {
    });

    that.getCount(that.PairModel[pair], {}, function (err, oldCount) {
      that.bulkInsert(that.PairModel[pair], trades, function (err) {
        that.getCount(that.PairModel[pair], {}, function (err, newCount) {
          var tradesInserted = newCount - oldCount;
          if (tradesInserted > 0) {
            log.debug("pair: " + pair + " new trades: " + tradesInserted);
            if (tradesInserted === trades.length) {
              rescrap();
              log.debug("pair: " + pair + " re-scraping with max count: 2000");
            }
          }
        });
      });

    })
  },
  bulkInsert: function (model, models, cb) {
    model.create(models, cb);
  },
  findFirst: function (model, cb) {
    model.findOne({}, null, {sort: {_id: 1}}, cb);
  },
  findLast: function (model, cb) {
    model.findOne({}, null, {sort: {_id: -1}}, cb);
  },
  getCount: function (model, criteria, cb) {
    model.count(criteria, cb);
  }
};

module.exports = DB;