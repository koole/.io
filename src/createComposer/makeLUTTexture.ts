import { DataTexture } from "three/src/textures/DataTexture";
import { RGBAFormat, LinearFilter } from "three/src/constants";
import { ImageLoader } from "three/src/loaders/ImageLoader";

const makeIdentityLutTexture = (function() {
  // prettier-ignore
  const identityLUT = new Uint8Array([
      0,   0,   0, 255,
    255,   0,   0, 255,
      0,   0, 255, 255,
    255,   0, 255, 255,
      0, 255,   0, 255,
    255, 255,   0, 255,
      0, 255, 255, 255,
    255, 255, 255, 255,
  ]);

  return function() {
    const texture = new DataTexture(identityLUT, 4, 2, RGBAFormat);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.needsUpdate = true;
    texture.flipY = false;
    return texture;
  };
})();

export const makeLUTTexture = (function() {
  const imgLoader = new ImageLoader();
  const ctx = document
    .createElement("canvas")
    .getContext("2d") as CanvasRenderingContext2D;

  return function(info: { url: string; size: number }) {
    const texture = makeIdentityLutTexture();
    if (info.url) {
      const lutSize = info.size;

      // set the size to 2 (the identity size). We'll restore it when the
      // image has loaded. This way the code using the lut doesn't have to
      // care if the image has loaded or not
      info.size = 2;

      imgLoader.load(info.url, function(image) {
        const width = lutSize * lutSize;
        const height = lutSize;
        info.size = lutSize;
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);

        texture.image.data = new Uint8Array(imageData.data.buffer);
        texture.image.width = width;
        texture.image.height = height;
        texture.needsUpdate = true;
      });
    }

    return texture;
  };
})();
