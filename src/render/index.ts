import Stats from "stats.js";

// Three stuff
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { DirectionalLight } from "three/src/lights/DirectionalLight";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

// Own stuff
import { Repeater } from "../Repeater";
import { updateHUD } from "./updateHUD";

// Performance statistics
const stats = new Stats();
stats.showPanel(1);
const statsElement = document.getElementById("stats") as HTMLDivElement;
statsElement.appendChild(stats.dom);

// Updating variables
let cursorXPosition = 0;
let cursorYPosition = 0;
let then = 0;
let z = 0;

// Gets current cursor positions
function getCursor(e: MouseEvent): void {
  cursorXPosition = e.clientX;
  cursorYPosition = e.clientY;
}

// Tests if the canvas needs resizing and updates the renderer
function resizeRendererToDisplaySize(
  renderer: WebGLRenderer,
  composer: EffectComposer,
  camera: PerspectiveCamera
): boolean {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth | 0;
  const height = canvas.clientHeight | 0;

  // Resize canvas
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
  }

  // Update camera
  const canvasAspect = canvas.clientWidth / canvas.clientHeight;
  camera.aspect = canvasAspect;
  camera.updateProjectionMatrix();

  return needResize;
}

export function render(
  now: number,
  renderer: WebGLRenderer,
  repeaters: Repeater[],
  camera: PerspectiveCamera,
  composer: EffectComposer,
  speed: number,
  shadowLight: DirectionalLight
): void {
  // Start stats.js
  stats.begin();

  // Get delta between frames (in seconds)
  now *= 0.001;
  const delta = now - then;
  then = now;

  // Resize canvas if needed
  resizeRendererToDisplaySize(renderer, composer, camera);

  // Update Z position
  z = z - speed;

  // Creates the infinite loop
  // If a repeating object is out of frame, move it back into the fog
  for (const repeater of repeaters) {
    repeater.updateLoop(z);
  }

  const xc = cursorXPosition / document.body.clientWidth;
  const cy = cursorYPosition / document.body.clientHeight;

  // Move and zoom camera based on cursor position
  // Update position
  camera.rotation.y = ((-32 - xc * 8) * Math.PI) / 180;
  camera.position.x = xc * 0.5 + Math.sin(z * 0.2) * 0.3;
  camera.position.y = xc * 0.5 + 2.5 - Math.sin(z * 0.3) * 0.3;

  // Moves all fixed elements forward (camera, sunlight, floor)
  camera.position.z = z + Math.pow(Math.sin(z / 3) * 0.8, 4);
  shadowLight.position.set(7.5, 15, -30 + z);
  shadowLight.target.position.set(0, 0, -5 + z);

  // Update FOV for zoom effect
  const fov = 80 - cy * 20;
  camera.fov = fov;
  camera.updateProjectionMatrix();

  // Update HUD elements
  updateHUD(z, fov, cy, xc);

  // Render frame
  composer.render(delta);

  // End stats.js
  stats.end();

  // Render the next frame
  requestAnimationFrame(now =>
    render(now, renderer, repeaters, camera, composer, speed, shadowLight)
  );
}

// Watch for cursor movements for camera interaction
document.onmousemove = getCursor;
