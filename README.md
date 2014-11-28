ambient-polyfill
================

A Polyfill for the Ambient light API

### Resources
* [media queries](http://dev.w3.org/csswg/mediaqueries4/#light-level)
* [W3C Spec](http://www.w3.org/TR/ambient-light/)

### Status

Upon research of the spec, and implementation, it is found that this is likely not possible to perfectly polyfill the spec. The spec states to return the ambient light level in a measurement called "lux." In order to properly record this level, it requires information about the camera used. Information like ISO and f-stop. Browsers do not have an API to access camera information, so it is likely we can never properly calculate the lux level. Although I will keep researching this.


### Contribute

If you'd like to contribute, email me at blainekasten@gmail.com

I'm still developing this code. Once it's in a stable workable state it'll be pushed up here.
