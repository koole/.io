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
when scrolling up and down the page. Most importantly, every frame needs to be a key
frame.

### H.265/HEVC (.mp4, Safari)

⚠️ Broken

```sh
ffmpeg \
    -f image2 \
    -framerate 60 \
    -i ./input/%04d.png \
    -crf 20 \
    -g 1 \
    -c:v libx265 \
    -preset veryslow \
    -tag:v hvc1 \
    output.mp4
```

### VP9 (.webm, other modern browsers)

```sh
ffmpeg \
    -f image2 \
    -framerate 60 \
    -i ./input/%04d.png \
    -crf 20 \
    -g 1 \
    -c:v libvpx-vp9 \
    -pix_fmt yuva420p \
    -deadline good \
    output.webm
```

### H.264 (.mp4, fallback)

```sh
ffmpeg \
    -f image2 \
    -framerate 60 \
    -i ./input/%04d.png \
    -pix_fmt yuv420p \
    -crf 20 \
    -g 1 \
    -c:v libx264 \
    -preset veryslow \
    -tune animation \
    output-fallback.mp4
```

## Encoding header video

### AV1 (.mkv | Edge, Firefox, Chrome | experimental)

```sh
ffmpeg \
    -f image2 \
    -framerate 60 \
    -i ./image-sequences/header/%04d.png \
    -c:v libaom-av1 \
    -crf 20 \
    -strict experimental \
    -b:v 0 \
    -pass 1 \
    -an \
    -f null /dev/null && \
ffmpeg \
    -f image2 \
    -framerate 60 \
    -i ./image-sequences/header/%04d.png \
    -c:v libaom-av1 \
    -crf 20 \
    -strict experimental \
    -b:v 0 \
    -pass 2 \
    -c:a libopus ./public/videos/header/av1.mp4
```

### H.265/HEVC (.mp4, Safari)

⚠️ Broken

### VP9 (.webm | other modern browsers)

```sh
ffmpeg \
    -f image2 \
    -framerate 60 \
    -i ./image-sequences/header/%04d.png \
    -crf 20 \
    -c:v libvpx-vp9 \
    -pix_fmt yuva420p \
    -deadline good \
    ./public/videos/header/vp9.webm
```

### H.264 (.mp4 | fallback)

```sh
ffmpeg \
    -f image2 \
    -framerate 60 \
    -i ./image-sequences/header/%04d.png \
    -c:v libx264 \
    -preset veryslow -tune animation \
    -crf 20 \
    -pix_fmt yuv420p \
    ./public/videos/header/h264.mp4
```
