import Stats from "stats.js";

// Other Three stuff
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

//! These need to be imported like the ones above
//! to prevent loading all of three.js (it's big)
import {
  Box3,
  Vector3,
  HemisphereLight,
  DirectionalLight,
  WebGLRenderTarget,
  Vector2
} from "three";

// Own scripts
import { makeLUTTexture } from "./makeLUTTexture";

//   ___      _   _   _
//  / __| ___| |_| |_(_)_ _  __ _ ___
//  \__ \/ -_)  _|  _| | ' \/ _` (_-<
//  |___/\___|\__|\__|_|_||_\__, /__/
//                          |___/

var skyColor = 0xcccccc;
var shadowColor = 0x000000;

// GLTF models
const load_objects = [
  { name: "road", file: "road-tex.glb" },
  { name: "left-wall", file: "left-wall.glb" },
  { name: "tower", file: "tower.glb" },
  { name: "road-pillars", file: "road-pillars.glb" },
  { name: "pillars-base", file: "pillars-base.glb" }
];

// To what depth should objects be placed?
const depth = 40;

//- Settings for placing repeating objects

// Default settings
const baseRepeater = {
  z: -8,
  offset: 0,
  // Don't change these
  scenes: [],
  index: 0,
  currentFirstScene: 0,
  size: 1
};

// Individual settings
const repeaters: Array<{
  object: string;
  x: number;
  y: number;
  z: number;
  offset: number;
  scenes: Array<Scene>;
  index: number;
  currentFirstScene: number;
  size: number;
}> = [
  {
    ...baseRepeater,
    object: "road",
    x: 3.5,
    y: 3.5
  },
  {
    ...baseRepeater,
    object: "road",
    x: 0.6,
    y: 1.3
  },
  {
    ...baseRepeater,
    object: "pillars-base",
    x: 3.5,
    y: 3.5
  },
  {
    ...baseRepeater,
    object: "left-wall",
    x: 5.5,
    y: 2.5
  }
];

//
// End of settings
//

function main() {
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

  //   _    _      _   _
  //  | |  (_)__ _| |_| |_ ___
  //  | |__| / _` | ' \  _(_-<
  //  |____|_\__, |_||_\__/__/
  //         |___/

  //- Hemisphere light
  // Ambient sky light, lights everything
  {
    const intensity = 1;
    const light = new HemisphereLight(skyColor, shadowColor, intensity);
    scene.add(light);
  }

  //- Directional light
  // Replicates the sun, casts shadow
  var shadowLight: DirectionalLight;
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
  }

  //    ___  _     _        _
  //   / _ \| |__ (_)___ __| |_ ___
  //  | (_) | '_ \| / -_) _|  _(_-<
  //   \___/|_.__// \___\__|\__/__/
  //            |__/

  //- Floor
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

  //- Looping objects like roads, pillars and the left wall
  for (const repeater of repeaters) {
    const { object, scenes } = repeater;
    const model = objects[object];
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

  //   ___                                   ___
  //   / __|___ _ __  _ __  ___ ___ ___ _ _  | _ \__ _ ______ ___ ___
  //  | (__/ _ \ '  \| '_ \/ _ (_-</ -_) '_| |  _/ _` (_-<_-</ -_|_-<
  //   \___\___/_|_|_| .__/\___/__/\___|_|   |_| \__,_/__/__/\___/__/
  //                 |_|

  //- Create composer
  const rtParameters = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBFormat
  };
  const composer = new EffectComposer(
    renderer,
    new WebGLRenderTarget(1, 1, rtParameters)
  );

  //- Renderer
  // Renders the scene
  const renderBG = new RenderPass(scene, camera);

  //- SMAA
  // Anti-aliasing
  const SMAA = new SMAAPass(window.innerWidth, window.innerHeight);

  //- Bloom
  // A nice soft glow around bright parts of the scene
  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    0.3,
    1.5,
    0.85
  );

  //- Film
  // Adds scanlines and noise
  const Film = new FilmPass(0.35, 0.025, 648);
  Film.renderToScreen = true;

  //- LUT
  // Changes colors
  const effectLUT = new ShaderPass(LUTShader);
  const lut = {
    size: 16,
    texture: makeLUTTexture({ url: "/lut.png", size: 16 })
  };
  effectLUT.renderToScreen = true;
  effectLUT.uniforms.lutMap.value = lut.texture;
  effectLUT.uniforms.lutMapSize.value = lut.size;

  //- Apply passes
  composer.addPass(renderBG);
  composer.addPass(bloomPass);
  composer.addPass(SMAA);
  composer.addPass(Film);
  composer.addPass(effectLUT);

  //   _   _ _   _ _ _ _   _
  //  | | | | |_(_) (_) |_(_)___ ___
  //  | |_| |  _| | | |  _| / -_|_-<
  //   \___/ \__|_|_|_|\__|_\___/__/
  //

  // Tests if the canvas needs resizing and updates the renderer
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

  // Moves all fixed elements forward
  function moveZ(z: number) {
    camera.position.x = camera.position.x;
    camera.position.z = z + Math.pow(Math.sin(z / 3) * 0.8, 4);
    shadowLight.position.set(7.5, 15, -30 + z);
    shadowLight.target.position.set(0, 0, -5 + z);
  }

  // Gets current cursor positions
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

  //  ___             _            __
  //  | _ \___ _ _  __| |___ _ _   / _|_ _ __ _ _ __  ___
  //  |   / -_) ' \/ _` / -_) '_| |  _| '_/ _` | '  \/ -_)
  //  |_|_\___|_||_\__,_\___|_|   |_| |_| \__,_|_|_|_\___|
  //

  let then = 0;
  function render(now: number) {
    // Start stats.js
    stats.begin();

    // Get delta between frames (in seconds)
    now *= 0.001;
    const delta = now - then;
    then = now;

    // Resize canvas if needed
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      const canvasAspect = canvas.clientWidth / canvas.clientHeight;
      camera.aspect = canvasAspect;
      camera.updateProjectionMatrix();
      composer.setSize(canvas.width, canvas.height);
    }

    // Update Z position
    z = z - 0.01;

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

    // Uncomment to stop rendering after a few frames
    // For development when on battery power
    // if(z < -0.1) return;

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

//   _                 _
//  | |   ___  __ _ __| |___ _ _
//  | |__/ _ \/ _` / _` / -_) '_|
//  |____\___/\__,_\__,_\___|_|
//

// Stores 3D objects after loading
const objects: {
  [key: string]: {
    gltf: GLTF;
    scene: Scene;
    size: number;
  };
} = {};
function loader() {
  // Get terminal element
  const terminal = document.getElementById("terminal") as HTMLDivElement;

  // Function for drawing lines of text to the terminal
  function addToTerminal(text: string) {
    var node = document.createElement("div");
    var textnode = document.createTextNode(text);
    node.appendChild(textnode);
    terminal.appendChild(node);
    return node;
  }

  // Start loading of the GLB files
  addToTerminal("Control software waiting for binary data");
  const gltfLoader = new GLTFLoader();
  let terminalIndex = 0;

  // Keeps track of how many objects have finished loading 
  let downloaded = 0;

  // Loop over all objects we need to load
  for (const LoadObject of load_objects) {
    // Set a number for each file we can show to the user
    const thisFileIndex = terminalIndex;
    terminalIndex++;
    const terminalNode = addToTerminal(
      `Starting download of binary blob ${thisFileIndex} of ${load_objects.length} (0%)`
    );
    gltfLoader.load(
      LoadObject.file,
      function(gltf) {
        // We need every mesh in every GLTF scene to draw and cast shadows
        const model = gltf.scene.children[0];
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Calculate the size of the object
        // Used for later calculations
        const box = new Box3().setFromObject(gltf.scene);
        const boxSize = box.getSize(new Vector3()).z;
        objects[LoadObject.name] = {
          gltf: gltf,
          scene: gltf.scene,
          size: boxSize
        };

        // Update terminal
        terminalNode.innerText = `Starting download of binary blob ${thisFileIndex} of ${load_objects.length} (ready)`;
        addToTerminal(`Finished downloading binary blob ${thisFileIndex}`);

        // When all files have finished loading, start the main script
        downloaded++;
        if (downloaded === load_objects.length) {
          addToTerminal(`Ready`);
          main();
        }
      },
      // Update the download percentage on progress
      function(xhr) {
        terminalNode.innerText = `Starting download of binary blob ${thisFileIndex} of ${
          load_objects.length
        } (${(xhr.loaded / xhr.total) * 100}%)`;
      }
    );
  }
}

//   ___ _            _                          _   _    _
//  / __| |_ __ _ _ _| |_   _____ _____ _ _ _  _| |_| |_ (_)_ _  __ _
//  \__ \  _/ _` | '_|  _| / -_) V / -_) '_| || |  _| ' \| | ' \/ _` |
//  |___/\__\__,_|_|  \__| \___|\_/\___|_|  \_, |\__|_||_|_|_||_\__, |
//                                          |__/                |___/

// Performance statistics
var stats = new Stats();
stats.showPanel(1);
document.body.appendChild(stats.dom);

// Start!
loader();
