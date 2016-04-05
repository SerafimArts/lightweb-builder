lightweb-builder
======================

Lightweight compiler for web-based applications

# Installation

```
npm install --save-dev lightweb-builder
```

# Usage

### Simple examples:

```js
var builder = require('lightweb-builder').default;

gulp.task('default', function() {
    (new builder)
        .js(function(compiler) {
            compiler
                .path('src/path/')
                .file('src/vendor/jquery.js');
        })
        .build('./public/path/filename.js');
        
    (new builder)
        .css('src/source.css') // Shortcut for compiler.file('src/source.css');
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
    "gulp-stylus": "2.3.*",             // Stylus support
    "gulp-typescript": "2.12.*"         // TypeScript support
}
```

### Compilers usage

```js
var builder = require('lightweb-builder').default;

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

- `.babel([options])` - Babel compiler
- `.es6([options])` - EcmaScript 2015 compiler (Babel with es2015 preset)
- `.es7([options])` - EcmaScript 2016 compiler (Babel with es2015 & stage-0 presets)
- `.coffee([options])` - CoffeeScript compiler
- `.js([options])` - JavaScript compiler
- `.ts([options])` - TypeScript compiler
- `.sass([options])` - Sass compiler
- `.scss([options])` - Scss compiler
- `.less([options])` - Less compiler
- `.stylus([options])` - Stylus compiler
- `.css([options])` - Css compiler

> `options` can be type of String, Array of strings or callback Function. Like:


```
(new builder)

    .css(function(compiler) {
      compiler.file('css/layout.css').file('css/dependency.css');
    })

// Alias for

(new builder)

    .css('css/layout.css')
    .css('css/dependency.css')

// Or 

(new builder)

    .css(['css/layout.css', 'css/dependency.css'])

```


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
            .namespace('PackageName');
            // Add CommonJs wrapping for all files in compiler scope
            // With prefix `PackageName`
    });
    
    
    // Example
    .withCommonJs()
    .js(function(compiler) {
        compiler
            .namespace('App')
            .file('src/Application.js');
    });
    // In your browser: `var Application = require('App/Application');`
```

### Compilation order

All files will be compiled in parallel, like this:

```js
(new builder)
    .js('src/some.js')
    .js('src/any.js')
    .js('src/some2.js')
    .js('src/any2.js')
    .build('output.js');
    
/*
 | Compilation order 
 |  - random order
 |
 | some.js --->
 |             |    
 | any.js  --->
 |             | ----> output.js
 | some2.js -->
 |             |
 | any2.js --->
*/
```

But you can set order of compilation with `.then` keyword:

```js
(new builder)
    .js('src/some.js')
    .js('src/some2.js')
    .js('src/any.js')
    .then.js('src/any2.js')
    .build('output.js');
    
/*
 | Compilation order: 
 |  - any.js then any2.js and some.js + some2.js with random order
 |
 | any.js -> any2.js ->
 |                     | ----> output.js
 | some.js ----------->
 |                     |
 | some2.js ---------->
*/
```
