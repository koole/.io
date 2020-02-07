import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export interface GLTFLoadable {
  name: string;
  file: string;
}

export interface GLTFSceneObj {
  [key: string]: GLTF;
}