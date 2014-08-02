var stl = require('stl');
var tincture = require('tincture');
var createWorkerStream = require('workerstream');
var quickhullWorker = './workers/quickhull.js';
var createDropTarget = require('drop-stl-to-json');
var createEditor = require('./ui/editor.js');
var qel = require('./ui/qel');
var hsl = require('./ui/hsl');

var dropDone = 0, dropPending = 0;

var min = Math.min;
var max = Math.max;
var floor = Math.floor;
var ceil = Math.ceil;

var mouse = [0, 0];


function dist(x, y) {
  return Math.sqrt(x*x + y*y);
};

function toggle(el, b) {
  if (el) {
    var s = (!b) ? 'none' : 'block';
    if (typeof el.length === 'undefined') {
      el.style.display = s;
    } else {
      for (var i=0; i<el.length; i++) {
        el[i].style.display = s;
      }
    }
  }
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
      ctx.lineWidth = 1/scale;
      ctx.strokeStyle = "yellow";
      ctx.beginPath()
        ctx.moveTo(-plate[0]/2 - 1, -plate[1]/2 - 1);
        ctx.lineTo( plate[0]/2 + 1, -plate[1]/2 - 1);
        ctx.moveTo(-plate[0]/2 - 1,  plate[1]/2 + 1);
        ctx.lineTo( plate[0]/2 + 1,  plate[1]/2 + 1);
        ctx.stroke();

      ctx.strokeStyle = "orange";
      ctx.beginPath()
        ctx.moveTo(-plate[0]/2 - 1, -plate[1]/2 - 1);
        ctx.lineTo(-plate[0]/2 - 1,  plate[1]/2 + 1);
        ctx.moveTo( plate[0]/2 + 1, -plate[1]/2 - 1);
        ctx.lineTo( plate[0]/2 + 1,  plate[1]/2 + 1);
        ctx.stroke();
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

          ctx.fillStyle = 'rgba(255, 255, 255, .15)';
          ctx.fillRect(e.x, e.y, e.width, e.height);
          ctx.lineWidth = 1/scale;
          ctx.strokeStyle = '#112';
          ctx.strokeRect(e.x, e.y, e.width, e.height);

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

  var inputs = tincture(document.body);
  inputs.width.change(function widthChangeHandler(val) {
    plate[0] = val;
    ctx.dirty();
    localStorage.plate = plate;
  });

  inputs.height.change(function heightChangeHandler(val) {
    plate[1] = val;
    ctx.dirty();
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
    var rect = [[Infinity, Infinity], [-Infinity, -Infinity]];
    var result = {
      width: 0,
      height: 0,
      facets : [],
      verts: [],
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

        result.facets.push(verts);

        result.verts.push(verts[0][0]);
        result.verts.push(verts[0][1]);
        result.verts.push(verts[0][2]);

        result.verts.push(verts[1][0]);
        result.verts.push(verts[1][1]);
        result.verts.push(verts[1][2]);

        result.verts.push(verts[2][0]);
        result.verts.push(verts[2][1]);
        result.verts.push(verts[2][2]);


        for (var i=0; i<verts.length; i++) {
          var x = verts[i][0];
          var y = verts[i][1];
          var z = verts[i][2];

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
  var saveAs = require('browser-filesaver');
  var push = Array.prototype.push
  document.addEventListener('keydown', function keydownHandler(e) {
    if (e.keyCode === 83 && (e.metaKey || e.ctrlKey || e.altKey)) {
      e.preventDefault();
      e.stopImmediatePropagation();

      var o = {
        description: 'stlplater',
        facets: []
      };

      for (var i = 0; i<pack.length; i++) {

        if (typeof pack[i].x !== 'undefined') {

          var ox = pack[i].x;
          var oy = pack[i].y;

          for (var j = 0; j<pack[i].facets.length; j++) {
            var verts = pack[i].facets[j].map(function(vert) {
              return [
                vert[0] - pack[i].rect[0][0] + ox,
                vert[1] - pack[i].rect[0][1] + oy,
                vert[2]
              ];
            });

            o.facets.push({
              verts: verts
            });
          }
        }
      }

      saveAs(
        new Blob([stl.fromObject(o, true)], { type : 'application/octet-stream' }),
        'stlplater.stl' // TODO: allow naming of this file
      );
    }
  }, true);

  function trackHover(e) {

    if (e) {
      mouse[0] = e.x;
      mouse[1] = e.y;
    }

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

    if (e.target.tagName.toLowerCase() !== 'input') {
      var o = trackHover();
      if (o) {
        toggle([editorEl, overlayEl], true);
        editor.display(o);
      }

      if (e.target === overlayEl) {
        toggle(document.querySelectorAll('.ui'), false);
        toggle(overlayEl, false);
      }

      e.preventDefault();
    }
  }, true)
});
