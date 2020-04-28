# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased 1.2.0] - 2020-xx-xx

You can install edge-version over
`npm i -D evrone/postcss-px-to-viewport` or `yarn add -D evrone/postcss-px-to-viewport`.

### Added
- [#50](https://github.com/evrone/postcss-px-to-viewport/pull/50) by [@IceApriler](https://github.com/IceApriler):
  `include` (Regexp or Array of Regexp) If `include` is set, only matching files will be converted,
  for example, only files under `src/mobile/` (`include: /\/src\/mobile\//`)
  > `exclude` and `include` can be set together, and the intersection of the two rules will be taken.
- Added `/* px-to-viewport-ignore */` and `/* px-to-viewport-ignore-next */` — special comments
  for ignore conversion of single lines, inspired by
  [#27](https://github.com/evrone/postcss-px-to-viewport/pull/27) from [@lcat](https://github.com/lcat)
  [Read more about ignoring](https://github.com/evrone/postcss-px-to-viewport#ignoring).

### Changed
- Changed testing lib to [Jest](https://github.com/facebook/jest)
  from [jasmine-node](https://github.com/mhevery/jasmine-node).
- `package-lock.json` included to git-repo.

## [1.1.1] - 2019-07-08

### Fixed
- Fixed `rule.source === undefined` from `postcss-modules-values`.

## [1.1.0] - 2019-02-05

### Added
- `landscape` (Boolean) Adds `@media (orientation: landscape)` with values converted via `landscapeWidth`.
- `landscapeUnit` (String) Expected unit for `landscape` option
- `landscapeWidth` (Number) Viewport width for landscape orientation.

### Fixed
- `mediaQuery` option if `true` does not mutate its value now, but the rule inside it instead.

## [1.0.0] - 2019-01-28

### Added
- `replace` option - (Boolean) replaces rules containing `vw` instead of adding fallbacks.
- `propList` option - (Array) The properties that can change from `px` to `vw`.
- `exclude` option - (Array or Regexp) Ignore some files like `node_modules`.

### Changed
- zero values now remain unitless.
- replace regexp is now case sensitive, so if you want to change `px`, then `pX` values won't be changed.
