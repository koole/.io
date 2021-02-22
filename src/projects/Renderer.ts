import {
  ACESFilmicToneMapping,
  Clock,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
} from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "stats.js";

import { Easing } from "../utils";

const easeSpeed = 0.01;
const exposure = 1.2;
const mobileBreakpoint = 800;

let mouseX = 0;
let mouseY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

class Renderer {
  private container: HTMLDivElement;
  private width: number;
  private height: number;
  private progress: number;
  private status: "starting" | "stopping" | "playing" | "stopped";
  private gltfLoader: GLTFLoader;

  public renderer: WebGLRenderer;
  public animating: boolean;
  public scene: Scene;
  public camera: PerspectiveCamera;
  public timeStep: number;
  public mouseX: number;
  public mouseY: number;
  public desktop: 0 | 1;

  clock: Clock;
  stats: Stats;

  constructor(container: HTMLDivElement) {
    this.stats = new Stats();
    this.stats.showPanel(0);
    this.stats.dom.className = "statsjs";
    this.stats.dom.style.position = "absolute";
    container.appendChild(this.stats.dom);

    this.gltfLoader = new GLTFLoader();
    this.clock = new Clock();

    // Canvas size
    this.container = container;
    this.width = container.offsetWidth;
    this.height = container.offsetHeight;

    // Basic scene setup
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(39.6, this.width / this.height, 3, 12);

    this.desktop = window.innerWidth >= mobileBreakpoint ? 1 : 0;

    // Create renderer and add to canvas
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      stencil: false,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = exposure;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = sRGBEncoding;
    container.appendChild(this.renderer.domElement);

    // Bind methods to class
    this.createScene = this.createScene.bind(this);
    this.animate = this.animate.bind(this);
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.loop = this.loop.bind(this);
    this.render = this.render.bind(this);
    this.finishFrame = this.finishFrame.bind(this);
    this.startAnimation = this.startAnimation.bind(this);
    this.stopAnimation = this.stopAnimation.bind(this);
    this.loadGLTF = this.loadGLTF.bind(this);

    // Update the canvas and camera when the window resizes
    window.addEventListener("resize", () => {
      this.resizeCanvas();
    });

    this.renderer.domElement.addEventListener("touchmove", (e) => {
      const evt = typeof e.originalEvent === "undefined" ? e : e.originalEvent;
      const touch = evt.touches[0] || evt.changedTouches[0];
      this.mouseX = touch.pageX;
    });

    this.renderer.domElement.addEventListener("touchdown", (e) => {
      const evt = typeof e.originalEvent === "undefined" ? e : e.originalEvent;
      const touch = evt.touches[0] || evt.changedTouches[0];
      this.mouseY = touch.pageY;
    });

    // Eased mouse position coordinates
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;

    // For slowing down / speeding up time when appearing into view
    this.animating = false;
    this.progress = 0;
    this.timeStep = 0;
    this.status = "stopped";

    // Create the scene
    this.createScene();

    // Render once so the first frame is visible before the animation having started
    this.finishFrame();
    // Start animation loop
    this.loop();
  }

  protected resizeCanvas(): void {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.desktop = window.innerWidth >= mobileBreakpoint ? 1 : 0;

    // Rerender if this project was not animating while resizing
    if (!this.animating) {
      requestAnimationFrame(this.render);
    }
  }

  protected loop(): void {
    requestAnimationFrame(this.loop);
    this.stats.begin();
    if (this.animating) {
      this.mouseX += Math.floor((mouseX - this.mouseX) / 20) * this.timeStep;
      this.mouseY += Math.floor((mouseY - this.mouseY) / 20) * this.timeStep;

      if (this.status === "starting") {
        this.progress = this.progress + easeSpeed;
        this.timeStep = Easing.Cubic.InOut(this.progress);
        if (this.progress >= 1) {
          this.progress = 1;
          this.status = "playing";
        }
      }

      if (this.status === "stopping") {
        this.progress = this.progress - easeSpeed;
        this.timeStep = Easing.Cubic.InOut(this.progress);
        if (this.progress <= 0) {
          this.progress = 0;
          this.status = "stopped";
          this.animating = false;
        }
      }

      this.animate();
    }
    this.stats.end();
  }

  protected finishFrame(): void {
    this.render();
  }

  protected render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  protected loadGLTF(url: string): Promise<GLTF> {
    return new Promise((resolve) => {
      this.gltfLoader.load(url, function (gltf) {
        // // We need every mesh in every GLTF scene to draw and cast shadows
        // for (const model of gltf.scene.children) {
        //   model.traverse((child) => {
        //     child.castShadow = true;
        //     child.receiveShadow = true;
        //   });
        // }
        resolve(gltf);
      });
    });
  }

  public createScene(): void {
    return;
  }

  public animate(): void {
    this.render();
  }

  public startAnimation(): void {
    if (this.animating === false) {
      this.animating = true;
      this.status = "starting";
    }
  }

  public stopAnimation(): void {
    if (
      this.animating === true &&
      this.status !== "stopping" &&
      this.status !== "stopped"
    ) {
      this.status = "stopping";
    }
  }
}

export default Renderer;
