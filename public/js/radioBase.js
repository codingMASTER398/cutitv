function loadingOut() {
  document.querySelector(`#loading`).classList.remove(`clickContinue`)
  document.querySelector(`#loading`).classList.add(`out`)
}

function loadingIn() {
  document.querySelector(`#loading`).classList.remove(`out`)
}

function updateCurrentlyPlaying() {
  document.querySelector(`#currentlyPlaying`).innerText = window.currentTrack.title
  document.querySelector(`#currentlyPlayingAlbum`).innerText = window.currentTrack.album
}

document.addEventListener("DOMContentLoaded", (event) => {
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

    initPlayer();
    updateCurrentlyPlaying();
  })

  socket.on("disconnecting_reason", (data) => {
    loadingContent.innerText = `Error: ${data}`
    loadingIn();
  })

  socket.on("trackChange", (data)=>{
    window.currentTrack = data;
    player.loadVideoById(data.ytID)
    updateCurrentlyPlaying();
  })
});
