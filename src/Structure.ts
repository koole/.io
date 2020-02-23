import { Scene } from "three/src/scenes/Scene";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Box3 } from "three/src/math/Box3";
import { Vector3 } from "three/src/math/Vector3";
import { AnimationClip } from "three/src/animation/AnimationClip";

export class Structure {
  public object: Scene;
  public size: number;
  public animations: AnimationClip[];

  constructor(public gltf: GLTF) {
    this.object = gltf.scene;
    this.animations = gltf.animations;

    // Calculate size, used by Repeater
    const box = new Box3().setFromObject(this.object);
    this.size = box.getSize(new Vector3()).z;
  }
}
