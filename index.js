"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _gulp = require("gulp");

var _gulp2 = _interopRequireDefault(_gulp);

var _merge = require("merge2");

var _merge2 = _interopRequireDefault(_merge);

var _gulpGzip = require("gulp-gzip");

var _gulpGzip2 = _interopRequireDefault(_gulpGzip);

var _gulpDebug = require("gulp-debug");

var _gulpDebug2 = _interopRequireDefault(_gulpDebug);

var _gulpConcat = require("gulp-concat");

var _gulpConcat2 = _interopRequireDefault(_gulpConcat);

var _gulpSourcemaps = require("gulp-sourcemaps");

var _gulpSourcemaps2 = _interopRequireDefault(_gulpSourcemaps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class Compiler
 * @package WebBuilder
 */

var Compiler = function () {

    /**
     * @param builder
     */


    /**
     * @type {{}}
     * @private
     */

    function Compiler(builder) {
        _classCallCheck(this, Compiler);

        this._builder = null;
        this._files = {};
        this._gulpPaths = [];

        this._builder = builder;
    }

    /**
     * @returns {{}}
     */


    /**
     * @type {Array}
     * @private
     */


    /**
     * @type {WebBuilder}
     * @private
     */


    _createClass(Compiler, [{
        key: "file",


        /**
         * @param {string} file
         * @returns {Compiler}
         */
        value: function file(_file) {
            this._files[_file] = Compiler.TYPE_FILE;
            this._gulpPaths.push(_file);
            return this;
        }

        /**
         * @param {string} path
         * @param {string} extension
         * @returns {Compiler}
         */

    }, {
        key: "path",
        value: function path(_path) {
            var extension = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            var lastChar = _path[_path.length - 1];
            if (lastChar !== '/' && lastChar !== '\\') {
                throw new Error('Directory name must be ended at "/" char');
            }

            this._files[_path] = Compiler.TYPE_DIR;
            this._gulpPaths.push(_path + '**/*' + extension);
            return this;
        }

        /**
         * @param {Function|null} wrapStream
         * @returns {*}
         */

    }, {
        key: "createStream",
        value: function createStream() {
            var wrapStream = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var stream = _gulp2.default.src(this._gulpPaths);

            if (wrapStream) {
                stream = wrapStream(stream, this);
            }

            return stream.pipe((0, _gulpDebug2.default)({ title: '+' }));
        }

        /**
         * @param gulp
         * @param options
         * @returns {*}
         */

    }, {
        key: "minify",
        value: function minify(gulp) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            return gulp;
        }
    }, {
        key: "files",
        get: function get() {
            return this._files;
        }
    }]);

    return Compiler;
}();

/**
 * @class JsCompiler
 * @package WebBuilder
 */


Compiler.TYPE_FILE = 'file';
Compiler.TYPE_DIR = 'path';

var JsCompiler = function (_Compiler) {
    _inherits(JsCompiler, _Compiler);

    function JsCompiler() {
        var _Object$getPrototypeO;

        var _temp, _this, _ret;

        _classCallCheck(this, JsCompiler);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(JsCompiler)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this._package = '', _temp), _possibleConstructorReturn(_this, _ret);
    }
    /**
     * @type {{}}
     * @private
     */


    _createClass(JsCompiler, [{
        key: "package",


        /**
         * @param {string} name
         * @returns {JsCompiler}
         */
        value: function _package(name) {
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

    }, {
        key: "minify",


        /**
         * @param gulp
         * @param options
         * @returns {*}
         */
        value: function minify(gulp) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            return gulp.pipe(this.uglify(options));
        }

        /**
         * @param path
         * @param extension
         * @returns {Compiler}
         */

    }, {
        key: "path",
        value: function path(_path2) {
            var extension = arguments.length <= 1 || arguments[1] === undefined ? '.js' : arguments[1];

            return _get(Object.getPrototypeOf(JsCompiler.prototype), "path", this).call(this, _path2, extension);
        }

        /**
         * @param {Function|null} wrapStream
         * @returns {*}
         */

    }, {
        key: "createStream",
        value: function createStream() {
            var _this2 = this;

            var wrapStream = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var stream = _get(Object.getPrototypeOf(JsCompiler.prototype), "createStream", this).call(this, wrapStream);

            if (this._package !== '') {
                stream = stream.pipe(this.wrapper({
                    pathModifier: function pathModifier(path) {
                        path = path.replace(/\\/g, '/');

                        Object.keys(_this2.files).forEach(function (item) {
                            var type = _this2.files[item];
                            var isFile = type === Compiler.TYPE_FILE;
                            var regexp = isFile ? new RegExp('.*?' + _this2.constructor._escapeRegexp(item) + '$', 'g') : new RegExp('.*?' + _this2.constructor._escapeRegexp(item) + '.*?', 'g');

                            if (item.match(regexp)) {
                                path = path.replace(regexp, isFile ? item.split('/').pop() : '');
                            }
                        });

                        return _this2._package + path.replace(/\.[a-z0-9]+$/, '');
                    }
                }));
            }

            return stream;
        }
    }, {
        key: "wrapper",


        /**
         * @returns {*}
         */
        get: function get() {
            return require('gulp-wrap-commonjs');
        }

        /**
         * @returns {*}
         */

    }, {
        key: "uglify",
        get: function get() {
            return require('gulp-uglify');
        }
    }], [{
        key: "_escapeRegexp",
        value: function _escapeRegexp(text) {
            return text.replace(/[\-\[\]\/\{\}\(\)\+\?\*\.\\\^\$\|]/g, "\\$&");
        }
    }]);

    return JsCompiler;
}(Compiler);

/**
 * @class CssCompiler
 * @package WebBuilder
 */


var CssCompiler = function (_Compiler2) {
    _inherits(CssCompiler, _Compiler2);

    function CssCompiler() {
        var _Object$getPrototypeO2;

        var _temp2, _this3, _ret2;

        _classCallCheck(this, CssCompiler);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this3 = _possibleConstructorReturn(this, (_Object$getPrototypeO2 = Object.getPrototypeOf(CssCompiler)).call.apply(_Object$getPrototypeO2, [this].concat(args))), _this3), _this3._autoPrefixer = false, _this3._autoPrefixerOptions = {}, _temp2), _possibleConstructorReturn(_this3, _ret2);
    }
    /**
     * @type {boolean}
     * @private
     */


    /**
     * @type {{}}
     * @private
     */


    _createClass(CssCompiler, [{
        key: "path",


        /**
         * @param path
         * @param extension
         * @returns {Compiler}
         */
        value: function path(_path3) {
            var extension = arguments.length <= 1 || arguments[1] === undefined ? '.css' : arguments[1];

            return _get(Object.getPrototypeOf(CssCompiler.prototype), "path", this).call(this, _path3, extension);
        }

        /**
         * @param enabled
         * @param options
         * @returns {CssCompiler}
         */

    }, {
        key: "autoPrefix",
        value: function autoPrefix() {
            var enabled = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            this._autoPrefixer = !!enabled;
            this._autoPrefixerOptions = options;
            return this;
        }

        /**
         * @param gulp
         * @param options
         * @returns {*}
         */

    }, {
        key: "minify",
        value: function minify(gulp) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            return gulp.pipe(this.uglify(options));
        }

        /**
         * @param wrapStream
         * @returns {*}
         */

    }, {
        key: "createStream",
        value: function createStream() {
            var _this4 = this;

            var wrapStream = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var build = function build(stream) {
                var autoprefixes = require('gulp-autoprefixer');

                if (_this4._autoPrefixer) {
                    var args = _this4._autoPrefixerOptions;
                    stream = stream.pipe(autoprefixes(args));
                }

                return stream;
            };

            return _get(Object.getPrototypeOf(CssCompiler.prototype), "createStream", this).call(this, function (stream) {
                stream = build(stream);
                if (wrapStream) {
                    stream = wrapStream(stream, _this4);
                }
                return stream;
            });
        }
    }, {
        key: "uglify",


        /**
         * @returns {*}
         */
        get: function get() {
            return require('gulp-clean-css');
        }
    }]);

    return CssCompiler;
}(Compiler);

/**
 * @class SassCompiler
 * @package WebBuilder
 */


var SassCompiler = function (_CssCompiler) {
    _inherits(SassCompiler, _CssCompiler);

    function SassCompiler() {
        _classCallCheck(this, SassCompiler);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SassCompiler).apply(this, arguments));
    }

    _createClass(SassCompiler, [{
        key: "path",


        /**
         * @param path
         * @param extension
         * @returns {*|Compiler}
         */
        value: function path(_path4) {
            var extension = arguments.length <= 1 || arguments[1] === undefined ? '.sass' : arguments[1];

            return _get(Object.getPrototypeOf(SassCompiler.prototype), "path", this).call(this, _path4, extension);
        }

        /**
         * @param wrapStream
         * @returns {*}
         */

    }, {
        key: "createStream",
        value: function createStream() {
            var _this6 = this;

            var wrapStream = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var build = function build(stream) {
                return stream.pipe(_this6.compiler());
            };

            return _get(Object.getPrototypeOf(SassCompiler.prototype), "createStream", this).call(this, function (stream) {
                stream = build(stream);
                if (wrapStream) {
                    stream = wrapStream(stream, _this6);
                }
                return stream;
            });
        }
    }, {
        key: "compiler",

        /**
         * @returns {*}
         */
        get: function get() {
            try {
                return require('gulp-sass');
            } catch (e) {
                throw new Error('Sass compiler not defined. Please add {"gulp-sass": "2.2.*"} in your package.json');
            }
        }
    }]);

    return SassCompiler;
}(CssCompiler);

/**
 * @class ScssCompiler
 * @package WebBuilder
 */


var ScssCompiler = function (_SassCompiler) {
    _inherits(ScssCompiler, _SassCompiler);

    function ScssCompiler() {
        _classCallCheck(this, ScssCompiler);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ScssCompiler).apply(this, arguments));
    }

    _createClass(ScssCompiler, [{
        key: "path",


        /**
         * @param path
         * @param extension
         * @returns {*|Compiler}
         */
        value: function path(_path5) {
            var extension = arguments.length <= 1 || arguments[1] === undefined ? '.scss' : arguments[1];

            return _get(Object.getPrototypeOf(ScssCompiler.prototype), "path", this).call(this, _path5, extension);
        }
    }, {
        key: "compiler",

        /**
         * @returns {*}
         */
        get: function get() {
            try {
                return require('gulp-sass');
            } catch (e) {
                throw new Error('Scss compiler not defined. Please add {"gulp-sass": "2.2.*"} in your package.json');
            }
        }
    }]);

    return ScssCompiler;
}(SassCompiler);

/**
 * @class LessCompiler
 * @package WebBuilder
 */


var LessCompiler = function (_CssCompiler2) {
    _inherits(LessCompiler, _CssCompiler2);

    function LessCompiler() {
        _classCallCheck(this, LessCompiler);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(LessCompiler).apply(this, arguments));
    }

    _createClass(LessCompiler, [{
        key: "path",


        /**
         * @param path
         * @param extension
         * @returns {*|Compiler}
         */
        value: function path(_path6) {
            var extension = arguments.length <= 1 || arguments[1] === undefined ? '.less' : arguments[1];

            return _get(Object.getPrototypeOf(LessCompiler.prototype), "path", this).call(this, _path6, extension);
        }

        /**
         * @param wrapStream
         * @returns {*}
         */

    }, {
        key: "createStream",
        value: function createStream() {
            var _this9 = this;

            var wrapStream = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var build = function build(stream) {
                return stream.pipe(_this9.compiler());
            };

            return _get(Object.getPrototypeOf(LessCompiler.prototype), "createStream", this).call(this, function (stream) {
                stream = build(stream);
                if (wrapStream) {
                    stream = wrapStream(stream, _this9);
                }
                return stream;
            });
        }
    }, {
        key: "compiler",

        /**
         * @returns {*}
         */
        get: function get() {
            try {
                return require('gulp-less');
            } catch (e) {
                throw new Error('Less compiler not defined. Please add {"gulp-less": "3.0.*"} in your package.json');
            }
        }
    }]);

    return LessCompiler;
}(CssCompiler);

/**
 * @class StylusCompiler
 * @package WebBuilder
 */


var StylusCompiler = function (_CssCompiler3) {
    _inherits(StylusCompiler, _CssCompiler3);

    function StylusCompiler() {
        _classCallCheck(this, StylusCompiler);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(StylusCompiler).apply(this, arguments));
    }

    _createClass(StylusCompiler, [{
        key: "path",


        /**
         * @param {string} path
         * @param {string} extension
         * @returns {*|Compiler}
         */
        value: function path(_path7) {
            var extension = arguments.length <= 1 || arguments[1] === undefined ? '.styl' : arguments[1];

            return _get(Object.getPrototypeOf(StylusCompiler.prototype), "path", this).call(this, _path7, extension);
        }

        /**
         * @param wrapStream
         * @returns {*}
         */

    }, {
        key: "createStream",
        value: function createStream() {
            var _this11 = this;

            var wrapStream = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var build = function build(stream) {
                return stream.pipe(_this11.compiler());
            };

            return _get(Object.getPrototypeOf(StylusCompiler.prototype), "createStream", this).call(this, function (stream) {
                stream = build(stream);
                if (wrapStream) {
                    stream = wrapStream(stream, _this11);
                }
                return stream;
            });
        }
    }, {
        key: "compiler",

        /**
         * @returns {*}
         */
        get: function get() {
            try {
                return require('gulp-stylus');
            } catch (e) {
                throw new Error('Stylus compiler not defined. Please add {"gulp-stylus": "2.3.*"} in your package.json');
            }
        }
    }]);

    return StylusCompiler;
}(CssCompiler);

/**
 * @class BabelCompiler
 * @package WebBuilder
 */


var BabelCompiler = function (_JsCompiler) {
    _inherits(BabelCompiler, _JsCompiler);

    function BabelCompiler() {
        var _Object$getPrototypeO3;

        var _temp3, _this12, _ret3;

        _classCallCheck(this, BabelCompiler);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this12 = _possibleConstructorReturn(this, (_Object$getPrototypeO3 = Object.getPrototypeOf(BabelCompiler)).call.apply(_Object$getPrototypeO3, [this].concat(args))), _this12), _this12._presets = [], _this12._plugins = [], _temp3), _possibleConstructorReturn(_this12, _ret3);
    }
    /**
     * @type {Array}
     * @private
     */


    /**
     * @type {Array}
     * @private
     */


    _createClass(BabelCompiler, [{
        key: "preset",


        /**
         * @param presets
         * @returns {BabelCompiler}
         */
        value: function preset() {
            for (var _len4 = arguments.length, presets = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                presets[_key4] = arguments[_key4];
            }

            this._presets = this._presets.concat(presets);
            return this;
        }

        /**
         * @param plugins
         * @returns {BabelCompiler}
         */

    }, {
        key: "plugin",
        value: function plugin() {
            for (var _len5 = arguments.length, plugins = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                plugins[_key5] = arguments[_key5];
            }

            this._plugins = this._plugins.concat(plugins);
            return this;
        }

        /**
         * @returns {*}
         */

    }, {
        key: "createStream",


        /**
         * @param wrapStream
         * @returns {*}
         */
        value: function createStream() {
            var _this13 = this;

            var wrapStream = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var build = function build(stream) {
                var args = {
                    presets: _this13._presets,
                    plugins: _this13._plugins
                };

                return stream.pipe(_this13.compiler(args));
            };

            return _get(Object.getPrototypeOf(BabelCompiler.prototype), "createStream", this).call(this, function (stream) {
                stream = build(stream);
                if (wrapStream) {
                    stream = wrapStream(stream, _this13);
                }
                return stream;
            });
        }
    }, {
        key: "compiler",
        get: function get() {
            try {
                return require('gulp-babel');
            } catch (e) {
                throw new Error('Babel compiler not defined. Please add {"gulp-babel": "6.1.*"} in your package.json');
            }
        }
    }]);

    return BabelCompiler;
}(JsCompiler);

/**
 * @class CoffeeCompiler
 * @package WebBuilder
 */


var CoffeeCompiler = function (_JsCompiler2) {
    _inherits(CoffeeCompiler, _JsCompiler2);

    function CoffeeCompiler() {
        var _Object$getPrototypeO4;

        var _temp4, _this14, _ret4;

        _classCallCheck(this, CoffeeCompiler);

        for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
        }

        return _ret4 = (_temp4 = (_this14 = _possibleConstructorReturn(this, (_Object$getPrototypeO4 = Object.getPrototypeOf(CoffeeCompiler)).call.apply(_Object$getPrototypeO4, [this].concat(args))), _this14), _this14._bare = false, _temp4), _possibleConstructorReturn(_this14, _ret4);
    }
    /**
     * @type {boolean}
     * @private
     */


    _createClass(CoffeeCompiler, [{
        key: "bare",


        /**
         * @param enabled
         * @returns {CoffeeCompiler}
         */
        value: function bare() {
            var enabled = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            this._bare = enabled;
            return this;
        }

        /**
         * @returns {*}
         */

    }, {
        key: "path",


        /**
         * @param {string} path
         * @param {string} extension
         * @returns {Compiler}
         */
        value: function path(_path8) {
            var extension = arguments.length <= 1 || arguments[1] === undefined ? '.coffee' : arguments[1];

            return _get(Object.getPrototypeOf(CoffeeCompiler.prototype), "path", this).call(this, _path8, extension);
        }

        /**
         * @param wrapStream
         * @returns {*}
         */

    }, {
        key: "createStream",
        value: function createStream() {
            var _this15 = this;

            var wrapStream = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            var build = function build(stream) {
                var args = {};

                if (_this15._bare) {
                    args['bare'] = true;
                }

                return stream.pipe(_this15.compiler(args));
            };

            return _get(Object.getPrototypeOf(CoffeeCompiler.prototype), "createStream", this).call(this, function (stream) {
                stream = build(stream);
                if (wrapStream) {
                    stream = wrapStream(stream, _this15);
                }
                return stream;
            });
        }
    }, {
        key: "compiler",
        get: function get() {
            try {
                return require('gulp-coffee');
            } catch (e) {
                throw new Error('CoffeeScript compiler not defined. Please add {"gulp-coffee": "2.3.*"} in your' + ' package.json');
            }
        }
    }]);

    return CoffeeCompiler;
}(JsCompiler);

/**
 * @class WebBuilder
 * @package WebBuilder
 */


var WebBuilder = function () {
    function WebBuilder() {
        _classCallCheck(this, WebBuilder);

        this._compilers = [];
        this._sourceMaps = false;
        this._minify = false;
        this._minifyOptions = {};
        this._compress = false;
    }
    /**
     * @type {Array}
     * @private
     */


    /**
     * @type {boolean}
     * @private
     */


    /**
     * @type {boolean}
     * @private
     */


    /**
     * @type {{}}
     * @private
     */


    /**
     * @type {boolean}
     * @private
     */


    _createClass(WebBuilder, [{
        key: "babel",


        /**
         * @param {Function} callback
         * @returns {WebBuilder}
         */
        value: function babel() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            var compiler = new BabelCompiler(this);
            this._compilers.push(compiler);

            callback(compiler);

            return this;
        }

        /**
         * @param {Function} callback
         * @returns {WebBuilder}
         */

    }, {
        key: "es6",
        value: function es6() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            var compiler = new BabelCompiler(this).preset('es2015');
            this._compilers.push(compiler);

            callback(compiler);

            return this;
        }

        /**
         * @param {Function} callback
         * @returns {WebBuilder}
         */

    }, {
        key: "es7",
        value: function es7() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            var compiler = new BabelCompiler(this).preset('es2015', 'stage-0');

            this._compilers.push(compiler);

            callback(compiler);

            return this;
        }

        /**
         * @param {Function} callback
         * @returns {WebBuilder}
         */

    }, {
        key: "coffee",
        value: function coffee() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            var compiler = new CoffeeCompiler(this);

            this._compilers.push(compiler);

            callback(compiler);

            return this;
        }

        /**
         * @param {Function} callback
         * @returns {WebBuilder}
         */

    }, {
        key: "js",
        value: function js() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            var compiler = new JsCompiler(this);

            this._compilers.push(compiler);

            callback(compiler);

            return this;
        }

        /**
         * @param {Function} callback
         * @returns {WebBuilder}
         */

    }, {
        key: "sass",
        value: function sass() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            var compiler = new SassCompiler(this);

            this._compilers.push(compiler);

            callback(compiler);

            return this;
        }

        /**
         * @param {Function} callback
         * @returns {WebBuilder}
         */

    }, {
        key: "scss",
        value: function scss() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            var compiler = new ScssCompiler(this);

            this._compilers.push(compiler);

            callback(compiler);

            return this;
        }

        /**
         * @param {Function} callback
         * @returns {WebBuilder}
         */

    }, {
        key: "less",
        value: function less() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            var compiler = new LessCompiler(this);

            this._compilers.push(compiler);

            callback(compiler);

            return this;
        }

        /**
         * @param {Function} callback
         * @returns {WebBuilder}
         */

    }, {
        key: "stylus",
        value: function stylus() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            var compiler = new StylusCompiler(this);

            this._compilers.push(compiler);

            callback(compiler);

            return this;
        }

        /**
         * @param {Function} callback
         * @returns {WebBuilder}
         */

    }, {
        key: "css",
        value: function css() {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            var compiler = new CssCompiler(this);

            this._compilers.push(compiler);

            callback(compiler);

            return this;
        }

        /**
         * @returns {WebBuilder}
         */

    }, {
        key: "withCommonJs",
        value: function withCommonJs() {
            return this.js(function (compiler) {
                compiler.file(require.resolve('commonjs-require/commonjs-require'));
            });
        }

        /**
         * @returns {WebBuilder}
         */

    }, {
        key: "withPolyfill",
        value: function withPolyfill() {
            return this.js(function (compiler) {
                compiler.file(require.resolve('babel-polyfill/dist/polyfill'));
            });
        }

        /**
         * @param {boolean} enabled
         * @returns {WebBuilder}
         */

    }, {
        key: "withSourceMaps",
        value: function withSourceMaps() {
            var enabled = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            this._sourceMaps = !!enabled;
            return this;
        }

        /**
         * @param {boolean} enabled
         * @param {object} options
         * @returns {WebBuilder}
         */

    }, {
        key: "withMinify",
        value: function withMinify() {
            var enabled = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            this._minify = !!enabled;
            this._minifyOptions = options;
            return this;
        }

        /**
         * @param {boolean} enabled
         * @returns {WebBuilder}
         */

    }, {
        key: "withGzip",
        value: function withGzip() {
            var enabled = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            this._compress = !!enabled;
            return this;
        }

        /**
         * @param output
         * @returns {*}
         */

    }, {
        key: "build",
        value: function build() {
            var output = arguments.length <= 0 || arguments[0] === undefined ? './compiled' : arguments[0];

            var streams = [];

            if (this._compilers.length === 0) {
                throw new Error('Building error. Empty sources list');
            }

            for (var i = 0; i < this._compilers.length; i++) {
                streams.push(this._compilers[i].createStream());
            }

            var stream = (0, _merge2.default)(streams);

            if (this._sourceMaps) {
                stream = stream.pipe(_gulpSourcemaps2.default.init());
            }

            var parts = output.toString().split('/');
            var fileName = parts.pop();
            var dist = (parts.length > 0 ? parts.join('/') : '.') + '/';
            if (!fileName.trim()) {
                throw new Error('Invalid output path ' + output);
            }

            stream = stream.pipe((0, _gulpConcat2.default)(fileName));

            if (this._minify) {
                stream = this._compilers[0].minify(stream, this._minifyOptions);
            }

            if (this._sourceMaps) {
                stream = stream.pipe(_gulpSourcemaps2.default.write('.'));
            }

            if (this._compress) {
                stream.pipe((0, _gulpConcat2.default)(fileName)).pipe((0, _gulpGzip2.default)()).pipe(_gulp2.default.dest(dist));
            }

            return stream.pipe(_gulp2.default.dest(dist));
        }
    }]);

    return WebBuilder;
}();

exports.default = WebBuilder;
