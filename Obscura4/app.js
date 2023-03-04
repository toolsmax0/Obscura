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
let file;
let isExpired = false;

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
  console.log(Date()+': '+err.message);
});
function download(){
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
    }
  ).on("error", async (err) => {
    console.log(Date()+': '+err.message);
    console.log(Date()+': '+'Retrying in 5 seconds');
    //wait 5 seconds and try again
    // await new Promise(resolve => setTimeout(resolve, 5000));
    setTimeout(download, 5000);
  });
}

var expireTime = new Date(process.env.EXPIRE_TIME);

if (expireTime < new Date()) {
  isExpired = true;
  console.log(Date()+": Cookie Expired");
  fs.createReadStream("collection.csv").pipe(parser);
} else {
  file = fs.createWriteStream("collection.csv");
  download();
}

function analyzeDeck(deck) {
  var deckList = deck.split("\n");
  var cnt = 0;
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
    } else {
      cnt += Math.min(dict[name] - count, 0);
    }
  }
  let ans = cnt.toString();
  if(isExpired){
    ans = "!! "+ans+" !!";
  }
  return ans;
}

const server = http.createServer((req, res) => {
  let s = "";
  req
    .on("data", (chunk) => {
      s += chunk;
    })
    .on("error", (err) => {
      console.log(Date()+': '+"error: " + err);
    })
    .on("end", () => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end(analyzeDeck(s));
    });
});

server.listen(port, hostname, () => {
  //log PID
  console.log(Date()+': '+`PID: ${process.pid}`);
  console.log(Date()+': '+`Server running at http://${hostname}:${port}/`);
});
