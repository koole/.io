const colors: NodeListOf<HTMLDivElement> = document.querySelectorAll(
    ".rainbow-color"
  );
  for (const color of colors) {
    console.log(color.style.backgroundColor);
    color.addEventListener("click", () => {
      document.documentElement.style.setProperty(
        "--orange",
        color.style.backgroundColor
      );
    });
  }