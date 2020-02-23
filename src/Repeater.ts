import { Scene } from "three/src/scenes/Scene";
import { Structure } from "./Structure";

// To what depth should objects be placed?
const depth = 40;

interface StructureClone {
  object: Scene;
  size: number;
}

export class Repeater {
  private clonesInScene: StructureClone[];
  private currentOffset: number;

  constructor(
    private structures: Structure[],
    private x: number,
    private y: number,
    private z: number = -8,
    private offset: number = 0
  ) {
    this.clonesInScene = [];
    this.currentOffset = 0;
  }

  // Gets a random structure and creates a new clone of it's 3D object
  // to be placed into the renderScene
  getStructureClone() {
    const { object, size } = this.structures[
      Math.floor(Math.random() * this.structures.length)
    ];
    return { object: object.clone(), size: size };
  }

  firstDraw(renderScene: Scene) {
    // How many objects do we need to fill the set depth?
    // Get the smallest structure, and divide the depth by that.
    const amount =
      depth / Math.ceil(Math.min(...this.structures.map(s => s.size)));
    // Create new objects, each one placed behind the next
    for (let step = 0; step < amount; step++) {
      // Create new clone of the GLTF scene and
      // place it at the end of the row
      const structureData = this.getStructureClone();
      this.placeSceneAtEnd(structureData);

      renderScene.add(structureData.object);
      this.clonesInScene.push(structureData);
    }
  }

  updateLoop(renderScene: Scene, currentZ: number) {
    // Check only the object closest to the camera for each repeating object
    let structureCopy = this.clonesInScene[0];
    // Check if object is behind the camera
    if (
      structureCopy.object.position.z >
      currentZ + this.z + this.offset + structureCopy.size * 2
    ) {
      // If there are multiple objects to pick from, choose a new random one
      if (this.structures.length > 1) {
        structureCopy.object.remove();
        structureCopy = this.getStructureClone();
      }
      // Remove the object from the start of the scene list
      this.clonesInScene.shift();
      // Move object back into the fog
      this.placeSceneAtEnd(structureCopy);
      if (this.structures.length > 1) {
        renderScene.add(structureCopy.object);
      }
      // Add the object again at the back of the list
      this.clonesInScene.push(structureCopy);
    }
  }

  // Moves the item to the end of the row
  private placeSceneAtEnd(structureData: StructureClone) {
    this.currentOffset -= structureData.size + this.offset;
    structureData.object.position.set(this.x, this.y, this.currentOffset);
  }
}
