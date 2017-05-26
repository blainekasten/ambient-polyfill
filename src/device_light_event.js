(function(window) {
  window.DeviceLightEvent =
    window.DeviceLightEvent ||
    function(value) {
      if ('number' !== typeof value) {
        throw new Error('You must pass a number to the DeviceLightEvent API');
      }

      var event = new CustomEvent('devicelight');
      event.value = value;

      return event;
    };
})(this);
