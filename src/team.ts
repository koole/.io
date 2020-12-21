import { docReady, E, SR } from "./utils";

SR.reveal(".team h2", {
  duration: 500,
  scale: 0,
  viewFactor: 1,
  easing: "ease-in-out",
});

const maxMove = 300;

let smoothed = 0;

docReady(() => {
  const section = E("team-section");
  const row0 = E("members-row-0");
  const row1 = E("members-row-1");
  const row2 = E("members-row-2");

  function moveMembers(): void {
    const offset = Math.min(
      Math.max(
        0,
        document.documentElement.scrollTop +
          window.innerHeight -
          (section?.offsetTop || 0)
      ),
      window.innerHeight * 2
    );

    if (offset > 0 && offset < window.innerHeight * 2) {
      smoothed += (offset - smoothed) / 6;

      const percentage = smoothed / (window.innerHeight * 2);
      if (row0 !== null) {
        row0.style.transform = `translateX(${percentage * maxMove}px)`;
      }
      if (row1 !== null) {
        row1.style.transform = `translateX(${percentage * maxMove * -1}px)`;
      }
      if (row2 !== null) {
        row2.style.transform = `translateX(${percentage * maxMove}px)`;
      }
    }
    window.requestAnimationFrame(moveMembers);
  }

  window.requestAnimationFrame(moveMembers);
});
