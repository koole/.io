import * as THREE from "three";
import Renderer from "./Renderer";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Revision extends Renderer {
  gltf: THREE.Group;
  controls: any;

  public createScene(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.autoRotate = true;
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.minPolarAngle = Math.PI / 3;
    this.controls.maxPolarAngle = (Math.PI / 3) * 2;

    const white = new THREE.Color(0xffffff);
    white.convertSRGBToLinear();

    this.camera.position.z = 6;
    this.controls.update();

    this.loadGLTF("/revision.glb").then((gltf) => {
      this.gltf = gltf.scene;
      this.scene.add(gltf.scene);
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    const light = new THREE.PointLight(white, 10);
    light.position.set(0, 4, 0);
    this.scene.add(light);

    const topLight = new THREE.DirectionalLight(white, 3);
    topLight.position.set(3, 3, 0);
    this.scene.add(topLight);

    const rightLight = new THREE.DirectionalLight(white, 3);
    rightLight.position.set(-4, 4, 0);
    this.scene.add(rightLight);

    // this.scene.add(new THREE.DirectionalLightHelper(topLight));
    // this.scene.add(new THREE.DirectionalLightHelper(rightLight));
  }

  public animate(): void {
    const T = this.timeStep;
    this.camera.fov = 39.6 - 15 * Math.sin(this.controls.getAzimuthalAngle() - 0.3);
    this.camera.updateProjectionMatrix();
    this.controls.autoRotateSpeed = -2 * T;
    this.controls.update();
    this.finishFrame();
  }
}
