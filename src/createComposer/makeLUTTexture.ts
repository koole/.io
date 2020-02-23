/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { DataTexture } from "three/src/textures/DataTexture";
import { RGBAFormat, LinearFilter } from "three/src/constants";
import { ImageLoader } from "three/src/loaders/ImageLoader";

const makeIdentityLutTexture = (): DataTexture => {
  // prettier-ignore
  // Ugly temp LUT while the real one is loading
  const identityLUT = new Uint8Array([
    126, 22, 0, 32,  
    181, 51, 0, 255,  
    181, 51, 0, 32,  
    181, 51, 0, 255,  
    255, 181, 0, 33,  
    255, 181, 0, 255,  
    255, 181, 0, 35,  
    255, 181, 0, 255
  ]);

  const texture = new DataTexture(identityLUT, 3, 2, RGBAFormat);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  texture.flipY = false;
  return texture;
};

export const makeLUTTexture = (url: string, size: number): DataTexture => {
  const imgLoader = new ImageLoader();
  const ctx = document
    .createElement("canvas")
    .getContext("2d") as CanvasRenderingContext2D;

  const texture = makeIdentityLutTexture();
  if (url) {
    const lutSize = size;

    // set the size to 2 (the identity size). We'll restore it when the
    // image has loaded. This way the code using the lut doesn't have to
    // care if the image has loaded or not
    size = 2;

    imgLoader.load(url, function(image) {
      const width = lutSize * lutSize;
      const height = lutSize;
      size = lutSize;
      ctx.canvas.width = width;
      ctx.canvas.height = height;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);
      // This works fine and doesn't cause any errors.
      // @ts-ignore
      texture.image.data = new Uint8Array(imageData.data.buffer);
      // @ts-ignore
      texture.image.width = width;
      // @ts-ignore
      texture.image.height = height;
      texture.needsUpdate = true;
    });
  }
  return texture;
};
