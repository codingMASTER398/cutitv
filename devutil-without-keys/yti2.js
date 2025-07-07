// Calculates timings for all tracks that are like are not spliced up, with the startTime and endTime being null, sorta thing.

require(`dotenv`).config({
  path: '../.env'
})

const { db } = require(`../server/db`);
const axios = require(`axios`)

const API_KEY = ''; // Replace with your key

// 🔧 Split into chunks of 50 (API limit)
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// 🔁 Convert ISO 8601 duration (PT3M22S) to seconds
function parseISODuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const [, h = 0, m = 0, s = 0] = match.map(x => parseInt(x) || 0);
  return h * 3600 + m * 60 + s;
}

// 🚀 Fetch durations
async function fetchDurations(videoIds) {
  const chunks = chunkArray(videoIds, 50);
  const allDurations = {};

  for (const chunk of chunks) {
    const ids = chunk.join(',');
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${API_KEY}`;

    const res = await axios.get(url);
    for (const item of res.data.items) {
      const id = item.id;
      const isoDuration = item.contentDetails.duration;
      const seconds = parseISODuration(isoDuration);
      allDurations[id] = seconds;
    }
  }

  return allDurations;
}

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
  let tracksToAdd = await db.tracks.find({
    "length": null,
  }).toArray()

  let toGetLengths = tracksToAdd.map((track)=>track.ytID)

  const durations = await fetchDurations(toGetLengths)

  for (let i = 0; i < tracksToAdd.length; i++) {
    const track = tracksToAdd[i];

    await db.tracks.updateOne({
      id: track.id
    }, {
      $set: {
        length: durations[track.ytID]
      }
    })

    console.log(`${i}/${tracksToAdd.length}`)
  }
})