function mute() {
  if (audio.muted) {
    audio.muted = !audio.muted;
    document.getElementById("volume").style.backgroundImage =
      "url(resources/vol.png)";
  } else {
    audio.muted = !audio.muted;
    document.getElementById("volume").style.backgroundImage =
      "url(resources/mute.png)";
  }
}
