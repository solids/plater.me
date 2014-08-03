module.exports = function toggle(el, b) {
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
}
