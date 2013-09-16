/**
 * Module dependencies.
 */
var BTCE = require("./btce-ext");
var BtceUtil = require("./btce-util");
var db = require("./db.js");
var HttpsAgent = require("agentkeepalive").HttpsAgent;
var winston = require("winston");
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


function printCallback(err, data) {
  if (!err) {
    console.log(data);
  } else {
    console.error(err);
  }
}

function saveToDb(err, data) {
//  if (!err) {
//    db.updateTrades(data);
//  } else {
//    console.error(err);
//  }
}

function updatePair(pair) {
  btce.trades({pair: pair}, saveToDb);
}

BtceUtil.getPairs().forEach(updatePair);

//btce.ticker({pair: "btc_usd"}, printCallback);
//
//btce.fee({pair: "btc_usd"}, printCallback);
//
//btce.depth({pair: "btc_usd"}, printCallback);
//
//btce.trades({pair: "btc_usd", count: 2}, printCallback);

var i = 5;
var counter = setInterval(function () {
  if (i === 0) {
    clearInterval(counter);
  } else {
    i--;
    log.debug("sockets created: " + agent.createSocketCount);
    log.debug("requests finished: " + agent.requestFinishedCount);
    var count = 0;
    for (var k in agent.unusedSockets) {
      for (var l in agent.unusedSockets[k]) {
        ++count;
      }
    }
    log.debug("unused sockets: " + count);
    var count = 0;
    for (var k in agent.sockets) {
      for (var l in agent.sockets[k]) {
        ++count;
      }
    }
    log.debug("sockets: " + count);
  }
}, 1000);