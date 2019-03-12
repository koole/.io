import { Color } from "three/src/math/Color";
import { Scene } from "three/src/scenes/Scene";
import { FogExp2 } from "three/src/scenes/FogExp2";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import { BoxGeometry } from "three/src/geometries/BoxGeometry";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial";
import { Mesh } from "three/src/objects/Mesh";
import { BackSide } from "three/src/constants";

import buildings from "./buildings.json";

import audioLoop from "./loop.ts";

let audio = {
  play: () => {
    return;
  }
};

// Settings
var skyColor = 0xcb1637;
var buildingColor = 0x2b001e;
var buildingSize = 1.5;
var rowLength = 40;
var rows = 12;
var buildingXSpacing = 0.5;
var buildingZSpacing = 1;
var yMulti = 0.75;
var xMulti = 1;
var cameraSpeed = 0.01;
var emptyPlots = 0.2;

// Turn building arrays into usable 3D cube data.
// It's kind of ugly that this runs every time someone opens the website
// I could just copy the output of this function into this file instead,
// but ¯\_(ツ)_/¯
var building_data = buildings.map(building => {
  const height = building.length;
  // A division is the size of a single character in the building string
  // The taller the strings that define a building are, the smaller the
  // divisions are.
  const division = buildingSize / building[0].length;
  let blockData = [];
  // Don't add consecutive cubes with same dimensions,
  // Instead increase height of the previous ones
  for (const layer of building) {
    // With of the block is the amount of non space characters
    // in the string, in our case always "x"
    const width = layer.replace(/\s/g, "").length * division;
    if (blockData.length > 0) {
      const prev = blockData[blockData.length - 1];
      if (prev.width === width) {
        // Update the height of the previous cube
        blockData[blockData.length - 1] = {
          ...prev,
          height: prev.height + division
        };
      } else {
        blockData.push({ width, height: division });
      }
    } else {
      blockData.push({ width, height: division });
    }
  }
  // Add y position to layers
  let level = height * division;
  blockData = blockData.map(data => {
    const newData = { ...data, y: level - data.height / 2 };
    level -= data.height;
    return newData;
  });
  return blockData;
});

// Actual code for the 3D stuff here
let currentRow = 0;
let y = 0;
let x = 0;
let rowBuildings = [];

const scene = new Scene();
scene.background = new Color(skyColor);
scene.fog = new FogExp2(skyColor, 0.1);

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.addEventListener("mousemove", () => audio.play());

camera.position.y = 8;
camera.rotation.z = 0.15;
camera.rotation.y = (-20 * Math.PI) / 180;

// Add a floor with the correct angle
const floorHeight = rows * yMulti;
const floorWidth = 100;
const floorFlatDepth = rows * (buildingSize + buildingZSpacing) * buildingSize;
const floorDepth = Math.sqrt(
  Math.pow(floorFlatDepth, 2) + Math.pow(floorHeight, 2)
);
const floorRotation = Math.asin(floorHeight / floorDepth);

const floor = new PlaneGeometry(floorWidth, floorDepth, 1);
const floormaterial = new MeshBasicMaterial({
  color: buildingColor,
  side: BackSide
});
const floorMesh = new Mesh(floor, floormaterial);
floorMesh.position.x = 0;
floorMesh.position.z = -floorFlatDepth / 2;
// I had to increase the floor position by 2 for some reason.
// Because of this i don't think the above calculation for the floor
// is even correct anymore, but it looks fine.
floorMesh.position.y = floorHeight / 2 + 2;
floorMesh.rotation.x = 1.57 + floorRotation;
scene.add(floorMesh);

// Add the initial rows of buildings
[...Array(rows)].map((n, i) => {
  addRow();
});

// The following function runs every frame
let rowAddMonitor = 0;
function animate() {
  requestAnimationFrame(animate);
  rowAddMonitor += cameraSpeed;
  // If the camera has moved one row of buildings forward,
  // remove the oldest row of buildings (these are now behind the camera)
  if (rowAddMonitor >= buildingSize + buildingZSpacing) {
    rowAddMonitor = 0;
    // Add a new row
    addRow();
    // Remove the oldest row and delete all its cubes
    for (const building of rowBuildings[0]) {
      for (const cube of building) {
        scene.remove(cube);
      }
    }
    rowBuildings.shift();
  }

  // Move the camera and the floor forward at the same speed.
  // We also move the camera up and to the left with the same increments
  // the buildings also use to move up and to the left
  const yOffset =
    yMulti * (buildingSize / (buildingSize + buildingZSpacing)) * cameraSpeed;
  const xOffset =
    xMulti * (buildingSize / (buildingSize + buildingZSpacing)) * cameraSpeed;
  camera.position.z -= cameraSpeed;
  camera.position.y += yOffset;
  camera.position.x += xOffset;
  floorMesh.position.z -= cameraSpeed;
  floorMesh.position.y += yOffset;
  floorMesh.position.x += xOffset;
  renderer.render(scene, camera);
}
animate();

// This function adds a single row of buildings
async function addRow() {
  const z = currentRow * (-buildingSize - buildingZSpacing);
  currentRow += 1;
  y += yMulti;
  x += xMulti;
  const randomOffset = Math.random() - 0.5;
  const buildings = [...Array(rowLength)].map((n, i) => {
    return addBuilding(i, z, randomOffset);
  });
  Promise.all(buildings).then(function(values) {
    rowBuildings.push(values);
  });
}

// This function adds a single building
function addBuilding(i, z, randomOffset) {
  if (Math.random() > emptyPlots) {
    return new Promise(resolve => {
      // Get a random building
      const building =
        building_data[Math.floor(Math.random() * building_data.length)];
      const material = new MeshBasicMaterial({ color: buildingColor });

      // Calculate the center position for this building
      const buildingX =
        x * buildingSize +
        randomOffset +
        (i * buildingSize + i * buildingXSpacing) -
        ((rowLength / 2) * (buildingSize + buildingXSpacing) -
          (buildingSize - buildingXSpacing / 2));

      // Now we add the cubes that make up the building
      const cubes = building.map((data, i) => {
        if (data.width > 0) {
          // We stretch the last cube in a building to make it really tall
          // This way you can never see the bottom of a building.
          const stretch = i + 1 === building.length ? 10 : 0;
          const geometry = new BoxGeometry(
            data.width,
            data.height + stretch,
            data.width
          );
          const cube = new Mesh(geometry, material);
          cube.position.y = y * buildingSize + data.y - stretch / 2;
          cube.position.z = z;
          cube.position.x = buildingX;
          scene.add(cube);
          return cube;
        }
      });
      resolve(cubes);
    });
  }
}

// Add CSS class to start showing the canvas
document.addEventListener("DOMContentLoaded", () => {
  renderer.domElement.classList.add("active");
  audioLoop("/loop.mp3", function(err, loop) {
    if (err) {
      return console.err(err);
    }
    audio = loop;
  });
});

// Handle window resizes
window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);
