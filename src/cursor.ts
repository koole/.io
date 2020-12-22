import { E } from "./utils";

const circle = E("circle");
let mouseX = 0,
  mouseY = 0;
let xp = 0,
  yp = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX - 30 + 200;
  mouseY = e.clientY - 30 + 200;
});

function animateCursor(): void {
  xp += Math.floor((mouseX - xp) / 6);
  yp += Math.floor((mouseY - yp) / 6);
  if (circle !== null) {
    circle.style.transform = `translate3d(${xp}px, ${yp}px, 0)`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();
