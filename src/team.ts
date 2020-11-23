import { E } from "./utils";

const maxMove = 300;

let smoothed = 0;

function moveMembers(): void {
  const section = E("team-section");
  const row0 = E("members-row-0");
  const row1 = E("members-row-1");
  const row2 = E("members-row-2");

  const offset = Math.min(
    Math.max(
      0,
      document.documentElement.scrollTop +
        window.innerHeight -
        (section?.offsetTop || 0)
    ),
    window.innerHeight * 2
  );

  smoothed += (offset - smoothed) / 6;

  const percentage = smoothed / (window.innerHeight * 2);
  console.log(percentage);
  if (row0 !== null) {
    row0.style.transform = `translateX(${percentage * maxMove}px)`;
  }
  if (row1 !== null) {
    row1.style.transform = `translateX(${percentage * maxMove * -1}px)`;
  }
  if (row2 !== null) {
    row2.style.transform = `translateX(${percentage * maxMove}px)`;
  }
  window.requestAnimationFrame(moveMembers);
}

window.requestAnimationFrame(moveMembers);
