import {
  BufferAttribute,
  BufferGeometry,
  CircleBufferGeometry,
  Color,
  DirectionalLight,
  FrontSide,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import Renderer from "./Renderer";
import { setHandler } from "../vw-client";
import { readyCallback } from "../header";
const ready = readyCallback();

export default class VetteWebsite extends Renderer {
  gltf: Group;
  leds: Mesh;
  pivot: Group;
  frame: number;

  public createScene(): void {
    const white = new Color(0xffffff);
    white.convertSRGBToLinear();

    this.camera.position.z = 7 + 1.5 * (1 - this.timeStep);

    this.loadGLTF("/vettewebsite.glb").then((gltf) => {
      this.gltf = gltf.scene;
      this.scene.add(gltf.scene);
      this.frame = 0;

      this.pivot = new Group();
      this.pivot.position.set(0, 0, 0);
      this.scene.add(this.pivot);

      const geometry = new CircleBufferGeometry(0.015, 6);
      const ledSpace = 0.0458;

      const sphereMaterial = new MeshStandardMaterial({
        roughness: 0,
        color: 0xffffff,
        vertexColors: true,
        side: FrontSide,
      });

      const createLED = (key: number): BufferGeometry => {
        // const color = new Color();
        const led = geometry.clone();
        const count = led.attributes.position.count;
        // Create color attribute for each LED so we can easily change it later
        led.setAttribute(
          "color",
          new BufferAttribute(new Float32Array(count * 3), 3)
        );
        led.applyMatrix4(
          new Matrix4().makeTranslation(
            0.71 - (key % 32) * ledSpace,
            -0.31 + Math.floor(key / 32) * ledSpace,
            0.54
          )
        );
        return led;
      };

      // Create LEDs and merge them into a single BufferGeometry for performance.
      const ledsGeometry = BufferGeometryUtils.mergeBufferGeometries(
        [...Array(1024).keys()].map(createLED)
      );
      this.leds = new Mesh(ledsGeometry, sphereMaterial);
      this.pivot.add(this.leds);

      // The vw-client calls this function with an array of colors when the panel
      // changes.
      setHandler((colors) => {
        // 1024 LEDs
        for (let i = 0; i < 1024; i++) {
          // 8 vertexes per LED
          for (let vi = 0; vi < 8; vi++) {
            const color = new Color(colors[i], colors[i], colors[i]);
            color.convertSRGBToLinear();
            this.leds.geometry.attributes.color.setXYZ(
              i * 8 + vi,
              color.r * 4,
              color.g * 4,
              color.b * 4
            );
          }
        }
        this.leds.geometry.attributes.color.needsUpdate = true;
      });

      // Render once after the scene has loaded
      this.animate();
      this.render();

      ready();

      console.log("VetteWebsite");
      console.log("Scene polycount:", this.renderer.info.render.triangles);
      console.log("Active Drawcalls:", this.renderer.info.render.calls);
      console.log("Textures in Memory", this.renderer.info.memory.textures);
      console.log("Geometries in Memory", this.renderer.info.memory.geometries);
    });

    const topLight = new DirectionalLight(white, 2);
    topLight.position.set(3, 3, 0);
    this.scene.add(topLight);

    const rightLight = new DirectionalLight(white, 3);
    rightLight.position.set(-4, 4, 4);
    this.scene.add(rightLight);
  }

  public animate(): void {
    const mouseXOffset =
      this.mouseX / window.innerWidth -
      0.625 +
      (Math.sin(this.frame / 200) / 4) * this.timeStep;
    // const mouseYOffset = this.mouseY / window.innerHeight - 0.5;

    const cameraX = mouseXOffset;
    // const cameraY = mouseYOffset;
    this.camera.position.x = cameraX - 1.8 * this.desktop;
    // this.camera.position.y = -cameraY;
    this.camera.position.z = 7 + 1.5 * (1 - this.timeStep);
    if (this.gltf) {
      this.gltf.children[0].rotation.y = mouseXOffset;
      this.gltf.children[1].rotation.y = mouseXOffset;
      this.gltf.children[2].rotation.y = mouseXOffset;
      this.pivot.rotation.y = mouseXOffset;
    }
    this.frame++;
    this.finishFrame();
  }
}
