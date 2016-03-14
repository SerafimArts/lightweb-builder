import gulp from "gulp";
import merge from "merge2";
import gzip from "gulp-gzip";
import debug from "gulp-debug";
import concat from "gulp-concat";
import sourcemaps from "gulp-sourcemaps";


/**
 * @class Compiler
 * @package WebBuilder
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
     * @param options
     * @returns {*}
     */
    minify(gulp, options = {}) {
        return gulp;
    }
}

/**
 * @class JsCompiler
 * @package WebBuilder
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
    package(name) {
        var lastChar = name[name.length - 1];
        if (lastChar !== '/') {
            name += '/';
        }
        this._package = name;
        return this;
    }

    /**
     * @param text
     * @returns {void|string|XML}
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
     * @param path
     * @param extension
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


                    return this._package + path.replace(/\.[a-z0-9]+$/, '');
                }
            }));
        }

        return stream;
    }
}

/**
 * @class CssCompiler
 * @package WebBuilder
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
 * @package WebBuilder
 */
class SassCompiler extends CssCompiler {
    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-sass');
        } catch (e) {
            throw new Error('Sass compiler not defined. Please add {"gulp-sass": "2.2.*"} in your package.json');
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
 * @package WebBuilder
 */
class ScssCompiler extends SassCompiler {
    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-sass');
        } catch (e) {
            throw new Error('Scss compiler not defined. Please add {"gulp-sass": "2.2.*"} in your package.json');
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
 * @package WebBuilder
 */
class LessCompiler extends CssCompiler {
    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-less');
        } catch (e) {
            throw new Error('Less compiler not defined. Please add {"gulp-less": "3.0.*"} in your package.json');
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
 * @package WebBuilder
 */
class StylusCompiler extends CssCompiler {
    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-stylus');
        } catch (e) {
            throw new Error('Stylus compiler not defined. Please add {"gulp-stylus": "2.3.*"} in your package.json');
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
 * @package WebBuilder
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

    /**
     * @returns {*}
     */
    get compiler() {
        try {
            return require('gulp-babel');
        } catch (e) {
            throw new Error('Babel compiler not defined. Please add {"gulp-babel": "6.1.*"} in your package.json');
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
 * @package WebBuilder
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
            throw new Error('CoffeeScript compiler not defined. Please add {"gulp-coffee": "2.3.*"} in your' +
                ' package.json');
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
 * @class WebBuilder
 * @package WebBuilder
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
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    babel(callback = function () {}) {
        var compiler = new BabelCompiler(this);
        this._compilers.push(compiler);

        callback(compiler);

        return this;
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    es6(callback = function () {}) {
        var compiler = (new BabelCompiler(this)).preset('es2015');
        this._compilers.push(compiler);

        callback(compiler);

        return this;
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    es7(callback = function () {}) {
        var compiler = (new BabelCompiler(this)).preset('es2015', 'stage-0');

        this._compilers.push(compiler);

        callback(compiler);

        return this;
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    coffee(callback = function () {}) {
        var compiler = new CoffeeCompiler(this);

        this._compilers.push(compiler);

        callback(compiler);

        return this;
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    js(callback = function () {}) {
        var compiler = new JsCompiler(this);

        this._compilers.push(compiler);

        callback(compiler);

        return this;
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    sass(callback = function () {}) {
        var compiler = new SassCompiler(this);

        this._compilers.push(compiler);

        callback(compiler);

        return this;
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    scss(callback = function () {}) {
        var compiler = new ScssCompiler(this);

        this._compilers.push(compiler);

        callback(compiler);

        return this;
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    less(callback = function () {}) {
        var compiler = new LessCompiler(this);

        this._compilers.push(compiler);

        callback(compiler);

        return this;
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    stylus(callback = function () {}) {
        var compiler = new StylusCompiler(this);

        this._compilers.push(compiler);

        callback(compiler);

        return this;
    }

    /**
     * @param {Function} callback
     * @returns {WebBuilder}
     */
    css(callback = function () {}) {
        var compiler = new CssCompiler(this);

        this._compilers.push(compiler);

        callback(compiler);

        return this;
    }

    /**
     * @returns {WebBuilder}
     */
    withCommonJs() {
        return this.js(compiler => {
            compiler.file(require.resolve('commonjs-require/commonjs-require'));
        });
    }

    /**
     * @returns {WebBuilder}
     */
    withPolyfill() {
        return this.js(compiler => {
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
        var streams = [];

        if (this._compilers.length === 0) {
            throw new Error('Building error. Empty sources list');
        }

        for (var i = 0; i < this._compilers.length; i++) {
            streams.push(this._compilers[i].createStream());
        }

        var stream = merge(streams);

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
