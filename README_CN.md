# postcss-px-to-viewport
[![NPM version](https://badge.fury.io/js/postcss-px-to-viewport.svg)](http://badge.fury.io/js/postcss-px-to-viewport)

[English](README.md) | 中文 

将px单位转换为视口单位的 (vw, vh, vmin, vmax) 的 [PostCSS](https://github.com/postcss/postcss) 插件.

<a href="https://evrone.com/?utm_source=postcss-px-to-viewport">
  <img src="https://user-images.githubusercontent.com/417688/34437029-dbfe4ee6-ecab-11e7-9d80-2b274b4149b3.png"
       alt="Sponsored by Evrone" width="231">
</a>

## 简介

如果你的样式需要做根据视口大小来调整宽度，这个脚本可以将你CSS中的px单位转化为vw，1vw等于1/100视口宽度。

### 输入

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

### 输出
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

## 上手

### 安装
使用npm安装
```
$ npm install postcss-px-to-viewport --save-dev
```
或者使用yarn进行安装
```
$ yarn add -D postcss-px-to-viewport
```

### 配置参数

默认参数:
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
  exclude: [],
  landscape: false,
  landscapeUnit: 'vw',
  landscapeWidth: 568
}
```
- `unitToConvert` (String) 需要转换的单位，默认为"px"
- `viewportWidth` (Number) 设计稿的视口宽度
- `unitPrecision` (Number) 单位转换后保留的精度
- `propList` (Array) 能转化为vw的属性列表
  - 传入特定的CSS属性；
  - 可以传入通配符"*"去匹配所有属性，例如：['*']；
  - 在属性的前或后添加"*",可以匹配特定的属性. (例如['*position*'] 会匹配 background-position-y)
  - 在特定属性前加 "!"，将不转换该属性的单位 . 例如: ['*', '!letter-spacing']，将不转换letter-spacing
  - "!" 和 "*"可以组合使用， 例如: ['*', '!font*']，将不转换font-size以及font-weight等属性
- `viewportUnit` (String) 希望使用的视口单位
- `fontViewportUnit` (String) 字体使用的视口单位
- `selectorBlackList` (Array) 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
    - 如果传入的值为字符串的话，只要选择器中含有传入值就会被匹配
        - 例如 `selectorBlackList` 为 `['body']` 的话， 那么 `.body-class` 就会被忽略
    - 如果传入的值为正则表达式的话，那么就会依据CSS选择器是否匹配该正则
        - 例如 `selectorBlackList` 为 `[/^body$/]` , 那么 `body` 会被忽略，而 `.body` 不会
- `minPixelValue` (Number) 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
- `mediaQuery` (Boolean) 媒体查询里的单位是否需要转换单位
- `replace` (Boolean) 是否直接更换属性值，而不添加备用属性
- `exclude` (Array or Regexp) 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
    - 如果值是一个正则表达式，那么匹配这个正则的文件会被忽略
    - 如果传入的值是一个数组，那么数组里的值必须为正则
- `landscape` (Boolean) 是否添加根据 `landscapeWidth` 生成的媒体查询条件 `@media (orientation: landscape)`
- `landscapeUnit` (String) 横屏时使用的单位
- `landscapeWidth` (Number) 横屏时使用的视口宽度

#### 直接在gulp中使用，添加gulp-postcss

在 `gulpfile.js` 添加如下配置:
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

#### 使用PostCss配置文件时

在`postcss.config.js`添加如下配置
```js
module.exports = {
  plugins: {
    ...
    'postcss-px-to-viewport': {
      // options
    }
  }
}
```

## 测试

为了跑测试案例, 你需要全局安装 `jasmine-node` :
```
$ npm install jasmine-node -g
```
然后输入下面的命令:
```
$ npm run test
```

## 参与贡献

在提PR之前，请先阅读 [代码指南](CODE-OF-CONDUCT.md) 和 [贡献指南](CONTRIBUTING.md)

## 版本跟踪

使用 [SemVer](http://semver.org/) 做版本跟踪， 可用版本可在[这](https://github.com/evrone/postcss-px-to-viewport/tags)看到

## Changelog

变更日志在 [这](CHANGELOG.md).

## 作者

* [Dmitry Karpunin](https://github.com/KODerFunk) - *Initial work*
* [Ivan Bunin](https://github.com/chernobelenkiy)

在 [contributors](https://github.com/evrone/postcss-px-to-viewport/contributors) 里可以看到谁参与了本项目.

## 许可

本项目使用 [MIT License](LICENSE).

## 借鉴自

* 受 https://github.com/cuth/postcss-pxtorem/ 启发有了这个项目
