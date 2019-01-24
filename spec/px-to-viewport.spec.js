// Jasmine unit tests
// To run tests, run these commands from the project root:
// 1. `npm install -g jasmine-node`
// 2. `jasmine-node spec`

/* global describe, it, expect */

'use strict';
var postcss = require('postcss');
var pxToViewport = require('..');
var basicCSS = '.rule { font-size: 15px }';

describe('px-to-viewport', function() {
  it('should work on the readme example', function () {
    var input = 'h1 { margin: 0 0 20px; font-size: 32px; line-height: 2; letter-spacing: 1px; }';
    var output = 'h1 { margin: 0 0 6.25vw; font-size: 10vw; line-height: 2; letter-spacing: 1px; }';
    var processed = postcss(pxToViewport()).process(input).css;

    expect(processed).toBe(output);
  });

  it('should replace the px unit with vw', function () {
    var processed = postcss(pxToViewport()).process(basicCSS).css;
    var expected = '.rule { font-size: 4.6875vw }';

    expect(processed).toBe(expected);
  });

  it('should handle < 1 values and values without a leading 0', function () {
    var rules = '.rule { margin: 0.5rem .5px -0.2px -.2em }';
    var expected = '.rule { margin: 0.5rem 0.15625vw -0.0625vw -.2em }';
    var options = {
        minPixelValue: 0
    };
    var processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('value parsing', function() {
  it('should not replace values in double quotes or single quotes', function () {
    var options = {
        propList: ['*']
    };
    var rules = '.rule { content: \'16px\'; font-family: "16px"; font-size: 16px; }';
    var expected = '.rule { content: \'16px\'; font-family: "16px"; font-size: 5vw; }';
    var processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it('should not replace values in `url()`', function () {
    var rules = '.rule { background: url(16px.jpg); font-size: 16px; }';
    var expected = '.rule { background: url(16px.jpg); font-size: 5vw; }';
    var processed = postcss(pxToViewport()).process(rules).css;

    expect(processed).toBe(expected);
  });

  it('should not replace values with an uppercase P or X', function () {
    var rules = '.rule { margin: 12px calc(100% - 14PX); height: calc(100% - 20px); font-size: 12Px; line-height: 16px; }';
    var expected = '.rule { margin: 3.75vw calc(100% - 14PX); height: calc(100% - 6.25vw); font-size: 12Px; line-height: 5vw; }';
    var processed = postcss(pxToViewport()).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('unitToConvert', function() {
  it('should ignore non px values by default', function () {
    var expected = '.rule { font-size: 2em }';
    var processed = postcss(pxToViewport()).process(expected).css;

    expect(processed).toBe(expected);
  });

  it('should convert only values described in options', function () {
    var rules = '.rule { font-size: 5em; line-height: 2px }';
    var expected = '.rule { font-size: 1.5625vw; line-height: 2px }';
    var options = {
      unitToConvert: 'em'
    };
    var processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('viewportWidth', function() {
  it('should should replace using 320px by default', function() {
    var expected = '.rule { font-size: 4.6875vw }';
    var processed = postcss(pxToViewport()).process(basicCSS).css;

    expect(processed).toBe(expected);
  });

  it('should replace using viewportWidth from options', function() {
    var expected = '.rule { font-size: 3.125vw }';
    var options = {
      viewportWidth: 480
    }
    var processed = postcss(pxToViewport(options)).process(basicCSS).css;

    expect(processed).toBe(expected);
  })
});

describe('unitPrecision', function () {
  it('should replace using a decimal of 2 places', function () {
      var expected = '.rule { font-size: 4.69vw }';
      var options = {
          unitPrecision: 2
      };
      var processed = postcss(pxToViewport(options)).process(basicCSS).css;

      expect(processed).toBe(expected);
  });
});

describe('viewportUnit', function() {
  it('should replace using unit from options', function() {
    var rules = '.rule { margin-top: 15px }';
    var expected = '.rule { margin-top: 4.6875vh }';
    var options = {
        viewportUnit: 'vh'
    };
    var processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('fontViewportUnit', function() {
  it('should replace only font-size using unit from options', function() {
    var rules = '.rule { margin-top: 15px; font-size: 8px; }';
    var expected = '.rule { margin-top: 4.6875vw; font-size: 2.5vmax; }';
    var options = {
      fontViewportUnit: 'vmax'
    };
    var processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('selectorBlackList', function () {
  it('should ignore selectors in the selector black list', function () {
      var rules = '.rule { font-size: 15px } .rule2 { font-size: 15px }';
      var expected = '.rule { font-size: 4.6875vw } .rule2 { font-size: 15px }';
      var options = {
          selectorBlackList: ['.rule2']
      };
      var processed = postcss(pxToViewport(options)).process(rules).css;

      expect(processed).toBe(expected);
  });

  it('should ignore every selector with `body$`', function () {
      var rules = 'body { font-size: 16px; } .class-body$ { font-size: 16px; } .simple-class { font-size: 16px; }';
      var expected = 'body { font-size: 5vw; } .class-body$ { font-size: 16px; } .simple-class { font-size: 5vw; }';
      var options = {
          selectorBlackList: ['body$']
      };
      var processed = postcss(pxToViewport(options)).process(rules).css;

      expect(processed).toBe(expected);
  });

  it('should only ignore exactly `body`', function () {
      var rules = 'body { font-size: 16px; } .class-body { font-size: 16px; } .simple-class { font-size: 16px; }';
      var expected = 'body { font-size: 16px; } .class-body { font-size: 5vw; } .simple-class { font-size: 5vw; }';
      var options = {
          selectorBlackList: [/^body$/]
      };
      var processed = postcss(pxToViewport(options)).process(rules).css;

      expect(processed).toBe(expected);
  });
});

describe('mediaQuery', function () {
  it('should replace px in media queries', function () {
      var options = {
          mediaQuery: true
      };
      var processed = postcss(pxToViewport(options)).process('@media (min-width: 500px) { .rule { font-size: 16px } }').css;
      var expected = '@media (min-width: 156.25vw) { .rule { font-size: 5vw } }';

      expect(processed).toBe(expected);
  });
});

describe('minPixelValue', function () {
  it('should not replace values below minPixelValue', function () {
      var options = {
          propWhiteList: [],
          minPixelValue: 2
      };
      var rules = '.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }';
      var expected = '.rule { border: 1px solid #000; font-size: 5vw; margin: 1px 3.125vw; }';
      var processed = postcss(pxToViewport(options)).process(rules).css;

      expect(processed).toBe(expected);
  });
});
