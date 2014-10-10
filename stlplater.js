var stl = require('stl');
var tincture = require('tincture');
var createWorkerStream = require('workerstream');
var quickhullWorker = './workers/quickhull.js';
var createDropTarget = require('drop-stl-to-json');
var createEditor = require('./ui/editor.js');
var qel = require('qel');
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
  var saveButton = qel('#save-button');


  // setup webgl view for later
  var editor = createEditor(qel('#editor .wrapper3'), tapeBackground);

  var bounds = [];
  var boxpack = require('boxpack');
  var pack = null;

  var totalTriangles = 0, lastPackSize = 0;
  function repack(canvas) {
    totalTriangles = 0;

    if (bounds.length && bounds.length !== lastPackSize) {
      saveButton.style.display = "block";
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

      var p0 = round(plate[0]/2);
      var p1 = round(plate[1]/2);

      ctx.fillStyle = '#16368A';
      ctx.fillRect(-p0, -p1, plate[0], plate[1]);

      var pattern = ctx.createPattern(tapeBackground, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(-p0, -p1, plate[0], plate[1]);

      ctx.lineWidth = 1/scale;
      ctx.strokeStyle = '#2246E2';
      ctx.strokeRect(-p0, -p1, plate[0], plate[1]);


      ctx.strokeStyle = "yellow";

      var rulerWidth = 40;

      ctx.beginPath()
        ctx.moveTo(-p0, -p1 - 2);

        ctx.lineTo(-p0, -p1 - rulerWidth);
        ctx.lineTo( p0, -p1 - rulerWidth);
        ctx.lineTo( p0, -p1 - 2);

        ctx.moveTo(0, -p1 - rulerWidth);
        ctx.lineTo(0, -ctx.canvas.height/scale);
        ctx.stroke();

        drawRuler(ctx, p0 + 1, p1, rulerWidth);

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
            e.state.color = hsl(ratio, 1, .63, 1.0, true);
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
    toggle(qel('.modal', null, true), false);
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
        complete: false,
        color: null
      },
      workers: {
        hull: createWorkerStream(new Worker(quickhullWorker))
      }
    };

    var points = [];

    s.on('data', function fileData(d) {
      if (d.verts) {
        var verts = d.verts;

        var normal = stl.facetNormal(d);

        result.facets.push(verts);

        for (var i=0; i<verts.length; i++) {
          var x = verts[i][0];
          var y = verts[i][1];
          var z = verts[i][2];

          result.verts.push(x);
          result.verts.push(y);
          result.verts.push(z);

          result.normals.push(normal[0]);
          result.normals.push(normal[1]);
          result.normals.push(normal[2]);

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


  function openSaveModal(e) {
    e && e.preventDefault();
    e && e.stopImmediatePropagation();
    toggle([overlayEl, saveEl], true);
    saveModal(saveEl, pack);
  }

  saveButton.addEventListener('click', openSaveModal);


  // add support for meta/alt + s
  document.addEventListener('keydown', function keydownHandler(e) {
    if (e.keyCode === 83 && (e.metaKey || e.ctrlKey || e.altKey)) {
      openSaveModal(e);
    }

    if (e.keyCode === 27) {
      toggle(document.querySelectorAll('.modal,#overlay'), false);
    }
  }, true);

  function trackHover(e) {

    if (e) {
      mouse[0] = e.clientX;
      mouse[1] = e.clientY;
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
