function getSeekTime() {
  const timeLeft = Math.abs(Date.now() - window.currentTrack.nowEndTimer)
  return (window.currentTrack.endTime || window.currentTrack.length) - (timeLeft / 1000);
}

function getBasedTime() {
  return getSeekTime() - (window.currentTrack.startTime || 0);
}

function initPlayer() {
  if (!YT?.Player) {
    setTimeout(initPlayer, 100)
    return;
  }

  player = new YT.Player('yt-player', {
    height: '390',
    width: '640',
    videoId: window.currentTrack.ytID,
    playerVars: {
      'playsinline': 1,
      'color': 'white',
      'controls': 0,
      'disablekb': 1,
      'start': getSeekTime()
    },
    events: {
      'onReady': () => {
        loadingContent.innerText = "Click to continue"
        document.querySelector(`#loading`).classList.add(`clickContinue`)

        document.body.addEventListener("click", () => {
          loadingOut();

          player.seekTo(getSeekTime())
          player.playVideo()
          player.setVolume(localStorage.getItem(`volume`) || 50)
        }, { once: true })
      },
      'onStateChange': () => { }
    }
  });

  setInterval(() => {
    if (![1, 3].includes(player.getPlayerState())) {
      player.seekTo(getSeekTime())
      player.playVideo()
      //console.log(1)
    } else if (Math.abs(player.getCurrentTime() - getSeekTime()) > 1) {
      player.seekTo(getSeekTime())
      //console.log(2)
    }
  }, 500)

  setInterval(processLyrics, 100)
  setInterval(processThemes, 100)
  requestAnimationFrame(processSickBeats)

  processLyrics();
  processThemes();
}

const volumeSlider = document.querySelector(`.volumeSliderRange`);

volumeSlider.value = localStorage.getItem(`volume`) || 50

volumeSlider.addEventListener(`input`, () => {
  localStorage.setItem(`volume`, volumeSlider.value)
  player.setVolume(volumeSlider.value)
})