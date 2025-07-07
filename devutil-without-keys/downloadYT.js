// Downloads all the YT videos so that colorerBatch and beatBatch can work on them.

require(`dotenv`).config({
  path: '../.env'
})

const { db } = require(`../server/db`);
const ytdl = require("ytdl-core");
const fs = require(`fs`)

db.awaitConnected().then(async () => {
  const tracks = await db.tracks.find({
    "ytID": { $exists: true },
  }).toArray()

  const ytIDs = [...new Set(tracks.map((t) => t.ytID))]

  for (let i = 0; i < ytIDs.length; i++) {
    const outputFile = `${ytIDs[i]}.mp4`;

    if(fs.existsSync(`./ytvids/${outputFile}`)) {
      continue;
    };
    
    console.log(outputFile)

    const stream = ytdl(`https://youtube.com/watch?v=` + ytIDs[i], { filter: "audioandvideo", quality: "lowestvideo" });

    stream.pipe(fs.createWriteStream(`./ytvids/${outputFile}`))
  }
})