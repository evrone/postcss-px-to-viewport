// excluding regex trick: http://www.rexegg.com/regex-best-trick.html

// Not anything inside double quotes
// Not anything inside single quotes
// Not anything inside url()
// Any digit followed by px
// !singlequotes|!doublequotes|!url()|pixelunit

function getUnitPartPatternStr(unit) {
  if (typeof unit === "string") {
    return unit;
  }
  if (unit.length === 1) {
    return unit[0];
  }
  return "(" + unit.join("|") + ")";
}
function getUnitRegexp(unit) {
  var unitRegStr = getUnitPartPatternStr(unit);

  return new RegExp(
    "\"[^\"]+\"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)" + unitRegStr,
    "g"
  );
}

module.exports = {
  getUnitRegexp,
};
