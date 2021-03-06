import { Color, DirectionalLight, Group } from "three";
import Renderer from "./Renderer";
import { readyCallback } from "../header";
const ready = readyCallback();

export default class Appmantle extends Renderer {
  gltf: Group;

  public createScene(): void {
    const white = new Color(0xffffff);
    white.convertSRGBToLinear();

    this.camera.position.z = 7 + 0.5 * (1 - this.timeStep);

    this.loadGLTF("/appmantle.glb").then((gltf) => {
      this.gltf = gltf.scene;
      this.scene.add(gltf.scene);
      this.gltf.children[0].rotation.y = 0.5;
      this.animate();
      this.render();
      ready();

      console.log("%c\nAppmantle", "font-weight: bold; font-size: 1.2em;");
      console.table({
        "Scene polycount": this.renderer.info.render.triangles,
        "Active Drawcalls": this.renderer.info.render.calls,
        "Textures in Memory": this.renderer.info.memory.textures,
        "Geometries in Memory": this.renderer.info.memory.geometries,
      });
    });

    const topLight = new DirectionalLight(white, 5);
    topLight.position.set(3, 3, 0);
    this.scene.add(topLight);

    const rightLight = new DirectionalLight(white, 5);
    rightLight.position.set(-4, 4, 0);
    this.scene.add(rightLight);
  }

  public animate(): void {
    const T = this.timeStep;
    const mouseXOffset = this.mouseX / window.innerWidth - 0.625;
    const mouseYOffset = this.mouseY / window.innerHeight - 0.5;

    const cameraX = mouseXOffset;
    const cameraY = mouseYOffset;
    this.camera.position.x = cameraX;
    this.camera.position.y = -cameraY - 0.5;
    this.camera.position.z = 7 + 0.5 * (1 - this.timeStep);

    if (this.gltf) {
      this.gltf.children[0].rotation.x += 0.005 * T;
      this.gltf.children[0].rotation.z += 0.001 * T;
    }
    this.finishFrame();
  }
}
