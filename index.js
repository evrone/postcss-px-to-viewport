'use strict';

var postcss = require('postcss');
var objectAssign = require('object-assign');
var { createPropListMatcher } = require('./src/prop-list-matcher');
var { getUnitRegexp } = require('./src/pixel-unit-regexp');

var defaults = {
  unitToConvert: 'px',
  viewportWidth: 320,
  viewportHeight: 568, // not now used; TODO: need for different units and math for different properties
  unitPrecision: 5,
  viewportUnit: 'vw',
  fontViewportUnit: 'vw',  // vmin is more suitable.
  selectorBlackList: [],
  propList: ['*'],
  minPixelValue: 1,
  mediaQuery: false,
  replace: true
};

module.exports = postcss.plugin('postcss-px-to-viewport', function (options) {
  
  var opts = objectAssign({}, defaults, options);
  var pxRegex = getUnitRegexp(opts.unitToConvert);
  var satisfyPropList = createPropListMatcher(opts.propList);

  return function (css) {
    css.walkRules(function (rule) {
      // Add exclude option to ignore some files like 'node_modules'
      var file = rule.source.input.file;
      
      if (opts.exclude && file) {
        if (Object.prototype.toString.call(opts.exclude) === '[object RegExp]') {
          if (!handleExclude(opts.exclude, file)) return;
        } else if (Object.prototype.toString.call(opts.exclude) === '[object Array]') {
          for (let i = 0; i < opts.exclude.length; i++) {
            if (!handleExclude(opts.exclude[i], file)) return;
          }
        } else {
          throw new Error('options.exclude should be RegExp or Array.');
        }
      }
      
      if (rule.parent.params && !opts.mediaQuery) return;
      if (blacklistedSelector(opts.selectorBlackList, rule.selector)) return;
      
      rule.walkDecls(function(decl, i) {
        if (decl.value.indexOf(opts.unitToConvert) === -1) return;
        if (!satisfyPropList(decl.prop)) return;

        var unit = getUnit(decl.prop, opts);
        var value = decl.value.replace(pxRegex, createPxReplace(opts.viewportWidth, opts.minPixelValue, opts.unitPrecision, unit));

        if (declarationExists(decl.parent, decl.prop, value)) return;

        if (opts.replace) {
          decl.value = value;
        } else {
          decl.parent.insertAfter(i, decl.clone({ value: value }));
        }
      });
    });
  };
});

function handleExclude (reg, file) {
  if (Object.prototype.toString.call(reg) !== '[object RegExp]') {
    throw new Error('options.exclude should be RegExp.');
  }
  return file.match(reg) === null;
} 

function getUnit(prop, opts) {
  return prop.indexOf('font') === -1 ? opts.viewportUnit : opts.fontViewportUnit;
}

function createPxReplace(viewportSize, minPixelValue, unitPrecision, viewportUnit) {
  return function (m, $1) {
    if (!$1) return m;
    var pixels = parseFloat($1);
    if (pixels <= minPixelValue) return m;
    var parsedVal = toFixed((pixels / viewportSize * 100), unitPrecision);
    return parsedVal === 0 ? '0' : parsedVal + viewportUnit;
  };
}

function toFixed(number, precision) {
  var multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
}

function blacklistedSelector(blacklist, selector) {
  if (typeof selector !== 'string') return;
  return blacklist.some(function (regex) {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
}

function declarationExists(decls, prop, value) {
  return decls.some(function (decl) {
      return (decl.prop === prop && decl.value === value);
  });
}