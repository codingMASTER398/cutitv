const imgOverrides = {
  "UCAisUe6-VA": "/nerd/img/lesbianPonies.png"
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
  })
}

document.addEventListener("DOMContentLoaded", load);
