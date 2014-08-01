var quickHull = require('quick-hull-2d');
var createParentStream = require('workerstream/parent');
console.log('here!')


self.onmessage = function(event) {
  console.log('here event');
}

var s = createParentStream();

s.on('data', function(points) {
  console.log('DATA!', points);
  s.write(quickHull(points));
});



