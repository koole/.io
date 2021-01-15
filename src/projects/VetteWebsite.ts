import * as THREE from "three";
import Renderer from "./Renderer";
import { currentColors } from "../vw-client";

export default class VetteWebsite extends Renderer {
  gltf: THREE.Group;
  leds: THREE.Mesh<THREE.SphereBufferGeometry, THREE.MeshStandardMaterial>[];
  pivot: THREE.Group;
  frame: number;

  public createScene(): void {
    const white = new THREE.Color(0xffffff);
    white.convertSRGBToLinear();

    this.camera.position.z = 8;

    this.loadGLTF("/vettewebsite.glb").then((gltf) => {
      this.gltf = gltf.scene;
      this.scene.add(gltf.scene);
      this.frame = 0;

      this.pivot = new THREE.Group();
      this.pivot.position.set(0, 0, 0);
      this.scene.add(this.pivot);

      const geometry = new THREE.SphereBufferGeometry(0.015, 6, 3);
      const ledSpace = 0.0458;

      const color = new THREE.Color(0x000000);
      color.convertSRGBToLinear();
      this.leds = [...Array(1024).keys()].map((key) => {
        const sphereMaterial = new THREE.MeshStandardMaterial({
          roughness: 0,
          color: color,
          emissive: color,
          emissiveIntensity: 1.5,
        });
        const led = new THREE.Mesh(geometry, sphereMaterial);
        led.parent = this.gltf.children[3];
        led.position.set(
          0.71 - (key % 32) * ledSpace,
          -0.31 + Math.floor(key / 32) * ledSpace,
          0.52
        );
        this.pivot.add(led);
        return led;
      });
      // Render once after the scene has loaded
      this.render();
    });

    const topLight = new THREE.DirectionalLight(white, 2);
    topLight.position.set(3, 3, 0);
    this.scene.add(topLight);

    const rightLight = new THREE.DirectionalLight(white, 3);
    rightLight.position.set(-4, 4, 4);
    this.scene.add(rightLight);

    // this.scene.add(new THREE.DirectionalLightHelper(topLight));
    // this.scene.add(new THREE.DirectionalLightHelper(rightLight));
  }

  public animate(): void {
    const mouseXOffset =
      this.mouseX / window.innerWidth -
      0.625 +
      (Math.sin(this.frame / 200) / 4) * this.timeStep;
    const mouseYOffset = this.mouseY / window.innerHeight - 0.5;

    const cameraX = mouseXOffset;
    const cameraY = mouseYOffset;
    this.camera.position.x = cameraX;
    this.camera.position.y = -cameraY;
    if (this.gltf) {
      this.gltf.children[1].rotation.y = mouseXOffset;
      this.gltf.children[2].rotation.y = mouseXOffset;
      this.gltf.children[3].rotation.y = mouseXOffset;
      this.pivot.rotation.y = mouseXOffset;
    }
    this.frame++;

    if (currentColors.length === 1024) {
      for (let index = 0; index < this.leds.length; index++) {
        const led = this.leds[index];
        const color = new THREE.Color(...currentColors[index]);
        color.convertSRGBToLinear();
        led.material.emissive.set(color);
        led.material.color.set(color);
      }
    }
    this.finishFrame();
  }
}
