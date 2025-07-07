// Old script to take the spreadsheet of songs and insert it into the db

const fs = require('fs');
const csv = require('csv-parser');

const results = [];

function youtube_parser(url) {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}

function hmsToSecondsOnly(str) {
  var p = str.split(':'),
    s = 0, m = 1;

  while (p.length > 0) {
    s += m * parseInt(p.pop(), 10);
    m *= 60;
  }

  return s;
}

fs.createReadStream('vylet.csv')
  .pipe(csv(["Track name"]))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    const mapped = results.filter((m) => m._1 && m._1 != "Track name").map((r, i) => {
      return {
        title: r._1,
        ytID: youtube_parser(r._2),
        album: r._4,
        feat: r._5,
        startTime: hmsToSecondsOnly(r._6) || null,
        endTime: hmsToSecondsOnly(r._7) || null,
        id: i + 1
      }
    })
    console.log(mapped)

    fs.writeFileSync(`./mapped.json`, JSON.stringify(mapped))
  });