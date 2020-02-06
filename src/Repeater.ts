import { Scene } from "three/src/scenes/Scene";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Box3 } from "three/src/math/Box3";
import { Vector3 } from "three/src/math/Vector3";

import { GLTFScenes } from "./index";

// To what depth should objects be placed?
const depth = 40;

export class Repeater {
  private gltf: GLTF;
  private x: number;
  private y: number;
  private z: number;
  private offset: number;
  private scenes: Scene[];
  private index: number;
  private currentFirstScene: number;
  private size: number;

  constructor(
    object: string,
    x: number,
    y: number,
    z: number = -8,
    offset: number = 0
  ) {
    this.gltf = GLTFScenes[object];
    this.x = x;
    this.y = y;
    this.z = z;
    this.offset = offset;
    this.scenes = [];
    this.index = 0;
    this.currentFirstScene = 0;

    // Calculate the size of the object
    // Used for later calculations
    const box = new Box3().setFromObject(this.gltf.scene);
    this.size = box.getSize(new Vector3()).z;
  }

  firstDraw(scene: Scene) {
    // How many objects do we need to fill the set depth?
    const amount = Math.ceil(depth / this.size);
    // Create these objects, each one placed behind the next
    while (this.index < amount) {
      // Create new clone of the GLTF scene and
      // place it at the end of the row
      const clone = this.gltf.scene.clone();
      this.placeSceneAtEnd(clone);

      scene.add(clone);
      this.scenes.push(clone);
    }
  }

  updateLoop(currentZ: number) {
    // Check only the object closest to the camera for each repeating object
    const scene = this.scenes[this.currentFirstScene];
    // Check if object is behind the camera
    if (scene.position.z > currentZ + this.z + this.offset + this.size) {
      // Move the object to the back of the repeating row of objects
      this.placeSceneAtEnd(scene);
      // Update currentFirstScene to be used in next iteration
      this.currentFirstScene =
        (this.currentFirstScene + 1) % this.scenes.length;
    }
  }

  // Moves the item to the end of the row
  private placeSceneAtEnd(scene: Scene) {
    scene.position.set(
      this.x,
      this.y,
      this.z - (this.size + this.offset) * this.index
    );
    this.index = this.index + 1;
  }
}
