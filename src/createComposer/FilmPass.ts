/**
 * @author alteredq / http://alteredqualia.com/
 */

import { FilmShader } from "./shaders/FilmShader";
import { Pass } from "three/examples/jsm/postprocessing/Pass";
import { ShaderMaterial } from "three/src/materials/ShaderMaterial";
import { UniformsUtils } from "three/src/renderers/shaders/UniformsUtils";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { WebGLRenderTarget } from "three/src/renderers/WebGLRenderTarget";
import { Texture } from "three/src/textures/Texture";

class FilmPass extends Pass {
  uniforms: {
    nIntensity: { value: number };
    sIntensity: { value: number };
    sCount: { value: number };
    tDiffuse: { value: Texture };
    time: { value: number };
  };
  material: ShaderMaterial;
  fsQuad: Pass.FullScreenQuad;
  constructor(
    noiseIntensity?: number,
    scanlinesIntensity?: number,
    scanlinesCount?: number
  ) {
    super();

    this.uniforms = UniformsUtils.clone(FilmShader.uniforms);

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: FilmShader.vertexShader,
      fragmentShader: FilmShader.fragmentShader
    });

    if (noiseIntensity !== undefined)
      this.uniforms.nIntensity.value = noiseIntensity;
    if (scanlinesIntensity !== undefined)
      this.uniforms.sIntensity.value = scanlinesIntensity;
    if (scanlinesCount !== undefined)
      this.uniforms.sCount.value = scanlinesCount;

    this.fsQuad = new Pass.FullScreenQuad(this.material);
  }

  render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
    deltaTime: number
  ) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms["time"].value += deltaTime;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }
}

export { FilmPass };
