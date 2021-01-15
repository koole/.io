import * as THREE from "three";
import Renderer from "./Renderer";

export default class VetteWebsite extends Renderer {
  gltf: THREE.Group;
  leds: THREE.Mesh<THREE.SphereBufferGeometry, THREE.MeshStandardMaterial>[];
  pivot: THREE.Group;
  hue: number;

  public createScene(): void {
    const white = new THREE.Color(0xffffff);
    white.convertSRGBToLinear();

    this.camera.position.z = 8;

    this.loadGLTF("/vettewebsite.glb").then((gltf) => {
      this.gltf = gltf.scene;
      this.scene.add(gltf.scene);
      this.hue = 0;

      this.pivot = new THREE.Group();
      this.pivot.position.set(0, 0, 0);
      this.scene.add(this.pivot);

      const geometry = new THREE.SphereBufferGeometry(0.015, 6, 3);
      const ledSpace = 0.0458;

      const color = new THREE.Color(0xee0fee);
      color.convertSRGBToLinear();
      this.leds = [...Array(1024).keys()].map((key) => {
        const sphereMaterial = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 1,
        });
        const led = new THREE.Mesh(geometry, sphereMaterial);
        led.parent = this.gltf.children[3];
        led.position.set(
          -0.71 + (key % 32) * ledSpace,
          -0.31 + Math.floor(key / 32) * ledSpace,
          0.52
        );
        this.pivot.add(led);
        return led;
      });
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
    const cameraX = this.mouseX / window.innerWidth - 0.5;
    const cameraY = this.mouseY / window.innerHeight - 0.5;
    this.camera.position.x = cameraX;
    this.camera.position.y = -cameraY;
    if (this.gltf) {
      this.gltf.children[1].rotation.y = this.mouseX / window.innerWidth - 0.5;
      this.gltf.children[2].rotation.y = this.mouseX / window.innerWidth - 0.5;
      this.gltf.children[3].rotation.y = this.mouseX / window.innerWidth - 0.5;
      this.pivot.rotation.y = this.mouseX / window.innerWidth - 0.5;
    }
    console.log(this.leds);
    this.hue = (this.hue + 1) % 360;
    for (let index = 0; index < this.leds.length; index++) {
      const led = this.leds[index];
      const color = new THREE.Color(
        `hsl(${(this.hue + (index % 32)) % 360}, 100%, 50%)`
      );
      color.convertSRGBToLinear();
      led.material.emissive.set(color);
      led.material.color.set(color);
    }
    this.finishFrame();
  }
}
