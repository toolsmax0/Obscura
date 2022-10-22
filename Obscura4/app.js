const http = require("http");
const https = require("https");
const parse = require("csv-parse");
const hostname = "127.0.0.1";
const port = 7191;
const fs = require("fs");
require("dotenv").config();
const basics = [
  "Plains",
  "Island",
  "Swamp",
  "Mountain",
  "Forest",
  "Wastes",
  "Snow-Covered Plains",
  "Snow-Covered Island",
  "Snow-Covered Swamp",
  "Snow-Covered Mountain",
  "Snow-Covered Forest",
];
var dict = {};
var parser = parse.parse();

parser.on("readable", () => {
  var record;
  while ((record = parser.read())) {
    if (dict[record[0]] == undefined) {
      dict[record[0]] = 0;
    }
    dict[record[0]] += parseInt(record[3]);
  }
});

parser.on("error", (err) => {
  console.log(err.message);
});
const file = fs.createWriteStream("collection.csv");

var expireTime = new Date(process.env.EXPIRE_TIME);

console.log("expire time: " + expireTime);
console.log("user id: " + process.env.USER_ID);
console.log("access token: " + process.env.USER_TOKEN);

if (expireTime < new Date()) {
  console.log("Expired");
  fs.createReadStream("collection.csv").pipe(parser);
} else {
  https.get(
    "https://mtgarena.pro/mtg/do3.php?cmd=export",
    {
      headers: {
        Cookie: [
          "MTGAPROUser=" + process.env.USER_ID,
          "MTGAPROUserToken=" + process.env.USER_TOKEN,
        ],
      },
    },
    (res) => {
      res.pipe(file);
      res.pipe(parser);
      console.log("statusCode:", res.statusCode);
      console.log("headers:", res.headers);
      file.on("finish", () => {
        file.close();
        // fs.createReadStream("collection.csv").pipe(parser);
      });
    }
  );
}

function analyzeDeck(deck) {
  var deckList = deck.split("\n");
  var cnt = 0;
  console.log("Deck ID: "+deck);
  for (var i = 0; i < deckList.length; i++) {
    if (deckList[i] == "") {
      continue;
    }
    var card = deckList[i].split(" ");
    var count = parseInt(card[0]);
    var name = card.slice(1).join(" ");
    if (basics.indexOf(name) != -1) continue;
    if (dict[name] == undefined) {
      cnt -= count;
      // console.log(name + " is missing " + count + " copies");
    } else {
      cnt += Math.min(dict[name] - count, 0);
      if (dict[name] < count) {
        // console.log(name + " is missing " + (count - dict[name]) + " copies");
      }
    }
  }
  return cnt.toString();
}

const server = http.createServer((req, res) => {
  let s = "";
  req
    .on("data", (chunk) => {
      s += chunk;
      // console.log("chunk: " + chunk);
    })
    .on("error", (err) => {
      console.log("error: " + err);
    })
    .on("end", () => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end(analyzeDeck(s));
    });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});