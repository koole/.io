function audioLoop(uri, cb) {
  let playing = false;
  let volume = 1;
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const gainNode = context.createGain();
  const request = new XMLHttpRequest();

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
    var source;

    function play() {
      // Only play if it's not already playing
      if (playing) return;
      playing = true;

      let currentVolume = 0;

      // Create a new source (can't replay an existing source)
      source = context.createBufferSource();
      source.connect(gainNode);
      gainNode.connect(context.destination);

      // Set the buffer
      source.buffer = buffer;
      source.loop = true;

      // Set volume to 0
      gainNode.gain.setValueAtTime(currentVolume, context.currentTime);

      // Play it
      source.start(0);

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

    function toggleMute() {
      if (volume === 1) {
        gainNode.gain.setValueAtTime(0, context.currentTime);
      } else {
        gainNode.gain.setValueAtTime(1, context.currentTime);
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
