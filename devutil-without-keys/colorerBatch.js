// Recolours the uh the colors in the song

require(`dotenv`).config({
  path: '../.env'
})

const { db } = require(`../server/db`);

const fs = require(`fs`)
const videos = fs.readdirSync(`./ytvids`)
const getColors = require(`./colorer`)

/*const videos = [
  "CNPdO5TZ1DQ.mp4"
]*/

db.awaitConnected().then(async () => {
  for (let i = 0; i < videos.length; i++) {
    const colors = await getColors(`./ytvids/${videos[i]}`, 50); // 50 = samples. For ANTONYMPH, this was 1000.

    await db.tracks.updateMany({
      ytID: videos[i].replace(".mp4", "")
    },
      {
        $set: {
          colors
        }
      })
  }
});