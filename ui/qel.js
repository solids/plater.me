module.exports = qel;

function qel(selector, context, all) {
  return (context || document)[all ? 'querySelectorAll' : 'querySelector'](selector);
}
