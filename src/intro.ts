import { E } from "./utils";

// Fixes delayed audio playback on Safari
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function docReady(fn): void {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

docReady(() => {
  window.scrollTo(0, 0);
  document.body.style.overflow = "hidden";
  const startButton = E("light-button") as HTMLButtonElement;
  const audio = E("light-audio") as HTMLAudioElement;
  const video = E("header-video");
  const grain = E("header-video-grain");
  const T0 = E("header-text-0");
  const T1 = E("header-text-1");
  const T2 = E("header-text-2");
  // audio.addEventListener("play", () => {
    if (video !== null && grain !== null) {
      setTimeout(() => {
        video.style.opacity = "1";
        grain.style.opacity = "0.1";
      }, 1319);
    }
    if (T0 !== null) {
      setTimeout(() => {
        T0.classList.add("active");
      }, 2994);
    }
    if (T1 !== null) {
      setTimeout(() => {
        T1.classList.add("active");
      }, 3597);
    }
    if (T2 !== null) {
      setTimeout(() => {
        T2.classList.add("active");
        document.body.style.overflow = "unset";
      }, 3859);
    }
  // });
  // startButton.addEventListener("click", () => {
  //   audio.play();
    startButton.style.display = "none";
  // });
});

window.onbeforeunload = function (): void {
  window.scrollTo(0, 0);
};
