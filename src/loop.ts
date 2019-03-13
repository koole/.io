function audioLoop(uri, cb) {
  let volume = 0;
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const gainNode = context.createGain();
  const request = new XMLHttpRequest();
  const indicator = document.getElementById("audioIndicator")
  request.responseType = "arraybuffer";
  request.open("GET", uri, true);

  // XHR failed
  request.onerror = function() {
    cb(new Error("Couldn't load audio from " + uri));
  };

  // XHR complete
  request.onload = function() {
    context.decodeAudioData(request.response, success, function(err) {
      // Audio was bad
      cb(new Error("Couldn't decode audio from " + uri));
    });
  };

  request.send();

  function success(buffer) {
    let currentVolume = 0;
    var source = context.createBufferSource();
    source.connect(gainNode);
    gainNode.connect(context.destination);
    gainNode.gain.setValueAtTime(0, context.currentTime);
    source.buffer = buffer;
    source.loop = true;

    function play() {
      try {
        source.start(0);
        volume = 1;
        indicator.classList.add("active");
        // Slowly fade in the music over 5 seconds
        function increaseVolume() {
          setTimeout(() => {
            currentVolume += 0.02;
            gainNode.gain.setValueAtTime(currentVolume, context.currentTime);
            if (currentVolume < 1) increaseVolume();
          }, 100);
        }
        increaseVolume()
      }
      catch(e) {
        // Already playing audio
        return;
      }
    }

    function toggleMute() {
      if (volume === 1) {
        indicator.classList.remove("active");
        gainNode.gain.setValueAtTime(0, context.currentTime);
        volume = 0;
      } else {
        indicator.classList.add("active");
        gainNode.gain.setValueAtTime(1, context.currentTime);
        volume = 1;
        // Try starting the audio, in case it wasn't playing
        try {
          source.start(0);
        } catch(e) {
          // Already playing audio
          return;
        }
      }
      return volume;
    }

    cb(null, {
      play: play,
      toggleMute: toggleMute
    });
  }
}

export default audioLoop;
