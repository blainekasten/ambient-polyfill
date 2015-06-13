// polyfill
navigator.getUserMedia = ( navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);

var video, canvas, display, threshold = 2;

$(document).ready(function(){

  if (navigator.getUserMedia){
    video = document.createElement('video')
    canvas = document.createElement('canvas')
    display = document.createElement('h1')

    video.width = canvas.width = 200;
    video.height = video.height = 200;



    document.body.appendChild(video)
    document.body.appendChild(canvas)
    document.body.appendChild(display)


    navigator.getUserMedia(
      { video: true },

      function(localMediaStream) {
        video.src = window.URL.createObjectURL(localMediaStream);
        video.onloadedmetadata = function(e) { video.play() };
        createCanvasTracking(video);
      },

      function(err) {
        console.log(err);
      }

    );


  }

});


function createCanvasTracking(video){
  var context = canvas.getContext('2d'),
      width, height, requestId, _resizeCanvas, _requestAnimationFrame;


  _resizeCanvas = function() {
    width = video.offsetWidth;
    height = video.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  };
  _resizeCanvas();
  video.addEventListener('resize', _resizeCanvas);


  var round = 0

  // loop frame
  _requestAnimationFrame = function(){
    requestId = window.requestAnimationFrame(function() {
      var pixels, d, numsOfLight = 0;
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

      round++;

      for (var i=0; i<(d.length/5); i+=4) {
        var r = d[i],
            g = d[i+1],
            b = d[i+2], v, h;

        v = rgbToHsl(d[i],d[i+1],d[i+2])

        //v = (hsl[2] >= threshold && hsl[1] <= ithreshold) ? 255 : 0;
        v = (v >= threshold) ? 255 : 0;

        if (v == 255) 
          numsOfLight++;

        d[i] = d[i+1] = d[i+2] = v

      }
      context.putImageData(pixels, 0, 0);

      display.innerHTML = numsOfLight;
      updateBackgroundColor(numsOfLight)


      _requestAnimationFrame()
    });
  }
  _requestAnimationFrame()
}


function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d ; break;
            case g: h = 2 + ( (b - r) / d); break;
            case b: h = 4 + ( (r - g) / d); break;
        }
        h*=60;
        if (h < 0) {
            h +=360;
        }
    }
  // do something with the hsl code e.g. alert( [h, s, l] );
  return h * s * l;

} 






function updateBackgroundColor(light){
  if (light < 2500)
    document.body.style.background = 'grey'

  else
    document.body.style.background = 'white'


}
