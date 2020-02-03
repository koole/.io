import { Color } from "three/src/math/Color";
import { Scene } from "three/src/scenes/Scene";
import { FogExp2 } from "three/src/scenes/FogExp2";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import {
  BoxGeometry,
  BoxBufferGeometry
} from "three/src/geometries/BoxGeometry";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial";
import { Mesh } from "three/src/objects/Mesh";
import {
  BackSide,
  LinearFilter,
  RGBFormat,
  NoBlending
} from "three/src/constants";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass";

import {
  WebGLRenderTarget,
  HemisphereLight,
  DirectionalLight,
  DirectionalLightHelper,
  MeshPhongMaterial,
  PlaneHelper,
  MeshLambertMaterial,
  Vector2,
  ShaderMaterial
} from "three";

import { makeLUTTexture } from "./makeLUT.ts";
import { lutShader } from "./lutShader.ts";

import buildings from "./buildings.json";
import {
  UniformsUtils,
  Matrix4,
  Box3,
  Vector3,
  AnimationMixer
} from "three/build/three.module";

// Stores 3D objects after loading
const load_objects = [
  { name: "road", file: "road.glb" },
  { name: "left-wall", file: "left-wall.glb" },
  { name: "tower", file: "tower.glb" }
];
const objects = {};

function main() {
  var towerAnimation;
  var cursorPosition = 0;

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
    name: "runner",
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

  // Tubes
  {
    const cubeGeo = new BoxBufferGeometry(30, 0.1, 0.1);
    const cubeMat = new MeshLambertMaterial({ color: "#fff" });
    const mesh = new Mesh(cubeGeo, cubeMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(0, 1.5, -5);
    scene.add(mesh);
    const mesh2 = mesh.clone();
    mesh2.position.set(0, 1.5, -5.3);
    scene.add(mesh2);
    const mesh3 = mesh.clone();
    mesh3.position.set(0, 1.5, -15);
    scene.add(mesh3);
    const mesh4 = mesh.clone();
    mesh4.position.set(0, 1.5, -15.3);
    scene.add(mesh4);
  }

  const effectLUT = new ShaderPass(lutShader);
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

  {
    const model = objects["road"];
    for (let i = 0; i < 5; i++) {
      const sceneCopy = model.scene.clone();
      sceneCopy.position.set(3.5, 2, 0 - model.size * i);
      scene.add(sceneCopy);
    }

    for (let i = 0; i < 5; i++) {
      const sceneCopy = model.scene.clone();
      sceneCopy.position.set(1, 0, 0 - model.size * i);
      scene.add(sceneCopy);
    }
  }

  {
    var model = objects["left-wall"];
    for (var i = 0; i < 5; i++) {
      var sceneCopy = model.scene.clone();
      sceneCopy.position.set(5.5, 2.5, 0 - model.size / 2 - model.size * i);
      scene.add(sceneCopy);
    }
  }

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
  composer.addPass(effectLUT);

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

    if ( towerAnimation ) towerAnimation.update( delta );

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      const canvasAspect = canvas.clientWidth / canvas.clientHeight;
      camera.aspect = canvasAspect;
      camera.updateProjectionMatrix();
      composer.setSize(canvas.width, canvas.height);
    }

    // moveZ((cursorPosition / document.body.clientWidth) * 100 - 50);

    camera.rotation.y =
      ((-32 - (cursorPosition / document.body.clientWidth) * 8) *
        Math.PI) /
      180;
    camera.position.x = (cursorPosition / document.body.clientWidth) * 0.5;
    camera.position.y =
      (cursorPosition / document.body.clientWidth) * 0.2 + 3;

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
    shadowLight.position.set(5, 15, -40 + z);
    shadowLight.target.position.set(0, 0, 5 + z);
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

// main();

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
