# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
