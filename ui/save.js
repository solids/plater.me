var stl = require('stl');
var tincture = require('tincture');
var qel = require('./qel');
var saveAs = require('browser-filesaver');
var toggle = require('./toggle');


var fields, currentPack;
function initialize(el) {

  qel('.save', el).addEventListener('click', function(e) {
    e.preventDefault();
    saveToDisk(currentPack);
  }, true);

  qel('input[name=filename]', el).addEventListener('keydown', function(e) {
    if (e.keyCode === 13) {
      saveToDisk(currentPack);
    }
  });

  fields = tincture(el);
}

function close() {
  toggle(qel('.modal,#overlay', null, true), false);
}

function saveToDisk(pack) {
  var o = {
    description: fields.filename(),
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
    fields.filename().replace(/\.stl/g, '') + '.stl'
  );

  close();
}


module.exports = function saveModal(el, pack) {
  if (!fields) {
    initialize(el);
  }

  if (!pack || !pack.length) {
    close();
  } else {
    currentPack = pack;
  }
};
