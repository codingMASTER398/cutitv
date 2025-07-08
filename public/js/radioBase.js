const imgOverrides = {
  "UCAisUe6-VA": "/nerd/img/lesbianPonies.png",
  "ABJ4lWZD_qM": "/nerd/img/SYNDICATE_Full.jpg"
}

function loadingOut() {
  document.querySelector(`#loading`).classList.remove(`clickContinue`)
  document.querySelector(`#loading`).classList.add(`out`)
}

function loadingIn() {
  document.querySelector(`#loading`).classList.remove(`out`)
}

function updateCurrentlyPlaying() {
  document.querySelector(`#currentlyPlaying`).innerText = window.currentTrack.title
  document.querySelector(`#currentlyPlayingAlbum`).innerText = window.currentTrack.album + (window.currentTrack.feat ? `, feat. ${window.currentTrack.feat}` : "")

  document.querySelector('#dynamicTheme').innerHTML = `
  .contentWrapper {
    background: linear-gradient(
      var(--dark-base-alpha),
      var(--dark-base-alpha)
    ), url("${imgOverrides[window.currentTrack.ytID] || `https://img.youtube.com/vi/${window.currentTrack.ytID}/maxresdefault.jpg`}");
  }
`;

  document.querySelector(`.ytLink`).href = `https://youtu.be/${window.currentTrack.ytID}?t=${Math.round(getSeekTime())}`

  document.title = window.currentTrack.title
}

function load() {
  if (!window.io) {
    setTimeout(load, 100)
    return;
  }

  const loadingContent = document.querySelector(`#loadingContent`)

  loadingContent.innerText = "Connecting"

  const socket = io({
    extraHeaders: {
      Authorization: window.data.connectIntent
    }
  });

  socket.on("connect", () => {
    loadingContent.innerText = "Waiting for initial data"
  })

  socket.on("initialData", (data) => {
    loadingContent.innerText = "Loading YT embed"
    window.currentTrack = data.currentTrack

    updateCurrentlyPlaying();
    updateVoter();
    initPlayer();
  })

  socket.on("disconnecting_reason", (data) => {
    loadingContent.innerText = `Error: ${data}`
    loadingIn();
  })

  socket.on("trackChange", (data) => {
    window.currentTrack = data;
    player.loadVideoById(data.ytID)
    updateCurrentlyPlaying();
    updateVoter();
  })

  socket.on("votes", setVotes)

  socket.on("listeners", (c) => {
    document.querySelector(`.listenersBox p`).innerHTML = `<img src="/nerd/img/horseIcon.png"/> ${Number(c)}`
  })

  window.socket = socket;
}

document.addEventListener("DOMContentLoaded", load);


function hideUI() {
  document.querySelector(`.actualContentTrustMeBro`).style.opacity = "0"
  document.querySelector(`body`).addEventListener(`click`, () => {
    document.querySelector(`.actualContentTrustMeBro`).style.opacity = "1"
  }, { once: true })
}