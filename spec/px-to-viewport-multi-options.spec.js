// To run tests, run these commands from the project root:
// 1. `npm install`
// 2. `npm test`

/* global describe, it, expect */

var postcss = require('postcss');
var pxToViewport = require('..');
var basicCSS = '.rule { font-size: 15px; padding: 0rem 0px 15rem 15px }';

var multiOptions = [{
  unitToConvert: 'px'
},{
  unitToConvert: 'rem'
}]

describe('dose multi options wark', function() {
  it('px-to-viewport', function () {
    var input = 'h1 { margin: 0 0 20rem; font-size: 32px; line-height: 2; letter-spacing: 1px; }';
    var output = 'h1 { margin: 0 0 6.25vw; font-size: 10vw; line-height: 2; letter-spacing: 1px; }';
    var processed = postcss(pxToViewport(multiOptions)).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not replace values in `url()`', function () {
    var rules = '.rule { background: url(16px.jpg); font-size: 16rem; }';
    var expected = '.rule { background: url(16px.jpg); font-size: 5vw; }';
    var processed = postcss(pxToViewport(multiOptions)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it('should ignore non px values by default', function () {
    var expected = '.rule { font-size: 2em }';
    var processed = postcss(pxToViewport(multiOptions)).process(expected).css;

    expect(processed).toBe(expected);
  });

  it('should should replace using 320px by default', function() {
    var expected = '.rule { font-size: 4.6875vw; padding: 0rem 0px 4.6875vw 4.6875vw }';
    var processed = postcss(pxToViewport(multiOptions)).process(basicCSS).css;

    expect(processed).toBe(expected);
  });
})
