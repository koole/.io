import { E, SR } from "./utils";

SR.reveal(".project-description-float", {
  duration: 500,
  scale: 0,
  viewFactor: 1,
  easing: "ease-in-out",
});

interface Project {
  id: HTMLElement | null;
  placeholder: HTMLVideoElement | null;
  smoothed: number;
}

const projects: Project[] = [
  {
    id: E("s-revision"),
    placeholder: E("s-revision-video") as HTMLVideoElement | null,
    smoothed: 0,
  },
  {
    id: E("s-vw"),
    placeholder: E("s-vw-video") as HTMLVideoElement | null,
    smoothed: 0,
  },
  {
    id: E("s-appmantle"),
    placeholder: E("s-appmantle-video") as HTMLVideoElement | null,
    smoothed: 0,
  },
];

let prevScrollTop = 0;

function scrollPlay(): void {
  if (document.documentElement.scrollTop !== prevScrollTop) {
    prevScrollTop = document.documentElement.scrollTop;
    for (const project of projects) {
      const offset = Math.min(
        Math.max(
          0,
          document.documentElement.scrollTop +
            window.innerHeight -
            (project.id?.offsetTop || 0)
        ),
        window.innerHeight * 2
      );
      project.smoothed += (offset - project.smoothed) / 6;
      const percentage = project.smoothed / (window.innerHeight * 2);
      if (project.placeholder !== null) {
        project.placeholder.currentTime = percentage * 2;
      }
    }
  }
  window.requestAnimationFrame(scrollPlay);
}

window.requestAnimationFrame(scrollPlay);
