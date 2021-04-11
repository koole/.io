import { docReady, E } from "./utils";

docReady(() => {
  const logo = E("logo") as HTMLButtonElement;
  const audio = E("logo-audio") as HTMLAudioElement;
  logo.addEventListener(
    "mousedown",
    () => {
      audio.currentTime = 0;
      audio.play();
    },
    { passive: true }
  );
  logo.addEventListener(
    "touchdown",
    () => {
      audio.currentTime = 0;
      audio.play();
    },
    { passive: true }
  );
});
