// Three stuff
import { Scene } from "three/src/scenes/Scene";
import { Vector2 } from "three/src/math/Vector2";
import { LinearFilter, RGBFormat } from "three/src/constants";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { WebGLRenderTarget } from "three/src/renderers/WebGLRenderTarget";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";

// Composer passes
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";

// Shaders
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { LUTShader } from "./shaders/LUTShader";

import { FilmPass } from "./FilmPass";
import { makeLUTTexture } from "./makeLUTTexture";

export function createComposer(
  scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer
) {
  //- Create composer
  const rtParameters = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBFormat
  };
  const composer = new EffectComposer(
    renderer,
    new WebGLRenderTarget(1, 1, rtParameters)
  );

  //- Renderer
  // Renders the scene
  const renderBG = new RenderPass(scene, camera);

  //- SMAA
  // Anti-aliasing
  const SMAA = new SMAAPass(window.innerWidth, window.innerHeight);

  //- Bloom
  // A nice soft glow around bright parts of the scene
  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    0.5,
    1.5,
    0.85
  );

  //- Film
  // Adds scanlines and noise
  const Film = new FilmPass(0.35, 0.025, 648);
  Film.renderToScreen = true;

  //- LUT
  // Changes colors
  const effectLUT = new ShaderPass(LUTShader);
  const lut = {
    size: 16,
    texture: makeLUTTexture({ url: "/lut.png", size: 16 })
  };
  effectLUT.renderToScreen = true;
  effectLUT.uniforms.lutMap.value = lut.texture;
  effectLUT.uniforms.lutMapSize.value = lut.size;

  //- Apply passes
  composer.addPass(renderBG);
  composer.addPass(SMAA);
  composer.addPass(bloomPass);
  composer.addPass(Film);
  composer.addPass(effectLUT);

  return composer;
}
