import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { GLTFModel, GLTFSceneObj } from "./declarations";

export function loader(GLTFModels: GLTFModel[], onFinish: () => void) {
  let GLTFScenes: GLTFSceneObj = {};
  
  // Get terminal element
  const terminal = document.getElementById("terminal") as HTMLDivElement;

  // Function for drawing lines of text to the terminal
  function addToTerminal(text: string) {
    var node = document.createElement("div");
    var textnode = document.createTextNode(text);
    node.appendChild(textnode);
    terminal.appendChild(node);
    return node;
  }

  // Start loading of the GLB files
  addToTerminal("Control software waiting for binary data");
  const gltfLoader = new GLTFLoader();
  let terminalIndex = 0;

  // Keeps track of how many objects have finished loading
  let downloaded = 0;

  // Loop over all objects we need to load
  for (const LoadedModel of GLTFModels) {
    // Set a number for each file we can show to the user
    const thisFileIndex = terminalIndex;
    terminalIndex++;
    const terminalNode = addToTerminal(
      `Starting download of binary blob ${thisFileIndex} of ${GLTFModels.length} (0%)`
    );
    gltfLoader.load(
      LoadedModel.file,
      function(gltf) {

        // We need every mesh in every GLTF scene to draw and cast shadows
        const model = gltf.scene.children[0];
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Store loaded GLTF to in object
        GLTFScenes[LoadedModel.name] = gltf;

        // Update terminal
        terminalNode.innerText = `Starting download of binary blob ${thisFileIndex} of ${GLTFModels.length} (ready)`;
        addToTerminal(`Finished downloading binary blob ${thisFileIndex}`);

        // When all files have finished loading, start the main script
        downloaded++;
        if (downloaded === GLTFModels.length) {
          addToTerminal(`Ready`);
          onFinish();
        }
      },

      // Update the download percentage on progress
      function(xhr) {
        terminalNode.innerText = `Starting download of binary blob ${thisFileIndex} of ${
          GLTFModels.length
        } (${(xhr.loaded / xhr.total) * 100}%)`;
      }
    );
  }

  return GLTFScenes;
}
