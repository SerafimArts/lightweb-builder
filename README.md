web-builder
===========

Lightweight compiler for web-based applications

# Installation

```
npm install --save-dev web-builder
```

# Usage

### Simple examples:

```js
var builder = require('web-builder');

gulp.task('default', function() {
    (new builder)
        .js(function(compiler) {
            compiler.path('src/path/');
        })
        .build('./public/path/filename.js');
        
    (new builder)
        .css(function(compiler) {
            compiler.file('src/source.css');
        })
        .build('./public/path/filename.css');
});
```

# Precompile

### Compilers installation

For use compilers please add one of this dependencies in your `package.json`:
```js
{
    "gulp-babel": "6.1.*",              // ES6 & ES7 core
    "babel-preset-es2015": "6.6.*",     // ES6 support (gulp-babel required)
    "babel-preset-stage-0": "6.5.*",    // ES7 support (gulp-babel required)
    "gulp-coffee": "2.3.*",             // CoffeeScript support
    "gulp-sass": "2.2.*",               // Scss & Sass support
    "gulp-less": "3.0.*",               // Less support
    "gulp-stylus": "2.3.*               // Stylus support
}
```

### Compilers usage

```js
var builder = require('web-builder');

gulp.task('default', function() {
    (new builder)
        .es7(function(compiler) {
            compiler
                .file('src/filename.js')
                .path('src/vendor/')
                .path('src/path/');
        })
        .build('./public/path/filename.js');
});
```

*Available compilers:*

- `.babel(function(compiler)    { ... })` - Babel compiler
- `.es6(function(compiler)      { ... })` - EcmaScript 2015 compiler (Babel with es2015 preset)
- `.es7(function(compiler)      { ... })` - EcmaScript 2016 compiler (Babel with es2015 & stage-0 presets)
- `.coffee(function(compiler)   { ... })` - CoffeeScript compiler
- `.js(function(compiler)       { ... })` - JavaScript compiler
- `.sass(function(compiler)     { ... })` - Sass compiler
- `.scss(function(compiler)     { ... })` - Scss compiler
- `.less(function(compiler)     { ... })` - Less compiler
- `.stylus(function(compiler)   { ... })` - Stylus compiler
- `.css(function(compiler)      { ... })` - Css compiler


### Additional compiler options
 
*Root builder options*

```js
    (new builder)
        .withPolyfill()   // [JS Only] Add ES6 browser polyfill
        .withCommonJs()   // [JS Only] Add CommonJS library for `require` function support
        .withSourceMaps() // [CSS & JS] Add SourceMaps
        .withMinify()     // [CSS & JS] Minify output sources
        .withGzip()       // [CSS & JS] Add gzip file
        
        //...
        //.build('out/file.ext')
```

*CssCompiler options (css, sass, less, scss, stylus, etc)*

```js
    .css(function(compiler) {
        compiler
            .autoPrefix([enabled = true][, options = {}]) 
            // Add autoprefix support
            // See: https://github.com/postcss/autoprefixer
    });
```

*JsCompiler options (js, es6, es7, coffee, etc)*

```js
    .js(function(compiler) {
        compiler
            .package('PackageName');
            // Add CommonJs wrapping for all files in compiler scope
            // With prefix `PackageName`
    });
    
    
    // Example
    .withCommonJs()
    .js(function(compiler) {
        compiler
            .package('App')
            .file('src/Application.js');
    });
    // In your browser: `var Application = require('App/Application');`
```
