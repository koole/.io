import * as THREE from "three";
import Renderer from "./Renderer";

export default class Appmantle extends Renderer {
  gltf: THREE.Group;

  public createScene(): void {
    const white = new THREE.Color(0xffffff);
    white.convertSRGBToLinear();

    this.camera.position.z = 6;

    this.loadGLTF("/appmantle.glb").then((gltf) => {
      this.gltf = gltf.scene;
      this.scene.add(gltf.scene);
    });

    const ambientLight = new THREE.AmbientLight(0xeeeeee);
    this.scene.add(ambientLight);

    const light = new THREE.PointLight(white, 1);
    light.position.set(0, 4, 0);
    this.scene.add(light);

    const topLight = new THREE.DirectionalLight(white, 5);
    topLight.position.set(3, 3, 0);
    this.scene.add(topLight);

    const rightLight = new THREE.DirectionalLight(white, 5);
    rightLight.position.set(-4, 4, 0);
    this.scene.add(rightLight);

    const bottomLight = new THREE.DirectionalLight(white, 1);
    bottomLight.position.set(0, -2, 1);
    this.scene.add(bottomLight);
  }

  public animate(): void {
    const T = this.timeStep;
    const cameraX = this.mouseX / window.innerWidth - 0.5;
    const cameraY = this.mouseY / window.innerHeight - 0.5;
    this.camera.position.x = cameraX * 2;
    this.camera.position.y = -cameraY * 2;
    if (this.gltf) {
      this.gltf.children[2].rotation.y +=
        (this.mouseX / window.innerWidth - 0.5) * 0.05 * T;
      this.gltf.children[2].rotation.x += 0.01 * T;
      this.gltf.children[3].rotation.x += 0.02 * T;
      this.gltf.children[3].rotation.y += 0.02 * T;
    }
    this.finishFrame();
  }
}
