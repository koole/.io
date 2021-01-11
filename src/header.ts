import { docReady, E } from "./utils";

// Fixes delayed audio playback on Safari
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const _ = new AudioCtx();

docReady(() => {
  window.scrollTo(0, 0);
  document.documentElement.style.overflow = "hidden";
  const startButton = E("light-button") as HTMLButtonElement;
  const audio = E("light-audio") as HTMLAudioElement;
  const video = E("header-video");
  const T0 = E("header-text-0");
  const T1 = E("header-text-1");
  const T2 = E("header-text-2");
  // audio.addEventListener("play", () => {
    if (video !== null) {
      setTimeout(() => {
        video.style.opacity = "1";
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
      // setTimeout(() => {
        T2.classList.add("active");
        document.documentElement.style.overflow = "unset";
      // }, 3859);
    }
  // });
  // startButton.addEventListener("click", () => {
    // audio.play();
    startButton.style.display = "none";
  // });
});

window.onbeforeunload = function (): void {
  window.scrollTo(0, 0);
};
