var quickHull = require('quick-hull-2d');
var createParentStream = require('workerstream/parent');

var s = createParentStream();

s.on('data', function(points) {
  s.write(quickHull(points));
});
