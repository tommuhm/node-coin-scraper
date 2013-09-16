// currencies
var c = {
  BTC: "BTC",
  LTC: "LTC",
  USD: "USD",
  EUR: "EUR",
  RUR: "RUR",
  NMC: "NMC",
  NVC: "NVC",
  TRC: "TRC",
  PPC: "PPC",
  FTC: "FTC",
};

var currency_pairs = [
  [c.BTC, c.USD],
  [c.BTC, c.RUR],
  [c.BTC, c.EUR],
  [c.LTC, c.BTC],
  [c.LTC, c.USD],
  [c.LTC, c.RUR],
  [c.LTC, c.EUR],
  [c.NMC, c.BTC],
  [c.NMC, c.USD],
  [c.NVC, c.BTC],
  [c.NVC, c.USD],
  [c.USD, c.RUR],
  [c.EUR, c.USD],
  [c.TRC, c.BTC],
  [c.PPC, c.BTC],
  [c.FTC, c.BTC],
];

module.exports = {
  getPairs: function () {
    var pairs = [];
    for (var i in currency_pairs) {
      pairs.push(currency_pairs[i].join('_').toLowerCase());
    }
    return pairs;
  }
};