let beatIndex = 0;

function processSickBeats() {
  requestAnimationFrame(processSickBeats)

  if(!player?.getCurrentTime) return;

  const seekTime = getBasedTime()
  const pBeats = currentTrack.beats.filter((l) => seekTime >= l);
  
  if(beatIndex != pBeats.length) {
    beatIndex = pBeats.length

    document.body.classList.remove(`beat`)
    document.body.offsetWidth;
    document.body.classList.add(`beat`)
  }
}