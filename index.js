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
  replace: true,
  landscape: false,
  landscapeUnit: 'vw',
  landscapeWidth: 568
};

var ignoreNextComment = 'px-to-viewport-ignore-next';
var ignorePrevComment = 'px-to-viewport-ignore';

module.exports = postcss.plugin('postcss-px-to-viewport', function (options) {
  var opts;
  options instanceof Array
    ? opts = options.map(function(option){
      return objectAssign({}, defaults, option);
    })
    : opts = [objectAssign({}, defaults, options)];

  return function (css, result) {
    opts.forEach(function(opt){

      checkRegExpOrArray(opt, 'exclude');
      checkRegExpOrArray(opt, 'include');

      var pxRegex = getUnitRegexp(opt.unitToConvert);
      var satisfyPropList = createPropListMatcher(opt.propList);
      var landscapeRules = [];
      css.walkRules(function (rule) {
        // Add exclude option to ignore some files like 'node_modules'
        var file = rule.source && rule.source.input.file;

        if (opt.include && file) {
          if (Object.prototype.toString.call(opt.include) === '[object RegExp]') {
            if (!opt.include.test(file)) return;
          } else if (Object.prototype.toString.call(opt.include) === '[object Array]') {
            var flag = false;
            for (var i = 0; i < opt.include.length; i++) {
              if (opt.include[i].test(file)) {
                flag = true;
                break;
              }
            }
            if (!flag) return;
          }
        }

        if (opt.exclude && file) {
          if (Object.prototype.toString.call(opt.exclude) === '[object RegExp]') {
            if (opt.exclude.test(file)) return;
          } else if (Object.prototype.toString.call(opt.exclude) === '[object Array]') {
            for (var i = 0; i < opt.exclude.length; i++) {
              if (opt.exclude[i].test(file)) return;
            }
          }
        }

        if (blacklistedSelector(opt.selectorBlackList, rule.selector)) return;

        if (opt.landscape && !rule.parent.params) {
          var landscapeRule = rule.clone().removeAll();

          rule.walkDecls(function(decl) {
            if (decl.value.indexOf(opt.unitToConvert) === -1) return;
            if (!satisfyPropList(decl.prop)) return;

            landscapeRule.append(decl.clone({
              value: decl.value.replace(pxRegex, createPxReplace(opt, opt.landscapeUnit, opt.landscapeWidth))
            }));
          });

          if (landscapeRule.nodes.length > 0) {
            landscapeRules.push(landscapeRule);
          }
        }

        if (!validateParams(rule.parent.params, opt.mediaQuery)) return;

        rule.walkDecls(function(decl, i) {
          if (decl.value.indexOf(opt.unitToConvert) === -1) return;
          if (!satisfyPropList(decl.prop)) return;

          var prev = decl.prev();
          // prev declaration is ignore conversion comment at same line
          if (prev && prev.type === 'comment' && prev.text === ignoreNextComment) {
            // remove comment
            prev.remove();
            return;
          }
          var next = decl.next();
          // next declaration is ignore conversion comment at same line
          if (next && next.type === 'comment' && next.text === ignorePrevComment) {
            if (/\n/.test(next.raws.before)) {
              result.warn('Unexpected comment /* ' + ignorePrevComment + ' */ must be after declaration at same line.', { node: next });
            } else {
              // remove comment
              next.remove();
              return;
            }
          }

          var unit;
          var size;
          var params = rule.parent.params;

          if (opt.landscape && params && params.indexOf('landscape') !== -1) {
            unit = opt.landscapeUnit;
            size = opt.landscapeWidth;
          } else {
            unit = getUnit(decl.prop, opt);
            size = opt.viewportWidth;
          }

          var value = decl.value.replace(pxRegex, createPxReplace(opt, unit, size));

          if (declarationExists(decl.parent, decl.prop, value)) return;

          if (opt.replace) {
            decl.value = value;
          } else {
            decl.parent.insertAfter(i, decl.clone({ value: value }));
          }
        });
      });

      if (landscapeRules.length > 0) {
        var landscapeRoot = new postcss.atRule({ params: '(orientation: landscape)', name: 'media' });

        landscapeRules.forEach(function(rule) {
          landscapeRoot.append(rule);
        });
        css.append(landscapeRoot);
      }
    })
  };
});

function getUnit(prop, opts) {
  return prop.indexOf('font') === -1 ? opts.viewportUnit : opts.fontViewportUnit;
}

function createPxReplace(opts, viewportUnit, viewportSize) {
  return function (m, $1) {
    if (!$1) return m;
    var pixels = parseFloat($1);
    if (pixels <= opts.minPixelValue) return m;
    var parsedVal = toFixed((pixels / viewportSize * 100), opts.unitPrecision);
    return parsedVal === 0 ? '0' : parsedVal + viewportUnit;
  };
}

function error(decl, message) {
  throw decl.error(message, { plugin: 'postcss-px-to-viewport' });
}

function checkRegExpOrArray(options, optionName) {
  var option = options[optionName];
  if (!option) return;
  if (Object.prototype.toString.call(option) === '[object RegExp]') return;
  if (Object.prototype.toString.call(option) === '[object Array]') {
    var bad = false;
    for (var i = 0; i < option.length; i++) {
      if (Object.prototype.toString.call(option[i]) !== '[object RegExp]') {
        bad = true;
        break;
      }
    }
    if (!bad) return;
  }
  throw new Error('options.' + optionName + ' should be RegExp or Array of RegExp.');
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

function validateParams(params, mediaQuery) {
  return !params || (params && mediaQuery);
}
