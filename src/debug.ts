import { docReady, E } from "./utils";

export let debugMode = false;

docReady(() => {
  const button = E("debugButton");
  const toggleDebug = (): void => {
    debugMode = !debugMode;
    if (debugMode) {
      document.body.classList.add("debug");
      button.innerText = "Disable debug mode";
    } else {
      document.body.classList.remove("debug");
      button.innerText = "Enable debug mode";
    }
  };
  button.addEventListener("click", () => {
    toggleDebug();
  });
});
