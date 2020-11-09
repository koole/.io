import { E } from "./utils";
import VideoToFrames, { VideoToFramesMethod } from "./toframes";

interface Project {
  id: HTMLElement | null;
  videoId: HTMLCanvasElement | null;
  placeholder: HTMLVideoElement | null;
  url: {
    webm: string;
    mp4: string;
  };
  imageList: ImageData[];
}

const projects: Project[] = [
  {
    id: E("s-revision"),
    videoId: E("s-revision-video") as HTMLCanvasElement,
    placeholder: E("s-revision-video-placeholder") as HTMLVideoElement,
    url: {
      webm: "/videos/revision.webm",
      mp4: "/videos/revision.mp4",
    },
    imageList: [],
  },
  {
    id: E("s-vw"),
    videoId: E("s-vw-video") as HTMLCanvasElement,
    placeholder: E("s-vw-video-placeholder") as HTMLVideoElement,
    url: {
      webm: "/videos/revision.webm",
      mp4: "/videos/vet.mp4",
    },
    imageList: [],
  },
  {
    id: E("s-appmantle"),
    videoId: E("s-appmantle-video") as HTMLCanvasElement,
    placeholder: E("s-appmantle-video-placeholder") as HTMLVideoElement,
    url: {
      webm: "/videos/revision.webm",
      mp4: "/videos/appmantle.mp4",
    },
    imageList: [],
  },
];

// const frameCount = Math.min(Math.floor(window.screen.height / 10), 120);

// const canvas: HTMLCanvasElement = document.createElement("canvas");
// canvas.width = frameCount * 3;
// canvas.height = 300;
// canvas.style.width = `${frameCount * 3}px`;
// canvas.style.height = "300px";
// canvas.style.position = "fixed";
// canvas.style.top = "0";
// canvas.style.right = "0";
// canvas.style.zIndex = "1000";
// canvas.style.opacity = "0.2";

// document.body.appendChild(canvas);
// const context: CanvasRenderingContext2D = canvas.getContext("2d");
// context.fillStyle = "#ffffff";
// let lineIndex = 0;

// let projectIndex = 0;
// const getFrames = (index: number): void => {
//   const project = projects[index];
//   projectIndex++;
//   // https://davidwalsh.name/detect-supported-video-formats-javascript
//   VideoToFrames.getFrames(
//     project.url.mp4,
//     frameCount,
//     VideoToFramesMethod.totalFrames,
//     (frames, diff) => {
//       context.fillRect(lineIndex, 0, 1, diff);
//       lineIndex++;
//     }
//   ).then(function (frames) {
//     project.imageList = frames;
//     if (projectIndex < projects.length) {
//       getFrames(projectIndex);
//     }
//   });
// };
// getFrames(projectIndex);

let prevScrollTop = 0;

function scrollPlay(): void {
  if (document.body.scrollTop !== prevScrollTop) {
    prevScrollTop = document.body.scrollTop;
    for (const project of projects) {
      const offset = Math.min(
        Math.max(
          0,
          document.body.scrollTop +
            window.innerHeight -
            (project.id?.offsetTop || 0)
        ),
        window.innerHeight * 2
      );
      const percentage = offset / (window.innerHeight * 2);
      if (project.imageList.length > 0) {
        const index = Math.floor((project.imageList.length - 1) * percentage);
        const frame = project.imageList[index];

        if (project.videoId !== null) {
          project.videoId.width = frame.width;
          project.videoId.height = frame.height;
          project.videoId.getContext("2d")?.putImageData(frame, 0, 0);
        }
      } else {
        if (project.placeholder !== null) {
          project.placeholder.currentTime = percentage * 2;
        }
      }
    }
  }
  window.requestAnimationFrame(scrollPlay);
}

window.requestAnimationFrame(scrollPlay);
