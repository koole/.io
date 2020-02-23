import { Scene } from "three/src/scenes/Scene";
import { Structure } from "./Structure";

export interface GLTFLoadable {
  name: string;
  file: string;
}

export interface StructureList {
  [key: string]: Structure;
}
