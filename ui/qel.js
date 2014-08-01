module.exports = qel;

function qel(selector, context) {
  return (context || document).querySelector(selector);
}
