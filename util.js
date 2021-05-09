
if (!Array.prototype.flat) {
  Array.prototype.flat = function (maxDepth, currentDepth) {
      "use strict";
      var array = this;
      maxDepth = maxDepth === Infinity
          ? Number.MAX_SAFE_INTEGER
          : parseInt(maxDepth, 10) || 1;
      currentDepth = parseInt(currentDepth, 10) || 0;

      // It's not an array or it's an empty array, return the object.
      if (!Array.isArray(array) || !array.length) {
          return array;
      }

      // If the first element is itself an array and we're not at maxDepth, 
      // flatten it with a recursive call first.
      // If the first element is not an array, an array with just that element IS the 
      // flattened representation.
      // **Edge case**: If the first element is an empty element/an "array hole", skip it.
      // (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#Examples)
      var firstElemFlattened = (Array.isArray(array[0]) && currentDepth < maxDepth)
          ? array[0].flat(maxDepth, currentDepth + 1)
          : array[0] === undefined ? [] : [array[0]];

      return firstElemFlattened.concat(array.slice(1).flat(maxDepth, currentDepth));
  };
}
exports.getHrefs = async function(page, selector) {
  return await page.$$eval(selector, anchors => [].map.call(anchors, a => {    
    if(a.style.display === 'none' || a.style.visibility === 'hidden' || (a.style.width === 0 && a.style.height === 0)){
      return null;
    }else{
      return a.href
    }
  }).filter((d)=> d !== null));
}
exports.range = (l) => Array.apply(null, {length: l}).map(Number.call, Number);
exports.wait = (start, end) => { 
  return new Promise(resolve => setTimeout(resolve, Math.floor((Math.random() * (end-start+1)) + start)));
}; 