import "./cursor";
import "./footer";

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

const E = (id: string): HTMLElement | null => document.getElementById(id);

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

const frameCount = Math.min(Math.floor(window.screen.height / 10), 120);

// for (const project of projects) {
//   VideoToFrames.getFrames(
//     project.url.mp4,
//     frameCount,
//     VideoToFramesMethod.totalFrames,
//     (frames) => {
//       console.log(`${frames.length / frameCount * 100}%`);
//       project.imageList = frames;
//     }
//   ).then(function(frames) {
//     project.imageList = frames;
//   });
// }

let projectIndex = 0;
const getFrames = (index: number) => {
  const project = projects[index];
  projectIndex++;
  VideoToFrames.getFrames(
    project.url.mp4,
    frameCount,
    VideoToFramesMethod.totalFrames,
    (frames) => {
      console.log(`${(frames / frameCount) * 100}%`);
    }
  ).then(function (frames) {
    project.imageList = frames;
    if (projectIndex < projects.length) {
      getFrames(projectIndex);
    }
  });
};
getFrames(projectIndex);

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
        // } else {
        //   if (project.placeholder !== null) {
        //     project.placeholder.currentTime = percentage * 2;
        //   }
      }
    }
  }
  window.requestAnimationFrame(scrollPlay);
}

window.requestAnimationFrame(scrollPlay);

function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

docReady(() => {
  console.warn("Loaded!");
  const video = E("header-video");
  const T0 = E("header-text-0");
  const T1 = E("header-text-1");
  const T2 = E("header-text-2");
  if (video !== null) {
    setTimeout(() => {
      video.style.opacity = "1";
    }, 800);
    setTimeout(() => {
      video.style.opacity = "0";
    }, 900);
    setTimeout(() => {
      video.style.opacity = "1";
    }, 1500);
    setTimeout(() => {
      video.style.opacity = "0";
    }, 1600);
    setTimeout(() => {
      video.style.opacity = "1";
    }, 2300);
    setTimeout(() => {
      video.style.opacity = "0";
    }, 2400);
    setTimeout(() => {
      video.style.opacity = "1";
    }, 3500);
  }
  if (T0 !== null) {
    setTimeout(() => {
      T0.classList.add("active");
    }, 900);
    setTimeout(() => {
      T0.classList.remove("active");
    }, 1000);
    setTimeout(() => {
      T0.classList.add("active");
    }, 2000);
    setTimeout(() => {
      T0.classList.remove("active");
    }, 2100);
    setTimeout(() => {
      T0.classList.add("active");
    }, 3700);
  }
  if (T1 !== null) {
    setTimeout(() => {
      T1.classList.add("active");
    }, 1200);
    setTimeout(() => {
      T1.classList.remove("active");
    }, 1300);
    setTimeout(() => {
      T1.classList.add("active");
    }, 1800);
    setTimeout(() => {
      T1.classList.remove("active");
    }, 1900);
    setTimeout(() => {
      T1.classList.add("active");
    }, 3900);
  }
  if (T2 !== null) {
    setTimeout(() => {
      T2.classList.add("active");
    }, 1000);
    setTimeout(() => {
      T2.classList.remove("active");
    }, 1150);
    setTimeout(() => {
      T2.classList.add("active");
    }, 2100);
    setTimeout(() => {
      T2.classList.remove("active");
    }, 2200);
    setTimeout(() => {
      T2.classList.add("active");
    }, 4000);
  }
});
