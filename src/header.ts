import { docReady, E } from "./utils";

// Fixes delayed audio playback on Safari
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const AudioCtx = window.AudioContext || window.webkitAudioContext;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ = new AudioCtx();

let needLoading = 0;
let hasLoaded = 0;
export const readyCallback = (): (() => void) => {
  needLoading++;
  return (): void => {
    hasLoaded++;
    if (hasLoaded === needLoading) {
      const loadingIndicator = E("loading-indicator") as HTMLDivElement;
      const startButton = E("light-button") as HTMLButtonElement;
      const logo = E("logo") as HTMLDivElement;
      // Hide loader
      loadingIndicator.classList.add("ready");
      // Show logo
      logo.classList.add("ready");
      // Show start button
      startButton.classList.add("ready");
    }
  };
};

docReady(() => {
  window.scrollTo(0, 0);
  document.documentElement.style.overflow = "hidden";
  const startButton = E("light-button") as HTMLButtonElement;
  const audio = E("light-audio") as HTMLAudioElement;
  const video = E("header-video") as HTMLVideoElement;
  const blackOverlay = E("black-overlay") as HTMLDivElement;
  const T0 = E("header-text-0") as HTMLSpanElement;
  const T1 = E("header-text-1") as HTMLSpanElement;
  const T2 = E("header-text-2") as HTMLSpanElement;

  //-// Don't wait for audio/video, mobile Safari doesn't preload till playthrough.
  // const audioReady = readyCallback();
  // const videoReady = readyCallback();
  // if (audio.readyState > 2) {
  //   audioReady();
  // } else {
  //   audio.addEventListener("canplaythrough", audioReady);
  // }
  // if (video.readyState > 2) {
  //   videoReady();
  // } else {
  //   video.addEventListener("canplaythrough", videoReady);
  // }
  //-// Wait at least one second instead.
  setTimeout(() => {
    readyCallback()();
  }, 1200);

  audio.addEventListener("play", () => {
    window.scrollTo(0, 0);
    if (video !== null) {
      video.play();
    }
    setTimeout(() => {
      blackOverlay.style.display = "none";
    }, 1319);
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
        document.documentElement.style.overflow = "unset";
      }, 3859);
    }
  });
  startButton.addEventListener("click", () => {
    audio.play();
    startButton.style.display = "none";
  });
  document.documentElement.style.overflow = "unset";
  blackOverlay.style.display = "none";
  startButton.style.display = "none";
});

window.onbeforeunload = function (): void {
  window.scrollTo(0, 0);
};
