// Three stuff
import { Scene } from "three/src/scenes/Scene";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Color } from "three/src/math/Color";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { sRGBEncoding } from "three/src/constants";

const loader = new GLTFLoader();

let camera: PerspectiveCamera, scene: Scene, controls: OrbitControls;

const canvas = document.querySelector("#c") as HTMLCanvasElement;
const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = sRGBEncoding;

let coal: Scene | null = null;

function init(): void {
  camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );
  camera.position.z = 0.8;

  controls = new OrbitControls(camera, canvas);
  controls.enableKeys = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.enableZoom = false;

  scene = new Scene();
  scene.background = new Color(0xf6f2eb);

  function onWindowResize(): void {
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Update camera
    const canvasAspect = canvas.clientWidth / canvas.clientHeight;
    camera.aspect = canvasAspect;
    camera.updateProjectionMatrix();
  }

  loader.load(
    "/coal.glb",
    // Finished loading
    function(gltf) {
      const object = gltf.scene;
      object.scale.set(0.02, 0.02, 0.02); // scale here
      scene.add(object);
      coal = object;
    },
    // Loading progressing
    function(xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // Loading failed
    function(error) {
      console.log(error);
      console.log("An error happened");
    }
  );

  renderer.setSize(window.innerWidth, window.innerHeight);
  window.addEventListener("resize", onWindowResize, false);
}

function animate(): void {
  requestAnimationFrame(animate);
  if (coal !== null) {
    coal.rotation.x += 0.0005;
    coal.rotation.z += 0.0005;
    coal.rotation.y += 0.0025;
  }
  controls.update();
  renderer.render(scene, camera);
}

init();
animate();
