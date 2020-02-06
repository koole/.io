import { Scene } from "three/src/scenes/Scene";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export interface GLTFModel {
  name: string;
  file: string;
}

export interface GLTFSceneObj {
  [key: string]: GLTF;
}