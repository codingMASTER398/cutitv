const lyricElement = document.querySelector(`.lyric`);
const lyricElement2 = document.querySelector(`.lyric2`);
let lyricIndex = -1;

function processLyrics() {
  if (!currentTrack?.lyricsFormatted) {
    lyricElement.innerText = ""
    return;
  }

  const seekTime = getBasedTime()
  const pLyrics = currentTrack.lyricsFormatted.filter((l) => seekTime >= l.time);
  const lyric = pLyrics[pLyrics.length - 1]?.lyric || "";
  const lyric2 = currentTrack.lyricsFormatted.find((l) => l.time > pLyrics[pLyrics.length - 1].time)?.lyric;

  if (pLyrics.length != lyricIndex) {
    lyricIndex = pLyrics.length;

    lyricElement.classList.remove(`in`)
    lyricElement.offsetWidth;
    lyricElement.classList.add(`in`)

    lyricElement2.classList.remove(`in`)
    lyricElement2.offsetWidth;
    lyricElement2.classList.add(`in`)
  }

  lyricElement.innerText = lyric;
  if (lyric2) lyricElement2.innerText = lyric2;
  else lyricElement2.innerText = "";
}