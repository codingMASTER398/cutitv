// Recalculates beat timings for all songs

require(`dotenv`).config({
  path: '../.env'
})

const { db } = require(`../server/db`);

const fs = require(`fs`)
const videos = fs.readdirSync(`./ytvids`)
const getBeat = require(`./beat`)

/*const videos = [
  "CNPdO5TZ1DQ.mp4"
]*/

db.awaitConnected().then(async () => {
  for (let i = 0; i < videos.length; i++) {
    console.log(videos[i])

    const beats = (await getBeat.getBeatTimestamps(`./ytvids/${videos[i]}`, {
      O: 'phase',    // Better for detecting rapid, small transients in dense mixes
      t: 0.06,       // Very low threshold to catch subtle hits
      M: 0.08,       // Minimal inter-onset spacing; catch fast rhythms but skip double fires
      s: -30,        // Higher silence gate to suppress ambient/mixed noise
      B: 256,        // Very small buffer for highest timing resolution
      H: 64          // Ultra-detailed analysis, great for glitchy material

    })).map((b) => b.second + (b.millisecond / 1000));

    await db.tracks.updateMany({
      ytID: videos[i].replace(".mp4", "")
    },
      {
        $set: {
          beats
        }
      })
  }
});