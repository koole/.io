import Stats from "stats.js";

// Three stuff
import { Color } from "three/src/math/Color";
import { Scene } from "three/src/scenes/Scene";
import { FogExp2 } from "three/src/scenes/FogExp2";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";

// Own stuff
import { loader } from "./loader";
import { Repeater } from "./Repeater";
import { createComposer } from "./createComposer";
import { createLights } from "./createLights";

import { GLTFModel as GLTFLoadable, GLTFSceneObj } from "./declarations";

// Stores 3D objects after loading
let GLTFScenes: GLTFSceneObj = {};

//*   ___      _   _   _
//*  / __| ___| |_| |_(_)_ _  __ _ ___
//*  \__ \/ -_)  _|  _| | ' \/ _` (_-<
//*  |___/\___|\__|\__|_|_||_\__, /__/
//*                          |___/

const speed = 0.01;
const skyColor = 0xcccccc;
const shadowColor = 0x000000;

// GLTF models
export const LoadGLTFList: GLTFLoadable[] = [
  { name: "road", file: "road-tex.glb" },
  { name: "left-wall", file: "left-wall.glb" },
  { name: "tower", file: "tower.glb" },
  { name: "road-pillars", file: "road-pillars.glb" },
  { name: "pillars-base", file: "pillars-base.glb" }
];

export function main() {
  // These objects get repeated infinitely in the scene
  const repeaters: Repeater[] = [
    new Repeater(GLTFScenes["road"], 3.5, 3.5), 
    new Repeater(GLTFScenes["road"], 0.6, 1.3),
    new Repeater(GLTFScenes["pillars-base"], 3.5, 3.5),
    new Repeater(GLTFScenes["left-wall"], 5.5, 2.5)
  ];

  // Updating variables
  let cursorXPosition = 0;
  let cursorYPosition = 0;
  let z = 0;

  // Get required HTML elements
  const fovBars = document.getElementById("fov-bars") as HTMLDivElement;
  const canvas = document.querySelector("#c") as HTMLCanvasElement;

  // Create renderer
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;

  // Create camera
  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Create scene with fog
  const scene = new Scene();
  scene.background = new Color(skyColor);
  scene.fog = new FogExp2(skyColor, 0.15);

  // Create composer with all effects
  const composer = createComposer(scene, camera, renderer);

  // Add lights
  const shadowLight = createLights(scene, skyColor, shadowColor);

  // Add looping objects like roads, pillars and the left wall
  for (let repeater of repeaters) {
    repeater.firstDraw(scene);
  }

  // Tests if the canvas needs resizing and updates the renderer
  function resizeRendererToDisplaySize(renderer: WebGLRenderer) {
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

  // Moves all fixed elements forward
  function moveZ(z: number) {
    camera.position.x = camera.position.x;
    camera.position.z = z + Math.pow(Math.sin(z / 3) * 0.8, 4);
    shadowLight.position.set(7.5, 15, -30 + z);
    shadowLight.target.position.set(0, 0, -5 + z);
  }

  // Gets current cursor positions
  function getCursor(e: MouseEvent): void {
    cursorXPosition = e.clientX;
    cursorYPosition = e.clientY;
  }

  // Render frame
  let then = 0;
  function render(now: number) {
    // Start stats.js
    stats.begin();

    // Get delta between frames (in seconds)
    now *= 0.001;
    const delta = now - then;
    then = now;

    // Resize canvas if needed
    resizeRendererToDisplaySize(renderer);

    // Update Z position
    z = z - speed;

    // If a repeating object is out of frame, move it back into the fog
    // Creates the infinite loop
    for (const repeater of repeaters) {
      repeater.updateLoop(z);
    }

    // Moves all fixed elements forward (camera, sunlight, floor)
    moveZ(z);

    // Move and zoom camera based on cursor position
    // Update position
    const xc = cursorXPosition / document.body.clientWidth;
    camera.rotation.y = ((-32 - xc * 8) * Math.PI) / 180;
    camera.position.x = xc * 0.5 + Math.sin(z * 0.2) * 0.3;
    camera.position.y = xc * 0.5 + 2.5 - Math.sin(z * 0.3) * 0.3;

    // Update FOV for zoom effect
    camera.fov = 80 - (cursorYPosition / document.body.clientHeight) * 20;
    camera.updateProjectionMatrix();

    // Update the zoom indicator
    fovBars.style.transform = `translateX(${(cursorYPosition /
      document.body.clientHeight) *
      20 -
      10}%)`;

    // Render frame
    composer.render(delta);

    // End stats.js
    stats.end();

    // Render the next frame
    requestAnimationFrame(render);
  }

  // Start rendering
  requestAnimationFrame(render);

  // Hide the loading screen
  const terminal = document.getElementById("terminal") as HTMLDivElement;
  terminal.style.display = "none";

  // Watch for cursor movements for camera interaction
  document.onmousemove = getCursor;
}

// Performance statistics
var stats = new Stats();
stats.showPanel(1);
document.body.appendChild(stats.dom);

// Start!
GLTFScenes = loader(LoadGLTFList, main);
