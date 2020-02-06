import { Scene } from "three/src/scenes/Scene";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

//- Settings for placing repeating objects
export interface RepeaterObject {
  object: string;
  x: number;
  y: number;
  z: number;
  offset: number;
  scenes: Scene[];
  index: number;
  currentFirstScene: number;
  size: number;
}

export interface GLTFModel {
  name: string;
  file: string;
}

export interface GLTFSceneObj {
  [key: string]: {
    gltf: GLTF;
    scene: Scene;
    size: number;
  };
}
