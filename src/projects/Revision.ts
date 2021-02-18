import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MeshLine, MeshLineMaterial } from "three.meshline";
import { readyCallback } from "../header";

const ready = readyCallback();

import Renderer from "./Renderer";
export default class Revision extends Renderer {
  gltf: THREE.Group;

  intialHeadPosition: THREE.Vector3;
  initialLookAtPoint: THREE.Vector3;

  headPosition: THREE.Vector3;

  leftLine: MeshLine;
  leftLineMesh: THREE.Mesh;
  leftEyeOffset: THREE.Vector3;

  rightEyeOffset: THREE.Vector3;
  rightLine: MeshLine;
  rightLineMesh: THREE.Mesh;
  pivot: THREE.Group;

  public createScene(): void {
    const white = new THREE.Color(0xffffff);
    white.convertSRGBToLinear();

    this.camera.position.z = 6;
    this.camera.position.y = 0.1;

    this.initialLookAtPoint = new THREE.Vector3(0.479362, -0.204354, 0.555399);
    this.leftEyeOffset = new THREE.Vector3(0, 0.18, -0.16);
    this.rightEyeOffset = new THREE.Vector3(0, 0.18, 0.16);

    this.pivot = new THREE.Group();
    this.pivot.position.set(0, 0, 0);
    this.scene.add(this.pivot);

    this.loadGLTF("/revision.glb").then((gltf) => {
      this.gltf = gltf.scene;
      this.pivot.add(gltf.scene);
      this.intialHeadPosition = this.gltf.children[5].position.clone();
      this.headPosition = this.intialHeadPosition.clone();

      const lineMaterial = new MeshLineMaterial({
        color: white,
        resolution: new THREE.Vector2(1, 1),
        lineWidth: 0.01,
        sizeAttenuation: 1,
      });
      const points = [this.intialHeadPosition, this.initialLookAtPoint];

      this.leftLine = new MeshLine();
      this.leftLine.setPoints(points);
      this.leftLineMesh = new THREE.Mesh(this.leftLine, lineMaterial);
      this.pivot.add(this.leftLineMesh);

      this.rightLine = new MeshLine();
      this.rightLine.setPoints(points);
      this.rightLineMesh = new THREE.Mesh(this.rightLine, lineMaterial);
      this.pivot.add(this.rightLineMesh);

      // Render once after the scene has loaded
      this.animate();
      this.render();
      ready();

      console.log("Revision");
      console.log("Scene polycount:", this.renderer.info.render.triangles);
      console.log("Active Drawcalls:", this.renderer.info.render.calls);
      console.log("Textures in Memory", this.renderer.info.memory.textures);
      console.log("Geometries in Memory", this.renderer.info.memory.geometries);
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

    const mouseXOffset = this.mouseX / window.innerWidth - 0.625;

    this.camera.position.x = mouseXOffset - 1.5 * this.desktop;
    this.camera.position.z = 5.5 + 0.5 * (1 - this.timeStep);
    this.pivot.rotation.y = mouseXOffset;

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
    this.finishFrame();
  }
}
