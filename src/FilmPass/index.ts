/**
 * @author alteredq / http://alteredqualia.com/
 */

import { FilmShader } from "../shaders/FilmShader";
import { Pass } from "three/examples/jsm/postprocessing/Pass";
import { UniformsUtils } from "three/build/three.module";
import { ShaderMaterial } from "three";

class FilmPass extends Pass {
  uniforms: object;
  material: ShaderMaterial;
  fsQuad: object;
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

  render(renderer, writeBuffer, readBuffer, deltaTime) {
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
