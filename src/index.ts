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

import { GLTFLoadable, StructureList } from "./declarations";

// Performance statistics
const stats = new Stats();
stats.showPanel(1);
const statsElement = document.getElementById("stats") as HTMLDivElement;
statsElement.appendChild(stats.dom);

// Settings
const speed = 0.01;
const skyColor = 0xcccccc;
const shadowColor = 0x000000;

// GLTF models
export const LoadGLTFList: GLTFLoadable[] = [
  { name: "road", file: "glb/road.glb" },
  { name: "left-wall", file: "glb/left-wall.glb" },
  { name: "tower", file: "glb/tower.glb" },
  { name: "road-pillars", file: "glb/road-pillars.glb" },
  { name: "pillars-base", file: "glb/pillars-base.glb" },
  { name: "right-wall-0", file: "glb/right-wall-0.glb" },
  { name: "right-wall-1", file: "glb/right-wall-1.glb" },
  { name: "right-wall-2", file: "glb/right-wall-2.glb" }
];

export function main(structures: StructureList): void {
  // These objects get repeated infinitely in the scene
  const repeaters: Repeater[] = [
    new Repeater([structures["road"]], 3.5, 3.5, undefined, 0),
    new Repeater([structures["road"]], 0.6, 1.3),
    new Repeater([structures["pillars-base"]], 3.5, 3.5),
    new Repeater([structures["left-wall"]], 5.5, 2.5),
    new Repeater(
      [
        structures["right-wall-0"],
        structures["right-wall-1"],
        structures["right-wall-2"],
        structures["right-wall-1"],
        structures["right-wall-2"]
      ],
      7.5,
      2.8
    )
  ];

  // Updating variables
  let cursorXPosition = 0;
  let cursorYPosition = 0;
  let z = 0;

  // Get required HTML elements
  const fovBars = document.getElementById("fov-bars") as HTMLDivElement;
  const fovNum = document.getElementById("fov-num") as HTMLDivElement;
  const fovCone = document.getElementById("fov-cone") as HTMLDivElement;
  const canvas = document.querySelector("#c") as HTMLCanvasElement;
  const droneParts = document.getElementsByClassName(
    "drone-part"
  ) as HTMLCollectionOf<HTMLElement>;

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
  const renderScene = new Scene();
  renderScene.background = new Color(skyColor);
  renderScene.fog = new FogExp2(skyColor, 0.13);

  // Create composer with all effects
  const composer = createComposer(renderScene, camera, renderer);

  // Add lights
  const shadowLight = createLights(renderScene, skyColor, shadowColor);

  // Add looping objects like roads, pillars and the left wall
  for (const repeater of repeaters) {
    repeater.firstDraw(renderScene);
  }

  // Tests if the canvas needs resizing and updates the renderer
  function resizeRendererToDisplaySize(renderer: WebGLRenderer): boolean {
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
  function moveZ(z: number): void {
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
  function render(now: number): void {
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

    // Creates the infinite loop
    // If a repeating object is out of frame, move it back into the fog
    for (const repeater of repeaters) {
      repeater.updateLoop(renderScene, z);
    }

    // Moves all fixed elements forward (camera, sunlight, floor)
    moveZ(z);

    const xc = cursorXPosition / document.body.clientWidth;
    const cy = cursorYPosition / document.body.clientHeight;
    // Move and zoom camera based on cursor position
    // Update position
    camera.rotation.y = ((-32 - xc * 8) * Math.PI) / 180;
    camera.position.x = xc * 0.5 + Math.sin(z * 0.2) * 0.3;
    camera.position.y = xc * 0.5 + 2.5 - Math.sin(z * 0.3) * 0.3;

    // Update FOV for zoom effect
    const fov = 80 - cy * 20;
    camera.fov = fov;
    camera.updateProjectionMatrix();

    // Update the zoom indicator
    fovNum.innerHTML = (fov + Math.random() / 10).toFixed(10);
    fovBars.style.transform = `translateX(${cy * 20 -
      10 +
      Math.random() / 10}%)`;
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

// Load all models, then start the script
loader(LoadGLTFList, main);
