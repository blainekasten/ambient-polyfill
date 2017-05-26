(function() {
  var video,
    canvas,
    threshold = 2,
    __observing__ = false,
    createAmbienceDOM,
    __observe,
    context,
    width,
    height,
    startingThreshold,
    thresholdSet = false,
    darkerThreshold,
    lighterThreshold,
    __prevAmbience = 'light',
    rgbValua;

  /*
   * handle prefixes
   */

  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  /*
   * namespace
   */

  window.ambience = {
    onambiencedark: undefined,
    onambiencelight: undefined,
  };

  /*
   * clean up dom elements if the video doesnt
   * work or is denied
   */

  removeAmbienceDOM = function() {
    video.parentElement.removeChild(video);
    canvas.parentElement.removeChild(canvas);
  };

  /*
   * Creates the DOM markup for video and canvas element
   * to track the ambience of the camera
   */

  createAmbienceDOM = function() {
    var _resizeCanvas;

    video = document.createElement('video');
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');

    width = video.width = canvas.width = 200;
    height = video.height = video.height = 200;
    video.style.position = canvas.style.position = 'absolute';
    //video.style.left = canvas.style.left = -9999;

    fragment = document.createDocumentFragment();
    fragment.appendChild(canvas);
    fragment.appendChild(video);

    document.body.appendChild(fragment);

    /*
     * Keep canvas and video elements sizes inline
     */

    _resizeCanvas = function() {
      canvas.width = width = video.offsetWidth;
      canvas.height = height = video.offsetHeight;
    };
    video.addEventListener('resize', _resizeCanvas);
  };

  /*
   * Entrance function. To use the API call ambience.observe
   *
   * @function
   * @params {Function} optional. Callback in case of error
   */

  ambience.observe = function(successCallback, errorCallback) {
    if (!navigator.getUserMedia || __observing__) return;
    __observing__ = true;

    createAmbienceDOM();

    /*
     * Call native api to get the user media
     */

    navigator.getUserMedia(
      { video: true },
      function(localMediaStream) {
        video.src = window.URL.createObjectURL(localMediaStream);
        video.onloadedmetadata = function(e) {
          video.play();
        };
        __observe();
        if ('function' === typeof successCallback) successCallback();
      },
      function(err) {
        removeAmbienceDOM();
        if ('function' === typeof errorCallback) errorCallback(err);
        __observing__ = false;
      }
    );
  };

  __observe = function() {
    var requestId,
      _requestAnimationFrame,
      pixels,
      d,
      lightStrength = 0,
      round = 0;

    _requestAnimationFrame = function() {
      requestId = window.requestAnimationFrame(function() {
        lightStrength = 0;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          try {
            // Firefox v~30.0 gets confused with the video readyState firing an
            // erroneous HAVE_ENOUGH_DATA just before HAVE_CURRENT_DATA state,
            // hence keep trying to read it until resolved.
            context.drawImage(video, 0, 0, width, height);
          } catch (err) {}
        }

        pixels = context.getImageData(0, 0, width, height);
        d = pixels.data;

        for (var i = 0; i < d.length / 5; i += 4) {
          var r = d[i], g = d[i + 1], b = d[i + 2], v, h;

          v = rgbValue(d[i], d[i + 1], d[i + 2]);

          v = v >= threshold ? 255 : 0;

          if (v == 255) lightStrength++;

          d[i] = d[i + 1] = d[i + 2] = v;
        }
        context.putImageData(pixels, 0, 0);

        if (round < 100) round++;
        else {
          if (!thresholdSet) {
            startingThreshold = lightStrength;
            darkerThreshold = lightStrength - 1000;
            lighterThreshold = lightStrength + 1000;
            window.thresholds = {
              start: startingThreshold,
              dark: darkerThreshold,
              light: lighterThreshold,
            };
          }

          __callMethods(lightStrength);
        }

        _requestAnimationFrame();
      });
    };
    _requestAnimationFrame();
  };

  /*
   * converts an rgb value to hsl
   * then returns the combination of hsl
   * for values
   */

  rgbValue = function(r, g, b) {
    (r /= 255), (g /= 255), (b /= 255);
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d;
          break;
        case g:
          h = 2 + (b - r) / d;
          break;
        case b:
          h = 4 + (r - g) / d;
          break;
      }
      h *= 60;
      if (h < 0) {
        h += 360;
      }
    }
    // do something with the hsl code e.g. alert( [h, s, l] );
    return h * s * l;
  };

  /*
   * Calls the callback methods for the light responsiveness
   *
   * @params {Number}
   */

  __callMethods = function(lightStrength) {
    // create device light
    var deviceLightEvent = new DeviceLightEvent(lightStrength);

    // dispatch event
    window.dispatchEvent(deviceLightEvent);

    document.querySelector('h3').innerHTML = lightStrength;
  };
})();

$(document).ready(function() {
  ambience.observe();
});
