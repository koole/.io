// Get required HTML elements
const fovBars = document.getElementById("fov-bars") as HTMLDivElement;
const fovNum = document.getElementById("fov-num") as HTMLDivElement;
const fovCone = document.getElementById("fov-cone") as HTMLDivElement;
const droneParts = document.getElementsByClassName(
  "drone-part"
) as HTMLCollectionOf<HTMLElement>;

export function updateHUD(
  z: number,
  fov: number,
  cy: number,
  xc: number
): void {
  fovNum.innerHTML = (fov + Math.random() / 10).toFixed(10);
  fovBars.style.transform = `translateX(${cy * 20 - 10 + Math.random() / 10}%)`;
  fovCone.style.transform = `rotate(${(-32 + xc * 8) * Math.PI +
    110}deg) scaleX(${(1 - cy) * 0.5 + 0.5}`;

  // Update height in drone icon
  for (const element of droneParts) {
    element.style.transform = `translateY(${(xc * 0.5 +
      2.5 -
      Math.sin(z * 0.3) * 0.3 -
      2.9) *
      -40}px`;
  }
}
