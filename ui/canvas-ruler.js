module.exports = function drawRuler(ctx, p0, p1, rulerWidth, reverse) {
  // var start = (reverse) ? p0-3 : -p0+3;
  // var end = (reverse) ? -p0+3 : p0-3;
  // var dir =

  for (var i = -p0+3, d = 1; i<p0-2; i+=2, d++) {
    ctx.moveTo(i, -p1 - rulerWidth + 1);

    var h = rulerWidth*.75;
    var w = null;
    var text = null;
    var texth = 0;
    if (d%50 === 0) {
      h = rulerWidth/2;
      texth = 10;
      text = d/50 + '';
      ctx.fillStyle = "#999";
      ctx.font = "10px sans-serif"
      w = ctx.measureText(text).width/2;
    } else if (d%5 === 0) {
      text = ((d/5 % 10)) + '';
      h = rulerWidth * .65;
      texth = 6;
      ctx.fillStyle = "#666";
      ctx.font = "6px sans-serif"
      w = ctx.measureText(text).width/2;
    }

    ctx.lineTo(i, -p1 - h);

    if (text) {
      ctx.save()
        ctx.translate(i - w, -p1 - h + texth);
        reverse && ctx.scale(-1, 1);
        reverse && ctx.rotate(Math.PI/2);
        reverse && ctx.translate(-texth/2, texth / 2 + 1);
        ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }

  ctx.stroke();
}
