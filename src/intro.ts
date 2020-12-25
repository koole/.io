import { docReady, E } from "./utils";

docReady(() => {
  const diffInMs = Date.now() - +new Date("1997-09-01");
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  E("days").innerText = Math.floor(diffInDays)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
});
