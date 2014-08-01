var qel = require('./qel');
var hsl = require('./hsl');
var TAU = Math.PI*2;

module.exports = function updateSpinner(el, done, total) {
  if (el) {
    qel('.text', el).innerHTML = [done, total].join(' / ');

    var canvas = qel('.bar', el);
    if (!canvas.ctx) {
      canvas.ctx = canvas.getContext('2d');
    }
    var rect = el.getBoundingClientRect();

    var ctx = canvas.ctx;
    canvas.width = 0;
    canvas.width = rect.width-2;
    window.el = el;
    ctx.fillStyle = 'white';

    var w = 20;

    var r = Math.floor((canvas.width - w*2)/total);


    ctx.beginPath();
      ctx.moveTo(20, 10)
      ctx.arc(20, 20, w/2, TAU*.75, TAU*.25, true);
      ctx.lineTo(canvas.width-w, 30)
      ctx.arc(canvas.width-w, 20, w/2, TAU*.25, TAU*.75, true);
    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, .1)';
    ctx.stroke();
    ctx.fillStyle = '#1E1E1E'
    ctx.fill();

    var ratio = done/total;
    if (isNaN(ratio) || !Number.isFinite(ratio)) {
      ratio = 1;
    }

    ctx.beginPath();
      ctx.moveTo(20, 10)
      ctx.arc(20, 20, w/2, TAU*.75, TAU*.25, true);
      ctx.lineTo(w + r*done, 30)
      ctx.arc(w + r * done, 20, w/2, TAU*.25, TAU*.75, true);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.fillStyle = hsl(ratio, 1, .63, 0.5);
    ctx.fill();
    ctx.strokeStyle = hsl(ratio, 1, .63, 1);
    ctx.stroke();
  }
};
