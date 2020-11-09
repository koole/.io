import { E } from "./utils";

interface Project {
  id: HTMLElement | null;
  placeholder: HTMLVideoElement | null;
}

const projects: Project[] = [
  {
    id: E("s-revision"),
    placeholder: E("s-revision-video-placeholder") as HTMLVideoElement,
  },
  {
    id: E("s-vw"),
    placeholder: E("s-vw-video-placeholder") as HTMLVideoElement,
  },
  {
    id: E("s-appmantle"),
    placeholder: E("s-appmantle-video-placeholder") as HTMLVideoElement,
  },
];

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
      if (project.placeholder !== null) {
        project.placeholder.currentTime = percentage * 2;
      }
    }
  }
  window.requestAnimationFrame(scrollPlay);
}

window.requestAnimationFrame(scrollPlay);
