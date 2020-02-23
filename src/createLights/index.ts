import { Scene } from "three/src/scenes/Scene";

import { HemisphereLight } from "three/src/lights/HemisphereLight";
import { DirectionalLight } from "three/src/lights/DirectionalLight";

export function createLights(
  renderScene: Scene,
  skyColor: number,
  shadowColor: number
): DirectionalLight {
  //- Hemisphere light
  // Ambient sky light, lights everything
  const hemiIntensity = 1;
  const hemiLight = new HemisphereLight(skyColor, shadowColor, hemiIntensity);
  renderScene.add(hemiLight);

  //- Directional light
  // Replicates the sun, casts shadow
  const color = 0xffffff;
  const directIntensity = 2;
  const shadowLight = new DirectionalLight(color, directIntensity);
  shadowLight.position.set(10, 10, -25);
  shadowLight.target.position.set(-5, 0, 5);
  shadowLight.castShadow = true;
  shadowLight.shadow.mapSize.width = 2014; // default
  shadowLight.shadow.mapSize.height = 2014; // default
  renderScene.add(shadowLight);
  renderScene.add(shadowLight.target);

  return shadowLight;
}
