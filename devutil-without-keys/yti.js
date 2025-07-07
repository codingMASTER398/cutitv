// I'm pretty sure this is an old file to do the timings "length" of videos on the db. But yti2.js does it better.

const axios = require('axios');

// 🔧 Config
const API_KEY = ''; // Replace with your key
const videoIds = require(`./mapped.json`).map((a) => a.ytID)

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

// ✅ Run
fetchDurations(videoIds).then((durations) => {
  require(`fs`).writeFileSync(`./mapped2.json`, JSON.stringify(require(`./mapped.json`).map((a) => {
    return {
      ...a,
      length: durations[a.ytID]
    }
  })))
}).catch(console.error);
