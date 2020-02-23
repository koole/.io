// Three stuff
import { Color } from "three/src/math/Color";
import { Scene } from "three/src/scenes/Scene";
import { FogExp2 } from "three/src/scenes/FogExp2";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";

// Own stuff
import { loader } from "./loader";
import { render } from "./render";
import { Repeater } from "./Repeater";
import { createComposer } from "./createComposer";
import { createLights } from "./createLights";
import { GLTFLoadable, StructureList } from "./declarations";

// Settings
const speed = 0.01;
const skyColor = 0xcccccc;
const shadowColor = 0x000000;

// GLTF (as GLB) models
export const GLBList: GLTFLoadable[] = [
  { name: "road", file: "glb/road.glb" },
  { name: "left-wall", file: "glb/left-wall.glb" },
  { name: "tower", file: "glb/tower.glb" },
  { name: "road-pillars", file: "glb/road-pillars.glb" },
  { name: "pillars-base", file: "glb/pillars-base.glb" },
  { name: "right-wall-0", file: "glb/right-wall-0.glb" },
  { name: "right-wall-1", file: "glb/right-wall-1.glb" },
  { name: "right-wall-2", file: "glb/right-wall-2.glb" },
  { name: "test-building-0", file: "glb/test-building-0.glb" },
  { name: "test-building-1", file: "glb/test-building-1.glb" }
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
    ),
    new Repeater(
      [structures["test-building-0"], structures["test-building-1"]],
      9.1,
      2.6
    ),
    new Repeater(
      [structures["test-building-0"], structures["test-building-1"]],
      15.1,
      2.6
    )
  ];

  // Create renderer
  const canvas = document.querySelector("#c") as HTMLCanvasElement;
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

  // Start rendering
  requestAnimationFrame(now =>
    render(now, renderer, repeaters, camera, composer, speed, shadowLight)
  );

  // Hide the loading screen
  const terminal = document.getElementById("terminal") as HTMLDivElement;
  terminal.style.display = "none";
}

// Load all models, then start the script
loader(GLBList, main);
