import Stats from "stats.js";

import { Color } from "three/src/math/Color";
import { Scene } from "three/src/scenes/Scene";
import { FogExp2 } from "three/src/scenes/FogExp2";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import { MeshLambertMaterial } from "three/src/materials/MeshLambertMaterial";
import { Mesh } from "three/src/objects/Mesh";
import { BackSide, LinearFilter, RGBFormat } from "three/src/constants";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

// Composer passes
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { FilmPass } from "./FilmPass/index";

// Shaders
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { LUTShader } from "./shaders/LUTShader";

import {
  Box3,
  Vector3,
  AnimationMixer,
  HemisphereLight,
  DirectionalLight,
  WebGLRenderTarget,
  DirectionalLightHelper,
  Vector2
} from "three";

import { makeLUTTexture } from "./makeLUTTexture";

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// GLTF models
const load_objects = [
  { name: "road", file: "road-tex.glb" },
  { name: "left-wall", file: "left-wall.glb" },
  { name: "tower", file: "tower.glb" },
  { name: "road-pillars", file: "road-pillars.glb" },
  { name: "pillars-base", file: "pillars-base.glb" }
];

// Stores 3D objects after loading
const objects: {
  [key: string]: {
    gltf: GLTF;
    scene: Scene;
    size: number;
  };
} = {};

// To what depth should objects be placed?
const depth = 40;

interface Repeater {
  object: string;
  x: number;
  y: number;
  z: number;
  offset: number;
  scenes: Array<Scene>;
  index: number;
  currentFirstScene: number;
  size: number;
}

const repeaters: Array<Repeater> = [
  {
    object: "road",
    x: 3.5,
    y: 3.5,
    z: -8,
    offset: 0,
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: 1
  },
  {
    object: "road",
    x: 0.6,
    y: 1.3,
    z: -8,
    offset: 0,
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: 1
  },
  {
    object: "pillars-base",
    x: 3.5,
    y: 3.5,
    z: -8,
    offset: 0,
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: 1
  },
  {
    object: "left-wall",
    x: 5.5,
    y: 2.5,
    z: -8,
    offset: 0,
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: 1
  }
];

function main() {
  var cursorXPosition = 0;
  var cursorYPosition = 0;
  let z = 0;

  const fovBars = document.getElementById("fov-bars") as HTMLDivElement;

  const canvas = document.querySelector("#c") as HTMLCanvasElement;
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;

  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const lut = {
    size: 16,
    texture: makeLUTTexture({ url: "/lut.png", size: 16 })
  };

  // Settings
  var skyColor = 0xcccccc;
  var buildingColor = 0x000000;

  const scene = new Scene();
  scene.background = new Color(skyColor);
  scene.fog = new FogExp2(skyColor, 0.15);

  const effectLUT = new ShaderPass(LUTShader);
  effectLUT.renderToScreen = true;

  // Hemisphere light
  {
    const intensity = 1;
    const light = new HemisphereLight(skyColor, buildingColor, intensity);
    scene.add(light);
  }

  // Shadow casting light
  var shadowLight: DirectionalLight;
  // var shadowLightHelper;
  {
    const color = 0xffffff;
    const intensity = 2;
    shadowLight = new DirectionalLight(color, intensity);
    shadowLight.position.set(10, 10, -25);
    shadowLight.target.position.set(-5, 0, 5);
    shadowLight.castShadow = true;
    shadowLight.shadow.mapSize.width = 2014; // default
    shadowLight.shadow.mapSize.height = 2014; // default
    scene.add(shadowLight);
    scene.add(shadowLight.target);

    // shadowLightHelper = new DirectionalLightHelper(shadowLight);
    // scene.add(shadowLightHelper);
  }

  // Floor
  {
    const plane = new PlaneGeometry(100, 100, 1);
    const planeMat = new MeshLambertMaterial({
      color: 0xff5555,
      side: BackSide
    });
    const mesh = new Mesh(plane, planeMat);
    mesh.receiveShadow = true;
    mesh.position.set(0, -2.5, 0);
    mesh.rotation.x = Math.PI / 2;
    scene.add(mesh);
  }

  // Looping objects like roads, pillars and the left wall
  for (const repeater of repeaters) {
    const { object, scenes } = repeater;
    const model = objects[object];
    repeater.size = model.size;
    const amount = Math.ceil(depth / repeater.size);

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

  const renderBG = new RenderPass(scene, camera);
  const Film = new FilmPass(0.35, 0.025, 648);
  Film.renderToScreen = true;
  const SMAA = new SMAAPass(window.innerWidth, window.innerHeight);

  const rtParameters = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBFormat
  };
  const composer = new EffectComposer(
    renderer,
    new WebGLRenderTarget(1, 1, rtParameters)
  );
  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    0.3,
    1.5,
    0.85
  );
  composer.addPass(renderBG);
  composer.addPass(bloomPass);
  composer.addPass(SMAA);
  composer.addPass(Film);
  composer.addPass(effectLUT);

  function resizeRendererToDisplaySize(renderer: WebGLRenderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth | 0;
    const height = canvas.clientHeight | 0;

    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  let then = 0;
  function render(now: number) {
    stats.begin();
    now *= 0.001; // convert to seconds
    const delta = now - then;
    then = now;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      const canvasAspect = canvas.clientWidth / canvas.clientHeight;
      camera.aspect = canvasAspect;
      camera.updateProjectionMatrix();
      composer.setSize(canvas.width, canvas.height);
    }

    z = z - 0.01;

    for (const repeater of repeaters) {
      const firstScene = repeater.scenes[repeater.currentFirstScene];
      if (
        firstScene.position.z >
        z + repeater.z + repeater.offset + repeater.size
      ) {
        firstScene.position.set(
          repeater.x,
          repeater.y,
          repeater.z - (repeater.size + repeater.offset) * repeater.index
        );
        repeater.index = repeater.index + 1;
        repeater.currentFirstScene =
          (repeater.currentFirstScene + 1) % repeater.scenes.length;
      }
    }

    moveZ(z);

    const xc = cursorXPosition / document.body.clientWidth;
    camera.rotation.y = ((-32 - xc * 8) * Math.PI) / 180;
    camera.position.x = xc * 0.5 + Math.sin(z * 0.2) * 0.3;
    camera.position.y = xc * 0.5 + 2.5 - Math.sin(z * 0.3) * 0.3;

    camera.fov = 80 - (cursorYPosition / document.body.clientHeight) * 20;
    fovBars.style.transform = `translateX(${(cursorYPosition /
      document.body.clientHeight) *
      20 -
      10}%)`;
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);

    const lutInfo = lut;
    const effect = effectLUT;
    const lutTexture = lutInfo.texture;
    effect.uniforms.lutMap.value = lutTexture;
    effect.uniforms.lutMapSize.value = lutInfo.size;

    composer.render(delta);

    stats.end();
    // if(z < -0.1) return;
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
  const terminal = document.getElementById("terminal") as HTMLDivElement;
  terminal.style.display = "none";

  document.onmousemove = getCursor;
  function moveZ(z) {
    camera.position.x = camera.position.x;
    camera.position.z = z + Math.pow(Math.sin(z / 3) * 0.8, 4);
    shadowLight.position.set(7.5, 15, -30 + z);
    shadowLight.target.position.set(0, 0, -5 + z);
    // shadowLightHelper.update();
  }

  function getCursor(e: MouseEvent): void {
    cursorXPosition = window.Event
      ? e.pageX
      : event.clientX +
        (document.documentElement.scrollLeft
          ? document.documentElement.scrollLeft
          : document.body.scrollLeft);
    cursorYPosition = window.Event
      ? e.pageY
      : event.clientY +
        (document.documentElement.scrollLeft
          ? document.documentElement.scrollLeft
          : document.body.scrollLeft);
  }
}

function loader() {
  const terminal = document.getElementById("terminal") as HTMLDivElement;

  function addToTerminal(text: string) {
    var node = document.createElement("div");
    var textnode = document.createTextNode(text);
    node.appendChild(textnode);
    terminal.appendChild(node);
    return node;
  }
  addToTerminal("Control software waiting for binary data");

  const gltfLoader = new GLTFLoader();
  let i = 0;
  let terminalIndex = 0;
  for (const LoadObject of load_objects) {
    const thisFileIndex = terminalIndex;
    terminalIndex++;
    const terminalNode = addToTerminal(
      `Starting download of binary blob ${thisFileIndex} of ${load_objects.length} (0%)`
    );
    gltfLoader.load(
      LoadObject.file,
      function(gltf) {
        const model = gltf.scene.children[0];
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const box = new Box3().setFromObject(gltf.scene);
        const boxSize = box.getSize(new Vector3()).z;

        objects[LoadObject.name] = {
          gltf: gltf,
          scene: gltf.scene,
          size: boxSize
        };

        terminalNode.innerText = `Starting download of binary blob ${thisFileIndex} of ${load_objects.length} (ready)`;
        addToTerminal(`Finished downloading binary blob ${thisFileIndex}`);

        i++;

        if (i === load_objects.length) {
          addToTerminal(`Ready`);
          main();
        }
      },
      function(xhr) {
        terminalNode.innerText = `Starting download of binary blob ${thisFileIndex} of ${
          load_objects.length
        } (${(xhr.loaded / xhr.total) * 100}%)`;
      }
    );
  }
}

loader();
