# postcss-px-to-viewport
[![NPM version](https://badge.fury.io/js/postcss-px-to-viewport.svg)](http://badge.fury.io/js/postcss-px-to-viewport)

English | [中文](README_CN.md) 

A plugin for [PostCSS](https://github.com/postcss/postcss) that generates viewport units (vw, vh, vmin, vmax) from pixel units.

## Demo

If your project involves a fixed width, this script will help to convert pixels into viewport units.

### Input

```css
.class {
  margin: -10px .5vh;
  padding: 5vmin 9.5px 1px;
  border: 3px solid black;
  border-bottom-width: 1px;
  font-size: 14px;
  line-height: 20px;
}

.class2 {
  padding-top: 10px; /* px-to-viewport-ignore */
  /* px-to-viewport-ignore-next */
  padding-bottom: 10px;
  /* Any other comment */
  border: 1px solid black;
  margin-bottom: 1px;
  font-size: 20px;
  line-height: 30px;
}

@media (min-width: 750px) {
  .class3 {
    font-size: 16px;
    line-height: 22px;
  }
}
```

### Output
```css
.class {
  margin: -3.125vw .5vh;
  padding: 5vmin 2.96875vw 1px;
  border: 0.9375vw solid black;
  border-bottom-width: 1px;
  font-size: 4.375vw;
  line-height: 6.25vw;
}

.class2 {
  padding-top: 10px;
  padding-bottom: 10px;
  /* Any other comment */
  border: 1px solid black;
  margin-bottom: 1px;
  font-size: 6.25vw;
  line-height: 9.375vw;
}

@media (min-width: 750px) {
  .class3 {
    font-size: 16px;
    line-height: 22px;
  }
}
```

## Getting Started

### Installation
Add via npm
```
$ npm install postcss-px-to-viewport --save-dev
```
or yarn
```
$ yarn add -D postcss-px-to-viewport
```

### Usage

Default Options:
```js
{
  unitToConvert: 'px',
  viewportWidth: 320,
  unitPrecision: 5,
  propList: ['*'],
  viewportUnit: 'vw',
  fontViewportUnit: 'vw',
  selectorBlackList: [],
  minPixelValue: 1,
  mediaQuery: false,
  replace: true,
  exclude: undefined,
  include: undefined,
  landscape: false,
  landscapeUnit: 'vw',
  landscapeWidth: 568
}
```
- `unitToConvert` (String) unit to convert, by default, it is px.
- `viewportWidth` (Number) The width of the viewport.
- `unitPrecision` (Number) The decimal numbers to allow the vw units to grow to.
- `propList` (Array) The properties that can change from px to vw.
  - Values need to be exact matches.
  - Use wildcard * to enable all properties. Example: ['*']
  - Use * at the start or end of a word. (['*position*'] will match background-position-y)
  - Use ! to not match a property. Example: ['*', '!letter-spacing']
  - Combine the "not" prefix with the other prefixes. Example: ['*', '!font*']
- `viewportUnit` (String) Expected units.
- `fontViewportUnit` (String) Expected units for font.
- `selectorBlackList` (Array) The selectors to ignore and leave as px.
    - If value is string, it checks to see if selector contains the string.
        - `['body']` will match `.body-class`
    - If value is regexp, it checks to see if the selector matches the regexp.
        - `[/^body$/]` will match `body` but not `.body`
- `minPixelValue` (Number) Set the minimum pixel value to replace.
- `mediaQuery` (Boolean) Allow px to be converted in media queries.
- `replace` (Boolean) replaces rules containing vw instead of adding fallbacks.
- `exclude` (Regexp or Array of Regexp) Ignore some files like 'node_modules'
    - If value is regexp, will ignore the matches files.
    - If value is array, the elements of the array are regexp.
- `include` (Regexp or Array of Regexp) If `include` is set, only matching files will be converted,
    for example, only files under `src/mobile/` (`include: /\/src\/mobile\//`)
    - If the value is regexp, the matching file will be included, otherwise it will be excluded.
    - If value is array, the elements of the array are regexp.
- `landscape` (Boolean) Adds `@media (orientation: landscape)` with values converted via `landscapeWidth`.
- `landscapeUnit` (String) Expected unit for `landscape` option
- `landscapeWidth` (Number) Viewport width for landscape orientation.

> `exclude` and `include` can be set together, and the intersection of the two rules will be taken.

#### Ignoring

You can use special comments for ignore conversion of single lines:
- `/* px-to-viewport-ignore-next */` — on a separate line, prevents conversion on the next line.
- `/* px-to-viewport-ignore */` — after the property on the right, prevents conversion on the same line.

Example:
```css
/* example input: */
.class {
  /* px-to-viewport-ignore-next */
  width: 10px;
  padding: 10px;
  height: 10px; /* px-to-viewport-ignore */
  border: solid 2px #000; /* px-to-viewport-ignore */
}

/* example output: */
.class {
  width: 10px;
  padding: 3.125vw;
  height: 10px;
  border: solid 2px #000;
}
```

There are several more reasons why your pixels may not convert, the following options may affect this:
`propList`, `selectorBlackList`, `minPixelValue`, `mediaQuery`, `exclude`, `include`.

#### Use with PostCss configuration file

add to your `postcss.config.js`
```js
module.exports = {
  plugins: {
    // ...
    'postcss-px-to-viewport': {
      // options
    }
  }
}
```

#### Use with gulp-postcss

add to your `gulpfile.js`:
```js
var gulp = require('gulp');
var postcss = require('gulp-postcss');
var pxtoviewport = require('postcss-px-to-viewport');

gulp.task('css', function () {

    var processors = [
        pxtoviewport({
            viewportWidth: 320,
            viewportUnit: 'vmin'
        })
    ];

    return gulp.src(['build/css/**/*.css'])
        .pipe(postcss(processors))
        .pipe(gulp.dest('build/css'));
});
```

## Contributing

Please read [Code of Conduct](CODE-OF-CONDUCT.md)
and [Contributing Guidelines](CONTRIBUTING.md) for submitting pull requests to us.

## Running the tests

In order to run tests, you need to install dev-packages:
```
$ npm install
```
Then run the tests via npm script:
```
$ npm run test
```

## Changelog

The changelog is [here](CHANGELOG.md).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/evrone/postcss-px-to-viewport/tags). 

## Authors

* [Dmitry Karpunin](https://github.com/KODerFunk) - *Initial work*
* [Ivan Bunin](https://github.com/chernobelenkiy)

See also the list of [contributors](https://github.com/evrone/postcss-px-to-viewport/contributors) who participated in this project.

## License

This project is licensed under the [MIT License](LICENSE).

## Sponsors

Visit [Evrone](https://evrone.com/) website to get more information about the [projects](https://evrone.com/cases) build.

<a href="https://evrone.com/?utm_source=postcss-px-to-viewport">
  <img src="https://user-images.githubusercontent.com/417688/34437029-dbfe4ee6-ecab-11e7-9d80-2b274b4149b3.png"
       alt="Sponsored by Evrone" width="231" />
</a>

## Acknowledgments

* Hat tip to https://github.com/cuth/postcss-pxtorem/ for inspiring us for this project.
