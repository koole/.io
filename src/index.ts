import { Color } from "three/src/math/Color";
import { Scene } from "three/src/scenes/Scene";
import { FogExp2 } from "three/src/scenes/FogExp2";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import { BoxBufferGeometry } from "three/src/geometries/BoxGeometry";
import { MeshLambertMaterial } from "three/src/materials/MeshLambertMaterial";
import { Mesh } from "three/src/objects/Mesh";
import { BackSide, LinearFilter, RGBFormat } from "three/src/constants";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass";

import {
  Box3,
  Vector3,
  AnimationMixer,
  HemisphereLight,
  DirectionalLight,
  WebGLRenderTarget,
  DirectionalLightHelper
} from "three";

import { makeLUTTexture } from "./makeLUT.ts";
import { lutShader } from "./lutShader.ts";

// GLTF models
const load_objects = [
  { name: "road", file: "road-tex.glb" },
  { name: "left-wall", file: "left-wall.glb" },
  { name: "tower", file: "tower.glb" },
  { name: "road-pillars", file: "road-pillars.glb" },
  { name: "pillars-base", file: "pillars-base.glb" }
];
// Stores 3D objects after loading
const objects = {};

// To what depth should objects be placed?
const depth = 40;

const repeaters = [
  {
    object: "road",
    x: 3.5,
    y: 3.5,
    z: -8,
    offset: 0,
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: null
  },
  {
    object: "road",
    x: 0.6,
    y: 1.3,
    z: -8,
    offset: 0,
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: null
  },
  {
    object: "pillars-base",
    x: 3.5,
    y: 3.5,
    z: -8,
    offset: 0,
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: null
  },
  {
    object: "left-wall",
    x: 5.5,
    y: 2.5,
    z: -8,
    offset: 0,
    scenes: [],
    index: 0,
    currentFirstScene: 0,
    size: null
  }
];

function main() {
  var towerAnimation;
  var cursorPosition = 0;
  let z = 0;

  const canvas = document.querySelector("#c");
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;

  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const lut = {
    url: "/lut.png",
    size: 16
  };
  lut.texture = makeLUTTexture(lut);

  // Settings
  var skyColor = 0xcccccc;
  var buildingColor = 0x000000;

  const scene = new Scene();
  scene.background = new Color(skyColor);
  scene.fog = new FogExp2(skyColor, 0.15);

  const effectLUT = new ShaderPass(lutShader);
  effectLUT.renderToScreen = true;

  const FXAA = new ShaderPass(FXAAShader);
  effectLUT.renderToScreen = true;

  // Hemisphere light
  {
    const intensity = 1;
    const light = new HemisphereLight(skyColor, buildingColor, intensity);
    scene.add(light);
  }

  // Shadow casting light
  var shadowLight;
  var shadowLightHelper;
  {
    const color = 0xffffff;
    const intensity = 2;
    shadowLight = new DirectionalLight(color, intensity);
    shadowLight.position.set(10, 10, -25);
    shadowLight.target.position.set(-5, 0, 5);
    shadowLight.castShadow = true;
    shadowLight.shadow.mapSize.width = 2014; // default
    shadowLight.shadow.mapSize.height = 2014; // default
    scene.add(shadowLight);
    scene.add(shadowLight.target);

    shadowLightHelper = new DirectionalLightHelper(shadowLight);
    scene.add(shadowLightHelper);
  }

  // Floor
  {
    const plane = new PlaneGeometry(100, 100, 1);
    const planeMat = new MeshLambertMaterial({
      color: 0xff5555,
      side: BackSide
    });
    const mesh = new Mesh(plane, planeMat);
    mesh.receiveShadow = true;
    mesh.position.set(0, -2.5, 0);
    mesh.rotation.x = Math.PI / 2;
    scene.add(mesh);
  }

  // // Tubes
  // {
  //   const cubeGeo = new BoxBufferGeometry(30, 0.2, 0.2);
  //   const cubeMat = new MeshLambertMaterial({ color: "#fff" });
  //   const mesh = new Mesh(cubeGeo, cubeMat);
  //   mesh.castShadow = true;
  //   mesh.receiveShadow = true;
  //   mesh.position.set(0, 1.5, -4);
  //   scene.add(mesh);
  //   const mesh2 = mesh.clone();
  //   mesh2.position.set(0, 1.5, -3.5);
  //   scene.add(mesh2);
  //   const mesh3 = mesh.clone();
  //   mesh3.position.set(0, 1.5, -14);
  //   scene.add(mesh3);
  //   const mesh4 = mesh.clone();
  //   mesh4.position.set(0, 1.5, -13.5);
  //   scene.add(mesh4);
  // }

  // // Roads
  // {
  //   const model = objects["road"];
  //   const amount = Math.ceil(depth / model.size);

  //   for (let i = 0; i < amount; i++) {
  //     const sceneCopy = model.scene.clone();
  //     sceneCopy.position.set(3.5, 3.5, -6 - model.size * i);
  //     scene.add(sceneCopy);
  //   }

  //   for (let i = 0; i < amount; i++) {
  //     const sceneCopy = model.scene.clone();
  //     sceneCopy.position.set(0.6, 1.3, -6 - model.size * i);
  //     scene.add(sceneCopy);
  //   }
  // }

  // Left wall
  // {
  //   var model = objects["left-wall"];
  //   const amount = Math.ceil(depth / model.size);

  //   for (var i = 0; i < amount; i++) {
  //     var sceneCopy = model.scene.clone();
  //     sceneCopy.position.set(5.5, 2.5, 0 - model.size / 2 - model.size * i);
  //     scene.add(sceneCopy);
  //   }
  // }

  // // Road pillars
  // {
  //   var model = objects["pillars-base"];
  //   const amount = Math.ceil(depth / model.size);

  //   for (var i = 0; i < amount; i++) {
  //     var sceneCopy = model.scene.clone();
  //     sceneCopy.position.set(3.5, 3.5, -6 - model.size * i);
  //     scene.add(sceneCopy);
  //   }
  // }

  for (const repeater of repeaters) {
    const { object, x, y, z, offset, scenes } = repeater;
    const model = objects[object];
    repeater.size = model.size;
    const amount = Math.ceil(depth / repeater.size);

    for (let i = 0; i < amount; i++) {
      repeater.index = i;
      const objectScene = model.scene.clone();
      objectScene.position.set(
        repeater.x,
        repeater.y,
        repeater.z - (repeater.size + repeater.offset) * repeater.index
      );
      scene.add(objectScene);
      scenes.push(objectScene);
    }
  }

  // Rotating tower
  {
    const model = objects["tower"];
    const gltf = model.gltf;
    gltf.scene.position.set(5.5, 4, -6);
    towerAnimation = new AnimationMixer(gltf.scene);
    var action = towerAnimation.clipAction(gltf.animations[0]);
    action.play();
    scene.add(gltf.scene);
  }

  const renderBG = new RenderPass(scene, camera);
  const SSAO = new SSAOPass(scene, camera);
  const SMAA = new SMAAPass(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );

  const rtParameters = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBFormat
  };
  const composer = new EffectComposer(
    renderer,
    new WebGLRenderTarget(1, 1, rtParameters)
  );

  composer.addPass(renderBG);
  // composer.addPass(SSAO);
  // composer.addPass(FXAA);
  composer.addPass(effectLUT);
  composer.addPass(SMAA);

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = (canvas.clientWidth * window.devicePixelRatio) | 0;
    const height = (canvas.clientHeight * window.devicePixelRatio) | 0;

    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  let then = 0;
  function render(now) {
    now *= 0.001; // convert to seconds
    const delta = now - then;
    then = now;

    if (towerAnimation) towerAnimation.update(delta);

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      const canvasAspect = canvas.clientWidth / canvas.clientHeight;
      camera.aspect = canvasAspect;
      camera.updateProjectionMatrix();
      composer.setSize(canvas.width, canvas.height);
    }

    // moveZ((cursorPosition / document.body.clientWidth) * 100 - 50);
    z = z - 0.05;

    for (const repeater of repeaters) {
      const firstScene = repeater.scenes[repeater.currentFirstScene];
      if (
        firstScene.position.z >
        z + repeater.z + repeater.offset + repeater.size
      ) {
        firstScene.position.set(
          repeater.x,
          repeater.y,
          repeater.z - (repeater.size + repeater.offset) * repeater.index
        );
        repeater.index = repeater.index + 1;
        repeater.currentFirstScene =
          (repeater.currentFirstScene + 1) % repeater.scenes.length;
      }
    }

    moveZ(z);

    camera.rotation.y =
      ((-32 - (cursorPosition / document.body.clientWidth) * 8) * Math.PI) /
      180;
    camera.position.x = (cursorPosition / document.body.clientWidth) * 0.5;
    camera.position.y =
      (cursorPosition / document.body.clientWidth) * 0.5 + 2.5;

    renderer.render(scene, camera);

    const lutInfo = lut;
    const effect = effectLUT;
    const lutTexture = lutInfo.texture;
    effect.uniforms.lutMap.value = lutTexture;
    effect.uniforms.lutMapSize.value = lutInfo.size;

    composer.render(delta);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
  renderer.domElement.classList.add("active");

  document.onmousemove = getCursor;
  function moveZ(z) {
    camera.position.z = z;
    shadowLight.position.set(7.5, 15, -30 + z);
    shadowLight.target.position.set(0, 0, -5 + z);
    shadowLightHelper.update();
  }

  function getCursor(e) {
    cursorPosition = window.Event
      ? e.pageX
      : event.clientX +
        (document.documentElement.scrollLeft
          ? document.documentElement.scrollLeft
          : document.body.scrollLeft);
  }
}

function loader() {
  const gltfLoader = new GLTFLoader();
  let i = 0;
  for (const LoadObject of load_objects) {
    gltfLoader.load(LoadObject.file, function(gltf) {
      const model = gltf.scene.children[0];
      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      const box = new Box3().setFromObject(gltf.scene);
      const boxSize = box.getSize(new Vector3()).z;

      objects[LoadObject.name] = {
        gltf: gltf,
        scene: gltf.scene,
        size: boxSize
      };

      i++;

      if (i === load_objects.length) {
        main();
      }
    });
  }
}

loader();
