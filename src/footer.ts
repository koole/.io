import { SR } from "./utils";

const opts = {
  duration: 500,
  scale: 0,
  viewFactor: 1,
  easing: "ease-in-out",
};

SR.reveal("footer h2", opts);
SR.reveal("footer .lead", opts);
SR.reveal("footer h3", opts);
SR.reveal("footer address", opts);
SR.reveal(".contacts .contact", opts, 250);
