import insideWorker from "offscreen-canvas/inside-worker";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, collection } from "firebase/firestore";
import VWError from "./vw-error.json";

const firebaseConfig = {
  name: "",
  options: {},
  apiKey: "AIzaSyD4iFcFgJ6FzfGg1XWUFEuIf_pHgeOqReA",
  authDomain: "koole-io.firebaseapp.com",
  databaseURL: "https://koole-io.firebaseio.com",
  projectId: "koole-io",
  storageBucket: "koole-io.appspot.com",
  messagingSenderId: "148611522242",
  appId: "1:148611522242:web:b33623ad022aa27678655b",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

interface Document {
  data?: string;
  approved?: boolean;
  title?: string;
  user?: string;
  script?: string;
  type?: "script" | "art";
}

const worker = insideWorker((e) => {
  if (e.data.canvas) {
    let dataDocument: Document = null;

    const canvas = e.data.canvas;
    const canvasContext = canvas.getContext("2d");

    // Used by scripts as persistents storage
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let persistent = {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const context = canvasContext;

    const subDoc = doc(collection(db, "panels"), "1");

    onSnapshot(subDoc, (docSnapshot) => {
      dataDocument = docSnapshot.data();
      // Clear VM and persistent storage for new script
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      persistent = {};
      canvasContext.fillStyle = "#000000";
      canvasContext.fillRect(0, 0, 32, 32);
    });

    let frame = 1;

    const render = () => {
      if (dataDocument !== null) {
        if (dataDocument.type === "script") {
          try {
            // Limit to half the framerate, as the real panel only runs at 30fps.
            if (frame % 2 === 0) {
              eval("(function(){" + dataDocument.script + "})()");
              const arr: number[] = [];
              const imageData = canvasContext.getImageData(0, 0, 32, 32);
              for (
                let index = 0;
                index < imageData.data.length;
                index = index + 4
              ) {
                // Convert to black/white
                const brightness =
                  (0.2126 * imageData.data[index] +
                    0.7152 * imageData.data[index + 1] +
                    0.0722 * imageData.data[index + 2]) /
                  256;
                arr.unshift(brightness);
              }
              worker.post({ colors: arr });
            }
            frame++;
            requestAnimationFrame(render);
          } catch (error) {
            console.error(error);
            // ⚠️ sign
            const currentColors = VWError;
            worker.post({ colors: currentColors });
            setTimeout(render, 5000);
          }
        }
        if (dataDocument.type === "art") {
          setTimeout(render, 1000);
          const rows = dataDocument.data.match(/.{1,192}/g);
          const arr: number[] = [];
          for (const row in rows) {
            const columns = rows[row].match(/.{1,6}/g);
            for (const column in columns) {
              const hex = columns[column].match(/.{1,2}/g);
              const brightness =
                (0.2126 * parseInt(hex[0], 16) +
                  0.7152 * parseInt(hex[1], 16) +
                  0.0722 * parseInt(hex[2], 16)) /
                256;
              arr.unshift(brightness);
            }
          }
          worker.post({ colors: arr });
        }
      } else {
        setTimeout(render, 1000);
      }
    };

    render();
  }
});
