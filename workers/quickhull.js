var quickHull = require('quick-hull-2d');
var createParentStream = require('workerstream/parent');
var lr = require('robust-orientation');

var s = createParentStream();

function ok(p, ps) {
  if (ps.length >= 2) {
    var l = ps.length;
    for (var i=0; i<l-1; i++) {
      if (!lr(ps[i], p, ps[i+1])) {
        return false;
      }
    }
  }
  return true;
};

s.on('data', function(points) {
  var hull = quickHull(quickHull(points));
  var l = hull.length;
  var cleaned = [];
  for (var i=0; i<l; i++) {
    if (ok(hull[i], cleaned)) {
      cleaned.push(hull[i]);
    }
  }

  s.write(cleaned);
});
