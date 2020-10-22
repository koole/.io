// Three stuff
import { Scene } from "three/src/scenes/Scene";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { sRGBEncoding } from "three/src/constants";

const loader = new GLTFLoader();

let camera: PerspectiveCamera, scene: Scene;

const overlay = document.getElementById("coal-overlay") as HTMLDivElement;
const main = document.getElementById("main") as HTMLDivElement;
const canvas = document.querySelector("#c") as HTMLCanvasElement;
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = sRGBEncoding;
renderer.autoClear = false;

const cutoff = 200;

let coal: Scene | null = null;

let mouseX = 0,
  mouseY = 0;
let xp = 0,
  yp = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animate(): void {
  if (document.body.scrollTop < cutoff + 1) {
    if (coal !== null) {
      // Rotation
      xp += (mouseX - xp) / 6;
      yp += (mouseY - yp) / 6;
      coal.rotation.y -=
        ((window.innerWidth / 2 - xp) / window.innerWidth) * 0.02;
      coal.rotation.x -=
        ((window.innerHeight / 2 - yp) / window.innerHeight) * 0.02;
      coal.rotation.z += 0.001;

      // Fading to black
      camera.fov = 70 - document.body.scrollTop * 0.25;
      camera.updateProjectionMatrix();
      //   const scale = 0.02 - document.body.scrollTop * -0.00015;
      //   coal.scale.set(scale, scale, scale);
      if (overlay !== null) {
        const opacity = Math.min(
          1,
          (document.body.scrollTop / cutoff) *
            (document.body.scrollTop / cutoff) *
            (document.body.scrollTop / cutoff)
        ).toString();
        overlay.style.opacity = opacity;
        main.style.opacity = opacity;
      }
    }
    renderer.render(scene, camera);
  } else {
    main.style.opacity = "1";
    overlay.style.opacity = "1";
  }
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
  // scene.background = new Color(0xf6f2eb);

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
