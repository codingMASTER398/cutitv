// potion seller? more like,,,, lyric adder?
// Gets the lyrics from the database and sort of adds them to the the yeah.

require(`dotenv`).config({
  path: '../.env'
})

const { db } = require(`../server/db`);

function parseSyncedLyrics(synced) {
  return synced.replaceAll("\r", "").trim().split('\n').map(line => {
    const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\](.*)$/);
    if (!match) return null;

    const minutes = parseInt(match[1], 10);
    const seconds = parseFloat(match[2]);
    const lyric = match[3].trim();

    return {
      time: minutes * 60 + seconds,
      lyric
    };
  }).filter(Boolean);
}


db.awaitConnected().then(async () => {
  const tracksToAdd = await db.tracks.find({
    "lyricId": { $exists: true },
    "lyricsFormatted": { $exists: false }
  }).toArray()

  for (let i = 0; i < tracksToAdd.length; i++) {
    const track = tracksToAdd[i];

    const fetched = await (await fetch(`https://lrclib.net/api/get/${track.lyricId}`)).json()

    const lyrics = parseSyncedLyrics(fetched.syncedLyrics).map((a)=>{
      return {
        time: a.time - track.lyricOffset,
        lyric: a.lyric
      }
    });

    await db.tracks.updateOne({
      id: track.id
    }, {
      $set: {
        lyricsFormatted: lyrics
      }
    })

    console.log(`${i}/${tracksToAdd.length}`)
  }
})