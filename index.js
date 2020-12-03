'use strict';

const postcss = require('postcss');
const objectAssign = require('object-assign');
const { createPropListMatcher } = require('./src/prop-list-matcher');
const { getUnitRegexp } = require('./src/pixel-unit-regexp');

const defaults = {
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

const ignoreNextComment = 'px-to-viewport-ignore-next';
const ignorePrevComment = 'px-to-viewport-ignore';

module.exports = postcss.plugin('postcss-px-to-viewport-with-array', function (pluginOptions) {
  const arrayedOptions = isArray(pluginOptions) ? pluginOptions : [pluginOptions];
  const landscapeRules = [];
  const walkRuleFunctions = [];
  arrayedOptions.forEach(customizedOptions => {
    const options = objectAssign({}, defaults, customizedOptions);
    if (options.exclude && !isRegExpOrRegExpArray(options.exclude)) {
      throw new Error('options.exclude should be RegExp or Array of RegExp.');
    }
    if (options.include && !isRegExpOrRegExpArray(options.include)) {
      throw new Error('options.include should be RegExp or Array of RegExp.');
    }
    const pxRegExp = getUnitRegexp(options.unitToConvert);
    const satisfyPropList = createPropListMatcher(options.propList);
    const walkRuleFunction = (rule) => {
      // Add exclude option to ignore some files like 'node_modules'
      const file = rule.source && rule.source.input.file;

      if (!shouldFileInclude(options.include, file)) return;
      if (shouldFileExclude(options.exclude, file)) return;
      if (isBlacklistedSelector(options.selectorBlackList, rule.selector)) return;

      if (options.landscape && !rule.parent.params) {
        const landscapeRule = rule.clone().removeAll();

        rule.walkDecls(function(decl) {
          if (decl.value.indexOf(options.unitToConvert) === -1) return;
          if (!satisfyPropList(decl.prop)) return;

          landscapeRule.append(
            decl.clone({
              value: decl.value.replace(
                pxRegExp,
                createPxReplace(options, options.landscapeUnit, options.landscapeWidth)
              ),
            })
          );
        });

        if (landscapeRule.nodes.length > 0) {
          landscapeRules.push(landscapeRule);
        }
      }

      if (!isValidateParams(rule.parent.params, options.mediaQuery)) return;

      rule.walkDecls((decl, i) => {
        if (decl.value.indexOf(options.unitToConvert) === -1) return;
        if (!satisfyPropList(decl.prop)) return;

        const prev = decl.prev();
        // prev declaration is ignore conversion comment at same line
        if (prev && prev.type === 'comment' && prev.text === ignoreNextComment) {
          // remove comment
          prev.remove();
          return;
        }
        const next = decl.next();
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

        let unit;
        let size;
        const params = rule.parent.params;
        if (options.landscape && params && params.indexOf('landscape') !== -1) {
          unit = options.landscapeUnit;
          size = options.landscapeWidth;
        } else {
          unit = getUnit(decl.prop, options);
          size = options.viewportWidth;
        }

        const value = decl.value.replace(pxRegExp, createPxReplace(options, unit, size));

        if (isDeclarationExists(decl.parent, decl.prop, value)) return;

        if (options.replace) {
          decl.value = value;
        } else {
          decl.parent.insertAfter(i, decl.clone({ value: value }));
        }
      });
    };
    walkRuleFunctions.push(walkRuleFunction);
  });

  return (css) => {
    walkRuleFunctions.forEach(walkFunction => {
      css.walkRules(walkFunction);
    });
    if (landscapeRules.length === 0) return;
    const landscapeRoot = new postcss.atRule({ params: '(orientation: landscape)', name: 'media' });
    landscapeRoot.append([...landscapeRules]);
    css.append(landscapeRoot);
  };
});

function isRegExp(value) {
  return Object.prototype.toString.call(value) === '[object RegExp]';
}

function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}

function shouldFileInclude(option, file) {
  if (!option || !file) {
    return true;
  }
  return isFileMatchOption(option, file);
}

function shouldFileExclude(option, file) {
  if (!option || !file) {
    return false;
  }
  return isFileMatchOption(option, file);
}

function isFileMatchOption(option, file) {
  if (isRegExp(option)) {
    return option.test(file);
  } else if (isArray(option)) {
    return option.some((item) => { return item.test(file); });
  }
}

function getUnit(prop, options) {
  return prop.indexOf('font') === -1 ? options.viewportUnit : options.fontViewportUnit;
}

function createPxReplace(options, viewportUnit, viewportSize) {
  return function (m, $1) {
    if (!$1) return m;
    var pixels = parseFloat($1);
    if (pixels <= options.minPixelValue) return m;
    var parsedVal = toFixed((pixels / viewportSize * 100), options.unitPrecision);
    return parsedVal === 0 ? '0' : parsedVal + viewportUnit;
  };
}

function isRegExpOrRegExpArray(option) {
  if (isRegExp(option)) return true;
  if (isArray(option)) {
    return option.every((item) => { return isRegExp(item); });
  }
  return false;
}

function toFixed(number, precision) {
  const multiplier = Math.pow(10, precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
}

function isBlacklistedSelector(blacklist, selector) {
  if (typeof selector !== 'string') return;
  return blacklist.some(function (regex) {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
}

function isDeclarationExists(decls, prop, value) {
  return decls.some(function (decl) {
    return (decl.prop === prop && decl.value === value);
  });
}

function isValidateParams(params, mediaQuery) {
  return !params || (params && mediaQuery);
}
