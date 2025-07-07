let currentTheme = ""

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function processThemes() {
  if(!window.currentTrack?.colors?.[0]) return;

  const colorSplit = window.currentTrack.colors[0];
  const currentColor = window.currentTrack.colors[1][Math.floor(getBasedTime() / colorSplit)];

  const rgb = hexToRgb(currentColor);

  const root = document.documentElement;

  const baseColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const aboveBaseColor = `rgb(${~~(rgb.r * 1.5)}, ${~~(rgb.g * 1.5)}, ${~~(rgb.b * 1.5)})`;
  const darkbase = `rgb(${~~(rgb.r * 0.2)}, ${rgb.g * 0.2}, ${rgb.b * 0.2})`;
  const darkbaseAlpha = `rgba(${~~(rgb.r * 0.2)}, ${rgb.g * 0.2}, ${rgb.b * 0.2}, 0.7)`;
  const lightBase = `rgb(${~~(rgb.r * 0.3)}, ${~~(rgb.g * 0.3)}, ${~~(rgb.b * 0.3)})`;

  root.style.setProperty('--base-color', baseColor);
  root.style.setProperty('--above-base-color', aboveBaseColor);
  root.style.setProperty('--dark-base', darkbase);
  root.style.setProperty('--light-base', lightBase);
  root.style.setProperty('--dark-base-alpha', darkbaseAlpha);
  root.style.setProperty('--thumbBlur', `url('https://img.youtube.com/vi/${window.currentTrack.ytID}/sddefault.jpg')`);

  if(window.currentTrack.theme != currentTheme) {
    currentTheme = window.currentTrack.theme

    document.body.className = window.currentTrack.theme
  }
}
