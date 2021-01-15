import Renderer from "./projects/Renderer";
import Revision from "./projects/Revision";
import VetteWebsite from "./projects/VetteWebsite";
import Appmantle from "./projects/Appmantle";
import { E, docReady } from "./utils";
interface Project {
  id: HTMLElement | null;
  placeholder: HTMLDivElement | null;
  renderer: any;
  instance?: Renderer;
}

const projects: Project[] = [
  {
    id: E("s-revision"),
    placeholder: E("s-revision-video") as HTMLDivElement | null,
    renderer: Revision,
  },
  {
    id: E("s-vw"),
    placeholder: E("s-vw-video") as HTMLDivElement | null,
    renderer: VetteWebsite,
  },
  {
    id: E("s-appmantle"),
    placeholder: E("s-appmantle-video") as HTMLDivElement | null,
    renderer: Appmantle,
  },
];

function start(): void {
  let prevScrollTop = 0;

  const scrollUpdate = (): void => {
    // Do nothing if scroll position hasn't changed
    if (document.documentElement.scrollTop !== prevScrollTop) {
      prevScrollTop = document.documentElement.scrollTop;
      for (const project of projects) {
        // Get offset of project from top in %
        const offset = Math.min(
          Math.max(
            0,
            document.documentElement.scrollTop +
              window.innerHeight -
              (project.id?.offsetTop || 0)
          ),
          window.innerHeight * 2
        );
        const percentage = offset / (window.innerHeight * 2);

        // If the project is filling more than 50% of the screen, start its animation
        if (
          project.instance !== null &&
          percentage > 0.25 &&
          percentage < 0.75
        ) {
          project.instance.startAnimation();
        }
        if (
          project.instance !== null &&
          (percentage <= 0.25 || percentage >= 0.75)
        ) {
          project.instance.stopAnimation();
        }
      }
    }
    window.requestAnimationFrame(scrollUpdate);
  };

  // Create a new instance for every project. This also appends a canvas to each
  // placeholder and such.
  for (const project of projects) {
    project.instance = new project.renderer(project.placeholder);
  }

  // Star the scrollUpdate checker
  window.requestAnimationFrame(scrollUpdate);
}

docReady(start);

// Change the cursor when hovering over a project
for (const project of projects) {
  project.placeholder.addEventListener("mouseenter", () => {
    E("cursor-content").classList.add("cursor-project");
  });
  project.placeholder.addEventListener("mouseleave", () => {
    E("cursor-content").classList.remove("cursor-project");
  });
}
