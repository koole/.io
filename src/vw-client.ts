import firebase from "firebase/app";
import "firebase/firestore";

import { SaferEval } from "safer-eval";

export let currentColors: string[][] | number[][] = [];

const firebaseConfig = {
  apiKey: "AIzaSyD4iFcFgJ6FzfGg1XWUFEuIf_pHgeOqReA",
  authDomain: "koole-io.firebaseapp.com",
  databaseURL: "https://koole-io.firebaseio.com",
  projectId: "koole-io",
  storageBucket: "koole-io.appspot.com",
  messagingSenderId: "148611522242",
  appId: "1:148611522242:web:b33623ad022aa27678655b",
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

interface Document {
  data?: string;
  approved?: boolean;
  title?: string;
  user?: string;
  script?: string;
  type?: "script" | "art";
}

let dataDocument: Document = null;

let persistent = {};

const canvas = document.createElement("canvas");
const canvasContext = canvas.getContext("2d");

const context = {
  persistent: persistent,
  context: canvasContext,
};

let safer = new SaferEval(context);

const doc = db.collection("panels").doc("1");

doc.onSnapshot(
  (docSnapshot) => {
    dataDocument = docSnapshot.data();
    // Clear VM and persistent storage for new script
    persistent = {};
    safer = new SaferEval(context);
    canvasContext.fillStyle = "#000000";
    canvasContext.fillRect(0, 0, 32, 32);
  },
  (err) => {
    console.error(err);
  }
);

let frame = 1;
function render(): void {
  if (dataDocument !== null) {
    if (dataDocument.type === "script") {
      try {
        // Limit to half the framerate, as the real panel only runs at 30fps.
        if (frame % 2 === 0) {
          safer.runInContext("(function(){" + dataDocument.script + "})()");
          // sendToSocket(canvas.toDataURL());
          const arr: number[][] = [];
          const imageData = canvasContext.getImageData(0, 0, 32, 32);
          for (
            let index = 0;
            index < imageData.data.length;
            index = index + 4
          ) {
            arr.unshift([
              imageData.data[index] / 256,
              imageData.data[index + 1] / 256,
              imageData.data[index + 2] / 256,
            ]);
            currentColors = arr;
          }
        }
        frame++;
        requestAnimationFrame(render);
      } catch (error) {
        // ⚠️ sign
        currentColors = JSON.parse(
          `[["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#4a0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#4a0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#3b3b3b"],["#ffffff"],["#ffffff"],["#3b3b3b"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ffffff"],["#ffffff"],["#ffffff"],["#ffffff"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#4a0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#3b3b3b"],["#ffffff"],["#ffffff"],["#3b3b3b"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#4a0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ffffff"],["#ffffff"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#3b3b3b"],["#ffffff"],["#ffffff"],["#3b3b3b"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#4a0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#3b3b3b"],["#ffffff"],["#ffffff"],["#3b3b3b"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#797979"],["#ffffff"],["#ffffff"],["#797979"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#4a0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#797979"],["#ffffff"],["#ffffff"],["#797979"],["#000000"],["#000000"],["#000000"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#797979"],["#ffffff"],["#ffffff"],["#797979"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#4a0000"],["#000000"],["#000000"],["#000000"],["#797979"],["#ffffff"],["#ffffff"],["#797979"],["#000000"],["#000000"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#ffffff"],["#ffffff"],["#ffffff"],["#ffffff"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#4a0000"],["#000000"],["#000000"],["#ffffff"],["#ffffff"],["#ffffff"],["#ffffff"],["#000000"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#ffffff"],["#ffffff"],["#ffffff"],["#ffffff"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#4a0000"],["#000000"],["#ffffff"],["#ffffff"],["#ffffff"],["#ffffff"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#4a0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#4a0000"],["#000000"],["#000000"],["#4a0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#ff0000"],["#ff0000"],["#ff0000"],["#ff0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#7e0000"],["#ff0000"],["#ff0000"],["#7e0000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"],["#000000"]]`
        );
        setTimeout(render, 5000);
      }
    }
    if (dataDocument.type === "art") {
      setTimeout(render, 1000);
      const rows = dataDocument.data.match(/.{1,192}/g);
      const arr: string[][] = [];
      for (const row in rows) {
        const columns = rows[row].match(/.{1,6}/g);
        for (const column in columns) {
          arr.unshift(["#" + columns[column]]);
        }
      }
      currentColors = arr;
    }
  } else {
    setTimeout(render, 1000);
  }
}
render();