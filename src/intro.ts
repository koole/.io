import { docReady, E, SR } from "./utils";

SR.reveal(".intro h2, .intro p", {
  duration: 500,
  scale: 0,
  viewFactor: 1,
  easing: "ease-in-out",
});

docReady(() => {
  const diffInMs = Date.now() - new Date("1997-09-01");
  console.log(diffInMs);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  console.log(diffInDays);
  E("days").innerText = Math.floor(diffInDays)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
});
