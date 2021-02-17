import { docReady, E } from "./utils";

export let partyMode = false;

docReady(() => {
  const button = E("partyButton");
  const toggleParty = (): void => {
    partyMode = !partyMode;
    if (partyMode) {
      document.body.classList.add("party");
      button.innerText = "Disable party mode";
    } else {
      document.body.classList.remove("party");
      button.innerText = "Enable party mode";
    }
  };
  button.addEventListener("click", () => {
    toggleParty();
  });
});
