var stl = require('stl');
var tincture = require('tincture');
var createWorkerStream = require('workerstream');
var quickhullWorker = './workers/quickhull.js';
var createDropTarget = require('drop-stl-to-json');
var createEditor = require('./ui/editor.js');
var qel = require('./ui/qel');
var hsl = require('./ui/hsl');
var toggle = require('./ui/toggle');
var saveModal = require('./ui/save');

var drawRuler = require('./ui/canvas-ruler');

var tapeBackground = new Image();
tapeBackground.src = "data:image/png;base64,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";
tapeBackground.width = 25;
tapeBackground.height = 50;

var dropDone = 0, dropPending = 0;

var min = Math.min;
var max = Math.max;
var floor = Math.floor;
var ceil = Math.ceil;
var round = Math.round;

var mouse = [0, 0];


function dist(x, y) {
  return Math.sqrt(x*x + y*y);
};

var plate = window.plate = [200, 100];
var scale = 2;
var translate = [0, 0];
// TODO: make this configurable from the interface
var padding = 10;


require('domready')(function() {

  var overlayEl = qel('#overlay');
  var progressEl = qel('#progress');
  var editorEl = qel('#editor');
  var saveEl = qel('#save');

  // setup webgl view for later
  var editor = createEditor(qel('#editor .wrapper3'));

  var bounds = [];
  var boxpack = require('boxpack');
  var pack = null;

  var totalTriangles = 0, lastPackSize = 0;
  function repack(canvas) {
    totalTriangles = 0;

    if (bounds.length && bounds.length !== lastPackSize) {
      var box = boxpack({
        width: plate[0],
        height: plate[1]
      });

      for (var i = 0; i<bounds.length; i++) {
        totalTriangles += bounds[i].facets.length;
      }

      pack = box.pack(bounds);

      console.log('totalTriangles', totalTriangles);

      lastPackSize = pack.length;
    }
  }


  var ctx = require('fc')(function render(dt) {

    updateProgress(progressEl, dropDone, dropPending);

    ctx.fillStyle = '#112';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.save()
      ctx.translate(
        ctx.canvas.width/2 + translate[0],
        ctx.canvas.height/2 + translate[1]
      );

      ctx.scale(scale, scale);

      ctx.fillStyle = '#16368A';
      ctx.fillRect(-plate[0]/2, -plate[1]/2, plate[0], plate[1]);

      var pattern = ctx.createPattern(tapeBackground, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(-plate[0]/2, -plate[1]/2, plate[0], plate[1]);

      ctx.lineWidth = 1/scale;
      ctx.strokeStyle = "yellow";

      var rulerWidth = 40;

      var p0 = round(plate[0]/2);
      var p1 = round(plate[1]/2);

      ctx.beginPath()
        ctx.moveTo(-p0 + 1, -p1 - 2);

        ctx.lineTo(-p0 + 1, -p1 - rulerWidth);
        ctx.lineTo( p0 - 1, -p1 - rulerWidth );
        ctx.lineTo( p0 - 1, -p1 - 2);

        ctx.moveTo(0, -p1 - rulerWidth);
        ctx.lineTo(0, -ctx.canvas.height/scale);
        ctx.stroke();

        drawRuler(ctx, p0, p1, rulerWidth);

      ctx.strokeStyle = "orange";
      ctx.beginPath()
        ctx.moveTo(-p0 - 2, -p1);
        ctx.lineTo(-p0 - rulerWidth, -p1);
        ctx.lineTo(-p0 - rulerWidth,  p1);
        ctx.lineTo(-p0 - 2,  p1);
        ctx.moveTo(-p0 - rulerWidth, 0);
        ctx.lineTo(-ctx.canvas.width/scale, 0);
        ctx.stroke();

        ctx.save()
          ctx.rotate(Math.PI/2);
          ctx.scale(1, -1);
          drawRuler(ctx, p1 + 1, p0, rulerWidth, true);
        ctx.restore();
    ctx.restore();

    repack(ctx.canvas);

    if (pack) {

      ctx.lineWidth = 1;

      for (var p = 0; p<pack.length; p++) {
        var e = pack[p];
        // TODO: track which items do not fit.
        // skip items not on the platter
        if (typeof e.x === 'undefined' || !pack[p].complete) {
          return;
        }

        var ratio = p/pack.length;

        ctx.save();

          ctx.translate(
            ctx.canvas.width/2 - plate[0]/2 * scale,
            ctx.canvas.height/2 - plate[1]/2 * scale
          );
          ctx.scale(scale, scale);

          ctx.fillStyle = 'rgba(255, 255, 255, .05)';
          ctx.fillRect(e.x, e.y, e.width, e.height);
          ctx.lineWidth = 1/scale;

          ctx.lineWidth = 1;

          if (!e.state.hover) {
            ctx.translate(e.x, e.y)
            ctx.beginPath();
            ctx.moveTo(e.hull[0][0], e.hull[0][1]);
            for (var i=1; i<e.hull.length; i++) {
              ctx.lineTo(e.hull[i][0], e.hull[i][1]);
            }

            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = hsl(ratio, 1, .63, 1.0);
            ctx.fill();
          } else {

            ctx.save();
              ctx.translate(e.x + padding/(8*scale), e.y + padding/(8 * scale))
              ctx.beginPath();
              ctx.moveTo(e.hull[0][0], e.hull[0][1]);
              for (var i=1; i<e.hull.length; i++) {
                ctx.lineTo(e.hull[i][0], e.hull[i][1]);
              }

              ctx.closePath();
              ctx.fillStyle = 'rgba(0, 0, 0, .2)';
              ctx.fill();
            ctx.restore();

            ctx.save();
              ctx.translate(e.x - padding/(2*scale), e.y - padding/(2*scale));
              ctx.beginPath();
              ctx.moveTo(e.hull[0][0], e.hull[0][1]);
              for (var i=1; i<e.hull.length; i++) {
                ctx.lineTo(e.hull[i][0], e.hull[i][1]);
              }

              ctx.closePath();
              ctx.stroke();
              ctx.fillStyle = hsl(ratio, 1, .63, 1.0);
              ctx.fill();
            ctx.restore();


          }
        ctx.restore();
      };

      ctx.stop();
    } else {

      ctx.fillStyle = "white";
      ctx.font = '20px lint-mccree';
      var str = 'drop .stl file(s)';
      var w = ctx.measureText(str).width;
      var x = ctx.canvas.width/2 - w/2;
      var y = ctx.canvas.height/2
      ctx.fillText(str, x, y);
    }
  }, false);


  ctx.reset = function() {
    if (ctx.canvas.width !== window.innerWidth ||
        ctx.canvas.height !== window.innerHeight)
    {
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
    }
  };

  var inputs = tincture(qel('#printbed-size'));
  inputs.width.change(function widthChangeHandler(val) {
    plate[0] = val;
    ctx.dirty();
    lastPackSize = 0; // force a repack
    localStorage.plate = plate;
  });

  inputs.height.change(function heightChangeHandler(val) {
    plate[1] = val;
    ctx.dirty();
    lastPackSize = 0; // force a repack
    localStorage.plate = plate;
  });

  if (localStorage.plate) {
    plate = localStorage.plate.split(',').map(parseFloat);
    inputs.width(plate[0]);
    inputs.height(plate[1])
  }


  var updateProgress = require('./ui/progress.js');

  updateProgress(progressEl, 2, 10);

  var drop =  createDropTarget(document);

  drop.on('dropped', function dropHandler(a) {
    dropPending+=a.length;
    toggle([progressEl, overlayEl], true);
    updateProgress(progressEl, dropDone, dropPending);
  });

  drop.on('stream', function dropStreamHandler(s) {
    var rect = [
      [Infinity, Infinity, Infinity],
      [-Infinity, -Infinity, -Infinity]
    ];
    var result = {
      width: 0,
      height: 0,
      facets : [],
      verts: [],
      normals: [],
      area : 0,
      name: 'unknown',
      hull : [],
      rect : rect,
      state : {
        hover : false,
        complete: false
      },
      workers: {
        hull: createWorkerStream(new Worker(quickhullWorker))
      }
    };

    var points = [];

    s.on('data', function fileData(d) {
      if (d.verts) {
        var verts = d.verts;

        if (!d.normal) {
          d.normal = stl.facetNormal(d);
        }


        result.normals.push(d.normal);
        result.facets.push(verts);

        for (var i=0; i<verts.length; i++) {
          var x = verts[i][0];
          var y = verts[i][1];
          var z = verts[i][2];

          result.verts.push(x);
          result.verts.push(y);
          result.verts.push(z);

          rect[0][0] = min(rect[0][0], x);
          rect[0][1] = min(rect[0][1], y);
          rect[0][2] = min(rect[0][2], z);
          rect[1][0] = max(rect[1][0], x);
          rect[1][1] = max(rect[1][1], y);
          rect[1][2] = max(rect[1][2], z);

          points.push([x, y]);

        }
      } else {
        result.name = d.description;
      }
    });


    s.on('end', function fileProcessingComplete() {
      result.width  = (ceil(rect[1][0]) - floor(rect[0][0])) + padding;
      result.height = (ceil(rect[1][1]) - floor(rect[0][1])) + padding;

      result.area = result.width * result.height;
      result.complete = true;
      bounds.sort(function(a, b) {
        return b.area - a.area;
      });

      result.workers.hull.write(points);

      result.workers.hull.on('data', function(hull) {

        result.hull = hull.map(function(a) {
          a[0] -= rect[0][0];
          a[1] -= rect[0][1];

          a[0] += padding/2;
          a[1] += padding/2;

          return a;
        });

        dropDone++;
        updateProgress(progressEl, dropDone, dropPending);
        if (dropDone >= dropPending) {
          setTimeout(function() {
            dropDone = 0;
            dropPending = 0;
            trackHover();
            toggle([progressEl, overlayEl], false);
          }, 75);
        }

        result.buffer = new Float32Array(result.verts);

        // force a repack
        lastPackSize = 0;
        bounds.push(result);
        ctx.dirty();
      });
    });
  });


  // add support for meta/alt + s
  document.addEventListener('keydown', function keydownHandler(e) {
    if (e.keyCode === 83 && (e.metaKey || e.ctrlKey || e.altKey)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      toggle([overlayEl, saveEl], true);
      saveModal(saveEl, pack);
    }

    if (e.keyCode === 27) {
      toggle(document.querySelectorAll('.modal,#overlay'), false);
    }
  }, true);

  function trackHover(e) {

    if (e) {
      mouse[0] = e.x;
      mouse[1] = e.y;
    }

    if (!e || e.target === ctx.canvas) {
      var x = mouse[0] - (ctx.canvas.width / 2)  + plate[0]/2 * scale;
      var y = mouse[1] - (ctx.canvas.height / 2) + plate[1]/2 * scale;

      var hovering;
      // hit tracking for objects in the scene
      if (pack) {
        var l = pack.length;
        var found = false;
        for (var i=0; i<l; i++) {
          var p = pack[i];
          p.state.hover = false;
          if (x >= p.x*scale && x <= p.x*scale + p.width * scale &&
              y >= p.y*scale && y <= p.y*scale + p.height * scale)
          {
            p.state.hover = true;
            hovering = p;
          }
        }

        ctx.dirty();
      }

      return hovering;
    }
  }

  document.addEventListener('mousemove', trackHover);

  document.addEventListener('mousewheel', function mouseWheelHandler(e) {
    if (e.target === ctx.canvas) {
      if (typeof e.wheelDeltaY !== 'undefined') {
        scale += e. wheelDeltaY * .001
        scale = max(scale, .25);

        trackHover(e);

        ctx.dirty();
      }
    }
    e.preventDefault(true);
  }, true)

  document.addEventListener('mousedown', function(e) {

    if (e.target === ctx.canvas) {
      var o = trackHover();
      if (o) {
        toggle([editorEl, overlayEl], true);
        editor.display(o);
      }
      e.preventDefault();
    }

    if (e.target === overlayEl) {
      toggle(document.querySelectorAll('.ui'), false);
      toggle(overlayEl, false);
    }

  }, true)
});
