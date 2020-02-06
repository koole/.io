import Stats from "stats.js";

// Three stuff
import { Color } from "three/src/math/Color";
import { Scene } from "three/src/scenes/Scene";
import { FogExp2 } from "three/src/scenes/FogExp2";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";

// Own stuff
import { loader } from "./loader";
import { createComposer } from "./createComposer";
import { createLights } from "./createLights";

import { RepeaterObject, GLTFModel, GLTFSceneObj } from "./declarations";

//*   ___      _   _   _
//*  / __| ___| |_| |_(_)_ _  __ _ ___
//*  \__ \/ -_)  _|  _| | ' \/ _` (_-<
//*  |___/\___|\__|\__|_|_||_\__, /__/
//*                          |___/

const speed = 0.01;
const skyColor = 0xcccccc;
const shadowColor = 0x000000;

// GLTF models
export const LoadGLTFList: GLTFModel[] = [
  { name: "road", file: "road-tex.glb" },
  { name: "left-wall", file: "left-wall.glb" },
  { name: "tower", file: "tower.glb" },
  { name: "road-pillars", file: "road-pillars.glb" },
  { name: "pillars-base", file: "pillars-base.glb" }
];

// To what depth should objects be placed?
const depth = 40;

const repeaters: RepeaterObject[] = [
  {
    object: "road",
    x: 3.5,
    y: 3.5,
    offset: 0,
    z: -8,
    // Don't change these
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: 1
  },
  {
    object: "road",
    x: 0.6,
    y: 1.3,
    offset: 0,
    z: -8,
    // Don't change these
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: 1
  },
  {
    object: "pillars-base",
    x: 3.5,
    y: 3.5,
    offset: 0,
    z: -8,
    // Don't change these
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: 1
  },
  {
    object: "left-wall",
    x: 5.5,
    y: 2.5,
    offset: 0,
    z: -8,
    // Don't change these
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: 1
  }
];

//*
//* ----------------------------------
//* ----------------------------------
//* ----------------------------------
//*

// Stores 3D objects after loading
export let GLTFScenes: GLTFSceneObj = {};

export function main() {
  // Variables...
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
    const { object, scenes } = repeater;
    const model = GLTFScenes[object];
    repeater.size = model.size;

    // How many objects do we need to fill the set depth?
    const amount = Math.ceil(depth / repeater.size);

    // Create these objects, each one placed behind the next
    for (let i = 0; i < amount; i++) {
      repeater.index = i;
      const objectScene = model.scene.clone();
      objectScene.position.set(
        repeater.x,
        repeater.y,
        repeater.z - (repeater.size + repeater.offset) * repeater.index
      );
      scene.add(objectScene);
      scenes.push(objectScene);
    }
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
      // Check only the object closest to the camera for each repeating object
      const firstScene = repeater.scenes[repeater.currentFirstScene];
      // Check if object is behind the camera
      if (
        firstScene.position.z >
        z + repeater.z + repeater.offset + repeater.size
      ) {
        // Move the object to the back of the repeating row of objects
        firstScene.position.set(
          repeater.x,
          repeater.y,
          repeater.z - (repeater.size + repeater.offset) * repeater.index
        );
        // Update variables to be used in next iteration
        repeater.index = repeater.index + 1;
        repeater.currentFirstScene =
          (repeater.currentFirstScene + 1) % repeater.scenes.length;
      }
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
