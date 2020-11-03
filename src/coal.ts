// Three stuff
import { Scene } from "three/src/scenes/Scene";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { sRGBEncoding } from "three/src/constants";

const loader = new GLTFLoader();

let camera: PerspectiveCamera, scene: Scene;

const overlay = document.getElementById("coal-overlay") as HTMLVideoElement;
const canvas = document.querySelector("#c") as HTMLCanvasElement;
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = sRGBEncoding;
renderer.autoClear = false;

let coal: Scene | null = null;

let mouseX = 0,
  mouseY = 0;
let xp = 0,
  yp = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

let playing = document.body.scrollTop > 0;
let played = document.body.scrollTop > 0;

window.addEventListener("scroll", (e) => {
  if (document.body.scrollTop > 0 && playing === false) {
    overlay.play();
    setTimeout(() => {
      canvas.style.display = "none";
      played = true;
    }, 1000);

    playing = true;
  }
});

function animate(): void {
  if (coal !== null && played === false) {
    // Rotation
    xp += (mouseX - xp) / 6;
    yp += (mouseY - yp) / 6;
    coal.rotation.y -=
      ((window.innerWidth / 2 - xp) / window.innerWidth) * 0.02;
    coal.rotation.x -=
      ((window.innerHeight / 2 - yp) / window.innerHeight) * 0.02;
    coal.rotation.z += 0.001;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function init(): void {
  camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );
  camera.position.z = 0.8;

  scene = new Scene();

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
  animate();
}

init();
