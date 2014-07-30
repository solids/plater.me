var one = require('onecolor');
var stl = require('stl');
function hsl(h,s,l,a) {
  var color = new one.HSL(h, s, l, a || 1);
  return color.cssa();
}

function dist(x, y) {
  return Math.sqrt(x*x + y*y);
};

require('domready')(function() {
  var bounds = [];
  var boxpack = require('boxpack');
  var quickHull = require('quick-hull-2d');
  var pack = null;

  var totalVerts = 0;
  function repack(canvas) {
    totalVerts = 0;
    if (bounds.length) {
      pack = boxpack(canvas).pack(bounds);
    }
    return pack;
  }


  var ctx = require('fc')(function(dt) {
    ctx.fillStyle = '#112';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    repack(ctx.canvas);

    ctx.font = "12px san-serif";
    ctx.lineWidth = 2;
    if (pack) {
      for (var p = 0; p<pack.length; p++) {
        var e = pack[p];
        // TODO: track which items do not fit.
        // skip items not on the platter
        if (typeof e.x === 'undefined') {
          return;
        }

        totalVerts += e.facets.length;

        var ratio = p/pack.length;

        ctx.fillStyle = hsl(ratio, .75, .65, .5);
        ctx.fillRect(e.x, e.y, e.width, e.height);

        ctx.save();
          ctx.translate(e.x, e.y)
          ctx.beginPath();
          ctx.moveTo(e.hull[0][0], e.hull[0][1]);
          for (var i=1; i<e.hull.length; i++) {
            ctx.lineTo(e.hull[i][0], e.hull[i][1]);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = hsl(ratio, .75, .50, 1.0);
          ctx.fill();

        ctx.restore();
      };
      console.log('totalVerts', totalVerts);
    }
  }, false);

  var drop =  require('drop-stl-to-json')(ctx.canvas);

  var min = Math.min;
  var max = Math.max;
  var floor = Math.floor;
  var ceil = Math.ceil;

  var push = Array.prototype.push;

  drop.on('stream', function(s) {
    var rect = [[0, 0], [0, 0]];
    var result = {
      width: 0,
      height: 0,
      facets : [],
      area : 0,
      name: 'unknown',
      hull : []
    };

    var points = [];

    s.on('data', function(d) {
      if (d.verts) {
        result.facets.push(d.verts);
        var verts = d.verts;
        for (var i=0; i<verts.length; i++) {
          var x = verts[i][0] * 5;
          var y = verts[i][1] * 5;

          rect[0][0] = min(rect[0][0], x);
          rect[0][1] = min(rect[0][1], y);
          rect[1][0] = max(rect[1][0], x);
          rect[1][1] = max(rect[1][1], y);

          points.push([x, y]);

        }
      } else {
        result.name = d.description;
      }
    });

    var padding = 10;

    s.on('end', function() {

      result.width  = (ceil(rect[1][0]) - floor(rect[0][0])) + padding;
      result.height = (ceil(rect[1][1]) - floor(rect[0][1])) + padding;

      result.area = result.width * result.height;

      bounds.push(result);

      bounds.sort(function(a, b) {
        return b.area - a.area;
      })

      result.hull = quickHull(points).map(function(a) {
        a[0] -= rect[0][0];
        a[1] -= rect[0][1];

        a[0] += padding/2;
        a[1] += padding/2;

        return a;
      });

      repack(ctx.canvas);
      ctx.dirty();
    });
  });


  // add support for meta/alt + s
  var saveAs = require('browser-filesaver');
  var push = Array.prototype.push
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === 83 && (e.metaKey || e.ctrlKey || e.altKey)) {
      e.preventDefault();
      e.stopImmediatePropagation();

      var o = {
        description: 'stlplater',
        facets: []
      };

      for (var i = 0; i<pack.length; i++) {

        if (typeof pack[i].x !== 'undefined') {
          for (var j = 0; j<pack[i].facets.length; j++) {
            o.facets.push({
              verts: pack[i].facets[j]
            });
          }
        }
      }

      saveAs(
        new Blob([stl.fromObject(o)], { type : 'text/plain;charset=utf-8' }),
        'stlplater.stl' // TODO: allow naming of this file
      );
    }
  }, true)
});
