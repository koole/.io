import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MeshLine, MeshLineMaterial } from "three.meshline";
import { readyCallback } from "../header";
const ready = readyCallback();

import Renderer from "./Renderer";
export default class Revision extends Renderer {
  gltf: THREE.Group;
  controls: OrbitControls;

  intialHeadPosition: THREE.Vector3;
  initialLookAtPoint: THREE.Vector3;

  headPosition: THREE.Vector3;

  leftLine: MeshLine;
  leftLineMesh: THREE.Mesh;
  leftEyeOffset: THREE.Vector3;

  rightEyeOffset: THREE.Vector3;
  rightLine: MeshLine;
  rightLineMesh: THREE.Mesh;

  public createScene(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.autoRotate = true;
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.minPolarAngle = Math.PI / 2;
    this.controls.maxPolarAngle = Math.PI / 2;

    const white = new THREE.Color(0xffffff);
    white.convertSRGBToLinear();

    const lineColor = new THREE.Color(0xffd600);
    lineColor.convertSRGBToLinear();
    const sphereColor = new THREE.Color(0xffb309);
    sphereColor.convertSRGBToLinear();

    this.camera.position.z = 6;
    this.controls.update();

    this.initialLookAtPoint = new THREE.Vector3(0.479362, -0.204354, 0.555399);
    this.leftEyeOffset = new THREE.Vector3(0, 0.18, -0.16);
    this.rightEyeOffset = new THREE.Vector3(0, 0.18, 0.16);

    this.loadGLTF("/revision.glb").then((gltf) => {
      this.gltf = gltf.scene;
      this.scene.add(gltf.scene);
      this.intialHeadPosition = this.gltf.children[5].position.clone();
      this.headPosition = this.intialHeadPosition.clone();

      const lineMaterial = new MeshLineMaterial({
        color: lineColor,
        resolution: new THREE.Vector2(1, 1),
        lineWidth: 0.01,
        sizeAttenuation: 1,
      });
      const points = [this.intialHeadPosition, this.initialLookAtPoint];

      this.leftLine = new MeshLine();
      this.leftLine.setPoints(points);
      this.leftLineMesh = new THREE.Mesh(this.leftLine, lineMaterial);
      this.scene.add(this.leftLineMesh);

      this.rightLine = new MeshLine();
      this.rightLine.setPoints(points);
      this.rightLineMesh = new THREE.Mesh(this.rightLine, lineMaterial);
      this.scene.add(this.rightLineMesh);

      // Render once after the scene has loaded
      this.animate();
      this.render();
      ready();
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    const light = new THREE.PointLight(white, 10);
    light.position.set(0, 4, 0);
    this.scene.add(light);

    const topLight = new THREE.DirectionalLight(white, 2);
    topLight.position.set(3, 3, 0);
    this.scene.add(topLight);

    const rightLight = new THREE.DirectionalLight(white, 2);
    rightLight.position.set(-2, 4, -3);
    this.scene.add(rightLight);

    const leftLight = new THREE.DirectionalLight(white, 2);
    leftLight.position.set(-2, 4, 3);
    this.scene.add(leftLight);

    // this.scene.add(new THREE.DirectionalLightHelper(topLight));
    // this.scene.add(new THREE.DirectionalLightHelper(leftLight));
    // this.scene.add(new THREE.DirectionalLightHelper(rightLight));
  }

  public animate(): void {
    const T = this.timeStep;
    this.camera.fov =
      35 -
      11 * Math.sin(this.controls.getAzimuthalAngle() - 0.4) * this.timeStep;
    this.camera.updateProjectionMatrix();
    this.controls.autoRotateSpeed = -2 * T;
    this.controls.update();
    this.finishFrame();
    if (this.initialLookAtPoint) {
      // Head position
      this.headPosition.addVectors(
        this.intialHeadPosition,
        new THREE.Vector3(
          (0.5 - Math.sin(Date.now() / 1600)) * 0.2 * T,
          (0.5 - Math.sin(Date.now() / 2300 + 1.52)) * 0.1 * T,
          (0.5 - Math.sin(Date.now() / 2000 + 0.1)) * 0.2 * T
        )
      );
      this.gltf.children[5].position.copy(this.headPosition);

      // Look at point & lines
      const lookAtPoint = new THREE.Vector3().addVectors(
        this.initialLookAtPoint,
        new THREE.Vector3(
          -(this.mouseY / window.innerHeight) * 0.3,
          -(this.mouseY / window.innerHeight) * 0.56,
          (this.mouseX / window.innerWidth) * 0.36
        )
      );
      const leftPoints = [
        new THREE.Vector3().addVectors(this.headPosition, this.leftEyeOffset),
        lookAtPoint,
      ];
      this.leftLine.setPoints(leftPoints);
      this.leftLineMesh.geometry.dispose();
      this.leftLineMesh.geometry = this.leftLine;

      const rightPoints = [
        new THREE.Vector3().addVectors(this.headPosition, this.rightEyeOffset),
        lookAtPoint,
      ];
      this.rightLine.setPoints(rightPoints);
      this.rightLineMesh.geometry.dispose();
      this.rightLineMesh.geometry = this.rightLine;
    }
  }
}
