import { E } from "./utils";

const circle = E("circle");
let mouseX = 0,
  mouseY = 0;
let xp = 0,
  yp = 0;

window.addEventListener("mousemove", e => {
  mouseX = e.clientX - 30 + 200;
  mouseY = e.clientY - 30 + 200;
});

function animateCursor(): void {
  xp += (mouseX - xp) / 6;
  yp += (mouseY - yp) / 6;
  if (circle !== null) {
    circle.style.transform = `translateX(${xp}px) translateY(${yp}px)`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();
