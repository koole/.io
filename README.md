# 🌆 koole.io

[![Netlify Status](https://api.netlify.com/api/v1/badges/53c4250f-6710-4ec3-a45a-742777aa5d10/deploy-status)](https://app.netlify.com/sites/koole-io/deploys)

## Development server

```sh
npm run start
```

## Building

```sh
npm run build
```

## Encoding videos

Videos need to be encoded using these specific settings to allow for smooth playback
when scrolling up and down the page.

### x264 (fallback)

```sh
ffmpeg \
    -f image2 \
    -framerate 60 \
    -i ./input/%04d.png \
    -c:v libx264 \
    -preset slow \
    -tune animation \
    -crf 18 \
    -g 1 \
    -pix_fmt yuv420p \
    -vf scale=1080x1080 \
    output.mp4
```
