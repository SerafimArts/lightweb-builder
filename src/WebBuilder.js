"use strict";

import gulp from "gulp";
import merge from "merge2";
import debug from "gulp-debug";


/**
 * @class Compiler
 * @package lightweb-builder
 */
class Compiler {
    static TYPE_FILE = 'file';
    static TYPE_DIR = 'path';

    /**
     * @type {WebBuilder}
     * @private
     */
    _builder = null;

    /**
     * @type {boolean}
     * @private
     */
    _syncBuilding = false;

    /**
     * @type {{}}
     * @private
     */
    _files = {};

    /**
     * @type {Array}
     * @private
     */
    _gulpPaths = [];

    /**
     * @param builder
     */
    constructor(builder) {
        this._builder = builder;
    }

    /**
     * @param enabled
     * @returns {Compiler}
     */
    syncBuilding(enabled = false) {
        this._syncBuilding = !!enabled;
        return this;
    }

    /**
     * @returns {boolean}
     */
    get synced() {
        return this._syncBuilding;
    }

    /**
     * @returns {{}}
     */
    get files() {
        return this._files;
    }

    /**
     * @param {string} file
     * @returns {Compiler}
     */
    file(file) {
        this._files[file] = Compiler.TYPE_FILE;
        this._gulpPaths.push(file);
        return this;
    }

    /**
     * @param {string} path
     * @param {string} extension
     * @returns {Compiler}
     */
    path(path, extension = '') {
        var lastChar = path[path.length - 1];
        if (lastChar !== '/' && lastChar !== '\\') {
            throw new Error('Directory name must be ended at "/" char');
        }

        this._files[path] = Compiler.TYPE_DIR;
        this._gulpPaths.push(path + '**/*' + extension);
        return this;
    }

    /**
     * @param {Function|null} wrapStream
     * @returns {*}
     */
    createStream(wrapStream = null) {
        var stream = gulp.src(this._gulpPaths);

        if (wrapStream) {
            stream = wrapStream(stream, this);
        }

        return stream.pipe(debug({title: '+'}));
    }

    /**
     * @param gulp
     * @param {object} options
     * @returns {*}
     */
    minify(gulp, options = {}) {
        return gulp;
    }

    /**
     * @param {string} name
     * @param {string} pkg
     * @param {string} version
     * @returns {Error}
     */
    compilerError(name, pkg, version) {
        return new Error(`${name} compiler not defined. Please add {"${pkg}": "${version}"} in your package.json`);
    }
}

/**
 * @class JsCompiler
 * @package lightweb-builder
 */
class JsCompiler extends Compiler {
    /**
     * @type {{}}
     * @private
     */
    _package = '';

    /**
     * @returns {*}
     */
    get wrapper() {
        return require('gulp-wrap-commonjs');
    }

    /**
     * @returns {*}
     */
    get uglify() {
        return require('gulp-uglify');
    }

    /**
     * @param {string} name
     * @returns {JsCompiler}
     */
    namespace(name) {
        var lastChar = name[name.length - 1];
        if (lastChar !== '/') {
            name += '/';
        }
        this._package = name;
        return this;
    }

    /**
     * @param {string} text
     * @returns {string}
     * @private
     */
    static _escapeRegexp(text) {
        return text.replace(/[\-\[\]\/\{\}\(\)\+\?\*\.\\\^\$\|]/g, "\\$&");
    }

    /**
     * @param gulp
     * @param options
     * @returns {*}
     */
    minify(gulp, options = {}) {
        return gulp.pipe(this.uglify(options));
    }

    /**
     * @param {string} path
     * @param {string} extension
     * @returns {Compiler}
     */
    path(path, extension = '.js') {
        return super.path(path, extension);
    }

    /**
     * @param {Function|null} wrapStream
     * @returns {*}
     */
    createStream(wrapStream = null) {
        var stream = super.createStream(wrapStream);

        if (this._package !== '') {
            stream = stream.pipe(this.wrapper({
                pathModifier: path => {
                    path = path.replace(/\\/g, '/');

                    Object.keys(this.files).forEach(item => {
                        var type   = this.files[item];
                        var isFile = type === Compiler.TYPE_FILE;
                        var regexp = isFile
                            ? new RegExp('.*?' + this.constructor._escapeRegexp(item) + '$', 'g')
                            : new RegExp('.*?' + this.constructor._escapeRegexp(item) + '.*?', 'g');

                        if (item.match(regexp)) {
                            path = path.replace(regexp, isFile ? item.split('/').pop() : '');
                        }
                    });

                    var result = this._package + path.replace(/\.[a-z0-9]+$/, '');

                    if (result[0] === '/') {
                        return result.substr(1);
                    }

                    return result;
                }
            }));
        }

        return stream;
    }
}

/**
 * @class CssCompiler
 * @package lightweb-builder
 */
class CssCompiler extends Compiler {
    /**
     * @type {boolean}
     * @private
     */
    _autoPrefixer = false;

    /**
     * @type {{}}
     * @private
     */
    _autoPrefixerOptions = {};

    /**
     * @returns {*}
     */
    get uglify() {
        return require('gulp-clean-css');
    }

    /**
     * @param path
     * @param extension
     * @returns {Compiler}
     */
    path(path, extension = '.css') {
        return super.path(path, extension);
    }

    /**
     * @param enabled
     * @param options
     * @returns {CssCompiler}
     */
    autoPrefix(enabled = true, options = {}) {
        this._autoPrefixer = !!enabled;
        this._autoPrefixerOptions = options;
        return this;
    }

    /**
     * @param gulp
     * @param options
     * @returns {*}
     */
    minify(gulp, options = {}) {
        return gulp.pipe(this.uglify(options));
    }

    /**
     * @param wrapStream
     * @returns {*}
     */
    createStream(wrapStream = null) {
        var build = (stream) => {
            var autoprefixes = require('gulp-autoprefixer');

            if (this._autoPrefixer) {
                var args = this._autoPrefixerOptions;
                stream = stream.pipe(autoprefixes(args));
            }

            return stream;
        };

        return super.createStream(stream => {
            stream = build(stream);
            if (wrapStream) {
                stream = wrapStream(stream, this);
            }
            return stream;
        });
    }
}

/**
 * @class SassCompiler
 * @package lightweb-builder
 */
class SassCompiler extends CssCompiler {
    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-sass');
        } catch (e) {
            throw this.compilerError('Sass', 'gulp-sass', '2.2.*');
        }
    }

    /**
     * @param path
     * @param extension
     * @returns {*|Compiler}
     */
    path(path, extension = '.sass') {
        return super.path(path, extension);
    }

    /**
     * @param wrapStream
     * @returns {*}
     */
    createStream(wrapStream = null) {
        var build = (stream) => {
            return stream.pipe(this.compiler());
        };

        return super.createStream(stream => {
            stream = build(stream);
            if (wrapStream) {
                stream = wrapStream(stream, this);
            }
            return stream;
        });
    }
}

/**
 * @class ScssCompiler
 * @package lightweb-builder
 */
class ScssCompiler extends SassCompiler {
    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-sass');
        } catch (e) {
            throw this.compilerError('Scss', 'gulp-sass', '2.2.*');
        }
    }

    /**
     * @param path
     * @param extension
     * @returns {*|Compiler}
     */
    path(path, extension = '.scss') {
        return super.path(path, extension);
    }
}

/**
 * @class LessCompiler
 * @package lightweb-builder
 */
class LessCompiler extends CssCompiler {
    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-less');
        } catch (e) {
            throw this.compilerError('Less', 'gulp-less', '3.0.*');
        }
    }

    /**
     * @param path
     * @param extension
     * @returns {*|Compiler}
     */
    path(path, extension = '.less') {
        return super.path(path, extension);
    }

    /**
     * @param wrapStream
     * @returns {*}
     */
    createStream(wrapStream = null) {
        var build = (stream) => {
            return stream.pipe(this.compiler());
        };

        return super.createStream(stream => {
            stream = build(stream);
            if (wrapStream) {
                stream = wrapStream(stream, this);
            }
            return stream;
        });
    }
}

/**
 * @class StylusCompiler
 * @package lightweb-builder
 */
class StylusCompiler extends CssCompiler {
    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-stylus');
        } catch (e) {
            throw this.compilerError('Stylus', 'gulp-stylus', '2.3.*');
        }
    }

    /**
     * @param {string} path
     * @param {string} extension
     * @returns {*|Compiler}
     */
    path(path, extension = '.styl') {
        return super.path(path, extension);
    }

    /**
     * @param wrapStream
     * @returns {*}
     */
    createStream(wrapStream = null) {
        var build = (stream) => {
            return stream.pipe(this.compiler());
        };

        return super.createStream(stream => {
            stream = build(stream);
            if (wrapStream) {
                stream = wrapStream(stream, this);
            }
            return stream;
        });
    }
}

/**
 * @class BabelCompiler
 * @package lightweb-builder
 */
class BabelCompiler extends JsCompiler {
    /**
     * @type {Array}
     * @private
     */
    _presets = [];

    /**
     * @type {Array}
     * @private
     */
    _plugins = [];

    /**
     * @type {{}}
     * @private
     */
    _options = {};

    /**
     * @param presets
     * @returns {BabelCompiler}
     */
    preset(...presets) {
        this._presets = this._presets.concat(presets);
        return this;
    }

    /**
     * @param plugins
     * @returns {BabelCompiler}
     */
    plugin(...plugins) {
        this._plugins = this._plugins.concat(plugins);
        return this;
    }

    options (args = {}) {
        this._options = args;
        return this;
    }

    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-babel');
        } catch (e) {
            throw this.compilerError('Babel', 'gulp-babel', '6.1.*');
        }
    }

    /**
     * @param wrapStream
     * @returns {*}
     */
    createStream(wrapStream = null) {
        var build = (stream) => {
            var args = {
                presets: this._presets,
                plugins: this._plugins
            };

            Object.keys(this._options).forEach(key => {
                args[key] = this._options[key];
            });

            return stream.pipe(this.compiler(args));
        };

        return super.createStream(stream => {
            stream = build(stream);
            if (wrapStream) {
                stream = wrapStream(stream, this);
            }
            return stream;
        });
    }
}

/**
 * @class CoffeeCompiler
 * @package lightweb-builder
 */
class CoffeeCompiler extends JsCompiler {
    /**
     * @type {boolean}
     * @private
     */
    _bare = false;

    /**
     * @param enabled
     * @returns {CoffeeCompiler}
     */
    bare(enabled = true) {
        this._bare = enabled;
        return this;
    }

    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-coffee');
        } catch (e) {
            throw this.compilerError('CoffeeScript', 'gulp-coffee', '2.3.*');
        }
    }

    /**
     * @param {string} path
     * @param {string} extension
     * @returns {Compiler}
     */
    path(path, extension = '.coffee') {
        return super.path(path, extension);
    }

    /**
     * @param wrapStream
     * @returns {*}
     */
    createStream(wrapStream = null) {
        var build = (stream) => {
            var args = {};

            if (this._bare) {
                args['bare'] = true;
            }

            return stream.pipe(this.compiler(args));
        };

        return super.createStream(stream => {
            stream = build(stream);
            if (wrapStream) {
                stream = wrapStream(stream, this);
            }
            return stream;
        });
    }
}

/**
 * @class TypeScriptCompiler
 * @package lightweb-builder
 */
class TypeScriptCompiler extends JsCompiler {
    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-typescript');
        } catch (e) {
            throw this.compilerError('TypeScriptCompiler', 'gulp-typescript', '2.12.*');
        }
    }

    /**
     * @param {string} path
     * @param {string} extension
     * @returns {Compiler}
     */
    path(path, extension = '.ts') {
        return super.path(path, extension);
    }

    /**
     * @param wrapStream
     * @returns {*}
     */
    createStream(wrapStream = null) {
        var build = (stream) => {
            var args = {

            };

            return stream.pipe(this.compiler(args));
        };

        return super.createStream(stream => {
            stream = build(stream);
            if (wrapStream) {
                stream = wrapStream(stream, this);
            }
            return stream;
        });
    }
}

/**
 * @class WebBuilder
 * @package lightweb-builder
 */
export default class WebBuilder {
    /**
     * @type {Array}
     * @private
     */
    _compilers = [];

    /**
     * @type {boolean}
     * @private
     */
    _sourceMaps = false;

    /**
     * @type {boolean}
     * @private
     */
    _minify = false;

    /**
     * @type {{}}
     * @private
     */
    _minifyOptions = {};

    /**
     * @type {boolean}
     * @private
     */
    _compress = false;

    /**
     * @type {boolean}
     * @private
     */
    _syncBuildingNext = false;

    /**
     * @returns {WebBuilder}
     */
    get then() {
        this._syncBuildingNext = true;

        if (this._compilers.length > 0) {
            var lastCompiler = this._compilers[this._compilers.length - 1];
            lastCompiler.syncBuilding(true);
        }

        return this;
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    babel(callback = function () {}) {
        return this._make(BabelCompiler, callback);
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    es6(callback = function () {}) {
        return this._make(BabelCompiler, callback, (compiler) => {
            return compiler.preset('es2015');
        });
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    es7(callback = function () {}) {
        return this._make(BabelCompiler, callback, (compiler) => {
            return compiler.preset('es2015', 'stage-0');
        });
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    coffee(callback = function () {}) {
        return this._make(CoffeeCompiler, callback);
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    js(callback = function () {}) {
        return this._make(JsCompiler, callback);
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    ts(callback = function () {}) {
        return this._make(TypeScriptCompiler, callback);
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    sass(callback = function () {}) {
        return this._make(SassCompiler, callback);
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    scss(callback = function () {}) {
        return this._make(ScssCompiler, callback);
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    less(callback = function () {}) {
        return this._make(LessCompiler, callback);
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    stylus(callback = function () {}) {
        return this._make(StylusCompiler, callback);
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    css(callback = function () {}) {
        return this._make(CssCompiler, callback);
    }

    /**
     * @param {Function} compilerClass
     * @param {Function|string|Array} callback
     * @param {Function|null} before
     * @returns {WebBuilder}
     * @private
     */
    _make(compilerClass, callback = function(){}, before = null) {
        var compiler = new compilerClass(this);

        if (this._syncBuildingNext) {
            compiler.syncBuilding(true);
            this._syncBuildingNext = false;
        }

        if (typeof callback === 'string') {
            let file = callback;
            callback = (compiler) => {
                return compiler.file(file);
            };

        } else if (callback instanceof Array) {
            let files = callback;
            callback = (compiler) => {
                for (var i = 0; i < files.length; i++) {
                    compiler.file(files[i]);
                }
            };
        }

        if (before) {
            compiler = before(compiler);
        }

        this._compilers.push(compiler);

        callback(compiler);

        return this;
    }

    /**
     * @returns {WebBuilder}
     */
    withCommonJs() {
        return this.then.js(compiler => {
            compiler.file(require.resolve('commonjs-require/commonjs-require'));
        });
    }

    /**
     * @returns {WebBuilder}
     */
    withPolyfill() {
        return this.then.js(compiler => {
            compiler.file(require.resolve('babel-polyfill/dist/polyfill'));
        });
    }

    /**
     * @param {boolean} enabled
     * @returns {WebBuilder}
     */
    withSourceMaps(enabled = true) {
        this._sourceMaps = !!enabled;
        return this;
    }

    /**
     * @param {boolean} enabled
     * @param {object} options
     * @returns {WebBuilder}
     */
    withMinify(enabled = true, options = {}) {
        this._minify = !!enabled;
        this._minifyOptions = options;
        return this;
    }

    /**
     * @param {boolean} enabled
     * @returns {WebBuilder}
     */
    withGzip(enabled = true) {
        this._compress = !!enabled;
        return this;
    }

    /**
     * @param output
     * @returns {*}
     */
    build(output = './compiled') {
        if (this._compilers.length === 0) {
            throw new Error('Building error. Empty sources list');
        }

        var sourcemaps   = require('gulp-sourcemaps');
        var concat       = require('gulp-concat');
        var gzip         = require('gulp-gzip');

        var streams      = [];
        var asyncStreams = [];

        for (var i = 0; i < this._compilers.length; i++) {
            var compiler = this._compilers[i];
            var compilerStream = compiler.createStream();

            if (compiler.synced) {
                streams.push(compilerStream);
            } else {
                asyncStreams.push(compilerStream);
            }
        }

        var stream  = merge(...streams, asyncStreams);

        if (this._sourceMaps) {
            stream = stream.pipe(sourcemaps.init());
        }

        var parts    = output.toString().split('/');
        var fileName = parts.pop();
        var dist     = (parts.length > 0 ? parts.join('/') : '.') + '/';
        if (!fileName.trim()) {
            throw new Error('Invalid output path ' + output);
        }

        stream = stream.pipe(concat(fileName));

        if (this._minify) {
            stream = this._compilers[0].minify(stream, this._minifyOptions);
        }

        if (this._sourceMaps) {
            stream = stream.pipe(sourcemaps.write('.'));
        }

        if (this._compress) {
            stream
                .pipe(concat(fileName))
                .pipe(gzip())
                .pipe(gulp.dest(dist));
        }

        return stream.pipe(gulp.dest(dist));

    }
}
