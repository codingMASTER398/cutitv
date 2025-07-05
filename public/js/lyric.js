const lyricElement = document.querySelector(`.lyric`);
let lyricIndex = -1;

function processLyrics() {
  const seekTime = player.getCurrentTime()
  const pLyrics = currentTrack.lyricsFormatted.filter((l) => seekTime >= l.time);
  const lyric = pLyrics[pLyrics.length - 1]?.lyric || "";

  if (pLyrics.length != lyricIndex) {
    lyricIndex = pLyrics.length;
    lyricElement.classList.remove(`in`)
    lyricElement.offsetWidth;
    lyricElement.classList.add(`in`)
  }

  lyricElement.innerText = lyric;
}