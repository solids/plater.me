var one = require('onecolor');

module.exports = hsl;

function hsl(h,s,l,a, array) {
  var color = new one.HSL(h, s, l, a || 1);

  if (array) {
    return color.rgb().toJSON().slice(1, 4);
  } else {
    return color.cssa();
  }
}
