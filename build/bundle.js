/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _config = __webpack_require__(1);
	
	var _config2 = _interopRequireDefault(_config);
	
	var _viewport = __webpack_require__(122);
	
	var _viewport2 = _interopRequireDefault(_viewport);
	
	var _compileShader = __webpack_require__(123);
	
	var _compileShader2 = _interopRequireDefault(_compileShader);
	
	var _getAttribLocation = __webpack_require__(124);
	
	var _getAttribLocation2 = _interopRequireDefault(_getAttribLocation);
	
	var _getUniformLocation = __webpack_require__(125);
	
	var _getUniformLocation2 = _interopRequireDefault(_getUniformLocation);
	
	var _vertexShader = __webpack_require__(126);
	
	var _vertexShader2 = _interopRequireDefault(_vertexShader);
	
	var _fractal = __webpack_require__(127);
	
	var _fractal2 = _interopRequireDefault(_fractal);
	
	var _hashSubscriber = __webpack_require__(128);
	
	var _hashSubscriber2 = _interopRequireDefault(_hashSubscriber);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/* utility */
	/* core */
	
	
	var canvas = document.getElementById("main");
	
	/* libraries */
	
	
	/* shaders */
	
	
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;
	
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	
	var context = canvas.getContext('webgl');
	
	_viewport2.default.create({
	  canvas: canvas,
	  getConfig: _config2.default.getConfig,
	  setConfig: _config2.default.setConfig
	});
	
	/* IGNORING 'ITERATIONS' FOR NOW */
	// HashSubscriber.subscribe(['iterations'], () => {
	//   Fractal.MAX_ITERATIONS = getConfig().iterations;
	//   renderer.render();
	// });
	
	var _Config$getConfig = _config2.default.getConfig();
	
	var brightness = _Config$getConfig.brightness;
	var x_min = _Config$getConfig.x_min;
	var x_max = _Config$getConfig.x_max;
	var y_min = _Config$getConfig.y_min;
	var y_max = _Config$getConfig.y_max;
	
	_hashSubscriber2.default.subscribe(['brightness', 'x_min', 'x_max', 'y_min', 'y_max'], function () {
	  var config = _config2.default.getConfig();
	
	  x_min = config.x_min;
	  x_max = config.x_max;
	  y_min = config.y_min;
	  y_max = config.y_max;
	
	  brightness = config.brightness;
	});
	
	/**
	 * Shaders
	 */
	
	var vertexShader = (0, _compileShader2.default)(_vertexShader2.default, context.VERTEX_SHADER, context);
	var fragmentShader = (0, _compileShader2.default)(_fractal2.default, context.FRAGMENT_SHADER, context);
	
	var program = context.createProgram();
	context.attachShader(program, vertexShader);
	context.attachShader(program, fragmentShader);
	context.linkProgram(program);
	context.useProgram(program);
	
	/**
	 * Geometry setup
	 */
	
	// Set up 4 vertices, which we'll draw as a rectangle
	// via 2 triangles
	//
	//   A---C
	//   |  /|
	//   | / |
	//   |/  |
	//   B---D
	//
	// We order them like so, so that when we draw with
	// context.TRIANGLE_STRIP, we draw triangle ABC and BCD.
	var vertexData = new Float32Array([-1.0, 1.0, // top left
	-1.0, -1.0, // bottom left
	1.0, 1.0, // top right
	1.0, -1.0 // bottom right
	]);
	var vertexDataBuffer = context.createBuffer();
	context.bindBuffer(context.ARRAY_BUFFER, vertexDataBuffer);
	context.bufferData(context.ARRAY_BUFFER, vertexData, context.STATIC_DRAW);
	
	/**
	 * Attribute setup
	 */
	
	// To make the geometry information available in the shader as attributes, we
	// need to tell WebGL what the layout of our data in the vertex buffer is.
	var positionHandle = (0, _getAttribLocation2.default)(program, 'position', context);
	context.enableVertexAttribArray(positionHandle);
	context.vertexAttribPointer(positionHandle, 2, // position is a vec2
	context.FLOAT, // each component is a float
	context.FALSE, // don't normalize values
	2 * 4, // two 4 byte float components per vertex
	0 // offset into each span of vertex data
	);
	
	/**
	 * Draw
	 */
	
	function drawFrame() {
	  var dataToSendToGPU = new Float32Array(9);
	
	  var time = Date.now();
	
	  dataToSendToGPU[0] = WIDTH;
	  dataToSendToGPU[1] = HEIGHT;
	  dataToSendToGPU[2] = -0.795 + Math.sin(time / 2000) / 40;
	  dataToSendToGPU[3] = 0.2321 + Math.cos(time / 1330) / 40;
	  dataToSendToGPU[4] = brightness;
	  dataToSendToGPU[5] = x_min;
	  dataToSendToGPU[6] = x_max;
	  dataToSendToGPU[7] = y_min;
	  dataToSendToGPU[8] = y_max;
	
	  var dataPointer = (0, _getUniformLocation2.default)(program, 'data', context);
	  context.uniform1fv(dataPointer, dataToSendToGPU);
	  context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
	
	  requestAnimationFrame(drawFrame);
	}
	
	requestAnimationFrame(drawFrame);
	
	// Render the 4 vertices specified above (starting at index 0)
	// in TRIANGLE_STRIP mode.

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _parseLocationHash = __webpack_require__(2);
	
	var _parseLocationHash2 = _interopRequireDefault(_parseLocationHash);
	
	var _setLocationHash = __webpack_require__(3);
	
	var _setLocationHash2 = _interopRequireDefault(_setLocationHash);
	
	var _assign = __webpack_require__(112);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var DEFAULT_CONFIG = {
	  x_min: -2.0,
	  x_max: 2.0,
	  y_min: -1.25,
	  y_max: 1.25,
	
	  brightness: 8.0
	};
	
	var Config = {
	  currentConfig: {},
	  getConfig: function getConfig() {
	    var locationHash = arguments.length <= 0 || arguments[0] === undefined ? (0, _parseLocationHash2.default)() : arguments[0];
	
	    Config.currentConfig = (0, _assign2.default)({}, DEFAULT_CONFIG, locationHash);
	
	    return Config.currentConfig;
	  },
	  setConfig: function setConfig(configChanges) {
	    var newConfig = (0, _assign2.default)({}, Config.getConfig(), configChanges);
	
	    (0, _setLocationHash2.default)(newConfig);
	  }
	};
	
	exports.default = Config;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.default = function () {
	  var query = arguments.length <= 0 || arguments[0] === undefined ? window.location.hash : arguments[0];
	
	  var keyValuePairs;
	  if (query.length > 0) {
	    keyValuePairs = query.slice(1).split('&');
	  } else {
	    keyValuePairs = [];
	  }
	
	  return keyValuePairs.reduce(function (hash, keyValuePair) {
	    var _keyValuePair$split = keyValuePair.split('=');
	
	    var _keyValuePair$split2 = _slicedToArray(_keyValuePair$split, 2);
	
	    var key = _keyValuePair$split2[0];
	    var value = _keyValuePair$split2[1];
	
	
	    if (value && isNaN(value)) {
	      hash[key] = value;
	    } else {
	      hash[key] = parseFloat(value);
	    }
	
	    return hash;
	  }, {});
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	exports.default = function (query) {
	  var keyValuePairs = (0, _map2.default)(query, function (value, key) {
	    return [key, value].join('=');
	  });
	
	  window.location.replace('#' + keyValuePairs.join('&'));
	};
	
	var _map = __webpack_require__(4);
	
	var _map2 = _interopRequireDefault(_map);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(5),
	    baseIteratee = __webpack_require__(6),
	    baseMap = __webpack_require__(106),
	    isArray = __webpack_require__(76);
	
	/**
	 * Creates an array of values by running each element in `collection` thru
	 * `iteratee`. The iteratee is invoked with three arguments:
	 * (value, index|key, collection).
	 *
	 * Many lodash methods are guarded to work as iteratees for methods like
	 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	 *
	 * The guarded methods are:
	 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
	 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
	 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
	 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Array|Function|Object|string} [iteratee=_.identity]
	 *  The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 * @example
	 *
	 * function square(n) {
	 *   return n * n;
	 * }
	 *
	 * _.map([4, 8], square);
	 * // => [16, 64]
	 *
	 * _.map({ 'a': 4, 'b': 8 }, square);
	 * // => [16, 64] (iteration order is not guaranteed)
	 *
	 * var users = [
	 *   { 'user': 'barney' },
	 *   { 'user': 'fred' }
	 * ];
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.map(users, 'user');
	 * // => ['barney', 'fred']
	 */
	function map(collection, iteratee) {
	  var func = isArray(collection) ? arrayMap : baseMap;
	  return func(collection, baseIteratee(iteratee, 3));
	}
	
	module.exports = map;


/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array ? array.length : 0,
	      result = Array(length);
	
	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}
	
	module.exports = arrayMap;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(7),
	    baseMatchesProperty = __webpack_require__(89),
	    identity = __webpack_require__(103),
	    isArray = __webpack_require__(76),
	    property = __webpack_require__(104);
	
	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity;
	  }
	  if (typeof value == 'object') {
	    return isArray(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}
	
	module.exports = baseIteratee;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(8),
	    getMatchData = __webpack_require__(86),
	    matchesStrictComparable = __webpack_require__(88);
	
	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}
	
	module.exports = baseMatches;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(9),
	    baseIsEqual = __webpack_require__(50);
	
	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;
	
	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;
	
	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];
	
	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}
	
	module.exports = baseIsMatch;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(10),
	    stackClear = __webpack_require__(18),
	    stackDelete = __webpack_require__(19),
	    stackGet = __webpack_require__(20),
	    stackHas = __webpack_require__(21),
	    stackSet = __webpack_require__(22);
	
	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  this.__data__ = new ListCache(entries);
	}
	
	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;
	
	module.exports = Stack;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var listCacheClear = __webpack_require__(11),
	    listCacheDelete = __webpack_require__(12),
	    listCacheGet = __webpack_require__(15),
	    listCacheHas = __webpack_require__(16),
	    listCacheSet = __webpack_require__(17);
	
	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	
	module.exports = ListCache;


/***/ },
/* 11 */
/***/ function(module, exports) {

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}
	
	module.exports = listCacheClear;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(13);
	
	/** Used for built-in method references. */
	var arrayProto = Array.prototype;
	
	/** Built-in value references. */
	var splice = arrayProto.splice;
	
	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  return true;
	}
	
	module.exports = listCacheDelete;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(14);
	
	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}
	
	module.exports = assocIndexOf;


/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 * var other = { 'user': 'fred' };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}
	
	module.exports = eq;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(13);
	
	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  return index < 0 ? undefined : data[index][1];
	}
	
	module.exports = listCacheGet;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(13);
	
	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}
	
	module.exports = listCacheHas;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(13);
	
	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}
	
	module.exports = listCacheSet;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(10);
	
	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	}
	
	module.exports = stackClear;


/***/ },
/* 19 */
/***/ function(module, exports) {

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  return this.__data__['delete'](key);
	}
	
	module.exports = stackDelete;


/***/ },
/* 20 */
/***/ function(module, exports) {

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}
	
	module.exports = stackGet;


/***/ },
/* 21 */
/***/ function(module, exports) {

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}
	
	module.exports = stackHas;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(10),
	    MapCache = __webpack_require__(23);
	
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	
	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var cache = this.__data__;
	  if (cache instanceof ListCache && cache.__data__.length == LARGE_ARRAY_SIZE) {
	    cache = this.__data__ = new MapCache(cache.__data__);
	  }
	  cache.set(key, value);
	  return this;
	}
	
	module.exports = stackSet;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var mapCacheClear = __webpack_require__(24),
	    mapCacheDelete = __webpack_require__(44),
	    mapCacheGet = __webpack_require__(47),
	    mapCacheHas = __webpack_require__(48),
	    mapCacheSet = __webpack_require__(49);
	
	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	
	module.exports = MapCache;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var Hash = __webpack_require__(25),
	    ListCache = __webpack_require__(10),
	    Map = __webpack_require__(43);
	
	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}
	
	module.exports = mapCacheClear;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var hashClear = __webpack_require__(26),
	    hashDelete = __webpack_require__(39),
	    hashGet = __webpack_require__(40),
	    hashHas = __webpack_require__(41),
	    hashSet = __webpack_require__(42);
	
	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	
	module.exports = Hash;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(27);
	
	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}
	
	module.exports = hashClear;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(28);
	
	/* Built-in method references that are verified to be native. */
	var nativeCreate = getNative(Object, 'create');
	
	module.exports = nativeCreate;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsNative = __webpack_require__(29),
	    getValue = __webpack_require__(38);
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}
	
	module.exports = getNative;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(30),
	    isHostObject = __webpack_require__(32),
	    isMasked = __webpack_require__(33),
	    isObject = __webpack_require__(31),
	    toSource = __webpack_require__(37);
	
	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}
	
	module.exports = baseIsNative;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(31);
	
	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array and weak map constructors,
	  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}
	
	module.exports = isFunction;


/***/ },
/* 31 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	module.exports = isObject;


/***/ },
/* 32 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}
	
	module.exports = isHostObject;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var coreJsData = __webpack_require__(34);
	
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());
	
	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}
	
	module.exports = isMasked;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(35);
	
	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];
	
	module.exports = coreJsData;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var checkGlobal = __webpack_require__(36);
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = checkGlobal(typeof global == 'object' && global);
	
	/** Detect free variable `self`. */
	var freeSelf = checkGlobal(typeof self == 'object' && self);
	
	/** Detect `this` as the global object. */
	var thisGlobal = checkGlobal(typeof this == 'object' && this);
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || thisGlobal || Function('return this')();
	
	module.exports = root;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 36 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a global object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
	 */
	function checkGlobal(value) {
	  return (value && value.Object === Object) ? value : null;
	}
	
	module.exports = checkGlobal;


/***/ },
/* 37 */
/***/ function(module, exports) {

	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;
	
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}
	
	module.exports = toSource;


/***/ },
/* 38 */
/***/ function(module, exports) {

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}
	
	module.exports = getValue;


/***/ },
/* 39 */
/***/ function(module, exports) {

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  return this.has(key) && delete this.__data__[key];
	}
	
	module.exports = hashDelete;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(27);
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}
	
	module.exports = hashGet;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(27);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}
	
	module.exports = hashHas;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(27);
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}
	
	module.exports = hashSet;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(28),
	    root = __webpack_require__(35);
	
	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map');
	
	module.exports = Map;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(45);
	
	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  return getMapData(this, key)['delete'](key);
	}
	
	module.exports = mapCacheDelete;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var isKeyable = __webpack_require__(46);
	
	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}
	
	module.exports = getMapData;


/***/ },
/* 46 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}
	
	module.exports = isKeyable;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(45);
	
	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}
	
	module.exports = mapCacheGet;


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(45);
	
	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}
	
	module.exports = mapCacheHas;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(45);
	
	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  getMapData(this, key).set(key, value);
	  return this;
	}
	
	module.exports = mapCacheSet;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(51),
	    isObject = __webpack_require__(31),
	    isObjectLike = __webpack_require__(75);
	
	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {boolean} [bitmask] The bitmask of comparison flags.
	 *  The bitmask may be composed of the following flags:
	 *     1 - Unordered comparison
	 *     2 - Partial comparison
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, customizer, bitmask, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
	}
	
	module.exports = baseIsEqual;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(9),
	    equalArrays = __webpack_require__(52),
	    equalByTag = __webpack_require__(57),
	    equalObjects = __webpack_require__(62),
	    getTag = __webpack_require__(80),
	    isArray = __webpack_require__(76),
	    isHostObject = __webpack_require__(32),
	    isTypedArray = __webpack_require__(85);
	
	/** Used to compose bitmasks for comparison styles. */
	var PARTIAL_COMPARE_FLAG = 2;
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = arrayTag,
	      othTag = arrayTag;
	
	  if (!objIsArr) {
	    objTag = getTag(object);
	    objTag = objTag == argsTag ? objectTag : objTag;
	  }
	  if (!othIsArr) {
	    othTag = getTag(other);
	    othTag = othTag == argsTag ? objectTag : othTag;
	  }
	  var objIsObj = objTag == objectTag && !isHostObject(object),
	      othIsObj = othTag == objectTag && !isHostObject(other),
	      isSameTag = objTag == othTag;
	
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
	      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
	  }
	  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
	
	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;
	
	      stack || (stack = new Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
	}
	
	module.exports = baseIsEqualDeep;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(53),
	    arraySome = __webpack_require__(56);
	
	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      arrLength = array.length,
	      othLength = other.length;
	
	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;
	
	  stack.set(array, other);
	
	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];
	
	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!seen.has(othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
	              return seen.add(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, customizer, bitmask, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  return result;
	}
	
	module.exports = equalArrays;


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(23),
	    setCacheAdd = __webpack_require__(54),
	    setCacheHas = __webpack_require__(55);
	
	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	      length = values ? values.length : 0;
	
	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}
	
	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;
	
	module.exports = SetCache;


/***/ },
/* 54 */
/***/ function(module, exports) {

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}
	
	module.exports = setCacheAdd;


/***/ },
/* 55 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}
	
	module.exports = setCacheHas;


/***/ },
/* 56 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array ? array.length : 0;
	
	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	module.exports = arraySome;


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(58),
	    Uint8Array = __webpack_require__(59),
	    equalArrays = __webpack_require__(52),
	    mapToArray = __webpack_require__(60),
	    setToArray = __webpack_require__(61);
	
	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;
	
	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]';
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
	  switch (tag) {
	    case dataViewTag:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;
	
	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;
	
	    case boolTag:
	    case dateTag:
	      // Coerce dates and booleans to numbers, dates to milliseconds and
	      // booleans to `1` or `0` treating invalid dates coerced to `NaN` as
	      // not equal.
	      return +object == +other;
	
	    case errorTag:
	      return object.name == other.name && object.message == other.message;
	
	    case numberTag:
	      // Treat `NaN` vs. `NaN` as equal.
	      return (object != +object) ? other != +other : object == +other;
	
	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');
	
	    case mapTag:
	      var convert = mapToArray;
	
	    case setTag:
	      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
	      convert || (convert = setToArray);
	
	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= UNORDERED_COMPARE_FLAG;
	      stack.set(object, other);
	
	      // Recursively compare objects (susceptible to call stack limits).
	      return equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
	
	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}
	
	module.exports = equalByTag;


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(35);
	
	/** Built-in value references. */
	var Symbol = root.Symbol;
	
	module.exports = Symbol;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(35);
	
	/** Built-in value references. */
	var Uint8Array = root.Uint8Array;
	
	module.exports = Uint8Array;


/***/ },
/* 60 */
/***/ function(module, exports) {

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);
	
	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}
	
	module.exports = mapToArray;


/***/ },
/* 61 */
/***/ function(module, exports) {

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);
	
	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}
	
	module.exports = setToArray;


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var baseHas = __webpack_require__(63),
	    keys = __webpack_require__(65);
	
	/** Used to compose bitmasks for comparison styles. */
	var PARTIAL_COMPARE_FLAG = 2;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
	 *  for more details.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
	  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
	      objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;
	
	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : baseHas(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);
	
	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];
	
	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;
	
	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  return result;
	}
	
	module.exports = equalObjects;


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var getPrototype = __webpack_require__(64);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * The base implementation of `_.has` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHas(object, key) {
	  // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
	  // that are composed entirely of index properties, return `false` for
	  // `hasOwnProperty` checks of them.
	  return object != null &&
	    (hasOwnProperty.call(object, key) ||
	      (typeof object == 'object' && key in object && getPrototype(object) === null));
	}
	
	module.exports = baseHas;


/***/ },
/* 64 */
/***/ function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetPrototype = Object.getPrototypeOf;
	
	/**
	 * Gets the `[[Prototype]]` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {null|Object} Returns the `[[Prototype]]`.
	 */
	function getPrototype(value) {
	  return nativeGetPrototype(Object(value));
	}
	
	module.exports = getPrototype;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var baseHas = __webpack_require__(63),
	    baseKeys = __webpack_require__(66),
	    indexKeys = __webpack_require__(67),
	    isArrayLike = __webpack_require__(71),
	    isIndex = __webpack_require__(78),
	    isPrototype = __webpack_require__(79);
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  var isProto = isPrototype(object);
	  if (!(isProto || isArrayLike(object))) {
	    return baseKeys(object);
	  }
	  var indexes = indexKeys(object),
	      skipIndexes = !!indexes,
	      result = indexes || [],
	      length = result.length;
	
	  for (var key in object) {
	    if (baseHas(object, key) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
	        !(isProto && key == 'constructor')) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = keys;


/***/ },
/* 66 */
/***/ function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = Object.keys;
	
	/**
	 * The base implementation of `_.keys` which doesn't skip the constructor
	 * property of prototypes or treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  return nativeKeys(Object(object));
	}
	
	module.exports = baseKeys;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var baseTimes = __webpack_require__(68),
	    isArguments = __webpack_require__(69),
	    isArray = __webpack_require__(76),
	    isLength = __webpack_require__(74),
	    isString = __webpack_require__(77);
	
	/**
	 * Creates an array of index keys for `object` values of arrays,
	 * `arguments` objects, and strings, otherwise `null` is returned.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array|null} Returns index keys, else `null`.
	 */
	function indexKeys(object) {
	  var length = object ? object.length : undefined;
	  if (isLength(length) &&
	      (isArray(object) || isString(object) || isArguments(object))) {
	    return baseTimes(length, String);
	  }
	  return null;
	}
	
	module.exports = indexKeys;


/***/ },
/* 68 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);
	
	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}
	
	module.exports = baseTimes;


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLikeObject = __webpack_require__(70);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}
	
	module.exports = isArguments;


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(71),
	    isObjectLike = __webpack_require__(75);
	
	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}
	
	module.exports = isArrayLikeObject;


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(72),
	    isFunction = __webpack_require__(30),
	    isLength = __webpack_require__(74);
	
	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value)) && !isFunction(value);
	}
	
	module.exports = isArrayLike;


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(73);
	
	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a
	 * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
	 * Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');
	
	module.exports = getLength;


/***/ },
/* 73 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	module.exports = baseProperty;


/***/ },
/* 74 */
/***/ function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length,
	 *  else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	module.exports = isLength;


/***/ },
/* 75 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	module.exports = isObjectLike;


/***/ },
/* 76 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @type {Function}
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;
	
	module.exports = isArray;


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(76),
	    isObjectLike = __webpack_require__(75);
	
	/** `Object#toString` result references. */
	var stringTag = '[object String]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' ||
	    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
	}
	
	module.exports = isString;


/***/ },
/* 78 */
/***/ function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}
	
	module.exports = isIndex;


/***/ },
/* 79 */
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;
	
	  return value === proto;
	}
	
	module.exports = isPrototype;


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	var DataView = __webpack_require__(81),
	    Map = __webpack_require__(43),
	    Promise = __webpack_require__(82),
	    Set = __webpack_require__(83),
	    WeakMap = __webpack_require__(84),
	    toSource = __webpack_require__(37);
	
	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';
	
	var dataViewTag = '[object DataView]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);
	
	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function getTag(value) {
	  return objectToString.call(value);
	}
	
	// Fallback for data views, maps, sets, and weak maps in IE 11,
	// for data views in Edge, and promises in Node.js.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = objectToString.call(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : undefined;
	
	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}
	
	module.exports = getTag;


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(28),
	    root = __webpack_require__(35);
	
	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');
	
	module.exports = DataView;


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(28),
	    root = __webpack_require__(35);
	
	/* Built-in method references that are verified to be native. */
	var Promise = getNative(root, 'Promise');
	
	module.exports = Promise;


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(28),
	    root = __webpack_require__(35);
	
	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');
	
	module.exports = Set;


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(28),
	    root = __webpack_require__(35);
	
	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');
	
	module.exports = WeakMap;


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(74),
	    isObjectLike = __webpack_require__(75);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag] = false;
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	function isTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
	}
	
	module.exports = isTypedArray;


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(87),
	    keys = __webpack_require__(65);
	
	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = keys(object),
	      length = result.length;
	
	  while (length--) {
	    var key = result[length],
	        value = object[key];
	
	    result[length] = [key, value, isStrictComparable(value)];
	  }
	  return result;
	}
	
	module.exports = getMatchData;


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(31);
	
	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}
	
	module.exports = isStrictComparable;


/***/ },
/* 88 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function matchesStrictComparable(key, srcValue) {
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}
	
	module.exports = matchesStrictComparable;


/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(50),
	    get = __webpack_require__(90),
	    hasIn = __webpack_require__(100),
	    isKey = __webpack_require__(98),
	    isStrictComparable = __webpack_require__(87),
	    matchesStrictComparable = __webpack_require__(88),
	    toKey = __webpack_require__(99);
	
	/** Used to compose bitmasks for comparison styles. */
	var UNORDERED_COMPARE_FLAG = 1,
	    PARTIAL_COMPARE_FLAG = 2;
	
	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  if (isKey(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
	  };
	}
	
	module.exports = baseMatchesProperty;


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(91);
	
	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is used in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}
	
	module.exports = get;


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(92),
	    isKey = __webpack_require__(98),
	    toKey = __webpack_require__(99);
	
	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = isKey(path, object) ? [path] : castPath(path);
	
	  var index = 0,
	      length = path.length;
	
	  while (object != null && index < length) {
	    object = object[toKey(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}
	
	module.exports = baseGet;


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(76),
	    stringToPath = __webpack_require__(93);
	
	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value) {
	  return isArray(value) ? value : stringToPath(value);
	}
	
	module.exports = castPath;


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var memoize = __webpack_require__(94),
	    toString = __webpack_require__(95);
	
	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g;
	
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	
	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = memoize(function(string) {
	  var result = [];
	  toString(string).replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});
	
	module.exports = stringToPath;


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(23);
	
	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize(func, resolver) {
	  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;
	
	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result);
	    return result;
	  };
	  memoized.cache = new (memoize.Cache || MapCache);
	  return memoized;
	}
	
	// Assign cache to `_.memoize`.
	memoize.Cache = MapCache;
	
	module.exports = memoize;


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(96);
	
	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}
	
	module.exports = toString;


/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(58),
	    isSymbol = __webpack_require__(97);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;
	
	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	module.exports = baseToString;


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	var isObjectLike = __webpack_require__(75);
	
	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified,
	 *  else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}
	
	module.exports = isSymbol;


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(76),
	    isSymbol = __webpack_require__(97);
	
	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;
	
	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (isArray(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}
	
	module.exports = isKey;


/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(97);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey(value) {
	  if (typeof value == 'string' || isSymbol(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	module.exports = toKey;


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var baseHasIn = __webpack_require__(101),
	    hasPath = __webpack_require__(102);
	
	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn(object, path) {
	  return object != null && hasPath(object, path, baseHasIn);
	}
	
	module.exports = hasIn;


/***/ },
/* 101 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return object != null && key in Object(object);
	}
	
	module.exports = baseHasIn;


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(92),
	    isArguments = __webpack_require__(69),
	    isArray = __webpack_require__(76),
	    isIndex = __webpack_require__(78),
	    isKey = __webpack_require__(98),
	    isLength = __webpack_require__(74),
	    isString = __webpack_require__(77),
	    toKey = __webpack_require__(99);
	
	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath(object, path, hasFunc) {
	  path = isKey(path, object) ? [path] : castPath(path);
	
	  var result,
	      index = -1,
	      length = path.length;
	
	  while (++index < length) {
	    var key = toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result) {
	    return result;
	  }
	  var length = object ? object.length : 0;
	  return !!length && isLength(length) && isIndex(key, length) &&
	    (isArray(object) || isString(object) || isArguments(object));
	}
	
	module.exports = hasPath;


/***/ },
/* 103 */
/***/ function(module, exports) {

	/**
	 * This method returns the first argument given to it.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}
	
	module.exports = identity;


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(73),
	    basePropertyDeep = __webpack_require__(105),
	    isKey = __webpack_require__(98),
	    toKey = __webpack_require__(99);
	
	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	}
	
	module.exports = property;


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(91);
	
	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function(object) {
	    return baseGet(object, path);
	  };
	}
	
	module.exports = basePropertyDeep;


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(107),
	    isArrayLike = __webpack_require__(71);
	
	/**
	 * The base implementation of `_.map` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function baseMap(collection, iteratee) {
	  var index = -1,
	      result = isArrayLike(collection) ? Array(collection.length) : [];
	
	  baseEach(collection, function(value, key, collection) {
	    result[++index] = iteratee(value, key, collection);
	  });
	  return result;
	}
	
	module.exports = baseMap;


/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(108),
	    createBaseEach = __webpack_require__(111);
	
	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);
	
	module.exports = baseEach;


/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(109),
	    keys = __webpack_require__(65);
	
	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys);
	}
	
	module.exports = baseForOwn;


/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(110);
	
	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();
	
	module.exports = baseFor;


/***/ },
/* 110 */
/***/ function(module, exports) {

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;
	
	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}
	
	module.exports = createBaseFor;


/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(71);
	
	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    if (collection == null) {
	      return collection;
	    }
	    if (!isArrayLike(collection)) {
	      return eachFunc(collection, iteratee);
	    }
	    var length = collection.length,
	        index = fromRight ? length : -1,
	        iterable = Object(collection);
	
	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}
	
	module.exports = createBaseEach;


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	var assignValue = __webpack_require__(113),
	    copyObject = __webpack_require__(114),
	    createAssigner = __webpack_require__(115),
	    isArrayLike = __webpack_require__(71),
	    isPrototype = __webpack_require__(79),
	    keys = __webpack_require__(65);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/** Detect if properties shadowing those on `Object.prototype` are non-enumerable. */
	var nonEnumShadows = !propertyIsEnumerable.call({ 'valueOf': 1 }, 'valueOf');
	
	/**
	 * Assigns own enumerable string keyed properties of source objects to the
	 * destination object. Source objects are applied from left to right.
	 * Subsequent sources overwrite property assignments of previous sources.
	 *
	 * **Note:** This method mutates `object` and is loosely based on
	 * [`Object.assign`](https://mdn.io/Object/assign).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.10.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @see _.assignIn
	 * @example
	 *
	 * function Foo() {
	 *   this.c = 3;
	 * }
	 *
	 * function Bar() {
	 *   this.e = 5;
	 * }
	 *
	 * Foo.prototype.d = 4;
	 * Bar.prototype.f = 6;
	 *
	 * _.assign({ 'a': 1 }, new Foo, new Bar);
	 * // => { 'a': 1, 'c': 3, 'e': 5 }
	 */
	var assign = createAssigner(function(object, source) {
	  if (nonEnumShadows || isPrototype(source) || isArrayLike(source)) {
	    copyObject(source, keys(source), object);
	    return;
	  }
	  for (var key in source) {
	    if (hasOwnProperty.call(source, key)) {
	      assignValue(object, key, source[key]);
	    }
	  }
	});
	
	module.exports = assign;


/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(14);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignValue(object, key, value) {
	  var objValue = object[key];
	  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
	      (value === undefined && !(key in object))) {
	    object[key] = value;
	  }
	}
	
	module.exports = assignValue;


/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	var assignValue = __webpack_require__(113);
	
	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property identifiers to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @param {Function} [customizer] The function to customize copied values.
	 * @returns {Object} Returns `object`.
	 */
	function copyObject(source, props, object, customizer) {
	  object || (object = {});
	
	  var index = -1,
	      length = props.length;
	
	  while (++index < length) {
	    var key = props[index];
	
	    var newValue = customizer
	      ? customizer(object[key], source[key], key, object, source)
	      : source[key];
	
	    assignValue(object, key, newValue);
	  }
	  return object;
	}
	
	module.exports = copyObject;


/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	var isIterateeCall = __webpack_require__(116),
	    rest = __webpack_require__(117);
	
	/**
	 * Creates a function like `_.assign`.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */
	function createAssigner(assigner) {
	  return rest(function(object, sources) {
	    var index = -1,
	        length = sources.length,
	        customizer = length > 1 ? sources[length - 1] : undefined,
	        guard = length > 2 ? sources[2] : undefined;
	
	    customizer = (assigner.length > 3 && typeof customizer == 'function')
	      ? (length--, customizer)
	      : undefined;
	
	    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	      customizer = length < 3 ? undefined : customizer;
	      length = 1;
	    }
	    object = Object(object);
	    while (++index < length) {
	      var source = sources[index];
	      if (source) {
	        assigner(object, source, index, customizer);
	      }
	    }
	    return object;
	  });
	}
	
	module.exports = createAssigner;


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(14),
	    isArrayLike = __webpack_require__(71),
	    isIndex = __webpack_require__(78),
	    isObject = __webpack_require__(31);
	
	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	        ? (isArrayLike(object) && isIndex(index, object.length))
	        : (type == 'string' && index in object)
	      ) {
	    return eq(object[index], value);
	  }
	  return false;
	}
	
	module.exports = isIterateeCall;


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	var apply = __webpack_require__(118),
	    toInteger = __webpack_require__(119);
	
	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as
	 * an array.
	 *
	 * **Note:** This method is based on the
	 * [rest parameter](https://mdn.io/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.rest(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function rest(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? (func.length - 1) : toInteger(start), 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);
	
	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    switch (start) {
	      case 0: return func.call(this, array);
	      case 1: return func.call(this, args[0], array);
	      case 2: return func.call(this, args[0], args[1], array);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = array;
	    return apply(func, this, otherArgs);
	  };
	}
	
	module.exports = rest;


/***/ },
/* 118 */
/***/ function(module, exports) {

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */
	function apply(func, thisArg, args) {
	  var length = args.length;
	  switch (length) {
	    case 0: return func.call(thisArg);
	    case 1: return func.call(thisArg, args[0]);
	    case 2: return func.call(thisArg, args[0], args[1]);
	    case 3: return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}
	
	module.exports = apply;


/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	var toFinite = __webpack_require__(120);
	
	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger(value) {
	  var result = toFinite(value),
	      remainder = result % 1;
	
	  return result === result ? (remainder ? result - remainder : result) : 0;
	}
	
	module.exports = toInteger;


/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	var toNumber = __webpack_require__(121);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_INTEGER = 1.7976931348623157e+308;
	
	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}
	
	module.exports = toFinite;


/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(30),
	    isObject = __webpack_require__(31),
	    isSymbol = __webpack_require__(97);
	
	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;
	
	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;
	
	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
	
	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;
	
	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;
	
	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;
	
	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = isFunction(value.valueOf) ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}
	
	module.exports = toNumber;


/***/ },
/* 122 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var ZOOM_SIZE = 0.5;
	
	var VIEWPORT_PROTOTYPE = {
	  update: function update() {
	    var currentConfig = this.getConfig();
	
	    this.setBounds({
	      x: { min: currentConfig.x_min, max: currentConfig.x_max },
	      y: { min: currentConfig.y_min, max: currentConfig.y_max }
	    });
	
	    this.growToAspectRatio();
	  },
	  init: function init(_ref) {
	    var canvas = _ref.canvas;
	    var getConfig = _ref.getConfig;
	    var setConfig = _ref.setConfig;
	
	    this.getConfig = getConfig;
	    this.setConfig = setConfig;
	    this.bindToCanvas(canvas);
	
	    this.update();
	  },
	  xBounds: { min: 0, max: 0 },
	  yBounds: { min: 0, max: 0 },
	  setBounds: function setBounds(bounds) {
	    this.xBounds = bounds.x;
	    this.yBounds = bounds.y;
	  },
	  locationHash: function locationHash() {
	    return {
	      x_min: this.xBounds.min,
	      x_max: this.xBounds.max,
	      y_min: this.yBounds.min,
	      y_max: this.yBounds.max
	    };
	  },
	  center: function center() {
	    return {
	      x: (this.xBounds.max + this.xBounds.min) / 2,
	      y: (this.yBounds.max + this.yBounds.min) / 2
	    };
	  },
	  range: function range() {
	    return {
	      x: this.xBounds.max - this.xBounds.min,
	      y: this.yBounds.max - this.yBounds.min
	    };
	  },
	  delta: function delta() {
	    return {
	      x: this.range().x / this.width,
	      y: this.range().y / this.height
	    };
	  },
	  topLeft: function topLeft() {
	    return {
	      x: this.xBounds.min,
	      y: this.yBounds.min
	    };
	  },
	  canvasSize: function canvasSize() {
	    return {
	      x: this.canvas.offsetWidth,
	      y: this.canvas.offsetHeight
	    };
	  },
	  canvasClickLocation: function canvasClickLocation(event) {
	    var currentCanvasSize = this.canvasSize();
	
	    return {
	      x: event.offsetX / currentCanvasSize.x * this.width,
	      y: event.offsetY / currentCanvasSize.y * this.height
	    };
	  },
	  cartesianClickLocation: function cartesianClickLocation(canvasClickLocation) {
	    var range = this.range();
	    var topLeft = this.topLeft();
	
	    return {
	      x: topLeft.x + range.x * canvasClickLocation.x / this.width,
	      y: topLeft.y + range.y * canvasClickLocation.y / this.height
	    };
	  },
	  zoomToLocation: function zoomToLocation(location) {
	    var range = this.range();
	
	    this.setBounds({
	      x: {
	        min: location.x - range.x * ZOOM_SIZE * 0.5,
	        max: location.x + range.x * ZOOM_SIZE * 0.5
	      },
	      y: {
	        min: location.y - range.y * ZOOM_SIZE * 0.5,
	        max: location.y + range.y * ZOOM_SIZE * 0.5
	      }
	    });
	
	    this.setConfig(this.locationHash());
	  },
	  bindToCanvas: function bindToCanvas(canvas) {
	    var _this = this;
	
	    this.canvas = canvas;
	    this.canvas.width = this.canvas.offsetWidth;
	    this.canvas.height = this.canvas.offsetHeight;
	
	    this.width = this.canvas.width;
	    this.height = this.canvas.height;
	
	    this.canvas.addEventListener('click', function (event) {
	      var canvasClickLocation = _this.canvasClickLocation(event);
	      var cartesianClickLocation = _this.cartesianClickLocation(canvasClickLocation);
	
	      _this.zoomToLocation(cartesianClickLocation);
	    });
	  },
	  growToAspectRatio: function growToAspectRatio() {
	    var canvasAspectRatio = this.canvas.width / this.canvas.height;
	
	    var range = this.range();
	    var center = this.center();
	    var currentAspectRatio = range.x / range.y;
	
	    var newDistanceFromCenter;
	    var xBounds = this.xBounds;
	    var yBounds = this.yBounds;
	    if (currentAspectRatio > canvasAspectRatio) {
	      /* height needs expansion */
	      var verticalEdgeToCenterDistance = yBounds.min - center.y;
	
	      newDistanceFromCenter = verticalEdgeToCenterDistance * (currentAspectRatio / canvasAspectRatio);
	      yBounds = {
	        min: center.y + newDistanceFromCenter,
	        max: center.y - newDistanceFromCenter
	      };
	    } else {
	      /* width needs expansion */
	      var horizontalEdgeToCenterDistance = xBounds.min - center.x;
	
	      newDistanceFromCenter = horizontalEdgeToCenterDistance * (canvasAspectRatio / currentAspectRatio);
	      xBounds = {
	        min: center.x + newDistanceFromCenter,
	        max: center.x - newDistanceFromCenter
	      };
	    }
	
	    this.setBounds({
	      x: xBounds,
	      y: yBounds
	    });
	  }
	};
	
	exports.default = {
	  create: function create(_ref2) {
	    var canvas = _ref2.canvas;
	    var getConfig = _ref2.getConfig;
	    var setConfig = _ref2.setConfig;
	
	    var viewport = Object.create(VIEWPORT_PROTOTYPE);
	
	    viewport.init({ canvas: canvas, getConfig: getConfig, setConfig: setConfig });
	
	    return viewport;
	  }
	};

/***/ },
/* 123 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	exports.default = function (shaderSource, shaderType, context) {
	  var shader = context.createShader(shaderType);
	
	  context.shaderSource(shader, shaderSource);
	  context.compileShader(shader);
	
	  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
	    throw "Shader compile failed with: " + context.getShaderInfoLog(shader);
	  }
	
	  return shader;
	};

/***/ },
/* 124 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	exports.default = function (program, name, context) {
	  var attributeLocation = context.getAttribLocation(program, name);
	
	  if (attributeLocation === -1) {
	    throw 'Can not find attribute ' + name + '.';
	  }
	
	  return attributeLocation;
	};

/***/ },
/* 125 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	exports.default = function (program, name, context) {
	  var uniformLocation = context.getUniformLocation(program, name);
	
	  if (uniformLocation === -1) {
	    throw 'Can not find uniform ' + name + '.';
	  }
	
	  return uniformLocation;
	};

/***/ },
/* 126 */
/***/ function(module, exports) {

	module.exports = "attribute vec2 position;\n\nvoid main() {\n  // position specifies only x and y.\n  // We set z to be 0.0, and w to be 1.0\n  gl_Position = vec4(position, 0.0, 1.0);\n}\n"

/***/ },
/* 127 */
/***/ function(module, exports) {

	module.exports = "precision highp float;\n\n// WIDTH, HEIGHT, C_REAL, C_IMAGINARY, X_MIN, X_MAX, Y_MIN, Y_MAX\nuniform float data[9];\n\nfloat WIDTH      = data[0];\nfloat HEIGHT     = data[1];\n\nfloat C_REAL     = data[2];\nfloat C_IMAG     = data[3];\n\nfloat BRIGHTNESS = data[4];\n\nfloat X_MIN      = data[5];\nfloat X_MAX      = data[6];\nfloat Y_MIN      = data[7];\nfloat Y_MAX      = data[8];\n\nconst int MAX_ITERATIONS = 1024;\n\nvec2 iResolution = vec2(WIDTH, HEIGHT);\n\nstruct complex {\n  float real;\n  float imaginary;\n};\n\nint fractal(complex c, complex z) {\n  for (int iteration = 0; iteration < MAX_ITERATIONS; iteration++) {\n\n    // z <- z^2 + c\n    float real = z.real * z.real - z.imaginary * z.imaginary + c.real;\n    float imaginary = 2.0 * z.real * z.imaginary + c.imaginary;\n\n    z.real = real;\n    z.imaginary = imaginary;\n\n    if (z.real * z.real + z.imaginary * z.imaginary > 4.0) {\n      return iteration;\n    }\n  }\n\n  return 0;\n}\n\nint mandelbrot(vec2 coordinate) {\n  complex c = complex(coordinate.x, coordinate.y);\n  complex z = complex(0.0, 0.0);\n\n  return fractal(c, z);\n}\n\nint julia(vec2 coordinate, vec2 offset) {\n  complex c = complex(offset.x, offset.y);\n  complex z = complex(coordinate.x, coordinate.y);\n\n  return fractal(c, z);\n}\n\nvec2 fragCoordToXY(vec4 fragCoord) {\n  vec2 relativePosition = fragCoord.xy / iResolution.xy;\n  float aspectRatio = iResolution.x / HEIGHT;\n\n  vec2 center = vec2((X_MAX + X_MIN) / 2.0, (Y_MAX + Y_MIN) / 2.0);\n\n  vec2 cartesianPosition = (relativePosition - 0.5) * (X_MAX - X_MIN);\n  cartesianPosition.x += center.x;\n  cartesianPosition.y -= center.y;\n  cartesianPosition.x *= aspectRatio;\n\n  return cartesianPosition;\n}\n\nvoid main() {\n  vec2 coordinate = fragCoordToXY(gl_FragCoord);\n\n  // int fractalValue = mandelbrot(coordinate);\n  int fractalValue = julia(coordinate, vec2(C_REAL, C_IMAG));\n\n  float color = BRIGHTNESS * float(fractalValue) / float(MAX_ITERATIONS);\n\n  gl_FragColor = vec4(color, color, color, 1.0);\n}\n"

/***/ },
/* 128 */
/***/ function(module, exports) {

	module.exports =
	/******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};
	/******/
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	/******/
	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;
	/******/
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};
	/******/
	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	/******/
	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;
	/******/
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	/******/
	/******/
	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;
	/******/
	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;
	/******/
	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";
	/******/
	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		
		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
		
		var _javascriptGetHashParams = __webpack_require__(1);
		
		var _javascriptGetHashParams2 = _interopRequireDefault(_javascriptGetHashParams);
		
		var _javascriptHashChangeHandler = __webpack_require__(2);
		
		var _javascriptHashChangeHandler2 = _interopRequireDefault(_javascriptHashChangeHandler);
		
		var _javascriptKeysWithChangedValues = __webpack_require__(27);
		
		var _javascriptKeysWithChangedValues2 = _interopRequireDefault(_javascriptKeysWithChangedValues);
		
		var _javascriptSubscribe = __webpack_require__(60);
		
		var _javascriptSubscribe2 = _interopRequireDefault(_javascriptSubscribe);
		
		var _javascriptSubscription = __webpack_require__(61);
		
		var _javascriptSubscription2 = _interopRequireDefault(_javascriptSubscription);
		
		var _javascriptSubscriptionsByProperty = __webpack_require__(63);
		
		var _javascriptSubscriptionsByProperty2 = _interopRequireDefault(_javascriptSubscriptionsByProperty);
		
		var _javascriptSubscriptionsByUUID = __webpack_require__(64);
		
		var _javascriptSubscriptionsByUUID2 = _interopRequireDefault(_javascriptSubscriptionsByUUID);
		
		var _javascriptUnsubscribe = __webpack_require__(65);
		
		var _javascriptUnsubscribe2 = _interopRequireDefault(_javascriptUnsubscribe);
		
		var subscriptionsByProperty = (0, _javascriptSubscriptionsByProperty2['default'])();
		
		/* probably should migrate this to a factory at some point to avoid possible singleton issues */
		exports['default'] = {
		  ensureInitialization: function ensureInitialization() {
		    if (!this.initialized) {
		      this.init();
		      this.initialized = true;
		    }
		  },
		  init: function init() {
		    return window.addEventListener('hashchange', function (event) {
		      (0, _javascriptHashChangeHandler2['default'])({
		        event: event,
		        getHashParams: _javascriptGetHashParams2['default'],
		        keysWithChangedValues: _javascriptKeysWithChangedValues2['default'],
		        subscriptionsByProperty: subscriptionsByProperty,
		        subscriptionsByUUID: _javascriptSubscriptionsByUUID2['default']
		      });
		    });
		  },
		  subscribe: function subscribe(properties, callback) {
		    this.ensureInitialization();
		
		    return (0, _javascriptSubscribe2['default'])({
		      Subscription: _javascriptSubscription2['default'],
		      subscriptionsByUUID: _javascriptSubscriptionsByUUID2['default'],
		      subscriptionsByProperty: subscriptionsByProperty,
		      properties: properties,
		      callback: callback
		    });
		  },
		  unsubscribe: function unsubscribe(subscriptionUUID) {
		    (0, _javascriptUnsubscribe2['default'])({
		      subscriptionUUID: subscriptionUUID,
		      subscriptionsByUUID: _javascriptSubscriptionsByUUID2['default'],
		      subscriptionsByProperty: subscriptionsByProperty
		    });
		  }
		};
		module.exports = exports['default'];
	
	/***/ },
	/* 1 */
	/***/ function(module, exports) {
	
		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		
		var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();
		
		exports['default'] = function (url) {
		  var _url$split = url.split('#');
		
		  var _url$split2 = _slicedToArray(_url$split, 2);
		
		  var _ = _url$split2[0];
		  var urlHash = _url$split2[1];
		
		  urlHash = urlHash || '';
		  return urlHash.split('&').reduce(function (hash, keyValuePair) {
		    var _keyValuePair$split = keyValuePair.split('=');
		
		    var _keyValuePair$split2 = _slicedToArray(_keyValuePair$split, 2);
		
		    var key = _keyValuePair$split2[0];
		    var value = _keyValuePair$split2[1];
		
		    if (value || !isNaN(value)) {
		      if (isNaN(value)) {
		        hash[key] = value;
		      } else {
		        hash[key] = parseFloat(value);
		      }
		    } else if (key.length > 0) {
		      hash[key] = true;
		    }
		
		    return hash;
		  }, {});
		};
		
		module.exports = exports['default'];
	
	/***/ },
	/* 2 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		
		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
		
		var _lodashArrayIntersection = __webpack_require__(3);
		
		var _lodashArrayIntersection2 = _interopRequireDefault(_lodashArrayIntersection);
		
		var _lodashArrayFlatten = __webpack_require__(20);
		
		var _lodashArrayFlatten2 = _interopRequireDefault(_lodashArrayFlatten);
		
		var _lodashArrayIntersection3 = _interopRequireDefault(_lodashArrayIntersection);
		
		/* needs subscription sets to be defined somewhere */
		/* an event with a subscription set will only fire once */
		/* for all of the changes in the set. */
		
		exports['default'] = function (_ref) {
		  var getHashParams = _ref.getHashParams;
		  var subscriptionsByProperty = _ref.subscriptionsByProperty;
		  var subscriptionsByUUID = _ref.subscriptionsByUUID;
		  var keysWithChangedValues = _ref.keysWithChangedValues;
		  var event = _ref.event;
		
		  /* get the new params object */
		  /* get the old params object */
		  var oldParams = getHashParams(event.oldURL);
		  var newParams = getHashParams(event.newURL);
		
		  var subscribedKeys = Object.keys(subscriptionsByProperty.subscriptions);
		
		  /* identify the keys with changed values */
		  var keysWithChanges = keysWithChangedValues(oldParams, newParams);
		
		  var keysWithSubscribedEvents = (0, _lodashArrayIntersection2['default'])(keysWithChanges, subscribedKeys);
		
		  // keysWithSubscribedEvents.
		  /* loop through all of the subscribedEvent names looking */
		  /* for differences between newParams and oldParams */
		  var subscriptionUUIDs = keysWithSubscribedEvents.map(function (key) {
		    return Object.keys(subscriptionsByProperty.subscriptions[key]);
		  });
		
		  subscriptionUUIDs = (0, _lodashArrayIntersection3['default'])((0, _lodashArrayFlatten2['default'])(subscriptionUUIDs));
		
		  /* trigger events for each of the events found */
		
		  var subscriptions = subscriptionUUIDs.map(function (subscriptionUUID) {
		    return subscriptionsByUUID[subscriptionUUID];
		  });
		
		  subscriptions.forEach(function (subscription) {
		    subscription.callback(newParams);
		  });
		};
		
		module.exports = exports['default'];
	
	/***/ },
	/* 3 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseIndexOf = __webpack_require__(4),
		    cacheIndexOf = __webpack_require__(6),
		    createCache = __webpack_require__(8),
		    isArrayLike = __webpack_require__(15),
		    restParam = __webpack_require__(19);
		
		/**
		 * Creates an array of unique values that are included in all of the provided
		 * arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
		 * for equality comparisons.
		 *
		 * @static
		 * @memberOf _
		 * @category Array
		 * @param {...Array} [arrays] The arrays to inspect.
		 * @returns {Array} Returns the new array of shared values.
		 * @example
		 * _.intersection([1, 2], [4, 2], [2, 1]);
		 * // => [2]
		 */
		var intersection = restParam(function(arrays) {
		  var othLength = arrays.length,
		      othIndex = othLength,
		      caches = Array(length),
		      indexOf = baseIndexOf,
		      isCommon = true,
		      result = [];
		
		  while (othIndex--) {
		    var value = arrays[othIndex] = isArrayLike(value = arrays[othIndex]) ? value : [];
		    caches[othIndex] = (isCommon && value.length >= 120) ? createCache(othIndex && value) : null;
		  }
		  var array = arrays[0],
		      index = -1,
		      length = array ? array.length : 0,
		      seen = caches[0];
		
		  outer:
		  while (++index < length) {
		    value = array[index];
		    if ((seen ? cacheIndexOf(seen, value) : indexOf(result, value, 0)) < 0) {
		      var othIndex = othLength;
		      while (--othIndex) {
		        var cache = caches[othIndex];
		        if ((cache ? cacheIndexOf(cache, value) : indexOf(arrays[othIndex], value, 0)) < 0) {
		          continue outer;
		        }
		      }
		      if (seen) {
		        seen.push(value);
		      }
		      result.push(value);
		    }
		  }
		  return result;
		});
		
		module.exports = intersection;
	
	
	/***/ },
	/* 4 */
	/***/ function(module, exports, __webpack_require__) {
	
		var indexOfNaN = __webpack_require__(5);
		
		/**
		 * The base implementation of `_.indexOf` without support for binary searches.
		 *
		 * @private
		 * @param {Array} array The array to search.
		 * @param {*} value The value to search for.
		 * @param {number} fromIndex The index to search from.
		 * @returns {number} Returns the index of the matched value, else `-1`.
		 */
		function baseIndexOf(array, value, fromIndex) {
		  if (value !== value) {
		    return indexOfNaN(array, fromIndex);
		  }
		  var index = fromIndex - 1,
		      length = array.length;
		
		  while (++index < length) {
		    if (array[index] === value) {
		      return index;
		    }
		  }
		  return -1;
		}
		
		module.exports = baseIndexOf;
	
	
	/***/ },
	/* 5 */
	/***/ function(module, exports) {
	
		/**
		 * Gets the index at which the first occurrence of `NaN` is found in `array`.
		 *
		 * @private
		 * @param {Array} array The array to search.
		 * @param {number} fromIndex The index to search from.
		 * @param {boolean} [fromRight] Specify iterating from right to left.
		 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
		 */
		function indexOfNaN(array, fromIndex, fromRight) {
		  var length = array.length,
		      index = fromIndex + (fromRight ? 0 : -1);
		
		  while ((fromRight ? index-- : ++index < length)) {
		    var other = array[index];
		    if (other !== other) {
		      return index;
		    }
		  }
		  return -1;
		}
		
		module.exports = indexOfNaN;
	
	
	/***/ },
	/* 6 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isObject = __webpack_require__(7);
		
		/**
		 * Checks if `value` is in `cache` mimicking the return signature of
		 * `_.indexOf` by returning `0` if the value is found, else `-1`.
		 *
		 * @private
		 * @param {Object} cache The cache to search.
		 * @param {*} value The value to search for.
		 * @returns {number} Returns `0` if `value` is found, else `-1`.
		 */
		function cacheIndexOf(cache, value) {
		  var data = cache.data,
		      result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];
		
		  return result ? 0 : -1;
		}
		
		module.exports = cacheIndexOf;
	
	
	/***/ },
	/* 7 */
	/***/ function(module, exports) {
	
		/**
		 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
		 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
		 *
		 * @static
		 * @memberOf _
		 * @category Lang
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
		 * @example
		 *
		 * _.isObject({});
		 * // => true
		 *
		 * _.isObject([1, 2, 3]);
		 * // => true
		 *
		 * _.isObject(1);
		 * // => false
		 */
		function isObject(value) {
		  // Avoid a V8 JIT bug in Chrome 19-20.
		  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
		  var type = typeof value;
		  return !!value && (type == 'object' || type == 'function');
		}
		
		module.exports = isObject;
	
	
	/***/ },
	/* 8 */
	/***/ function(module, exports, __webpack_require__) {
	
		/* WEBPACK VAR INJECTION */(function(global) {var SetCache = __webpack_require__(9),
		    getNative = __webpack_require__(11);
		
		/** Native method references. */
		var Set = getNative(global, 'Set');
		
		/* Native method references for those with the same name as other `lodash` methods. */
		var nativeCreate = getNative(Object, 'create');
		
		/**
		 * Creates a `Set` cache object to optimize linear searches of large arrays.
		 *
		 * @private
		 * @param {Array} [values] The values to cache.
		 * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
		 */
		function createCache(values) {
		  return (nativeCreate && Set) ? new SetCache(values) : null;
		}
		
		module.exports = createCache;
		
		/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))
	
	/***/ },
	/* 9 */
	/***/ function(module, exports, __webpack_require__) {
	
		/* WEBPACK VAR INJECTION */(function(global) {var cachePush = __webpack_require__(10),
		    getNative = __webpack_require__(11);
		
		/** Native method references. */
		var Set = getNative(global, 'Set');
		
		/* Native method references for those with the same name as other `lodash` methods. */
		var nativeCreate = getNative(Object, 'create');
		
		/**
		 *
		 * Creates a cache object to store unique values.
		 *
		 * @private
		 * @param {Array} [values] The values to cache.
		 */
		function SetCache(values) {
		  var length = values ? values.length : 0;
		
		  this.data = { 'hash': nativeCreate(null), 'set': new Set };
		  while (length--) {
		    this.push(values[length]);
		  }
		}
		
		// Add functions to the `Set` cache.
		SetCache.prototype.push = cachePush;
		
		module.exports = SetCache;
		
		/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))
	
	/***/ },
	/* 10 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isObject = __webpack_require__(7);
		
		/**
		 * Adds `value` to the cache.
		 *
		 * @private
		 * @name push
		 * @memberOf SetCache
		 * @param {*} value The value to cache.
		 */
		function cachePush(value) {
		  var data = this.data;
		  if (typeof value == 'string' || isObject(value)) {
		    data.set.add(value);
		  } else {
		    data.hash[value] = true;
		  }
		}
		
		module.exports = cachePush;
	
	
	/***/ },
	/* 11 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isNative = __webpack_require__(12);
		
		/**
		 * Gets the native function at `key` of `object`.
		 *
		 * @private
		 * @param {Object} object The object to query.
		 * @param {string} key The key of the method to get.
		 * @returns {*} Returns the function if it's native, else `undefined`.
		 */
		function getNative(object, key) {
		  var value = object == null ? undefined : object[key];
		  return isNative(value) ? value : undefined;
		}
		
		module.exports = getNative;
	
	
	/***/ },
	/* 12 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isFunction = __webpack_require__(13),
		    isObjectLike = __webpack_require__(14);
		
		/** Used to detect host constructors (Safari > 5). */
		var reIsHostCtor = /^\[object .+?Constructor\]$/;
		
		/** Used for native method references. */
		var objectProto = Object.prototype;
		
		/** Used to resolve the decompiled source of functions. */
		var fnToString = Function.prototype.toString;
		
		/** Used to check objects for own properties. */
		var hasOwnProperty = objectProto.hasOwnProperty;
		
		/** Used to detect if a method is native. */
		var reIsNative = RegExp('^' +
		  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
		  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
		);
		
		/**
		 * Checks if `value` is a native function.
		 *
		 * @static
		 * @memberOf _
		 * @category Lang
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
		 * @example
		 *
		 * _.isNative(Array.prototype.push);
		 * // => true
		 *
		 * _.isNative(_);
		 * // => false
		 */
		function isNative(value) {
		  if (value == null) {
		    return false;
		  }
		  if (isFunction(value)) {
		    return reIsNative.test(fnToString.call(value));
		  }
		  return isObjectLike(value) && reIsHostCtor.test(value);
		}
		
		module.exports = isNative;
	
	
	/***/ },
	/* 13 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isObject = __webpack_require__(7);
		
		/** `Object#toString` result references. */
		var funcTag = '[object Function]';
		
		/** Used for native method references. */
		var objectProto = Object.prototype;
		
		/**
		 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
		 * of values.
		 */
		var objToString = objectProto.toString;
		
		/**
		 * Checks if `value` is classified as a `Function` object.
		 *
		 * @static
		 * @memberOf _
		 * @category Lang
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
		 * @example
		 *
		 * _.isFunction(_);
		 * // => true
		 *
		 * _.isFunction(/abc/);
		 * // => false
		 */
		function isFunction(value) {
		  // The use of `Object#toString` avoids issues with the `typeof` operator
		  // in older versions of Chrome and Safari which return 'function' for regexes
		  // and Safari 8 which returns 'object' for typed array constructors.
		  return isObject(value) && objToString.call(value) == funcTag;
		}
		
		module.exports = isFunction;
	
	
	/***/ },
	/* 14 */
	/***/ function(module, exports) {
	
		/**
		 * Checks if `value` is object-like.
		 *
		 * @private
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
		 */
		function isObjectLike(value) {
		  return !!value && typeof value == 'object';
		}
		
		module.exports = isObjectLike;
	
	
	/***/ },
	/* 15 */
	/***/ function(module, exports, __webpack_require__) {
	
		var getLength = __webpack_require__(16),
		    isLength = __webpack_require__(18);
		
		/**
		 * Checks if `value` is array-like.
		 *
		 * @private
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
		 */
		function isArrayLike(value) {
		  return value != null && isLength(getLength(value));
		}
		
		module.exports = isArrayLike;
	
	
	/***/ },
	/* 16 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseProperty = __webpack_require__(17);
		
		/**
		 * Gets the "length" property value of `object`.
		 *
		 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
		 * that affects Safari on at least iOS 8.1-8.3 ARM64.
		 *
		 * @private
		 * @param {Object} object The object to query.
		 * @returns {*} Returns the "length" value.
		 */
		var getLength = baseProperty('length');
		
		module.exports = getLength;
	
	
	/***/ },
	/* 17 */
	/***/ function(module, exports) {
	
		/**
		 * The base implementation of `_.property` without support for deep paths.
		 *
		 * @private
		 * @param {string} key The key of the property to get.
		 * @returns {Function} Returns the new function.
		 */
		function baseProperty(key) {
		  return function(object) {
		    return object == null ? undefined : object[key];
		  };
		}
		
		module.exports = baseProperty;
	
	
	/***/ },
	/* 18 */
	/***/ function(module, exports) {
	
		/**
		 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
		 * of an array-like value.
		 */
		var MAX_SAFE_INTEGER = 9007199254740991;
		
		/**
		 * Checks if `value` is a valid array-like length.
		 *
		 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
		 *
		 * @private
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
		 */
		function isLength(value) {
		  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
		}
		
		module.exports = isLength;
	
	
	/***/ },
	/* 19 */
	/***/ function(module, exports) {
	
		/** Used as the `TypeError` message for "Functions" methods. */
		var FUNC_ERROR_TEXT = 'Expected a function';
		
		/* Native method references for those with the same name as other `lodash` methods. */
		var nativeMax = Math.max;
		
		/**
		 * Creates a function that invokes `func` with the `this` binding of the
		 * created function and arguments from `start` and beyond provided as an array.
		 *
		 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
		 *
		 * @static
		 * @memberOf _
		 * @category Function
		 * @param {Function} func The function to apply a rest parameter to.
		 * @param {number} [start=func.length-1] The start position of the rest parameter.
		 * @returns {Function} Returns the new function.
		 * @example
		 *
		 * var say = _.restParam(function(what, names) {
		 *   return what + ' ' + _.initial(names).join(', ') +
		 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
		 * });
		 *
		 * say('hello', 'fred', 'barney', 'pebbles');
		 * // => 'hello fred, barney, & pebbles'
		 */
		function restParam(func, start) {
		  if (typeof func != 'function') {
		    throw new TypeError(FUNC_ERROR_TEXT);
		  }
		  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
		  return function() {
		    var args = arguments,
		        index = -1,
		        length = nativeMax(args.length - start, 0),
		        rest = Array(length);
		
		    while (++index < length) {
		      rest[index] = args[start + index];
		    }
		    switch (start) {
		      case 0: return func.call(this, rest);
		      case 1: return func.call(this, args[0], rest);
		      case 2: return func.call(this, args[0], args[1], rest);
		    }
		    var otherArgs = Array(start + 1);
		    index = -1;
		    while (++index < start) {
		      otherArgs[index] = args[index];
		    }
		    otherArgs[start] = rest;
		    return func.apply(this, otherArgs);
		  };
		}
		
		module.exports = restParam;
	
	
	/***/ },
	/* 20 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseFlatten = __webpack_require__(21),
		    isIterateeCall = __webpack_require__(25);
		
		/**
		 * Flattens a nested array. If `isDeep` is `true` the array is recursively
		 * flattened, otherwise it's only flattened a single level.
		 *
		 * @static
		 * @memberOf _
		 * @category Array
		 * @param {Array} array The array to flatten.
		 * @param {boolean} [isDeep] Specify a deep flatten.
		 * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
		 * @returns {Array} Returns the new flattened array.
		 * @example
		 *
		 * _.flatten([1, [2, 3, [4]]]);
		 * // => [1, 2, 3, [4]]
		 *
		 * // using `isDeep`
		 * _.flatten([1, [2, 3, [4]]], true);
		 * // => [1, 2, 3, 4]
		 */
		function flatten(array, isDeep, guard) {
		  var length = array ? array.length : 0;
		  if (guard && isIterateeCall(array, isDeep, guard)) {
		    isDeep = false;
		  }
		  return length ? baseFlatten(array, isDeep) : [];
		}
		
		module.exports = flatten;
	
	
	/***/ },
	/* 21 */
	/***/ function(module, exports, __webpack_require__) {
	
		var arrayPush = __webpack_require__(22),
		    isArguments = __webpack_require__(23),
		    isArray = __webpack_require__(24),
		    isArrayLike = __webpack_require__(15),
		    isObjectLike = __webpack_require__(14);
		
		/**
		 * The base implementation of `_.flatten` with added support for restricting
		 * flattening and specifying the start index.
		 *
		 * @private
		 * @param {Array} array The array to flatten.
		 * @param {boolean} [isDeep] Specify a deep flatten.
		 * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
		 * @param {Array} [result=[]] The initial result value.
		 * @returns {Array} Returns the new flattened array.
		 */
		function baseFlatten(array, isDeep, isStrict, result) {
		  result || (result = []);
		
		  var index = -1,
		      length = array.length;
		
		  while (++index < length) {
		    var value = array[index];
		    if (isObjectLike(value) && isArrayLike(value) &&
		        (isStrict || isArray(value) || isArguments(value))) {
		      if (isDeep) {
		        // Recursively flatten arrays (susceptible to call stack limits).
		        baseFlatten(value, isDeep, isStrict, result);
		      } else {
		        arrayPush(result, value);
		      }
		    } else if (!isStrict) {
		      result[result.length] = value;
		    }
		  }
		  return result;
		}
		
		module.exports = baseFlatten;
	
	
	/***/ },
	/* 22 */
	/***/ function(module, exports) {
	
		/**
		 * Appends the elements of `values` to `array`.
		 *
		 * @private
		 * @param {Array} array The array to modify.
		 * @param {Array} values The values to append.
		 * @returns {Array} Returns `array`.
		 */
		function arrayPush(array, values) {
		  var index = -1,
		      length = values.length,
		      offset = array.length;
		
		  while (++index < length) {
		    array[offset + index] = values[index];
		  }
		  return array;
		}
		
		module.exports = arrayPush;
	
	
	/***/ },
	/* 23 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isArrayLike = __webpack_require__(15),
		    isObjectLike = __webpack_require__(14);
		
		/** Used for native method references. */
		var objectProto = Object.prototype;
		
		/** Used to check objects for own properties. */
		var hasOwnProperty = objectProto.hasOwnProperty;
		
		/** Native method references. */
		var propertyIsEnumerable = objectProto.propertyIsEnumerable;
		
		/**
		 * Checks if `value` is classified as an `arguments` object.
		 *
		 * @static
		 * @memberOf _
		 * @category Lang
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
		 * @example
		 *
		 * _.isArguments(function() { return arguments; }());
		 * // => true
		 *
		 * _.isArguments([1, 2, 3]);
		 * // => false
		 */
		function isArguments(value) {
		  return isObjectLike(value) && isArrayLike(value) &&
		    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
		}
		
		module.exports = isArguments;
	
	
	/***/ },
	/* 24 */
	/***/ function(module, exports, __webpack_require__) {
	
		var getNative = __webpack_require__(11),
		    isLength = __webpack_require__(18),
		    isObjectLike = __webpack_require__(14);
		
		/** `Object#toString` result references. */
		var arrayTag = '[object Array]';
		
		/** Used for native method references. */
		var objectProto = Object.prototype;
		
		/**
		 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
		 * of values.
		 */
		var objToString = objectProto.toString;
		
		/* Native method references for those with the same name as other `lodash` methods. */
		var nativeIsArray = getNative(Array, 'isArray');
		
		/**
		 * Checks if `value` is classified as an `Array` object.
		 *
		 * @static
		 * @memberOf _
		 * @category Lang
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
		 * @example
		 *
		 * _.isArray([1, 2, 3]);
		 * // => true
		 *
		 * _.isArray(function() { return arguments; }());
		 * // => false
		 */
		var isArray = nativeIsArray || function(value) {
		  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
		};
		
		module.exports = isArray;
	
	
	/***/ },
	/* 25 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isArrayLike = __webpack_require__(15),
		    isIndex = __webpack_require__(26),
		    isObject = __webpack_require__(7);
		
		/**
		 * Checks if the provided arguments are from an iteratee call.
		 *
		 * @private
		 * @param {*} value The potential iteratee value argument.
		 * @param {*} index The potential iteratee index or key argument.
		 * @param {*} object The potential iteratee object argument.
		 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
		 */
		function isIterateeCall(value, index, object) {
		  if (!isObject(object)) {
		    return false;
		  }
		  var type = typeof index;
		  if (type == 'number'
		      ? (isArrayLike(object) && isIndex(index, object.length))
		      : (type == 'string' && index in object)) {
		    var other = object[index];
		    return value === value ? (value === other) : (other !== other);
		  }
		  return false;
		}
		
		module.exports = isIterateeCall;
	
	
	/***/ },
	/* 26 */
	/***/ function(module, exports) {
	
		/** Used to detect unsigned integer values. */
		var reIsUint = /^\d+$/;
		
		/**
		 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
		 * of an array-like value.
		 */
		var MAX_SAFE_INTEGER = 9007199254740991;
		
		/**
		 * Checks if `value` is a valid array-like index.
		 *
		 * @private
		 * @param {*} value The value to check.
		 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
		 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
		 */
		function isIndex(value, length) {
		  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
		  length = length == null ? MAX_SAFE_INTEGER : length;
		  return value > -1 && value % 1 == 0 && value < length;
		}
		
		module.exports = isIndex;
	
	
	/***/ },
	/* 27 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		
		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
		
		var _lodashArrayUnique = __webpack_require__(28);
		
		var _lodashArrayUnique2 = _interopRequireDefault(_lodashArrayUnique);
		
		exports['default'] = function (oldParams, newParams) {
		  var oldKeys = Object.keys(oldParams);
		  var newKeys = Object.keys(newParams);
		
		  var allKeys = (0, _lodashArrayUnique2['default'])(oldKeys.concat(newKeys));
		
		  return allKeys.filter(function (key) {
		    var oldValue = oldParams[key];
		    var newValue = newParams[key];
		
		    /* handle NaN */
		    if (oldValue !== oldValue && newValue !== newValue) {
		      /* both oldValue and newValue equal NaN */
		      return false;
		    }
		
		    return oldValue !== newValue;
		  });
		};
		
		module.exports = exports['default'];
	
	/***/ },
	/* 28 */
	/***/ function(module, exports, __webpack_require__) {
	
		module.exports = __webpack_require__(29);
	
	
	/***/ },
	/* 29 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseCallback = __webpack_require__(30),
		    baseUniq = __webpack_require__(58),
		    isIterateeCall = __webpack_require__(25),
		    sortedUniq = __webpack_require__(59);
		
		/**
		 * Creates a duplicate-free version of an array, using
		 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
		 * for equality comparisons, in which only the first occurence of each element
		 * is kept. Providing `true` for `isSorted` performs a faster search algorithm
		 * for sorted arrays. If an iteratee function is provided it's invoked for
		 * each element in the array to generate the criterion by which uniqueness
		 * is computed. The `iteratee` is bound to `thisArg` and invoked with three
		 * arguments: (value, index, array).
		 *
		 * If a property name is provided for `iteratee` the created `_.property`
		 * style callback returns the property value of the given element.
		 *
		 * If a value is also provided for `thisArg` the created `_.matchesProperty`
		 * style callback returns `true` for elements that have a matching property
		 * value, else `false`.
		 *
		 * If an object is provided for `iteratee` the created `_.matches` style
		 * callback returns `true` for elements that have the properties of the given
		 * object, else `false`.
		 *
		 * @static
		 * @memberOf _
		 * @alias unique
		 * @category Array
		 * @param {Array} array The array to inspect.
		 * @param {boolean} [isSorted] Specify the array is sorted.
		 * @param {Function|Object|string} [iteratee] The function invoked per iteration.
		 * @param {*} [thisArg] The `this` binding of `iteratee`.
		 * @returns {Array} Returns the new duplicate-value-free array.
		 * @example
		 *
		 * _.uniq([2, 1, 2]);
		 * // => [2, 1]
		 *
		 * // using `isSorted`
		 * _.uniq([1, 1, 2], true);
		 * // => [1, 2]
		 *
		 * // using an iteratee function
		 * _.uniq([1, 2.5, 1.5, 2], function(n) {
		 *   return this.floor(n);
		 * }, Math);
		 * // => [1, 2.5]
		 *
		 * // using the `_.property` callback shorthand
		 * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
		 * // => [{ 'x': 1 }, { 'x': 2 }]
		 */
		function uniq(array, isSorted, iteratee, thisArg) {
		  var length = array ? array.length : 0;
		  if (!length) {
		    return [];
		  }
		  if (isSorted != null && typeof isSorted != 'boolean') {
		    thisArg = iteratee;
		    iteratee = isIterateeCall(array, isSorted, thisArg) ? undefined : isSorted;
		    isSorted = false;
		  }
		  iteratee = iteratee == null ? iteratee : baseCallback(iteratee, thisArg, 3);
		  return (isSorted)
		    ? sortedUniq(array, iteratee)
		    : baseUniq(array, iteratee);
		}
		
		module.exports = uniq;
	
	
	/***/ },
	/* 30 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseMatches = __webpack_require__(31),
		    baseMatchesProperty = __webpack_require__(47),
		    bindCallback = __webpack_require__(54),
		    identity = __webpack_require__(55),
		    property = __webpack_require__(56);
		
		/**
		 * The base implementation of `_.callback` which supports specifying the
		 * number of arguments to provide to `func`.
		 *
		 * @private
		 * @param {*} [func=_.identity] The value to convert to a callback.
		 * @param {*} [thisArg] The `this` binding of `func`.
		 * @param {number} [argCount] The number of arguments to provide to `func`.
		 * @returns {Function} Returns the callback.
		 */
		function baseCallback(func, thisArg, argCount) {
		  var type = typeof func;
		  if (type == 'function') {
		    return thisArg === undefined
		      ? func
		      : bindCallback(func, thisArg, argCount);
		  }
		  if (func == null) {
		    return identity;
		  }
		  if (type == 'object') {
		    return baseMatches(func);
		  }
		  return thisArg === undefined
		    ? property(func)
		    : baseMatchesProperty(func, thisArg);
		}
		
		module.exports = baseCallback;
	
	
	/***/ },
	/* 31 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseIsMatch = __webpack_require__(32),
		    getMatchData = __webpack_require__(44),
		    toObject = __webpack_require__(43);
		
		/**
		 * The base implementation of `_.matches` which does not clone `source`.
		 *
		 * @private
		 * @param {Object} source The object of property values to match.
		 * @returns {Function} Returns the new function.
		 */
		function baseMatches(source) {
		  var matchData = getMatchData(source);
		  if (matchData.length == 1 && matchData[0][2]) {
		    var key = matchData[0][0],
		        value = matchData[0][1];
		
		    return function(object) {
		      if (object == null) {
		        return false;
		      }
		      return object[key] === value && (value !== undefined || (key in toObject(object)));
		    };
		  }
		  return function(object) {
		    return baseIsMatch(object, matchData);
		  };
		}
		
		module.exports = baseMatches;
	
	
	/***/ },
	/* 32 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseIsEqual = __webpack_require__(33),
		    toObject = __webpack_require__(43);
		
		/**
		 * The base implementation of `_.isMatch` without support for callback
		 * shorthands and `this` binding.
		 *
		 * @private
		 * @param {Object} object The object to inspect.
		 * @param {Array} matchData The propery names, values, and compare flags to match.
		 * @param {Function} [customizer] The function to customize comparing objects.
		 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
		 */
		function baseIsMatch(object, matchData, customizer) {
		  var index = matchData.length,
		      length = index,
		      noCustomizer = !customizer;
		
		  if (object == null) {
		    return !length;
		  }
		  object = toObject(object);
		  while (index--) {
		    var data = matchData[index];
		    if ((noCustomizer && data[2])
		          ? data[1] !== object[data[0]]
		          : !(data[0] in object)
		        ) {
		      return false;
		    }
		  }
		  while (++index < length) {
		    data = matchData[index];
		    var key = data[0],
		        objValue = object[key],
		        srcValue = data[1];
		
		    if (noCustomizer && data[2]) {
		      if (objValue === undefined && !(key in object)) {
		        return false;
		      }
		    } else {
		      var result = customizer ? customizer(objValue, srcValue, key) : undefined;
		      if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
		        return false;
		      }
		    }
		  }
		  return true;
		}
		
		module.exports = baseIsMatch;
	
	
	/***/ },
	/* 33 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseIsEqualDeep = __webpack_require__(34),
		    isObject = __webpack_require__(7),
		    isObjectLike = __webpack_require__(14);
		
		/**
		 * The base implementation of `_.isEqual` without support for `this` binding
		 * `customizer` functions.
		 *
		 * @private
		 * @param {*} value The value to compare.
		 * @param {*} other The other value to compare.
		 * @param {Function} [customizer] The function to customize comparing values.
		 * @param {boolean} [isLoose] Specify performing partial comparisons.
		 * @param {Array} [stackA] Tracks traversed `value` objects.
		 * @param {Array} [stackB] Tracks traversed `other` objects.
		 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
		 */
		function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
		  if (value === other) {
		    return true;
		  }
		  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
		    return value !== value && other !== other;
		  }
		  return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
		}
		
		module.exports = baseIsEqual;
	
	
	/***/ },
	/* 34 */
	/***/ function(module, exports, __webpack_require__) {
	
		var equalArrays = __webpack_require__(35),
		    equalByTag = __webpack_require__(37),
		    equalObjects = __webpack_require__(38),
		    isArray = __webpack_require__(24),
		    isTypedArray = __webpack_require__(42);
		
		/** `Object#toString` result references. */
		var argsTag = '[object Arguments]',
		    arrayTag = '[object Array]',
		    objectTag = '[object Object]';
		
		/** Used for native method references. */
		var objectProto = Object.prototype;
		
		/** Used to check objects for own properties. */
		var hasOwnProperty = objectProto.hasOwnProperty;
		
		/**
		 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
		 * of values.
		 */
		var objToString = objectProto.toString;
		
		/**
		 * A specialized version of `baseIsEqual` for arrays and objects which performs
		 * deep comparisons and tracks traversed objects enabling objects with circular
		 * references to be compared.
		 *
		 * @private
		 * @param {Object} object The object to compare.
		 * @param {Object} other The other object to compare.
		 * @param {Function} equalFunc The function to determine equivalents of values.
		 * @param {Function} [customizer] The function to customize comparing objects.
		 * @param {boolean} [isLoose] Specify performing partial comparisons.
		 * @param {Array} [stackA=[]] Tracks traversed `value` objects.
		 * @param {Array} [stackB=[]] Tracks traversed `other` objects.
		 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
		 */
		function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
		  var objIsArr = isArray(object),
		      othIsArr = isArray(other),
		      objTag = arrayTag,
		      othTag = arrayTag;
		
		  if (!objIsArr) {
		    objTag = objToString.call(object);
		    if (objTag == argsTag) {
		      objTag = objectTag;
		    } else if (objTag != objectTag) {
		      objIsArr = isTypedArray(object);
		    }
		  }
		  if (!othIsArr) {
		    othTag = objToString.call(other);
		    if (othTag == argsTag) {
		      othTag = objectTag;
		    } else if (othTag != objectTag) {
		      othIsArr = isTypedArray(other);
		    }
		  }
		  var objIsObj = objTag == objectTag,
		      othIsObj = othTag == objectTag,
		      isSameTag = objTag == othTag;
		
		  if (isSameTag && !(objIsArr || objIsObj)) {
		    return equalByTag(object, other, objTag);
		  }
		  if (!isLoose) {
		    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
		        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
		
		    if (objIsWrapped || othIsWrapped) {
		      return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
		    }
		  }
		  if (!isSameTag) {
		    return false;
		  }
		  // Assume cyclic values are equal.
		  // For more information on detecting circular references see https://es5.github.io/#JO.
		  stackA || (stackA = []);
		  stackB || (stackB = []);
		
		  var length = stackA.length;
		  while (length--) {
		    if (stackA[length] == object) {
		      return stackB[length] == other;
		    }
		  }
		  // Add `object` and `other` to the stack of traversed objects.
		  stackA.push(object);
		  stackB.push(other);
		
		  var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);
		
		  stackA.pop();
		  stackB.pop();
		
		  return result;
		}
		
		module.exports = baseIsEqualDeep;
	
	
	/***/ },
	/* 35 */
	/***/ function(module, exports, __webpack_require__) {
	
		var arraySome = __webpack_require__(36);
		
		/**
		 * A specialized version of `baseIsEqualDeep` for arrays with support for
		 * partial deep comparisons.
		 *
		 * @private
		 * @param {Array} array The array to compare.
		 * @param {Array} other The other array to compare.
		 * @param {Function} equalFunc The function to determine equivalents of values.
		 * @param {Function} [customizer] The function to customize comparing arrays.
		 * @param {boolean} [isLoose] Specify performing partial comparisons.
		 * @param {Array} [stackA] Tracks traversed `value` objects.
		 * @param {Array} [stackB] Tracks traversed `other` objects.
		 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
		 */
		function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
		  var index = -1,
		      arrLength = array.length,
		      othLength = other.length;
		
		  if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
		    return false;
		  }
		  // Ignore non-index properties.
		  while (++index < arrLength) {
		    var arrValue = array[index],
		        othValue = other[index],
		        result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;
		
		    if (result !== undefined) {
		      if (result) {
		        continue;
		      }
		      return false;
		    }
		    // Recursively compare arrays (susceptible to call stack limits).
		    if (isLoose) {
		      if (!arraySome(other, function(othValue) {
		            return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
		          })) {
		        return false;
		      }
		    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
		      return false;
		    }
		  }
		  return true;
		}
		
		module.exports = equalArrays;
	
	
	/***/ },
	/* 36 */
	/***/ function(module, exports) {
	
		/**
		 * A specialized version of `_.some` for arrays without support for callback
		 * shorthands and `this` binding.
		 *
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} predicate The function invoked per iteration.
		 * @returns {boolean} Returns `true` if any element passes the predicate check,
		 *  else `false`.
		 */
		function arraySome(array, predicate) {
		  var index = -1,
		      length = array.length;
		
		  while (++index < length) {
		    if (predicate(array[index], index, array)) {
		      return true;
		    }
		  }
		  return false;
		}
		
		module.exports = arraySome;
	
	
	/***/ },
	/* 37 */
	/***/ function(module, exports) {
	
		/** `Object#toString` result references. */
		var boolTag = '[object Boolean]',
		    dateTag = '[object Date]',
		    errorTag = '[object Error]',
		    numberTag = '[object Number]',
		    regexpTag = '[object RegExp]',
		    stringTag = '[object String]';
		
		/**
		 * A specialized version of `baseIsEqualDeep` for comparing objects of
		 * the same `toStringTag`.
		 *
		 * **Note:** This function only supports comparing values with tags of
		 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
		 *
		 * @private
		 * @param {Object} object The object to compare.
		 * @param {Object} other The other object to compare.
		 * @param {string} tag The `toStringTag` of the objects to compare.
		 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
		 */
		function equalByTag(object, other, tag) {
		  switch (tag) {
		    case boolTag:
		    case dateTag:
		      // Coerce dates and booleans to numbers, dates to milliseconds and booleans
		      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
		      return +object == +other;
		
		    case errorTag:
		      return object.name == other.name && object.message == other.message;
		
		    case numberTag:
		      // Treat `NaN` vs. `NaN` as equal.
		      return (object != +object)
		        ? other != +other
		        : object == +other;
		
		    case regexpTag:
		    case stringTag:
		      // Coerce regexes to strings and treat strings primitives and string
		      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
		      return object == (other + '');
		  }
		  return false;
		}
		
		module.exports = equalByTag;
	
	
	/***/ },
	/* 38 */
	/***/ function(module, exports, __webpack_require__) {
	
		var keys = __webpack_require__(39);
		
		/** Used for native method references. */
		var objectProto = Object.prototype;
		
		/** Used to check objects for own properties. */
		var hasOwnProperty = objectProto.hasOwnProperty;
		
		/**
		 * A specialized version of `baseIsEqualDeep` for objects with support for
		 * partial deep comparisons.
		 *
		 * @private
		 * @param {Object} object The object to compare.
		 * @param {Object} other The other object to compare.
		 * @param {Function} equalFunc The function to determine equivalents of values.
		 * @param {Function} [customizer] The function to customize comparing values.
		 * @param {boolean} [isLoose] Specify performing partial comparisons.
		 * @param {Array} [stackA] Tracks traversed `value` objects.
		 * @param {Array} [stackB] Tracks traversed `other` objects.
		 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
		 */
		function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
		  var objProps = keys(object),
		      objLength = objProps.length,
		      othProps = keys(other),
		      othLength = othProps.length;
		
		  if (objLength != othLength && !isLoose) {
		    return false;
		  }
		  var index = objLength;
		  while (index--) {
		    var key = objProps[index];
		    if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
		      return false;
		    }
		  }
		  var skipCtor = isLoose;
		  while (++index < objLength) {
		    key = objProps[index];
		    var objValue = object[key],
		        othValue = other[key],
		        result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;
		
		    // Recursively compare objects (susceptible to call stack limits).
		    if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
		      return false;
		    }
		    skipCtor || (skipCtor = key == 'constructor');
		  }
		  if (!skipCtor) {
		    var objCtor = object.constructor,
		        othCtor = other.constructor;
		
		    // Non `Object` object instances with different constructors are not equal.
		    if (objCtor != othCtor &&
		        ('constructor' in object && 'constructor' in other) &&
		        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
		          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
		      return false;
		    }
		  }
		  return true;
		}
		
		module.exports = equalObjects;
	
	
	/***/ },
	/* 39 */
	/***/ function(module, exports, __webpack_require__) {
	
		var getNative = __webpack_require__(11),
		    isArrayLike = __webpack_require__(15),
		    isObject = __webpack_require__(7),
		    shimKeys = __webpack_require__(40);
		
		/* Native method references for those with the same name as other `lodash` methods. */
		var nativeKeys = getNative(Object, 'keys');
		
		/**
		 * Creates an array of the own enumerable property names of `object`.
		 *
		 * **Note:** Non-object values are coerced to objects. See the
		 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
		 * for more details.
		 *
		 * @static
		 * @memberOf _
		 * @category Object
		 * @param {Object} object The object to query.
		 * @returns {Array} Returns the array of property names.
		 * @example
		 *
		 * function Foo() {
		 *   this.a = 1;
		 *   this.b = 2;
		 * }
		 *
		 * Foo.prototype.c = 3;
		 *
		 * _.keys(new Foo);
		 * // => ['a', 'b'] (iteration order is not guaranteed)
		 *
		 * _.keys('hi');
		 * // => ['0', '1']
		 */
		var keys = !nativeKeys ? shimKeys : function(object) {
		  var Ctor = object == null ? undefined : object.constructor;
		  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
		      (typeof object != 'function' && isArrayLike(object))) {
		    return shimKeys(object);
		  }
		  return isObject(object) ? nativeKeys(object) : [];
		};
		
		module.exports = keys;
	
	
	/***/ },
	/* 40 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isArguments = __webpack_require__(23),
		    isArray = __webpack_require__(24),
		    isIndex = __webpack_require__(26),
		    isLength = __webpack_require__(18),
		    keysIn = __webpack_require__(41);
		
		/** Used for native method references. */
		var objectProto = Object.prototype;
		
		/** Used to check objects for own properties. */
		var hasOwnProperty = objectProto.hasOwnProperty;
		
		/**
		 * A fallback implementation of `Object.keys` which creates an array of the
		 * own enumerable property names of `object`.
		 *
		 * @private
		 * @param {Object} object The object to query.
		 * @returns {Array} Returns the array of property names.
		 */
		function shimKeys(object) {
		  var props = keysIn(object),
		      propsLength = props.length,
		      length = propsLength && object.length;
		
		  var allowIndexes = !!length && isLength(length) &&
		    (isArray(object) || isArguments(object));
		
		  var index = -1,
		      result = [];
		
		  while (++index < propsLength) {
		    var key = props[index];
		    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
		      result.push(key);
		    }
		  }
		  return result;
		}
		
		module.exports = shimKeys;
	
	
	/***/ },
	/* 41 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isArguments = __webpack_require__(23),
		    isArray = __webpack_require__(24),
		    isIndex = __webpack_require__(26),
		    isLength = __webpack_require__(18),
		    isObject = __webpack_require__(7);
		
		/** Used for native method references. */
		var objectProto = Object.prototype;
		
		/** Used to check objects for own properties. */
		var hasOwnProperty = objectProto.hasOwnProperty;
		
		/**
		 * Creates an array of the own and inherited enumerable property names of `object`.
		 *
		 * **Note:** Non-object values are coerced to objects.
		 *
		 * @static
		 * @memberOf _
		 * @category Object
		 * @param {Object} object The object to query.
		 * @returns {Array} Returns the array of property names.
		 * @example
		 *
		 * function Foo() {
		 *   this.a = 1;
		 *   this.b = 2;
		 * }
		 *
		 * Foo.prototype.c = 3;
		 *
		 * _.keysIn(new Foo);
		 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
		 */
		function keysIn(object) {
		  if (object == null) {
		    return [];
		  }
		  if (!isObject(object)) {
		    object = Object(object);
		  }
		  var length = object.length;
		  length = (length && isLength(length) &&
		    (isArray(object) || isArguments(object)) && length) || 0;
		
		  var Ctor = object.constructor,
		      index = -1,
		      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
		      result = Array(length),
		      skipIndexes = length > 0;
		
		  while (++index < length) {
		    result[index] = (index + '');
		  }
		  for (var key in object) {
		    if (!(skipIndexes && isIndex(key, length)) &&
		        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
		      result.push(key);
		    }
		  }
		  return result;
		}
		
		module.exports = keysIn;
	
	
	/***/ },
	/* 42 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isLength = __webpack_require__(18),
		    isObjectLike = __webpack_require__(14);
		
		/** `Object#toString` result references. */
		var argsTag = '[object Arguments]',
		    arrayTag = '[object Array]',
		    boolTag = '[object Boolean]',
		    dateTag = '[object Date]',
		    errorTag = '[object Error]',
		    funcTag = '[object Function]',
		    mapTag = '[object Map]',
		    numberTag = '[object Number]',
		    objectTag = '[object Object]',
		    regexpTag = '[object RegExp]',
		    setTag = '[object Set]',
		    stringTag = '[object String]',
		    weakMapTag = '[object WeakMap]';
		
		var arrayBufferTag = '[object ArrayBuffer]',
		    float32Tag = '[object Float32Array]',
		    float64Tag = '[object Float64Array]',
		    int8Tag = '[object Int8Array]',
		    int16Tag = '[object Int16Array]',
		    int32Tag = '[object Int32Array]',
		    uint8Tag = '[object Uint8Array]',
		    uint8ClampedTag = '[object Uint8ClampedArray]',
		    uint16Tag = '[object Uint16Array]',
		    uint32Tag = '[object Uint32Array]';
		
		/** Used to identify `toStringTag` values of typed arrays. */
		var typedArrayTags = {};
		typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
		typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
		typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
		typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
		typedArrayTags[uint32Tag] = true;
		typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
		typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
		typedArrayTags[dateTag] = typedArrayTags[errorTag] =
		typedArrayTags[funcTag] = typedArrayTags[mapTag] =
		typedArrayTags[numberTag] = typedArrayTags[objectTag] =
		typedArrayTags[regexpTag] = typedArrayTags[setTag] =
		typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
		
		/** Used for native method references. */
		var objectProto = Object.prototype;
		
		/**
		 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
		 * of values.
		 */
		var objToString = objectProto.toString;
		
		/**
		 * Checks if `value` is classified as a typed array.
		 *
		 * @static
		 * @memberOf _
		 * @category Lang
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
		 * @example
		 *
		 * _.isTypedArray(new Uint8Array);
		 * // => true
		 *
		 * _.isTypedArray([]);
		 * // => false
		 */
		function isTypedArray(value) {
		  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
		}
		
		module.exports = isTypedArray;
	
	
	/***/ },
	/* 43 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isObject = __webpack_require__(7);
		
		/**
		 * Converts `value` to an object if it's not one.
		 *
		 * @private
		 * @param {*} value The value to process.
		 * @returns {Object} Returns the object.
		 */
		function toObject(value) {
		  return isObject(value) ? value : Object(value);
		}
		
		module.exports = toObject;
	
	
	/***/ },
	/* 44 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isStrictComparable = __webpack_require__(45),
		    pairs = __webpack_require__(46);
		
		/**
		 * Gets the propery names, values, and compare flags of `object`.
		 *
		 * @private
		 * @param {Object} object The object to query.
		 * @returns {Array} Returns the match data of `object`.
		 */
		function getMatchData(object) {
		  var result = pairs(object),
		      length = result.length;
		
		  while (length--) {
		    result[length][2] = isStrictComparable(result[length][1]);
		  }
		  return result;
		}
		
		module.exports = getMatchData;
	
	
	/***/ },
	/* 45 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isObject = __webpack_require__(7);
		
		/**
		 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
		 *
		 * @private
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` if suitable for strict
		 *  equality comparisons, else `false`.
		 */
		function isStrictComparable(value) {
		  return value === value && !isObject(value);
		}
		
		module.exports = isStrictComparable;
	
	
	/***/ },
	/* 46 */
	/***/ function(module, exports, __webpack_require__) {
	
		var keys = __webpack_require__(39),
		    toObject = __webpack_require__(43);
		
		/**
		 * Creates a two dimensional array of the key-value pairs for `object`,
		 * e.g. `[[key1, value1], [key2, value2]]`.
		 *
		 * @static
		 * @memberOf _
		 * @category Object
		 * @param {Object} object The object to query.
		 * @returns {Array} Returns the new array of key-value pairs.
		 * @example
		 *
		 * _.pairs({ 'barney': 36, 'fred': 40 });
		 * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
		 */
		function pairs(object) {
		  object = toObject(object);
		
		  var index = -1,
		      props = keys(object),
		      length = props.length,
		      result = Array(length);
		
		  while (++index < length) {
		    var key = props[index];
		    result[index] = [key, object[key]];
		  }
		  return result;
		}
		
		module.exports = pairs;
	
	
	/***/ },
	/* 47 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseGet = __webpack_require__(48),
		    baseIsEqual = __webpack_require__(33),
		    baseSlice = __webpack_require__(49),
		    isArray = __webpack_require__(24),
		    isKey = __webpack_require__(50),
		    isStrictComparable = __webpack_require__(45),
		    last = __webpack_require__(51),
		    toObject = __webpack_require__(43),
		    toPath = __webpack_require__(52);
		
		/**
		 * The base implementation of `_.matchesProperty` which does not clone `srcValue`.
		 *
		 * @private
		 * @param {string} path The path of the property to get.
		 * @param {*} srcValue The value to compare.
		 * @returns {Function} Returns the new function.
		 */
		function baseMatchesProperty(path, srcValue) {
		  var isArr = isArray(path),
		      isCommon = isKey(path) && isStrictComparable(srcValue),
		      pathKey = (path + '');
		
		  path = toPath(path);
		  return function(object) {
		    if (object == null) {
		      return false;
		    }
		    var key = pathKey;
		    object = toObject(object);
		    if ((isArr || !isCommon) && !(key in object)) {
		      object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
		      if (object == null) {
		        return false;
		      }
		      key = last(path);
		      object = toObject(object);
		    }
		    return object[key] === srcValue
		      ? (srcValue !== undefined || (key in object))
		      : baseIsEqual(srcValue, object[key], undefined, true);
		  };
		}
		
		module.exports = baseMatchesProperty;
	
	
	/***/ },
	/* 48 */
	/***/ function(module, exports, __webpack_require__) {
	
		var toObject = __webpack_require__(43);
		
		/**
		 * The base implementation of `get` without support for string paths
		 * and default values.
		 *
		 * @private
		 * @param {Object} object The object to query.
		 * @param {Array} path The path of the property to get.
		 * @param {string} [pathKey] The key representation of path.
		 * @returns {*} Returns the resolved value.
		 */
		function baseGet(object, path, pathKey) {
		  if (object == null) {
		    return;
		  }
		  if (pathKey !== undefined && pathKey in toObject(object)) {
		    path = [pathKey];
		  }
		  var index = 0,
		      length = path.length;
		
		  while (object != null && index < length) {
		    object = object[path[index++]];
		  }
		  return (index && index == length) ? object : undefined;
		}
		
		module.exports = baseGet;
	
	
	/***/ },
	/* 49 */
	/***/ function(module, exports) {
	
		/**
		 * The base implementation of `_.slice` without an iteratee call guard.
		 *
		 * @private
		 * @param {Array} array The array to slice.
		 * @param {number} [start=0] The start position.
		 * @param {number} [end=array.length] The end position.
		 * @returns {Array} Returns the slice of `array`.
		 */
		function baseSlice(array, start, end) {
		  var index = -1,
		      length = array.length;
		
		  start = start == null ? 0 : (+start || 0);
		  if (start < 0) {
		    start = -start > length ? 0 : (length + start);
		  }
		  end = (end === undefined || end > length) ? length : (+end || 0);
		  if (end < 0) {
		    end += length;
		  }
		  length = start > end ? 0 : ((end - start) >>> 0);
		  start >>>= 0;
		
		  var result = Array(length);
		  while (++index < length) {
		    result[index] = array[index + start];
		  }
		  return result;
		}
		
		module.exports = baseSlice;
	
	
	/***/ },
	/* 50 */
	/***/ function(module, exports, __webpack_require__) {
	
		var isArray = __webpack_require__(24),
		    toObject = __webpack_require__(43);
		
		/** Used to match property names within property paths. */
		var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
		    reIsPlainProp = /^\w*$/;
		
		/**
		 * Checks if `value` is a property name and not a property path.
		 *
		 * @private
		 * @param {*} value The value to check.
		 * @param {Object} [object] The object to query keys on.
		 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
		 */
		function isKey(value, object) {
		  var type = typeof value;
		  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
		    return true;
		  }
		  if (isArray(value)) {
		    return false;
		  }
		  var result = !reIsDeepProp.test(value);
		  return result || (object != null && value in toObject(object));
		}
		
		module.exports = isKey;
	
	
	/***/ },
	/* 51 */
	/***/ function(module, exports) {
	
		/**
		 * Gets the last element of `array`.
		 *
		 * @static
		 * @memberOf _
		 * @category Array
		 * @param {Array} array The array to query.
		 * @returns {*} Returns the last element of `array`.
		 * @example
		 *
		 * _.last([1, 2, 3]);
		 * // => 3
		 */
		function last(array) {
		  var length = array ? array.length : 0;
		  return length ? array[length - 1] : undefined;
		}
		
		module.exports = last;
	
	
	/***/ },
	/* 52 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseToString = __webpack_require__(53),
		    isArray = __webpack_require__(24);
		
		/** Used to match property names within property paths. */
		var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;
		
		/** Used to match backslashes in property paths. */
		var reEscapeChar = /\\(\\)?/g;
		
		/**
		 * Converts `value` to property path array if it's not one.
		 *
		 * @private
		 * @param {*} value The value to process.
		 * @returns {Array} Returns the property path array.
		 */
		function toPath(value) {
		  if (isArray(value)) {
		    return value;
		  }
		  var result = [];
		  baseToString(value).replace(rePropName, function(match, number, quote, string) {
		    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
		  });
		  return result;
		}
		
		module.exports = toPath;
	
	
	/***/ },
	/* 53 */
	/***/ function(module, exports) {
	
		/**
		 * Converts `value` to a string if it's not one. An empty string is returned
		 * for `null` or `undefined` values.
		 *
		 * @private
		 * @param {*} value The value to process.
		 * @returns {string} Returns the string.
		 */
		function baseToString(value) {
		  return value == null ? '' : (value + '');
		}
		
		module.exports = baseToString;
	
	
	/***/ },
	/* 54 */
	/***/ function(module, exports, __webpack_require__) {
	
		var identity = __webpack_require__(55);
		
		/**
		 * A specialized version of `baseCallback` which only supports `this` binding
		 * and specifying the number of arguments to provide to `func`.
		 *
		 * @private
		 * @param {Function} func The function to bind.
		 * @param {*} thisArg The `this` binding of `func`.
		 * @param {number} [argCount] The number of arguments to provide to `func`.
		 * @returns {Function} Returns the callback.
		 */
		function bindCallback(func, thisArg, argCount) {
		  if (typeof func != 'function') {
		    return identity;
		  }
		  if (thisArg === undefined) {
		    return func;
		  }
		  switch (argCount) {
		    case 1: return function(value) {
		      return func.call(thisArg, value);
		    };
		    case 3: return function(value, index, collection) {
		      return func.call(thisArg, value, index, collection);
		    };
		    case 4: return function(accumulator, value, index, collection) {
		      return func.call(thisArg, accumulator, value, index, collection);
		    };
		    case 5: return function(value, other, key, object, source) {
		      return func.call(thisArg, value, other, key, object, source);
		    };
		  }
		  return function() {
		    return func.apply(thisArg, arguments);
		  };
		}
		
		module.exports = bindCallback;
	
	
	/***/ },
	/* 55 */
	/***/ function(module, exports) {
	
		/**
		 * This method returns the first argument provided to it.
		 *
		 * @static
		 * @memberOf _
		 * @category Utility
		 * @param {*} value Any value.
		 * @returns {*} Returns `value`.
		 * @example
		 *
		 * var object = { 'user': 'fred' };
		 *
		 * _.identity(object) === object;
		 * // => true
		 */
		function identity(value) {
		  return value;
		}
		
		module.exports = identity;
	
	
	/***/ },
	/* 56 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseProperty = __webpack_require__(17),
		    basePropertyDeep = __webpack_require__(57),
		    isKey = __webpack_require__(50);
		
		/**
		 * Creates a function that returns the property value at `path` on a
		 * given object.
		 *
		 * @static
		 * @memberOf _
		 * @category Utility
		 * @param {Array|string} path The path of the property to get.
		 * @returns {Function} Returns the new function.
		 * @example
		 *
		 * var objects = [
		 *   { 'a': { 'b': { 'c': 2 } } },
		 *   { 'a': { 'b': { 'c': 1 } } }
		 * ];
		 *
		 * _.map(objects, _.property('a.b.c'));
		 * // => [2, 1]
		 *
		 * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
		 * // => [1, 2]
		 */
		function property(path) {
		  return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
		}
		
		module.exports = property;
	
	
	/***/ },
	/* 57 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseGet = __webpack_require__(48),
		    toPath = __webpack_require__(52);
		
		/**
		 * A specialized version of `baseProperty` which supports deep paths.
		 *
		 * @private
		 * @param {Array|string} path The path of the property to get.
		 * @returns {Function} Returns the new function.
		 */
		function basePropertyDeep(path) {
		  var pathKey = (path + '');
		  path = toPath(path);
		  return function(object) {
		    return baseGet(object, path, pathKey);
		  };
		}
		
		module.exports = basePropertyDeep;
	
	
	/***/ },
	/* 58 */
	/***/ function(module, exports, __webpack_require__) {
	
		var baseIndexOf = __webpack_require__(4),
		    cacheIndexOf = __webpack_require__(6),
		    createCache = __webpack_require__(8);
		
		/** Used as the size to enable large array optimizations. */
		var LARGE_ARRAY_SIZE = 200;
		
		/**
		 * The base implementation of `_.uniq` without support for callback shorthands
		 * and `this` binding.
		 *
		 * @private
		 * @param {Array} array The array to inspect.
		 * @param {Function} [iteratee] The function invoked per iteration.
		 * @returns {Array} Returns the new duplicate free array.
		 */
		function baseUniq(array, iteratee) {
		  var index = -1,
		      indexOf = baseIndexOf,
		      length = array.length,
		      isCommon = true,
		      isLarge = isCommon && length >= LARGE_ARRAY_SIZE,
		      seen = isLarge ? createCache() : null,
		      result = [];
		
		  if (seen) {
		    indexOf = cacheIndexOf;
		    isCommon = false;
		  } else {
		    isLarge = false;
		    seen = iteratee ? [] : result;
		  }
		  outer:
		  while (++index < length) {
		    var value = array[index],
		        computed = iteratee ? iteratee(value, index, array) : value;
		
		    if (isCommon && value === value) {
		      var seenIndex = seen.length;
		      while (seenIndex--) {
		        if (seen[seenIndex] === computed) {
		          continue outer;
		        }
		      }
		      if (iteratee) {
		        seen.push(computed);
		      }
		      result.push(value);
		    }
		    else if (indexOf(seen, computed, 0) < 0) {
		      if (iteratee || isLarge) {
		        seen.push(computed);
		      }
		      result.push(value);
		    }
		  }
		  return result;
		}
		
		module.exports = baseUniq;
	
	
	/***/ },
	/* 59 */
	/***/ function(module, exports) {
	
		/**
		 * An implementation of `_.uniq` optimized for sorted arrays without support
		 * for callback shorthands and `this` binding.
		 *
		 * @private
		 * @param {Array} array The array to inspect.
		 * @param {Function} [iteratee] The function invoked per iteration.
		 * @returns {Array} Returns the new duplicate free array.
		 */
		function sortedUniq(array, iteratee) {
		  var seen,
		      index = -1,
		      length = array.length,
		      resIndex = -1,
		      result = [];
		
		  while (++index < length) {
		    var value = array[index],
		        computed = iteratee ? iteratee(value, index, array) : value;
		
		    if (!index || seen !== computed) {
		      seen = computed;
		      result[++resIndex] = value;
		    }
		  }
		  return result;
		}
		
		module.exports = sortedUniq;
	
	
	/***/ },
	/* 60 */
	/***/ function(module, exports) {
	
		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		
		exports['default'] = function (_ref) {
		  var Subscription = _ref.Subscription;
		  var subscriptionsByUUID = _ref.subscriptionsByUUID;
		  var subscriptionsByProperty = _ref.subscriptionsByProperty;
		  var properties = _ref.properties;
		  var callback = _ref.callback;
		
		  /* make a subscription */
		  var subscription = Subscription({ properties: properties, callback: callback });
		
		  /* add the subscription to the subscriptionsByUUID object */
		  subscriptionsByUUID[subscription.uuid] = subscription;
		
		  /* add references to the subscription to each of the */
		  /* subscribed properties */
		  properties.forEach(function (property) {
		    subscriptionsByProperty.add({ property: property, subscription: subscription });
		  });
		
		  return subscription.uuid;
		};
		
		module.exports = exports['default'];
	
	/***/ },
	/* 61 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		
		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
		
		var _nodeUuid = __webpack_require__(62);
		
		var _nodeUuid2 = _interopRequireDefault(_nodeUuid);
		
		var SUBSCRIPTION_PROTOTYPE = {
		  properties: [],
		  callback: function callback() {},
		  guid: null
		};
		
		exports['default'] = function (_ref) {
		  var properties = _ref.properties;
		  var callback = _ref.callback;
		
		  var subscription = Object.create(SUBSCRIPTION_PROTOTYPE);
		
		  subscription.properties = properties;
		  subscription.callback = callback;
		  subscription.uuid = _nodeUuid2['default'].v4();
		
		  return subscription;
		};
		
		exports.SUBSCRIPTION_PROTOTYPE = SUBSCRIPTION_PROTOTYPE;
	
	/***/ },
	/* 62 */
	/***/ function(module, exports, __webpack_require__) {
	
		var __WEBPACK_AMD_DEFINE_RESULT__;//     uuid.js
		//
		//     Copyright (c) 2010-2012 Robert Kieffer
		//     MIT License - http://opensource.org/licenses/mit-license.php
		
		(function() {
		  var _global = this;
		
		  // Unique ID creation requires a high quality random # generator.  We feature
		  // detect to determine the best RNG source, normalizing to a function that
		  // returns 128-bits of randomness, since that's what's usually required
		  var _rng;
		
		  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
		  //
		  // Moderately fast, high quality
		  if (typeof(_global.require) == 'function') {
		    try {
		      var _rb = _global.require('crypto').randomBytes;
		      _rng = _rb && function() {return _rb(16);};
		    } catch(e) {}
		  }
		
		  if (!_rng && _global.crypto && crypto.getRandomValues) {
		    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
		    //
		    // Moderately fast, high quality
		    var _rnds8 = new Uint8Array(16);
		    _rng = function whatwgRNG() {
		      crypto.getRandomValues(_rnds8);
		      return _rnds8;
		    };
		  }
		
		  if (!_rng) {
		    // Math.random()-based (RNG)
		    //
		    // If all else fails, use Math.random().  It's fast, but is of unspecified
		    // quality.
		    var  _rnds = new Array(16);
		    _rng = function() {
		      for (var i = 0, r; i < 16; i++) {
		        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
		        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
		      }
		
		      return _rnds;
		    };
		  }
		
		  // Buffer class to use
		  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;
		
		  // Maps for number <-> hex string conversion
		  var _byteToHex = [];
		  var _hexToByte = {};
		  for (var i = 0; i < 256; i++) {
		    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
		    _hexToByte[_byteToHex[i]] = i;
		  }
		
		  // **`parse()` - Parse a UUID into it's component bytes**
		  function parse(s, buf, offset) {
		    var i = (buf && offset) || 0, ii = 0;
		
		    buf = buf || [];
		    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
		      if (ii < 16) { // Don't overflow!
		        buf[i + ii++] = _hexToByte[oct];
		      }
		    });
		
		    // Zero out remaining bytes if string was short
		    while (ii < 16) {
		      buf[i + ii++] = 0;
		    }
		
		    return buf;
		  }
		
		  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
		  function unparse(buf, offset) {
		    var i = offset || 0, bth = _byteToHex;
		    return  bth[buf[i++]] + bth[buf[i++]] +
		            bth[buf[i++]] + bth[buf[i++]] + '-' +
		            bth[buf[i++]] + bth[buf[i++]] + '-' +
		            bth[buf[i++]] + bth[buf[i++]] + '-' +
		            bth[buf[i++]] + bth[buf[i++]] + '-' +
		            bth[buf[i++]] + bth[buf[i++]] +
		            bth[buf[i++]] + bth[buf[i++]] +
		            bth[buf[i++]] + bth[buf[i++]];
		  }
		
		  // **`v1()` - Generate time-based UUID**
		  //
		  // Inspired by https://github.com/LiosK/UUID.js
		  // and http://docs.python.org/library/uuid.html
		
		  // random #'s we need to init node and clockseq
		  var _seedBytes = _rng();
		
		  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
		  var _nodeId = [
		    _seedBytes[0] | 0x01,
		    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
		  ];
		
		  // Per 4.2.2, randomize (14 bit) clockseq
		  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;
		
		  // Previous uuid creation time
		  var _lastMSecs = 0, _lastNSecs = 0;
		
		  // See https://github.com/broofa/node-uuid for API details
		  function v1(options, buf, offset) {
		    var i = buf && offset || 0;
		    var b = buf || [];
		
		    options = options || {};
		
		    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;
		
		    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
		    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
		    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
		    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
		    var msecs = options.msecs != null ? options.msecs : new Date().getTime();
		
		    // Per 4.2.1.2, use count of uuid's generated during the current clock
		    // cycle to simulate higher resolution clock
		    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;
		
		    // Time since last uuid creation (in msecs)
		    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;
		
		    // Per 4.2.1.2, Bump clockseq on clock regression
		    if (dt < 0 && options.clockseq == null) {
		      clockseq = clockseq + 1 & 0x3fff;
		    }
		
		    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
		    // time interval
		    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
		      nsecs = 0;
		    }
		
		    // Per 4.2.1.2 Throw error if too many uuids are requested
		    if (nsecs >= 10000) {
		      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
		    }
		
		    _lastMSecs = msecs;
		    _lastNSecs = nsecs;
		    _clockseq = clockseq;
		
		    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
		    msecs += 12219292800000;
		
		    // `time_low`
		    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
		    b[i++] = tl >>> 24 & 0xff;
		    b[i++] = tl >>> 16 & 0xff;
		    b[i++] = tl >>> 8 & 0xff;
		    b[i++] = tl & 0xff;
		
		    // `time_mid`
		    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
		    b[i++] = tmh >>> 8 & 0xff;
		    b[i++] = tmh & 0xff;
		
		    // `time_high_and_version`
		    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
		    b[i++] = tmh >>> 16 & 0xff;
		
		    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
		    b[i++] = clockseq >>> 8 | 0x80;
		
		    // `clock_seq_low`
		    b[i++] = clockseq & 0xff;
		
		    // `node`
		    var node = options.node || _nodeId;
		    for (var n = 0; n < 6; n++) {
		      b[i + n] = node[n];
		    }
		
		    return buf ? buf : unparse(b);
		  }
		
		  // **`v4()` - Generate random UUID**
		
		  // See https://github.com/broofa/node-uuid for API details
		  function v4(options, buf, offset) {
		    // Deprecated - 'format' argument, as supported in v1.2
		    var i = buf && offset || 0;
		
		    if (typeof(options) == 'string') {
		      buf = options == 'binary' ? new BufferClass(16) : null;
		      options = null;
		    }
		    options = options || {};
		
		    var rnds = options.random || (options.rng || _rng)();
		
		    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
		    rnds[6] = (rnds[6] & 0x0f) | 0x40;
		    rnds[8] = (rnds[8] & 0x3f) | 0x80;
		
		    // Copy bytes to buffer, if provided
		    if (buf) {
		      for (var ii = 0; ii < 16; ii++) {
		        buf[i + ii] = rnds[ii];
		      }
		    }
		
		    return buf || unparse(rnds);
		  }
		
		  // Export public API
		  var uuid = v4;
		  uuid.v1 = v1;
		  uuid.v4 = v4;
		  uuid.parse = parse;
		  uuid.unparse = unparse;
		  uuid.BufferClass = BufferClass;
		
		  if (typeof(module) != 'undefined' && module.exports) {
		    // Publish as node.js module
		    module.exports = uuid;
		  } else  if (true) {
		    // Publish as AMD module
		    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {return uuid;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		 
		
		  } else {
		    // Publish as global (in browsers)
		    var _previousRoot = _global.uuid;
		
		    // **`noConflict()` - (browser only) to reset global 'uuid' var**
		    uuid.noConflict = function() {
		      _global.uuid = _previousRoot;
		      return uuid;
		    };
		
		    _global.uuid = uuid;
		  }
		}).call(this);
	
	
	/***/ },
	/* 63 */
	/***/ function(module, exports) {
	
		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		var SUBSCRIPTIONS_BY_PROPERTY_PROTOTYPE = {
		  add: function add(_ref) {
		    var property = _ref.property;
		    var subscription = _ref.subscription;
		
		    var currentSubscriptions = this.subscriptions[property];
		
		    if (!currentSubscriptions || Object.keys(currentSubscriptions).length === 0) {
		      this.subscriptions[property] = {};
		    }
		
		    /* useing object like a set here */
		    this.subscriptions[property][subscription.uuid] = true;
		  },
		
		  remove: function remove(_ref2) {
		    var property = _ref2.property;
		    var subscription = _ref2.subscription;
		
		    var currentSubscriptions = this.subscriptions[property];
		
		    if (!currentSubscriptions || Object.keys(currentSubscriptions).length === 0) {
		      this.subscriptions[property] = {};
		    }
		
		    delete this.subscriptions[property][subscription.uuid];
		  }
		
		};
		
		exports['default'] = function () {
		  var subscriptionsByProperty = Object.create(SUBSCRIPTIONS_BY_PROPERTY_PROTOTYPE);
		
		  subscriptionsByProperty.subscriptions = {};
		
		  return subscriptionsByProperty;
		};
		
		exports.SUBSCRIPTIONS_BY_PROPERTY_PROTOTYPE = SUBSCRIPTIONS_BY_PROPERTY_PROTOTYPE;
	
	/***/ },
	/* 64 */
	/***/ function(module, exports) {
	
		'use strict';
		
		/* singleton object used to hold subscription objects by their UUID */
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		exports['default'] = {};
		module.exports = exports['default'];
	
	/***/ },
	/* 65 */
	/***/ function(module, exports) {
	
		'use strict';
		
		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		
		exports['default'] = function (_ref) {
		  var subscriptionUUID = _ref.subscriptionUUID;
		  var subscriptionsByUUID = _ref.subscriptionsByUUID;
		  var subscriptionsByProperty = _ref.subscriptionsByProperty;
		
		  var subscription = subscriptionsByUUID[subscriptionUUID];
		
		  if (subscription) {
		    /* remove the subscription from the subscriptionsByUUID object */
		    delete subscriptionsByUUID[subscriptionUUID];
		
		    /* remove references to the subscription from each of the subscribed properties */
		    subscription.properties.forEach(function (property) {
		      subscriptionsByProperty.remove({ property: property, subscription: subscription });
		    });
		  }
		};
		
		module.exports = exports['default'];
	
	/***/ }
	/******/ ]);
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOWM1ZmUwN2IxN2FlODZhMGE3YTUiLCJ3ZWJwYWNrOi8vLy4vamF2YXNjcmlwdC9hcGkuanMiLCJ3ZWJwYWNrOi8vLy4vamF2YXNjcmlwdC9nZXRIYXNoUGFyYW1zLmpzIiwid2VicGFjazovLy8uL2phdmFzY3JpcHQvaGFzaENoYW5nZUhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvYXJyYXkvaW50ZXJzZWN0aW9uLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ludGVybmFsL2Jhc2VJbmRleE9mLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ludGVybmFsL2luZGV4T2ZOYU4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvY2FjaGVJbmRleE9mLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2xhbmcvaXNPYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvY3JlYXRlQ2FjaGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvU2V0Q2FjaGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvY2FjaGVQdXNoLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ludGVybmFsL2dldE5hdGl2ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9sYW5nL2lzTmF0aXZlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2xhbmcvaXNGdW5jdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC9pc09iamVjdExpa2UuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvaXNBcnJheUxpa2UuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvZ2V0TGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ludGVybmFsL2Jhc2VQcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC9pc0xlbmd0aC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9mdW5jdGlvbi9yZXN0UGFyYW0uanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvYXJyYXkvZmxhdHRlbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC9iYXNlRmxhdHRlbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC9hcnJheVB1c2guanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvbGFuZy9pc0FyZ3VtZW50cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9sYW5nL2lzQXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvaXNJdGVyYXRlZUNhbGwuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvaXNJbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9qYXZhc2NyaXB0L2tleXNXaXRoQ2hhbmdlZFZhbHVlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9hcnJheS91bmlxdWUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvYXJyYXkvdW5pcS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC9iYXNlQ2FsbGJhY2suanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZU1hdGNoZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZUlzTWF0Y2guanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZUlzRXF1YWwuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZUlzRXF1YWxEZWVwLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ludGVybmFsL2VxdWFsQXJyYXlzLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ludGVybmFsL2FycmF5U29tZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC9lcXVhbEJ5VGFnLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ludGVybmFsL2VxdWFsT2JqZWN0cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9vYmplY3Qva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC9zaGltS2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9vYmplY3Qva2V5c0luLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2xhbmcvaXNUeXBlZEFycmF5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ludGVybmFsL3RvT2JqZWN0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ludGVybmFsL2dldE1hdGNoRGF0YS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC9pc1N0cmljdENvbXBhcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvb2JqZWN0L3BhaXJzLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ludGVybmFsL2Jhc2VNYXRjaGVzUHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZUdldC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC9iYXNlU2xpY2UuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvaXNLZXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvYXJyYXkvbGFzdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC90b1BhdGguanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZVRvU3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ludGVybmFsL2JpbmRDYWxsYmFjay5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC91dGlsaXR5L2lkZW50aXR5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL3V0aWxpdHkvcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZVByb3BlcnR5RGVlcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC9iYXNlVW5pcS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pbnRlcm5hbC9zb3J0ZWRVbmlxLmpzIiwid2VicGFjazovLy8uL2phdmFzY3JpcHQvc3Vic2NyaWJlLmpzIiwid2VicGFjazovLy8uL2phdmFzY3JpcHQvU3Vic2NyaXB0aW9uLmpzIiwid2VicGFjazovLy8uL34vbm9kZS11dWlkL3V1aWQuanMiLCJ3ZWJwYWNrOi8vLy4vamF2YXNjcmlwdC9zdWJzY3JpcHRpb25zQnlQcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly8vLi9qYXZhc2NyaXB0L3N1YnNjcmlwdGlvbnNCeVVVSUQuanMiLCJ3ZWJwYWNrOi8vLy4vamF2YXNjcmlwdC91bnN1YnNjcmliZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7QUN0Q0EsYUFBWSxDQUFDOzs7Ozs7OztvREFFdUIsQ0FBMEI7Ozs7d0RBQzFCLENBQThCOzs7OzREQUM5QixFQUFrQzs7OztnREFDbEMsRUFBc0I7Ozs7bURBQ3RCLEVBQXlCOzs7OzhEQUN6QixFQUFvQzs7OzswREFDcEMsRUFBZ0M7Ozs7a0RBQ2hDLEVBQXdCOzs7O0FBRTVELEtBQUksdUJBQXVCLEdBQUcscURBQXlCLENBQUM7OztzQkFHekM7QUFDYix1QkFBb0Isa0NBQUc7QUFDckIsU0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDckIsV0FBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1osV0FBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7TUFDekI7SUFDRjtBQUNELE9B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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixjQUFhLE1BQU07QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxPQUFPO0FBQ2xCLGNBQWEsTUFBTTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUMvREE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FB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O09BQUUsdUJBQXVCLEdBQS9ELElBQWdFLENBQXhCLHVCQUF1Qjs7QUFDN0UsT0FBSSxZQUFZLEdBQUcsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFekQsT0FBSSxZQUFZLEVBQUU7O0FBRWhCLFlBQU8sbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7O0FBRzdDLGlCQUFZLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxrQkFBUSxFQUFJO0FBQzFDLDhCQUF1QixDQUFDLE1BQU0sQ0FBQyxFQUFDLFFBQVEsRUFBUixRQUFRLEVBQUUsWUFBWSxFQUFaLFlBQVksRUFBQyxDQUFDLENBQUM7TUFDMUQsQ0FBQyxDQUFDO0lBQ0o7RUFDRiIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDljNWZlMDdiMTdhZTg2YTBhN2E1XG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZ2V0SGFzaFBhcmFtcyAgICAgICAgICAgZnJvbSAnamF2YXNjcmlwdC9nZXRIYXNoUGFyYW1zJztcbmltcG9ydCBoYXNoQ2hhbmdlSGFuZGxlciAgICAgICBmcm9tICdqYXZhc2NyaXB0L2hhc2hDaGFuZ2VIYW5kbGVyJztcbmltcG9ydCBrZXlzV2l0aENoYW5nZWRWYWx1ZXMgICBmcm9tICdqYXZhc2NyaXB0L2tleXNXaXRoQ2hhbmdlZFZhbHVlcyc7XG5pbXBvcnQgc3Vic2NyaWJlICAgICAgICAgICAgICAgZnJvbSAnamF2YXNjcmlwdC9zdWJzY3JpYmUnO1xuaW1wb3J0IFN1YnNjcmlwdGlvbiAgICAgICAgICAgIGZyb20gJ2phdmFzY3JpcHQvU3Vic2NyaXB0aW9uJztcbmltcG9ydCBTdWJzY3JpcHRpb25zQnlQcm9wZXJ0eSBmcm9tICdqYXZhc2NyaXB0L3N1YnNjcmlwdGlvbnNCeVByb3BlcnR5JztcbmltcG9ydCBzdWJzY3JpcHRpb25zQnlVVUlEICAgICBmcm9tICdqYXZhc2NyaXB0L3N1YnNjcmlwdGlvbnNCeVVVSUQnO1xuaW1wb3J0IHVuc3Vic2NyaWJlICAgICAgICAgICAgIGZyb20gJ2phdmFzY3JpcHQvdW5zdWJzY3JpYmUnO1xuXG5sZXQgc3Vic2NyaXB0aW9uc0J5UHJvcGVydHkgPSBTdWJzY3JpcHRpb25zQnlQcm9wZXJ0eSgpO1xuXG4vKiBwcm9iYWJseSBzaG91bGQgbWlncmF0ZSB0aGlzIHRvIGEgZmFjdG9yeSBhdCBzb21lIHBvaW50IHRvIGF2b2lkIHBvc3NpYmxlIHNpbmdsZXRvbiBpc3N1ZXMgKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZW5zdXJlSW5pdGlhbGl6YXRpb24oKSB7XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbiAgfSxcbiAgaW5pdCgpIHtcbiAgICByZXR1cm4gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBldmVudCA9PiB7XG4gICAgICBoYXNoQ2hhbmdlSGFuZGxlcih7XG4gICAgICAgIGV2ZW50LFxuICAgICAgICBnZXRIYXNoUGFyYW1zLFxuICAgICAgICBrZXlzV2l0aENoYW5nZWRWYWx1ZXMsXG4gICAgICAgIHN1YnNjcmlwdGlvbnNCeVByb3BlcnR5LFxuICAgICAgICBzdWJzY3JpcHRpb25zQnlVVUlEXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcbiAgc3Vic2NyaWJlKHByb3BlcnRpZXMsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5lbnN1cmVJbml0aWFsaXphdGlvbigpO1xuXG4gICAgcmV0dXJuIHN1YnNjcmliZSh7XG4gICAgICBTdWJzY3JpcHRpb24sXG4gICAgICBzdWJzY3JpcHRpb25zQnlVVUlELFxuICAgICAgc3Vic2NyaXB0aW9uc0J5UHJvcGVydHksXG4gICAgICBwcm9wZXJ0aWVzLFxuICAgICAgY2FsbGJhY2tcbiAgICB9KTtcbiAgfSxcbiAgdW5zdWJzY3JpYmUoc3Vic2NyaXB0aW9uVVVJRCkge1xuICAgIHVuc3Vic2NyaWJlKHtcbiAgICAgIHN1YnNjcmlwdGlvblVVSUQsXG4gICAgICBzdWJzY3JpcHRpb25zQnlVVUlELFxuICAgICAgc3Vic2NyaXB0aW9uc0J5UHJvcGVydHlcbiAgICB9KTtcbiAgfVxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vamF2YXNjcmlwdC9hcGkuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydCBkZWZhdWx0ICh1cmwpID0+IHtcbiAgbGV0IFtfLCB1cmxIYXNoXSA9IHVybC5zcGxpdCgnIycpO1xuXG4gIHVybEhhc2ggPSB1cmxIYXNoIHx8ICcnO1xuICByZXR1cm4gdXJsSGFzaC5zcGxpdCgnJicpLnJlZHVjZSgoaGFzaCwga2V5VmFsdWVQYWlyKSA9PiB7XG4gICAgbGV0IFtrZXksIHZhbHVlXSA9IGtleVZhbHVlUGFpci5zcGxpdCgnPScpO1xuXG4gICAgaWYgKHZhbHVlIHx8ICFpc05hTih2YWx1ZSkpe1xuICAgICAgaWYoaXNOYU4odmFsdWUpKSB7XG4gICAgICAgIGhhc2hba2V5XSA9IHZhbHVlOyAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoYXNoW2tleV0gPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGtleS5sZW5ndGggPiAwKSB7XG4gICAgICBoYXNoW2tleV0gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBoYXNoO1xuICB9LCB7fSk7XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9qYXZhc2NyaXB0L2dldEhhc2hQYXJhbXMuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBpbnRlcnNlY3Rpb24gZnJvbSAnbG9kYXNoL2FycmF5L2ludGVyc2VjdGlvbic7XG5pbXBvcnQgZmxhdHRlbiBmcm9tICdsb2Rhc2gvYXJyYXkvZmxhdHRlbic7XG5pbXBvcnQgdW5pcXVlIGZyb20gJ2xvZGFzaC9hcnJheS9pbnRlcnNlY3Rpb24nO1xuXG4vKiBuZWVkcyBzdWJzY3JpcHRpb24gc2V0cyB0byBiZSBkZWZpbmVkIHNvbWV3aGVyZSAqL1xuLyogYW4gZXZlbnQgd2l0aCBhIHN1YnNjcmlwdGlvbiBzZXQgd2lsbCBvbmx5IGZpcmUgb25jZSAqL1xuLyogZm9yIGFsbCBvZiB0aGUgY2hhbmdlcyBpbiB0aGUgc2V0LiAqL1xuXG5leHBvcnQgZGVmYXVsdCAoe2dldEhhc2hQYXJhbXMsIHN1YnNjcmlwdGlvbnNCeVByb3BlcnR5LCBzdWJzY3JpcHRpb25zQnlVVUlELCBrZXlzV2l0aENoYW5nZWRWYWx1ZXMsIGV2ZW50fSkgPT4ge1xuICAvKiBnZXQgdGhlIG5ldyBwYXJhbXMgb2JqZWN0ICovXG4gIC8qIGdldCB0aGUgb2xkIHBhcmFtcyBvYmplY3QgKi9cbiAgbGV0IG9sZFBhcmFtcyA9IGdldEhhc2hQYXJhbXMoZXZlbnQub2xkVVJMKTtcbiAgbGV0IG5ld1BhcmFtcyA9IGdldEhhc2hQYXJhbXMoZXZlbnQubmV3VVJMKTtcblxuICBsZXQgc3Vic2NyaWJlZEtleXMgPSBPYmplY3Qua2V5cyhzdWJzY3JpcHRpb25zQnlQcm9wZXJ0eS5zdWJzY3JpcHRpb25zKTtcblxuICAvKiBpZGVudGlmeSB0aGUga2V5cyB3aXRoIGNoYW5nZWQgdmFsdWVzICovXG4gIGxldCBrZXlzV2l0aENoYW5nZXMgPSBrZXlzV2l0aENoYW5nZWRWYWx1ZXMob2xkUGFyYW1zLCBuZXdQYXJhbXMpO1xuXG4gIGxldCBrZXlzV2l0aFN1YnNjcmliZWRFdmVudHMgPSBpbnRlcnNlY3Rpb24oa2V5c1dpdGhDaGFuZ2VzLCBzdWJzY3JpYmVkS2V5cyk7XG5cbiAgLy8ga2V5c1dpdGhTdWJzY3JpYmVkRXZlbnRzLlxuICAvKiBsb29wIHRocm91Z2ggYWxsIG9mIHRoZSBzdWJzY3JpYmVkRXZlbnQgbmFtZXMgbG9va2luZyAqL1xuICAvKiBmb3IgZGlmZmVyZW5jZXMgYmV0d2VlbiBuZXdQYXJhbXMgYW5kIG9sZFBhcmFtcyAqL1xuICBsZXQgc3Vic2NyaXB0aW9uVVVJRHMgPSBrZXlzV2l0aFN1YnNjcmliZWRFdmVudHMubWFwKGtleSA9PiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHN1YnNjcmlwdGlvbnNCeVByb3BlcnR5LnN1YnNjcmlwdGlvbnNba2V5XSk7XG4gIH0pO1xuXG4gIHN1YnNjcmlwdGlvblVVSURzID0gdW5pcXVlKGZsYXR0ZW4oc3Vic2NyaXB0aW9uVVVJRHMpKTtcblxuICAvKiB0cmlnZ2VyIGV2ZW50cyBmb3IgZWFjaCBvZiB0aGUgZXZlbnRzIGZvdW5kICovXG5cbiAgbGV0IHN1YnNjcmlwdGlvbnMgPSBzdWJzY3JpcHRpb25VVUlEcy5tYXAoc3Vic2NyaXB0aW9uVVVJRCA9PiBzdWJzY3JpcHRpb25zQnlVVUlEW3N1YnNjcmlwdGlvblVVSURdKTtcblxuICBzdWJzY3JpcHRpb25zLmZvckVhY2goc3Vic2NyaXB0aW9uID0+IHsgc3Vic2NyaXB0aW9uLmNhbGxiYWNrKG5ld1BhcmFtcyk7IH0pO1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vamF2YXNjcmlwdC9oYXNoQ2hhbmdlSGFuZGxlci5qc1xuICoqLyIsInZhciBiYXNlSW5kZXhPZiA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2Jhc2VJbmRleE9mJyksXG4gICAgY2FjaGVJbmRleE9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvY2FjaGVJbmRleE9mJyksXG4gICAgY3JlYXRlQ2FjaGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9jcmVhdGVDYWNoZScpLFxuICAgIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNBcnJheUxpa2UnKSxcbiAgICByZXN0UGFyYW0gPSByZXF1aXJlKCcuLi9mdW5jdGlvbi9yZXN0UGFyYW0nKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHVuaXF1ZSB2YWx1ZXMgdGhhdCBhcmUgaW5jbHVkZWQgaW4gYWxsIG9mIHRoZSBwcm92aWRlZFxuICogYXJyYXlzIHVzaW5nIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBmb3IgZXF1YWxpdHkgY29tcGFyaXNvbnMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBBcnJheVxuICogQHBhcmFtIHsuLi5BcnJheX0gW2FycmF5c10gVGhlIGFycmF5cyB0byBpbnNwZWN0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgYXJyYXkgb2Ygc2hhcmVkIHZhbHVlcy5cbiAqIEBleGFtcGxlXG4gKiBfLmludGVyc2VjdGlvbihbMSwgMl0sIFs0LCAyXSwgWzIsIDFdKTtcbiAqIC8vID0+IFsyXVxuICovXG52YXIgaW50ZXJzZWN0aW9uID0gcmVzdFBhcmFtKGZ1bmN0aW9uKGFycmF5cykge1xuICB2YXIgb3RoTGVuZ3RoID0gYXJyYXlzLmxlbmd0aCxcbiAgICAgIG90aEluZGV4ID0gb3RoTGVuZ3RoLFxuICAgICAgY2FjaGVzID0gQXJyYXkobGVuZ3RoKSxcbiAgICAgIGluZGV4T2YgPSBiYXNlSW5kZXhPZixcbiAgICAgIGlzQ29tbW9uID0gdHJ1ZSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIHdoaWxlIChvdGhJbmRleC0tKSB7XG4gICAgdmFyIHZhbHVlID0gYXJyYXlzW290aEluZGV4XSA9IGlzQXJyYXlMaWtlKHZhbHVlID0gYXJyYXlzW290aEluZGV4XSkgPyB2YWx1ZSA6IFtdO1xuICAgIGNhY2hlc1tvdGhJbmRleF0gPSAoaXNDb21tb24gJiYgdmFsdWUubGVuZ3RoID49IDEyMCkgPyBjcmVhdGVDYWNoZShvdGhJbmRleCAmJiB2YWx1ZSkgOiBudWxsO1xuICB9XG4gIHZhciBhcnJheSA9IGFycmF5c1swXSxcbiAgICAgIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDAsXG4gICAgICBzZWVuID0gY2FjaGVzWzBdO1xuXG4gIG91dGVyOlxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgIGlmICgoc2VlbiA/IGNhY2hlSW5kZXhPZihzZWVuLCB2YWx1ZSkgOiBpbmRleE9mKHJlc3VsdCwgdmFsdWUsIDApKSA8IDApIHtcbiAgICAgIHZhciBvdGhJbmRleCA9IG90aExlbmd0aDtcbiAgICAgIHdoaWxlICgtLW90aEluZGV4KSB7XG4gICAgICAgIHZhciBjYWNoZSA9IGNhY2hlc1tvdGhJbmRleF07XG4gICAgICAgIGlmICgoY2FjaGUgPyBjYWNoZUluZGV4T2YoY2FjaGUsIHZhbHVlKSA6IGluZGV4T2YoYXJyYXlzW290aEluZGV4XSwgdmFsdWUsIDApKSA8IDApIHtcbiAgICAgICAgICBjb250aW51ZSBvdXRlcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHNlZW4pIHtcbiAgICAgICAgc2Vlbi5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGludGVyc2VjdGlvbjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9hcnJheS9pbnRlcnNlY3Rpb24uanNcbiAqKiBtb2R1bGUgaWQgPSAzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaW5kZXhPZk5hTiA9IHJlcXVpcmUoJy4vaW5kZXhPZk5hTicpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmluZGV4T2ZgIHdpdGhvdXQgc3VwcG9ydCBmb3IgYmluYXJ5IHNlYXJjaGVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAqIEBwYXJhbSB7bnVtYmVyfSBmcm9tSW5kZXggVGhlIGluZGV4IHRvIHNlYXJjaCBmcm9tLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUsIGVsc2UgYC0xYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUluZGV4T2YoYXJyYXksIHZhbHVlLCBmcm9tSW5kZXgpIHtcbiAgaWYgKHZhbHVlICE9PSB2YWx1ZSkge1xuICAgIHJldHVybiBpbmRleE9mTmFOKGFycmF5LCBmcm9tSW5kZXgpO1xuICB9XG4gIHZhciBpbmRleCA9IGZyb21JbmRleCAtIDEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoYXJyYXlbaW5kZXhdID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUluZGV4T2Y7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZUluZGV4T2YuanNcbiAqKiBtb2R1bGUgaWQgPSA0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEdldHMgdGhlIGluZGV4IGF0IHdoaWNoIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGBOYU5gIGlzIGZvdW5kIGluIGBhcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBzZWFyY2guXG4gKiBAcGFyYW0ge251bWJlcn0gZnJvbUluZGV4IFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgYE5hTmAsIGVsc2UgYC0xYC5cbiAqL1xuZnVuY3Rpb24gaW5kZXhPZk5hTihhcnJheSwgZnJvbUluZGV4LCBmcm9tUmlnaHQpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCxcbiAgICAgIGluZGV4ID0gZnJvbUluZGV4ICsgKGZyb21SaWdodCA/IDAgOiAtMSk7XG5cbiAgd2hpbGUgKChmcm9tUmlnaHQgPyBpbmRleC0tIDogKytpbmRleCA8IGxlbmd0aCkpIHtcbiAgICB2YXIgb3RoZXIgPSBhcnJheVtpbmRleF07XG4gICAgaWYgKG90aGVyICE9PSBvdGhlcikge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5kZXhPZk5hTjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9pbmRleE9mTmFOLmpzXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vbGFuZy9pc09iamVjdCcpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGluIGBjYWNoZWAgbWltaWNraW5nIHRoZSByZXR1cm4gc2lnbmF0dXJlIG9mXG4gKiBgXy5pbmRleE9mYCBieSByZXR1cm5pbmcgYDBgIGlmIHRoZSB2YWx1ZSBpcyBmb3VuZCwgZWxzZSBgLTFgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gY2FjaGUgVGhlIGNhY2hlIHRvIHNlYXJjaC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIGAwYCBpZiBgdmFsdWVgIGlzIGZvdW5kLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGNhY2hlSW5kZXhPZihjYWNoZSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSBjYWNoZS5kYXRhLFxuICAgICAgcmVzdWx0ID0gKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJyB8fCBpc09iamVjdCh2YWx1ZSkpID8gZGF0YS5zZXQuaGFzKHZhbHVlKSA6IGRhdGEuaGFzaFt2YWx1ZV07XG5cbiAgcmV0dXJuIHJlc3VsdCA/IDAgOiAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjYWNoZUluZGV4T2Y7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvY2FjaGVJbmRleE9mLmpzXG4gKiogbW9kdWxlIGlkID0gNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGUgW2xhbmd1YWdlIHR5cGVdKGh0dHBzOi8vZXM1LmdpdGh1Yi5pby8jeDgpIG9mIGBPYmplY3RgLlxuICogKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdCgxKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIC8vIEF2b2lkIGEgVjggSklUIGJ1ZyBpbiBDaHJvbWUgMTktMjAuXG4gIC8vIFNlZSBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MjI5MSBmb3IgbW9yZSBkZXRhaWxzLlxuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9sYW5nL2lzT2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIFNldENhY2hlID0gcmVxdWlyZSgnLi9TZXRDYWNoZScpLFxuICAgIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vZ2V0TmF0aXZlJyk7XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgU2V0ID0gZ2V0TmF0aXZlKGdsb2JhbCwgJ1NldCcpO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUNyZWF0ZSA9IGdldE5hdGl2ZShPYmplY3QsICdjcmVhdGUnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgYFNldGAgY2FjaGUgb2JqZWN0IHRvIG9wdGltaXplIGxpbmVhciBzZWFyY2hlcyBvZiBsYXJnZSBhcnJheXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFt2YWx1ZXNdIFRoZSB2YWx1ZXMgdG8gY2FjaGUuXG4gKiBAcmV0dXJucyB7bnVsbHxPYmplY3R9IFJldHVybnMgdGhlIG5ldyBjYWNoZSBvYmplY3QgaWYgYFNldGAgaXMgc3VwcG9ydGVkLCBlbHNlIGBudWxsYC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2FjaGUodmFsdWVzKSB7XG4gIHJldHVybiAobmF0aXZlQ3JlYXRlICYmIFNldCkgPyBuZXcgU2V0Q2FjaGUodmFsdWVzKSA6IG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQ2FjaGU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvY3JlYXRlQ2FjaGUuanNcbiAqKiBtb2R1bGUgaWQgPSA4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgY2FjaGVQdXNoID0gcmVxdWlyZSgnLi9jYWNoZVB1c2gnKSxcbiAgICBnZXROYXRpdmUgPSByZXF1aXJlKCcuL2dldE5hdGl2ZScpO1xuXG4vKiogTmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIFNldCA9IGdldE5hdGl2ZShnbG9iYWwsICdTZXQnKTtcblxuLyogTmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVDcmVhdGUgPSBnZXROYXRpdmUoT2JqZWN0LCAnY3JlYXRlJyk7XG5cbi8qKlxuICpcbiAqIENyZWF0ZXMgYSBjYWNoZSBvYmplY3QgdG8gc3RvcmUgdW5pcXVlIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW3ZhbHVlc10gVGhlIHZhbHVlcyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gU2V0Q2FjaGUodmFsdWVzKSB7XG4gIHZhciBsZW5ndGggPSB2YWx1ZXMgPyB2YWx1ZXMubGVuZ3RoIDogMDtcblxuICB0aGlzLmRhdGEgPSB7ICdoYXNoJzogbmF0aXZlQ3JlYXRlKG51bGwpLCAnc2V0JzogbmV3IFNldCB9O1xuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICB0aGlzLnB1c2godmFsdWVzW2xlbmd0aF0pO1xuICB9XG59XG5cbi8vIEFkZCBmdW5jdGlvbnMgdG8gdGhlIGBTZXRgIGNhY2hlLlxuU2V0Q2FjaGUucHJvdG90eXBlLnB1c2ggPSBjYWNoZVB1c2g7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0Q2FjaGU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvU2V0Q2FjaGUuanNcbiAqKiBtb2R1bGUgaWQgPSA5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9sYW5nL2lzT2JqZWN0Jyk7XG5cbi8qKlxuICogQWRkcyBgdmFsdWVgIHRvIHRoZSBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgcHVzaFxuICogQG1lbWJlck9mIFNldENhY2hlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gY2FjaGVQdXNoKHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnIHx8IGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIGRhdGEuc2V0LmFkZCh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgZGF0YS5oYXNoW3ZhbHVlXSA9IHRydWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjYWNoZVB1c2g7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvY2FjaGVQdXNoLmpzXG4gKiogbW9kdWxlIGlkID0gMTBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc05hdGl2ZSA9IHJlcXVpcmUoJy4uL2xhbmcvaXNOYXRpdmUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIHJldHVybiBpc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXROYXRpdmU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvZ2V0TmF0aXZlLmpzXG4gKiogbW9kdWxlIGlkID0gMTFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpID4gNSkuICovXG52YXIgcmVJc0hvc3RDdG9yID0gL15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmblRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZm5Ub1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KS5yZXBsYWNlKC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZywgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc05hdGl2ZShBcnJheS5wcm90b3R5cGUucHVzaCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc05hdGl2ZShfKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTmF0aXZlKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHJldHVybiByZUlzTmF0aXZlLnRlc3QoZm5Ub1N0cmluZy5jYWxsKHZhbHVlKSk7XG4gIH1cbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgcmVJc0hvc3RDdG9yLnRlc3QodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTmF0aXZlO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2xhbmcvaXNOYXRpdmUuanNcbiAqKiBtb2R1bGUgaWQgPSAxMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmpUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaSB3aGljaCByZXR1cm4gJ2Z1bmN0aW9uJyBmb3IgcmVnZXhlc1xuICAvLyBhbmQgU2FmYXJpIDggd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXkgY29uc3RydWN0b3JzLlxuICByZXR1cm4gaXNPYmplY3QodmFsdWUpICYmIG9ialRvU3RyaW5nLmNhbGwodmFsdWUpID09IGZ1bmNUYWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9sYW5nL2lzRnVuY3Rpb24uanNcbiAqKiBtb2R1bGUgaWQgPSAxM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9pc09iamVjdExpa2UuanNcbiAqKiBtb2R1bGUgaWQgPSAxNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdldExlbmd0aCA9IHJlcXVpcmUoJy4vZ2V0TGVuZ3RoJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKGdldExlbmd0aCh2YWx1ZSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXlMaWtlO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2ludGVybmFsL2lzQXJyYXlMaWtlLmpzXG4gKiogbW9kdWxlIGlkID0gMTVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBiYXNlUHJvcGVydHkgPSByZXF1aXJlKCcuL2Jhc2VQcm9wZXJ0eScpO1xuXG4vKipcbiAqIEdldHMgdGhlIFwibGVuZ3RoXCIgcHJvcGVydHkgdmFsdWUgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBhdm9pZCBhIFtKSVQgYnVnXShodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTQyNzkyKVxuICogdGhhdCBhZmZlY3RzIFNhZmFyaSBvbiBhdCBsZWFzdCBpT1MgOC4xLTguMyBBUk02NC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIFwibGVuZ3RoXCIgdmFsdWUuXG4gKi9cbnZhciBnZXRMZW5ndGggPSBiYXNlUHJvcGVydHkoJ2xlbmd0aCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldExlbmd0aDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9nZXRMZW5ndGguanNcbiAqKiBtb2R1bGUgaWQgPSAxNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5wcm9wZXJ0eWAgd2l0aG91dCBzdXBwb3J0IGZvciBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUHJvcGVydHkoa2V5KSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlUHJvcGVydHk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZVByb3BlcnR5LmpzXG4gKiogbW9kdWxlIGlkID0gMTdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogVXNlZCBhcyB0aGUgW21heGltdW0gbGVuZ3RoXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1udW1iZXIubWF4X3NhZmVfaW50ZWdlcilcbiAqIG9mIGFuIGFycmF5LWxpa2UgdmFsdWUuXG4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgbGVuZ3RoLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIGlzIGJhc2VkIG9uIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJiB2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDw9IE1BWF9TQUZFX0lOVEVHRVI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNMZW5ndGg7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvaXNMZW5ndGguanNcbiAqKiBtb2R1bGUgaWQgPSAxOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qIE5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlXG4gKiBjcmVhdGVkIGZ1bmN0aW9uIGFuZCBhcmd1bWVudHMgZnJvbSBgc3RhcnRgIGFuZCBiZXlvbmQgcHJvdmlkZWQgYXMgYW4gYXJyYXkuXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGJhc2VkIG9uIHRoZSBbcmVzdCBwYXJhbWV0ZXJdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9GdW5jdGlvbnMvcmVzdF9wYXJhbWV0ZXJzKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBzYXkgPSBfLnJlc3RQYXJhbShmdW5jdGlvbih3aGF0LCBuYW1lcykge1xuICogICByZXR1cm4gd2hhdCArICcgJyArIF8uaW5pdGlhbChuYW1lcykuam9pbignLCAnKSArXG4gKiAgICAgKF8uc2l6ZShuYW1lcykgPiAxID8gJywgJiAnIDogJycpICsgXy5sYXN0KG5hbWVzKTtcbiAqIH0pO1xuICpcbiAqIHNheSgnaGVsbG8nLCAnZnJlZCcsICdiYXJuZXknLCAncGViYmxlcycpO1xuICogLy8gPT4gJ2hlbGxvIGZyZWQsIGJhcm5leSwgJiBwZWJibGVzJ1xuICovXG5mdW5jdGlvbiByZXN0UGFyYW0oZnVuYywgc3RhcnQpIHtcbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgc3RhcnQgPSBuYXRpdmVNYXgoc3RhcnQgPT09IHVuZGVmaW5lZCA/IChmdW5jLmxlbmd0aCAtIDEpIDogKCtzdGFydCB8fCAwKSwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICByZXN0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICByZXN0W2luZGV4XSA9IGFyZ3Nbc3RhcnQgKyBpbmRleF07XG4gICAgfVxuICAgIHN3aXRjaCAoc3RhcnQpIHtcbiAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmdzWzBdLCByZXN0KTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmdzWzBdLCBhcmdzWzFdLCByZXN0KTtcbiAgICB9XG4gICAgdmFyIG90aGVyQXJncyA9IEFycmF5KHN0YXJ0ICsgMSk7XG4gICAgaW5kZXggPSAtMTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSByZXN0O1xuICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIG90aGVyQXJncyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzdFBhcmFtO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2Z1bmN0aW9uL3Jlc3RQYXJhbS5qc1xuICoqIG1vZHVsZSBpZCA9IDE5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZUZsYXR0ZW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9iYXNlRmxhdHRlbicpLFxuICAgIGlzSXRlcmF0ZWVDYWxsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNJdGVyYXRlZUNhbGwnKTtcblxuLyoqXG4gKiBGbGF0dGVucyBhIG5lc3RlZCBhcnJheS4gSWYgYGlzRGVlcGAgaXMgYHRydWVgIHRoZSBhcnJheSBpcyByZWN1cnNpdmVseVxuICogZmxhdHRlbmVkLCBvdGhlcndpc2UgaXQncyBvbmx5IGZsYXR0ZW5lZCBhIHNpbmdsZSBsZXZlbC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IEFycmF5XG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gZmxhdHRlbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgZmxhdHRlbi5cbiAqIEBwYXJhbS0ge09iamVjdH0gW2d1YXJkXSBFbmFibGVzIHVzZSBhcyBhIGNhbGxiYWNrIGZvciBmdW5jdGlvbnMgbGlrZSBgXy5tYXBgLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZmxhdHRlbmVkIGFycmF5LlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmZsYXR0ZW4oWzEsIFsyLCAzLCBbNF1dXSk7XG4gKiAvLyA9PiBbMSwgMiwgMywgWzRdXVxuICpcbiAqIC8vIHVzaW5nIGBpc0RlZXBgXG4gKiBfLmZsYXR0ZW4oWzEsIFsyLCAzLCBbNF1dXSwgdHJ1ZSk7XG4gKiAvLyA9PiBbMSwgMiwgMywgNF1cbiAqL1xuZnVuY3Rpb24gZmxhdHRlbihhcnJheSwgaXNEZWVwLCBndWFyZCkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICBpZiAoZ3VhcmQgJiYgaXNJdGVyYXRlZUNhbGwoYXJyYXksIGlzRGVlcCwgZ3VhcmQpKSB7XG4gICAgaXNEZWVwID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGxlbmd0aCA/IGJhc2VGbGF0dGVuKGFycmF5LCBpc0RlZXApIDogW107XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmxhdHRlbjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9hcnJheS9mbGF0dGVuLmpzXG4gKiogbW9kdWxlIGlkID0gMjBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBhcnJheVB1c2ggPSByZXF1aXJlKCcuL2FycmF5UHVzaCcpLFxuICAgIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi4vbGFuZy9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9sYW5nL2lzQXJyYXknKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZsYXR0ZW5gIHdpdGggYWRkZWQgc3VwcG9ydCBmb3IgcmVzdHJpY3RpbmdcbiAqIGZsYXR0ZW5pbmcgYW5kIHNwZWNpZnlpbmcgdGhlIHN0YXJ0IGluZGV4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gZmxhdHRlbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgZmxhdHRlbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU3RyaWN0XSBSZXN0cmljdCBmbGF0dGVuaW5nIHRvIGFycmF5cy1saWtlIG9iamVjdHMuXG4gKiBAcGFyYW0ge0FycmF5fSBbcmVzdWx0PVtdXSBUaGUgaW5pdGlhbCByZXN1bHQgdmFsdWUuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBmbGF0dGVuZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGbGF0dGVuKGFycmF5LCBpc0RlZXAsIGlzU3RyaWN0LCByZXN1bHQpIHtcbiAgcmVzdWx0IHx8IChyZXN1bHQgPSBbXSk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XG4gICAgaWYgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaXNBcnJheUxpa2UodmFsdWUpICYmXG4gICAgICAgIChpc1N0cmljdCB8fCBpc0FycmF5KHZhbHVlKSB8fCBpc0FyZ3VtZW50cyh2YWx1ZSkpKSB7XG4gICAgICBpZiAoaXNEZWVwKSB7XG4gICAgICAgIC8vIFJlY3Vyc2l2ZWx5IGZsYXR0ZW4gYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgICAgIGJhc2VGbGF0dGVuKHZhbHVlLCBpc0RlZXAsIGlzU3RyaWN0LCByZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJyYXlQdXNoKHJlc3VsdCwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIWlzU3RyaWN0KSB7XG4gICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aF0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlRmxhdHRlbjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9iYXNlRmxhdHRlbi5qc1xuICoqIG1vZHVsZSBpZCA9IDIxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEFwcGVuZHMgdGhlIGVsZW1lbnRzIG9mIGB2YWx1ZXNgIHRvIGBhcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0FycmF5fSB2YWx1ZXMgVGhlIHZhbHVlcyB0byBhcHBlbmQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlQdXNoKGFycmF5LCB2YWx1ZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSB2YWx1ZXMubGVuZ3RoLFxuICAgICAgb2Zmc2V0ID0gYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgYXJyYXlbb2Zmc2V0ICsgaW5kZXhdID0gdmFsdWVzW2luZGV4XTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlQdXNoO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2ludGVybmFsL2FycmF5UHVzaC5qc1xuICoqIG1vZHVsZSBpZCA9IDIyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc0FycmF5TGlrZScpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIE5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGlzQXJyYXlMaWtlKHZhbHVlKSAmJlxuICAgIGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdjYWxsZWUnKSAmJiAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJndW1lbnRzO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2xhbmcvaXNBcmd1bWVudHMuanNcbiAqKiBtb2R1bGUgaWQgPSAyM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2dldE5hdGl2ZScpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNMZW5ndGgnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZSBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9ialRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qIE5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlSXNBcnJheSA9IGdldE5hdGl2ZShBcnJheSwgJ2lzQXJyYXknKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiBvYmpUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBhcnJheVRhZztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9sYW5nL2lzQXJyYXkuanNcbiAqKiBtb2R1bGUgaWQgPSAyNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZScpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuL2lzSW5kZXgnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2xhbmcvaXNPYmplY3QnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIHByb3ZpZGVkIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgdmFsdWUgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGluZGV4IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgaW5kZXggb3Iga2V5IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBvYmplY3QgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBvYmplY3QgYXJndW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSXRlcmF0ZWVDYWxsKHZhbHVlLCBpbmRleCwgb2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdHlwZSA9IHR5cGVvZiBpbmRleDtcbiAgaWYgKHR5cGUgPT0gJ251bWJlcidcbiAgICAgID8gKGlzQXJyYXlMaWtlKG9iamVjdCkgJiYgaXNJbmRleChpbmRleCwgb2JqZWN0Lmxlbmd0aCkpXG4gICAgICA6ICh0eXBlID09ICdzdHJpbmcnICYmIGluZGV4IGluIG9iamVjdCkpIHtcbiAgICB2YXIgb3RoZXIgPSBvYmplY3RbaW5kZXhdO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdmFsdWUgPyAodmFsdWUgPT09IG90aGVyKSA6IChvdGhlciAhPT0gb3RoZXIpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0l0ZXJhdGVlQ2FsbDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9pc0l0ZXJhdGVlQ2FsbC5qc1xuICoqIG1vZHVsZSBpZCA9IDI1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG52YXIgcmVJc1VpbnQgPSAvXlxcZCskLztcblxuLyoqXG4gKiBVc2VkIGFzIHRoZSBbbWF4aW11bSBsZW5ndGhdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW51bWJlci5tYXhfc2FmZV9pbnRlZ2VyKVxuICogb2YgYW4gYXJyYXktbGlrZSB2YWx1ZS5cbiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICB2YWx1ZSA9ICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgfHwgcmVJc1VpbnQudGVzdCh2YWx1ZSkpID8gK3ZhbHVlIDogLTE7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcbiAgcmV0dXJuIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPCBsZW5ndGg7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJbmRleDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9pc0luZGV4LmpzXG4gKiogbW9kdWxlIGlkID0gMjZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHVuaXF1ZSBmcm9tICdsb2Rhc2gvYXJyYXkvdW5pcXVlJztcblxuZXhwb3J0IGRlZmF1bHQgKG9sZFBhcmFtcywgbmV3UGFyYW1zKSA9PiB7XG4gIGxldCBvbGRLZXlzID0gT2JqZWN0LmtleXMob2xkUGFyYW1zKTtcbiAgbGV0IG5ld0tleXMgPSBPYmplY3Qua2V5cyhuZXdQYXJhbXMpO1xuXG4gIGxldCBhbGxLZXlzID0gdW5pcXVlKG9sZEtleXMuY29uY2F0KG5ld0tleXMpKTtcblxuICByZXR1cm4gYWxsS2V5cy5maWx0ZXIoa2V5ID0+IHtcbiAgICBsZXQgb2xkVmFsdWUgPSBvbGRQYXJhbXNba2V5XTtcbiAgICBsZXQgbmV3VmFsdWUgPSBuZXdQYXJhbXNba2V5XTtcblxuICAgIC8qIGhhbmRsZSBOYU4gKi9cbiAgICBpZiAob2xkVmFsdWUgIT09IG9sZFZhbHVlICYmIG5ld1ZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgLyogYm90aCBvbGRWYWx1ZSBhbmQgbmV3VmFsdWUgZXF1YWwgTmFOICovXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9sZFZhbHVlICE9PSBuZXdWYWx1ZTtcbiAgfSk7XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9qYXZhc2NyaXB0L2tleXNXaXRoQ2hhbmdlZFZhbHVlcy5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi91bmlxJyk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvYXJyYXkvdW5pcXVlLmpzXG4gKiogbW9kdWxlIGlkID0gMjhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBiYXNlQ2FsbGJhY2sgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9iYXNlQ2FsbGJhY2snKSxcbiAgICBiYXNlVW5pcSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2Jhc2VVbmlxJyksXG4gICAgaXNJdGVyYXRlZUNhbGwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc0l0ZXJhdGVlQ2FsbCcpLFxuICAgIHNvcnRlZFVuaXEgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9zb3J0ZWRVbmlxJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgYW4gYXJyYXksIHVzaW5nXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogZm9yIGVxdWFsaXR5IGNvbXBhcmlzb25zLCBpbiB3aGljaCBvbmx5IHRoZSBmaXJzdCBvY2N1cmVuY2Ugb2YgZWFjaCBlbGVtZW50XG4gKiBpcyBrZXB0LiBQcm92aWRpbmcgYHRydWVgIGZvciBgaXNTb3J0ZWRgIHBlcmZvcm1zIGEgZmFzdGVyIHNlYXJjaCBhbGdvcml0aG1cbiAqIGZvciBzb3J0ZWQgYXJyYXlzLiBJZiBhbiBpdGVyYXRlZSBmdW5jdGlvbiBpcyBwcm92aWRlZCBpdCdzIGludm9rZWQgZm9yXG4gKiBlYWNoIGVsZW1lbnQgaW4gdGhlIGFycmF5IHRvIGdlbmVyYXRlIHRoZSBjcml0ZXJpb24gYnkgd2hpY2ggdW5pcXVlbmVzc1xuICogaXMgY29tcHV0ZWQuIFRoZSBgaXRlcmF0ZWVgIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlXG4gKiBhcmd1bWVudHM6ICh2YWx1ZSwgaW5kZXgsIGFycmF5KS5cbiAqXG4gKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBpdGVyYXRlZWAgdGhlIGNyZWF0ZWQgYF8ucHJvcGVydHlgXG4gKiBzdHlsZSBjYWxsYmFjayByZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAqXG4gKiBJZiBhIHZhbHVlIGlzIGFsc28gcHJvdmlkZWQgZm9yIGB0aGlzQXJnYCB0aGUgY3JlYXRlZCBgXy5tYXRjaGVzUHJvcGVydHlgXG4gKiBzdHlsZSBjYWxsYmFjayByZXR1cm5zIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIGEgbWF0Y2hpbmcgcHJvcGVydHlcbiAqIHZhbHVlLCBlbHNlIGBmYWxzZWAuXG4gKlxuICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgaXRlcmF0ZWVgIHRoZSBjcmVhdGVkIGBfLm1hdGNoZXNgIHN0eWxlXG4gKiBjYWxsYmFjayByZXR1cm5zIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlblxuICogb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBhbGlhcyB1bmlxdWVcbiAqIEBjYXRlZ29yeSBBcnJheVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1NvcnRlZF0gU3BlY2lmeSB0aGUgYXJyYXkgaXMgc29ydGVkLlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbaXRlcmF0ZWVdIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGl0ZXJhdGVlYC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGR1cGxpY2F0ZS12YWx1ZS1mcmVlIGFycmF5LlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnVuaXEoWzIsIDEsIDJdKTtcbiAqIC8vID0+IFsyLCAxXVxuICpcbiAqIC8vIHVzaW5nIGBpc1NvcnRlZGBcbiAqIF8udW5pcShbMSwgMSwgMl0sIHRydWUpO1xuICogLy8gPT4gWzEsIDJdXG4gKlxuICogLy8gdXNpbmcgYW4gaXRlcmF0ZWUgZnVuY3Rpb25cbiAqIF8udW5pcShbMSwgMi41LCAxLjUsIDJdLCBmdW5jdGlvbihuKSB7XG4gKiAgIHJldHVybiB0aGlzLmZsb29yKG4pO1xuICogfSwgTWF0aCk7XG4gKiAvLyA9PiBbMSwgMi41XVxuICpcbiAqIC8vIHVzaW5nIHRoZSBgXy5wcm9wZXJ0eWAgY2FsbGJhY2sgc2hvcnRoYW5kXG4gKiBfLnVuaXEoW3sgJ3gnOiAxIH0sIHsgJ3gnOiAyIH0sIHsgJ3gnOiAxIH1dLCAneCcpO1xuICogLy8gPT4gW3sgJ3gnOiAxIH0sIHsgJ3gnOiAyIH1dXG4gKi9cbmZ1bmN0aW9uIHVuaXEoYXJyYXksIGlzU29ydGVkLCBpdGVyYXRlZSwgdGhpc0FyZykge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICBpZiAoIWxlbmd0aCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBpZiAoaXNTb3J0ZWQgIT0gbnVsbCAmJiB0eXBlb2YgaXNTb3J0ZWQgIT0gJ2Jvb2xlYW4nKSB7XG4gICAgdGhpc0FyZyA9IGl0ZXJhdGVlO1xuICAgIGl0ZXJhdGVlID0gaXNJdGVyYXRlZUNhbGwoYXJyYXksIGlzU29ydGVkLCB0aGlzQXJnKSA/IHVuZGVmaW5lZCA6IGlzU29ydGVkO1xuICAgIGlzU29ydGVkID0gZmFsc2U7XG4gIH1cbiAgaXRlcmF0ZWUgPSBpdGVyYXRlZSA9PSBudWxsID8gaXRlcmF0ZWUgOiBiYXNlQ2FsbGJhY2soaXRlcmF0ZWUsIHRoaXNBcmcsIDMpO1xuICByZXR1cm4gKGlzU29ydGVkKVxuICAgID8gc29ydGVkVW5pcShhcnJheSwgaXRlcmF0ZWUpXG4gICAgOiBiYXNlVW5pcShhcnJheSwgaXRlcmF0ZWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVuaXE7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvYXJyYXkvdW5pcS5qc1xuICoqIG1vZHVsZSBpZCA9IDI5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZU1hdGNoZXMgPSByZXF1aXJlKCcuL2Jhc2VNYXRjaGVzJyksXG4gICAgYmFzZU1hdGNoZXNQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vYmFzZU1hdGNoZXNQcm9wZXJ0eScpLFxuICAgIGJpbmRDYWxsYmFjayA9IHJlcXVpcmUoJy4vYmluZENhbGxiYWNrJyksXG4gICAgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi91dGlsaXR5L2lkZW50aXR5JyksXG4gICAgcHJvcGVydHkgPSByZXF1aXJlKCcuLi91dGlsaXR5L3Byb3BlcnR5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY2FsbGJhY2tgIHdoaWNoIHN1cHBvcnRzIHNwZWNpZnlpbmcgdGhlXG4gKiBudW1iZXIgb2YgYXJndW1lbnRzIHRvIHByb3ZpZGUgdG8gYGZ1bmNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IFtmdW5jPV8uaWRlbnRpdHldIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGEgY2FsbGJhY2suXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtudW1iZXJ9IFthcmdDb3VudF0gVGhlIG51bWJlciBvZiBhcmd1bWVudHMgdG8gcHJvdmlkZSB0byBgZnVuY2AuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiBiYXNlQ2FsbGJhY2soZnVuYywgdGhpc0FyZywgYXJnQ291bnQpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgZnVuYztcbiAgaWYgKHR5cGUgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB0aGlzQXJnID09PSB1bmRlZmluZWRcbiAgICAgID8gZnVuY1xuICAgICAgOiBiaW5kQ2FsbGJhY2soZnVuYywgdGhpc0FyZywgYXJnQ291bnQpO1xuICB9XG4gIGlmIChmdW5jID09IG51bGwpIHtcbiAgICByZXR1cm4gaWRlbnRpdHk7XG4gIH1cbiAgaWYgKHR5cGUgPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gYmFzZU1hdGNoZXMoZnVuYyk7XG4gIH1cbiAgcmV0dXJuIHRoaXNBcmcgPT09IHVuZGVmaW5lZFxuICAgID8gcHJvcGVydHkoZnVuYylcbiAgICA6IGJhc2VNYXRjaGVzUHJvcGVydHkoZnVuYywgdGhpc0FyZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNhbGxiYWNrO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2ludGVybmFsL2Jhc2VDYWxsYmFjay5qc1xuICoqIG1vZHVsZSBpZCA9IDMwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZUlzTWF0Y2ggPSByZXF1aXJlKCcuL2Jhc2VJc01hdGNoJyksXG4gICAgZ2V0TWF0Y2hEYXRhID0gcmVxdWlyZSgnLi9nZXRNYXRjaERhdGEnKSxcbiAgICB0b09iamVjdCA9IHJlcXVpcmUoJy4vdG9PYmplY3QnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5tYXRjaGVzYCB3aGljaCBkb2VzIG5vdCBjbG9uZSBgc291cmNlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IG9mIHByb3BlcnR5IHZhbHVlcyB0byBtYXRjaC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlTWF0Y2hlcyhzb3VyY2UpIHtcbiAgdmFyIG1hdGNoRGF0YSA9IGdldE1hdGNoRGF0YShzb3VyY2UpO1xuICBpZiAobWF0Y2hEYXRhLmxlbmd0aCA9PSAxICYmIG1hdGNoRGF0YVswXVsyXSkge1xuICAgIHZhciBrZXkgPSBtYXRjaERhdGFbMF1bMF0sXG4gICAgICAgIHZhbHVlID0gbWF0Y2hEYXRhWzBdWzFdO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmplY3Rba2V5XSA9PT0gdmFsdWUgJiYgKHZhbHVlICE9PSB1bmRlZmluZWQgfHwgKGtleSBpbiB0b09iamVjdChvYmplY3QpKSk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIGJhc2VJc01hdGNoKG9iamVjdCwgbWF0Y2hEYXRhKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlTWF0Y2hlcztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9iYXNlTWF0Y2hlcy5qc1xuICoqIG1vZHVsZSBpZCA9IDMxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZUlzRXF1YWwgPSByZXF1aXJlKCcuL2Jhc2VJc0VxdWFsJyksXG4gICAgdG9PYmplY3QgPSByZXF1aXJlKCcuL3RvT2JqZWN0Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNNYXRjaGAgd2l0aG91dCBzdXBwb3J0IGZvciBjYWxsYmFja1xuICogc2hvcnRoYW5kcyBhbmQgYHRoaXNgIGJpbmRpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICogQHBhcmFtIHtBcnJheX0gbWF0Y2hEYXRhIFRoZSBwcm9wZXJ5IG5hbWVzLCB2YWx1ZXMsIGFuZCBjb21wYXJlIGZsYWdzIHRvIG1hdGNoLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYG9iamVjdGAgaXMgYSBtYXRjaCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNNYXRjaChvYmplY3QsIG1hdGNoRGF0YSwgY3VzdG9taXplcikge1xuICB2YXIgaW5kZXggPSBtYXRjaERhdGEubGVuZ3RoLFxuICAgICAgbGVuZ3RoID0gaW5kZXgsXG4gICAgICBub0N1c3RvbWl6ZXIgPSAhY3VzdG9taXplcjtcblxuICBpZiAob2JqZWN0ID09IG51bGwpIHtcbiAgICByZXR1cm4gIWxlbmd0aDtcbiAgfVxuICBvYmplY3QgPSB0b09iamVjdChvYmplY3QpO1xuICB3aGlsZSAoaW5kZXgtLSkge1xuICAgIHZhciBkYXRhID0gbWF0Y2hEYXRhW2luZGV4XTtcbiAgICBpZiAoKG5vQ3VzdG9taXplciAmJiBkYXRhWzJdKVxuICAgICAgICAgID8gZGF0YVsxXSAhPT0gb2JqZWN0W2RhdGFbMF1dXG4gICAgICAgICAgOiAhKGRhdGFbMF0gaW4gb2JqZWN0KVxuICAgICAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBkYXRhID0gbWF0Y2hEYXRhW2luZGV4XTtcbiAgICB2YXIga2V5ID0gZGF0YVswXSxcbiAgICAgICAgb2JqVmFsdWUgPSBvYmplY3Rba2V5XSxcbiAgICAgICAgc3JjVmFsdWUgPSBkYXRhWzFdO1xuXG4gICAgaWYgKG5vQ3VzdG9taXplciAmJiBkYXRhWzJdKSB7XG4gICAgICBpZiAob2JqVmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlc3VsdCA9IGN1c3RvbWl6ZXIgPyBjdXN0b21pemVyKG9ialZhbHVlLCBzcmNWYWx1ZSwga2V5KSA6IHVuZGVmaW5lZDtcbiAgICAgIGlmICghKHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gYmFzZUlzRXF1YWwoc3JjVmFsdWUsIG9ialZhbHVlLCBjdXN0b21pemVyLCB0cnVlKSA6IHJlc3VsdCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNNYXRjaDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9iYXNlSXNNYXRjaC5qc1xuICoqIG1vZHVsZSBpZCA9IDMyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZUlzRXF1YWxEZWVwID0gcmVxdWlyZSgnLi9iYXNlSXNFcXVhbERlZXAnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2xhbmcvaXNPYmplY3QnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzRXF1YWxgIHdpdGhvdXQgc3VwcG9ydCBmb3IgYHRoaXNgIGJpbmRpbmdcbiAqIGBjdXN0b21pemVyYCBmdW5jdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzTG9vc2VdIFNwZWNpZnkgcGVyZm9ybWluZyBwYXJ0aWFsIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQV0gVHJhY2tzIHRyYXZlcnNlZCBgdmFsdWVgIG9iamVjdHMuXG4gKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tCXSBUcmFja3MgdHJhdmVyc2VkIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0VxdWFsKHZhbHVlLCBvdGhlciwgY3VzdG9taXplciwgaXNMb29zZSwgc3RhY2tBLCBzdGFja0IpIHtcbiAgaWYgKHZhbHVlID09PSBvdGhlcikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICh2YWx1ZSA9PSBudWxsIHx8IG90aGVyID09IG51bGwgfHwgKCFpc09iamVjdCh2YWx1ZSkgJiYgIWlzT2JqZWN0TGlrZShvdGhlcikpKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSB2YWx1ZSAmJiBvdGhlciAhPT0gb3RoZXI7XG4gIH1cbiAgcmV0dXJuIGJhc2VJc0VxdWFsRGVlcCh2YWx1ZSwgb3RoZXIsIGJhc2VJc0VxdWFsLCBjdXN0b21pemVyLCBpc0xvb3NlLCBzdGFja0EsIHN0YWNrQik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzRXF1YWw7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZUlzRXF1YWwuanNcbiAqKiBtb2R1bGUgaWQgPSAzM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGVxdWFsQXJyYXlzID0gcmVxdWlyZSgnLi9lcXVhbEFycmF5cycpLFxuICAgIGVxdWFsQnlUYWcgPSByZXF1aXJlKCcuL2VxdWFsQnlUYWcnKSxcbiAgICBlcXVhbE9iamVjdHMgPSByZXF1aXJlKCcuL2VxdWFsT2JqZWN0cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9sYW5nL2lzQXJyYXknKSxcbiAgICBpc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuLi9sYW5nL2lzVHlwZWRBcnJheScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZSBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9ialRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbGAgZm9yIGFycmF5cyBhbmQgb2JqZWN0cyB3aGljaCBwZXJmb3Jtc1xuICogZGVlcCBjb21wYXJpc29ucyBhbmQgdHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzIGVuYWJsaW5nIG9iamVjdHMgd2l0aCBjaXJjdWxhclxuICogcmVmZXJlbmNlcyB0byBiZSBjb21wYXJlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIG9iamVjdHMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0xvb3NlXSBTcGVjaWZ5IHBlcmZvcm1pbmcgcGFydGlhbCBjb21wYXJpc29ucy5cbiAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0E9W11dIFRyYWNrcyB0cmF2ZXJzZWQgYHZhbHVlYCBvYmplY3RzLlxuICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQj1bXV0gVHJhY2tzIHRyYXZlcnNlZCBgb3RoZXJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzRXF1YWxEZWVwKG9iamVjdCwgb3RoZXIsIGVxdWFsRnVuYywgY3VzdG9taXplciwgaXNMb29zZSwgc3RhY2tBLCBzdGFja0IpIHtcbiAgdmFyIG9iaklzQXJyID0gaXNBcnJheShvYmplY3QpLFxuICAgICAgb3RoSXNBcnIgPSBpc0FycmF5KG90aGVyKSxcbiAgICAgIG9ialRhZyA9IGFycmF5VGFnLFxuICAgICAgb3RoVGFnID0gYXJyYXlUYWc7XG5cbiAgaWYgKCFvYmpJc0Fycikge1xuICAgIG9ialRhZyA9IG9ialRvU3RyaW5nLmNhbGwob2JqZWN0KTtcbiAgICBpZiAob2JqVGFnID09IGFyZ3NUYWcpIHtcbiAgICAgIG9ialRhZyA9IG9iamVjdFRhZztcbiAgICB9IGVsc2UgaWYgKG9ialRhZyAhPSBvYmplY3RUYWcpIHtcbiAgICAgIG9iaklzQXJyID0gaXNUeXBlZEFycmF5KG9iamVjdCk7XG4gICAgfVxuICB9XG4gIGlmICghb3RoSXNBcnIpIHtcbiAgICBvdGhUYWcgPSBvYmpUb1N0cmluZy5jYWxsKG90aGVyKTtcbiAgICBpZiAob3RoVGFnID09IGFyZ3NUYWcpIHtcbiAgICAgIG90aFRhZyA9IG9iamVjdFRhZztcbiAgICB9IGVsc2UgaWYgKG90aFRhZyAhPSBvYmplY3RUYWcpIHtcbiAgICAgIG90aElzQXJyID0gaXNUeXBlZEFycmF5KG90aGVyKTtcbiAgICB9XG4gIH1cbiAgdmFyIG9iaklzT2JqID0gb2JqVGFnID09IG9iamVjdFRhZyxcbiAgICAgIG90aElzT2JqID0gb3RoVGFnID09IG9iamVjdFRhZyxcbiAgICAgIGlzU2FtZVRhZyA9IG9ialRhZyA9PSBvdGhUYWc7XG5cbiAgaWYgKGlzU2FtZVRhZyAmJiAhKG9iaklzQXJyIHx8IG9iaklzT2JqKSkge1xuICAgIHJldHVybiBlcXVhbEJ5VGFnKG9iamVjdCwgb3RoZXIsIG9ialRhZyk7XG4gIH1cbiAgaWYgKCFpc0xvb3NlKSB7XG4gICAgdmFyIG9iaklzV3JhcHBlZCA9IG9iaklzT2JqICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnX193cmFwcGVkX18nKSxcbiAgICAgICAgb3RoSXNXcmFwcGVkID0gb3RoSXNPYmogJiYgaGFzT3duUHJvcGVydHkuY2FsbChvdGhlciwgJ19fd3JhcHBlZF9fJyk7XG5cbiAgICBpZiAob2JqSXNXcmFwcGVkIHx8IG90aElzV3JhcHBlZCkge1xuICAgICAgcmV0dXJuIGVxdWFsRnVuYyhvYmpJc1dyYXBwZWQgPyBvYmplY3QudmFsdWUoKSA6IG9iamVjdCwgb3RoSXNXcmFwcGVkID8gb3RoZXIudmFsdWUoKSA6IG90aGVyLCBjdXN0b21pemVyLCBpc0xvb3NlLCBzdGFja0EsIHN0YWNrQik7XG4gICAgfVxuICB9XG4gIGlmICghaXNTYW1lVGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIEFzc3VtZSBjeWNsaWMgdmFsdWVzIGFyZSBlcXVhbC5cbiAgLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gZGV0ZWN0aW5nIGNpcmN1bGFyIHJlZmVyZW5jZXMgc2VlIGh0dHBzOi8vZXM1LmdpdGh1Yi5pby8jSk8uXG4gIHN0YWNrQSB8fCAoc3RhY2tBID0gW10pO1xuICBzdGFja0IgfHwgKHN0YWNrQiA9IFtdKTtcblxuICB2YXIgbGVuZ3RoID0gc3RhY2tBLmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgaWYgKHN0YWNrQVtsZW5ndGhdID09IG9iamVjdCkge1xuICAgICAgcmV0dXJuIHN0YWNrQltsZW5ndGhdID09IG90aGVyO1xuICAgIH1cbiAgfVxuICAvLyBBZGQgYG9iamVjdGAgYW5kIGBvdGhlcmAgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICBzdGFja0EucHVzaChvYmplY3QpO1xuICBzdGFja0IucHVzaChvdGhlcik7XG5cbiAgdmFyIHJlc3VsdCA9IChvYmpJc0FyciA/IGVxdWFsQXJyYXlzIDogZXF1YWxPYmplY3RzKShvYmplY3QsIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGlzTG9vc2UsIHN0YWNrQSwgc3RhY2tCKTtcblxuICBzdGFja0EucG9wKCk7XG4gIHN0YWNrQi5wb3AoKTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0VxdWFsRGVlcDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9iYXNlSXNFcXVhbERlZXAuanNcbiAqKiBtb2R1bGUgaWQgPSAzNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGFycmF5U29tZSA9IHJlcXVpcmUoJy4vYXJyYXlTb21lJyk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbERlZXBgIGZvciBhcnJheXMgd2l0aCBzdXBwb3J0IGZvclxuICogcGFydGlhbCBkZWVwIGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7QXJyYXl9IG90aGVyIFRoZSBvdGhlciBhcnJheSB0byBjb21wYXJlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIGFycmF5cy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzTG9vc2VdIFNwZWNpZnkgcGVyZm9ybWluZyBwYXJ0aWFsIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQV0gVHJhY2tzIHRyYXZlcnNlZCBgdmFsdWVgIG9iamVjdHMuXG4gKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tCXSBUcmFja3MgdHJhdmVyc2VkIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJyYXlzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGVxdWFsQXJyYXlzKGFycmF5LCBvdGhlciwgZXF1YWxGdW5jLCBjdXN0b21pemVyLCBpc0xvb3NlLCBzdGFja0EsIHN0YWNrQikge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGFyckxlbmd0aCA9IGFycmF5Lmxlbmd0aCxcbiAgICAgIG90aExlbmd0aCA9IG90aGVyLmxlbmd0aDtcblxuICBpZiAoYXJyTGVuZ3RoICE9IG90aExlbmd0aCAmJiAhKGlzTG9vc2UgJiYgb3RoTGVuZ3RoID4gYXJyTGVuZ3RoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBJZ25vcmUgbm9uLWluZGV4IHByb3BlcnRpZXMuXG4gIHdoaWxlICgrK2luZGV4IDwgYXJyTGVuZ3RoKSB7XG4gICAgdmFyIGFyclZhbHVlID0gYXJyYXlbaW5kZXhdLFxuICAgICAgICBvdGhWYWx1ZSA9IG90aGVyW2luZGV4XSxcbiAgICAgICAgcmVzdWx0ID0gY3VzdG9taXplciA/IGN1c3RvbWl6ZXIoaXNMb29zZSA/IG90aFZhbHVlIDogYXJyVmFsdWUsIGlzTG9vc2UgPyBhcnJWYWx1ZSA6IG90aFZhbHVlLCBpbmRleCkgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgaWYgKGlzTG9vc2UpIHtcbiAgICAgIGlmICghYXJyYXlTb21lKG90aGVyLCBmdW5jdGlvbihvdGhWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGFyclZhbHVlID09PSBvdGhWYWx1ZSB8fCBlcXVhbEZ1bmMoYXJyVmFsdWUsIG90aFZhbHVlLCBjdXN0b21pemVyLCBpc0xvb3NlLCBzdGFja0EsIHN0YWNrQik7XG4gICAgICAgICAgfSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIShhcnJWYWx1ZSA9PT0gb3RoVmFsdWUgfHwgZXF1YWxGdW5jKGFyclZhbHVlLCBvdGhWYWx1ZSwgY3VzdG9taXplciwgaXNMb29zZSwgc3RhY2tBLCBzdGFja0IpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcXVhbEFycmF5cztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9lcXVhbEFycmF5cy5qc1xuICoqIG1vZHVsZSBpZCA9IDM1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5zb21lYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3IgY2FsbGJhY2tcbiAqIHNob3J0aGFuZHMgYW5kIGB0aGlzYCBiaW5kaW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW55IGVsZW1lbnQgcGFzc2VzIHRoZSBwcmVkaWNhdGUgY2hlY2ssXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBhcnJheVNvbWUoYXJyYXksIHByZWRpY2F0ZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChwcmVkaWNhdGUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5U29tZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9hcnJheVNvbWUuanNcbiAqKiBtb2R1bGUgaWQgPSAzNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbERlZXBgIGZvciBjb21wYXJpbmcgb2JqZWN0cyBvZlxuICogdGhlIHNhbWUgYHRvU3RyaW5nVGFnYC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBvbmx5IHN1cHBvcnRzIGNvbXBhcmluZyB2YWx1ZXMgd2l0aCB0YWdzIG9mXG4gKiBgQm9vbGVhbmAsIGBEYXRlYCwgYEVycm9yYCwgYE51bWJlcmAsIGBSZWdFeHBgLCBvciBgU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgYHRvU3RyaW5nVGFnYCBvZiB0aGUgb2JqZWN0cyB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBvYmplY3RzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGVxdWFsQnlUYWcob2JqZWN0LCBvdGhlciwgdGFnKSB7XG4gIHN3aXRjaCAodGFnKSB7XG4gICAgY2FzZSBib29sVGFnOlxuICAgIGNhc2UgZGF0ZVRhZzpcbiAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtYmVycywgZGF0ZXMgdG8gbWlsbGlzZWNvbmRzIGFuZCBib29sZWFuc1xuICAgICAgLy8gdG8gYDFgIG9yIGAwYCB0cmVhdGluZyBpbnZhbGlkIGRhdGVzIGNvZXJjZWQgdG8gYE5hTmAgYXMgbm90IGVxdWFsLlxuICAgICAgcmV0dXJuICtvYmplY3QgPT0gK290aGVyO1xuXG4gICAgY2FzZSBlcnJvclRhZzpcbiAgICAgIHJldHVybiBvYmplY3QubmFtZSA9PSBvdGhlci5uYW1lICYmIG9iamVjdC5tZXNzYWdlID09IG90aGVyLm1lc3NhZ2U7XG5cbiAgICBjYXNlIG51bWJlclRhZzpcbiAgICAgIC8vIFRyZWF0IGBOYU5gIHZzLiBgTmFOYCBhcyBlcXVhbC5cbiAgICAgIHJldHVybiAob2JqZWN0ICE9ICtvYmplY3QpXG4gICAgICAgID8gb3RoZXIgIT0gK290aGVyXG4gICAgICAgIDogb2JqZWN0ID09ICtvdGhlcjtcblxuICAgIGNhc2UgcmVnZXhwVGFnOlxuICAgIGNhc2Ugc3RyaW5nVGFnOlxuICAgICAgLy8gQ29lcmNlIHJlZ2V4ZXMgdG8gc3RyaW5ncyBhbmQgdHJlYXQgc3RyaW5ncyBwcmltaXRpdmVzIGFuZCBzdHJpbmdcbiAgICAgIC8vIG9iamVjdHMgYXMgZXF1YWwuIFNlZSBodHRwczovL2VzNS5naXRodWIuaW8vI3gxNS4xMC42LjQgZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgIHJldHVybiBvYmplY3QgPT0gKG90aGVyICsgJycpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcXVhbEJ5VGFnO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2ludGVybmFsL2VxdWFsQnlUYWcuanNcbiAqKiBtb2R1bGUgaWQgPSAzN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGtleXMgPSByZXF1aXJlKCcuLi9vYmplY3Qva2V5cycpO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VJc0VxdWFsRGVlcGAgZm9yIG9iamVjdHMgd2l0aCBzdXBwb3J0IGZvclxuICogcGFydGlhbCBkZWVwIGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvdGhlciBUaGUgb3RoZXIgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcXVhbEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRldGVybWluZSBlcXVpdmFsZW50cyBvZiB2YWx1ZXMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpbmcgdmFsdWVzLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNMb29zZV0gU3BlY2lmeSBwZXJmb3JtaW5nIHBhcnRpYWwgY29tcGFyaXNvbnMuXG4gKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tBXSBUcmFja3MgdHJhdmVyc2VkIGB2YWx1ZWAgb2JqZWN0cy5cbiAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0JdIFRyYWNrcyB0cmF2ZXJzZWQgYG90aGVyYCBvYmplY3RzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBvYmplY3RzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGVxdWFsT2JqZWN0cyhvYmplY3QsIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGlzTG9vc2UsIHN0YWNrQSwgc3RhY2tCKSB7XG4gIHZhciBvYmpQcm9wcyA9IGtleXMob2JqZWN0KSxcbiAgICAgIG9iakxlbmd0aCA9IG9ialByb3BzLmxlbmd0aCxcbiAgICAgIG90aFByb3BzID0ga2V5cyhvdGhlciksXG4gICAgICBvdGhMZW5ndGggPSBvdGhQcm9wcy5sZW5ndGg7XG5cbiAgaWYgKG9iakxlbmd0aCAhPSBvdGhMZW5ndGggJiYgIWlzTG9vc2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGluZGV4ID0gb2JqTGVuZ3RoO1xuICB3aGlsZSAoaW5kZXgtLSkge1xuICAgIHZhciBrZXkgPSBvYmpQcm9wc1tpbmRleF07XG4gICAgaWYgKCEoaXNMb29zZSA/IGtleSBpbiBvdGhlciA6IGhhc093blByb3BlcnR5LmNhbGwob3RoZXIsIGtleSkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHZhciBza2lwQ3RvciA9IGlzTG9vc2U7XG4gIHdoaWxlICgrK2luZGV4IDwgb2JqTGVuZ3RoKSB7XG4gICAga2V5ID0gb2JqUHJvcHNbaW5kZXhdO1xuICAgIHZhciBvYmpWYWx1ZSA9IG9iamVjdFtrZXldLFxuICAgICAgICBvdGhWYWx1ZSA9IG90aGVyW2tleV0sXG4gICAgICAgIHJlc3VsdCA9IGN1c3RvbWl6ZXIgPyBjdXN0b21pemVyKGlzTG9vc2UgPyBvdGhWYWx1ZSA6IG9ialZhbHVlLCBpc0xvb3NlPyBvYmpWYWx1ZSA6IG90aFZhbHVlLCBrZXkpIDogdW5kZWZpbmVkO1xuXG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgaWYgKCEocmVzdWx0ID09PSB1bmRlZmluZWQgPyBlcXVhbEZ1bmMob2JqVmFsdWUsIG90aFZhbHVlLCBjdXN0b21pemVyLCBpc0xvb3NlLCBzdGFja0EsIHN0YWNrQikgOiByZXN1bHQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHNraXBDdG9yIHx8IChza2lwQ3RvciA9IGtleSA9PSAnY29uc3RydWN0b3InKTtcbiAgfVxuICBpZiAoIXNraXBDdG9yKSB7XG4gICAgdmFyIG9iakN0b3IgPSBvYmplY3QuY29uc3RydWN0b3IsXG4gICAgICAgIG90aEN0b3IgPSBvdGhlci5jb25zdHJ1Y3RvcjtcblxuICAgIC8vIE5vbiBgT2JqZWN0YCBvYmplY3QgaW5zdGFuY2VzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWFsLlxuICAgIGlmIChvYmpDdG9yICE9IG90aEN0b3IgJiZcbiAgICAgICAgKCdjb25zdHJ1Y3RvcicgaW4gb2JqZWN0ICYmICdjb25zdHJ1Y3RvcicgaW4gb3RoZXIpICYmXG4gICAgICAgICEodHlwZW9mIG9iakN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBvYmpDdG9yIGluc3RhbmNlb2Ygb2JqQ3RvciAmJlxuICAgICAgICAgIHR5cGVvZiBvdGhDdG9yID09ICdmdW5jdGlvbicgJiYgb3RoQ3RvciBpbnN0YW5jZW9mIG90aEN0b3IpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVxdWFsT2JqZWN0cztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9lcXVhbE9iamVjdHMuanNcbiAqKiBtb2R1bGUgaWQgPSAzOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2dldE5hdGl2ZScpLFxuICAgIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNBcnJheUxpa2UnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2xhbmcvaXNPYmplY3QnKSxcbiAgICBzaGltS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFsL3NoaW1LZXlzJyk7XG5cbi8qIE5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlS2V5cyA9IGdldE5hdGl2ZShPYmplY3QsICdrZXlzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5cyhuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqXG4gKiBfLmtleXMoJ2hpJyk7XG4gKiAvLyA9PiBbJzAnLCAnMSddXG4gKi9cbnZhciBrZXlzID0gIW5hdGl2ZUtleXMgPyBzaGltS2V5cyA6IGZ1bmN0aW9uKG9iamVjdCkge1xuICB2YXIgQ3RvciA9IG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0LmNvbnN0cnVjdG9yO1xuICBpZiAoKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUgPT09IG9iamVjdCkgfHxcbiAgICAgICh0eXBlb2Ygb2JqZWN0ICE9ICdmdW5jdGlvbicgJiYgaXNBcnJheUxpa2Uob2JqZWN0KSkpIHtcbiAgICByZXR1cm4gc2hpbUtleXMob2JqZWN0KTtcbiAgfVxuICByZXR1cm4gaXNPYmplY3Qob2JqZWN0KSA/IG5hdGl2ZUtleXMob2JqZWN0KSA6IFtdO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL29iamVjdC9rZXlzLmpzXG4gKiogbW9kdWxlIGlkID0gMzlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4uL2xhbmcvaXNBcmd1bWVudHMnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi4vbGFuZy9pc0FycmF5JyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vaXNJbmRleCcpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4uL29iamVjdC9rZXlzSW4nKTtcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQSBmYWxsYmFjayBpbXBsZW1lbnRhdGlvbiBvZiBgT2JqZWN0LmtleXNgIHdoaWNoIGNyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlXG4gKiBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gc2hpbUtleXMob2JqZWN0KSB7XG4gIHZhciBwcm9wcyA9IGtleXNJbihvYmplY3QpLFxuICAgICAgcHJvcHNMZW5ndGggPSBwcm9wcy5sZW5ndGgsXG4gICAgICBsZW5ndGggPSBwcm9wc0xlbmd0aCAmJiBvYmplY3QubGVuZ3RoO1xuXG4gIHZhciBhbGxvd0luZGV4ZXMgPSAhIWxlbmd0aCAmJiBpc0xlbmd0aChsZW5ndGgpICYmXG4gICAgKGlzQXJyYXkob2JqZWN0KSB8fCBpc0FyZ3VtZW50cyhvYmplY3QpKTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgcHJvcHNMZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuICAgIGlmICgoYWxsb3dJbmRleGVzICYmIGlzSW5kZXgoa2V5LCBsZW5ndGgpKSB8fCBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaGltS2V5cztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9zaGltS2V5cy5qc1xuICoqIG1vZHVsZSBpZCA9IDQwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuLi9sYW5nL2lzQXJndW1lbnRzJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4uL2xhbmcvaXNBcnJheScpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc0luZGV4JyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc0xlbmd0aCcpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vbGFuZy9pc09iamVjdCcpO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICBvYmplY3QgPSBPYmplY3Qob2JqZWN0KTtcbiAgfVxuICB2YXIgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDtcbiAgbGVuZ3RoID0gKGxlbmd0aCAmJiBpc0xlbmd0aChsZW5ndGgpICYmXG4gICAgKGlzQXJyYXkob2JqZWN0KSB8fCBpc0FyZ3VtZW50cyhvYmplY3QpKSAmJiBsZW5ndGgpIHx8IDA7XG5cbiAgdmFyIEN0b3IgPSBvYmplY3QuY29uc3RydWN0b3IsXG4gICAgICBpbmRleCA9IC0xLFxuICAgICAgaXNQcm90byA9IHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUgPT09IG9iamVjdCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCksXG4gICAgICBza2lwSW5kZXhlcyA9IGxlbmd0aCA+IDA7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gKGluZGV4ICsgJycpO1xuICB9XG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoIShza2lwSW5kZXhlcyAmJiBpc0luZGV4KGtleSwgbGVuZ3RoKSkgJiZcbiAgICAgICAgIShrZXkgPT0gJ2NvbnN0cnVjdG9yJyAmJiAoaXNQcm90byB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzSW47XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvb2JqZWN0L2tleXNJbi5qc1xuICoqIG1vZHVsZSBpZCA9IDQxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaXNMZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc0xlbmd0aCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Vycm9yVGFnXSA9XG50eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9IHR5cGVkQXJyYXlUYWdzW21hcFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW29iamVjdFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3NldFRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmpUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkobmV3IFVpbnQ4QXJyYXkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KFtdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVHlwZWRBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3Nbb2JqVG9TdHJpbmcuY2FsbCh2YWx1ZSldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVHlwZWRBcnJheTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9sYW5nL2lzVHlwZWRBcnJheS5qc1xuICoqIG1vZHVsZSBpZCA9IDQyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9sYW5nL2lzT2JqZWN0Jyk7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhbiBvYmplY3QgaWYgaXQncyBub3Qgb25lLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgb2JqZWN0LlxuICovXG5mdW5jdGlvbiB0b09iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3QodmFsdWUpID8gdmFsdWUgOiBPYmplY3QodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvT2JqZWN0O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2ludGVybmFsL3RvT2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc1N0cmljdENvbXBhcmFibGUgPSByZXF1aXJlKCcuL2lzU3RyaWN0Q29tcGFyYWJsZScpLFxuICAgIHBhaXJzID0gcmVxdWlyZSgnLi4vb2JqZWN0L3BhaXJzJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgcHJvcGVyeSBuYW1lcywgdmFsdWVzLCBhbmQgY29tcGFyZSBmbGFncyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBtYXRjaCBkYXRhIG9mIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBnZXRNYXRjaERhdGEob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBwYWlycyhvYmplY3QpLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICByZXN1bHRbbGVuZ3RoXVsyXSA9IGlzU3RyaWN0Q29tcGFyYWJsZShyZXN1bHRbbGVuZ3RoXVsxXSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRNYXRjaERhdGE7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvZ2V0TWF0Y2hEYXRhLmpzXG4gKiogbW9kdWxlIGlkID0gNDRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2xhbmcvaXNPYmplY3QnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3Igc3RyaWN0IGVxdWFsaXR5IGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlmIHN1aXRhYmxlIGZvciBzdHJpY3RcbiAqICBlcXVhbGl0eSBjb21wYXJpc29ucywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1N0cmljdENvbXBhcmFibGUodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSB2YWx1ZSAmJiAhaXNPYmplY3QodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3RyaWN0Q29tcGFyYWJsZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9pc1N0cmljdENvbXBhcmFibGUuanNcbiAqKiBtb2R1bGUgaWQgPSA0NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKSxcbiAgICB0b09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFsL3RvT2JqZWN0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHR3byBkaW1lbnNpb25hbCBhcnJheSBvZiB0aGUga2V5LXZhbHVlIHBhaXJzIGZvciBgb2JqZWN0YCxcbiAqIGUuZy4gYFtba2V5MSwgdmFsdWUxXSwgW2tleTIsIHZhbHVlMl1dYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgYXJyYXkgb2Yga2V5LXZhbHVlIHBhaXJzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnBhaXJzKHsgJ2Jhcm5leSc6IDM2LCAnZnJlZCc6IDQwIH0pO1xuICogLy8gPT4gW1snYmFybmV5JywgMzZdLCBbJ2ZyZWQnLCA0MF1dIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKi9cbmZ1bmN0aW9uIHBhaXJzKG9iamVjdCkge1xuICBvYmplY3QgPSB0b09iamVjdChvYmplY3QpO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICByZXN1bHRbaW5kZXhdID0gW2tleSwgb2JqZWN0W2tleV1dO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFpcnM7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvb2JqZWN0L3BhaXJzLmpzXG4gKiogbW9kdWxlIGlkID0gNDZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBiYXNlR2V0ID0gcmVxdWlyZSgnLi9iYXNlR2V0JyksXG4gICAgYmFzZUlzRXF1YWwgPSByZXF1aXJlKCcuL2Jhc2VJc0VxdWFsJyksXG4gICAgYmFzZVNsaWNlID0gcmVxdWlyZSgnLi9iYXNlU2xpY2UnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi4vbGFuZy9pc0FycmF5JyksXG4gICAgaXNLZXkgPSByZXF1aXJlKCcuL2lzS2V5JyksXG4gICAgaXNTdHJpY3RDb21wYXJhYmxlID0gcmVxdWlyZSgnLi9pc1N0cmljdENvbXBhcmFibGUnKSxcbiAgICBsYXN0ID0gcmVxdWlyZSgnLi4vYXJyYXkvbGFzdCcpLFxuICAgIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi90b09iamVjdCcpLFxuICAgIHRvUGF0aCA9IHJlcXVpcmUoJy4vdG9QYXRoJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ubWF0Y2hlc1Byb3BlcnR5YCB3aGljaCBkb2VzIG5vdCBjbG9uZSBgc3JjVmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHBhcmFtIHsqfSBzcmNWYWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlTWF0Y2hlc1Byb3BlcnR5KHBhdGgsIHNyY1ZhbHVlKSB7XG4gIHZhciBpc0FyciA9IGlzQXJyYXkocGF0aCksXG4gICAgICBpc0NvbW1vbiA9IGlzS2V5KHBhdGgpICYmIGlzU3RyaWN0Q29tcGFyYWJsZShzcmNWYWx1ZSksXG4gICAgICBwYXRoS2V5ID0gKHBhdGggKyAnJyk7XG5cbiAgcGF0aCA9IHRvUGF0aChwYXRoKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIga2V5ID0gcGF0aEtleTtcbiAgICBvYmplY3QgPSB0b09iamVjdChvYmplY3QpO1xuICAgIGlmICgoaXNBcnIgfHwgIWlzQ29tbW9uKSAmJiAhKGtleSBpbiBvYmplY3QpKSB7XG4gICAgICBvYmplY3QgPSBwYXRoLmxlbmd0aCA9PSAxID8gb2JqZWN0IDogYmFzZUdldChvYmplY3QsIGJhc2VTbGljZShwYXRoLCAwLCAtMSkpO1xuICAgICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGtleSA9IGxhc3QocGF0aCk7XG4gICAgICBvYmplY3QgPSB0b09iamVjdChvYmplY3QpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0W2tleV0gPT09IHNyY1ZhbHVlXG4gICAgICA/IChzcmNWYWx1ZSAhPT0gdW5kZWZpbmVkIHx8IChrZXkgaW4gb2JqZWN0KSlcbiAgICAgIDogYmFzZUlzRXF1YWwoc3JjVmFsdWUsIG9iamVjdFtrZXldLCB1bmRlZmluZWQsIHRydWUpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VNYXRjaGVzUHJvcGVydHk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZU1hdGNoZXNQcm9wZXJ0eS5qc1xuICoqIG1vZHVsZSBpZCA9IDQ3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuL3RvT2JqZWN0Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldGAgd2l0aG91dCBzdXBwb3J0IGZvciBzdHJpbmcgcGF0aHNcbiAqIGFuZCBkZWZhdWx0IHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheX0gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHBhcmFtIHtzdHJpbmd9IFtwYXRoS2V5XSBUaGUga2V5IHJlcHJlc2VudGF0aW9uIG9mIHBhdGguXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXQob2JqZWN0LCBwYXRoLCBwYXRoS2V5KSB7XG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocGF0aEtleSAhPT0gdW5kZWZpbmVkICYmIHBhdGhLZXkgaW4gdG9PYmplY3Qob2JqZWN0KSkge1xuICAgIHBhdGggPSBbcGF0aEtleV07XG4gIH1cbiAgdmFyIGluZGV4ID0gMCxcbiAgICAgIGxlbmd0aCA9IHBhdGgubGVuZ3RoO1xuXG4gIHdoaWxlIChvYmplY3QgIT0gbnVsbCAmJiBpbmRleCA8IGxlbmd0aCkge1xuICAgIG9iamVjdCA9IG9iamVjdFtwYXRoW2luZGV4KytdXTtcbiAgfVxuICByZXR1cm4gKGluZGV4ICYmIGluZGV4ID09IGxlbmd0aCkgPyBvYmplY3QgOiB1bmRlZmluZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9iYXNlR2V0LmpzXG4gKiogbW9kdWxlIGlkID0gNDhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uc2xpY2VgIHdpdGhvdXQgYW4gaXRlcmF0ZWUgY2FsbCBndWFyZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNsaWNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD0wXSBUaGUgc3RhcnQgcG9zaXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gW2VuZD1hcnJheS5sZW5ndGhdIFRoZSBlbmQgcG9zaXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHNsaWNlIG9mIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VTbGljZShhcnJheSwgc3RhcnQsIGVuZCkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuICBzdGFydCA9IHN0YXJ0ID09IG51bGwgPyAwIDogKCtzdGFydCB8fCAwKTtcbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gLXN0YXJ0ID4gbGVuZ3RoID8gMCA6IChsZW5ndGggKyBzdGFydCk7XG4gIH1cbiAgZW5kID0gKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IGxlbmd0aCkgPyBsZW5ndGggOiAoK2VuZCB8fCAwKTtcbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuZ3RoO1xuICB9XG4gIGxlbmd0aCA9IHN0YXJ0ID4gZW5kID8gMCA6ICgoZW5kIC0gc3RhcnQpID4+PiAwKTtcbiAgc3RhcnQgPj4+PSAwO1xuXG4gIHZhciByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBhcnJheVtpbmRleCArIHN0YXJ0XTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VTbGljZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9iYXNlU2xpY2UuanNcbiAqKiBtb2R1bGUgaWQgPSA0OVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9sYW5nL2lzQXJyYXknKSxcbiAgICB0b09iamVjdCA9IHJlcXVpcmUoJy4vdG9PYmplY3QnKTtcblxuLyoqIFVzZWQgdG8gbWF0Y2ggcHJvcGVydHkgbmFtZXMgd2l0aGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHJlSXNEZWVwUHJvcCA9IC9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcblxcXFxdfFxcXFwuKSo/XFwxKVxcXS8sXG4gICAgcmVJc1BsYWluUHJvcCA9IC9eXFx3KiQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcHJvcGVydHkgbmFtZSBhbmQgbm90IGEgcHJvcGVydHkgcGF0aC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeSBrZXlzIG9uLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm9wZXJ0eSBuYW1lLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzS2V5KHZhbHVlLCBvYmplY3QpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIGlmICgodHlwZSA9PSAnc3RyaW5nJyAmJiByZUlzUGxhaW5Qcm9wLnRlc3QodmFsdWUpKSB8fCB0eXBlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciByZXN1bHQgPSAhcmVJc0RlZXBQcm9wLnRlc3QodmFsdWUpO1xuICByZXR1cm4gcmVzdWx0IHx8IChvYmplY3QgIT0gbnVsbCAmJiB2YWx1ZSBpbiB0b09iamVjdChvYmplY3QpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0tleTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9pc0tleS5qc1xuICoqIG1vZHVsZSBpZCA9IDUwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEdldHMgdGhlIGxhc3QgZWxlbWVudCBvZiBgYXJyYXlgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgQXJyYXlcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBsYXN0IGVsZW1lbnQgb2YgYGFycmF5YC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5sYXN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAzXG4gKi9cbmZ1bmN0aW9uIGxhc3QoYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcbiAgcmV0dXJuIGxlbmd0aCA/IGFycmF5W2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxhc3Q7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvYXJyYXkvbGFzdC5qc1xuICoqIG1vZHVsZSBpZCA9IDUxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZVRvU3RyaW5nID0gcmVxdWlyZSgnLi9iYXNlVG9TdHJpbmcnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi4vbGFuZy9pc0FycmF5Jyk7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIHByb3BlcnR5IG5hbWVzIHdpdGhpbiBwcm9wZXJ0eSBwYXRocy4gKi9cbnZhciByZVByb3BOYW1lID0gL1teLltcXF1dK3xcXFsoPzooLT9cXGQrKD86XFwuXFxkKyk/KXwoW1wiJ10pKCg/Oig/IVxcMilbXlxcblxcXFxdfFxcXFwuKSo/KVxcMilcXF0vZztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggYmFja3NsYXNoZXMgaW4gcHJvcGVydHkgcGF0aHMuICovXG52YXIgcmVFc2NhcGVDaGFyID0gL1xcXFwoXFxcXCk/L2c7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBwcm9wZXJ0eSBwYXRoIGFycmF5IGlmIGl0J3Mgbm90IG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgcHJvcGVydHkgcGF0aCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gdG9QYXRoKHZhbHVlKSB7XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGJhc2VUb1N0cmluZyh2YWx1ZSkucmVwbGFjZShyZVByb3BOYW1lLCBmdW5jdGlvbihtYXRjaCwgbnVtYmVyLCBxdW90ZSwgc3RyaW5nKSB7XG4gICAgcmVzdWx0LnB1c2gocXVvdGUgPyBzdHJpbmcucmVwbGFjZShyZUVzY2FwZUNoYXIsICckMScpIDogKG51bWJlciB8fCBtYXRjaCkpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1BhdGg7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvdG9QYXRoLmpzXG4gKiogbW9kdWxlIGlkID0gNTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyBpZiBpdCdzIG5vdCBvbmUuIEFuIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZFxuICogZm9yIGBudWxsYCBvciBgdW5kZWZpbmVkYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogKHZhbHVlICsgJycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VUb1N0cmluZztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9iYXNlVG9TdHJpbmcuanNcbiAqKiBtb2R1bGUgaWQgPSA1M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vdXRpbGl0eS9pZGVudGl0eScpO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUNhbGxiYWNrYCB3aGljaCBvbmx5IHN1cHBvcnRzIGB0aGlzYCBiaW5kaW5nXG4gKiBhbmQgc3BlY2lmeWluZyB0aGUgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byBwcm92aWRlIHRvIGBmdW5jYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYmluZC5cbiAqIEBwYXJhbSB7Kn0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtudW1iZXJ9IFthcmdDb3VudF0gVGhlIG51bWJlciBvZiBhcmd1bWVudHMgdG8gcHJvdmlkZSB0byBgZnVuY2AuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiBiaW5kQ2FsbGJhY2soZnVuYywgdGhpc0FyZywgYXJnQ291bnQpIHtcbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gaWRlbnRpdHk7XG4gIH1cbiAgaWYgKHRoaXNBcmcgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmdW5jO1xuICB9XG4gIHN3aXRjaCAoYXJnQ291bnQpIHtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSk7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICB9O1xuICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgfTtcbiAgICBjYXNlIDU6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3RoZXIsIGtleSwgb2JqZWN0LCBzb3VyY2UpIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgdmFsdWUsIG90aGVyLCBrZXksIG9iamVjdCwgc291cmNlKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbmRDYWxsYmFjaztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pbnRlcm5hbC9iaW5kQ2FsbGJhY2suanNcbiAqKiBtb2R1bGUgaWQgPSA1NFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBwcm92aWRlZCB0byBpdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdHlcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgQW55IHZhbHVlLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgYHZhbHVlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ3VzZXInOiAnZnJlZCcgfTtcbiAqXG4gKiBfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdDtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlkZW50aXR5O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL3V0aWxpdHkvaWRlbnRpdHkuanNcbiAqKiBtb2R1bGUgaWQgPSA1NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGJhc2VQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2Jhc2VQcm9wZXJ0eScpLFxuICAgIGJhc2VQcm9wZXJ0eURlZXAgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9iYXNlUHJvcGVydHlEZWVwJyksXG4gICAgaXNLZXkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc0tleScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlIGF0IGBwYXRoYCBvbiBhXG4gKiBnaXZlbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXR5XG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3RzID0gW1xuICogICB7ICdhJzogeyAnYic6IHsgJ2MnOiAyIH0gfSB9LFxuICogICB7ICdhJzogeyAnYic6IHsgJ2MnOiAxIH0gfSB9XG4gKiBdO1xuICpcbiAqIF8ubWFwKG9iamVjdHMsIF8ucHJvcGVydHkoJ2EuYi5jJykpO1xuICogLy8gPT4gWzIsIDFdXG4gKlxuICogXy5wbHVjayhfLnNvcnRCeShvYmplY3RzLCBfLnByb3BlcnR5KFsnYScsICdiJywgJ2MnXSkpLCAnYS5iLmMnKTtcbiAqIC8vID0+IFsxLCAyXVxuICovXG5mdW5jdGlvbiBwcm9wZXJ0eShwYXRoKSB7XG4gIHJldHVybiBpc0tleShwYXRoKSA/IGJhc2VQcm9wZXJ0eShwYXRoKSA6IGJhc2VQcm9wZXJ0eURlZXAocGF0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvcGVydHk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvdXRpbGl0eS9wcm9wZXJ0eS5qc1xuICoqIG1vZHVsZSBpZCA9IDU2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZUdldCA9IHJlcXVpcmUoJy4vYmFzZUdldCcpLFxuICAgIHRvUGF0aCA9IHJlcXVpcmUoJy4vdG9QYXRoJyk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUHJvcGVydHlgIHdoaWNoIHN1cHBvcnRzIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5RGVlcChwYXRoKSB7XG4gIHZhciBwYXRoS2V5ID0gKHBhdGggKyAnJyk7XG4gIHBhdGggPSB0b1BhdGgocGF0aCk7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gYmFzZUdldChvYmplY3QsIHBhdGgsIHBhdGhLZXkpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VQcm9wZXJ0eURlZXA7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZVByb3BlcnR5RGVlcC5qc1xuICoqIG1vZHVsZSBpZCA9IDU3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZUluZGV4T2YgPSByZXF1aXJlKCcuL2Jhc2VJbmRleE9mJyksXG4gICAgY2FjaGVJbmRleE9mID0gcmVxdWlyZSgnLi9jYWNoZUluZGV4T2YnKSxcbiAgICBjcmVhdGVDYWNoZSA9IHJlcXVpcmUoJy4vY3JlYXRlQ2FjaGUnKTtcblxuLyoqIFVzZWQgYXMgdGhlIHNpemUgdG8gZW5hYmxlIGxhcmdlIGFycmF5IG9wdGltaXphdGlvbnMuICovXG52YXIgTEFSR0VfQVJSQVlfU0laRSA9IDIwMDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy51bmlxYCB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrIHNob3J0aGFuZHNcbiAqIGFuZCBgdGhpc2AgYmluZGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaXRlcmF0ZWVdIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBkdXBsaWNhdGUgZnJlZSBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYmFzZVVuaXEoYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgaW5kZXhPZiA9IGJhc2VJbmRleE9mLFxuICAgICAgbGVuZ3RoID0gYXJyYXkubGVuZ3RoLFxuICAgICAgaXNDb21tb24gPSB0cnVlLFxuICAgICAgaXNMYXJnZSA9IGlzQ29tbW9uICYmIGxlbmd0aCA+PSBMQVJHRV9BUlJBWV9TSVpFLFxuICAgICAgc2VlbiA9IGlzTGFyZ2UgPyBjcmVhdGVDYWNoZSgpIDogbnVsbCxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIGlmIChzZWVuKSB7XG4gICAgaW5kZXhPZiA9IGNhY2hlSW5kZXhPZjtcbiAgICBpc0NvbW1vbiA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIGlzTGFyZ2UgPSBmYWxzZTtcbiAgICBzZWVuID0gaXRlcmF0ZWUgPyBbXSA6IHJlc3VsdDtcbiAgfVxuICBvdXRlcjpcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF0sXG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIGFycmF5KSA6IHZhbHVlO1xuXG4gICAgaWYgKGlzQ29tbW9uICYmIHZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgdmFyIHNlZW5JbmRleCA9IHNlZW4ubGVuZ3RoO1xuICAgICAgd2hpbGUgKHNlZW5JbmRleC0tKSB7XG4gICAgICAgIGlmIChzZWVuW3NlZW5JbmRleF0gPT09IGNvbXB1dGVkKSB7XG4gICAgICAgICAgY29udGludWUgb3V0ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpdGVyYXRlZSkge1xuICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgfVxuICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpbmRleE9mKHNlZW4sIGNvbXB1dGVkLCAwKSA8IDApIHtcbiAgICAgIGlmIChpdGVyYXRlZSB8fCBpc0xhcmdlKSB7XG4gICAgICAgIHNlZW4ucHVzaChjb21wdXRlZCk7XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVVuaXE7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaW50ZXJuYWwvYmFzZVVuaXEuanNcbiAqKiBtb2R1bGUgaWQgPSA1OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiBgXy51bmlxYCBvcHRpbWl6ZWQgZm9yIHNvcnRlZCBhcnJheXMgd2l0aG91dCBzdXBwb3J0XG4gKiBmb3IgY2FsbGJhY2sgc2hvcnRoYW5kcyBhbmQgYHRoaXNgIGJpbmRpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2l0ZXJhdGVlXSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZHVwbGljYXRlIGZyZWUgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIHNvcnRlZFVuaXEoYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBzZWVuLFxuICAgICAgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc0luZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XSxcbiAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSA/IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgYXJyYXkpIDogdmFsdWU7XG5cbiAgICBpZiAoIWluZGV4IHx8IHNlZW4gIT09IGNvbXB1dGVkKSB7XG4gICAgICBzZWVuID0gY29tcHV0ZWQ7XG4gICAgICByZXN1bHRbKytyZXNJbmRleF0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzb3J0ZWRVbmlxO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2ludGVybmFsL3NvcnRlZFVuaXEuanNcbiAqKiBtb2R1bGUgaWQgPSA1OVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgZGVmYXVsdCAoe1N1YnNjcmlwdGlvbiwgc3Vic2NyaXB0aW9uc0J5VVVJRCwgc3Vic2NyaXB0aW9uc0J5UHJvcGVydHksIHByb3BlcnRpZXMsIGNhbGxiYWNrfSkgPT4ge1xuICAvKiBtYWtlIGEgc3Vic2NyaXB0aW9uICovXG4gIGxldCBzdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24oe3Byb3BlcnRpZXMsIGNhbGxiYWNrfSk7XG5cbiAgLyogYWRkIHRoZSBzdWJzY3JpcHRpb24gdG8gdGhlIHN1YnNjcmlwdGlvbnNCeVVVSUQgb2JqZWN0ICovXG4gIHN1YnNjcmlwdGlvbnNCeVVVSURbc3Vic2NyaXB0aW9uLnV1aWRdID0gc3Vic2NyaXB0aW9uO1xuXG4gIC8qIGFkZCByZWZlcmVuY2VzIHRvIHRoZSBzdWJzY3JpcHRpb24gdG8gZWFjaCBvZiB0aGUgKi9cbiAgLyogc3Vic2NyaWJlZCBwcm9wZXJ0aWVzICovXG4gIHByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICBzdWJzY3JpcHRpb25zQnlQcm9wZXJ0eS5hZGQoe3Byb3BlcnR5LCBzdWJzY3JpcHRpb259KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHN1YnNjcmlwdGlvbi51dWlkO1xufTtcblxuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2phdmFzY3JpcHQvc3Vic2NyaWJlLmpzXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgdXVpZCBmcm9tICdub2RlLXV1aWQnO1xuXG5jb25zdCBTVUJTQ1JJUFRJT05fUFJPVE9UWVBFID0ge1xuICBwcm9wZXJ0aWVzOiBbXSxcbiAgY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHt9LFxuICBndWlkOiBudWxsXG59O1xuXG5leHBvcnQgZGVmYXVsdCAoe3Byb3BlcnRpZXMsIGNhbGxiYWNrfSkgPT4ge1xuICBsZXQgc3Vic2NyaXB0aW9uID0gT2JqZWN0LmNyZWF0ZShTVUJTQ1JJUFRJT05fUFJPVE9UWVBFKTtcblxuICBzdWJzY3JpcHRpb24ucHJvcGVydGllcyA9IHByb3BlcnRpZXM7XG4gIHN1YnNjcmlwdGlvbi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICBzdWJzY3JpcHRpb24udXVpZCA9IHV1aWQudjQoKTtcblxuICByZXR1cm4gc3Vic2NyaXB0aW9uO1xufTtcblxuZXhwb3J0IHsgU1VCU0NSSVBUSU9OX1BST1RPVFlQRSB9O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9qYXZhc2NyaXB0L1N1YnNjcmlwdGlvbi5qc1xuICoqLyIsIi8vICAgICB1dWlkLmpzXG4vL1xuLy8gICAgIENvcHlyaWdodCAoYykgMjAxMC0yMDEyIFJvYmVydCBLaWVmZmVyXG4vLyAgICAgTUlUIExpY2Vuc2UgLSBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF9nbG9iYWwgPSB0aGlzO1xuXG4gIC8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuICBXZSBmZWF0dXJlXG4gIC8vIGRldGVjdCB0byBkZXRlcm1pbmUgdGhlIGJlc3QgUk5HIHNvdXJjZSwgbm9ybWFsaXppbmcgdG8gYSBmdW5jdGlvbiB0aGF0XG4gIC8vIHJldHVybnMgMTI4LWJpdHMgb2YgcmFuZG9tbmVzcywgc2luY2UgdGhhdCdzIHdoYXQncyB1c3VhbGx5IHJlcXVpcmVkXG4gIHZhciBfcm5nO1xuXG4gIC8vIE5vZGUuanMgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly9ub2RlanMub3JnL2RvY3MvdjAuNi4yL2FwaS9jcnlwdG8uaHRtbFxuICAvL1xuICAvLyBNb2RlcmF0ZWx5IGZhc3QsIGhpZ2ggcXVhbGl0eVxuICBpZiAodHlwZW9mKF9nbG9iYWwucmVxdWlyZSkgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICB2YXIgX3JiID0gX2dsb2JhbC5yZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcztcbiAgICAgIF9ybmcgPSBfcmIgJiYgZnVuY3Rpb24oKSB7cmV0dXJuIF9yYigxNik7fTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICBpZiAoIV9ybmcgJiYgX2dsb2JhbC5jcnlwdG8gJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIFdIQVRXRyBjcnlwdG8tYmFzZWQgUk5HIC0gaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0NyeXB0b1xuICAgIC8vXG4gICAgLy8gTW9kZXJhdGVseSBmYXN0LCBoaWdoIHF1YWxpdHlcbiAgICB2YXIgX3JuZHM4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgIF9ybmcgPSBmdW5jdGlvbiB3aGF0d2dSTkcoKSB7XG4gICAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKF9ybmRzOCk7XG4gICAgICByZXR1cm4gX3JuZHM4O1xuICAgIH07XG4gIH1cblxuICBpZiAoIV9ybmcpIHtcbiAgICAvLyBNYXRoLnJhbmRvbSgpLWJhc2VkIChSTkcpXG4gICAgLy9cbiAgICAvLyBJZiBhbGwgZWxzZSBmYWlscywgdXNlIE1hdGgucmFuZG9tKCkuICBJdCdzIGZhc3QsIGJ1dCBpcyBvZiB1bnNwZWNpZmllZFxuICAgIC8vIHF1YWxpdHkuXG4gICAgdmFyICBfcm5kcyA9IG5ldyBBcnJheSgxNik7XG4gICAgX3JuZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIHI7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgIGlmICgoaSAmIDB4MDMpID09PSAwKSByID0gTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwO1xuICAgICAgICBfcm5kc1tpXSA9IHIgPj4+ICgoaSAmIDB4MDMpIDw8IDMpICYgMHhmZjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIF9ybmRzO1xuICAgIH07XG4gIH1cblxuICAvLyBCdWZmZXIgY2xhc3MgdG8gdXNlXG4gIHZhciBCdWZmZXJDbGFzcyA9IHR5cGVvZihfZ2xvYmFsLkJ1ZmZlcikgPT0gJ2Z1bmN0aW9uJyA/IF9nbG9iYWwuQnVmZmVyIDogQXJyYXk7XG5cbiAgLy8gTWFwcyBmb3IgbnVtYmVyIDwtPiBoZXggc3RyaW5nIGNvbnZlcnNpb25cbiAgdmFyIF9ieXRlVG9IZXggPSBbXTtcbiAgdmFyIF9oZXhUb0J5dGUgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgIF9ieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xuICAgIF9oZXhUb0J5dGVbX2J5dGVUb0hleFtpXV0gPSBpO1xuICB9XG5cbiAgLy8gKipgcGFyc2UoKWAgLSBQYXJzZSBhIFVVSUQgaW50byBpdCdzIGNvbXBvbmVudCBieXRlcyoqXG4gIGZ1bmN0aW9uIHBhcnNlKHMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSAoYnVmICYmIG9mZnNldCkgfHwgMCwgaWkgPSAwO1xuXG4gICAgYnVmID0gYnVmIHx8IFtdO1xuICAgIHMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bMC05YS1mXXsyfS9nLCBmdW5jdGlvbihvY3QpIHtcbiAgICAgIGlmIChpaSA8IDE2KSB7IC8vIERvbid0IG92ZXJmbG93IVxuICAgICAgICBidWZbaSArIGlpKytdID0gX2hleFRvQnl0ZVtvY3RdO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gWmVybyBvdXQgcmVtYWluaW5nIGJ5dGVzIGlmIHN0cmluZyB3YXMgc2hvcnRcbiAgICB3aGlsZSAoaWkgPCAxNikge1xuICAgICAgYnVmW2kgKyBpaSsrXSA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZjtcbiAgfVxuXG4gIC8vICoqYHVucGFyc2UoKWAgLSBDb252ZXJ0IFVVSUQgYnl0ZSBhcnJheSAoYWxhIHBhcnNlKCkpIGludG8gYSBzdHJpbmcqKlxuICBmdW5jdGlvbiB1bnBhcnNlKGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBvZmZzZXQgfHwgMCwgYnRoID0gX2J5dGVUb0hleDtcbiAgICByZXR1cm4gIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dO1xuICB9XG5cbiAgLy8gKipgdjEoKWAgLSBHZW5lcmF0ZSB0aW1lLWJhc2VkIFVVSUQqKlxuICAvL1xuICAvLyBJbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vTGlvc0svVVVJRC5qc1xuICAvLyBhbmQgaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L3V1aWQuaHRtbFxuXG4gIC8vIHJhbmRvbSAjJ3Mgd2UgbmVlZCB0byBpbml0IG5vZGUgYW5kIGNsb2Nrc2VxXG4gIHZhciBfc2VlZEJ5dGVzID0gX3JuZygpO1xuXG4gIC8vIFBlciA0LjUsIGNyZWF0ZSBhbmQgNDgtYml0IG5vZGUgaWQsICg0NyByYW5kb20gYml0cyArIG11bHRpY2FzdCBiaXQgPSAxKVxuICB2YXIgX25vZGVJZCA9IFtcbiAgICBfc2VlZEJ5dGVzWzBdIHwgMHgwMSxcbiAgICBfc2VlZEJ5dGVzWzFdLCBfc2VlZEJ5dGVzWzJdLCBfc2VlZEJ5dGVzWzNdLCBfc2VlZEJ5dGVzWzRdLCBfc2VlZEJ5dGVzWzVdXG4gIF07XG5cbiAgLy8gUGVyIDQuMi4yLCByYW5kb21pemUgKDE0IGJpdCkgY2xvY2tzZXFcbiAgdmFyIF9jbG9ja3NlcSA9IChfc2VlZEJ5dGVzWzZdIDw8IDggfCBfc2VlZEJ5dGVzWzddKSAmIDB4M2ZmZjtcblxuICAvLyBQcmV2aW91cyB1dWlkIGNyZWF0aW9uIHRpbWVcbiAgdmFyIF9sYXN0TVNlY3MgPSAwLCBfbGFzdE5TZWNzID0gMDtcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Jyb29mYS9ub2RlLXV1aWQgZm9yIEFQSSBkZXRhaWxzXG4gIGZ1bmN0aW9uIHYxKG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG4gICAgdmFyIGIgPSBidWYgfHwgW107XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBjbG9ja3NlcSA9IG9wdGlvbnMuY2xvY2tzZXEgIT0gbnVsbCA/IG9wdGlvbnMuY2xvY2tzZXEgOiBfY2xvY2tzZXE7XG5cbiAgICAvLyBVVUlEIHRpbWVzdGFtcHMgYXJlIDEwMCBuYW5vLXNlY29uZCB1bml0cyBzaW5jZSB0aGUgR3JlZ29yaWFuIGVwb2NoLFxuICAgIC8vICgxNTgyLTEwLTE1IDAwOjAwKS4gIEpTTnVtYmVycyBhcmVuJ3QgcHJlY2lzZSBlbm91Z2ggZm9yIHRoaXMsIHNvXG4gICAgLy8gdGltZSBpcyBoYW5kbGVkIGludGVybmFsbHkgYXMgJ21zZWNzJyAoaW50ZWdlciBtaWxsaXNlY29uZHMpIGFuZCAnbnNlY3MnXG4gICAgLy8gKDEwMC1uYW5vc2Vjb25kcyBvZmZzZXQgZnJvbSBtc2Vjcykgc2luY2UgdW5peCBlcG9jaCwgMTk3MC0wMS0wMSAwMDowMC5cbiAgICB2YXIgbXNlY3MgPSBvcHRpb25zLm1zZWNzICE9IG51bGwgPyBvcHRpb25zLm1zZWNzIDogbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAvLyBQZXIgNC4yLjEuMiwgdXNlIGNvdW50IG9mIHV1aWQncyBnZW5lcmF0ZWQgZHVyaW5nIHRoZSBjdXJyZW50IGNsb2NrXG4gICAgLy8gY3ljbGUgdG8gc2ltdWxhdGUgaGlnaGVyIHJlc29sdXRpb24gY2xvY2tcbiAgICB2YXIgbnNlY3MgPSBvcHRpb25zLm5zZWNzICE9IG51bGwgPyBvcHRpb25zLm5zZWNzIDogX2xhc3ROU2VjcyArIDE7XG5cbiAgICAvLyBUaW1lIHNpbmNlIGxhc3QgdXVpZCBjcmVhdGlvbiAoaW4gbXNlY3MpXG4gICAgdmFyIGR0ID0gKG1zZWNzIC0gX2xhc3RNU2VjcykgKyAobnNlY3MgLSBfbGFzdE5TZWNzKS8xMDAwMDtcblxuICAgIC8vIFBlciA0LjIuMS4yLCBCdW1wIGNsb2Nrc2VxIG9uIGNsb2NrIHJlZ3Jlc3Npb25cbiAgICBpZiAoZHQgPCAwICYmIG9wdGlvbnMuY2xvY2tzZXEgPT0gbnVsbCkge1xuICAgICAgY2xvY2tzZXEgPSBjbG9ja3NlcSArIDEgJiAweDNmZmY7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgbnNlY3MgaWYgY2xvY2sgcmVncmVzc2VzIChuZXcgY2xvY2tzZXEpIG9yIHdlJ3ZlIG1vdmVkIG9udG8gYSBuZXdcbiAgICAvLyB0aW1lIGludGVydmFsXG4gICAgaWYgKChkdCA8IDAgfHwgbXNlY3MgPiBfbGFzdE1TZWNzKSAmJiBvcHRpb25zLm5zZWNzID09IG51bGwpIHtcbiAgICAgIG5zZWNzID0gMDtcbiAgICB9XG5cbiAgICAvLyBQZXIgNC4yLjEuMiBUaHJvdyBlcnJvciBpZiB0b28gbWFueSB1dWlkcyBhcmUgcmVxdWVzdGVkXG4gICAgaWYgKG5zZWNzID49IDEwMDAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3V1aWQudjEoKTogQ2FuXFwndCBjcmVhdGUgbW9yZSB0aGFuIDEwTSB1dWlkcy9zZWMnKTtcbiAgICB9XG5cbiAgICBfbGFzdE1TZWNzID0gbXNlY3M7XG4gICAgX2xhc3ROU2VjcyA9IG5zZWNzO1xuICAgIF9jbG9ja3NlcSA9IGNsb2Nrc2VxO1xuXG4gICAgLy8gUGVyIDQuMS40IC0gQ29udmVydCBmcm9tIHVuaXggZXBvY2ggdG8gR3JlZ29yaWFuIGVwb2NoXG4gICAgbXNlY3MgKz0gMTIyMTkyOTI4MDAwMDA7XG5cbiAgICAvLyBgdGltZV9sb3dgXG4gICAgdmFyIHRsID0gKChtc2VjcyAmIDB4ZmZmZmZmZikgKiAxMDAwMCArIG5zZWNzKSAlIDB4MTAwMDAwMDAwO1xuICAgIGJbaSsrXSA9IHRsID4+PiAyNCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgPj4+IDE2ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCA+Pj4gOCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgJiAweGZmO1xuXG4gICAgLy8gYHRpbWVfbWlkYFxuICAgIHZhciB0bWggPSAobXNlY3MgLyAweDEwMDAwMDAwMCAqIDEwMDAwKSAmIDB4ZmZmZmZmZjtcbiAgICBiW2krK10gPSB0bWggPj4+IDggJiAweGZmO1xuICAgIGJbaSsrXSA9IHRtaCAmIDB4ZmY7XG5cbiAgICAvLyBgdGltZV9oaWdoX2FuZF92ZXJzaW9uYFxuICAgIGJbaSsrXSA9IHRtaCA+Pj4gMjQgJiAweGYgfCAweDEwOyAvLyBpbmNsdWRlIHZlcnNpb25cbiAgICBiW2krK10gPSB0bWggPj4+IDE2ICYgMHhmZjtcblxuICAgIC8vIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYCAoUGVyIDQuMi4yIC0gaW5jbHVkZSB2YXJpYW50KVxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxID4+PiA4IHwgMHg4MDtcblxuICAgIC8vIGBjbG9ja19zZXFfbG93YFxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxICYgMHhmZjtcblxuICAgIC8vIGBub2RlYFxuICAgIHZhciBub2RlID0gb3B0aW9ucy5ub2RlIHx8IF9ub2RlSWQ7XG4gICAgZm9yICh2YXIgbiA9IDA7IG4gPCA2OyBuKyspIHtcbiAgICAgIGJbaSArIG5dID0gbm9kZVtuXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmID8gYnVmIDogdW5wYXJzZShiKTtcbiAgfVxuXG4gIC8vICoqYHY0KClgIC0gR2VuZXJhdGUgcmFuZG9tIFVVSUQqKlxuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcbiAgZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgICAvLyBEZXByZWNhdGVkIC0gJ2Zvcm1hdCcgYXJndW1lbnQsIGFzIHN1cHBvcnRlZCBpbiB2MS4yXG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgICBpZiAodHlwZW9mKG9wdGlvbnMpID09ICdzdHJpbmcnKSB7XG4gICAgICBidWYgPSBvcHRpb25zID09ICdiaW5hcnknID8gbmV3IEJ1ZmZlckNsYXNzKDE2KSA6IG51bGw7XG4gICAgICBvcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBfcm5nKSgpO1xuXG4gICAgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuICAgIHJuZHNbNl0gPSAocm5kc1s2XSAmIDB4MGYpIHwgMHg0MDtcbiAgICBybmRzWzhdID0gKHJuZHNbOF0gJiAweDNmKSB8IDB4ODA7XG5cbiAgICAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcbiAgICBpZiAoYnVmKSB7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgMTY7IGlpKyspIHtcbiAgICAgICAgYnVmW2kgKyBpaV0gPSBybmRzW2lpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnVmIHx8IHVucGFyc2Uocm5kcyk7XG4gIH1cblxuICAvLyBFeHBvcnQgcHVibGljIEFQSVxuICB2YXIgdXVpZCA9IHY0O1xuICB1dWlkLnYxID0gdjE7XG4gIHV1aWQudjQgPSB2NDtcbiAgdXVpZC5wYXJzZSA9IHBhcnNlO1xuICB1dWlkLnVucGFyc2UgPSB1bnBhcnNlO1xuICB1dWlkLkJ1ZmZlckNsYXNzID0gQnVmZmVyQ2xhc3M7XG5cbiAgaWYgKHR5cGVvZihtb2R1bGUpICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gUHVibGlzaCBhcyBub2RlLmpzIG1vZHVsZVxuICAgIG1vZHVsZS5leHBvcnRzID0gdXVpZDtcbiAgfSBlbHNlICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gUHVibGlzaCBhcyBBTUQgbW9kdWxlXG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge3JldHVybiB1dWlkO30pO1xuIFxuXG4gIH0gZWxzZSB7XG4gICAgLy8gUHVibGlzaCBhcyBnbG9iYWwgKGluIGJyb3dzZXJzKVxuICAgIHZhciBfcHJldmlvdXNSb290ID0gX2dsb2JhbC51dWlkO1xuXG4gICAgLy8gKipgbm9Db25mbGljdCgpYCAtIChicm93c2VyIG9ubHkpIHRvIHJlc2V0IGdsb2JhbCAndXVpZCcgdmFyKipcbiAgICB1dWlkLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIF9nbG9iYWwudXVpZCA9IF9wcmV2aW91c1Jvb3Q7XG4gICAgICByZXR1cm4gdXVpZDtcbiAgICB9O1xuXG4gICAgX2dsb2JhbC51dWlkID0gdXVpZDtcbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L25vZGUtdXVpZC91dWlkLmpzXG4gKiogbW9kdWxlIGlkID0gNjJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgU1VCU0NSSVBUSU9OU19CWV9QUk9QRVJUWV9QUk9UT1RZUEUgPSB7XG4gIGFkZCh7cHJvcGVydHksIHN1YnNjcmlwdGlvbn0pIHtcbiAgICBsZXQgY3VycmVudFN1YnNjcmlwdGlvbnMgPSB0aGlzLnN1YnNjcmlwdGlvbnNbcHJvcGVydHldO1xuICAgIFxuICAgIGlmICghY3VycmVudFN1YnNjcmlwdGlvbnMgfHwgT2JqZWN0LmtleXMoY3VycmVudFN1YnNjcmlwdGlvbnMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zW3Byb3BlcnR5XSA9IHt9O1xuICAgIH1cblxuICAgIC8qIHVzZWluZyBvYmplY3QgbGlrZSBhIHNldCBoZXJlICovXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zW3Byb3BlcnR5XVtzdWJzY3JpcHRpb24udXVpZF0gPSB0cnVlO1xuICB9LFxuXG4gIHJlbW92ZSh7cHJvcGVydHksIHN1YnNjcmlwdGlvbn0pIHtcbiAgICBsZXQgY3VycmVudFN1YnNjcmlwdGlvbnMgPSB0aGlzLnN1YnNjcmlwdGlvbnNbcHJvcGVydHldO1xuXG4gICAgaWYgKCFjdXJyZW50U3Vic2NyaXB0aW9ucyB8fCBPYmplY3Qua2V5cyhjdXJyZW50U3Vic2NyaXB0aW9ucykubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnNbcHJvcGVydHldID0ge307XG4gICAgfVxuXG4gICAgZGVsZXRlIHRoaXMuc3Vic2NyaXB0aW9uc1twcm9wZXJ0eV1bc3Vic2NyaXB0aW9uLnV1aWRdO1xuICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHtcbiAgbGV0IHN1YnNjcmlwdGlvbnNCeVByb3BlcnR5ID0gT2JqZWN0LmNyZWF0ZShTVUJTQ1JJUFRJT05TX0JZX1BST1BFUlRZX1BST1RPVFlQRSk7XG5cbiAgc3Vic2NyaXB0aW9uc0J5UHJvcGVydHkuc3Vic2NyaXB0aW9ucyA9IHt9O1xuXG4gIHJldHVybiBzdWJzY3JpcHRpb25zQnlQcm9wZXJ0eTtcbn07XG5cbmV4cG9ydCB7IFNVQlNDUklQVElPTlNfQllfUFJPUEVSVFlfUFJPVE9UWVBFIH07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2phdmFzY3JpcHQvc3Vic2NyaXB0aW9uc0J5UHJvcGVydHkuanNcbiAqKi8iLCIndXNlIHN0cmljdCc7XG5cbi8qIHNpbmdsZXRvbiBvYmplY3QgdXNlZCB0byBob2xkIHN1YnNjcmlwdGlvbiBvYmplY3RzIGJ5IHRoZWlyIFVVSUQgKi9cblxuZXhwb3J0IGRlZmF1bHQge307XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2phdmFzY3JpcHQvc3Vic2NyaXB0aW9uc0J5VVVJRC5qc1xuICoqLyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGRlZmF1bHQgKHtzdWJzY3JpcHRpb25VVUlELCBzdWJzY3JpcHRpb25zQnlVVUlELCBzdWJzY3JpcHRpb25zQnlQcm9wZXJ0eX0pID0+IHtcbiAgbGV0IHN1YnNjcmlwdGlvbiA9IHN1YnNjcmlwdGlvbnNCeVVVSURbc3Vic2NyaXB0aW9uVVVJRF07XG5cbiAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgIC8qIHJlbW92ZSB0aGUgc3Vic2NyaXB0aW9uIGZyb20gdGhlIHN1YnNjcmlwdGlvbnNCeVVVSUQgb2JqZWN0ICovXG4gICAgZGVsZXRlIHN1YnNjcmlwdGlvbnNCeVVVSURbc3Vic2NyaXB0aW9uVVVJRF07XG5cbiAgICAvKiByZW1vdmUgcmVmZXJlbmNlcyB0byB0aGUgc3Vic2NyaXB0aW9uIGZyb20gZWFjaCBvZiB0aGUgc3Vic2NyaWJlZCBwcm9wZXJ0aWVzICovXG4gICAgc3Vic2NyaXB0aW9uLnByb3BlcnRpZXMuZm9yRWFjaChwcm9wZXJ0eSA9PiB7XG4gICAgICBzdWJzY3JpcHRpb25zQnlQcm9wZXJ0eS5yZW1vdmUoe3Byb3BlcnR5LCBzdWJzY3JpcHRpb259KTtcbiAgICB9KTtcbiAgfVxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vamF2YXNjcmlwdC91bnN1YnNjcmliZS5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZmI2MTIyNWUyZmRmY2Q0OWRmYzgiLCJ3ZWJwYWNrOi8vLy4vamF2YXNjcmlwdC9hcHAuanMiLCJ3ZWJwYWNrOi8vLy4vamF2YXNjcmlwdC9jb25maWcuanMiLCJ3ZWJwYWNrOi8vLy4vamF2YXNjcmlwdC91dGlsaXR5L3BhcnNlTG9jYXRpb25IYXNoLmpzIiwid2VicGFjazovLy8uL2phdmFzY3JpcHQvdXRpbGl0eS9zZXRMb2NhdGlvbkhhc2guanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvbWFwLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19hcnJheU1hcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYmFzZUl0ZXJhdGVlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlTWF0Y2hlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYmFzZUlzTWF0Y2guanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX1N0YWNrLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19MaXN0Q2FjaGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2xpc3RDYWNoZUNsZWFyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19saXN0Q2FjaGVEZWxldGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Fzc29jSW5kZXhPZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9lcS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fbGlzdENhY2hlR2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19saXN0Q2FjaGVIYXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2xpc3RDYWNoZVNldC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fc3RhY2tDbGVhci5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fc3RhY2tEZWxldGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX3N0YWNrR2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19zdGFja0hhcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fc3RhY2tTZXQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX01hcENhY2hlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19tYXBDYWNoZUNsZWFyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19IYXNoLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19oYXNoQ2xlYXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX25hdGl2ZUNyZWF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fZ2V0TmF0aXZlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlSXNOYXRpdmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaXNGdW5jdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc09iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9faXNIb3N0T2JqZWN0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19pc01hc2tlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fY29yZUpzRGF0YS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fcm9vdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fY2hlY2tHbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX3RvU291cmNlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19nZXRWYWx1ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9faGFzaERlbGV0ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9faGFzaEdldC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9faGFzaEhhcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9faGFzaFNldC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fTWFwLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19tYXBDYWNoZURlbGV0ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fZ2V0TWFwRGF0YS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9faXNLZXlhYmxlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19tYXBDYWNoZUdldC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fbWFwQ2FjaGVIYXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX21hcENhY2hlU2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlSXNFcXVhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYmFzZUlzRXF1YWxEZWVwLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19lcXVhbEFycmF5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fU2V0Q2FjaGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX3NldENhY2hlQWRkLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19zZXRDYWNoZUhhcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYXJyYXlTb21lLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19lcXVhbEJ5VGFnLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19TeW1ib2wuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX1VpbnQ4QXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX21hcFRvQXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX3NldFRvQXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2VxdWFsT2JqZWN0cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYmFzZUhhcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fZ2V0UHJvdG90eXBlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2tleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VLZXlzLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19pbmRleEtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VUaW1lcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc0FyZ3VtZW50cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc0FycmF5TGlrZU9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc0FycmF5TGlrZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fZ2V0TGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlUHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaXNMZW5ndGguanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2lzQXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaXNTdHJpbmcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2lzSW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2lzUHJvdG90eXBlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19nZXRUYWcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX0RhdGFWaWV3LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19Qcm9taXNlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19TZXQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX1dlYWtNYXAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaXNUeXBlZEFycmF5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19nZXRNYXRjaERhdGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2lzU3RyaWN0Q29tcGFyYWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fbWF0Y2hlc1N0cmljdENvbXBhcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VNYXRjaGVzUHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvZ2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlR2V0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jYXN0UGF0aC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fc3RyaW5nVG9QYXRoLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL21lbW9pemUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvdG9TdHJpbmcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VUb1N0cmluZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9pc1N5bWJvbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9faXNLZXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX3RvS2V5LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2hhc0luLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlSGFzSW4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2hhc1BhdGguanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvaWRlbnRpdHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VQcm9wZXJ0eURlZXAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VNYXAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Jhc2VFYWNoLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlRm9yT3duLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19iYXNlRm9yLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jcmVhdGVCYXNlRm9yLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jcmVhdGVCYXNlRWFjaC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9hc3NpZ24uanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvX2Fzc2lnblZhbHVlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jb3B5T2JqZWN0LmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL19jcmVhdGVBc3NpZ25lci5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9faXNJdGVyYXRlZUNhbGwuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvcmVzdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2xvZGFzaC9fYXBwbHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9sb2Rhc2gvdG9JbnRlZ2VyLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL3RvRmluaXRlLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL3RvTnVtYmVyLmpzIiwid2VicGFjazovLy8uL2phdmFzY3JpcHQvdmlld3BvcnQuanMiLCJ3ZWJwYWNrOi8vLy4vamF2YXNjcmlwdC91dGlsaXR5L2NvbXBpbGVTaGFkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vamF2YXNjcmlwdC91dGlsaXR5L2dldEF0dHJpYkxvY2F0aW9uLmpzIiwid2VicGFjazovLy8uL2phdmFzY3JpcHQvdXRpbGl0eS9nZXRVbmlmb3JtTG9jYXRpb24uanMiLCJ3ZWJwYWNrOi8vLy4vc2hhZGVycy92ZXJ0ZXhTaGFkZXIuZ2xzbCIsIndlYnBhY2s6Ly8vLi9zaGFkZXJzL2ZyYWN0YWwuZ2xzbCIsIndlYnBhY2s6Ly8vLi9+L2hhc2gtc3Vic2NyaWJlci9idW5kbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztBQ3JDQTs7OztBQUNBOzs7O0FBR0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBR0E7Ozs7QUFDQTs7OztBQUdBOzs7Ozs7QUFWQTtBQUpBOzs7QUFnQkEsS0FBSSxTQUFVLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFkOztB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RUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxFQUFFO0FBQ2IsY0FBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDckVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7OztBQ05BO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7OztBQ05BO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7OztBQ05BO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7OztBQ05BO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsRUFBRTtBQUNiLGNBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQy9FQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxPQUFPO0FBQ2xCLGNBQWEsTUFBTTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUN2QkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLEVBQUU7QUFDYixjQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxFQUFFO0FBQ2IsY0FBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixZQUFXLEVBQUU7QUFDYixjQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDaENBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxhQUFhO0FBQ3hCLFlBQVcsRUFBRTtBQUNiLGNBQWEsRUFBRTtBQUNmO0FBQ0E7QUFDQSxrQkFBaUIsUUFBUSxPQUFPLFNBQVMsRUFBRTtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDaENBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixZQUFXLGFBQWE7QUFDeEIsY0FBYSxFQUFFO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ3hCQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxFQUFFO0FBQ2IsY0FBYSxNQUFNO0FBQ25CO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDZEE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsY0FBYSxNQUFNO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQSxFQUFDOztBQUVEOzs7Ozs7O0FDeEJBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsU0FBUztBQUNwQixZQUFXLFNBQVM7QUFDcEIsY0FBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakIsaUJBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUN4RUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsRUFBRTtBQUNiLGNBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDM0JBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsRUFBRTtBQUNiLGNBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUM5QkE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsRUFBRTtBQUNiLGNBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ3RDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsRUFBRTtBQUNiLFlBQVcsT0FBTztBQUNsQixjQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUM1QkE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsRUFBRTtBQUNiLGNBQWEsY0FBYztBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDcEJBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxhQUFhO0FBQ3hCLGNBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0EsMkJBQTBCLGdCQUFnQixTQUFTLEdBQUc7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxhQUFhO0FBQ3hCLGNBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxhQUFhO0FBQ3hCLFlBQVcsU0FBUztBQUNwQixjQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxFQUFFO0FBQ2IsY0FBYSxFQUFFO0FBQ2Y7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsYUFBYTtBQUN4QixjQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0EsT0FBTSxPQUFPLFNBQVMsRUFBRTtBQUN4QixPQUFNLE9BQU8sU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDL0JBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxhQUFhO0FBQ3hCLGNBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNmQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxhQUFhO0FBQ3hCLFlBQVcsU0FBUztBQUNwQixjQUFhLE1BQU07QUFDbkI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBOztBQUVBOzs7Ozs7O0FDckJBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLGFBQWE7QUFDeEIsWUFBVyxTQUFTO0FBQ3BCLGNBQWEsYUFBYTtBQUMxQjtBQUNBOztBQUVBOzs7Ozs7O0FDYkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixZQUFXLFNBQVM7QUFDcEIsY0FBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDZkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxPQUFPO0FBQ2xCLFlBQVcsU0FBUztBQUNwQixZQUFXLFNBQVM7QUFDcEIsY0FBYSxPQUFPO0FBQ3BCO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsUUFBUTtBQUNuQixjQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDeEJBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxTQUFTO0FBQ3BCLFlBQVcsUUFBUTtBQUNuQixjQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esa0RBQWlELGVBQWU7O0FBRWhFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixZQUFXLFVBQVU7QUFDckIsY0FBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhLFNBQVM7QUFDdEIsV0FBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOztBQUVEOzs7Ozs7O0FDL0RBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxPQUFPO0FBQ2xCLFlBQVcsRUFBRTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUMxQkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxNQUFNO0FBQ2pCLFlBQVcsT0FBTyxXQUFXO0FBQzdCLFlBQVcsU0FBUztBQUNwQixjQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBLHlCQUF3Qjs7QUFFeEI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQzlCQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxTQUFTO0FBQ3BCLGNBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIOztBQUVBOzs7Ozs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxFQUFFO0FBQ2IsWUFBVyxFQUFFO0FBQ2IsWUFBVyxFQUFFO0FBQ2IsY0FBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQzdCQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLFNBQVM7QUFDcEIsWUFBVyxPQUFPO0FBQ2xCLGNBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxTQUFTO0FBQ3BCLFlBQVcsRUFBRTtBQUNiLFlBQVcsTUFBTTtBQUNqQixjQUFhLEVBQUU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDckJBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxFQUFFO0FBQ2IsY0FBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7OztBQ25DQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLEVBQUU7QUFDYixjQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUN6Q0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxFQUFFO0FBQ2IsY0FBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUNsRUEsS0FBTSxZQUFZLEdBQWxCOztBQUVBLEtBQU0scUJBQXFCO0FBQ3pCLFdBQVEsa0JBQVk7QUFDbEIsU0FBSSxnQkFBZ0IsS0FBSyxTQUFMLEVBQXBCOztBQUVBLFVBQUssU0FBTCxDQUFlO0FBQ2IsVUFBRyxFQUFDLEtBQUssY0FBYyxLQUFwQixFQUEyQixLQUFLLGNBQWMsS0FBOUMsRUFEVTtBQUViLFVBQUcsRUFBQyxLQUFLLGNBQWMsS0FBcEIsRUFBMkIsS0FBSyxjQUFjLEtBQTlDO0FBRlUsTUFBZjs7QUFLQSxVQUFLLGlCQUFMO0FBQ0QsSUFWd0I7QUFXekIsU0FBTSxvQkFBMEM7QUFBQSxTQUEvQixNQUErQixRQUEvQixNQUErQjtBQUFBLFNBQXZCLFNBQXVCLFFBQXZCLFNBQXVCO0FBQUEsU0FBWixTQUFZLFFBQVosU0FBWTs7QUFDOUMsVUFBSyxTQUFMLEdBQWlCLFNBQWpCO0FBQ0EsVUFBSyxTQUFMLEdBQWlCLFNBQWpCO0FBQ0EsVUFBSyxZQUFMLENBQWtCLE1BQWxCOztBQUVBLFVBQUssTUFBTDtBQUNELElBakJ3QjtBQWtCekIsWUFBUyxFQUFDLEtBQUssQ0FBTixFQUFTLEtBQUssQ0FBZCxFQWxCZ0I7QUFtQnpCLFlBQVMsRUFBQyxLQUFLLENBQU4sRUFBUyxLQUFLLENBQWQsRUFuQmdCO0FBb0J6QixjQUFXLG1CQUFVLE1BQVYsRUFBa0I7QUFDM0IsVUFBSyxPQUFMLEdBQWUsT0FBTyxDQUF0QjtBQUNBLFVBQUssT0FBTCxHQUFlLE9BQU8sQ0FBdEI7QUFDRCxJQXZCd0I7QUF3QnpCLGlCQUFjLHdCQUFZO0FBQ3hCLFlBQU87QUFDTCxjQUFPLEtBQUssT0FBTCxDQUFhLEdBRGY7QUFFTCxjQUFPLEtBQUssT0FBTCxDQUFhLEdBRmY7QUFHTCxjQUFPLEtBQUssT0FBTCxDQUFhLEdBSGY7QUFJTCxjQUFPLEtBQUssT0FBTCxDQUFhO0FBSmYsTUFBUDtBQU1ELElBL0J3QjtBQWdDekIsV0FBUSxrQkFBWTtBQUNsQixZQUFPO0FBQ0wsVUFBRyxDQUFDLEtBQUssT0FBTCxDQUFhLEdBQWIsR0FBbUIsS0FBSyxPQUFMLENBQWEsR0FBakMsSUFBd0MsQ0FEdEM7QUFFTCxVQUFHLENBQUMsS0FBSyxPQUFMLENBQWEsR0FBYixHQUFtQixLQUFLLE9BQUwsQ0FBYSxHQUFqQyxJQUF3QztBQUZ0QyxNQUFQO0FBSUQsSUFyQ3dCO0FBc0N6QixVQUFPLGlCQUFZO0FBQ2pCLFlBQU87QUFDTCxVQUFHLEtBQUssT0FBTCxDQUFhLEdBQWIsR0FBbUIsS0FBSyxPQUFMLENBQWEsR0FEOUI7QUFFTCxVQUFHLEtBQUssT0FBTCxDQUFhLEdBQWIsR0FBbUIsS0FBSyxPQUFMLENBQWE7QUFGOUIsTUFBUDtBQUlELElBM0N3QjtBQTRDekIsVUFBTyxpQkFBWTtBQUNqQixZQUFPO0FBQ0wsVUFBRyxLQUFLLEtBQUwsR0FBYSxDQUFiLEdBQWlCLEtBQUssS0FEcEI7QUFFTCxVQUFHLEtBQUssS0FBTCxHQUFhLENBQWIsR0FBaUIsS0FBSztBQUZwQixNQUFQO0FBSUQsSUFqRHdCO0FBa0R6QixZQUFTLG1CQUFZO0FBQ25CLFlBQU87QUFDTCxVQUFHLEtBQUssT0FBTCxDQUFhLEdBRFg7QUFFTCxVQUFHLEtBQUssT0FBTCxDQUFhO0FBRlgsTUFBUDtBQUlELElBdkR3QjtBQXdEekIsZUFBWSxzQkFBWTtBQUN0QixZQUFPO0FBQ0wsVUFBRyxLQUFLLE1BQUwsQ0FBWSxXQURWO0FBRUwsVUFBRyxLQUFLLE1BQUwsQ0FBWTtBQUZWLE1BQVA7QUFJRCxJQTdEd0I7QUE4RHpCLHdCQUFxQiw2QkFBVSxLQUFWLEVBQWlCO0FBQ3BDLFNBQUksb0JBQW9CLEtBQUssVUFBTCxFQUF4Qjs7QUFFQSxZQUFPO0FBQ0wsVUFBRyxNQUFNLE9BQU4sR0FBZ0Isa0JBQWtCLENBQWxDLEdBQXNDLEtBQUssS0FEekM7QUFFTCxVQUFHLE1BQU0sT0FBTixHQUFnQixrQkFBa0IsQ0FBbEMsR0FBc0MsS0FBSztBQUZ6QyxNQUFQO0FBSUQsSUFyRXdCO0FBc0V6QiwyQkFBd0IsZ0NBQVUsbUJBQVYsRUFBK0I7QUFDckQsU0FBSSxRQUFRLEtBQUssS0FBTCxFQUFaO0FBQ0EsU0FBSSxVQUFVLEtBQUssT0FBTCxFQUFkOztBQUVBLFlBQU87QUFDTCxVQUFHLFFBQVEsQ0FBUixHQUFZLE1BQU0sQ0FBTixHQUFVLG9CQUFvQixDQUE5QixHQUFrQyxLQUFLLEtBRGpEO0FBRUwsVUFBRyxRQUFRLENBQVIsR0FBWSxNQUFNLENBQU4sR0FBVSxvQkFBb0IsQ0FBOUIsR0FBa0MsS0FBSztBQUZqRCxNQUFQO0FBSUQsSUE5RXdCO0FBK0V6QixtQkFBZ0Isd0JBQVUsUUFBVixFQUFvQjtBQUNsQyxTQUFJLFFBQVEsS0FBSyxLQUFMLEVBQVo7O0FBRUEsVUFBSyxTQUFMLENBQWU7QUFDYixVQUFHO0FBQ0QsY0FBSyxTQUFTLENBQVQsR0FBYyxNQUFNLENBQU4sR0FBVSxTQUFWLEdBQXNCLEdBRHhDO0FBRUQsY0FBSyxTQUFTLENBQVQsR0FBYyxNQUFNLENBQU4sR0FBVSxTQUFWLEdBQXNCO0FBRnhDLFFBRFU7QUFLYixVQUFHO0FBQ0QsY0FBSyxTQUFTLENBQVQsR0FBYyxNQUFNLENBQU4sR0FBVSxTQUFWLEdBQXNCLEdBRHhDO0FBRUQsY0FBSyxTQUFTLENBQVQsR0FBYyxNQUFNLENBQU4sR0FBVSxTQUFWLEdBQXNCO0FBRnhDO0FBTFUsTUFBZjs7QUFXQSxVQUFLLFNBQUwsQ0FBZSxLQUFLLFlBQUwsRUFBZjtBQUNELElBOUZ3QjtBQStGekIsaUJBQWMsc0JBQVUsTUFBVixFQUFrQjtBQUFBOztBQUM5QixVQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsVUFBSyxNQUFMLENBQVksS0FBWixHQUFvQixLQUFLLE1BQUwsQ0FBWSxXQUFoQztBQUNBLFVBQUssTUFBTCxDQUFZLE1BQVosR0FBcUIsS0FBSyxNQUFMLENBQVksWUFBakM7O0FBRUEsVUFBSyxLQUFMLEdBQWEsS0FBSyxNQUFMLENBQVksS0FBekI7QUFDQSxVQUFLLE1BQUwsR0FBYyxLQUFLLE1BQUwsQ0FBWSxNQUExQjs7QUFFQSxVQUFLLE1BQUwsQ0FBWSxnQkFBWixDQUE2QixPQUE3QixFQUFzQyxpQkFBUztBQUM3QyxXQUFJLHNCQUF5QixNQUFLLG1CQUFMLENBQXlCLEtBQXpCLENBQTdCO0FBQ0EsV0FBSSx5QkFBeUIsTUFBSyxzQkFBTCxDQUE0QixtQkFBNUIsQ0FBN0I7O0FBRUEsYUFBSyxjQUFMLENBQW9CLHNCQUFwQjtBQUNELE1BTEQ7QUFNRCxJQTdHd0I7QUE4R3pCLHNCQUFtQiw2QkFBWTtBQUM3QixTQUFJLG9CQUFvQixLQUFLLE1BQUwsQ0FBWSxLQUFaLEdBQW9CLEtBQUssTUFBTCxDQUFZLE1BQXhEOztBQUVBLFNBQUksUUFBUSxLQUFLLEtBQUwsRUFBWjtBQUNBLFNBQUksU0FBUyxLQUFLLE1BQUwsRUFBYjtBQUNBLFNBQUkscUJBQXFCLE1BQU0sQ0FBTixHQUFVLE1BQU0sQ0FBekM7O0FBRUEsU0FBSSxxQkFBSjtBQUNBLFNBQUksVUFBVSxLQUFLLE9BQW5CO0FBQ0EsU0FBSSxVQUFVLEtBQUssT0FBbkI7QUFDQSxTQUFJLHFCQUFxQixpQkFBekIsRUFBNEM7QUFDMUM7QUFDQSxXQUFJLCtCQUErQixRQUFRLEdBQVIsR0FBYyxPQUFPLENBQXhEOztBQUVBLCtCQUF3QixnQ0FBZ0MscUJBQXFCLGlCQUFyRCxDQUF4QjtBQUNBLGlCQUFVO0FBQ1IsY0FBSyxPQUFPLENBQVAsR0FBVyxxQkFEUjtBQUVSLGNBQUssT0FBTyxDQUFQLEdBQVc7QUFGUixRQUFWO0FBSUQsTUFURCxNQVNPO0FBQ0w7QUFDQSxXQUFJLGlDQUFpQyxRQUFRLEdBQVIsR0FBYyxPQUFPLENBQTFEOztBQUVBLCtCQUF3QixrQ0FBa0Msb0JBQW9CLGtCQUF0RCxDQUF4QjtBQUNBLGlCQUFVO0FBQ1IsY0FBSyxPQUFPLENBQVAsR0FBVyxxQkFEUjtBQUVSLGNBQUssT0FBTyxDQUFQLEdBQVc7QUFGUixRQUFWO0FBSUQ7O0FBRUQsVUFBSyxTQUFMLENBQWU7QUFDYixVQUFHLE9BRFU7QUFFYixVQUFHO0FBRlUsTUFBZjtBQUlEO0FBaEp3QixFQUEzQjs7bUJBbUplO0FBQ2IsU0FEYSx5QkFDMEI7QUFBQSxTQUEvQixNQUErQixTQUEvQixNQUErQjtBQUFBLFNBQXZCLFNBQXVCLFNBQXZCLFNBQXVCO0FBQUEsU0FBWixTQUFZLFNBQVosU0FBWTs7QUFDckMsU0FBSSxXQUFXLE9BQU8sTUFBUCxDQUFjLGtCQUFkLENBQWY7O0FBRUEsY0FBUyxJQUFULENBQWMsRUFBQyxjQUFELEVBQVMsb0JBQVQsRUFBb0Isb0JBQXBCLEVBQWQ7O0FBRUEsWUFBTyxRQUFQO0FBQ0Q7QUFQWSxFOzs7Ozs7Ozs7Ozs7bUJDckpBLFVBQVMsWUFBVCxFQUF1QixVQUF2QixFQUFtQyxPQUFuQyxFQUE0QztBQUN6RCxPQUFNLFNBQVMsUUFBUSxZQUFSLENBQXFCLFVBQXJCLENBQWY7O0FBRUEsV0FBUSxZQUFSLENBQXFCLE1BQXJCLEVBQTZCLFlBQTdCO0FBQ0EsV0FBUSxhQUFSLENBQXNCLE1BQXRCOztBQUVBLE9BQUksQ0FBQyxRQUFRLGtCQUFSLENBQTJCLE1BQTNCLEVBQW1DLFFBQVEsY0FBM0MsQ0FBTCxFQUFpRTtBQUMvRCxXQUFNLGlDQUFpQyxRQUFRLGdCQUFSLENBQXlCLE1BQXpCLENBQXZDO0FBQ0Q7O0FBRUQsVUFBTyxNQUFQO0FBQ0QsRTs7Ozs7Ozs7Ozs7O21CQ1hjLFVBQVMsT0FBVCxFQUFrQixJQUFsQixFQUF3QixPQUF4QixFQUFpQztBQUM5QyxPQUFNLG9CQUFvQixRQUFRLGlCQUFSLENBQTBCLE9BQTFCLEVBQW1DLElBQW5DLENBQTFCOztBQUVBLE9BQUksc0JBQXNCLENBQUMsQ0FBM0IsRUFBOEI7QUFDMUIsV0FBTSw0QkFBNEIsSUFBNUIsR0FBbUMsR0FBekM7QUFDSDs7QUFFRCxVQUFPLGlCQUFQO0FBQ0QsRTs7Ozs7Ozs7Ozs7O21CQ1JjLFVBQVMsT0FBVCxFQUFrQixJQUFsQixFQUF3QixPQUF4QixFQUFpQztBQUM5QyxPQUFNLGtCQUFrQixRQUFRLGtCQUFSLENBQTJCLE9BQTNCLEVBQW9DLElBQXBDLENBQXhCOztBQUVBLE9BQUksb0JBQW9CLENBQUMsQ0FBekIsRUFBNEI7QUFDMUIsV0FBTSwwQkFBMEIsSUFBMUIsR0FBaUMsR0FBdkM7QUFDRDs7QUFFRCxVQUFPLGVBQVA7QUFDRCxFOzs7Ozs7QUNSRCwyQ0FBMEMsaUJBQWlCLDRIQUE0SCxHQUFHLEc7Ozs7OztBQ0ExTCx5Q0FBd0MsNkZBQTZGLCtCQUErQiw2QkFBNkIsK0JBQStCLDZCQUE2QiwrQkFBK0IsK0JBQStCLDZCQUE2Qiw2QkFBNkIsNkJBQTZCLG9DQUFvQywyQ0FBMkMsb0JBQW9CLGVBQWUsb0JBQW9CLElBQUksdUNBQXVDLDJCQUEyQiw0QkFBNEIsZUFBZSwrRkFBK0YsaUVBQWlFLHNCQUFzQiw4QkFBOEIsZ0VBQWdFLHlCQUF5QixPQUFPLEtBQUssZUFBZSxHQUFHLHFDQUFxQyxvREFBb0Qsa0NBQWtDLDJCQUEyQixHQUFHLDZDQUE2Qyw0Q0FBNEMsb0RBQW9ELDJCQUEyQixHQUFHLHdDQUF3QywwREFBMEQsK0NBQStDLHVFQUF1RSwwRUFBMEUsb0NBQW9DLG9DQUFvQyx1Q0FBdUMsK0JBQStCLEdBQUcsaUJBQWlCLGtEQUFrRCxtREFBbUQsK0RBQStELDZFQUE2RSxvREFBb0QsR0FBRyxHOzs7Ozs7QUNBcGdFO0FBQ0EsOEJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxHQUFFOztBQUVGLHdDQUF1Qyx1Q0FBdUMsa0JBQWtCOztBQUVoRzs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUTtBQUNSLE9BQU07QUFDTixLQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFNO0FBQ04sS0FBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBLFFBQU87QUFDUDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxHQUFFOztBQUVGLHFDQUFvQyxpQ0FBaUMsZUFBZSxlQUFlLGdCQUFnQixvQkFBb0IsTUFBTSwwQ0FBMEMsK0JBQStCLGFBQWEscUJBQXFCLG1DQUFtQyxFQUFFLEVBQUUsY0FBYyxXQUFXLFVBQVUsRUFBRSxVQUFVLE1BQU0seUNBQXlDLEVBQUUsVUFBVSxrQkFBa0IsRUFBRSxFQUFFLGFBQWEsRUFBRSwyQkFBMkIsMEJBQTBCLFlBQVksRUFBRSwyQ0FBMkMsOEJBQThCLEVBQUUsT0FBTyw2RUFBNkUsRUFBRSxHQUFHLEVBQUU7O0FBRXZwQjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUTtBQUNSO0FBQ0E7QUFDQSxPQUFNO0FBQ047QUFDQTs7QUFFQTtBQUNBLEtBQUksSUFBSTtBQUNSOztBQUVBOztBQUVBLFFBQU87QUFDUDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxHQUFFOztBQUVGLHdDQUF1Qyx1Q0FBdUMsa0JBQWtCOztBQUVoRzs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7O0FBRUo7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEtBQUk7O0FBRUo7QUFDQTtBQUNBLEtBQUk7QUFDSjs7QUFFQTs7QUFFQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLFNBQVM7QUFDckIsZUFBYyxNQUFNO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFFOztBQUVGOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksTUFBTTtBQUNsQixhQUFZLEVBQUU7QUFDZCxhQUFZLE9BQU87QUFDbkIsZUFBYyxPQUFPO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksTUFBTTtBQUNsQixhQUFZLE9BQU87QUFDbkIsYUFBWSxRQUFRO0FBQ3BCLGVBQWMsT0FBTztBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxPQUFPO0FBQ25CLGFBQVksRUFBRTtBQUNkLGVBQWMsT0FBTztBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksRUFBRTtBQUNkLGVBQWMsUUFBUTtBQUN0QjtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7OztBQUdBLFFBQU87QUFDUDtBQUNBOztBQUVBLGdEQUErQztBQUMvQzs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLE1BQU07QUFDbEIsZUFBYyxZQUFZO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLDhCQUE2Qiw0QkFBNEIsYUFBYSxFQUFFOztBQUV4RSxRQUFPO0FBQ1A7QUFDQTs7QUFFQSxnREFBK0M7QUFDL0M7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLE1BQU07QUFDbEI7QUFDQTtBQUNBOztBQUVBLGlCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLDhCQUE2Qiw0QkFBNEIsYUFBYSxFQUFFOztBQUV4RSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLEVBQUU7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0EsUUFBTztBQUNQO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLE9BQU87QUFDbkIsYUFBWSxPQUFPO0FBQ25CLGVBQWMsRUFBRTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDZEQUE0RDtBQUM1RDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksRUFBRTtBQUNkLGVBQWMsUUFBUTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLEVBQUU7QUFDZCxlQUFjLFFBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0EsUUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLEVBQUU7QUFDZCxlQUFjLFFBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7OztBQUdBLFFBQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLEVBQUU7QUFDZCxlQUFjLFFBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7OztBQUdBLFFBQU87QUFDUDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxPQUFPO0FBQ25CLGVBQWMsRUFBRTtBQUNoQjtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksT0FBTztBQUNuQixlQUFjLFNBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksRUFBRTtBQUNkLGVBQWMsUUFBUTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0EsUUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksU0FBUztBQUNyQixhQUFZLE9BQU87QUFDbkIsZUFBYyxTQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxNQUFNO0FBQ2xCLGFBQVksUUFBUTtBQUNwQixjQUFhLE9BQU87QUFDcEIsZUFBYyxNQUFNO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLE1BQU07QUFDbEIsYUFBWSxRQUFRO0FBQ3BCLGFBQVksUUFBUTtBQUNwQixhQUFZLE1BQU07QUFDbEIsZUFBYyxNQUFNO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUTtBQUNSO0FBQ0E7QUFDQSxPQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0EsUUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLE1BQU07QUFDbEIsYUFBWSxNQUFNO0FBQ2xCLGVBQWMsTUFBTTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7OztBQUdBLFFBQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxFQUFFO0FBQ2QsZUFBYyxRQUFRO0FBQ3RCO0FBQ0E7QUFDQSwrQkFBOEIsa0JBQWtCLEVBQUU7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLEVBQUU7QUFDZCxlQUFjLFFBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEwQixrQkFBa0IsRUFBRTtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLEVBQUU7QUFDZCxhQUFZLEVBQUU7QUFDZCxhQUFZLEVBQUU7QUFDZCxlQUFjLFFBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0EsUUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxFQUFFO0FBQ2QsYUFBWSxPQUFPO0FBQ25CLGVBQWMsUUFBUTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7OztBQUdBLFFBQU87QUFDUDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxHQUFFOztBQUVGLHdDQUF1Qyx1Q0FBdUMsa0JBQWtCOztBQUVoRzs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFJO0FBQ0o7O0FBRUE7O0FBRUEsUUFBTztBQUNQO0FBQ0E7O0FBRUE7OztBQUdBLFFBQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxNQUFNO0FBQ2xCLGFBQVksUUFBUTtBQUNwQixhQUFZLHVCQUF1QjtBQUNuQyxhQUFZLEVBQUU7QUFDZCxlQUFjLE1BQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLGNBQWEsU0FBUyxHQUFHLFNBQVMsR0FBRyxTQUFTO0FBQzlDLGFBQVksU0FBUyxHQUFHLFNBQVM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7OztBQUdBLFFBQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksRUFBRTtBQUNkLGFBQVksRUFBRTtBQUNkLGFBQVksT0FBTztBQUNuQixlQUFjLFNBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLE9BQU87QUFDbkIsZUFBYyxTQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLE9BQU87QUFDbkIsYUFBWSxNQUFNO0FBQ2xCLGFBQVksU0FBUztBQUNyQixlQUFjLFFBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0EsUUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZLEVBQUU7QUFDZCxhQUFZLEVBQUU7QUFDZCxhQUFZLFNBQVM7QUFDckIsYUFBWSxRQUFRO0FBQ3BCLGFBQVksTUFBTTtBQUNsQixhQUFZLE1BQU07QUFDbEIsZUFBYyxRQUFRO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksT0FBTztBQUNuQixhQUFZLE9BQU87QUFDbkIsYUFBWSxTQUFTO0FBQ3JCLGFBQVksU0FBUztBQUNyQixhQUFZLFFBQVE7QUFDcEIsYUFBWSxNQUFNO0FBQ2xCLGFBQVksTUFBTTtBQUNsQixlQUFjLFFBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxNQUFNO0FBQ2xCLGFBQVksTUFBTTtBQUNsQixhQUFZLFNBQVM7QUFDckIsYUFBWSxTQUFTO0FBQ3JCLGFBQVksUUFBUTtBQUNwQixhQUFZLE1BQU07QUFDbEIsYUFBWSxNQUFNO0FBQ2xCLGVBQWMsUUFBUTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZO0FBQ1o7QUFDQTtBQUNBLE9BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxNQUFNO0FBQ2xCLGFBQVksU0FBUztBQUNyQixlQUFjLFFBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0EsUUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksT0FBTztBQUNuQixhQUFZLE9BQU87QUFDbkIsYUFBWSxPQUFPO0FBQ25CLGVBQWMsUUFBUTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksT0FBTztBQUNuQixhQUFZLE9BQU87QUFDbkIsYUFBWSxTQUFTO0FBQ3JCLGFBQVksU0FBUztBQUNyQixhQUFZLFFBQVE7QUFDcEIsYUFBWSxNQUFNO0FBQ2xCLGFBQVksTUFBTTtBQUNsQixlQUFjLFFBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0EsUUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksT0FBTztBQUNuQixlQUFjLE1BQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0EsUUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksT0FBTztBQUNuQixlQUFjLE1BQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0EsUUFBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksT0FBTztBQUNuQixlQUFjLE1BQU07QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxFQUFFO0FBQ2QsZUFBYyxRQUFRO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7OztBQUdBLFFBQU87QUFDUDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxFQUFFO0FBQ2QsZUFBYyxPQUFPO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxPQUFPO0FBQ25CLGVBQWMsTUFBTTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksRUFBRTtBQUNkLGVBQWMsUUFBUTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWSxPQUFPO0FBQ25CLGVBQWMsTUFBTTtBQUNwQjtBQUNBO0FBQ0EsY0FB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QUVBLFFBQU87QUFDUDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxHQUFFOztBQUVGO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0NBQXVDLGlEQUFpRDtBQUN4RixPQUFNO0FBQ047QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsNENBQTJDLCtqcEkiLCJmaWxlIjoiYnVpbGQvYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCBmYjYxMjI1ZTJmZGZjZDQ5ZGZjOFxuICoqLyIsIi8qIGNvcmUgKi9cbmltcG9ydCBDb25maWcgZnJvbSAnamF2YXNjcmlwdC9jb25maWcnO1xuaW1wb3J0IFZpZXdwb3J0IGZyb20gJ2phdmFzY3JpcHQvdmlld3BvcnQnXG5cbi8qIHV0aWxpdHkgKi9cbmltcG9ydCBjb21waWxlU2hhZGVyIGZyb20gJ2phdmFzY3JpcHQvdXRpbGl0eS9jb21waWxlU2hhZGVyJ1xuaW1wb3J0IGdldEF0dHJpYkxvY2F0aW9uIGZyb20gJ2phdmFzY3JpcHQvdXRpbGl0eS9nZXRBdHRyaWJMb2NhdGlvbidcbmltcG9ydCBnZXRVbmlmb3JtTG9jYXRpb24gZnJvbSAnamF2YXNjcmlwdC91dGlsaXR5L2dldFVuaWZvcm1Mb2NhdGlvbidcblxuLyogc2hhZGVycyAqL1xuaW1wb3J0IHZlcnRleFNoYWRlclNvdXJjZSBmcm9tICdzaGFkZXJzL3ZlcnRleFNoYWRlci5nbHNsJ1xuaW1wb3J0IHNoYWRlclNvdXJjZSBmcm9tICdzaGFkZXJzL2ZyYWN0YWwuZ2xzbCdcblxuLyogbGlicmFyaWVzICovXG5pbXBvcnQgSGFzaFN1YnNjcmliZXIgZnJvbSAnaGFzaC1zdWJzY3JpYmVyJ1xuXG52YXIgY2FudmFzICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKTtcblxudmFyIFdJRFRIICA9IHdpbmRvdy5pbm5lcldpZHRoO1xudmFyIEhFSUdIVCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuY2FudmFzLndpZHRoICA9IFdJRFRIO1xuY2FudmFzLmhlaWdodCA9IEhFSUdIVDtcblxudmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wnKTtcblxuVmlld3BvcnQuY3JlYXRlKHtcbiAgY2FudmFzOiBjYW52YXMsXG4gIGdldENvbmZpZzogQ29uZmlnLmdldENvbmZpZyxcbiAgc2V0Q29uZmlnOiBDb25maWcuc2V0Q29uZmlnXG59KTtcblxuLyogSUdOT1JJTkcgJ0lURVJBVElPTlMnIEZPUiBOT1cgKi9cbi8vIEhhc2hTdWJzY3JpYmVyLnN1YnNjcmliZShbJ2l0ZXJhdGlvbnMnXSwgKCkgPT4ge1xuLy8gICBGcmFjdGFsLk1BWF9JVEVSQVRJT05TID0gZ2V0Q29uZmlnKCkuaXRlcmF0aW9ucztcbi8vICAgcmVuZGVyZXIucmVuZGVyKCk7XG4vLyB9KTtcblxudmFyIHticmlnaHRuZXNzLCB4X21pbiwgeF9tYXgsIHlfbWluLCB5X21heH0gPSBDb25maWcuZ2V0Q29uZmlnKClcbkhhc2hTdWJzY3JpYmVyLnN1YnNjcmliZShbJ2JyaWdodG5lc3MnLCAneF9taW4nLCAneF9tYXgnLCAneV9taW4nLCAneV9tYXgnXSwgKCkgPT4ge1xuICBjb25zdCBjb25maWcgPSBDb25maWcuZ2V0Q29uZmlnKClcblxuICB4X21pbiA9IGNvbmZpZy54X21pblxuICB4X21heCA9IGNvbmZpZy54X21heFxuICB5X21pbiA9IGNvbmZpZy55X21pblxuICB5X21heCA9IGNvbmZpZy55X21heFxuXG4gIGJyaWdodG5lc3MgPSBjb25maWcuYnJpZ2h0bmVzc1xufSk7XG5cbi8qKlxuICogU2hhZGVyc1xuICovXG5cbnZhciB2ZXJ0ZXhTaGFkZXIgPSBjb21waWxlU2hhZGVyKHZlcnRleFNoYWRlclNvdXJjZSwgY29udGV4dC5WRVJURVhfU0hBREVSLCBjb250ZXh0KTtcbnZhciBmcmFnbWVudFNoYWRlciA9IGNvbXBpbGVTaGFkZXIoc2hhZGVyU291cmNlLCBjb250ZXh0LkZSQUdNRU5UX1NIQURFUiwgY29udGV4dCk7XG5cbnZhciBwcm9ncmFtID0gY29udGV4dC5jcmVhdGVQcm9ncmFtKCk7XG5jb250ZXh0LmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIpO1xuY29udGV4dC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnJhZ21lbnRTaGFkZXIpO1xuY29udGV4dC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcbmNvbnRleHQudXNlUHJvZ3JhbShwcm9ncmFtKTtcblxuLyoqXG4gKiBHZW9tZXRyeSBzZXR1cFxuICovXG5cbi8vIFNldCB1cCA0IHZlcnRpY2VzLCB3aGljaCB3ZSdsbCBkcmF3IGFzIGEgcmVjdGFuZ2xlXG4vLyB2aWEgMiB0cmlhbmdsZXNcbi8vXG4vLyAgIEEtLS1DXG4vLyAgIHwgIC98XG4vLyAgIHwgLyB8XG4vLyAgIHwvICB8XG4vLyAgIEItLS1EXG4vL1xuLy8gV2Ugb3JkZXIgdGhlbSBsaWtlIHNvLCBzbyB0aGF0IHdoZW4gd2UgZHJhdyB3aXRoXG4vLyBjb250ZXh0LlRSSUFOR0xFX1NUUklQLCB3ZSBkcmF3IHRyaWFuZ2xlIEFCQyBhbmQgQkNELlxudmFyIHZlcnRleERhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgLTEuMCwgIDEuMCwgLy8gdG9wIGxlZnRcbiAgLTEuMCwgLTEuMCwgLy8gYm90dG9tIGxlZnRcbiAgIDEuMCwgIDEuMCwgLy8gdG9wIHJpZ2h0XG4gICAxLjAsIC0xLjAgIC8vIGJvdHRvbSByaWdodFxuXSk7XG52YXIgdmVydGV4RGF0YUJ1ZmZlciA9IGNvbnRleHQuY3JlYXRlQnVmZmVyKCk7XG5jb250ZXh0LmJpbmRCdWZmZXIoY29udGV4dC5BUlJBWV9CVUZGRVIsIHZlcnRleERhdGFCdWZmZXIpO1xuY29udGV4dC5idWZmZXJEYXRhKGNvbnRleHQuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhEYXRhLCBjb250ZXh0LlNUQVRJQ19EUkFXKTtcblxuLyoqXG4gKiBBdHRyaWJ1dGUgc2V0dXBcbiAqL1xuXG4vLyBUbyBtYWtlIHRoZSBnZW9tZXRyeSBpbmZvcm1hdGlvbiBhdmFpbGFibGUgaW4gdGhlIHNoYWRlciBhcyBhdHRyaWJ1dGVzLCB3ZVxuLy8gbmVlZCB0byB0ZWxsIFdlYkdMIHdoYXQgdGhlIGxheW91dCBvZiBvdXIgZGF0YSBpbiB0aGUgdmVydGV4IGJ1ZmZlciBpcy5cbnZhciBwb3NpdGlvbkhhbmRsZSA9IGdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICdwb3NpdGlvbicsIGNvbnRleHQpO1xuY29udGV4dC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShwb3NpdGlvbkhhbmRsZSk7XG5jb250ZXh0LnZlcnRleEF0dHJpYlBvaW50ZXIocG9zaXRpb25IYW5kbGUsXG4gICAgICAgICAgICAgICAgICAgICAgIDIsIC8vIHBvc2l0aW9uIGlzIGEgdmVjMlxuICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LkZMT0FULCAvLyBlYWNoIGNvbXBvbmVudCBpcyBhIGZsb2F0XG4gICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQuRkFMU0UsIC8vIGRvbid0IG5vcm1hbGl6ZSB2YWx1ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgMiAqIDQsIC8vIHR3byA0IGJ5dGUgZmxvYXQgY29tcG9uZW50cyBwZXIgdmVydGV4XG4gICAgICAgICAgICAgICAgICAgICAgIDAgLy8gb2Zmc2V0IGludG8gZWFjaCBzcGFuIG9mIHZlcnRleCBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICk7XG5cbi8qKlxuICogRHJhd1xuICovXG5cbmZ1bmN0aW9uIGRyYXdGcmFtZSgpIHtcbiAgdmFyIGRhdGFUb1NlbmRUb0dQVSA9IG5ldyBGbG9hdDMyQXJyYXkoOSk7XG5cbiAgdmFyIHRpbWUgPSBEYXRlLm5vdygpO1xuXG4gIGRhdGFUb1NlbmRUb0dQVVswXSA9IFdJRFRIO1xuICBkYXRhVG9TZW5kVG9HUFVbMV0gPSBIRUlHSFQ7XG4gIGRhdGFUb1NlbmRUb0dQVVsyXSA9IC0wLjc5NSArIE1hdGguc2luKHRpbWUgLyAyMDAwKSAvIDQwO1xuICBkYXRhVG9TZW5kVG9HUFVbM10gPSAwLjIzMjEgKyBNYXRoLmNvcyh0aW1lIC8gMTMzMCkgLyA0MDtcbiAgZGF0YVRvU2VuZFRvR1BVWzRdID0gYnJpZ2h0bmVzc1xuICBkYXRhVG9TZW5kVG9HUFVbNV0gPSB4X21pbjtcbiAgZGF0YVRvU2VuZFRvR1BVWzZdID0geF9tYXg7XG4gIGRhdGFUb1NlbmRUb0dQVVs3XSA9IHlfbWluO1xuICBkYXRhVG9TZW5kVG9HUFVbOF0gPSB5X21heDtcblxuICB2YXIgZGF0YVBvaW50ZXIgPSBnZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ2RhdGEnLCBjb250ZXh0KTtcbiAgY29udGV4dC51bmlmb3JtMWZ2KGRhdGFQb2ludGVyLCBkYXRhVG9TZW5kVG9HUFUpO1xuICBjb250ZXh0LmRyYXdBcnJheXMoY29udGV4dC5UUklBTkdMRV9TVFJJUCwgMCwgNCk7XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXdGcmFtZSlcbn1cblxucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXdGcmFtZSlcblxuLy8gUmVuZGVyIHRoZSA0IHZlcnRpY2VzIHNwZWNpZmllZCBhYm92ZSAoc3RhcnRpbmcgYXQgaW5kZXggMClcbi8vIGluIFRSSUFOR0xFX1NUUklQIG1vZGUuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2phdmFzY3JpcHQvYXBwLmpzXG4gKiovIiwiaW1wb3J0IHBhcnNlTG9jYXRpb25IYXNoIGZyb20gJ2phdmFzY3JpcHQvdXRpbGl0eS9wYXJzZUxvY2F0aW9uSGFzaCc7XG5pbXBvcnQgc2V0TG9jYXRpb25IYXNoIGZyb20gJ2phdmFzY3JpcHQvdXRpbGl0eS9zZXRMb2NhdGlvbkhhc2gnO1xuXG5pbXBvcnQgYXNzaWduIGZyb20gJ2xvZGFzaC9hc3NpZ24nXG5cbmNvbnN0IERFRkFVTFRfQ09ORklHID0ge1xuICB4X21pbjogLTIuMCxcbiAgeF9tYXg6ICAyLjAsXG4gIHlfbWluOiAtMS4yNSxcbiAgeV9tYXg6ICAxLjI1LFxuXG4gIGJyaWdodG5lc3M6IDguMFxufTtcblxuY29uc3QgQ29uZmlnID0ge1xuICBjdXJyZW50Q29uZmlnOiB7fSxcbiAgZ2V0Q29uZmlnKGxvY2F0aW9uSGFzaCA9IHBhcnNlTG9jYXRpb25IYXNoKCkpIHtcbiAgICBDb25maWcuY3VycmVudENvbmZpZyA9IGFzc2lnbih7fSwgREVGQVVMVF9DT05GSUcsIGxvY2F0aW9uSGFzaCk7XG5cbiAgICByZXR1cm4gQ29uZmlnLmN1cnJlbnRDb25maWc7XG4gIH0sXG4gIHNldENvbmZpZyhjb25maWdDaGFuZ2VzKSB7XG4gICAgY29uc3QgbmV3Q29uZmlnID0gYXNzaWduKHt9LCBDb25maWcuZ2V0Q29uZmlnKCksIGNvbmZpZ0NoYW5nZXMpO1xuXG4gICAgc2V0TG9jYXRpb25IYXNoKG5ld0NvbmZpZyk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvbmZpZztcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vamF2YXNjcmlwdC9jb25maWcuanNcbiAqKi8iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihxdWVyeSA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gIHZhciBrZXlWYWx1ZVBhaXJzO1xuICBpZiAocXVlcnkubGVuZ3RoID4gMCkge1xuICAgIGtleVZhbHVlUGFpcnMgPSBxdWVyeS5zbGljZSgxKS5zcGxpdCgnJicpO1xuICB9IGVsc2Uge1xuICAgIGtleVZhbHVlUGFpcnMgPSBbXTtcbiAgfVxuXG4gIHJldHVybiBrZXlWYWx1ZVBhaXJzLnJlZHVjZSgoaGFzaCwga2V5VmFsdWVQYWlyKSA9PiB7XG4gICAgbGV0IFtrZXksIHZhbHVlXSA9IGtleVZhbHVlUGFpci5zcGxpdCgnPScpO1xuXG4gICAgaWYgKHZhbHVlICYmIGlzTmFOKHZhbHVlKSkge1xuICAgICAgaGFzaFtrZXldID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhc2hba2V5XSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBoYXNoO1xuICB9LCB7fSk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2phdmFzY3JpcHQvdXRpbGl0eS9wYXJzZUxvY2F0aW9uSGFzaC5qc1xuICoqLyIsImltcG9ydCBtYXAgZnJvbSAnbG9kYXNoL21hcCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHF1ZXJ5KSB7XG4gIHZhciBrZXlWYWx1ZVBhaXJzID0gbWFwKHF1ZXJ5LCAodmFsdWUsIGtleSkgPT4ge1xuICAgIHJldHVybiBba2V5LCB2YWx1ZV0uam9pbignPScpO1xuICB9KTtcblxuICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZSgnIycgKyBrZXlWYWx1ZVBhaXJzLmpvaW4oJyYnKSk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2phdmFzY3JpcHQvdXRpbGl0eS9zZXRMb2NhdGlvbkhhc2guanNcbiAqKi8iLCJ2YXIgYXJyYXlNYXAgPSByZXF1aXJlKCcuL19hcnJheU1hcCcpLFxuICAgIGJhc2VJdGVyYXRlZSA9IHJlcXVpcmUoJy4vX2Jhc2VJdGVyYXRlZScpLFxuICAgIGJhc2VNYXAgPSByZXF1aXJlKCcuL19iYXNlTWFwJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdmFsdWVzIGJ5IHJ1bm5pbmcgZWFjaCBlbGVtZW50IGluIGBjb2xsZWN0aW9uYCB0aHJ1XG4gKiBgaXRlcmF0ZWVgLiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAqXG4gKiBNYW55IGxvZGFzaCBtZXRob2RzIGFyZSBndWFyZGVkIHRvIHdvcmsgYXMgaXRlcmF0ZWVzIGZvciBtZXRob2RzIGxpa2VcbiAqIGBfLmV2ZXJ5YCwgYF8uZmlsdGVyYCwgYF8ubWFwYCwgYF8ubWFwVmFsdWVzYCwgYF8ucmVqZWN0YCwgYW5kIGBfLnNvbWVgLlxuICpcbiAqIFRoZSBndWFyZGVkIG1ldGhvZHMgYXJlOlxuICogYGFyeWAsIGBjaHVua2AsIGBjdXJyeWAsIGBjdXJyeVJpZ2h0YCwgYGRyb3BgLCBgZHJvcFJpZ2h0YCwgYGV2ZXJ5YCxcbiAqIGBmaWxsYCwgYGludmVydGAsIGBwYXJzZUludGAsIGByYW5kb21gLCBgcmFuZ2VgLCBgcmFuZ2VSaWdodGAsIGByZXBlYXRgLFxuICogYHNhbXBsZVNpemVgLCBgc2xpY2VgLCBgc29tZWAsIGBzb3J0QnlgLCBgc3BsaXRgLCBgdGFrZWAsIGB0YWtlUmlnaHRgLFxuICogYHRlbXBsYXRlYCwgYHRyaW1gLCBgdHJpbUVuZGAsIGB0cmltU3RhcnRgLCBhbmQgYHdvcmRzYFxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtpdGVyYXRlZT1fLmlkZW50aXR5XVxuICogIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBtYXBwZWQgYXJyYXkuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIHNxdWFyZShuKSB7XG4gKiAgIHJldHVybiBuICogbjtcbiAqIH1cbiAqXG4gKiBfLm1hcChbNCwgOF0sIHNxdWFyZSk7XG4gKiAvLyA9PiBbMTYsIDY0XVxuICpcbiAqIF8ubWFwKHsgJ2EnOiA0LCAnYic6IDggfSwgc3F1YXJlKTtcbiAqIC8vID0+IFsxNiwgNjRdIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKlxuICogdmFyIHVzZXJzID0gW1xuICogICB7ICd1c2VyJzogJ2Jhcm5leScgfSxcbiAqICAgeyAndXNlcic6ICdmcmVkJyB9XG4gKiBdO1xuICpcbiAqIC8vIFRoZSBgXy5wcm9wZXJ0eWAgaXRlcmF0ZWUgc2hvcnRoYW5kLlxuICogXy5tYXAodXNlcnMsICd1c2VyJyk7XG4gKiAvLyA9PiBbJ2Jhcm5leScsICdmcmVkJ11cbiAqL1xuZnVuY3Rpb24gbWFwKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKSB7XG4gIHZhciBmdW5jID0gaXNBcnJheShjb2xsZWN0aW9uKSA/IGFycmF5TWFwIDogYmFzZU1hcDtcbiAgcmV0dXJuIGZ1bmMoY29sbGVjdGlvbiwgYmFzZUl0ZXJhdGVlKGl0ZXJhdGVlLCAzKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL21hcC5qc1xuICoqIG1vZHVsZSBpZCA9IDRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLm1hcGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlXG4gKiBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheU1hcChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDAsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5TWFwO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19hcnJheU1hcC5qc1xuICoqIG1vZHVsZSBpZCA9IDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBiYXNlTWF0Y2hlcyA9IHJlcXVpcmUoJy4vX2Jhc2VNYXRjaGVzJyksXG4gICAgYmFzZU1hdGNoZXNQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX2Jhc2VNYXRjaGVzUHJvcGVydHknKSxcbiAgICBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHknKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgcHJvcGVydHkgPSByZXF1aXJlKCcuL3Byb3BlcnR5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXRlcmF0ZWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IFt2YWx1ZT1fLmlkZW50aXR5XSBUaGUgdmFsdWUgdG8gY29udmVydCB0byBhbiBpdGVyYXRlZS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgaXRlcmF0ZWUuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJdGVyYXRlZSh2YWx1ZSkge1xuICAvLyBEb24ndCBzdG9yZSB0aGUgYHR5cGVvZmAgcmVzdWx0IGluIGEgdmFyaWFibGUgdG8gYXZvaWQgYSBKSVQgYnVnIGluIFNhZmFyaSA5LlxuICAvLyBTZWUgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE1NjAzNCBmb3IgbW9yZSBkZXRhaWxzLlxuICBpZiAodHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gaWRlbnRpdHk7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBpc0FycmF5KHZhbHVlKVxuICAgICAgPyBiYXNlTWF0Y2hlc1Byb3BlcnR5KHZhbHVlWzBdLCB2YWx1ZVsxXSlcbiAgICAgIDogYmFzZU1hdGNoZXModmFsdWUpO1xuICB9XG4gIHJldHVybiBwcm9wZXJ0eSh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUl0ZXJhdGVlO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19iYXNlSXRlcmF0ZWUuanNcbiAqKiBtb2R1bGUgaWQgPSA2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZUlzTWF0Y2ggPSByZXF1aXJlKCcuL19iYXNlSXNNYXRjaCcpLFxuICAgIGdldE1hdGNoRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hdGNoRGF0YScpLFxuICAgIG1hdGNoZXNTdHJpY3RDb21wYXJhYmxlID0gcmVxdWlyZSgnLi9fbWF0Y2hlc1N0cmljdENvbXBhcmFibGUnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5tYXRjaGVzYCB3aGljaCBkb2Vzbid0IGNsb25lIGBzb3VyY2VgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3Qgb2YgcHJvcGVydHkgdmFsdWVzIHRvIG1hdGNoLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc3BlYyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZU1hdGNoZXMoc291cmNlKSB7XG4gIHZhciBtYXRjaERhdGEgPSBnZXRNYXRjaERhdGEoc291cmNlKTtcbiAgaWYgKG1hdGNoRGF0YS5sZW5ndGggPT0gMSAmJiBtYXRjaERhdGFbMF1bMl0pIHtcbiAgICByZXR1cm4gbWF0Y2hlc1N0cmljdENvbXBhcmFibGUobWF0Y2hEYXRhWzBdWzBdLCBtYXRjaERhdGFbMF1bMV0pO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0ID09PSBzb3VyY2UgfHwgYmFzZUlzTWF0Y2gob2JqZWN0LCBzb3VyY2UsIG1hdGNoRGF0YSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZU1hdGNoZXM7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2Jhc2VNYXRjaGVzLmpzXG4gKiogbW9kdWxlIGlkID0gN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIFN0YWNrID0gcmVxdWlyZSgnLi9fU3RhY2snKSxcbiAgICBiYXNlSXNFcXVhbCA9IHJlcXVpcmUoJy4vX2Jhc2VJc0VxdWFsJyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNvbXBhcmlzb24gc3R5bGVzLiAqL1xudmFyIFVOT1JERVJFRF9DT01QQVJFX0ZMQUcgPSAxLFxuICAgIFBBUlRJQUxfQ09NUEFSRV9GTEFHID0gMjtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc01hdGNoYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IG9mIHByb3BlcnR5IHZhbHVlcyB0byBtYXRjaC5cbiAqIEBwYXJhbSB7QXJyYXl9IG1hdGNoRGF0YSBUaGUgcHJvcGVydHkgbmFtZXMsIHZhbHVlcywgYW5kIGNvbXBhcmUgZmxhZ3MgdG8gbWF0Y2guXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpc29ucy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgb2JqZWN0YCBpcyBhIG1hdGNoLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc01hdGNoKG9iamVjdCwgc291cmNlLCBtYXRjaERhdGEsIGN1c3RvbWl6ZXIpIHtcbiAgdmFyIGluZGV4ID0gbWF0Y2hEYXRhLmxlbmd0aCxcbiAgICAgIGxlbmd0aCA9IGluZGV4LFxuICAgICAgbm9DdXN0b21pemVyID0gIWN1c3RvbWl6ZXI7XG5cbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuICFsZW5ndGg7XG4gIH1cbiAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gIHdoaWxlIChpbmRleC0tKSB7XG4gICAgdmFyIGRhdGEgPSBtYXRjaERhdGFbaW5kZXhdO1xuICAgIGlmICgobm9DdXN0b21pemVyICYmIGRhdGFbMl0pXG4gICAgICAgICAgPyBkYXRhWzFdICE9PSBvYmplY3RbZGF0YVswXV1cbiAgICAgICAgICA6ICEoZGF0YVswXSBpbiBvYmplY3QpXG4gICAgICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGRhdGEgPSBtYXRjaERhdGFbaW5kZXhdO1xuICAgIHZhciBrZXkgPSBkYXRhWzBdLFxuICAgICAgICBvYmpWYWx1ZSA9IG9iamVjdFtrZXldLFxuICAgICAgICBzcmNWYWx1ZSA9IGRhdGFbMV07XG5cbiAgICBpZiAobm9DdXN0b21pemVyICYmIGRhdGFbMl0pIHtcbiAgICAgIGlmIChvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkICYmICEoa2V5IGluIG9iamVjdCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3RhY2sgPSBuZXcgU3RhY2s7XG4gICAgICBpZiAoY3VzdG9taXplcikge1xuICAgICAgICB2YXIgcmVzdWx0ID0gY3VzdG9taXplcihvYmpWYWx1ZSwgc3JjVmFsdWUsIGtleSwgb2JqZWN0LCBzb3VyY2UsIHN0YWNrKTtcbiAgICAgIH1cbiAgICAgIGlmICghKHJlc3VsdCA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGJhc2VJc0VxdWFsKHNyY1ZhbHVlLCBvYmpWYWx1ZSwgY3VzdG9taXplciwgVU5PUkRFUkVEX0NPTVBBUkVfRkxBRyB8IFBBUlRJQUxfQ09NUEFSRV9GTEFHLCBzdGFjaylcbiAgICAgICAgICAgIDogcmVzdWx0XG4gICAgICAgICAgKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc01hdGNoO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19iYXNlSXNNYXRjaC5qc1xuICoqIG1vZHVsZSBpZCA9IDhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBzdGFja0NsZWFyID0gcmVxdWlyZSgnLi9fc3RhY2tDbGVhcicpLFxuICAgIHN0YWNrRGVsZXRlID0gcmVxdWlyZSgnLi9fc3RhY2tEZWxldGUnKSxcbiAgICBzdGFja0dldCA9IHJlcXVpcmUoJy4vX3N0YWNrR2V0JyksXG4gICAgc3RhY2tIYXMgPSByZXF1aXJlKCcuL19zdGFja0hhcycpLFxuICAgIHN0YWNrU2V0ID0gcmVxdWlyZSgnLi9fc3RhY2tTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgc3RhY2sgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gU3RhY2soZW50cmllcykge1xuICB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZShlbnRyaWVzKTtcbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYFN0YWNrYC5cblN0YWNrLnByb3RvdHlwZS5jbGVhciA9IHN0YWNrQ2xlYXI7XG5TdGFjay5wcm90b3R5cGVbJ2RlbGV0ZSddID0gc3RhY2tEZWxldGU7XG5TdGFjay5wcm90b3R5cGUuZ2V0ID0gc3RhY2tHZXQ7XG5TdGFjay5wcm90b3R5cGUuaGFzID0gc3RhY2tIYXM7XG5TdGFjay5wcm90b3R5cGUuc2V0ID0gc3RhY2tTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhY2s7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX1N0YWNrLmpzXG4gKiogbW9kdWxlIGlkID0gOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGxpc3RDYWNoZUNsZWFyID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlQ2xlYXInKSxcbiAgICBsaXN0Q2FjaGVEZWxldGUgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVEZWxldGUnKSxcbiAgICBsaXN0Q2FjaGVHZXQgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVHZXQnKSxcbiAgICBsaXN0Q2FjaGVIYXMgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVIYXMnKSxcbiAgICBsaXN0Q2FjaGVTZXQgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGxpc3QgY2FjaGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBMaXN0Q2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPyBlbnRyaWVzLmxlbmd0aCA6IDA7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYExpc3RDYWNoZWAuXG5MaXN0Q2FjaGUucHJvdG90eXBlLmNsZWFyID0gbGlzdENhY2hlQ2xlYXI7XG5MaXN0Q2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IGxpc3RDYWNoZURlbGV0ZTtcbkxpc3RDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbGlzdENhY2hlR2V0O1xuTGlzdENhY2hlLnByb3RvdHlwZS5oYXMgPSBsaXN0Q2FjaGVIYXM7XG5MaXN0Q2FjaGUucHJvdG90eXBlLnNldCA9IGxpc3RDYWNoZVNldDtcblxubW9kdWxlLmV4cG9ydHMgPSBMaXN0Q2FjaGU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX0xpc3RDYWNoZS5qc1xuICoqIG1vZHVsZSBpZCA9IDEwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUNsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gW107XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlQ2xlYXI7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2xpc3RDYWNoZUNsZWFyLmpzXG4gKiogbW9kdWxlIGlkID0gMTFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHNwbGljZSA9IGFycmF5UHJvdG8uc3BsaWNlO1xuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgaWYgKGluZGV4IDwgMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgbGFzdEluZGV4ID0gZGF0YS5sZW5ndGggLSAxO1xuICBpZiAoaW5kZXggPT0gbGFzdEluZGV4KSB7XG4gICAgZGF0YS5wb3AoKTtcbiAgfSBlbHNlIHtcbiAgICBzcGxpY2UuY2FsbChkYXRhLCBpbmRleCwgMSk7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlRGVsZXRlO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19saXN0Q2FjaGVEZWxldGUuanNcbiAqKiBtb2R1bGUgaWQgPSAxMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGVxID0gcmVxdWlyZSgnLi9lcScpO1xuXG4vKipcbiAqIEdldHMgdGhlIGluZGV4IGF0IHdoaWNoIHRoZSBga2V5YCBpcyBmb3VuZCBpbiBgYXJyYXlgIG9mIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNlYXJjaC5cbiAqIEBwYXJhbSB7Kn0ga2V5IFRoZSBrZXkgdG8gc2VhcmNoIGZvci5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGFzc29jSW5kZXhPZihhcnJheSwga2V5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gIHdoaWxlIChsZW5ndGgtLSkge1xuICAgIGlmIChlcShhcnJheVtsZW5ndGhdWzBdLCBrZXkpKSB7XG4gICAgICByZXR1cm4gbGVuZ3RoO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzb2NJbmRleE9mO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19hc3NvY0luZGV4T2YuanNcbiAqKiBtb2R1bGUgaWQgPSAxM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBQZXJmb3JtcyBhXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogY29tcGFyaXNvbiBiZXR3ZWVuIHR3byB2YWx1ZXMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ3VzZXInOiAnZnJlZCcgfTtcbiAqIHZhciBvdGhlciA9IHsgJ3VzZXInOiAnZnJlZCcgfTtcbiAqXG4gKiBfLmVxKG9iamVjdCwgb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKG9iamVjdCwgb3RoZXIpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKCdhJywgJ2EnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKCdhJywgT2JqZWN0KCdhJykpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKE5hTiwgTmFOKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gZXEodmFsdWUsIG90aGVyKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gb3RoZXIgfHwgKHZhbHVlICE9PSB2YWx1ZSAmJiBvdGhlciAhPT0gb3RoZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVxO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2VxLmpzXG4gKiogbW9kdWxlIGlkID0gMTRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlR2V0KGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIHJldHVybiBpbmRleCA8IDAgPyB1bmRlZmluZWQgOiBkYXRhW2luZGV4XVsxXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVHZXQ7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2xpc3RDYWNoZUdldC5qc1xuICoqIG1vZHVsZSBpZCA9IDE1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBhc3NvY0luZGV4T2YodGhpcy5fX2RhdGFfXywga2V5KSA+IC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZUhhcztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fbGlzdENhY2hlSGFzLmpzXG4gKiogbW9kdWxlIGlkID0gMTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBsaXN0IGNhY2hlIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBsaXN0IGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICBkYXRhLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgfSBlbHNlIHtcbiAgICBkYXRhW2luZGV4XVsxXSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZVNldDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fbGlzdENhY2hlU2V0LmpzXG4gKiogbW9kdWxlIGlkID0gMTdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBTdGFja1xuICovXG5mdW5jdGlvbiBzdGFja0NsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0NsZWFyO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19zdGFja0NsZWFyLmpzXG4gKiogbW9kdWxlIGlkID0gMThcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIHN0YWNrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrRGVsZXRlKGtleSkge1xuICByZXR1cm4gdGhpcy5fX2RhdGFfX1snZGVsZXRlJ10oa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0RlbGV0ZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fc3RhY2tEZWxldGUuanNcbiAqKiBtb2R1bGUgaWQgPSAxOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBHZXRzIHRoZSBzdGFjayB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gc3RhY2tHZXQoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmdldChrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrR2V0O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19zdGFja0dldC5qc1xuICoqIG1vZHVsZSBpZCA9IDIwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIENoZWNrcyBpZiBhIHN0YWNrIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tIYXMoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyhrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrSGFzO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19zdGFja0hhcy5qc1xuICoqIG1vZHVsZSBpZCA9IDIxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyksXG4gICAgTWFwQ2FjaGUgPSByZXF1aXJlKCcuL19NYXBDYWNoZScpO1xuXG4vKiogVXNlZCBhcyB0aGUgc2l6ZSB0byBlbmFibGUgbGFyZ2UgYXJyYXkgb3B0aW1pemF0aW9ucy4gKi9cbnZhciBMQVJHRV9BUlJBWV9TSVpFID0gMjAwO1xuXG4vKipcbiAqIFNldHMgdGhlIHN0YWNrIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIHN0YWNrIGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBzdGFja1NldChrZXksIHZhbHVlKSB7XG4gIHZhciBjYWNoZSA9IHRoaXMuX19kYXRhX187XG4gIGlmIChjYWNoZSBpbnN0YW5jZW9mIExpc3RDYWNoZSAmJiBjYWNoZS5fX2RhdGFfXy5sZW5ndGggPT0gTEFSR0VfQVJSQVlfU0laRSkge1xuICAgIGNhY2hlID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBNYXBDYWNoZShjYWNoZS5fX2RhdGFfXyk7XG4gIH1cbiAgY2FjaGUuc2V0KGtleSwgdmFsdWUpO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja1NldDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fc3RhY2tTZXQuanNcbiAqKiBtb2R1bGUgaWQgPSAyMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIG1hcENhY2hlQ2xlYXIgPSByZXF1aXJlKCcuL19tYXBDYWNoZUNsZWFyJyksXG4gICAgbWFwQ2FjaGVEZWxldGUgPSByZXF1aXJlKCcuL19tYXBDYWNoZURlbGV0ZScpLFxuICAgIG1hcENhY2hlR2V0ID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVHZXQnKSxcbiAgICBtYXBDYWNoZUhhcyA9IHJlcXVpcmUoJy4vX21hcENhY2hlSGFzJyksXG4gICAgbWFwQ2FjaGVTZXQgPSByZXF1aXJlKCcuL19tYXBDYWNoZVNldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXAgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTWFwQ2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPyBlbnRyaWVzLmxlbmd0aCA6IDA7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYE1hcENhY2hlYC5cbk1hcENhY2hlLnByb3RvdHlwZS5jbGVhciA9IG1hcENhY2hlQ2xlYXI7XG5NYXBDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbWFwQ2FjaGVEZWxldGU7XG5NYXBDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbWFwQ2FjaGVHZXQ7XG5NYXBDYWNoZS5wcm90b3R5cGUuaGFzID0gbWFwQ2FjaGVIYXM7XG5NYXBDYWNoZS5wcm90b3R5cGUuc2V0ID0gbWFwQ2FjaGVTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ2FjaGU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX01hcENhY2hlLmpzXG4gKiogbW9kdWxlIGlkID0gMjNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBIYXNoID0gcmVxdWlyZSgnLi9fSGFzaCcpLFxuICAgIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUNsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0ge1xuICAgICdoYXNoJzogbmV3IEhhc2gsXG4gICAgJ21hcCc6IG5ldyAoTWFwIHx8IExpc3RDYWNoZSksXG4gICAgJ3N0cmluZyc6IG5ldyBIYXNoXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVDbGVhcjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fbWFwQ2FjaGVDbGVhci5qc1xuICoqIG1vZHVsZSBpZCA9IDI0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaGFzaENsZWFyID0gcmVxdWlyZSgnLi9faGFzaENsZWFyJyksXG4gICAgaGFzaERlbGV0ZSA9IHJlcXVpcmUoJy4vX2hhc2hEZWxldGUnKSxcbiAgICBoYXNoR2V0ID0gcmVxdWlyZSgnLi9faGFzaEdldCcpLFxuICAgIGhhc2hIYXMgPSByZXF1aXJlKCcuL19oYXNoSGFzJyksXG4gICAgaGFzaFNldCA9IHJlcXVpcmUoJy4vX2hhc2hTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgaGFzaCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIEhhc2goZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPyBlbnRyaWVzLmxlbmd0aCA6IDA7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYEhhc2hgLlxuSGFzaC5wcm90b3R5cGUuY2xlYXIgPSBoYXNoQ2xlYXI7XG5IYXNoLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBoYXNoRGVsZXRlO1xuSGFzaC5wcm90b3R5cGUuZ2V0ID0gaGFzaEdldDtcbkhhc2gucHJvdG90eXBlLmhhcyA9IGhhc2hIYXM7XG5IYXNoLnByb3RvdHlwZS5zZXQgPSBoYXNoU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2g7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX0hhc2guanNcbiAqKiBtb2R1bGUgaWQgPSAyNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgSGFzaFxuICovXG5mdW5jdGlvbiBoYXNoQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuYXRpdmVDcmVhdGUgPyBuYXRpdmVDcmVhdGUobnVsbCkgOiB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoQ2xlYXI7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2hhc2hDbGVhci5qc1xuICoqIG1vZHVsZSBpZCA9IDI2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBuYXRpdmVDcmVhdGUgPSBnZXROYXRpdmUoT2JqZWN0LCAnY3JlYXRlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmF0aXZlQ3JlYXRlO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19uYXRpdmVDcmVhdGUuanNcbiAqKiBtb2R1bGUgaWQgPSAyN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGJhc2VJc05hdGl2ZSA9IHJlcXVpcmUoJy4vX2Jhc2VJc05hdGl2ZScpLFxuICAgIGdldFZhbHVlID0gcmVxdWlyZSgnLi9fZ2V0VmFsdWUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IGdldFZhbHVlKG9iamVjdCwga2V5KTtcbiAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXROYXRpdmU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2dldE5hdGl2ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDI4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXNGdW5jdGlvbicpLFxuICAgIGlzSG9zdE9iamVjdCA9IHJlcXVpcmUoJy4vX2lzSG9zdE9iamVjdCcpLFxuICAgIGlzTWFza2VkID0gcmVxdWlyZSgnLi9faXNNYXNrZWQnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICB0b1NvdXJjZSA9IHJlcXVpcmUoJy4vX3RvU291cmNlJyk7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSAoaXNGdW5jdGlvbih2YWx1ZSkgfHwgaXNIb3N0T2JqZWN0KHZhbHVlKSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzTmF0aXZlO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19iYXNlSXNOYXRpdmUuanNcbiAqKiBtb2R1bGUgaWQgPSAyOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOCB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheSBhbmQgd2VhayBtYXAgY29uc3RydWN0b3JzLFxuICAvLyBhbmQgUGhhbnRvbUpTIDEuOSB3aGljaCByZXR1cm5zICdmdW5jdGlvbicgZm9yIGBOb2RlTGlzdGAgaW5zdGFuY2VzLlxuICB2YXIgdGFnID0gaXNPYmplY3QodmFsdWUpID8gb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pc0Z1bmN0aW9uLmpzXG4gKiogbW9kdWxlIGlkID0gMzBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2lzT2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gMzFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCBpbiBJRSA8IDkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0hvc3RPYmplY3QodmFsdWUpIHtcbiAgLy8gTWFueSBob3N0IG9iamVjdHMgYXJlIGBPYmplY3RgIG9iamVjdHMgdGhhdCBjYW4gY29lcmNlIHRvIHN0cmluZ3NcbiAgLy8gZGVzcGl0ZSBoYXZpbmcgaW1wcm9wZXJseSBkZWZpbmVkIGB0b1N0cmluZ2AgbWV0aG9kcy5cbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICBpZiAodmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSAhISh2YWx1ZSArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNIb3N0T2JqZWN0O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19pc0hvc3RPYmplY3QuanNcbiAqKiBtb2R1bGUgaWQgPSAzMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGNvcmVKc0RhdGEgPSByZXF1aXJlKCcuL19jb3JlSnNEYXRhJyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNNYXNrZWQ7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2lzTWFza2VkLmpzXG4gKiogbW9kdWxlIGlkID0gMzNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmVKc0RhdGE7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2NvcmVKc0RhdGEuanNcbiAqKiBtb2R1bGUgaWQgPSAzNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGNoZWNrR2xvYmFsID0gcmVxdWlyZSgnLi9fY2hlY2tHbG9iYWwnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gY2hlY2tHbG9iYWwodHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gY2hlY2tHbG9iYWwodHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZik7XG5cbi8qKiBEZXRlY3QgYHRoaXNgIGFzIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHRoaXNHbG9iYWwgPSBjaGVja0dsb2JhbCh0eXBlb2YgdGhpcyA9PSAnb2JqZWN0JyAmJiB0aGlzKTtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgdGhpc0dsb2JhbCB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvb3Q7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX3Jvb3QuanNcbiAqKiBtb2R1bGUgaWQgPSAzNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGdsb2JhbCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge251bGx8T2JqZWN0fSBSZXR1cm5zIGB2YWx1ZWAgaWYgaXQncyBhIGdsb2JhbCBvYmplY3QsIGVsc2UgYG51bGxgLlxuICovXG5mdW5jdGlvbiBjaGVja0dsb2JhbCh2YWx1ZSkge1xuICByZXR1cm4gKHZhbHVlICYmIHZhbHVlLk9iamVjdCA9PT0gT2JqZWN0KSA/IHZhbHVlIDogbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjaGVja0dsb2JhbDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fY2hlY2tHbG9iYWwuanNcbiAqKiBtb2R1bGUgaWQgPSAzNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvU291cmNlO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL190b1NvdXJjZS5qc1xuICoqIG1vZHVsZSBpZCA9IDM3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRWYWx1ZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fZ2V0VmFsdWUuanNcbiAqKiBtb2R1bGUgaWQgPSAzOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtPYmplY3R9IGhhc2ggVGhlIGhhc2ggdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc2hEZWxldGUoa2V5KSB7XG4gIHJldHVybiB0aGlzLmhhcyhrZXkpICYmIGRlbGV0ZSB0aGlzLl9fZGF0YV9fW2tleV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaERlbGV0ZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9faGFzaERlbGV0ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDM5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBHZXRzIHRoZSBoYXNoIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGhhc2hHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgaWYgKG5hdGl2ZUNyZWF0ZSkge1xuICAgIHZhciByZXN1bHQgPSBkYXRhW2tleV07XG4gICAgcmV0dXJuIHJlc3VsdCA9PT0gSEFTSF9VTkRFRklORUQgPyB1bmRlZmluZWQgOiByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KSA/IGRhdGFba2V5XSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoR2V0O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19oYXNoR2V0LmpzXG4gKiogbW9kdWxlIGlkID0gNDBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBoYXNoIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoSGFzKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHJldHVybiBuYXRpdmVDcmVhdGUgPyBkYXRhW2tleV0gIT09IHVuZGVmaW5lZCA6IGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoSGFzO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19oYXNoSGFzLmpzXG4gKiogbW9kdWxlIGlkID0gNDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKipcbiAqIFNldHMgdGhlIGhhc2ggYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBoYXNoIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBoYXNoU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBkYXRhW2tleV0gPSAobmF0aXZlQ3JlYXRlICYmIHZhbHVlID09PSB1bmRlZmluZWQpID8gSEFTSF9VTkRFRklORUQgOiB2YWx1ZTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaFNldDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9faGFzaFNldC5qc1xuICoqIG1vZHVsZSBpZCA9IDQyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIE1hcCA9IGdldE5hdGl2ZShyb290LCAnTWFwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19NYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA0M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZURlbGV0ZShrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KVsnZGVsZXRlJ10oa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZURlbGV0ZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fbWFwQ2FjaGVEZWxldGUuanNcbiAqKiBtb2R1bGUgaWQgPSA0NFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzS2V5YWJsZSA9IHJlcXVpcmUoJy4vX2lzS2V5YWJsZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIGRhdGEgZm9yIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2Uga2V5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1hcCBkYXRhLlxuICovXG5mdW5jdGlvbiBnZXRNYXBEYXRhKG1hcCwga2V5KSB7XG4gIHZhciBkYXRhID0gbWFwLl9fZGF0YV9fO1xuICByZXR1cm4gaXNLZXlhYmxlKGtleSlcbiAgICA/IGRhdGFbdHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/ICdzdHJpbmcnIDogJ2hhc2gnXVxuICAgIDogZGF0YS5tYXA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TWFwRGF0YTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fZ2V0TWFwRGF0YS5qc1xuICoqIG1vZHVsZSBpZCA9IDQ1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlIGZvciB1c2UgYXMgdW5pcXVlIG9iamVjdCBrZXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNLZXlhYmxlKHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gKHR5cGUgPT0gJ3N0cmluZycgfHwgdHlwZSA9PSAnbnVtYmVyJyB8fCB0eXBlID09ICdzeW1ib2wnIHx8IHR5cGUgPT0gJ2Jvb2xlYW4nKVxuICAgID8gKHZhbHVlICE9PSAnX19wcm90b19fJylcbiAgICA6ICh2YWx1ZSA9PT0gbnVsbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNLZXlhYmxlO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19pc0tleWFibGUuanNcbiAqKiBtb2R1bGUgaWQgPSA0NlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbWFwIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUdldChrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5nZXQoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZUdldDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fbWFwQ2FjaGVHZXQuanNcbiAqKiBtb2R1bGUgaWQgPSA0N1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbWFwIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuaGFzKGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVIYXM7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX21hcENhY2hlSGFzLmpzXG4gKiogbW9kdWxlIGlkID0gNDhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIFNldHMgdGhlIG1hcCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBtYXAgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLnNldChrZXksIHZhbHVlKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVTZXQ7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX21hcENhY2hlU2V0LmpzXG4gKiogbW9kdWxlIGlkID0gNDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBiYXNlSXNFcXVhbERlZXAgPSByZXF1aXJlKCcuL19iYXNlSXNFcXVhbERlZXAnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzRXF1YWxgIHdoaWNoIHN1cHBvcnRzIHBhcnRpYWwgY29tcGFyaXNvbnNcbiAqIGFuZCB0cmFja3MgdHJhdmVyc2VkIG9iamVjdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtiaXRtYXNrXSBUaGUgYml0bWFzayBvZiBjb21wYXJpc29uIGZsYWdzLlxuICogIFRoZSBiaXRtYXNrIG1heSBiZSBjb21wb3NlZCBvZiB0aGUgZm9sbG93aW5nIGZsYWdzOlxuICogICAgIDEgLSBVbm9yZGVyZWQgY29tcGFyaXNvblxuICogICAgIDIgLSBQYXJ0aWFsIGNvbXBhcmlzb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBbc3RhY2tdIFRyYWNrcyB0cmF2ZXJzZWQgYHZhbHVlYCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzRXF1YWwodmFsdWUsIG90aGVyLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjaykge1xuICBpZiAodmFsdWUgPT09IG90aGVyKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKHZhbHVlID09IG51bGwgfHwgb3RoZXIgPT0gbnVsbCB8fCAoIWlzT2JqZWN0KHZhbHVlKSAmJiAhaXNPYmplY3RMaWtlKG90aGVyKSkpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcjtcbiAgfVxuICByZXR1cm4gYmFzZUlzRXF1YWxEZWVwKHZhbHVlLCBvdGhlciwgYmFzZUlzRXF1YWwsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNFcXVhbDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fYmFzZUlzRXF1YWwuanNcbiAqKiBtb2R1bGUgaWQgPSA1MFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIFN0YWNrID0gcmVxdWlyZSgnLi9fU3RhY2snKSxcbiAgICBlcXVhbEFycmF5cyA9IHJlcXVpcmUoJy4vX2VxdWFsQXJyYXlzJyksXG4gICAgZXF1YWxCeVRhZyA9IHJlcXVpcmUoJy4vX2VxdWFsQnlUYWcnKSxcbiAgICBlcXVhbE9iamVjdHMgPSByZXF1aXJlKCcuL19lcXVhbE9iamVjdHMnKSxcbiAgICBnZXRUYWcgPSByZXF1aXJlKCcuL19nZXRUYWcnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNIb3N0T2JqZWN0ID0gcmVxdWlyZSgnLi9faXNIb3N0T2JqZWN0JyksXG4gICAgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9pc1R5cGVkQXJyYXknKTtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgY29tcGFyaXNvbiBzdHlsZXMuICovXG52YXIgUEFSVElBTF9DT01QQVJFX0ZMQUcgPSAyO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VJc0VxdWFsYCBmb3IgYXJyYXlzIGFuZCBvYmplY3RzIHdoaWNoIHBlcmZvcm1zXG4gKiBkZWVwIGNvbXBhcmlzb25zIGFuZCB0cmFja3MgdHJhdmVyc2VkIG9iamVjdHMgZW5hYmxpbmcgb2JqZWN0cyB3aXRoIGNpcmN1bGFyXG4gKiByZWZlcmVuY2VzIHRvIGJlIGNvbXBhcmVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvdGhlciBUaGUgb3RoZXIgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcXVhbEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRldGVybWluZSBlcXVpdmFsZW50cyBvZiB2YWx1ZXMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpc29ucy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbYml0bWFza10gVGhlIGJpdG1hc2sgb2YgY29tcGFyaXNvbiBmbGFncy4gU2VlIGBiYXNlSXNFcXVhbGBcbiAqICBmb3IgbW9yZSBkZXRhaWxzLlxuICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBgb2JqZWN0YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBvYmplY3RzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0VxdWFsRGVlcChvYmplY3QsIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKSB7XG4gIHZhciBvYmpJc0FyciA9IGlzQXJyYXkob2JqZWN0KSxcbiAgICAgIG90aElzQXJyID0gaXNBcnJheShvdGhlciksXG4gICAgICBvYmpUYWcgPSBhcnJheVRhZyxcbiAgICAgIG90aFRhZyA9IGFycmF5VGFnO1xuXG4gIGlmICghb2JqSXNBcnIpIHtcbiAgICBvYmpUYWcgPSBnZXRUYWcob2JqZWN0KTtcbiAgICBvYmpUYWcgPSBvYmpUYWcgPT0gYXJnc1RhZyA/IG9iamVjdFRhZyA6IG9ialRhZztcbiAgfVxuICBpZiAoIW90aElzQXJyKSB7XG4gICAgb3RoVGFnID0gZ2V0VGFnKG90aGVyKTtcbiAgICBvdGhUYWcgPSBvdGhUYWcgPT0gYXJnc1RhZyA/IG9iamVjdFRhZyA6IG90aFRhZztcbiAgfVxuICB2YXIgb2JqSXNPYmogPSBvYmpUYWcgPT0gb2JqZWN0VGFnICYmICFpc0hvc3RPYmplY3Qob2JqZWN0KSxcbiAgICAgIG90aElzT2JqID0gb3RoVGFnID09IG9iamVjdFRhZyAmJiAhaXNIb3N0T2JqZWN0KG90aGVyKSxcbiAgICAgIGlzU2FtZVRhZyA9IG9ialRhZyA9PSBvdGhUYWc7XG5cbiAgaWYgKGlzU2FtZVRhZyAmJiAhb2JqSXNPYmopIHtcbiAgICBzdGFjayB8fCAoc3RhY2sgPSBuZXcgU3RhY2spO1xuICAgIHJldHVybiAob2JqSXNBcnIgfHwgaXNUeXBlZEFycmF5KG9iamVjdCkpXG4gICAgICA/IGVxdWFsQXJyYXlzKG9iamVjdCwgb3RoZXIsIGVxdWFsRnVuYywgY3VzdG9taXplciwgYml0bWFzaywgc3RhY2spXG4gICAgICA6IGVxdWFsQnlUYWcob2JqZWN0LCBvdGhlciwgb2JqVGFnLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKTtcbiAgfVxuICBpZiAoIShiaXRtYXNrICYgUEFSVElBTF9DT01QQVJFX0ZMQUcpKSB7XG4gICAgdmFyIG9iaklzV3JhcHBlZCA9IG9iaklzT2JqICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnX193cmFwcGVkX18nKSxcbiAgICAgICAgb3RoSXNXcmFwcGVkID0gb3RoSXNPYmogJiYgaGFzT3duUHJvcGVydHkuY2FsbChvdGhlciwgJ19fd3JhcHBlZF9fJyk7XG5cbiAgICBpZiAob2JqSXNXcmFwcGVkIHx8IG90aElzV3JhcHBlZCkge1xuICAgICAgdmFyIG9ialVud3JhcHBlZCA9IG9iaklzV3JhcHBlZCA/IG9iamVjdC52YWx1ZSgpIDogb2JqZWN0LFxuICAgICAgICAgIG90aFVud3JhcHBlZCA9IG90aElzV3JhcHBlZCA/IG90aGVyLnZhbHVlKCkgOiBvdGhlcjtcblxuICAgICAgc3RhY2sgfHwgKHN0YWNrID0gbmV3IFN0YWNrKTtcbiAgICAgIHJldHVybiBlcXVhbEZ1bmMob2JqVW53cmFwcGVkLCBvdGhVbndyYXBwZWQsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFpc1NhbWVUYWcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3RhY2sgfHwgKHN0YWNrID0gbmV3IFN0YWNrKTtcbiAgcmV0dXJuIGVxdWFsT2JqZWN0cyhvYmplY3QsIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNFcXVhbERlZXA7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2Jhc2VJc0VxdWFsRGVlcC5qc1xuICoqIG1vZHVsZSBpZCA9IDUxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgU2V0Q2FjaGUgPSByZXF1aXJlKCcuL19TZXRDYWNoZScpLFxuICAgIGFycmF5U29tZSA9IHJlcXVpcmUoJy4vX2FycmF5U29tZScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjb21wYXJpc29uIHN0eWxlcy4gKi9cbnZhciBVTk9SREVSRURfQ09NUEFSRV9GTEFHID0gMSxcbiAgICBQQVJUSUFMX0NPTVBBUkVfRkxBRyA9IDI7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbERlZXBgIGZvciBhcnJheXMgd2l0aCBzdXBwb3J0IGZvclxuICogcGFydGlhbCBkZWVwIGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7QXJyYXl9IG90aGVyIFRoZSBvdGhlciBhcnJheSB0byBjb21wYXJlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY3VzdG9taXplciBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgb2YgY29tcGFyaXNvbiBmbGFncy4gU2VlIGBiYXNlSXNFcXVhbGBcbiAqICBmb3IgbW9yZSBkZXRhaWxzLlxuICogQHBhcmFtIHtPYmplY3R9IHN0YWNrIFRyYWNrcyB0cmF2ZXJzZWQgYGFycmF5YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBhcnJheXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gZXF1YWxBcnJheXMoYXJyYXksIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKSB7XG4gIHZhciBpc1BhcnRpYWwgPSBiaXRtYXNrICYgUEFSVElBTF9DT01QQVJFX0ZMQUcsXG4gICAgICBhcnJMZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICBvdGhMZW5ndGggPSBvdGhlci5sZW5ndGg7XG5cbiAgaWYgKGFyckxlbmd0aCAhPSBvdGhMZW5ndGggJiYgIShpc1BhcnRpYWwgJiYgb3RoTGVuZ3RoID4gYXJyTGVuZ3RoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBBc3N1bWUgY3ljbGljIHZhbHVlcyBhcmUgZXF1YWwuXG4gIHZhciBzdGFja2VkID0gc3RhY2suZ2V0KGFycmF5KTtcbiAgaWYgKHN0YWNrZWQpIHtcbiAgICByZXR1cm4gc3RhY2tlZCA9PSBvdGhlcjtcbiAgfVxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IHRydWUsXG4gICAgICBzZWVuID0gKGJpdG1hc2sgJiBVTk9SREVSRURfQ09NUEFSRV9GTEFHKSA/IG5ldyBTZXRDYWNoZSA6IHVuZGVmaW5lZDtcblxuICBzdGFjay5zZXQoYXJyYXksIG90aGVyKTtcblxuICAvLyBJZ25vcmUgbm9uLWluZGV4IHByb3BlcnRpZXMuXG4gIHdoaWxlICgrK2luZGV4IDwgYXJyTGVuZ3RoKSB7XG4gICAgdmFyIGFyclZhbHVlID0gYXJyYXlbaW5kZXhdLFxuICAgICAgICBvdGhWYWx1ZSA9IG90aGVyW2luZGV4XTtcblxuICAgIGlmIChjdXN0b21pemVyKSB7XG4gICAgICB2YXIgY29tcGFyZWQgPSBpc1BhcnRpYWxcbiAgICAgICAgPyBjdXN0b21pemVyKG90aFZhbHVlLCBhcnJWYWx1ZSwgaW5kZXgsIG90aGVyLCBhcnJheSwgc3RhY2spXG4gICAgICAgIDogY3VzdG9taXplcihhcnJWYWx1ZSwgb3RoVmFsdWUsIGluZGV4LCBhcnJheSwgb3RoZXIsIHN0YWNrKTtcbiAgICB9XG4gICAgaWYgKGNvbXBhcmVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChjb21wYXJlZCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgaWYgKHNlZW4pIHtcbiAgICAgIGlmICghYXJyYXlTb21lKG90aGVyLCBmdW5jdGlvbihvdGhWYWx1ZSwgb3RoSW5kZXgpIHtcbiAgICAgICAgICAgIGlmICghc2Vlbi5oYXMob3RoSW5kZXgpICYmXG4gICAgICAgICAgICAgICAgKGFyclZhbHVlID09PSBvdGhWYWx1ZSB8fCBlcXVhbEZ1bmMoYXJyVmFsdWUsIG90aFZhbHVlLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjaykpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzZWVuLmFkZChvdGhJbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkpIHtcbiAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIShcbiAgICAgICAgICBhcnJWYWx1ZSA9PT0gb3RoVmFsdWUgfHxcbiAgICAgICAgICAgIGVxdWFsRnVuYyhhcnJWYWx1ZSwgb3RoVmFsdWUsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKVxuICAgICAgICApKSB7XG4gICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBzdGFja1snZGVsZXRlJ10oYXJyYXkpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVxdWFsQXJyYXlzO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19lcXVhbEFycmF5cy5qc1xuICoqIG1vZHVsZSBpZCA9IDUyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgTWFwQ2FjaGUgPSByZXF1aXJlKCcuL19NYXBDYWNoZScpLFxuICAgIHNldENhY2hlQWRkID0gcmVxdWlyZSgnLi9fc2V0Q2FjaGVBZGQnKSxcbiAgICBzZXRDYWNoZUhhcyA9IHJlcXVpcmUoJy4vX3NldENhY2hlSGFzJyk7XG5cbi8qKlxuICpcbiAqIENyZWF0ZXMgYW4gYXJyYXkgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIHVuaXF1ZSB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW3ZhbHVlc10gVGhlIHZhbHVlcyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gU2V0Q2FjaGUodmFsdWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gdmFsdWVzID8gdmFsdWVzLmxlbmd0aCA6IDA7XG5cbiAgdGhpcy5fX2RhdGFfXyA9IG5ldyBNYXBDYWNoZTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB0aGlzLmFkZCh2YWx1ZXNbaW5kZXhdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgU2V0Q2FjaGVgLlxuU2V0Q2FjaGUucHJvdG90eXBlLmFkZCA9IFNldENhY2hlLnByb3RvdHlwZS5wdXNoID0gc2V0Q2FjaGVBZGQ7XG5TZXRDYWNoZS5wcm90b3R5cGUuaGFzID0gc2V0Q2FjaGVIYXM7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0Q2FjaGU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX1NldENhY2hlLmpzXG4gKiogbW9kdWxlIGlkID0gNTNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqXG4gKiBBZGRzIGB2YWx1ZWAgdG8gdGhlIGFycmF5IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBhZGRcbiAqIEBtZW1iZXJPZiBTZXRDYWNoZVxuICogQGFsaWFzIHB1c2hcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNhY2hlLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHNldENhY2hlQWRkKHZhbHVlKSB7XG4gIHRoaXMuX19kYXRhX18uc2V0KHZhbHVlLCBIQVNIX1VOREVGSU5FRCk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldENhY2hlQWRkO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19zZXRDYWNoZUFkZC5qc1xuICoqIG1vZHVsZSBpZCA9IDU0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGluIHRoZSBhcnJheSBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgU2V0Q2FjaGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGZvdW5kLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHNldENhY2hlSGFzKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0Q2FjaGVIYXM7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX3NldENhY2hlSGFzLmpzXG4gKiogbW9kdWxlIGlkID0gNTVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLnNvbWVgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZVxuICogc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW55IGVsZW1lbnQgcGFzc2VzIHRoZSBwcmVkaWNhdGUgY2hlY2ssXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBhcnJheVNvbWUoYXJyYXksIHByZWRpY2F0ZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChwcmVkaWNhdGUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5U29tZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fYXJyYXlTb21lLmpzXG4gKiogbW9kdWxlIGlkID0gNTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBVaW50OEFycmF5ID0gcmVxdWlyZSgnLi9fVWludDhBcnJheScpLFxuICAgIGVxdWFsQXJyYXlzID0gcmVxdWlyZSgnLi9fZXF1YWxBcnJheXMnKSxcbiAgICBtYXBUb0FycmF5ID0gcmVxdWlyZSgnLi9fbWFwVG9BcnJheScpLFxuICAgIHNldFRvQXJyYXkgPSByZXF1aXJlKCcuL19zZXRUb0FycmF5Jyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNvbXBhcmlzb24gc3R5bGVzLiAqL1xudmFyIFVOT1JERVJFRF9DT01QQVJFX0ZMQUcgPSAxLFxuICAgIFBBUlRJQUxfQ09NUEFSRV9GTEFHID0gMjtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nO1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVmFsdWVPZiA9IHN5bWJvbFByb3RvID8gc3ltYm9sUHJvdG8udmFsdWVPZiA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VJc0VxdWFsRGVlcGAgZm9yIGNvbXBhcmluZyBvYmplY3RzIG9mXG4gKiB0aGUgc2FtZSBgdG9TdHJpbmdUYWdgLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIG9ubHkgc3VwcG9ydHMgY29tcGFyaW5nIHZhbHVlcyB3aXRoIHRhZ3Mgb2ZcbiAqIGBCb29sZWFuYCwgYERhdGVgLCBgRXJyb3JgLCBgTnVtYmVyYCwgYFJlZ0V4cGAsIG9yIGBTdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvdGhlciBUaGUgb3RoZXIgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSBgdG9TdHJpbmdUYWdgIG9mIHRoZSBvYmplY3RzIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcXVhbEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRldGVybWluZSBlcXVpdmFsZW50cyBvZiB2YWx1ZXMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjdXN0b21pemVyIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gKiBAcGFyYW0ge251bWJlcn0gYml0bWFzayBUaGUgYml0bWFzayBvZiBjb21wYXJpc29uIGZsYWdzLiBTZWUgYGJhc2VJc0VxdWFsYFxuICogIGZvciBtb3JlIGRldGFpbHMuXG4gKiBAcGFyYW0ge09iamVjdH0gc3RhY2sgVHJhY2tzIHRyYXZlcnNlZCBgb2JqZWN0YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBvYmplY3RzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGVxdWFsQnlUYWcob2JqZWN0LCBvdGhlciwgdGFnLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKSB7XG4gIHN3aXRjaCAodGFnKSB7XG4gICAgY2FzZSBkYXRhVmlld1RhZzpcbiAgICAgIGlmICgob2JqZWN0LmJ5dGVMZW5ndGggIT0gb3RoZXIuYnl0ZUxlbmd0aCkgfHxcbiAgICAgICAgICAob2JqZWN0LmJ5dGVPZmZzZXQgIT0gb3RoZXIuYnl0ZU9mZnNldCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgb2JqZWN0ID0gb2JqZWN0LmJ1ZmZlcjtcbiAgICAgIG90aGVyID0gb3RoZXIuYnVmZmVyO1xuXG4gICAgY2FzZSBhcnJheUJ1ZmZlclRhZzpcbiAgICAgIGlmICgob2JqZWN0LmJ5dGVMZW5ndGggIT0gb3RoZXIuYnl0ZUxlbmd0aCkgfHxcbiAgICAgICAgICAhZXF1YWxGdW5jKG5ldyBVaW50OEFycmF5KG9iamVjdCksIG5ldyBVaW50OEFycmF5KG90aGVyKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBjYXNlIGJvb2xUYWc6XG4gICAgY2FzZSBkYXRlVGFnOlxuICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1iZXJzLCBkYXRlcyB0byBtaWxsaXNlY29uZHMgYW5kXG4gICAgICAvLyBib29sZWFucyB0byBgMWAgb3IgYDBgIHRyZWF0aW5nIGludmFsaWQgZGF0ZXMgY29lcmNlZCB0byBgTmFOYCBhc1xuICAgICAgLy8gbm90IGVxdWFsLlxuICAgICAgcmV0dXJuICtvYmplY3QgPT0gK290aGVyO1xuXG4gICAgY2FzZSBlcnJvclRhZzpcbiAgICAgIHJldHVybiBvYmplY3QubmFtZSA9PSBvdGhlci5uYW1lICYmIG9iamVjdC5tZXNzYWdlID09IG90aGVyLm1lc3NhZ2U7XG5cbiAgICBjYXNlIG51bWJlclRhZzpcbiAgICAgIC8vIFRyZWF0IGBOYU5gIHZzLiBgTmFOYCBhcyBlcXVhbC5cbiAgICAgIHJldHVybiAob2JqZWN0ICE9ICtvYmplY3QpID8gb3RoZXIgIT0gK290aGVyIDogb2JqZWN0ID09ICtvdGhlcjtcblxuICAgIGNhc2UgcmVnZXhwVGFnOlxuICAgIGNhc2Ugc3RyaW5nVGFnOlxuICAgICAgLy8gQ29lcmNlIHJlZ2V4ZXMgdG8gc3RyaW5ncyBhbmQgdHJlYXQgc3RyaW5ncywgcHJpbWl0aXZlcyBhbmQgb2JqZWN0cyxcbiAgICAgIC8vIGFzIGVxdWFsLiBTZWUgaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLXJlZ2V4cC5wcm90b3R5cGUudG9zdHJpbmdcbiAgICAgIC8vIGZvciBtb3JlIGRldGFpbHMuXG4gICAgICByZXR1cm4gb2JqZWN0ID09IChvdGhlciArICcnKTtcblxuICAgIGNhc2UgbWFwVGFnOlxuICAgICAgdmFyIGNvbnZlcnQgPSBtYXBUb0FycmF5O1xuXG4gICAgY2FzZSBzZXRUYWc6XG4gICAgICB2YXIgaXNQYXJ0aWFsID0gYml0bWFzayAmIFBBUlRJQUxfQ09NUEFSRV9GTEFHO1xuICAgICAgY29udmVydCB8fCAoY29udmVydCA9IHNldFRvQXJyYXkpO1xuXG4gICAgICBpZiAob2JqZWN0LnNpemUgIT0gb3RoZXIuc2l6ZSAmJiAhaXNQYXJ0aWFsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIEFzc3VtZSBjeWNsaWMgdmFsdWVzIGFyZSBlcXVhbC5cbiAgICAgIHZhciBzdGFja2VkID0gc3RhY2suZ2V0KG9iamVjdCk7XG4gICAgICBpZiAoc3RhY2tlZCkge1xuICAgICAgICByZXR1cm4gc3RhY2tlZCA9PSBvdGhlcjtcbiAgICAgIH1cbiAgICAgIGJpdG1hc2sgfD0gVU5PUkRFUkVEX0NPTVBBUkVfRkxBRztcbiAgICAgIHN0YWNrLnNldChvYmplY3QsIG90aGVyKTtcblxuICAgICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgICByZXR1cm4gZXF1YWxBcnJheXMoY29udmVydChvYmplY3QpLCBjb252ZXJ0KG90aGVyKSwgZXF1YWxGdW5jLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjayk7XG5cbiAgICBjYXNlIHN5bWJvbFRhZzpcbiAgICAgIGlmIChzeW1ib2xWYWx1ZU9mKSB7XG4gICAgICAgIHJldHVybiBzeW1ib2xWYWx1ZU9mLmNhbGwob2JqZWN0KSA9PSBzeW1ib2xWYWx1ZU9mLmNhbGwob3RoZXIpO1xuICAgICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcXVhbEJ5VGFnO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19lcXVhbEJ5VGFnLmpzXG4gKiogbW9kdWxlIGlkID0gNTdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX1N5bWJvbC5qc1xuICoqIG1vZHVsZSBpZCA9IDU4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgVWludDhBcnJheSA9IHJvb3QuVWludDhBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBVaW50OEFycmF5O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19VaW50OEFycmF5LmpzXG4gKiogbW9kdWxlIGlkID0gNTlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ29udmVydHMgYG1hcGAgdG8gaXRzIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGtleS12YWx1ZSBwYWlycy5cbiAqL1xuZnVuY3Rpb24gbWFwVG9BcnJheShtYXApIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShtYXAuc2l6ZSk7XG5cbiAgbWFwLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFsrK2luZGV4XSA9IFtrZXksIHZhbHVlXTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwVG9BcnJheTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fbWFwVG9BcnJheS5qc1xuICoqIG1vZHVsZSBpZCA9IDYwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIENvbnZlcnRzIGBzZXRgIHRvIGFuIGFycmF5IG9mIGl0cyB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgVGhlIHNldCB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIHNldFRvQXJyYXkoc2V0KSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkoc2V0LnNpemUpO1xuXG4gIHNldC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmVzdWx0WysraW5kZXhdID0gdmFsdWU7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldFRvQXJyYXk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX3NldFRvQXJyYXkuanNcbiAqKiBtb2R1bGUgaWQgPSA2MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGJhc2VIYXMgPSByZXF1aXJlKCcuL19iYXNlSGFzJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjb21wYXJpc29uIHN0eWxlcy4gKi9cbnZhciBQQVJUSUFMX0NPTVBBUkVfRkxBRyA9IDI7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbERlZXBgIGZvciBvYmplY3RzIHdpdGggc3VwcG9ydCBmb3JcbiAqIHBhcnRpYWwgZGVlcCBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY3VzdG9taXplciBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgb2YgY29tcGFyaXNvbiBmbGFncy4gU2VlIGBiYXNlSXNFcXVhbGBcbiAqICBmb3IgbW9yZSBkZXRhaWxzLlxuICogQHBhcmFtIHtPYmplY3R9IHN0YWNrIFRyYWNrcyB0cmF2ZXJzZWQgYG9iamVjdGAgYW5kIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBlcXVhbE9iamVjdHMob2JqZWN0LCBvdGhlciwgZXF1YWxGdW5jLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjaykge1xuICB2YXIgaXNQYXJ0aWFsID0gYml0bWFzayAmIFBBUlRJQUxfQ09NUEFSRV9GTEFHLFxuICAgICAgb2JqUHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICBvYmpMZW5ndGggPSBvYmpQcm9wcy5sZW5ndGgsXG4gICAgICBvdGhQcm9wcyA9IGtleXMob3RoZXIpLFxuICAgICAgb3RoTGVuZ3RoID0gb3RoUHJvcHMubGVuZ3RoO1xuXG4gIGlmIChvYmpMZW5ndGggIT0gb3RoTGVuZ3RoICYmICFpc1BhcnRpYWwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGluZGV4ID0gb2JqTGVuZ3RoO1xuICB3aGlsZSAoaW5kZXgtLSkge1xuICAgIHZhciBrZXkgPSBvYmpQcm9wc1tpbmRleF07XG4gICAgaWYgKCEoaXNQYXJ0aWFsID8ga2V5IGluIG90aGVyIDogYmFzZUhhcyhvdGhlciwga2V5KSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgLy8gQXNzdW1lIGN5Y2xpYyB2YWx1ZXMgYXJlIGVxdWFsLlxuICB2YXIgc3RhY2tlZCA9IHN0YWNrLmdldChvYmplY3QpO1xuICBpZiAoc3RhY2tlZCkge1xuICAgIHJldHVybiBzdGFja2VkID09IG90aGVyO1xuICB9XG4gIHZhciByZXN1bHQgPSB0cnVlO1xuICBzdGFjay5zZXQob2JqZWN0LCBvdGhlcik7XG5cbiAgdmFyIHNraXBDdG9yID0gaXNQYXJ0aWFsO1xuICB3aGlsZSAoKytpbmRleCA8IG9iakxlbmd0aCkge1xuICAgIGtleSA9IG9ialByb3BzW2luZGV4XTtcbiAgICB2YXIgb2JqVmFsdWUgPSBvYmplY3Rba2V5XSxcbiAgICAgICAgb3RoVmFsdWUgPSBvdGhlcltrZXldO1xuXG4gICAgaWYgKGN1c3RvbWl6ZXIpIHtcbiAgICAgIHZhciBjb21wYXJlZCA9IGlzUGFydGlhbFxuICAgICAgICA/IGN1c3RvbWl6ZXIob3RoVmFsdWUsIG9ialZhbHVlLCBrZXksIG90aGVyLCBvYmplY3QsIHN0YWNrKVxuICAgICAgICA6IGN1c3RvbWl6ZXIob2JqVmFsdWUsIG90aFZhbHVlLCBrZXksIG9iamVjdCwgb3RoZXIsIHN0YWNrKTtcbiAgICB9XG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgaWYgKCEoY29tcGFyZWQgPT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gKG9ialZhbHVlID09PSBvdGhWYWx1ZSB8fCBlcXVhbEZ1bmMob2JqVmFsdWUsIG90aFZhbHVlLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjaykpXG4gICAgICAgICAgOiBjb21wYXJlZFxuICAgICAgICApKSB7XG4gICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBza2lwQ3RvciB8fCAoc2tpcEN0b3IgPSBrZXkgPT0gJ2NvbnN0cnVjdG9yJyk7XG4gIH1cbiAgaWYgKHJlc3VsdCAmJiAhc2tpcEN0b3IpIHtcbiAgICB2YXIgb2JqQ3RvciA9IG9iamVjdC5jb25zdHJ1Y3RvcixcbiAgICAgICAgb3RoQ3RvciA9IG90aGVyLmNvbnN0cnVjdG9yO1xuXG4gICAgLy8gTm9uIGBPYmplY3RgIG9iamVjdCBpbnN0YW5jZXMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1YWwuXG4gICAgaWYgKG9iakN0b3IgIT0gb3RoQ3RvciAmJlxuICAgICAgICAoJ2NvbnN0cnVjdG9yJyBpbiBvYmplY3QgJiYgJ2NvbnN0cnVjdG9yJyBpbiBvdGhlcikgJiZcbiAgICAgICAgISh0eXBlb2Ygb2JqQ3RvciA9PSAnZnVuY3Rpb24nICYmIG9iakN0b3IgaW5zdGFuY2VvZiBvYmpDdG9yICYmXG4gICAgICAgICAgdHlwZW9mIG90aEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBvdGhDdG9yIGluc3RhbmNlb2Ygb3RoQ3RvcikpIHtcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuICBzdGFja1snZGVsZXRlJ10ob2JqZWN0KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcXVhbE9iamVjdHM7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2VxdWFsT2JqZWN0cy5qc1xuICoqIG1vZHVsZSBpZCA9IDYyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaGFzYCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IGtleSBUaGUga2V5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSGFzKG9iamVjdCwga2V5KSB7XG4gIC8vIEF2b2lkIGEgYnVnIGluIElFIDEwLTExIHdoZXJlIG9iamVjdHMgd2l0aCBhIFtbUHJvdG90eXBlXV0gb2YgYG51bGxgLFxuICAvLyB0aGF0IGFyZSBjb21wb3NlZCBlbnRpcmVseSBvZiBpbmRleCBwcm9wZXJ0aWVzLCByZXR1cm4gYGZhbHNlYCBmb3JcbiAgLy8gYGhhc093blByb3BlcnR5YCBjaGVja3Mgb2YgdGhlbS5cbiAgcmV0dXJuIG9iamVjdCAhPSBudWxsICYmXG4gICAgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpIHx8XG4gICAgICAodHlwZW9mIG9iamVjdCA9PSAnb2JqZWN0JyAmJiBrZXkgaW4gb2JqZWN0ICYmIGdldFByb3RvdHlwZShvYmplY3QpID09PSBudWxsKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUhhcztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fYmFzZUhhcy5qc1xuICoqIG1vZHVsZSBpZCA9IDYzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlR2V0UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuXG4vKipcbiAqIEdldHMgdGhlIGBbW1Byb3RvdHlwZV1dYCBvZiBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtudWxsfE9iamVjdH0gUmV0dXJucyB0aGUgYFtbUHJvdG90eXBlXV1gLlxuICovXG5mdW5jdGlvbiBnZXRQcm90b3R5cGUodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZUdldFByb3RvdHlwZShPYmplY3QodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRQcm90b3R5cGU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2dldFByb3RvdHlwZS5qc1xuICoqIG1vZHVsZSBpZCA9IDY0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZUhhcyA9IHJlcXVpcmUoJy4vX2Jhc2VIYXMnKSxcbiAgICBiYXNlS2V5cyA9IHJlcXVpcmUoJy4vX2Jhc2VLZXlzJyksXG4gICAgaW5kZXhLZXlzID0gcmVxdWlyZSgnLi9faW5kZXhLZXlzJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vX2lzSW5kZXgnKSxcbiAgICBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgdmFyIGlzUHJvdG8gPSBpc1Byb3RvdHlwZShvYmplY3QpO1xuICBpZiAoIShpc1Byb3RvIHx8IGlzQXJyYXlMaWtlKG9iamVjdCkpKSB7XG4gICAgcmV0dXJuIGJhc2VLZXlzKG9iamVjdCk7XG4gIH1cbiAgdmFyIGluZGV4ZXMgPSBpbmRleEtleXMob2JqZWN0KSxcbiAgICAgIHNraXBJbmRleGVzID0gISFpbmRleGVzLFxuICAgICAgcmVzdWx0ID0gaW5kZXhlcyB8fCBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgIGlmIChiYXNlSGFzKG9iamVjdCwga2V5KSAmJlxuICAgICAgICAhKHNraXBJbmRleGVzICYmIChrZXkgPT0gJ2xlbmd0aCcgfHwgaXNJbmRleChrZXksIGxlbmd0aCkpKSAmJlxuICAgICAgICAhKGlzUHJvdG8gJiYga2V5ID09ICdjb25zdHJ1Y3RvcicpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXM7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gva2V5cy5qc1xuICoqIG1vZHVsZSBpZCA9IDY1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlS2V5cyA9IE9iamVjdC5rZXlzO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNgIHdoaWNoIGRvZXNuJ3Qgc2tpcCB0aGUgY29uc3RydWN0b3JcbiAqIHByb3BlcnR5IG9mIHByb3RvdHlwZXMgb3IgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXMob2JqZWN0KSB7XG4gIHJldHVybiBuYXRpdmVLZXlzKE9iamVjdChvYmplY3QpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlS2V5cztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fYmFzZUtleXMuanNcbiAqKiBtb2R1bGUgaWQgPSA2NlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGJhc2VUaW1lcyA9IHJlcXVpcmUoJy4vX2Jhc2VUaW1lcycpLFxuICAgIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKSxcbiAgICBpc1N0cmluZyA9IHJlcXVpcmUoJy4vaXNTdHJpbmcnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIGluZGV4IGtleXMgZm9yIGBvYmplY3RgIHZhbHVlcyBvZiBhcnJheXMsXG4gKiBgYXJndW1lbnRzYCBvYmplY3RzLCBhbmQgc3RyaW5ncywgb3RoZXJ3aXNlIGBudWxsYCBpcyByZXR1cm5lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fG51bGx9IFJldHVybnMgaW5kZXgga2V5cywgZWxzZSBgbnVsbGAuXG4gKi9cbmZ1bmN0aW9uIGluZGV4S2V5cyhvYmplY3QpIHtcbiAgdmFyIGxlbmd0aCA9IG9iamVjdCA/IG9iamVjdC5sZW5ndGggOiB1bmRlZmluZWQ7XG4gIGlmIChpc0xlbmd0aChsZW5ndGgpICYmXG4gICAgICAoaXNBcnJheShvYmplY3QpIHx8IGlzU3RyaW5nKG9iamVjdCkgfHwgaXNBcmd1bWVudHMob2JqZWN0KSkpIHtcbiAgICByZXR1cm4gYmFzZVRpbWVzKGxlbmd0aCwgU3RyaW5nKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbmRleEtleXM7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2luZGV4S2V5cy5qc1xuICoqIG1vZHVsZSBpZCA9IDY3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRpbWVzYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHNcbiAqIG9yIG1heCBhcnJheSBsZW5ndGggY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gbiBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIGludm9rZSBgaXRlcmF0ZWVgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcmVzdWx0cy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRpbWVzKG4sIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobik7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBuKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGluZGV4KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VUaW1lcztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fYmFzZVRpbWVzLmpzXG4gKiogbW9kdWxlIGlkID0gNjhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc0FycmF5TGlrZU9iamVjdCA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2VPYmplY3QnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGFuIGBhcmd1bWVudHNgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcmd1bWVudHModmFsdWUpIHtcbiAgLy8gU2FmYXJpIDguMSBpbmNvcnJlY3RseSBtYWtlcyBgYXJndW1lbnRzLmNhbGxlZWAgZW51bWVyYWJsZSBpbiBzdHJpY3QgbW9kZS5cbiAgcmV0dXJuIGlzQXJyYXlMaWtlT2JqZWN0KHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAoIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKSB8fCBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBhcmdzVGFnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0FyZ3VtZW50cztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pc0FyZ3VtZW50cy5qc1xuICoqIG1vZHVsZSBpZCA9IDY5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmlzQXJyYXlMaWtlYCBleGNlcHQgdGhhdCBpdCBhbHNvIGNoZWNrcyBpZiBgdmFsdWVgXG4gKiBpcyBhbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXktbGlrZSBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2VPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaXNBcnJheUxpa2UodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXlMaWtlT2JqZWN0O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2lzQXJyYXlMaWtlT2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNzBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBnZXRMZW5ndGggPSByZXF1aXJlKCcuL19nZXRMZW5ndGgnKSxcbiAgICBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKGdldExlbmd0aCh2YWx1ZSkpICYmICFpc0Z1bmN0aW9uKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5TGlrZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pc0FycmF5TGlrZS5qc1xuICoqIG1vZHVsZSBpZCA9IDcxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fYmFzZVByb3BlcnR5Jyk7XG5cbi8qKlxuICogR2V0cyB0aGUgXCJsZW5ndGhcIiBwcm9wZXJ0eSB2YWx1ZSBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGF2b2lkIGFcbiAqIFtKSVQgYnVnXShodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTQyNzkyKSB0aGF0IGFmZmVjdHNcbiAqIFNhZmFyaSBvbiBhdCBsZWFzdCBpT1MgOC4xLTguMyBBUk02NC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIFwibGVuZ3RoXCIgdmFsdWUuXG4gKi9cbnZhciBnZXRMZW5ndGggPSBiYXNlUHJvcGVydHkoJ2xlbmd0aCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldExlbmd0aDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fZ2V0TGVuZ3RoLmpzXG4gKiogbW9kdWxlIGlkID0gNzJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucHJvcGVydHlgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5KGtleSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVByb3BlcnR5O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19iYXNlUHJvcGVydHkuanNcbiAqKiBtb2R1bGUgaWQgPSA3M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBpcyBsb29zZWx5IGJhc2VkIG9uXG4gKiBbYFRvTGVuZ3RoYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtdG9sZW5ndGgpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgbGVuZ3RoLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0xlbmd0aDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pc0xlbmd0aC5qc1xuICoqIG1vZHVsZSBpZCA9IDc0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdExpa2U7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzXG4gKiogbW9kdWxlIGlkID0gNzVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pc0FycmF5LmpzXG4gKiogbW9kdWxlIGlkID0gNzZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN0cmluZ2AgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTdHJpbmcoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTdHJpbmcoMSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzdHJpbmcnIHx8XG4gICAgKCFpc0FycmF5KHZhbHVlKSAmJiBpc09iamVjdExpa2UodmFsdWUpICYmIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN0cmluZ1RhZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNTdHJpbmc7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaXNTdHJpbmcuanNcbiAqKiBtb2R1bGUgaWQgPSA3N1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eKD86MHxbMS05XVxcZCopJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGluZGV4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbbGVuZ3RoPU1BWF9TQUZFX0lOVEVHRVJdIFRoZSB1cHBlciBib3VuZHMgb2YgYSB2YWxpZCBpbmRleC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaW5kZXgsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJbmRleCh2YWx1ZSwgbGVuZ3RoKSB7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcbiAgcmV0dXJuICEhbGVuZ3RoICYmXG4gICAgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyB8fCByZUlzVWludC50ZXN0KHZhbHVlKSkgJiZcbiAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJbmRleDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9faXNJbmRleC5qc1xuICoqIG1vZHVsZSBpZCA9IDc4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhIHByb3RvdHlwZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm90b3R5cGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNQcm90b3R5cGUodmFsdWUpIHtcbiAgdmFyIEN0b3IgPSB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvcixcbiAgICAgIHByb3RvID0gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUpIHx8IG9iamVjdFByb3RvO1xuXG4gIHJldHVybiB2YWx1ZSA9PT0gcHJvdG87XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNQcm90b3R5cGU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2lzUHJvdG90eXBlLmpzXG4gKiogbW9kdWxlIGlkID0gNzlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBEYXRhVmlldyA9IHJlcXVpcmUoJy4vX0RhdGFWaWV3JyksXG4gICAgTWFwID0gcmVxdWlyZSgnLi9fTWFwJyksXG4gICAgUHJvbWlzZSA9IHJlcXVpcmUoJy4vX1Byb21pc2UnKSxcbiAgICBTZXQgPSByZXF1aXJlKCcuL19TZXQnKSxcbiAgICBXZWFrTWFwID0gcmVxdWlyZSgnLi9fV2Vha01hcCcpLFxuICAgIHRvU291cmNlID0gcmVxdWlyZSgnLi9fdG9Tb3VyY2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHByb21pc2VUYWcgPSAnW29iamVjdCBQcm9taXNlXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtYXBzLCBzZXRzLCBhbmQgd2Vha21hcHMuICovXG52YXIgZGF0YVZpZXdDdG9yU3RyaW5nID0gdG9Tb3VyY2UoRGF0YVZpZXcpLFxuICAgIG1hcEN0b3JTdHJpbmcgPSB0b1NvdXJjZShNYXApLFxuICAgIHByb21pc2VDdG9yU3RyaW5nID0gdG9Tb3VyY2UoUHJvbWlzZSksXG4gICAgc2V0Q3RvclN0cmluZyA9IHRvU291cmNlKFNldCksXG4gICAgd2Vha01hcEN0b3JTdHJpbmcgPSB0b1NvdXJjZShXZWFrTWFwKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBgdG9TdHJpbmdUYWdgIG9mIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0VGFnKHZhbHVlKSB7XG4gIHJldHVybiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxuLy8gRmFsbGJhY2sgZm9yIGRhdGEgdmlld3MsIG1hcHMsIHNldHMsIGFuZCB3ZWFrIG1hcHMgaW4gSUUgMTEsXG4vLyBmb3IgZGF0YSB2aWV3cyBpbiBFZGdlLCBhbmQgcHJvbWlzZXMgaW4gTm9kZS5qcy5cbmlmICgoRGF0YVZpZXcgJiYgZ2V0VGFnKG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIoMSkpKSAhPSBkYXRhVmlld1RhZykgfHxcbiAgICAoTWFwICYmIGdldFRhZyhuZXcgTWFwKSAhPSBtYXBUYWcpIHx8XG4gICAgKFByb21pc2UgJiYgZ2V0VGFnKFByb21pc2UucmVzb2x2ZSgpKSAhPSBwcm9taXNlVGFnKSB8fFxuICAgIChTZXQgJiYgZ2V0VGFnKG5ldyBTZXQpICE9IHNldFRhZykgfHxcbiAgICAoV2Vha01hcCAmJiBnZXRUYWcobmV3IFdlYWtNYXApICE9IHdlYWtNYXBUYWcpKSB7XG4gIGdldFRhZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHJlc3VsdCA9IG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpLFxuICAgICAgICBDdG9yID0gcmVzdWx0ID09IG9iamVjdFRhZyA/IHZhbHVlLmNvbnN0cnVjdG9yIDogdW5kZWZpbmVkLFxuICAgICAgICBjdG9yU3RyaW5nID0gQ3RvciA/IHRvU291cmNlKEN0b3IpIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKGN0b3JTdHJpbmcpIHtcbiAgICAgIHN3aXRjaCAoY3RvclN0cmluZykge1xuICAgICAgICBjYXNlIGRhdGFWaWV3Q3RvclN0cmluZzogcmV0dXJuIGRhdGFWaWV3VGFnO1xuICAgICAgICBjYXNlIG1hcEN0b3JTdHJpbmc6IHJldHVybiBtYXBUYWc7XG4gICAgICAgIGNhc2UgcHJvbWlzZUN0b3JTdHJpbmc6IHJldHVybiBwcm9taXNlVGFnO1xuICAgICAgICBjYXNlIHNldEN0b3JTdHJpbmc6IHJldHVybiBzZXRUYWc7XG4gICAgICAgIGNhc2Ugd2Vha01hcEN0b3JTdHJpbmc6IHJldHVybiB3ZWFrTWFwVGFnO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFRhZztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fZ2V0VGFnLmpzXG4gKiogbW9kdWxlIGlkID0gODBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgRGF0YVZpZXcgPSBnZXROYXRpdmUocm9vdCwgJ0RhdGFWaWV3Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVZpZXc7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX0RhdGFWaWV3LmpzXG4gKiogbW9kdWxlIGlkID0gODFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgUHJvbWlzZSA9IGdldE5hdGl2ZShyb290LCAnUHJvbWlzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX1Byb21pc2UuanNcbiAqKiBtb2R1bGUgaWQgPSA4MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBTZXQgPSBnZXROYXRpdmUocm9vdCwgJ1NldCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNldDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fU2V0LmpzXG4gKiogbW9kdWxlIGlkID0gODNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgV2Vha01hcCA9IGdldE5hdGl2ZShyb290LCAnV2Vha01hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdlYWtNYXA7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX1dlYWtNYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA4NFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRhVmlld1RhZ10gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9XG50eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPSB0eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgdHlwZWQgYXJyYXkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShuZXcgVWludDhBcnJheSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkoW10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmXG4gICAgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhIXR5cGVkQXJyYXlUYWdzW29iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1R5cGVkQXJyYXk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaXNUeXBlZEFycmF5LmpzXG4gKiogbW9kdWxlIGlkID0gODVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc1N0cmljdENvbXBhcmFibGUgPSByZXF1aXJlKCcuL19pc1N0cmljdENvbXBhcmFibGUnKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgcHJvcGVydHkgbmFtZXMsIHZhbHVlcywgYW5kIGNvbXBhcmUgZmxhZ3Mgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbWF0Y2ggZGF0YSBvZiBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gZ2V0TWF0Y2hEYXRhKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0ga2V5cyhvYmplY3QpLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICB2YXIga2V5ID0gcmVzdWx0W2xlbmd0aF0sXG4gICAgICAgIHZhbHVlID0gb2JqZWN0W2tleV07XG5cbiAgICByZXN1bHRbbGVuZ3RoXSA9IFtrZXksIHZhbHVlLCBpc1N0cmljdENvbXBhcmFibGUodmFsdWUpXTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE1hdGNoRGF0YTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fZ2V0TWF0Y2hEYXRhLmpzXG4gKiogbW9kdWxlIGlkID0gODZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3Igc3RyaWN0IGVxdWFsaXR5IGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlmIHN1aXRhYmxlIGZvciBzdHJpY3RcbiAqICBlcXVhbGl0eSBjb21wYXJpc29ucywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1N0cmljdENvbXBhcmFibGUodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSB2YWx1ZSAmJiAhaXNPYmplY3QodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3RyaWN0Q29tcGFyYWJsZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9faXNTdHJpY3RDb21wYXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gODdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBtYXRjaGVzUHJvcGVydHlgIGZvciBzb3VyY2UgdmFsdWVzIHN1aXRhYmxlXG4gKiBmb3Igc3RyaWN0IGVxdWFsaXR5IGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEBwYXJhbSB7Kn0gc3JjVmFsdWUgVGhlIHZhbHVlIHRvIG1hdGNoLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc3BlYyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gbWF0Y2hlc1N0cmljdENvbXBhcmFibGUoa2V5LCBzcmNWYWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Rba2V5XSA9PT0gc3JjVmFsdWUgJiZcbiAgICAgIChzcmNWYWx1ZSAhPT0gdW5kZWZpbmVkIHx8IChrZXkgaW4gT2JqZWN0KG9iamVjdCkpKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fbWF0Y2hlc1N0cmljdENvbXBhcmFibGUuanNcbiAqKiBtb2R1bGUgaWQgPSA4OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGJhc2VJc0VxdWFsID0gcmVxdWlyZSgnLi9fYmFzZUlzRXF1YWwnKSxcbiAgICBnZXQgPSByZXF1aXJlKCcuL2dldCcpLFxuICAgIGhhc0luID0gcmVxdWlyZSgnLi9oYXNJbicpLFxuICAgIGlzS2V5ID0gcmVxdWlyZSgnLi9faXNLZXknKSxcbiAgICBpc1N0cmljdENvbXBhcmFibGUgPSByZXF1aXJlKCcuL19pc1N0cmljdENvbXBhcmFibGUnKSxcbiAgICBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZSA9IHJlcXVpcmUoJy4vX21hdGNoZXNTdHJpY3RDb21wYXJhYmxlJyksXG4gICAgdG9LZXkgPSByZXF1aXJlKCcuL190b0tleScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjb21wYXJpc29uIHN0eWxlcy4gKi9cbnZhciBVTk9SREVSRURfQ09NUEFSRV9GTEFHID0gMSxcbiAgICBQQVJUSUFMX0NPTVBBUkVfRkxBRyA9IDI7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ubWF0Y2hlc1Byb3BlcnR5YCB3aGljaCBkb2Vzbid0IGNsb25lIGBzcmNWYWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcGFyYW0geyp9IHNyY1ZhbHVlIFRoZSB2YWx1ZSB0byBtYXRjaC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHNwZWMgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VNYXRjaGVzUHJvcGVydHkocGF0aCwgc3JjVmFsdWUpIHtcbiAgaWYgKGlzS2V5KHBhdGgpICYmIGlzU3RyaWN0Q29tcGFyYWJsZShzcmNWYWx1ZSkpIHtcbiAgICByZXR1cm4gbWF0Y2hlc1N0cmljdENvbXBhcmFibGUodG9LZXkocGF0aCksIHNyY1ZhbHVlKTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIG9ialZhbHVlID0gZ2V0KG9iamVjdCwgcGF0aCk7XG4gICAgcmV0dXJuIChvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkICYmIG9ialZhbHVlID09PSBzcmNWYWx1ZSlcbiAgICAgID8gaGFzSW4ob2JqZWN0LCBwYXRoKVxuICAgICAgOiBiYXNlSXNFcXVhbChzcmNWYWx1ZSwgb2JqVmFsdWUsIHVuZGVmaW5lZCwgVU5PUkRFUkVEX0NPTVBBUkVfRkxBRyB8IFBBUlRJQUxfQ09NUEFSRV9GTEFHKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlTWF0Y2hlc1Byb3BlcnR5O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19iYXNlTWF0Y2hlc1Byb3BlcnR5LmpzXG4gKiogbW9kdWxlIGlkID0gODlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBiYXNlR2V0ID0gcmVxdWlyZSgnLi9fYmFzZUdldCcpO1xuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBwYXRoYCBvZiBgb2JqZWN0YC4gSWYgdGhlIHJlc29sdmVkIHZhbHVlIGlzXG4gKiBgdW5kZWZpbmVkYCwgdGhlIGBkZWZhdWx0VmFsdWVgIGlzIHVzZWQgaW4gaXRzIHBsYWNlLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy43LjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcGFyYW0geyp9IFtkZWZhdWx0VmFsdWVdIFRoZSB2YWx1ZSByZXR1cm5lZCBmb3IgYHVuZGVmaW5lZGAgcmVzb2x2ZWQgdmFsdWVzLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc29sdmVkIHZhbHVlLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IFt7ICdiJzogeyAnYyc6IDMgfSB9XSB9O1xuICpcbiAqIF8uZ2V0KG9iamVjdCwgJ2FbMF0uYi5jJyk7XG4gKiAvLyA9PiAzXG4gKlxuICogXy5nZXQob2JqZWN0LCBbJ2EnLCAnMCcsICdiJywgJ2MnXSk7XG4gKiAvLyA9PiAzXG4gKlxuICogXy5nZXQob2JqZWN0LCAnYS5iLmMnLCAnZGVmYXVsdCcpO1xuICogLy8gPT4gJ2RlZmF1bHQnXG4gKi9cbmZ1bmN0aW9uIGdldChvYmplY3QsIHBhdGgsIGRlZmF1bHRWYWx1ZSkge1xuICB2YXIgcmVzdWx0ID0gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBiYXNlR2V0KG9iamVjdCwgcGF0aCk7XG4gIHJldHVybiByZXN1bHQgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRWYWx1ZSA6IHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXQ7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvZ2V0LmpzXG4gKiogbW9kdWxlIGlkID0gOTBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBjYXN0UGF0aCA9IHJlcXVpcmUoJy4vX2Nhc3RQYXRoJyksXG4gICAgaXNLZXkgPSByZXF1aXJlKCcuL19pc0tleScpLFxuICAgIHRvS2V5ID0gcmVxdWlyZSgnLi9fdG9LZXknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5nZXRgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVmYXVsdCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXQob2JqZWN0LCBwYXRoKSB7XG4gIHBhdGggPSBpc0tleShwYXRoLCBvYmplY3QpID8gW3BhdGhdIDogY2FzdFBhdGgocGF0aCk7XG5cbiAgdmFyIGluZGV4ID0gMCxcbiAgICAgIGxlbmd0aCA9IHBhdGgubGVuZ3RoO1xuXG4gIHdoaWxlIChvYmplY3QgIT0gbnVsbCAmJiBpbmRleCA8IGxlbmd0aCkge1xuICAgIG9iamVjdCA9IG9iamVjdFt0b0tleShwYXRoW2luZGV4KytdKV07XG4gIH1cbiAgcmV0dXJuIChpbmRleCAmJiBpbmRleCA9PSBsZW5ndGgpID8gb2JqZWN0IDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXQ7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2Jhc2VHZXQuanNcbiAqKiBtb2R1bGUgaWQgPSA5MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBzdHJpbmdUb1BhdGggPSByZXF1aXJlKCcuL19zdHJpbmdUb1BhdGgnKTtcblxuLyoqXG4gKiBDYXN0cyBgdmFsdWVgIHRvIGEgcGF0aCBhcnJheSBpZiBpdCdzIG5vdCBvbmUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGNhc3QgcHJvcGVydHkgcGF0aCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gY2FzdFBhdGgodmFsdWUpIHtcbiAgcmV0dXJuIGlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBzdHJpbmdUb1BhdGgodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNhc3RQYXRoO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19jYXN0UGF0aC5qc1xuICoqIG1vZHVsZSBpZCA9IDkyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgbWVtb2l6ZSA9IHJlcXVpcmUoJy4vbWVtb2l6ZScpLFxuICAgIHRvU3RyaW5nID0gcmVxdWlyZSgnLi90b1N0cmluZycpO1xuXG4vKiogVXNlZCB0byBtYXRjaCBwcm9wZXJ0eSBuYW1lcyB3aXRoaW4gcHJvcGVydHkgcGF0aHMuICovXG52YXIgcmVQcm9wTmFtZSA9IC9bXi5bXFxdXSt8XFxbKD86KC0/XFxkKyg/OlxcLlxcZCspPyl8KFtcIiddKSgoPzooPyFcXDIpW15cXFxcXXxcXFxcLikqPylcXDIpXFxdfCg/PShcXC58XFxbXFxdKSg/OlxcNHwkKSkvZztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggYmFja3NsYXNoZXMgaW4gcHJvcGVydHkgcGF0aHMuICovXG52YXIgcmVFc2NhcGVDaGFyID0gL1xcXFwoXFxcXCk/L2c7XG5cbi8qKlxuICogQ29udmVydHMgYHN0cmluZ2AgdG8gYSBwcm9wZXJ0eSBwYXRoIGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgcHJvcGVydHkgcGF0aCBhcnJheS5cbiAqL1xudmFyIHN0cmluZ1RvUGF0aCA9IG1lbW9pemUoZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdG9TdHJpbmcoc3RyaW5nKS5yZXBsYWNlKHJlUHJvcE5hbWUsIGZ1bmN0aW9uKG1hdGNoLCBudW1iZXIsIHF1b3RlLCBzdHJpbmcpIHtcbiAgICByZXN1bHQucHVzaChxdW90ZSA/IHN0cmluZy5yZXBsYWNlKHJlRXNjYXBlQ2hhciwgJyQxJykgOiAobnVtYmVyIHx8IG1hdGNoKSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3RyaW5nVG9QYXRoO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19zdHJpbmdUb1BhdGguanNcbiAqKiBtb2R1bGUgaWQgPSA5M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIE1hcENhY2hlID0gcmVxdWlyZSgnLi9fTWFwQ2FjaGUnKTtcblxuLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgbWVtb2l6ZXMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuIElmIGByZXNvbHZlcmAgaXNcbiAqIHByb3ZpZGVkLCBpdCBkZXRlcm1pbmVzIHRoZSBjYWNoZSBrZXkgZm9yIHN0b3JpbmcgdGhlIHJlc3VsdCBiYXNlZCBvbiB0aGVcbiAqIGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24uIEJ5IGRlZmF1bHQsIHRoZSBmaXJzdCBhcmd1bWVudFxuICogcHJvdmlkZWQgdG8gdGhlIG1lbW9pemVkIGZ1bmN0aW9uIGlzIHVzZWQgYXMgdGhlIG1hcCBjYWNoZSBrZXkuIFRoZSBgZnVuY2BcbiAqIGlzIGludm9rZWQgd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIG1lbW9pemVkIGZ1bmN0aW9uLlxuICpcbiAqICoqTm90ZToqKiBUaGUgY2FjaGUgaXMgZXhwb3NlZCBhcyB0aGUgYGNhY2hlYCBwcm9wZXJ0eSBvbiB0aGUgbWVtb2l6ZWRcbiAqIGZ1bmN0aW9uLiBJdHMgY3JlYXRpb24gbWF5IGJlIGN1c3RvbWl6ZWQgYnkgcmVwbGFjaW5nIHRoZSBgXy5tZW1vaXplLkNhY2hlYFxuICogY29uc3RydWN0b3Igd2l0aCBvbmUgd2hvc2UgaW5zdGFuY2VzIGltcGxlbWVudCB0aGVcbiAqIFtgTWFwYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtcHJvcGVydGllcy1vZi10aGUtbWFwLXByb3RvdHlwZS1vYmplY3QpXG4gKiBtZXRob2QgaW50ZXJmYWNlIG9mIGBkZWxldGVgLCBgZ2V0YCwgYGhhc2AsIGFuZCBgc2V0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGhhdmUgaXRzIG91dHB1dCBtZW1vaXplZC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtyZXNvbHZlcl0gVGhlIGZ1bmN0aW9uIHRvIHJlc29sdmUgdGhlIGNhY2hlIGtleS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IG1lbW9pemVkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEsICdiJzogMiB9O1xuICogdmFyIG90aGVyID0geyAnYyc6IDMsICdkJzogNCB9O1xuICpcbiAqIHZhciB2YWx1ZXMgPSBfLm1lbW9pemUoXy52YWx1ZXMpO1xuICogdmFsdWVzKG9iamVjdCk7XG4gKiAvLyA9PiBbMSwgMl1cbiAqXG4gKiB2YWx1ZXMob3RoZXIpO1xuICogLy8gPT4gWzMsIDRdXG4gKlxuICogb2JqZWN0LmEgPSAyO1xuICogdmFsdWVzKG9iamVjdCk7XG4gKiAvLyA9PiBbMSwgMl1cbiAqXG4gKiAvLyBNb2RpZnkgdGhlIHJlc3VsdCBjYWNoZS5cbiAqIHZhbHVlcy5jYWNoZS5zZXQob2JqZWN0LCBbJ2EnLCAnYiddKTtcbiAqIHZhbHVlcyhvYmplY3QpO1xuICogLy8gPT4gWydhJywgJ2InXVxuICpcbiAqIC8vIFJlcGxhY2UgYF8ubWVtb2l6ZS5DYWNoZWAuXG4gKiBfLm1lbW9pemUuQ2FjaGUgPSBXZWFrTWFwO1xuICovXG5mdW5jdGlvbiBtZW1vaXplKGZ1bmMsIHJlc29sdmVyKSB7XG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nIHx8IChyZXNvbHZlciAmJiB0eXBlb2YgcmVzb2x2ZXIgIT0gJ2Z1bmN0aW9uJykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgdmFyIG1lbW9pemVkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgIGtleSA9IHJlc29sdmVyID8gcmVzb2x2ZXIuYXBwbHkodGhpcywgYXJncykgOiBhcmdzWzBdLFxuICAgICAgICBjYWNoZSA9IG1lbW9pemVkLmNhY2hlO1xuXG4gICAgaWYgKGNhY2hlLmhhcyhrZXkpKSB7XG4gICAgICByZXR1cm4gY2FjaGUuZ2V0KGtleSk7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIG1lbW9pemVkLmNhY2hlID0gY2FjaGUuc2V0KGtleSwgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBtZW1vaXplZC5jYWNoZSA9IG5ldyAobWVtb2l6ZS5DYWNoZSB8fCBNYXBDYWNoZSk7XG4gIHJldHVybiBtZW1vaXplZDtcbn1cblxuLy8gQXNzaWduIGNhY2hlIHRvIGBfLm1lbW9pemVgLlxubWVtb2l6ZS5DYWNoZSA9IE1hcENhY2hlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1lbW9pemU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvbWVtb2l6ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDk0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYmFzZVRvU3RyaW5nID0gcmVxdWlyZSgnLi9fYmFzZVRvU3RyaW5nJyk7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZy4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkIGZvciBgbnVsbGBcbiAqIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXMuIFRoZSBzaWduIG9mIGAtMGAgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvU3RyaW5nKG51bGwpO1xuICogLy8gPT4gJydcbiAqXG4gKiBfLnRvU3RyaW5nKC0wKTtcbiAqIC8vID0+ICctMCdcbiAqXG4gKiBfLnRvU3RyaW5nKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAnMSwyLDMnXG4gKi9cbmZ1bmN0aW9uIHRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiBiYXNlVG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvU3RyaW5nO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL3RvU3RyaW5nLmpzXG4gKiogbW9kdWxlIGlkID0gOTVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBpc1N5bWJvbCA9IHJlcXVpcmUoJy4vaXNTeW1ib2wnKTtcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMDtcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFRvU3RyaW5nID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by50b1N0cmluZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50b1N0cmluZ2Agd2hpY2ggZG9lc24ndCBjb252ZXJ0IG51bGxpc2hcbiAqIHZhbHVlcyB0byBlbXB0eSBzdHJpbmdzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVG9TdHJpbmcodmFsdWUpIHtcbiAgLy8gRXhpdCBlYXJseSBmb3Igc3RyaW5ncyB0byBhdm9pZCBhIHBlcmZvcm1hbmNlIGhpdCBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIHN5bWJvbFRvU3RyaW5nID8gc3ltYm9sVG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgfVxuICB2YXIgcmVzdWx0ID0gKHZhbHVlICsgJycpO1xuICByZXR1cm4gKHJlc3VsdCA9PSAnMCcgJiYgKDEgLyB2YWx1ZSkgPT0gLUlORklOSVRZKSA/ICctMCcgOiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVRvU3RyaW5nO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19iYXNlVG9TdHJpbmcuanNcbiAqKiBtb2R1bGUgaWQgPSA5NlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1N5bWJvbDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9pc1N5bWJvbC5qc1xuICoqIG1vZHVsZSBpZCA9IDk3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzU3ltYm9sID0gcmVxdWlyZSgnLi9pc1N5bWJvbCcpO1xuXG4vKiogVXNlZCB0byBtYXRjaCBwcm9wZXJ0eSBuYW1lcyB3aXRoaW4gcHJvcGVydHkgcGF0aHMuICovXG52YXIgcmVJc0RlZXBQcm9wID0gL1xcLnxcXFsoPzpbXltcXF1dKnwoW1wiJ10pKD86KD8hXFwxKVteXFxcXF18XFxcXC4pKj9cXDEpXFxdLyxcbiAgICByZUlzUGxhaW5Qcm9wID0gL15cXHcqJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwcm9wZXJ0eSBuYW1lIGFuZCBub3QgYSBwcm9wZXJ0eSBwYXRoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5IGtleXMgb24uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHByb3BlcnR5IG5hbWUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNLZXkodmFsdWUsIG9iamVjdCkge1xuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIGlmICh0eXBlID09ICdudW1iZXInIHx8IHR5cGUgPT0gJ3N5bWJvbCcgfHwgdHlwZSA9PSAnYm9vbGVhbicgfHxcbiAgICAgIHZhbHVlID09IG51bGwgfHwgaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIHJlSXNQbGFpblByb3AudGVzdCh2YWx1ZSkgfHwgIXJlSXNEZWVwUHJvcC50ZXN0KHZhbHVlKSB8fFxuICAgIChvYmplY3QgIT0gbnVsbCAmJiB2YWx1ZSBpbiBPYmplY3Qob2JqZWN0KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNLZXk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2lzS2V5LmpzXG4gKiogbW9kdWxlIGlkID0gOThcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc1N5bWJvbCA9IHJlcXVpcmUoJy4vaXNTeW1ib2wnKTtcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMDtcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIGtleSBpZiBpdCdzIG5vdCBhIHN0cmluZyBvciBzeW1ib2wuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7c3RyaW5nfHN5bWJvbH0gUmV0dXJucyB0aGUga2V5LlxuICovXG5mdW5jdGlvbiB0b0tleSh2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnIHx8IGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gKHZhbHVlICsgJycpO1xuICByZXR1cm4gKHJlc3VsdCA9PSAnMCcgJiYgKDEgLyB2YWx1ZSkgPT0gLUlORklOSVRZKSA/ICctMCcgOiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9LZXk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX3RvS2V5LmpzXG4gKiogbW9kdWxlIGlkID0gOTlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBiYXNlSGFzSW4gPSByZXF1aXJlKCcuL19iYXNlSGFzSW4nKSxcbiAgICBoYXNQYXRoID0gcmVxdWlyZSgnLi9faGFzUGF0aCcpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgcGF0aGAgaXMgYSBkaXJlY3Qgb3IgaW5oZXJpdGVkIHByb3BlcnR5IG9mIGBvYmplY3RgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBwYXRoYCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IF8uY3JlYXRlKHsgJ2EnOiBfLmNyZWF0ZSh7ICdiJzogMiB9KSB9KTtcbiAqXG4gKiBfLmhhc0luKG9iamVjdCwgJ2EnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmhhc0luKG9iamVjdCwgJ2EuYicpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaGFzSW4ob2JqZWN0LCBbJ2EnLCAnYiddKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmhhc0luKG9iamVjdCwgJ2InKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGhhc0luKG9iamVjdCwgcGF0aCkge1xuICByZXR1cm4gb2JqZWN0ICE9IG51bGwgJiYgaGFzUGF0aChvYmplY3QsIHBhdGgsIGJhc2VIYXNJbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzSW47XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaGFzSW4uanNcbiAqKiBtb2R1bGUgaWQgPSAxMDBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaGFzSW5gIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30ga2V5IFRoZSBrZXkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VIYXNJbihvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ICE9IG51bGwgJiYga2V5IGluIE9iamVjdChvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VIYXNJbjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fYmFzZUhhc0luLmpzXG4gKiogbW9kdWxlIGlkID0gMTAxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgY2FzdFBhdGggPSByZXF1aXJlKCcuL19jYXN0UGF0aCcpLFxuICAgIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0luZGV4ID0gcmVxdWlyZSgnLi9faXNJbmRleCcpLFxuICAgIGlzS2V5ID0gcmVxdWlyZSgnLi9faXNLZXknKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKSxcbiAgICBpc1N0cmluZyA9IHJlcXVpcmUoJy4vaXNTdHJpbmcnKSxcbiAgICB0b0tleSA9IHJlcXVpcmUoJy4vX3RvS2V5Jyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBwYXRoYCBleGlzdHMgb24gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIGNoZWNrLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFzRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2sgcHJvcGVydGllcy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgcGF0aGAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc1BhdGgob2JqZWN0LCBwYXRoLCBoYXNGdW5jKSB7XG4gIHBhdGggPSBpc0tleShwYXRoLCBvYmplY3QpID8gW3BhdGhdIDogY2FzdFBhdGgocGF0aCk7XG5cbiAgdmFyIHJlc3VsdCxcbiAgICAgIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwYXRoLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSB0b0tleShwYXRoW2luZGV4XSk7XG4gICAgaWYgKCEocmVzdWx0ID0gb2JqZWN0ICE9IG51bGwgJiYgaGFzRnVuYyhvYmplY3QsIGtleSkpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgb2JqZWN0ID0gb2JqZWN0W2tleV07XG4gIH1cbiAgaWYgKHJlc3VsdCkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgdmFyIGxlbmd0aCA9IG9iamVjdCA/IG9iamVjdC5sZW5ndGggOiAwO1xuICByZXR1cm4gISFsZW5ndGggJiYgaXNMZW5ndGgobGVuZ3RoKSAmJiBpc0luZGV4KGtleSwgbGVuZ3RoKSAmJlxuICAgIChpc0FycmF5KG9iamVjdCkgfHwgaXNTdHJpbmcob2JqZWN0KSB8fCBpc0FyZ3VtZW50cyhvYmplY3QpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNQYXRoO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19oYXNQYXRoLmpzXG4gKiogbW9kdWxlIGlkID0gMTAyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IGdpdmVuIHRvIGl0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICd1c2VyJzogJ2ZyZWQnIH07XG4gKlxuICogY29uc29sZS5sb2coXy5pZGVudGl0eShvYmplY3QpID09PSBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaWRlbnRpdHk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvaWRlbnRpdHkuanNcbiAqKiBtb2R1bGUgaWQgPSAxMDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBiYXNlUHJvcGVydHkgPSByZXF1aXJlKCcuL19iYXNlUHJvcGVydHknKSxcbiAgICBiYXNlUHJvcGVydHlEZWVwID0gcmVxdWlyZSgnLi9fYmFzZVByb3BlcnR5RGVlcCcpLFxuICAgIGlzS2V5ID0gcmVxdWlyZSgnLi9faXNLZXknKSxcbiAgICB0b0tleSA9IHJlcXVpcmUoJy4vX3RvS2V5Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgdmFsdWUgYXQgYHBhdGhgIG9mIGEgZ2l2ZW4gb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3RzID0gW1xuICogICB7ICdhJzogeyAnYic6IDIgfSB9LFxuICogICB7ICdhJzogeyAnYic6IDEgfSB9XG4gKiBdO1xuICpcbiAqIF8ubWFwKG9iamVjdHMsIF8ucHJvcGVydHkoJ2EuYicpKTtcbiAqIC8vID0+IFsyLCAxXVxuICpcbiAqIF8ubWFwKF8uc29ydEJ5KG9iamVjdHMsIF8ucHJvcGVydHkoWydhJywgJ2InXSkpLCAnYS5iJyk7XG4gKiAvLyA9PiBbMSwgMl1cbiAqL1xuZnVuY3Rpb24gcHJvcGVydHkocGF0aCkge1xuICByZXR1cm4gaXNLZXkocGF0aCkgPyBiYXNlUHJvcGVydHkodG9LZXkocGF0aCkpIDogYmFzZVByb3BlcnR5RGVlcChwYXRoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwcm9wZXJ0eTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9wcm9wZXJ0eS5qc1xuICoqIG1vZHVsZSBpZCA9IDEwNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGJhc2VHZXQgPSByZXF1aXJlKCcuL19iYXNlR2V0Jyk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUHJvcGVydHlgIHdoaWNoIHN1cHBvcnRzIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5RGVlcChwYXRoKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gYmFzZUdldChvYmplY3QsIHBhdGgpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VQcm9wZXJ0eURlZXA7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2Jhc2VQcm9wZXJ0eURlZXAuanNcbiAqKiBtb2R1bGUgaWQgPSAxMDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBiYXNlRWFjaCA9IHJlcXVpcmUoJy4vX2Jhc2VFYWNoJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ubWFwYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBtYXBwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGJhc2VNYXAoY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBpc0FycmF5TGlrZShjb2xsZWN0aW9uKSA/IEFycmF5KGNvbGxlY3Rpb24ubGVuZ3RoKSA6IFtdO1xuXG4gIGJhc2VFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSBpdGVyYXRlZSh2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZU1hcDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fYmFzZU1hcC5qc1xuICoqIG1vZHVsZSBpZCA9IDEwNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGJhc2VGb3JPd24gPSByZXF1aXJlKCcuL19iYXNlRm9yT3duJyksXG4gICAgY3JlYXRlQmFzZUVhY2ggPSByZXF1aXJlKCcuL19jcmVhdGVCYXNlRWFjaCcpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvckVhY2hgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICovXG52YXIgYmFzZUVhY2ggPSBjcmVhdGVCYXNlRWFjaChiYXNlRm9yT3duKTtcblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlRWFjaDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fYmFzZUVhY2guanNcbiAqKiBtb2R1bGUgaWQgPSAxMDdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBiYXNlRm9yID0gcmVxdWlyZSgnLi9fYmFzZUZvcicpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5mb3JPd25gIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlRm9yT3duKG9iamVjdCwgaXRlcmF0ZWUpIHtcbiAgcmV0dXJuIG9iamVjdCAmJiBiYXNlRm9yKG9iamVjdCwgaXRlcmF0ZWUsIGtleXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VGb3JPd247XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2Jhc2VGb3JPd24uanNcbiAqKiBtb2R1bGUgaWQgPSAxMDhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBjcmVhdGVCYXNlRm9yID0gcmVxdWlyZSgnLi9fY3JlYXRlQmFzZUZvcicpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBiYXNlRm9yT3duYCB3aGljaCBpdGVyYXRlcyBvdmVyIGBvYmplY3RgXG4gKiBwcm9wZXJ0aWVzIHJldHVybmVkIGJ5IGBrZXlzRnVuY2AgYW5kIGludm9rZXMgYGl0ZXJhdGVlYCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqIEl0ZXJhdGVlIGZ1bmN0aW9ucyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBrZXlzRnVuYyBUaGUgZnVuY3Rpb24gdG8gZ2V0IHRoZSBrZXlzIG9mIGBvYmplY3RgLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xudmFyIGJhc2VGb3IgPSBjcmVhdGVCYXNlRm9yKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUZvcjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fYmFzZUZvci5qc1xuICoqIG1vZHVsZSBpZCA9IDEwOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBDcmVhdGVzIGEgYmFzZSBmdW5jdGlvbiBmb3IgbWV0aG9kcyBsaWtlIGBfLmZvckluYCBhbmQgYF8uZm9yT3duYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRm9yKGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0LCBpdGVyYXRlZSwga2V5c0Z1bmMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgaXRlcmFibGUgPSBPYmplY3Qob2JqZWN0KSxcbiAgICAgICAgcHJvcHMgPSBrZXlzRnVuYyhvYmplY3QpLFxuICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIHZhciBrZXkgPSBwcm9wc1tmcm9tUmlnaHQgPyBsZW5ndGggOiArK2luZGV4XTtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtrZXldLCBrZXksIGl0ZXJhYmxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQmFzZUZvcjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9fY3JlYXRlQmFzZUZvci5qc1xuICoqIG1vZHVsZSBpZCA9IDExMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBgYmFzZUVhY2hgIG9yIGBiYXNlRWFjaFJpZ2h0YCBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZWFjaEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGl0ZXJhdGUgb3ZlciBhIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJhc2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJhc2VFYWNoKGVhY2hGdW5jLCBmcm9tUmlnaHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKSB7XG4gICAgaWYgKGNvbGxlY3Rpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gICAgfVxuICAgIGlmICghaXNBcnJheUxpa2UoY29sbGVjdGlvbikpIHtcbiAgICAgIHJldHVybiBlYWNoRnVuYyhjb2xsZWN0aW9uLCBpdGVyYXRlZSk7XG4gICAgfVxuICAgIHZhciBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aCxcbiAgICAgICAgaW5kZXggPSBmcm9tUmlnaHQgPyBsZW5ndGggOiAtMSxcbiAgICAgICAgaXRlcmFibGUgPSBPYmplY3QoY29sbGVjdGlvbik7XG5cbiAgICB3aGlsZSAoKGZyb21SaWdodCA/IGluZGV4LS0gOiArK2luZGV4IDwgbGVuZ3RoKSkge1xuICAgICAgaWYgKGl0ZXJhdGVlKGl0ZXJhYmxlW2luZGV4XSwgaW5kZXgsIGl0ZXJhYmxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUJhc2VFYWNoO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19jcmVhdGVCYXNlRWFjaC5qc1xuICoqIG1vZHVsZSBpZCA9IDExMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYXNzaWduVmFsdWUnKSxcbiAgICBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGNyZWF0ZUFzc2lnbmVyID0gcmVxdWlyZSgnLi9fY3JlYXRlQXNzaWduZXInKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKSxcbiAgICBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKiogRGV0ZWN0IGlmIHByb3BlcnRpZXMgc2hhZG93aW5nIHRob3NlIG9uIGBPYmplY3QucHJvdG90eXBlYCBhcmUgbm9uLWVudW1lcmFibGUuICovXG52YXIgbm9uRW51bVNoYWRvd3MgPSAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh7ICd2YWx1ZU9mJzogMSB9LCAndmFsdWVPZicpO1xuXG4vKipcbiAqIEFzc2lnbnMgb3duIGVudW1lcmFibGUgc3RyaW5nIGtleWVkIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdHMgdG8gdGhlXG4gKiBkZXN0aW5hdGlvbiBvYmplY3QuIFNvdXJjZSBvYmplY3RzIGFyZSBhcHBsaWVkIGZyb20gbGVmdCB0byByaWdodC5cbiAqIFN1YnNlcXVlbnQgc291cmNlcyBvdmVyd3JpdGUgcHJvcGVydHkgYXNzaWdubWVudHMgb2YgcHJldmlvdXMgc291cmNlcy5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgbXV0YXRlcyBgb2JqZWN0YCBhbmQgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BPYmplY3QuYXNzaWduYF0oaHR0cHM6Ly9tZG4uaW8vT2JqZWN0L2Fzc2lnbikuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEwLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSBbc291cmNlc10gVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBzZWUgXy5hc3NpZ25JblxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYyA9IDM7XG4gKiB9XG4gKlxuICogZnVuY3Rpb24gQmFyKCkge1xuICogICB0aGlzLmUgPSA1O1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuZCA9IDQ7XG4gKiBCYXIucHJvdG90eXBlLmYgPSA2O1xuICpcbiAqIF8uYXNzaWduKHsgJ2EnOiAxIH0sIG5ldyBGb28sIG5ldyBCYXIpO1xuICogLy8gPT4geyAnYSc6IDEsICdjJzogMywgJ2UnOiA1IH1cbiAqL1xudmFyIGFzc2lnbiA9IGNyZWF0ZUFzc2lnbmVyKGZ1bmN0aW9uKG9iamVjdCwgc291cmNlKSB7XG4gIGlmIChub25FbnVtU2hhZG93cyB8fCBpc1Byb3RvdHlwZShzb3VyY2UpIHx8IGlzQXJyYXlMaWtlKHNvdXJjZSkpIHtcbiAgICBjb3B5T2JqZWN0KHNvdXJjZSwga2V5cyhzb3VyY2UpLCBvYmplY3QpO1xuICAgIHJldHVybjtcbiAgfVxuICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgc291cmNlW2tleV0pO1xuICAgIH1cbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL2Fzc2lnbi5qc1xuICoqIG1vZHVsZSBpZCA9IDExMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGVxID0gcmVxdWlyZSgnLi9lcScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEFzc2lnbnMgYHZhbHVlYCB0byBga2V5YCBvZiBgb2JqZWN0YCBpZiB0aGUgZXhpc3RpbmcgdmFsdWUgaXMgbm90IGVxdWl2YWxlbnRcbiAqIHVzaW5nIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBmb3IgZXF1YWxpdHkgY29tcGFyaXNvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHZhciBvYmpWYWx1ZSA9IG9iamVjdFtrZXldO1xuICBpZiAoIShoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBlcShvYmpWYWx1ZSwgdmFsdWUpKSB8fFxuICAgICAgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkpIHtcbiAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduVmFsdWU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvX2Fzc2lnblZhbHVlLmpzXG4gKiogbW9kdWxlIGlkID0gMTEzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19hc3NpZ25WYWx1ZScpO1xuXG4vKipcbiAqIENvcGllcyBwcm9wZXJ0aWVzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgaWRlbnRpZmllcnMgdG8gY29weS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyB0by5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvcGllZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5T2JqZWN0KHNvdXJjZSwgcHJvcHMsIG9iamVjdCwgY3VzdG9taXplcikge1xuICBvYmplY3QgfHwgKG9iamVjdCA9IHt9KTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjdXN0b21pemVyXG4gICAgICA/IGN1c3RvbWl6ZXIob2JqZWN0W2tleV0sIHNvdXJjZVtrZXldLCBrZXksIG9iamVjdCwgc291cmNlKVxuICAgICAgOiBzb3VyY2Vba2V5XTtcblxuICAgIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5T2JqZWN0O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19jb3B5T2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gMTE0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaXNJdGVyYXRlZUNhbGwgPSByZXF1aXJlKCcuL19pc0l0ZXJhdGVlQ2FsbCcpLFxuICAgIHJlc3QgPSByZXF1aXJlKCcuL3Jlc3QnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gbGlrZSBgXy5hc3NpZ25gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBhc3NpZ25lciBUaGUgZnVuY3Rpb24gdG8gYXNzaWduIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFzc2lnbmVyIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVBc3NpZ25lcihhc3NpZ25lcikge1xuICByZXR1cm4gcmVzdChmdW5jdGlvbihvYmplY3QsIHNvdXJjZXMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gc291cmNlcy5sZW5ndGgsXG4gICAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPiAxID8gc291cmNlc1tsZW5ndGggLSAxXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgZ3VhcmQgPSBsZW5ndGggPiAyID8gc291cmNlc1syXSA6IHVuZGVmaW5lZDtcblxuICAgIGN1c3RvbWl6ZXIgPSAoYXNzaWduZXIubGVuZ3RoID4gMyAmJiB0eXBlb2YgY3VzdG9taXplciA9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAobGVuZ3RoLS0sIGN1c3RvbWl6ZXIpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChndWFyZCAmJiBpc0l0ZXJhdGVlQ2FsbChzb3VyY2VzWzBdLCBzb3VyY2VzWzFdLCBndWFyZCkpIHtcbiAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPCAzID8gdW5kZWZpbmVkIDogY3VzdG9taXplcjtcbiAgICAgIGxlbmd0aCA9IDE7XG4gICAgfVxuICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgc291cmNlID0gc291cmNlc1tpbmRleF07XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGFzc2lnbmVyKG9iamVjdCwgc291cmNlLCBpbmRleCwgY3VzdG9taXplcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUFzc2lnbmVyO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19jcmVhdGVBc3NpZ25lci5qc1xuICoqIG1vZHVsZSBpZCA9IDExNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGVxID0gcmVxdWlyZSgnLi9lcScpLFxuICAgIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZScpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuL19pc0luZGV4JyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBhcmd1bWVudHMgYXJlIGZyb20gYW4gaXRlcmF0ZWUgY2FsbC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIHZhbHVlIGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBpbmRleCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIGluZGV4IG9yIGtleSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgb2JqZWN0IGFyZ3VtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBhcmd1bWVudHMgYXJlIGZyb20gYW4gaXRlcmF0ZWUgY2FsbCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSXRlcmF0ZWVDYWxsKHZhbHVlLCBpbmRleCwgb2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdHlwZSA9IHR5cGVvZiBpbmRleDtcbiAgaWYgKHR5cGUgPT0gJ251bWJlcidcbiAgICAgICAgPyAoaXNBcnJheUxpa2Uob2JqZWN0KSAmJiBpc0luZGV4KGluZGV4LCBvYmplY3QubGVuZ3RoKSlcbiAgICAgICAgOiAodHlwZSA9PSAnc3RyaW5nJyAmJiBpbmRleCBpbiBvYmplY3QpXG4gICAgICApIHtcbiAgICByZXR1cm4gZXEob2JqZWN0W2luZGV4XSwgdmFsdWUpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0l0ZXJhdGVlQ2FsbDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC9faXNJdGVyYXRlZUNhbGwuanNcbiAqKiBtb2R1bGUgaWQgPSAxMTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBhcHBseSA9IHJlcXVpcmUoJy4vX2FwcGx5JyksXG4gICAgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi90b0ludGVnZXInKTtcblxuLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGVcbiAqIGNyZWF0ZWQgZnVuY3Rpb24gYW5kIGFyZ3VtZW50cyBmcm9tIGBzdGFydGAgYW5kIGJleW9uZCBwcm92aWRlZCBhc1xuICogYW4gYXJyYXkuXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGJhc2VkIG9uIHRoZVxuICogW3Jlc3QgcGFyYW1ldGVyXShodHRwczovL21kbi5pby9yZXN0X3BhcmFtZXRlcnMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgc2F5ID0gXy5yZXN0KGZ1bmN0aW9uKHdoYXQsIG5hbWVzKSB7XG4gKiAgIHJldHVybiB3aGF0ICsgJyAnICsgXy5pbml0aWFsKG5hbWVzKS5qb2luKCcsICcpICtcbiAqICAgICAoXy5zaXplKG5hbWVzKSA+IDEgPyAnLCAmICcgOiAnJykgKyBfLmxhc3QobmFtZXMpO1xuICogfSk7XG4gKlxuICogc2F5KCdoZWxsbycsICdmcmVkJywgJ2Jhcm5leScsICdwZWJibGVzJyk7XG4gKiAvLyA9PiAnaGVsbG8gZnJlZCwgYmFybmV5LCAmIHBlYmJsZXMnXG4gKi9cbmZ1bmN0aW9uIHJlc3QoZnVuYywgc3RhcnQpIHtcbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgc3RhcnQgPSBuYXRpdmVNYXgoc3RhcnQgPT09IHVuZGVmaW5lZCA/IChmdW5jLmxlbmd0aCAtIDEpIDogdG9JbnRlZ2VyKHN0YXJ0KSwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICBhcnJheSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgYXJyYXlbaW5kZXhdID0gYXJnc1tzdGFydCArIGluZGV4XTtcbiAgICB9XG4gICAgc3dpdGNoIChzdGFydCkge1xuICAgICAgY2FzZSAwOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIGFycmF5KTtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmdzWzBdLCBhcnJheSk7XG4gICAgICBjYXNlIDI6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJnc1swXSwgYXJnc1sxXSwgYXJyYXkpO1xuICAgIH1cbiAgICB2YXIgb3RoZXJBcmdzID0gQXJyYXkoc3RhcnQgKyAxKTtcbiAgICBpbmRleCA9IC0xO1xuICAgIHdoaWxlICgrK2luZGV4IDwgc3RhcnQpIHtcbiAgICAgIG90aGVyQXJnc1tpbmRleF0gPSBhcmdzW2luZGV4XTtcbiAgICB9XG4gICAgb3RoZXJBcmdzW3N0YXJ0XSA9IGFycmF5O1xuICAgIHJldHVybiBhcHBseShmdW5jLCB0aGlzLCBvdGhlckFyZ3MpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc3Q7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvcmVzdC5qc1xuICoqIG1vZHVsZSBpZCA9IDExN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBBIGZhc3RlciBhbHRlcm5hdGl2ZSB0byBgRnVuY3Rpb24jYXBwbHlgLCB0aGlzIGZ1bmN0aW9uIGludm9rZXMgYGZ1bmNgXG4gKiB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiBgdGhpc0FyZ2AgYW5kIHRoZSBhcmd1bWVudHMgb2YgYGFyZ3NgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBpbnZva2UuXG4gKiBAcGFyYW0geyp9IHRoaXNBcmcgVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgVGhlIGFyZ3VtZW50cyB0byBpbnZva2UgYGZ1bmNgIHdpdGguXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGBmdW5jYC5cbiAqL1xuZnVuY3Rpb24gYXBwbHkoZnVuYywgdGhpc0FyZywgYXJncykge1xuICB2YXIgbGVuZ3RoID0gYXJncy5sZW5ndGg7XG4gIHN3aXRjaCAobGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcpO1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdKTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICB9XG4gIHJldHVybiBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcGx5O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vbG9kYXNoL19hcHBseS5qc1xuICoqIG1vZHVsZSBpZCA9IDExOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHRvRmluaXRlID0gcmVxdWlyZSgnLi90b0Zpbml0ZScpO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYW4gaW50ZWdlci5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0ludGVnZXJgXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtdG9pbnRlZ2VyKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBpbnRlZ2VyLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvSW50ZWdlcigzLjIpO1xuICogLy8gPT4gM1xuICpcbiAqIF8udG9JbnRlZ2VyKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gMFxuICpcbiAqIF8udG9JbnRlZ2VyKEluZmluaXR5KTtcbiAqIC8vID0+IDEuNzk3NjkzMTM0ODYyMzE1N2UrMzA4XG4gKlxuICogXy50b0ludGVnZXIoJzMuMicpO1xuICogLy8gPT4gM1xuICovXG5mdW5jdGlvbiB0b0ludGVnZXIodmFsdWUpIHtcbiAgdmFyIHJlc3VsdCA9IHRvRmluaXRlKHZhbHVlKSxcbiAgICAgIHJlbWFpbmRlciA9IHJlc3VsdCAlIDE7XG5cbiAgcmV0dXJuIHJlc3VsdCA9PT0gcmVzdWx0ID8gKHJlbWFpbmRlciA/IHJlc3VsdCAtIHJlbWFpbmRlciA6IHJlc3VsdCkgOiAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvSW50ZWdlcjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC90b0ludGVnZXIuanNcbiAqKiBtb2R1bGUgaWQgPSAxMTlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciB0b051bWJlciA9IHJlcXVpcmUoJy4vdG9OdW1iZXInKTtcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMCxcbiAgICBNQVhfSU5URUdFUiA9IDEuNzk3NjkzMTM0ODYyMzE1N2UrMzA4O1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBmaW5pdGUgbnVtYmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMi4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBudW1iZXIuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9GaW5pdGUoMy4yKTtcbiAqIC8vID0+IDMuMlxuICpcbiAqIF8udG9GaW5pdGUoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvRmluaXRlKEluZmluaXR5KTtcbiAqIC8vID0+IDEuNzk3NjkzMTM0ODYyMzE1N2UrMzA4XG4gKlxuICogXy50b0Zpbml0ZSgnMy4yJyk7XG4gKiAvLyA9PiAzLjJcbiAqL1xuZnVuY3Rpb24gdG9GaW5pdGUodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogMDtcbiAgfVxuICB2YWx1ZSA9IHRvTnVtYmVyKHZhbHVlKTtcbiAgaWYgKHZhbHVlID09PSBJTkZJTklUWSB8fCB2YWx1ZSA9PT0gLUlORklOSVRZKSB7XG4gICAgdmFyIHNpZ24gPSAodmFsdWUgPCAwID8gLTEgOiAxKTtcbiAgICByZXR1cm4gc2lnbiAqIE1BWF9JTlRFR0VSO1xuICB9XG4gIHJldHVybiB2YWx1ZSA9PT0gdmFsdWUgPyB2YWx1ZSA6IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9GaW5pdGU7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9sb2Rhc2gvdG9GaW5pdGUuanNcbiAqKiBtb2R1bGUgaWQgPSAxMjBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgaXNTeW1ib2wgPSByZXF1aXJlKCcuL2lzU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE5BTiA9IDAgLyAwO1xuXG4vKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLiAqL1xudmFyIHJlVHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmFkIHNpZ25lZCBoZXhhZGVjaW1hbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCYWRIZXggPSAvXlstK10weFswLTlhLWZdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCaW5hcnkgPSAvXjBiWzAxXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvY3RhbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbi8qKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB3aXRob3V0IGEgZGVwZW5kZW5jeSBvbiBgcm9vdGAuICovXG52YXIgZnJlZVBhcnNlSW50ID0gcGFyc2VJbnQ7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIG51bWJlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIG51bWJlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b051bWJlcigzLjIpO1xuICogLy8gPT4gMy4yXG4gKlxuICogXy50b051bWJlcihOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDVlLTMyNFxuICpcbiAqIF8udG9OdW1iZXIoSW5maW5pdHkpO1xuICogLy8gPT4gSW5maW5pdHlcbiAqXG4gKiBfLnRvTnVtYmVyKCczLjInKTtcbiAqIC8vID0+IDMuMlxuICovXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gTkFOO1xuICB9XG4gIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICB2YXIgb3RoZXIgPSBpc0Z1bmN0aW9uKHZhbHVlLnZhbHVlT2YpID8gdmFsdWUudmFsdWVPZigpIDogdmFsdWU7XG4gICAgdmFsdWUgPSBpc09iamVjdChvdGhlcikgPyAob3RoZXIgKyAnJykgOiBvdGhlcjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiArdmFsdWU7XG4gIH1cbiAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKHJlVHJpbSwgJycpO1xuICB2YXIgaXNCaW5hcnkgPSByZUlzQmluYXJ5LnRlc3QodmFsdWUpO1xuICByZXR1cm4gKGlzQmluYXJ5IHx8IHJlSXNPY3RhbC50ZXN0KHZhbHVlKSlcbiAgICA/IGZyZWVQYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgaXNCaW5hcnkgPyAyIDogOClcbiAgICA6IChyZUlzQmFkSGV4LnRlc3QodmFsdWUpID8gTkFOIDogK3ZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b051bWJlcjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2xvZGFzaC90b051bWJlci5qc1xuICoqIG1vZHVsZSBpZCA9IDEyMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiY29uc3QgWk9PTV9TSVpFID0gMC41O1xuXG5jb25zdCBWSUVXUE9SVF9QUk9UT1RZUEUgPSB7XG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIGxldCBjdXJyZW50Q29uZmlnID0gdGhpcy5nZXRDb25maWcoKTtcblxuICAgIHRoaXMuc2V0Qm91bmRzKHtcbiAgICAgIHg6IHttaW46IGN1cnJlbnRDb25maWcueF9taW4sIG1heDogY3VycmVudENvbmZpZy54X21heH0sXG4gICAgICB5OiB7bWluOiBjdXJyZW50Q29uZmlnLnlfbWluLCBtYXg6IGN1cnJlbnRDb25maWcueV9tYXh9XG4gICAgfSk7XG5cbiAgICB0aGlzLmdyb3dUb0FzcGVjdFJhdGlvKCk7XG4gIH0sXG4gIGluaXQ6IGZ1bmN0aW9uICh7Y2FudmFzLCBnZXRDb25maWcsIHNldENvbmZpZ30pIHtcbiAgICB0aGlzLmdldENvbmZpZyA9IGdldENvbmZpZztcbiAgICB0aGlzLnNldENvbmZpZyA9IHNldENvbmZpZztcbiAgICB0aGlzLmJpbmRUb0NhbnZhcyhjYW52YXMpO1xuXG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfSxcbiAgeEJvdW5kczoge21pbjogMCwgbWF4OiAwfSxcbiAgeUJvdW5kczoge21pbjogMCwgbWF4OiAwfSxcbiAgc2V0Qm91bmRzOiBmdW5jdGlvbiAoYm91bmRzKSB7XG4gICAgdGhpcy54Qm91bmRzID0gYm91bmRzLng7XG4gICAgdGhpcy55Qm91bmRzID0gYm91bmRzLnk7XG4gIH0sXG4gIGxvY2F0aW9uSGFzaDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICB4X21pbjogdGhpcy54Qm91bmRzLm1pbixcbiAgICAgIHhfbWF4OiB0aGlzLnhCb3VuZHMubWF4LFxuICAgICAgeV9taW46IHRoaXMueUJvdW5kcy5taW4sXG4gICAgICB5X21heDogdGhpcy55Qm91bmRzLm1heFxuICAgIH07XG4gIH0sXG4gIGNlbnRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICB4OiAodGhpcy54Qm91bmRzLm1heCArIHRoaXMueEJvdW5kcy5taW4pIC8gMixcbiAgICAgIHk6ICh0aGlzLnlCb3VuZHMubWF4ICsgdGhpcy55Qm91bmRzLm1pbikgLyAyXG4gICAgfTtcbiAgfSxcbiAgcmFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogdGhpcy54Qm91bmRzLm1heCAtIHRoaXMueEJvdW5kcy5taW4sXG4gICAgICB5OiB0aGlzLnlCb3VuZHMubWF4IC0gdGhpcy55Qm91bmRzLm1pblxuICAgIH07XG4gIH0sXG4gIGRlbHRhOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRoaXMucmFuZ2UoKS54IC8gdGhpcy53aWR0aCxcbiAgICAgIHk6IHRoaXMucmFuZ2UoKS55IC8gdGhpcy5oZWlnaHRcbiAgICB9O1xuICB9LFxuICB0b3BMZWZ0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRoaXMueEJvdW5kcy5taW4sXG4gICAgICB5OiB0aGlzLnlCb3VuZHMubWluXG4gICAgfTtcbiAgfSxcbiAgY2FudmFzU2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICB4OiB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aCxcbiAgICAgIHk6IHRoaXMuY2FudmFzLm9mZnNldEhlaWdodFxuICAgIH07XG4gIH0sXG4gIGNhbnZhc0NsaWNrTG9jYXRpb246IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBjdXJyZW50Q2FudmFzU2l6ZSA9IHRoaXMuY2FudmFzU2l6ZSgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IGV2ZW50Lm9mZnNldFggLyBjdXJyZW50Q2FudmFzU2l6ZS54ICogdGhpcy53aWR0aCxcbiAgICAgIHk6IGV2ZW50Lm9mZnNldFkgLyBjdXJyZW50Q2FudmFzU2l6ZS55ICogdGhpcy5oZWlnaHRcbiAgICB9O1xuICB9LFxuICBjYXJ0ZXNpYW5DbGlja0xvY2F0aW9uOiBmdW5jdGlvbiAoY2FudmFzQ2xpY2tMb2NhdGlvbikge1xuICAgIHZhciByYW5nZSA9IHRoaXMucmFuZ2UoKTtcbiAgICB2YXIgdG9wTGVmdCA9IHRoaXMudG9wTGVmdCgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRvcExlZnQueCArIHJhbmdlLnggKiBjYW52YXNDbGlja0xvY2F0aW9uLnggLyB0aGlzLndpZHRoLFxuICAgICAgeTogdG9wTGVmdC55ICsgcmFuZ2UueSAqIGNhbnZhc0NsaWNrTG9jYXRpb24ueSAvIHRoaXMuaGVpZ2h0XG4gICAgfTtcbiAgfSxcbiAgem9vbVRvTG9jYXRpb246IGZ1bmN0aW9uIChsb2NhdGlvbikge1xuICAgIHZhciByYW5nZSA9IHRoaXMucmFuZ2UoKTtcblxuICAgIHRoaXMuc2V0Qm91bmRzKHtcbiAgICAgIHg6IHtcbiAgICAgICAgbWluOiBsb2NhdGlvbi54IC0gKHJhbmdlLnggKiBaT09NX1NJWkUgKiAwLjUpLFxuICAgICAgICBtYXg6IGxvY2F0aW9uLnggKyAocmFuZ2UueCAqIFpPT01fU0laRSAqIDAuNSlcbiAgICAgIH0sXG4gICAgICB5OiB7XG4gICAgICAgIG1pbjogbG9jYXRpb24ueSAtIChyYW5nZS55ICogWk9PTV9TSVpFICogMC41KSxcbiAgICAgICAgbWF4OiBsb2NhdGlvbi55ICsgKHJhbmdlLnkgKiBaT09NX1NJWkUgKiAwLjUpXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldENvbmZpZyh0aGlzLmxvY2F0aW9uSGFzaCgpKTtcbiAgfSxcbiAgYmluZFRvQ2FudmFzOiBmdW5jdGlvbiAoY2FudmFzKSB7XG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aDtcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQ7XG5cbiAgICB0aGlzLndpZHRoID0gdGhpcy5jYW52YXMud2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG5cbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgIHZhciBjYW52YXNDbGlja0xvY2F0aW9uICAgID0gdGhpcy5jYW52YXNDbGlja0xvY2F0aW9uKGV2ZW50KTtcbiAgICAgIHZhciBjYXJ0ZXNpYW5DbGlja0xvY2F0aW9uID0gdGhpcy5jYXJ0ZXNpYW5DbGlja0xvY2F0aW9uKGNhbnZhc0NsaWNrTG9jYXRpb24pO1xuXG4gICAgICB0aGlzLnpvb21Ub0xvY2F0aW9uKGNhcnRlc2lhbkNsaWNrTG9jYXRpb24pO1xuICAgIH0pO1xuICB9LFxuICBncm93VG9Bc3BlY3RSYXRpbzogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW52YXNBc3BlY3RSYXRpbyA9IHRoaXMuY2FudmFzLndpZHRoIC8gdGhpcy5jYW52YXMuaGVpZ2h0O1xuXG4gICAgdmFyIHJhbmdlID0gdGhpcy5yYW5nZSgpO1xuICAgIHZhciBjZW50ZXIgPSB0aGlzLmNlbnRlcigpO1xuICAgIHZhciBjdXJyZW50QXNwZWN0UmF0aW8gPSByYW5nZS54IC8gcmFuZ2UueTtcblxuICAgIHZhciBuZXdEaXN0YW5jZUZyb21DZW50ZXI7XG4gICAgdmFyIHhCb3VuZHMgPSB0aGlzLnhCb3VuZHM7XG4gICAgdmFyIHlCb3VuZHMgPSB0aGlzLnlCb3VuZHM7XG4gICAgaWYgKGN1cnJlbnRBc3BlY3RSYXRpbyA+IGNhbnZhc0FzcGVjdFJhdGlvKSB7XG4gICAgICAvKiBoZWlnaHQgbmVlZHMgZXhwYW5zaW9uICovXG4gICAgICB2YXIgdmVydGljYWxFZGdlVG9DZW50ZXJEaXN0YW5jZSA9IHlCb3VuZHMubWluIC0gY2VudGVyLnk7XG5cbiAgICAgIG5ld0Rpc3RhbmNlRnJvbUNlbnRlciA9IHZlcnRpY2FsRWRnZVRvQ2VudGVyRGlzdGFuY2UgKiAoY3VycmVudEFzcGVjdFJhdGlvIC8gY2FudmFzQXNwZWN0UmF0aW8pO1xuICAgICAgeUJvdW5kcyA9IHtcbiAgICAgICAgbWluOiBjZW50ZXIueSArIG5ld0Rpc3RhbmNlRnJvbUNlbnRlcixcbiAgICAgICAgbWF4OiBjZW50ZXIueSAtIG5ld0Rpc3RhbmNlRnJvbUNlbnRlclxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLyogd2lkdGggbmVlZHMgZXhwYW5zaW9uICovXG4gICAgICB2YXIgaG9yaXpvbnRhbEVkZ2VUb0NlbnRlckRpc3RhbmNlID0geEJvdW5kcy5taW4gLSBjZW50ZXIueDtcblxuICAgICAgbmV3RGlzdGFuY2VGcm9tQ2VudGVyID0gaG9yaXpvbnRhbEVkZ2VUb0NlbnRlckRpc3RhbmNlICogKGNhbnZhc0FzcGVjdFJhdGlvIC8gY3VycmVudEFzcGVjdFJhdGlvKTtcbiAgICAgIHhCb3VuZHMgPSB7XG4gICAgICAgIG1pbjogY2VudGVyLnggKyBuZXdEaXN0YW5jZUZyb21DZW50ZXIsXG4gICAgICAgIG1heDogY2VudGVyLnggLSBuZXdEaXN0YW5jZUZyb21DZW50ZXJcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy5zZXRCb3VuZHMoe1xuICAgICAgeDogeEJvdW5kcyxcbiAgICAgIHk6IHlCb3VuZHNcbiAgICB9KTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjcmVhdGUoe2NhbnZhcywgZ2V0Q29uZmlnLCBzZXRDb25maWd9KSB7XG4gICAgdmFyIHZpZXdwb3J0ID0gT2JqZWN0LmNyZWF0ZShWSUVXUE9SVF9QUk9UT1RZUEUpO1xuXG4gICAgdmlld3BvcnQuaW5pdCh7Y2FudmFzLCBnZXRDb25maWcsIHNldENvbmZpZ30pO1xuXG4gICAgcmV0dXJuIHZpZXdwb3J0O1xuICB9XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9qYXZhc2NyaXB0L3ZpZXdwb3J0LmpzXG4gKiovIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2hhZGVyU291cmNlLCBzaGFkZXJUeXBlLCBjb250ZXh0KSB7XG4gIGNvbnN0IHNoYWRlciA9IGNvbnRleHQuY3JlYXRlU2hhZGVyKHNoYWRlclR5cGUpO1xuXG4gIGNvbnRleHQuc2hhZGVyU291cmNlKHNoYWRlciwgc2hhZGVyU291cmNlKTtcbiAgY29udGV4dC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG5cbiAgaWYgKCFjb250ZXh0LmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGNvbnRleHQuQ09NUElMRV9TVEFUVVMpKSB7XG4gICAgdGhyb3cgXCJTaGFkZXIgY29tcGlsZSBmYWlsZWQgd2l0aDogXCIgKyBjb250ZXh0LmdldFNoYWRlckluZm9Mb2coc2hhZGVyKTtcbiAgfVxuXG4gIHJldHVybiBzaGFkZXI7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2phdmFzY3JpcHQvdXRpbGl0eS9jb21waWxlU2hhZGVyLmpzXG4gKiovIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocHJvZ3JhbSwgbmFtZSwgY29udGV4dCkge1xuICBjb25zdCBhdHRyaWJ1dGVMb2NhdGlvbiA9IGNvbnRleHQuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgbmFtZSk7XG5cbiAgaWYgKGF0dHJpYnV0ZUxvY2F0aW9uID09PSAtMSkge1xuICAgICAgdGhyb3cgJ0NhbiBub3QgZmluZCBhdHRyaWJ1dGUgJyArIG5hbWUgKyAnLic7XG4gIH1cblxuICByZXR1cm4gYXR0cmlidXRlTG9jYXRpb247XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL2phdmFzY3JpcHQvdXRpbGl0eS9nZXRBdHRyaWJMb2NhdGlvbi5qc1xuICoqLyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHByb2dyYW0sIG5hbWUsIGNvbnRleHQpIHtcbiAgY29uc3QgdW5pZm9ybUxvY2F0aW9uID0gY29udGV4dC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgbmFtZSk7XG5cbiAgaWYgKHVuaWZvcm1Mb2NhdGlvbiA9PT0gLTEpIHtcbiAgICB0aHJvdyAnQ2FuIG5vdCBmaW5kIHVuaWZvcm0gJyArIG5hbWUgKyAnLic7XG4gIH1cblxuICByZXR1cm4gdW5pZm9ybUxvY2F0aW9uO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9qYXZhc2NyaXB0L3V0aWxpdHkvZ2V0VW5pZm9ybUxvY2F0aW9uLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBcImF0dHJpYnV0ZSB2ZWMyIHBvc2l0aW9uO1xcblxcbnZvaWQgbWFpbigpIHtcXG4gIC8vIHBvc2l0aW9uIHNwZWNpZmllcyBvbmx5IHggYW5kIHkuXFxuICAvLyBXZSBzZXQgeiB0byBiZSAwLjAsIGFuZCB3IHRvIGJlIDEuMFxcbiAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAwLjAsIDEuMCk7XFxufVxcblwiXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NoYWRlcnMvdmVydGV4U2hhZGVyLmdsc2xcbiAqKiBtb2R1bGUgaWQgPSAxMjZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gXCJwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxuXFxuLy8gV0lEVEgsIEhFSUdIVCwgQ19SRUFMLCBDX0lNQUdJTkFSWSwgWF9NSU4sIFhfTUFYLCBZX01JTiwgWV9NQVhcXG51bmlmb3JtIGZsb2F0IGRhdGFbOV07XFxuXFxuZmxvYXQgV0lEVEggICAgICA9IGRhdGFbMF07XFxuZmxvYXQgSEVJR0hUICAgICA9IGRhdGFbMV07XFxuXFxuZmxvYXQgQ19SRUFMICAgICA9IGRhdGFbMl07XFxuZmxvYXQgQ19JTUFHICAgICA9IGRhdGFbM107XFxuXFxuZmxvYXQgQlJJR0hUTkVTUyA9IGRhdGFbNF07XFxuXFxuZmxvYXQgWF9NSU4gICAgICA9IGRhdGFbNV07XFxuZmxvYXQgWF9NQVggICAgICA9IGRhdGFbNl07XFxuZmxvYXQgWV9NSU4gICAgICA9IGRhdGFbN107XFxuZmxvYXQgWV9NQVggICAgICA9IGRhdGFbOF07XFxuXFxuY29uc3QgaW50IE1BWF9JVEVSQVRJT05TID0gMTAyNDtcXG5cXG52ZWMyIGlSZXNvbHV0aW9uID0gdmVjMihXSURUSCwgSEVJR0hUKTtcXG5cXG5zdHJ1Y3QgY29tcGxleCB7XFxuICBmbG9hdCByZWFsO1xcbiAgZmxvYXQgaW1hZ2luYXJ5O1xcbn07XFxuXFxuaW50IGZyYWN0YWwoY29tcGxleCBjLCBjb21wbGV4IHopIHtcXG4gIGZvciAoaW50IGl0ZXJhdGlvbiA9IDA7IGl0ZXJhdGlvbiA8IE1BWF9JVEVSQVRJT05TOyBpdGVyYXRpb24rKykge1xcblxcbiAgICAvLyB6IDwtIHpeMiArIGNcXG4gICAgZmxvYXQgcmVhbCA9IHoucmVhbCAqIHoucmVhbCAtIHouaW1hZ2luYXJ5ICogei5pbWFnaW5hcnkgKyBjLnJlYWw7XFxuICAgIGZsb2F0IGltYWdpbmFyeSA9IDIuMCAqIHoucmVhbCAqIHouaW1hZ2luYXJ5ICsgYy5pbWFnaW5hcnk7XFxuXFxuICAgIHoucmVhbCA9IHJlYWw7XFxuICAgIHouaW1hZ2luYXJ5ID0gaW1hZ2luYXJ5O1xcblxcbiAgICBpZiAoei5yZWFsICogei5yZWFsICsgei5pbWFnaW5hcnkgKiB6LmltYWdpbmFyeSA+IDQuMCkge1xcbiAgICAgIHJldHVybiBpdGVyYXRpb247XFxuICAgIH1cXG4gIH1cXG5cXG4gIHJldHVybiAwO1xcbn1cXG5cXG5pbnQgbWFuZGVsYnJvdCh2ZWMyIGNvb3JkaW5hdGUpIHtcXG4gIGNvbXBsZXggYyA9IGNvbXBsZXgoY29vcmRpbmF0ZS54LCBjb29yZGluYXRlLnkpO1xcbiAgY29tcGxleCB6ID0gY29tcGxleCgwLjAsIDAuMCk7XFxuXFxuICByZXR1cm4gZnJhY3RhbChjLCB6KTtcXG59XFxuXFxuaW50IGp1bGlhKHZlYzIgY29vcmRpbmF0ZSwgdmVjMiBvZmZzZXQpIHtcXG4gIGNvbXBsZXggYyA9IGNvbXBsZXgob2Zmc2V0LngsIG9mZnNldC55KTtcXG4gIGNvbXBsZXggeiA9IGNvbXBsZXgoY29vcmRpbmF0ZS54LCBjb29yZGluYXRlLnkpO1xcblxcbiAgcmV0dXJuIGZyYWN0YWwoYywgeik7XFxufVxcblxcbnZlYzIgZnJhZ0Nvb3JkVG9YWSh2ZWM0IGZyYWdDb29yZCkge1xcbiAgdmVjMiByZWxhdGl2ZVBvc2l0aW9uID0gZnJhZ0Nvb3JkLnh5IC8gaVJlc29sdXRpb24ueHk7XFxuICBmbG9hdCBhc3BlY3RSYXRpbyA9IGlSZXNvbHV0aW9uLnggLyBIRUlHSFQ7XFxuXFxuICB2ZWMyIGNlbnRlciA9IHZlYzIoKFhfTUFYICsgWF9NSU4pIC8gMi4wLCAoWV9NQVggKyBZX01JTikgLyAyLjApO1xcblxcbiAgdmVjMiBjYXJ0ZXNpYW5Qb3NpdGlvbiA9IChyZWxhdGl2ZVBvc2l0aW9uIC0gMC41KSAqIChYX01BWCAtIFhfTUlOKTtcXG4gIGNhcnRlc2lhblBvc2l0aW9uLnggKz0gY2VudGVyLng7XFxuICBjYXJ0ZXNpYW5Qb3NpdGlvbi55IC09IGNlbnRlci55O1xcbiAgY2FydGVzaWFuUG9zaXRpb24ueCAqPSBhc3BlY3RSYXRpbztcXG5cXG4gIHJldHVybiBjYXJ0ZXNpYW5Qb3NpdGlvbjtcXG59XFxuXFxudm9pZCBtYWluKCkge1xcbiAgdmVjMiBjb29yZGluYXRlID0gZnJhZ0Nvb3JkVG9YWShnbF9GcmFnQ29vcmQpO1xcblxcbiAgLy8gaW50IGZyYWN0YWxWYWx1ZSA9IG1hbmRlbGJyb3QoY29vcmRpbmF0ZSk7XFxuICBpbnQgZnJhY3RhbFZhbHVlID0ganVsaWEoY29vcmRpbmF0ZSwgdmVjMihDX1JFQUwsIENfSU1BRykpO1xcblxcbiAgZmxvYXQgY29sb3IgPSBCUklHSFRORVNTICogZmxvYXQoZnJhY3RhbFZhbHVlKSAvIGZsb2F0KE1BWF9JVEVSQVRJT05TKTtcXG5cXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IsIGNvbG9yLCBjb2xvciwgMS4wKTtcXG59XFxuXCJcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vc2hhZGVycy9mcmFjdGFsLmdsc2xcbiAqKiBtb2R1bGUgaWQgPSAxMjdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID1cbi8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9LFxuLyoqKioqKi8gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bG9hZGVkOiBmYWxzZVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXHRcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuXHQgIHZhbHVlOiB0cnVlXG5cdH0pO1xuXHRcblx0ZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXHRcblx0dmFyIF9qYXZhc2NyaXB0R2V0SGFzaFBhcmFtcyA9IF9fd2VicGFja19yZXF1aXJlX18oMSk7XG5cdFxuXHR2YXIgX2phdmFzY3JpcHRHZXRIYXNoUGFyYW1zMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2phdmFzY3JpcHRHZXRIYXNoUGFyYW1zKTtcblx0XG5cdHZhciBfamF2YXNjcmlwdEhhc2hDaGFuZ2VIYW5kbGVyID0gX193ZWJwYWNrX3JlcXVpcmVfXygyKTtcblx0XG5cdHZhciBfamF2YXNjcmlwdEhhc2hDaGFuZ2VIYW5kbGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2phdmFzY3JpcHRIYXNoQ2hhbmdlSGFuZGxlcik7XG5cdFxuXHR2YXIgX2phdmFzY3JpcHRLZXlzV2l0aENoYW5nZWRWYWx1ZXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDI3KTtcblx0XG5cdHZhciBfamF2YXNjcmlwdEtleXNXaXRoQ2hhbmdlZFZhbHVlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9qYXZhc2NyaXB0S2V5c1dpdGhDaGFuZ2VkVmFsdWVzKTtcblx0XG5cdHZhciBfamF2YXNjcmlwdFN1YnNjcmliZSA9IF9fd2VicGFja19yZXF1aXJlX18oNjApO1xuXHRcblx0dmFyIF9qYXZhc2NyaXB0U3Vic2NyaWJlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2phdmFzY3JpcHRTdWJzY3JpYmUpO1xuXHRcblx0dmFyIF9qYXZhc2NyaXB0U3Vic2NyaXB0aW9uID0gX193ZWJwYWNrX3JlcXVpcmVfXyg2MSk7XG5cdFxuXHR2YXIgX2phdmFzY3JpcHRTdWJzY3JpcHRpb24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfamF2YXNjcmlwdFN1YnNjcmlwdGlvbik7XG5cdFxuXHR2YXIgX2phdmFzY3JpcHRTdWJzY3JpcHRpb25zQnlQcm9wZXJ0eSA9IF9fd2VicGFja19yZXF1aXJlX18oNjMpO1xuXHRcblx0dmFyIF9qYXZhc2NyaXB0U3Vic2NyaXB0aW9uc0J5UHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfamF2YXNjcmlwdFN1YnNjcmlwdGlvbnNCeVByb3BlcnR5KTtcblx0XG5cdHZhciBfamF2YXNjcmlwdFN1YnNjcmlwdGlvbnNCeVVVSUQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDY0KTtcblx0XG5cdHZhciBfamF2YXNjcmlwdFN1YnNjcmlwdGlvbnNCeVVVSUQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfamF2YXNjcmlwdFN1YnNjcmlwdGlvbnNCeVVVSUQpO1xuXHRcblx0dmFyIF9qYXZhc2NyaXB0VW5zdWJzY3JpYmUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDY1KTtcblx0XG5cdHZhciBfamF2YXNjcmlwdFVuc3Vic2NyaWJlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2phdmFzY3JpcHRVbnN1YnNjcmliZSk7XG5cdFxuXHR2YXIgc3Vic2NyaXB0aW9uc0J5UHJvcGVydHkgPSAoMCwgX2phdmFzY3JpcHRTdWJzY3JpcHRpb25zQnlQcm9wZXJ0eTJbJ2RlZmF1bHQnXSkoKTtcblx0XG5cdC8qIHByb2JhYmx5IHNob3VsZCBtaWdyYXRlIHRoaXMgdG8gYSBmYWN0b3J5IGF0IHNvbWUgcG9pbnQgdG8gYXZvaWQgcG9zc2libGUgc2luZ2xldG9uIGlzc3VlcyAqL1xuXHRleHBvcnRzWydkZWZhdWx0J10gPSB7XG5cdCAgZW5zdXJlSW5pdGlhbGl6YXRpb246IGZ1bmN0aW9uIGVuc3VyZUluaXRpYWxpemF0aW9uKCkge1xuXHQgICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG5cdCAgICAgIHRoaXMuaW5pdCgpO1xuXHQgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblx0ICAgIH1cblx0ICB9LFxuXHQgIGluaXQ6IGZ1bmN0aW9uIGluaXQoKSB7XG5cdCAgICByZXR1cm4gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0ICAgICAgKDAsIF9qYXZhc2NyaXB0SGFzaENoYW5nZUhhbmRsZXIyWydkZWZhdWx0J10pKHtcblx0ICAgICAgICBldmVudDogZXZlbnQsXG5cdCAgICAgICAgZ2V0SGFzaFBhcmFtczogX2phdmFzY3JpcHRHZXRIYXNoUGFyYW1zMlsnZGVmYXVsdCddLFxuXHQgICAgICAgIGtleXNXaXRoQ2hhbmdlZFZhbHVlczogX2phdmFzY3JpcHRLZXlzV2l0aENoYW5nZWRWYWx1ZXMyWydkZWZhdWx0J10sXG5cdCAgICAgICAgc3Vic2NyaXB0aW9uc0J5UHJvcGVydHk6IHN1YnNjcmlwdGlvbnNCeVByb3BlcnR5LFxuXHQgICAgICAgIHN1YnNjcmlwdGlvbnNCeVVVSUQ6IF9qYXZhc2NyaXB0U3Vic2NyaXB0aW9uc0J5VVVJRDJbJ2RlZmF1bHQnXVxuXHQgICAgICB9KTtcblx0ICAgIH0pO1xuXHQgIH0sXG5cdCAgc3Vic2NyaWJlOiBmdW5jdGlvbiBzdWJzY3JpYmUocHJvcGVydGllcywgY2FsbGJhY2spIHtcblx0ICAgIHRoaXMuZW5zdXJlSW5pdGlhbGl6YXRpb24oKTtcblx0XG5cdCAgICByZXR1cm4gKDAsIF9qYXZhc2NyaXB0U3Vic2NyaWJlMlsnZGVmYXVsdCddKSh7XG5cdCAgICAgIFN1YnNjcmlwdGlvbjogX2phdmFzY3JpcHRTdWJzY3JpcHRpb24yWydkZWZhdWx0J10sXG5cdCAgICAgIHN1YnNjcmlwdGlvbnNCeVVVSUQ6IF9qYXZhc2NyaXB0U3Vic2NyaXB0aW9uc0J5VVVJRDJbJ2RlZmF1bHQnXSxcblx0ICAgICAgc3Vic2NyaXB0aW9uc0J5UHJvcGVydHk6IHN1YnNjcmlwdGlvbnNCeVByb3BlcnR5LFxuXHQgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxuXHQgICAgICBjYWxsYmFjazogY2FsbGJhY2tcblx0ICAgIH0pO1xuXHQgIH0sXG5cdCAgdW5zdWJzY3JpYmU6IGZ1bmN0aW9uIHVuc3Vic2NyaWJlKHN1YnNjcmlwdGlvblVVSUQpIHtcblx0ICAgICgwLCBfamF2YXNjcmlwdFVuc3Vic2NyaWJlMlsnZGVmYXVsdCddKSh7XG5cdCAgICAgIHN1YnNjcmlwdGlvblVVSUQ6IHN1YnNjcmlwdGlvblVVSUQsXG5cdCAgICAgIHN1YnNjcmlwdGlvbnNCeVVVSUQ6IF9qYXZhc2NyaXB0U3Vic2NyaXB0aW9uc0J5VVVJRDJbJ2RlZmF1bHQnXSxcblx0ICAgICAgc3Vic2NyaXB0aW9uc0J5UHJvcGVydHk6IHN1YnNjcmlwdGlvbnNCeVByb3BlcnR5XG5cdCAgICB9KTtcblx0ICB9XG5cdH07XG5cdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG4vKioqLyB9LFxuLyogMSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXHRcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuXHQgIHZhbHVlOiB0cnVlXG5cdH0pO1xuXHRcblx0dmFyIF9zbGljZWRUb0FycmF5ID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbJ3JldHVybiddKSBfaVsncmV0dXJuJ10oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZScpOyB9IH07IH0pKCk7XG5cdFxuXHRleHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAodXJsKSB7XG5cdCAgdmFyIF91cmwkc3BsaXQgPSB1cmwuc3BsaXQoJyMnKTtcblx0XG5cdCAgdmFyIF91cmwkc3BsaXQyID0gX3NsaWNlZFRvQXJyYXkoX3VybCRzcGxpdCwgMik7XG5cdFxuXHQgIHZhciBfID0gX3VybCRzcGxpdDJbMF07XG5cdCAgdmFyIHVybEhhc2ggPSBfdXJsJHNwbGl0MlsxXTtcblx0XG5cdCAgdXJsSGFzaCA9IHVybEhhc2ggfHwgJyc7XG5cdCAgcmV0dXJuIHVybEhhc2guc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24gKGhhc2gsIGtleVZhbHVlUGFpcikge1xuXHQgICAgdmFyIF9rZXlWYWx1ZVBhaXIkc3BsaXQgPSBrZXlWYWx1ZVBhaXIuc3BsaXQoJz0nKTtcblx0XG5cdCAgICB2YXIgX2tleVZhbHVlUGFpciRzcGxpdDIgPSBfc2xpY2VkVG9BcnJheShfa2V5VmFsdWVQYWlyJHNwbGl0LCAyKTtcblx0XG5cdCAgICB2YXIga2V5ID0gX2tleVZhbHVlUGFpciRzcGxpdDJbMF07XG5cdCAgICB2YXIgdmFsdWUgPSBfa2V5VmFsdWVQYWlyJHNwbGl0MlsxXTtcblx0XG5cdCAgICBpZiAodmFsdWUgfHwgIWlzTmFOKHZhbHVlKSkge1xuXHQgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG5cdCAgICAgICAgaGFzaFtrZXldID0gdmFsdWU7XG5cdCAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgaGFzaFtrZXldID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG5cdCAgICAgIH1cblx0ICAgIH0gZWxzZSBpZiAoa2V5Lmxlbmd0aCA+IDApIHtcblx0ICAgICAgaGFzaFtrZXldID0gdHJ1ZTtcblx0ICAgIH1cblx0XG5cdCAgICByZXR1cm4gaGFzaDtcblx0ICB9LCB7fSk7XG5cdH07XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcblxuLyoqKi8gfSxcbi8qIDIgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdCd1c2Ugc3RyaWN0Jztcblx0XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcblx0ICB2YWx1ZTogdHJ1ZVxuXHR9KTtcblx0XG5cdGZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblx0XG5cdHZhciBfbG9kYXNoQXJyYXlJbnRlcnNlY3Rpb24gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDMpO1xuXHRcblx0dmFyIF9sb2Rhc2hBcnJheUludGVyc2VjdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sb2Rhc2hBcnJheUludGVyc2VjdGlvbik7XG5cdFxuXHR2YXIgX2xvZGFzaEFycmF5RmxhdHRlbiA9IF9fd2VicGFja19yZXF1aXJlX18oMjApO1xuXHRcblx0dmFyIF9sb2Rhc2hBcnJheUZsYXR0ZW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9kYXNoQXJyYXlGbGF0dGVuKTtcblx0XG5cdHZhciBfbG9kYXNoQXJyYXlJbnRlcnNlY3Rpb24zID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbG9kYXNoQXJyYXlJbnRlcnNlY3Rpb24pO1xuXHRcblx0LyogbmVlZHMgc3Vic2NyaXB0aW9uIHNldHMgdG8gYmUgZGVmaW5lZCBzb21ld2hlcmUgKi9cblx0LyogYW4gZXZlbnQgd2l0aCBhIHN1YnNjcmlwdGlvbiBzZXQgd2lsbCBvbmx5IGZpcmUgb25jZSAqL1xuXHQvKiBmb3IgYWxsIG9mIHRoZSBjaGFuZ2VzIGluIHRoZSBzZXQuICovXG5cdFxuXHRleHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoX3JlZikge1xuXHQgIHZhciBnZXRIYXNoUGFyYW1zID0gX3JlZi5nZXRIYXNoUGFyYW1zO1xuXHQgIHZhciBzdWJzY3JpcHRpb25zQnlQcm9wZXJ0eSA9IF9yZWYuc3Vic2NyaXB0aW9uc0J5UHJvcGVydHk7XG5cdCAgdmFyIHN1YnNjcmlwdGlvbnNCeVVVSUQgPSBfcmVmLnN1YnNjcmlwdGlvbnNCeVVVSUQ7XG5cdCAgdmFyIGtleXNXaXRoQ2hhbmdlZFZhbHVlcyA9IF9yZWYua2V5c1dpdGhDaGFuZ2VkVmFsdWVzO1xuXHQgIHZhciBldmVudCA9IF9yZWYuZXZlbnQ7XG5cdFxuXHQgIC8qIGdldCB0aGUgbmV3IHBhcmFtcyBvYmplY3QgKi9cblx0ICAvKiBnZXQgdGhlIG9sZCBwYXJhbXMgb2JqZWN0ICovXG5cdCAgdmFyIG9sZFBhcmFtcyA9IGdldEhhc2hQYXJhbXMoZXZlbnQub2xkVVJMKTtcblx0ICB2YXIgbmV3UGFyYW1zID0gZ2V0SGFzaFBhcmFtcyhldmVudC5uZXdVUkwpO1xuXHRcblx0ICB2YXIgc3Vic2NyaWJlZEtleXMgPSBPYmplY3Qua2V5cyhzdWJzY3JpcHRpb25zQnlQcm9wZXJ0eS5zdWJzY3JpcHRpb25zKTtcblx0XG5cdCAgLyogaWRlbnRpZnkgdGhlIGtleXMgd2l0aCBjaGFuZ2VkIHZhbHVlcyAqL1xuXHQgIHZhciBrZXlzV2l0aENoYW5nZXMgPSBrZXlzV2l0aENoYW5nZWRWYWx1ZXMob2xkUGFyYW1zLCBuZXdQYXJhbXMpO1xuXHRcblx0ICB2YXIga2V5c1dpdGhTdWJzY3JpYmVkRXZlbnRzID0gKDAsIF9sb2Rhc2hBcnJheUludGVyc2VjdGlvbjJbJ2RlZmF1bHQnXSkoa2V5c1dpdGhDaGFuZ2VzLCBzdWJzY3JpYmVkS2V5cyk7XG5cdFxuXHQgIC8vIGtleXNXaXRoU3Vic2NyaWJlZEV2ZW50cy5cblx0ICAvKiBsb29wIHRocm91Z2ggYWxsIG9mIHRoZSBzdWJzY3JpYmVkRXZlbnQgbmFtZXMgbG9va2luZyAqL1xuXHQgIC8qIGZvciBkaWZmZXJlbmNlcyBiZXR3ZWVuIG5ld1BhcmFtcyBhbmQgb2xkUGFyYW1zICovXG5cdCAgdmFyIHN1YnNjcmlwdGlvblVVSURzID0ga2V5c1dpdGhTdWJzY3JpYmVkRXZlbnRzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG5cdCAgICByZXR1cm4gT2JqZWN0LmtleXMoc3Vic2NyaXB0aW9uc0J5UHJvcGVydHkuc3Vic2NyaXB0aW9uc1trZXldKTtcblx0ICB9KTtcblx0XG5cdCAgc3Vic2NyaXB0aW9uVVVJRHMgPSAoMCwgX2xvZGFzaEFycmF5SW50ZXJzZWN0aW9uM1snZGVmYXVsdCddKSgoMCwgX2xvZGFzaEFycmF5RmxhdHRlbjJbJ2RlZmF1bHQnXSkoc3Vic2NyaXB0aW9uVVVJRHMpKTtcblx0XG5cdCAgLyogdHJpZ2dlciBldmVudHMgZm9yIGVhY2ggb2YgdGhlIGV2ZW50cyBmb3VuZCAqL1xuXHRcblx0ICB2YXIgc3Vic2NyaXB0aW9ucyA9IHN1YnNjcmlwdGlvblVVSURzLm1hcChmdW5jdGlvbiAoc3Vic2NyaXB0aW9uVVVJRCkge1xuXHQgICAgcmV0dXJuIHN1YnNjcmlwdGlvbnNCeVVVSURbc3Vic2NyaXB0aW9uVVVJRF07XG5cdCAgfSk7XG5cdFxuXHQgIHN1YnNjcmlwdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2NyaXB0aW9uKSB7XG5cdCAgICBzdWJzY3JpcHRpb24uY2FsbGJhY2sobmV3UGFyYW1zKTtcblx0ICB9KTtcblx0fTtcblx0XG5cdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG4vKioqLyB9LFxuLyogMyAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGJhc2VJbmRleE9mID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0KSxcblx0ICAgIGNhY2hlSW5kZXhPZiA9IF9fd2VicGFja19yZXF1aXJlX18oNiksXG5cdCAgICBjcmVhdGVDYWNoZSA9IF9fd2VicGFja19yZXF1aXJlX18oOCksXG5cdCAgICBpc0FycmF5TGlrZSA9IF9fd2VicGFja19yZXF1aXJlX18oMTUpLFxuXHQgICAgcmVzdFBhcmFtID0gX193ZWJwYWNrX3JlcXVpcmVfXygxOSk7XG5cdFxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBvZiB1bmlxdWUgdmFsdWVzIHRoYXQgYXJlIGluY2x1ZGVkIGluIGFsbCBvZiB0aGUgcHJvdmlkZWRcblx0ICogYXJyYXlzIHVzaW5nIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG5cdCAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAbWVtYmVyT2YgX1xuXHQgKiBAY2F0ZWdvcnkgQXJyYXlcblx0ICogQHBhcmFtIHsuLi5BcnJheX0gW2FycmF5c10gVGhlIGFycmF5cyB0byBpbnNwZWN0LlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBhcnJheSBvZiBzaGFyZWQgdmFsdWVzLlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBfLmludGVyc2VjdGlvbihbMSwgMl0sIFs0LCAyXSwgWzIsIDFdKTtcblx0ICogLy8gPT4gWzJdXG5cdCAqL1xuXHR2YXIgaW50ZXJzZWN0aW9uID0gcmVzdFBhcmFtKGZ1bmN0aW9uKGFycmF5cykge1xuXHQgIHZhciBvdGhMZW5ndGggPSBhcnJheXMubGVuZ3RoLFxuXHQgICAgICBvdGhJbmRleCA9IG90aExlbmd0aCxcblx0ICAgICAgY2FjaGVzID0gQXJyYXkobGVuZ3RoKSxcblx0ICAgICAgaW5kZXhPZiA9IGJhc2VJbmRleE9mLFxuXHQgICAgICBpc0NvbW1vbiA9IHRydWUsXG5cdCAgICAgIHJlc3VsdCA9IFtdO1xuXHRcblx0ICB3aGlsZSAob3RoSW5kZXgtLSkge1xuXHQgICAgdmFyIHZhbHVlID0gYXJyYXlzW290aEluZGV4XSA9IGlzQXJyYXlMaWtlKHZhbHVlID0gYXJyYXlzW290aEluZGV4XSkgPyB2YWx1ZSA6IFtdO1xuXHQgICAgY2FjaGVzW290aEluZGV4XSA9IChpc0NvbW1vbiAmJiB2YWx1ZS5sZW5ndGggPj0gMTIwKSA/IGNyZWF0ZUNhY2hlKG90aEluZGV4ICYmIHZhbHVlKSA6IG51bGw7XG5cdCAgfVxuXHQgIHZhciBhcnJheSA9IGFycmF5c1swXSxcblx0ICAgICAgaW5kZXggPSAtMSxcblx0ICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwLFxuXHQgICAgICBzZWVuID0gY2FjaGVzWzBdO1xuXHRcblx0ICBvdXRlcjpcblx0ICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHQgICAgdmFsdWUgPSBhcnJheVtpbmRleF07XG5cdCAgICBpZiAoKHNlZW4gPyBjYWNoZUluZGV4T2Yoc2VlbiwgdmFsdWUpIDogaW5kZXhPZihyZXN1bHQsIHZhbHVlLCAwKSkgPCAwKSB7XG5cdCAgICAgIHZhciBvdGhJbmRleCA9IG90aExlbmd0aDtcblx0ICAgICAgd2hpbGUgKC0tb3RoSW5kZXgpIHtcblx0ICAgICAgICB2YXIgY2FjaGUgPSBjYWNoZXNbb3RoSW5kZXhdO1xuXHQgICAgICAgIGlmICgoY2FjaGUgPyBjYWNoZUluZGV4T2YoY2FjaGUsIHZhbHVlKSA6IGluZGV4T2YoYXJyYXlzW290aEluZGV4XSwgdmFsdWUsIDApKSA8IDApIHtcblx0ICAgICAgICAgIGNvbnRpbnVlIG91dGVyO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgICBpZiAoc2Vlbikge1xuXHQgICAgICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG5cdCAgICAgIH1cblx0ICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gcmVzdWx0O1xuXHR9KTtcblx0XG5cdG1vZHVsZS5leHBvcnRzID0gaW50ZXJzZWN0aW9uO1xuXG5cbi8qKiovIH0sXG4vKiA0ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgaW5kZXhPZk5hTiA9IF9fd2VicGFja19yZXF1aXJlX18oNSk7XG5cdFxuXHQvKipcblx0ICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaW5kZXhPZmAgd2l0aG91dCBzdXBwb3J0IGZvciBiaW5hcnkgc2VhcmNoZXMuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBzZWFyY2guXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBmcm9tSW5kZXggVGhlIGluZGV4IHRvIHNlYXJjaCBmcm9tLlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSwgZWxzZSBgLTFgLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzZUluZGV4T2YoYXJyYXksIHZhbHVlLCBmcm9tSW5kZXgpIHtcblx0ICBpZiAodmFsdWUgIT09IHZhbHVlKSB7XG5cdCAgICByZXR1cm4gaW5kZXhPZk5hTihhcnJheSwgZnJvbUluZGV4KTtcblx0ICB9XG5cdCAgdmFyIGluZGV4ID0gZnJvbUluZGV4IC0gMSxcblx0ICAgICAgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcblx0ICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHQgICAgaWYgKGFycmF5W2luZGV4XSA9PT0gdmFsdWUpIHtcblx0ICAgICAgcmV0dXJuIGluZGV4O1xuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gLTE7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gYmFzZUluZGV4T2Y7XG5cblxuLyoqKi8gfSxcbi8qIDUgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBgTmFOYCBpcyBmb3VuZCBpbiBgYXJyYXlgLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gZnJvbUluZGV4IFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cblx0ICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIGBOYU5gLCBlbHNlIGAtMWAuXG5cdCAqL1xuXHRmdW5jdGlvbiBpbmRleE9mTmFOKGFycmF5LCBmcm9tSW5kZXgsIGZyb21SaWdodCkge1xuXHQgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG5cdCAgICAgIGluZGV4ID0gZnJvbUluZGV4ICsgKGZyb21SaWdodCA/IDAgOiAtMSk7XG5cdFxuXHQgIHdoaWxlICgoZnJvbVJpZ2h0ID8gaW5kZXgtLSA6ICsraW5kZXggPCBsZW5ndGgpKSB7XG5cdCAgICB2YXIgb3RoZXIgPSBhcnJheVtpbmRleF07XG5cdCAgICBpZiAob3RoZXIgIT09IG90aGVyKSB7XG5cdCAgICAgIHJldHVybiBpbmRleDtcblx0ICAgIH1cblx0ICB9XG5cdCAgcmV0dXJuIC0xO1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGluZGV4T2ZOYU47XG5cblxuLyoqKi8gfSxcbi8qIDYgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBpc09iamVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oNyk7XG5cdFxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgaW4gYGNhY2hlYCBtaW1pY2tpbmcgdGhlIHJldHVybiBzaWduYXR1cmUgb2Zcblx0ICogYF8uaW5kZXhPZmAgYnkgcmV0dXJuaW5nIGAwYCBpZiB0aGUgdmFsdWUgaXMgZm91bmQsIGVsc2UgYC0xYC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtPYmplY3R9IGNhY2hlIFRoZSBjYWNoZSB0byBzZWFyY2guXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgYDBgIGlmIGB2YWx1ZWAgaXMgZm91bmQsIGVsc2UgYC0xYC5cblx0ICovXG5cdGZ1bmN0aW9uIGNhY2hlSW5kZXhPZihjYWNoZSwgdmFsdWUpIHtcblx0ICB2YXIgZGF0YSA9IGNhY2hlLmRhdGEsXG5cdCAgICAgIHJlc3VsdCA9ICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHwgaXNPYmplY3QodmFsdWUpKSA/IGRhdGEuc2V0Lmhhcyh2YWx1ZSkgOiBkYXRhLmhhc2hbdmFsdWVdO1xuXHRcblx0ICByZXR1cm4gcmVzdWx0ID8gMCA6IC0xO1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGNhY2hlSW5kZXhPZjtcblxuXG4vKioqLyB9LFxuLyogNyAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZSBbbGFuZ3VhZ2UgdHlwZV0oaHR0cHM6Ly9lczUuZ2l0aHViLmlvLyN4OCkgb2YgYE9iamVjdGAuXG5cdCAqIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBtZW1iZXJPZiBfXG5cdCAqIEBjYXRlZ29yeSBMYW5nXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cblx0ICogQGV4YW1wbGVcblx0ICpcblx0ICogXy5pc09iamVjdCh7fSk7XG5cdCAqIC8vID0+IHRydWVcblx0ICpcblx0ICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuXHQgKiAvLyA9PiB0cnVlXG5cdCAqXG5cdCAqIF8uaXNPYmplY3QoMSk7XG5cdCAqIC8vID0+IGZhbHNlXG5cdCAqL1xuXHRmdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuXHQgIC8vIEF2b2lkIGEgVjggSklUIGJ1ZyBpbiBDaHJvbWUgMTktMjAuXG5cdCAgLy8gU2VlIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0yMjkxIGZvciBtb3JlIGRldGFpbHMuXG5cdCAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG5cdCAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcblxuXG4vKioqLyB9LFxuLyogOCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0LyogV0VCUEFDSyBWQVIgSU5KRUNUSU9OICovKGZ1bmN0aW9uKGdsb2JhbCkge3ZhciBTZXRDYWNoZSA9IF9fd2VicGFja19yZXF1aXJlX18oOSksXG5cdCAgICBnZXROYXRpdmUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDExKTtcblx0XG5cdC8qKiBOYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMuICovXG5cdHZhciBTZXQgPSBnZXROYXRpdmUoZ2xvYmFsLCAnU2V0Jyk7XG5cdFxuXHQvKiBOYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xuXHR2YXIgbmF0aXZlQ3JlYXRlID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2NyZWF0ZScpO1xuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBgU2V0YCBjYWNoZSBvYmplY3QgdG8gb3B0aW1pemUgbGluZWFyIHNlYXJjaGVzIG9mIGxhcmdlIGFycmF5cy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gW3ZhbHVlc10gVGhlIHZhbHVlcyB0byBjYWNoZS5cblx0ICogQHJldHVybnMge251bGx8T2JqZWN0fSBSZXR1cm5zIHRoZSBuZXcgY2FjaGUgb2JqZWN0IGlmIGBTZXRgIGlzIHN1cHBvcnRlZCwgZWxzZSBgbnVsbGAuXG5cdCAqL1xuXHRmdW5jdGlvbiBjcmVhdGVDYWNoZSh2YWx1ZXMpIHtcblx0ICByZXR1cm4gKG5hdGl2ZUNyZWF0ZSAmJiBTZXQpID8gbmV3IFNldENhY2hlKHZhbHVlcykgOiBudWxsO1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUNhY2hlO1xuXHRcblx0LyogV0VCUEFDSyBWQVIgSU5KRUNUSU9OICovfS5jYWxsKGV4cG9ydHMsIChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0oKSkpKVxuXG4vKioqLyB9LFxuLyogOSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0LyogV0VCUEFDSyBWQVIgSU5KRUNUSU9OICovKGZ1bmN0aW9uKGdsb2JhbCkge3ZhciBjYWNoZVB1c2ggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEwKSxcblx0ICAgIGdldE5hdGl2ZSA9IF9fd2VicGFja19yZXF1aXJlX18oMTEpO1xuXHRcblx0LyoqIE5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cblx0dmFyIFNldCA9IGdldE5hdGl2ZShnbG9iYWwsICdTZXQnKTtcblx0XG5cdC8qIE5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG5cdHZhciBuYXRpdmVDcmVhdGUgPSBnZXROYXRpdmUoT2JqZWN0LCAnY3JlYXRlJyk7XG5cdFxuXHQvKipcblx0ICpcblx0ICogQ3JlYXRlcyBhIGNhY2hlIG9iamVjdCB0byBzdG9yZSB1bmlxdWUgdmFsdWVzLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBbdmFsdWVzXSBUaGUgdmFsdWVzIHRvIGNhY2hlLlxuXHQgKi9cblx0ZnVuY3Rpb24gU2V0Q2FjaGUodmFsdWVzKSB7XG5cdCAgdmFyIGxlbmd0aCA9IHZhbHVlcyA/IHZhbHVlcy5sZW5ndGggOiAwO1xuXHRcblx0ICB0aGlzLmRhdGEgPSB7ICdoYXNoJzogbmF0aXZlQ3JlYXRlKG51bGwpLCAnc2V0JzogbmV3IFNldCB9O1xuXHQgIHdoaWxlIChsZW5ndGgtLSkge1xuXHQgICAgdGhpcy5wdXNoKHZhbHVlc1tsZW5ndGhdKTtcblx0ICB9XG5cdH1cblx0XG5cdC8vIEFkZCBmdW5jdGlvbnMgdG8gdGhlIGBTZXRgIGNhY2hlLlxuXHRTZXRDYWNoZS5wcm90b3R5cGUucHVzaCA9IGNhY2hlUHVzaDtcblx0XG5cdG1vZHVsZS5leHBvcnRzID0gU2V0Q2FjaGU7XG5cdFxuXHQvKiBXRUJQQUNLIFZBUiBJTkpFQ1RJT04gKi99LmNhbGwoZXhwb3J0cywgKGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSgpKSkpXG5cbi8qKiovIH0sXG4vKiAxMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGlzT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg3KTtcblx0XG5cdC8qKlxuXHQgKiBBZGRzIGB2YWx1ZWAgdG8gdGhlIGNhY2hlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAbmFtZSBwdXNoXG5cdCAqIEBtZW1iZXJPZiBTZXRDYWNoZVxuXHQgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjYWNoZS5cblx0ICovXG5cdGZ1bmN0aW9uIGNhY2hlUHVzaCh2YWx1ZSkge1xuXHQgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuXHQgIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHwgaXNPYmplY3QodmFsdWUpKSB7XG5cdCAgICBkYXRhLnNldC5hZGQodmFsdWUpO1xuXHQgIH0gZWxzZSB7XG5cdCAgICBkYXRhLmhhc2hbdmFsdWVdID0gdHJ1ZTtcblx0ICB9XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gY2FjaGVQdXNoO1xuXG5cbi8qKiovIH0sXG4vKiAxMSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGlzTmF0aXZlID0gX193ZWJwYWNrX3JlcXVpcmVfXygxMik7XG5cdFxuXHQvKipcblx0ICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cblx0ICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuXHQgKi9cblx0ZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG5cdCAgdmFyIHZhbHVlID0gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcblx0ICByZXR1cm4gaXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gZ2V0TmF0aXZlO1xuXG5cbi8qKiovIH0sXG4vKiAxMiAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGlzRnVuY3Rpb24gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEzKSxcblx0ICAgIGlzT2JqZWN0TGlrZSA9IF9fd2VicGFja19yZXF1aXJlX18oMTQpO1xuXHRcblx0LyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkgPiA1KS4gKi9cblx0dmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cdFxuXHQvKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xuXHR2YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXHRcblx0LyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xuXHR2YXIgZm5Ub1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcblx0XG5cdC8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xuXHR2YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblx0XG5cdC8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG5cdHZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG5cdCAgZm5Ub1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KS5yZXBsYWNlKC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZywgJ1xcXFwkJicpXG5cdCAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG5cdCk7XG5cdFxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQG1lbWJlck9mIF9cblx0ICogQGNhdGVnb3J5IExhbmdcblx0ICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG5cdCAqIEBleGFtcGxlXG5cdCAqXG5cdCAqIF8uaXNOYXRpdmUoQXJyYXkucHJvdG90eXBlLnB1c2gpO1xuXHQgKiAvLyA9PiB0cnVlXG5cdCAqXG5cdCAqIF8uaXNOYXRpdmUoXyk7XG5cdCAqIC8vID0+IGZhbHNlXG5cdCAqL1xuXHRmdW5jdGlvbiBpc05hdGl2ZSh2YWx1ZSkge1xuXHQgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG5cdCAgICByZXR1cm4gZmFsc2U7XG5cdCAgfVxuXHQgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuXHQgICAgcmV0dXJuIHJlSXNOYXRpdmUudGVzdChmblRvU3RyaW5nLmNhbGwodmFsdWUpKTtcblx0ICB9XG5cdCAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgcmVJc0hvc3RDdG9yLnRlc3QodmFsdWUpO1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGlzTmF0aXZlO1xuXG5cbi8qKiovIH0sXG4vKiAxMyAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGlzT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg3KTtcblx0XG5cdC8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cblx0dmFyIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nO1xuXHRcblx0LyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cblx0dmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblx0XG5cdC8qKlxuXHQgKiBVc2VkIHRvIHJlc29sdmUgdGhlIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuXHQgKiBvZiB2YWx1ZXMuXG5cdCAqL1xuXHR2YXIgb2JqVG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblx0XG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQG1lbWJlck9mIF9cblx0ICogQGNhdGVnb3J5IExhbmdcblx0ICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLCBlbHNlIGBmYWxzZWAuXG5cdCAqIEBleGFtcGxlXG5cdCAqXG5cdCAqIF8uaXNGdW5jdGlvbihfKTtcblx0ICogLy8gPT4gdHJ1ZVxuXHQgKlxuXHQgKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuXHQgKiAvLyA9PiBmYWxzZVxuXHQgKi9cblx0ZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuXHQgIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuXHQgIC8vIGluIG9sZGVyIHZlcnNpb25zIG9mIENocm9tZSBhbmQgU2FmYXJpIHdoaWNoIHJldHVybiAnZnVuY3Rpb24nIGZvciByZWdleGVzXG5cdCAgLy8gYW5kIFNhZmFyaSA4IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5IGNvbnN0cnVjdG9ycy5cblx0ICByZXR1cm4gaXNPYmplY3QodmFsdWUpICYmIG9ialRvU3RyaW5nLmNhbGwodmFsdWUpID09IGZ1bmNUYWc7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcblxuXG4vKioqLyB9LFxuLyogMTQgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG5cdCAqL1xuXHRmdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcblx0ICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuXG5cbi8qKiovIH0sXG4vKiAxNSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGdldExlbmd0aCA9IF9fd2VicGFja19yZXF1aXJlX18oMTYpLFxuXHQgICAgaXNMZW5ndGggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDE4KTtcblx0XG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cblx0ICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuXHQgKi9cblx0ZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcblx0ICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBpc0xlbmd0aChnZXRMZW5ndGgodmFsdWUpKTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5TGlrZTtcblxuXG4vKioqLyB9LFxuLyogMTYgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBiYXNlUHJvcGVydHkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDE3KTtcblx0XG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBcImxlbmd0aFwiIHByb3BlcnR5IHZhbHVlIG9mIGBvYmplY3RgLlxuXHQgKlxuXHQgKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGF2b2lkIGEgW0pJVCBidWddKGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xNDI3OTIpXG5cdCAqIHRoYXQgYWZmZWN0cyBTYWZhcmkgb24gYXQgbGVhc3QgaU9TIDguMS04LjMgQVJNNjQuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cblx0ICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIFwibGVuZ3RoXCIgdmFsdWUuXG5cdCAqL1xuXHR2YXIgZ2V0TGVuZ3RoID0gYmFzZVByb3BlcnR5KCdsZW5ndGgnKTtcblx0XG5cdG1vZHVsZS5leHBvcnRzID0gZ2V0TGVuZ3RoO1xuXG5cbi8qKiovIH0sXG4vKiAxNyAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0LyoqXG5cdCAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnByb3BlcnR5YCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuXHQgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2VQcm9wZXJ0eShrZXkpIHtcblx0ICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG5cdCAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcblx0ICB9O1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGJhc2VQcm9wZXJ0eTtcblxuXG4vKioqLyB9LFxuLyogMTggKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdC8qKlxuXHQgKiBVc2VkIGFzIHRoZSBbbWF4aW11bSBsZW5ndGhdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW51bWJlci5tYXhfc2FmZV9pbnRlZ2VyKVxuXHQgKiBvZiBhbiBhcnJheS1saWtlIHZhbHVlLlxuXHQgKi9cblx0dmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXHRcblx0LyoqXG5cdCAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG5cdCAqXG5cdCAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIGlzIGJhc2VkIG9uIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy10b2xlbmd0aCkuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuXHQgKi9cblx0ZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcblx0ICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBpc0xlbmd0aDtcblxuXG4vKioqLyB9LFxuLyogMTkgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdC8qKiBVc2VkIGFzIHRoZSBgVHlwZUVycm9yYCBtZXNzYWdlIGZvciBcIkZ1bmN0aW9uc1wiIG1ldGhvZHMuICovXG5cdHZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cdFxuXHQvKiBOYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xuXHR2YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cdFxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlXG5cdCAqIGNyZWF0ZWQgZnVuY3Rpb24gYW5kIGFyZ3VtZW50cyBmcm9tIGBzdGFydGAgYW5kIGJleW9uZCBwcm92aWRlZCBhcyBhbiBhcnJheS5cblx0ICpcblx0ICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGJhc2VkIG9uIHRoZSBbcmVzdCBwYXJhbWV0ZXJdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9GdW5jdGlvbnMvcmVzdF9wYXJhbWV0ZXJzKS5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAbWVtYmVyT2YgX1xuXHQgKiBAY2F0ZWdvcnkgRnVuY3Rpb25cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cblx0ICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuXHQgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cblx0ICogQGV4YW1wbGVcblx0ICpcblx0ICogdmFyIHNheSA9IF8ucmVzdFBhcmFtKGZ1bmN0aW9uKHdoYXQsIG5hbWVzKSB7XG5cdCAqICAgcmV0dXJuIHdoYXQgKyAnICcgKyBfLmluaXRpYWwobmFtZXMpLmpvaW4oJywgJykgK1xuXHQgKiAgICAgKF8uc2l6ZShuYW1lcykgPiAxID8gJywgJiAnIDogJycpICsgXy5sYXN0KG5hbWVzKTtcblx0ICogfSk7XG5cdCAqXG5cdCAqIHNheSgnaGVsbG8nLCAnZnJlZCcsICdiYXJuZXknLCAncGViYmxlcycpO1xuXHQgKiAvLyA9PiAnaGVsbG8gZnJlZCwgYmFybmV5LCAmIHBlYmJsZXMnXG5cdCAqL1xuXHRmdW5jdGlvbiByZXN0UGFyYW0oZnVuYywgc3RhcnQpIHtcblx0ICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuXHQgIH1cblx0ICBzdGFydCA9IG5hdGl2ZU1heChzdGFydCA9PT0gdW5kZWZpbmVkID8gKGZ1bmMubGVuZ3RoIC0gMSkgOiAoK3N0YXJ0IHx8IDApLCAwKTtcblx0ICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcblx0ICAgICAgICBpbmRleCA9IC0xLFxuXHQgICAgICAgIGxlbmd0aCA9IG5hdGl2ZU1heChhcmdzLmxlbmd0aCAtIHN0YXJ0LCAwKSxcblx0ICAgICAgICByZXN0ID0gQXJyYXkobGVuZ3RoKTtcblx0XG5cdCAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHQgICAgICByZXN0W2luZGV4XSA9IGFyZ3Nbc3RhcnQgKyBpbmRleF07XG5cdCAgICB9XG5cdCAgICBzd2l0Y2ggKHN0YXJ0KSB7XG5cdCAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcblx0ICAgICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIGFyZ3NbMF0sIHJlc3QpO1xuXHQgICAgICBjYXNlIDI6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJnc1swXSwgYXJnc1sxXSwgcmVzdCk7XG5cdCAgICB9XG5cdCAgICB2YXIgb3RoZXJBcmdzID0gQXJyYXkoc3RhcnQgKyAxKTtcblx0ICAgIGluZGV4ID0gLTE7XG5cdCAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG5cdCAgICAgIG90aGVyQXJnc1tpbmRleF0gPSBhcmdzW2luZGV4XTtcblx0ICAgIH1cblx0ICAgIG90aGVyQXJnc1tzdGFydF0gPSByZXN0O1xuXHQgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgb3RoZXJBcmdzKTtcblx0ICB9O1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IHJlc3RQYXJhbTtcblxuXG4vKioqLyB9LFxuLyogMjAgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBiYXNlRmxhdHRlbiA9IF9fd2VicGFja19yZXF1aXJlX18oMjEpLFxuXHQgICAgaXNJdGVyYXRlZUNhbGwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDI1KTtcblx0XG5cdC8qKlxuXHQgKiBGbGF0dGVucyBhIG5lc3RlZCBhcnJheS4gSWYgYGlzRGVlcGAgaXMgYHRydWVgIHRoZSBhcnJheSBpcyByZWN1cnNpdmVseVxuXHQgKiBmbGF0dGVuZWQsIG90aGVyd2lzZSBpdCdzIG9ubHkgZmxhdHRlbmVkIGEgc2luZ2xlIGxldmVsLlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBtZW1iZXJPZiBfXG5cdCAqIEBjYXRlZ29yeSBBcnJheVxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gZmxhdHRlbi5cblx0ICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBmbGF0dGVuLlxuXHQgKiBAcGFyYW0tIHtPYmplY3R9IFtndWFyZF0gRW5hYmxlcyB1c2UgYXMgYSBjYWxsYmFjayBmb3IgZnVuY3Rpb25zIGxpa2UgYF8ubWFwYC5cblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZmxhdHRlbmVkIGFycmF5LlxuXHQgKiBAZXhhbXBsZVxuXHQgKlxuXHQgKiBfLmZsYXR0ZW4oWzEsIFsyLCAzLCBbNF1dXSk7XG5cdCAqIC8vID0+IFsxLCAyLCAzLCBbNF1dXG5cdCAqXG5cdCAqIC8vIHVzaW5nIGBpc0RlZXBgXG5cdCAqIF8uZmxhdHRlbihbMSwgWzIsIDMsIFs0XV1dLCB0cnVlKTtcblx0ICogLy8gPT4gWzEsIDIsIDMsIDRdXG5cdCAqL1xuXHRmdW5jdGlvbiBmbGF0dGVuKGFycmF5LCBpc0RlZXAsIGd1YXJkKSB7XG5cdCAgdmFyIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcblx0ICBpZiAoZ3VhcmQgJiYgaXNJdGVyYXRlZUNhbGwoYXJyYXksIGlzRGVlcCwgZ3VhcmQpKSB7XG5cdCAgICBpc0RlZXAgPSBmYWxzZTtcblx0ICB9XG5cdCAgcmV0dXJuIGxlbmd0aCA/IGJhc2VGbGF0dGVuKGFycmF5LCBpc0RlZXApIDogW107XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gZmxhdHRlbjtcblxuXG4vKioqLyB9LFxuLyogMjEgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBhcnJheVB1c2ggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIyKSxcblx0ICAgIGlzQXJndW1lbnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygyMyksXG5cdCAgICBpc0FycmF5ID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNCksXG5cdCAgICBpc0FycmF5TGlrZSA9IF9fd2VicGFja19yZXF1aXJlX18oMTUpLFxuXHQgICAgaXNPYmplY3RMaWtlID0gX193ZWJwYWNrX3JlcXVpcmVfXygxNCk7XG5cdFxuXHQvKipcblx0ICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZmxhdHRlbmAgd2l0aCBhZGRlZCBzdXBwb3J0IGZvciByZXN0cmljdGluZ1xuXHQgKiBmbGF0dGVuaW5nIGFuZCBzcGVjaWZ5aW5nIHRoZSBzdGFydCBpbmRleC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGZsYXR0ZW4uXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgZmxhdHRlbi5cblx0ICogQHBhcmFtIHtib29sZWFufSBbaXNTdHJpY3RdIFJlc3RyaWN0IGZsYXR0ZW5pbmcgdG8gYXJyYXlzLWxpa2Ugb2JqZWN0cy5cblx0ICogQHBhcmFtIHtBcnJheX0gW3Jlc3VsdD1bXV0gVGhlIGluaXRpYWwgcmVzdWx0IHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBmbGF0dGVuZWQgYXJyYXkuXG5cdCAqL1xuXHRmdW5jdGlvbiBiYXNlRmxhdHRlbihhcnJheSwgaXNEZWVwLCBpc1N0cmljdCwgcmVzdWx0KSB7XG5cdCAgcmVzdWx0IHx8IChyZXN1bHQgPSBbXSk7XG5cdFxuXHQgIHZhciBpbmRleCA9IC0xLFxuXHQgICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cdFxuXHQgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG5cdCAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XG5cdCAgICBpZiAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBpc0FycmF5TGlrZSh2YWx1ZSkgJiZcblx0ICAgICAgICAoaXNTdHJpY3QgfHwgaXNBcnJheSh2YWx1ZSkgfHwgaXNBcmd1bWVudHModmFsdWUpKSkge1xuXHQgICAgICBpZiAoaXNEZWVwKSB7XG5cdCAgICAgICAgLy8gUmVjdXJzaXZlbHkgZmxhdHRlbiBhcnJheXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cblx0ICAgICAgICBiYXNlRmxhdHRlbih2YWx1ZSwgaXNEZWVwLCBpc1N0cmljdCwgcmVzdWx0KTtcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICBhcnJheVB1c2gocmVzdWx0LCB2YWx1ZSk7XG5cdCAgICAgIH1cblx0ICAgIH0gZWxzZSBpZiAoIWlzU3RyaWN0KSB7XG5cdCAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IHZhbHVlO1xuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gcmVzdWx0O1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGJhc2VGbGF0dGVuO1xuXG5cbi8qKiovIH0sXG4vKiAyMiAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0LyoqXG5cdCAqIEFwcGVuZHMgdGhlIGVsZW1lbnRzIG9mIGB2YWx1ZXNgIHRvIGBhcnJheWAuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBtb2RpZnkuXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlcyBUaGUgdmFsdWVzIHRvIGFwcGVuZC5cblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG5cdCAqL1xuXHRmdW5jdGlvbiBhcnJheVB1c2goYXJyYXksIHZhbHVlcykge1xuXHQgIHZhciBpbmRleCA9IC0xLFxuXHQgICAgICBsZW5ndGggPSB2YWx1ZXMubGVuZ3RoLFxuXHQgICAgICBvZmZzZXQgPSBhcnJheS5sZW5ndGg7XG5cdFxuXHQgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG5cdCAgICBhcnJheVtvZmZzZXQgKyBpbmRleF0gPSB2YWx1ZXNbaW5kZXhdO1xuXHQgIH1cblx0ICByZXR1cm4gYXJyYXk7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gYXJyYXlQdXNoO1xuXG5cbi8qKiovIH0sXG4vKiAyMyAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGlzQXJyYXlMaWtlID0gX193ZWJwYWNrX3JlcXVpcmVfXygxNSksXG5cdCAgICBpc09iamVjdExpa2UgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDE0KTtcblx0XG5cdC8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMuICovXG5cdHZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cdFxuXHQvKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cblx0dmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cdFxuXHQvKiogTmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xuXHR2YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblx0XG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBhcmd1bWVudHNgIG9iamVjdC5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAbWVtYmVyT2YgX1xuXHQgKiBAY2F0ZWdvcnkgTGFuZ1xuXHQgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cblx0ICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsIGVsc2UgYGZhbHNlYC5cblx0ICogQGV4YW1wbGVcblx0ICpcblx0ICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcblx0ICogLy8gPT4gdHJ1ZVxuXHQgKlxuXHQgKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG5cdCAqIC8vID0+IGZhbHNlXG5cdCAqL1xuXHRmdW5jdGlvbiBpc0FyZ3VtZW50cyh2YWx1ZSkge1xuXHQgIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGlzQXJyYXlMaWtlKHZhbHVlKSAmJlxuXHQgICAgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpICYmICFwcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHZhbHVlLCAnY2FsbGVlJyk7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gaXNBcmd1bWVudHM7XG5cblxuLyoqKi8gfSxcbi8qIDI0ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgZ2V0TmF0aXZlID0gX193ZWJwYWNrX3JlcXVpcmVfXygxMSksXG5cdCAgICBpc0xlbmd0aCA9IF9fd2VicGFja19yZXF1aXJlX18oMTgpLFxuXHQgICAgaXNPYmplY3RMaWtlID0gX193ZWJwYWNrX3JlcXVpcmVfXygxNCk7XG5cdFxuXHQvKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG5cdHZhciBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XSc7XG5cdFxuXHQvKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xuXHR2YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXHRcblx0LyoqXG5cdCAqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG5cdCAqIG9mIHZhbHVlcy5cblx0ICovXG5cdHZhciBvYmpUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXHRcblx0LyogTmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cblx0dmFyIG5hdGl2ZUlzQXJyYXkgPSBnZXROYXRpdmUoQXJyYXksICdpc0FycmF5Jyk7XG5cdFxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAbWVtYmVyT2YgX1xuXHQgKiBAY2F0ZWdvcnkgTGFuZ1xuXHQgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cblx0ICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsIGVsc2UgYGZhbHNlYC5cblx0ICogQGV4YW1wbGVcblx0ICpcblx0ICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG5cdCAqIC8vID0+IHRydWVcblx0ICpcblx0ICogXy5pc0FycmF5KGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuXHQgKiAvLyA9PiBmYWxzZVxuXHQgKi9cblx0dmFyIGlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdCAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiBvYmpUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBhcnJheVRhZztcblx0fTtcblx0XG5cdG1vZHVsZS5leHBvcnRzID0gaXNBcnJheTtcblxuXG4vKioqLyB9LFxuLyogMjUgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBpc0FycmF5TGlrZSA9IF9fd2VicGFja19yZXF1aXJlX18oMTUpLFxuXHQgICAgaXNJbmRleCA9IF9fd2VicGFja19yZXF1aXJlX18oMjYpLFxuXHQgICAgaXNPYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDcpO1xuXHRcblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgcHJvdmlkZWQgYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSB2YWx1ZSBhcmd1bWVudC5cblx0ICogQHBhcmFtIHsqfSBpbmRleCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIGluZGV4IG9yIGtleSBhcmd1bWVudC5cblx0ICogQHBhcmFtIHsqfSBvYmplY3QgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBvYmplY3QgYXJndW1lbnQuXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwsIGVsc2UgYGZhbHNlYC5cblx0ICovXG5cdGZ1bmN0aW9uIGlzSXRlcmF0ZWVDYWxsKHZhbHVlLCBpbmRleCwgb2JqZWN0KSB7XG5cdCAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG5cdCAgICByZXR1cm4gZmFsc2U7XG5cdCAgfVxuXHQgIHZhciB0eXBlID0gdHlwZW9mIGluZGV4O1xuXHQgIGlmICh0eXBlID09ICdudW1iZXInXG5cdCAgICAgID8gKGlzQXJyYXlMaWtlKG9iamVjdCkgJiYgaXNJbmRleChpbmRleCwgb2JqZWN0Lmxlbmd0aCkpXG5cdCAgICAgIDogKHR5cGUgPT0gJ3N0cmluZycgJiYgaW5kZXggaW4gb2JqZWN0KSkge1xuXHQgICAgdmFyIG90aGVyID0gb2JqZWN0W2luZGV4XTtcblx0ICAgIHJldHVybiB2YWx1ZSA9PT0gdmFsdWUgPyAodmFsdWUgPT09IG90aGVyKSA6IChvdGhlciAhPT0gb3RoZXIpO1xuXHQgIH1cblx0ICByZXR1cm4gZmFsc2U7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gaXNJdGVyYXRlZUNhbGw7XG5cblxuLyoqKi8gfSxcbi8qIDI2ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHQvKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG5cdHZhciByZUlzVWludCA9IC9eXFxkKyQvO1xuXHRcblx0LyoqXG5cdCAqIFVzZWQgYXMgdGhlIFttYXhpbXVtIGxlbmd0aF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtbnVtYmVyLm1heF9zYWZlX2ludGVnZXIpXG5cdCAqIG9mIGFuIGFycmF5LWxpa2UgdmFsdWUuXG5cdCAqL1xuXHR2YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cdFxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGluZGV4LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cblx0ICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG5cdCAqL1xuXHRmdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcblx0ICB2YWx1ZSA9ICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgfHwgcmVJc1VpbnQudGVzdCh2YWx1ZSkpID8gK3ZhbHVlIDogLTE7XG5cdCAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuXHQgIHJldHVybiB2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoO1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGlzSW5kZXg7XG5cblxuLyoqKi8gfSxcbi8qIDI3ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHQndXNlIHN0cmljdCc7XG5cdFxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdCAgdmFsdWU6IHRydWVcblx0fSk7XG5cdFxuXHRmdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cdFxuXHR2YXIgX2xvZGFzaEFycmF5VW5pcXVlID0gX193ZWJwYWNrX3JlcXVpcmVfXygyOCk7XG5cdFxuXHR2YXIgX2xvZGFzaEFycmF5VW5pcXVlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xvZGFzaEFycmF5VW5pcXVlKTtcblx0XG5cdGV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uIChvbGRQYXJhbXMsIG5ld1BhcmFtcykge1xuXHQgIHZhciBvbGRLZXlzID0gT2JqZWN0LmtleXMob2xkUGFyYW1zKTtcblx0ICB2YXIgbmV3S2V5cyA9IE9iamVjdC5rZXlzKG5ld1BhcmFtcyk7XG5cdFxuXHQgIHZhciBhbGxLZXlzID0gKDAsIF9sb2Rhc2hBcnJheVVuaXF1ZTJbJ2RlZmF1bHQnXSkob2xkS2V5cy5jb25jYXQobmV3S2V5cykpO1xuXHRcblx0ICByZXR1cm4gYWxsS2V5cy5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuXHQgICAgdmFyIG9sZFZhbHVlID0gb2xkUGFyYW1zW2tleV07XG5cdCAgICB2YXIgbmV3VmFsdWUgPSBuZXdQYXJhbXNba2V5XTtcblx0XG5cdCAgICAvKiBoYW5kbGUgTmFOICovXG5cdCAgICBpZiAob2xkVmFsdWUgIT09IG9sZFZhbHVlICYmIG5ld1ZhbHVlICE9PSBuZXdWYWx1ZSkge1xuXHQgICAgICAvKiBib3RoIG9sZFZhbHVlIGFuZCBuZXdWYWx1ZSBlcXVhbCBOYU4gKi9cblx0ICAgICAgcmV0dXJuIGZhbHNlO1xuXHQgICAgfVxuXHRcblx0ICAgIHJldHVybiBvbGRWYWx1ZSAhPT0gbmV3VmFsdWU7XG5cdCAgfSk7XG5cdH07XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcblxuLyoqKi8gfSxcbi8qIDI4ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHRtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19yZXF1aXJlX18oMjkpO1xuXG5cbi8qKiovIH0sXG4vKiAyOSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGJhc2VDYWxsYmFjayA9IF9fd2VicGFja19yZXF1aXJlX18oMzApLFxuXHQgICAgYmFzZVVuaXEgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDU4KSxcblx0ICAgIGlzSXRlcmF0ZWVDYWxsID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNSksXG5cdCAgICBzb3J0ZWRVbmlxID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1OSk7XG5cdFxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgYW4gYXJyYXksIHVzaW5nXG5cdCAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG5cdCAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucywgaW4gd2hpY2ggb25seSB0aGUgZmlyc3Qgb2NjdXJlbmNlIG9mIGVhY2ggZWxlbWVudFxuXHQgKiBpcyBrZXB0LiBQcm92aWRpbmcgYHRydWVgIGZvciBgaXNTb3J0ZWRgIHBlcmZvcm1zIGEgZmFzdGVyIHNlYXJjaCBhbGdvcml0aG1cblx0ICogZm9yIHNvcnRlZCBhcnJheXMuIElmIGFuIGl0ZXJhdGVlIGZ1bmN0aW9uIGlzIHByb3ZpZGVkIGl0J3MgaW52b2tlZCBmb3Jcblx0ICogZWFjaCBlbGVtZW50IGluIHRoZSBhcnJheSB0byBnZW5lcmF0ZSB0aGUgY3JpdGVyaW9uIGJ5IHdoaWNoIHVuaXF1ZW5lc3Ncblx0ICogaXMgY29tcHV0ZWQuIFRoZSBgaXRlcmF0ZWVgIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlXG5cdCAqIGFyZ3VtZW50czogKHZhbHVlLCBpbmRleCwgYXJyYXkpLlxuXHQgKlxuXHQgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBpdGVyYXRlZWAgdGhlIGNyZWF0ZWQgYF8ucHJvcGVydHlgXG5cdCAqIHN0eWxlIGNhbGxiYWNrIHJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuXHQgKlxuXHQgKiBJZiBhIHZhbHVlIGlzIGFsc28gcHJvdmlkZWQgZm9yIGB0aGlzQXJnYCB0aGUgY3JlYXRlZCBgXy5tYXRjaGVzUHJvcGVydHlgXG5cdCAqIHN0eWxlIGNhbGxiYWNrIHJldHVybnMgYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgYSBtYXRjaGluZyBwcm9wZXJ0eVxuXHQgKiB2YWx1ZSwgZWxzZSBgZmFsc2VgLlxuXHQgKlxuXHQgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBpdGVyYXRlZWAgdGhlIGNyZWF0ZWQgYF8ubWF0Y2hlc2Agc3R5bGVcblx0ICogY2FsbGJhY2sgcmV0dXJucyBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW5cblx0ICogb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQG1lbWJlck9mIF9cblx0ICogQGFsaWFzIHVuaXF1ZVxuXHQgKiBAY2F0ZWdvcnkgQXJyYXlcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGluc3BlY3QuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU29ydGVkXSBTcGVjaWZ5IHRoZSBhcnJheSBpcyBzb3J0ZWQuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2l0ZXJhdGVlXSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuXHQgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGl0ZXJhdGVlYC5cblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZHVwbGljYXRlLXZhbHVlLWZyZWUgYXJyYXkuXG5cdCAqIEBleGFtcGxlXG5cdCAqXG5cdCAqIF8udW5pcShbMiwgMSwgMl0pO1xuXHQgKiAvLyA9PiBbMiwgMV1cblx0ICpcblx0ICogLy8gdXNpbmcgYGlzU29ydGVkYFxuXHQgKiBfLnVuaXEoWzEsIDEsIDJdLCB0cnVlKTtcblx0ICogLy8gPT4gWzEsIDJdXG5cdCAqXG5cdCAqIC8vIHVzaW5nIGFuIGl0ZXJhdGVlIGZ1bmN0aW9uXG5cdCAqIF8udW5pcShbMSwgMi41LCAxLjUsIDJdLCBmdW5jdGlvbihuKSB7XG5cdCAqICAgcmV0dXJuIHRoaXMuZmxvb3Iobik7XG5cdCAqIH0sIE1hdGgpO1xuXHQgKiAvLyA9PiBbMSwgMi41XVxuXHQgKlxuXHQgKiAvLyB1c2luZyB0aGUgYF8ucHJvcGVydHlgIGNhbGxiYWNrIHNob3J0aGFuZFxuXHQgKiBfLnVuaXEoW3sgJ3gnOiAxIH0sIHsgJ3gnOiAyIH0sIHsgJ3gnOiAxIH1dLCAneCcpO1xuXHQgKiAvLyA9PiBbeyAneCc6IDEgfSwgeyAneCc6IDIgfV1cblx0ICovXG5cdGZ1bmN0aW9uIHVuaXEoYXJyYXksIGlzU29ydGVkLCBpdGVyYXRlZSwgdGhpc0FyZykge1xuXHQgIHZhciBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG5cdCAgaWYgKCFsZW5ndGgpIHtcblx0ICAgIHJldHVybiBbXTtcblx0ICB9XG5cdCAgaWYgKGlzU29ydGVkICE9IG51bGwgJiYgdHlwZW9mIGlzU29ydGVkICE9ICdib29sZWFuJykge1xuXHQgICAgdGhpc0FyZyA9IGl0ZXJhdGVlO1xuXHQgICAgaXRlcmF0ZWUgPSBpc0l0ZXJhdGVlQ2FsbChhcnJheSwgaXNTb3J0ZWQsIHRoaXNBcmcpID8gdW5kZWZpbmVkIDogaXNTb3J0ZWQ7XG5cdCAgICBpc1NvcnRlZCA9IGZhbHNlO1xuXHQgIH1cblx0ICBpdGVyYXRlZSA9IGl0ZXJhdGVlID09IG51bGwgPyBpdGVyYXRlZSA6IGJhc2VDYWxsYmFjayhpdGVyYXRlZSwgdGhpc0FyZywgMyk7XG5cdCAgcmV0dXJuIChpc1NvcnRlZClcblx0ICAgID8gc29ydGVkVW5pcShhcnJheSwgaXRlcmF0ZWUpXG5cdCAgICA6IGJhc2VVbmlxKGFycmF5LCBpdGVyYXRlZSk7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gdW5pcTtcblxuXG4vKioqLyB9LFxuLyogMzAgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBiYXNlTWF0Y2hlcyA9IF9fd2VicGFja19yZXF1aXJlX18oMzEpLFxuXHQgICAgYmFzZU1hdGNoZXNQcm9wZXJ0eSA9IF9fd2VicGFja19yZXF1aXJlX18oNDcpLFxuXHQgICAgYmluZENhbGxiYWNrID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1NCksXG5cdCAgICBpZGVudGl0eSA9IF9fd2VicGFja19yZXF1aXJlX18oNTUpLFxuXHQgICAgcHJvcGVydHkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDU2KTtcblx0XG5cdC8qKlxuXHQgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jYWxsYmFja2Agd2hpY2ggc3VwcG9ydHMgc3BlY2lmeWluZyB0aGVcblx0ICogbnVtYmVyIG9mIGFyZ3VtZW50cyB0byBwcm92aWRlIHRvIGBmdW5jYC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHsqfSBbZnVuYz1fLmlkZW50aXR5XSBUaGUgdmFsdWUgdG8gY29udmVydCB0byBhIGNhbGxiYWNrLlxuXHQgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gW2FyZ0NvdW50XSBUaGUgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byBwcm92aWRlIHRvIGBmdW5jYC5cblx0ICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBjYWxsYmFjay5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2VDYWxsYmFjayhmdW5jLCB0aGlzQXJnLCBhcmdDb3VudCkge1xuXHQgIHZhciB0eXBlID0gdHlwZW9mIGZ1bmM7XG5cdCAgaWYgKHR5cGUgPT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgcmV0dXJuIHRoaXNBcmcgPT09IHVuZGVmaW5lZFxuXHQgICAgICA/IGZ1bmNcblx0ICAgICAgOiBiaW5kQ2FsbGJhY2soZnVuYywgdGhpc0FyZywgYXJnQ291bnQpO1xuXHQgIH1cblx0ICBpZiAoZnVuYyA9PSBudWxsKSB7XG5cdCAgICByZXR1cm4gaWRlbnRpdHk7XG5cdCAgfVxuXHQgIGlmICh0eXBlID09ICdvYmplY3QnKSB7XG5cdCAgICByZXR1cm4gYmFzZU1hdGNoZXMoZnVuYyk7XG5cdCAgfVxuXHQgIHJldHVybiB0aGlzQXJnID09PSB1bmRlZmluZWRcblx0ICAgID8gcHJvcGVydHkoZnVuYylcblx0ICAgIDogYmFzZU1hdGNoZXNQcm9wZXJ0eShmdW5jLCB0aGlzQXJnKTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBiYXNlQ2FsbGJhY2s7XG5cblxuLyoqKi8gfSxcbi8qIDMxICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgYmFzZUlzTWF0Y2ggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDMyKSxcblx0ICAgIGdldE1hdGNoRGF0YSA9IF9fd2VicGFja19yZXF1aXJlX18oNDQpLFxuXHQgICAgdG9PYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQzKTtcblx0XG5cdC8qKlxuXHQgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5tYXRjaGVzYCB3aGljaCBkb2VzIG5vdCBjbG9uZSBgc291cmNlYC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IG9mIHByb3BlcnR5IHZhbHVlcyB0byBtYXRjaC5cblx0ICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBiYXNlTWF0Y2hlcyhzb3VyY2UpIHtcblx0ICB2YXIgbWF0Y2hEYXRhID0gZ2V0TWF0Y2hEYXRhKHNvdXJjZSk7XG5cdCAgaWYgKG1hdGNoRGF0YS5sZW5ndGggPT0gMSAmJiBtYXRjaERhdGFbMF1bMl0pIHtcblx0ICAgIHZhciBrZXkgPSBtYXRjaERhdGFbMF1bMF0sXG5cdCAgICAgICAgdmFsdWUgPSBtYXRjaERhdGFbMF1bMV07XG5cdFxuXHQgICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuXHQgICAgICBpZiAob2JqZWN0ID09IG51bGwpIHtcblx0ICAgICAgICByZXR1cm4gZmFsc2U7XG5cdCAgICAgIH1cblx0ICAgICAgcmV0dXJuIG9iamVjdFtrZXldID09PSB2YWx1ZSAmJiAodmFsdWUgIT09IHVuZGVmaW5lZCB8fCAoa2V5IGluIHRvT2JqZWN0KG9iamVjdCkpKTtcblx0ICAgIH07XG5cdCAgfVxuXHQgIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcblx0ICAgIHJldHVybiBiYXNlSXNNYXRjaChvYmplY3QsIG1hdGNoRGF0YSk7XG5cdCAgfTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBiYXNlTWF0Y2hlcztcblxuXG4vKioqLyB9LFxuLyogMzIgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBiYXNlSXNFcXVhbCA9IF9fd2VicGFja19yZXF1aXJlX18oMzMpLFxuXHQgICAgdG9PYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQzKTtcblx0XG5cdC8qKlxuXHQgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc01hdGNoYCB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrXG5cdCAqIHNob3J0aGFuZHMgYW5kIGB0aGlzYCBiaW5kaW5nLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cblx0ICogQHBhcmFtIHtBcnJheX0gbWF0Y2hEYXRhIFRoZSBwcm9wZXJ5IG5hbWVzLCB2YWx1ZXMsIGFuZCBjb21wYXJlIGZsYWdzIHRvIG1hdGNoLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpbmcgb2JqZWN0cy5cblx0ICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBvYmplY3RgIGlzIGEgbWF0Y2gsIGVsc2UgYGZhbHNlYC5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2VJc01hdGNoKG9iamVjdCwgbWF0Y2hEYXRhLCBjdXN0b21pemVyKSB7XG5cdCAgdmFyIGluZGV4ID0gbWF0Y2hEYXRhLmxlbmd0aCxcblx0ICAgICAgbGVuZ3RoID0gaW5kZXgsXG5cdCAgICAgIG5vQ3VzdG9taXplciA9ICFjdXN0b21pemVyO1xuXHRcblx0ICBpZiAob2JqZWN0ID09IG51bGwpIHtcblx0ICAgIHJldHVybiAhbGVuZ3RoO1xuXHQgIH1cblx0ICBvYmplY3QgPSB0b09iamVjdChvYmplY3QpO1xuXHQgIHdoaWxlIChpbmRleC0tKSB7XG5cdCAgICB2YXIgZGF0YSA9IG1hdGNoRGF0YVtpbmRleF07XG5cdCAgICBpZiAoKG5vQ3VzdG9taXplciAmJiBkYXRhWzJdKVxuXHQgICAgICAgICAgPyBkYXRhWzFdICE9PSBvYmplY3RbZGF0YVswXV1cblx0ICAgICAgICAgIDogIShkYXRhWzBdIGluIG9iamVjdClcblx0ICAgICAgICApIHtcblx0ICAgICAgcmV0dXJuIGZhbHNlO1xuXHQgICAgfVxuXHQgIH1cblx0ICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHQgICAgZGF0YSA9IG1hdGNoRGF0YVtpbmRleF07XG5cdCAgICB2YXIga2V5ID0gZGF0YVswXSxcblx0ICAgICAgICBvYmpWYWx1ZSA9IG9iamVjdFtrZXldLFxuXHQgICAgICAgIHNyY1ZhbHVlID0gZGF0YVsxXTtcblx0XG5cdCAgICBpZiAobm9DdXN0b21pemVyICYmIGRhdGFbMl0pIHtcblx0ICAgICAgaWYgKG9ialZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkge1xuXHQgICAgICAgIHJldHVybiBmYWxzZTtcblx0ICAgICAgfVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgdmFyIHJlc3VsdCA9IGN1c3RvbWl6ZXIgPyBjdXN0b21pemVyKG9ialZhbHVlLCBzcmNWYWx1ZSwga2V5KSA6IHVuZGVmaW5lZDtcblx0ICAgICAgaWYgKCEocmVzdWx0ID09PSB1bmRlZmluZWQgPyBiYXNlSXNFcXVhbChzcmNWYWx1ZSwgb2JqVmFsdWUsIGN1c3RvbWl6ZXIsIHRydWUpIDogcmVzdWx0KSkge1xuXHQgICAgICAgIHJldHVybiBmYWxzZTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gdHJ1ZTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNNYXRjaDtcblxuXG4vKioqLyB9LFxuLyogMzMgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBiYXNlSXNFcXVhbERlZXAgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM0KSxcblx0ICAgIGlzT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg3KSxcblx0ICAgIGlzT2JqZWN0TGlrZSA9IF9fd2VicGFja19yZXF1aXJlX18oMTQpO1xuXHRcblx0LyoqXG5cdCAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzRXF1YWxgIHdpdGhvdXQgc3VwcG9ydCBmb3IgYHRoaXNgIGJpbmRpbmdcblx0ICogYGN1c3RvbWl6ZXJgIGZ1bmN0aW9ucy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cblx0ICogQHBhcmFtIHsqfSBvdGhlciBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIHZhbHVlcy5cblx0ICogQHBhcmFtIHtib29sZWFufSBbaXNMb29zZV0gU3BlY2lmeSBwZXJmb3JtaW5nIHBhcnRpYWwgY29tcGFyaXNvbnMuXG5cdCAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0FdIFRyYWNrcyB0cmF2ZXJzZWQgYHZhbHVlYCBvYmplY3RzLlxuXHQgKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tCXSBUcmFja3MgdHJhdmVyc2VkIGBvdGhlcmAgb2JqZWN0cy5cblx0ICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2VJc0VxdWFsKHZhbHVlLCBvdGhlciwgY3VzdG9taXplciwgaXNMb29zZSwgc3RhY2tBLCBzdGFja0IpIHtcblx0ICBpZiAodmFsdWUgPT09IG90aGVyKSB7XG5cdCAgICByZXR1cm4gdHJ1ZTtcblx0ICB9XG5cdCAgaWYgKHZhbHVlID09IG51bGwgfHwgb3RoZXIgPT0gbnVsbCB8fCAoIWlzT2JqZWN0KHZhbHVlKSAmJiAhaXNPYmplY3RMaWtlKG90aGVyKSkpIHtcblx0ICAgIHJldHVybiB2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyO1xuXHQgIH1cblx0ICByZXR1cm4gYmFzZUlzRXF1YWxEZWVwKHZhbHVlLCBvdGhlciwgYmFzZUlzRXF1YWwsIGN1c3RvbWl6ZXIsIGlzTG9vc2UsIHN0YWNrQSwgc3RhY2tCKTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNFcXVhbDtcblxuXG4vKioqLyB9LFxuLyogMzQgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBlcXVhbEFycmF5cyA9IF9fd2VicGFja19yZXF1aXJlX18oMzUpLFxuXHQgICAgZXF1YWxCeVRhZyA9IF9fd2VicGFja19yZXF1aXJlX18oMzcpLFxuXHQgICAgZXF1YWxPYmplY3RzID0gX193ZWJwYWNrX3JlcXVpcmVfXygzOCksXG5cdCAgICBpc0FycmF5ID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNCksXG5cdCAgICBpc1R5cGVkQXJyYXkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQyKTtcblx0XG5cdC8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cblx0dmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcblx0ICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcblx0ICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXHRcblx0LyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cblx0dmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblx0XG5cdC8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xuXHR2YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblx0XG5cdC8qKlxuXHQgKiBVc2VkIHRvIHJlc29sdmUgdGhlIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuXHQgKiBvZiB2YWx1ZXMuXG5cdCAqL1xuXHR2YXIgb2JqVG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblx0XG5cdC8qKlxuXHQgKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VJc0VxdWFsYCBmb3IgYXJyYXlzIGFuZCBvYmplY3RzIHdoaWNoIHBlcmZvcm1zXG5cdCAqIGRlZXAgY29tcGFyaXNvbnMgYW5kIHRyYWNrcyB0cmF2ZXJzZWQgb2JqZWN0cyBlbmFibGluZyBvYmplY3RzIHdpdGggY2lyY3VsYXJcblx0ICogcmVmZXJlbmNlcyB0byBiZSBjb21wYXJlZC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvdGhlciBUaGUgb3RoZXIgb2JqZWN0IHRvIGNvbXBhcmUuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGVxdWFsRnVuYyBUaGUgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGVxdWl2YWxlbnRzIG9mIHZhbHVlcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIG9iamVjdHMuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzTG9vc2VdIFNwZWNpZnkgcGVyZm9ybWluZyBwYXJ0aWFsIGNvbXBhcmlzb25zLlxuXHQgKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tBPVtdXSBUcmFja3MgdHJhdmVyc2VkIGB2YWx1ZWAgb2JqZWN0cy5cblx0ICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQj1bXV0gVHJhY2tzIHRyYXZlcnNlZCBgb3RoZXJgIG9iamVjdHMuXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzZUlzRXF1YWxEZWVwKG9iamVjdCwgb3RoZXIsIGVxdWFsRnVuYywgY3VzdG9taXplciwgaXNMb29zZSwgc3RhY2tBLCBzdGFja0IpIHtcblx0ICB2YXIgb2JqSXNBcnIgPSBpc0FycmF5KG9iamVjdCksXG5cdCAgICAgIG90aElzQXJyID0gaXNBcnJheShvdGhlciksXG5cdCAgICAgIG9ialRhZyA9IGFycmF5VGFnLFxuXHQgICAgICBvdGhUYWcgPSBhcnJheVRhZztcblx0XG5cdCAgaWYgKCFvYmpJc0Fycikge1xuXHQgICAgb2JqVGFnID0gb2JqVG9TdHJpbmcuY2FsbChvYmplY3QpO1xuXHQgICAgaWYgKG9ialRhZyA9PSBhcmdzVGFnKSB7XG5cdCAgICAgIG9ialRhZyA9IG9iamVjdFRhZztcblx0ICAgIH0gZWxzZSBpZiAob2JqVGFnICE9IG9iamVjdFRhZykge1xuXHQgICAgICBvYmpJc0FyciA9IGlzVHlwZWRBcnJheShvYmplY3QpO1xuXHQgICAgfVxuXHQgIH1cblx0ICBpZiAoIW90aElzQXJyKSB7XG5cdCAgICBvdGhUYWcgPSBvYmpUb1N0cmluZy5jYWxsKG90aGVyKTtcblx0ICAgIGlmIChvdGhUYWcgPT0gYXJnc1RhZykge1xuXHQgICAgICBvdGhUYWcgPSBvYmplY3RUYWc7XG5cdCAgICB9IGVsc2UgaWYgKG90aFRhZyAhPSBvYmplY3RUYWcpIHtcblx0ICAgICAgb3RoSXNBcnIgPSBpc1R5cGVkQXJyYXkob3RoZXIpO1xuXHQgICAgfVxuXHQgIH1cblx0ICB2YXIgb2JqSXNPYmogPSBvYmpUYWcgPT0gb2JqZWN0VGFnLFxuXHQgICAgICBvdGhJc09iaiA9IG90aFRhZyA9PSBvYmplY3RUYWcsXG5cdCAgICAgIGlzU2FtZVRhZyA9IG9ialRhZyA9PSBvdGhUYWc7XG5cdFxuXHQgIGlmIChpc1NhbWVUYWcgJiYgIShvYmpJc0FyciB8fCBvYmpJc09iaikpIHtcblx0ICAgIHJldHVybiBlcXVhbEJ5VGFnKG9iamVjdCwgb3RoZXIsIG9ialRhZyk7XG5cdCAgfVxuXHQgIGlmICghaXNMb29zZSkge1xuXHQgICAgdmFyIG9iaklzV3JhcHBlZCA9IG9iaklzT2JqICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnX193cmFwcGVkX18nKSxcblx0ICAgICAgICBvdGhJc1dyYXBwZWQgPSBvdGhJc09iaiAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG90aGVyLCAnX193cmFwcGVkX18nKTtcblx0XG5cdCAgICBpZiAob2JqSXNXcmFwcGVkIHx8IG90aElzV3JhcHBlZCkge1xuXHQgICAgICByZXR1cm4gZXF1YWxGdW5jKG9iaklzV3JhcHBlZCA/IG9iamVjdC52YWx1ZSgpIDogb2JqZWN0LCBvdGhJc1dyYXBwZWQgPyBvdGhlci52YWx1ZSgpIDogb3RoZXIsIGN1c3RvbWl6ZXIsIGlzTG9vc2UsIHN0YWNrQSwgc3RhY2tCKTtcblx0ICAgIH1cblx0ICB9XG5cdCAgaWYgKCFpc1NhbWVUYWcpIHtcblx0ICAgIHJldHVybiBmYWxzZTtcblx0ICB9XG5cdCAgLy8gQXNzdW1lIGN5Y2xpYyB2YWx1ZXMgYXJlIGVxdWFsLlxuXHQgIC8vIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGRldGVjdGluZyBjaXJjdWxhciByZWZlcmVuY2VzIHNlZSBodHRwczovL2VzNS5naXRodWIuaW8vI0pPLlxuXHQgIHN0YWNrQSB8fCAoc3RhY2tBID0gW10pO1xuXHQgIHN0YWNrQiB8fCAoc3RhY2tCID0gW10pO1xuXHRcblx0ICB2YXIgbGVuZ3RoID0gc3RhY2tBLmxlbmd0aDtcblx0ICB3aGlsZSAobGVuZ3RoLS0pIHtcblx0ICAgIGlmIChzdGFja0FbbGVuZ3RoXSA9PSBvYmplY3QpIHtcblx0ICAgICAgcmV0dXJuIHN0YWNrQltsZW5ndGhdID09IG90aGVyO1xuXHQgICAgfVxuXHQgIH1cblx0ICAvLyBBZGQgYG9iamVjdGAgYW5kIGBvdGhlcmAgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuXHQgIHN0YWNrQS5wdXNoKG9iamVjdCk7XG5cdCAgc3RhY2tCLnB1c2gob3RoZXIpO1xuXHRcblx0ICB2YXIgcmVzdWx0ID0gKG9iaklzQXJyID8gZXF1YWxBcnJheXMgOiBlcXVhbE9iamVjdHMpKG9iamVjdCwgb3RoZXIsIGVxdWFsRnVuYywgY3VzdG9taXplciwgaXNMb29zZSwgc3RhY2tBLCBzdGFja0IpO1xuXHRcblx0ICBzdGFja0EucG9wKCk7XG5cdCAgc3RhY2tCLnBvcCgpO1xuXHRcblx0ICByZXR1cm4gcmVzdWx0O1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0VxdWFsRGVlcDtcblxuXG4vKioqLyB9LFxuLyogMzUgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBhcnJheVNvbWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM2KTtcblx0XG5cdC8qKlxuXHQgKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VJc0VxdWFsRGVlcGAgZm9yIGFycmF5cyB3aXRoIHN1cHBvcnQgZm9yXG5cdCAqIHBhcnRpYWwgZGVlcCBjb21wYXJpc29ucy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGNvbXBhcmUuXG5cdCAqIEBwYXJhbSB7QXJyYXl9IG90aGVyIFRoZSBvdGhlciBhcnJheSB0byBjb21wYXJlLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcXVhbEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRldGVybWluZSBlcXVpdmFsZW50cyBvZiB2YWx1ZXMuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmluZyBhcnJheXMuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzTG9vc2VdIFNwZWNpZnkgcGVyZm9ybWluZyBwYXJ0aWFsIGNvbXBhcmlzb25zLlxuXHQgKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tBXSBUcmFja3MgdHJhdmVyc2VkIGB2YWx1ZWAgb2JqZWN0cy5cblx0ICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQl0gVHJhY2tzIHRyYXZlcnNlZCBgb3RoZXJgIG9iamVjdHMuXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJyYXlzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG5cdCAqL1xuXHRmdW5jdGlvbiBlcXVhbEFycmF5cyhhcnJheSwgb3RoZXIsIGVxdWFsRnVuYywgY3VzdG9taXplciwgaXNMb29zZSwgc3RhY2tBLCBzdGFja0IpIHtcblx0ICB2YXIgaW5kZXggPSAtMSxcblx0ICAgICAgYXJyTGVuZ3RoID0gYXJyYXkubGVuZ3RoLFxuXHQgICAgICBvdGhMZW5ndGggPSBvdGhlci5sZW5ndGg7XG5cdFxuXHQgIGlmIChhcnJMZW5ndGggIT0gb3RoTGVuZ3RoICYmICEoaXNMb29zZSAmJiBvdGhMZW5ndGggPiBhcnJMZW5ndGgpKSB7XG5cdCAgICByZXR1cm4gZmFsc2U7XG5cdCAgfVxuXHQgIC8vIElnbm9yZSBub24taW5kZXggcHJvcGVydGllcy5cblx0ICB3aGlsZSAoKytpbmRleCA8IGFyckxlbmd0aCkge1xuXHQgICAgdmFyIGFyclZhbHVlID0gYXJyYXlbaW5kZXhdLFxuXHQgICAgICAgIG90aFZhbHVlID0gb3RoZXJbaW5kZXhdLFxuXHQgICAgICAgIHJlc3VsdCA9IGN1c3RvbWl6ZXIgPyBjdXN0b21pemVyKGlzTG9vc2UgPyBvdGhWYWx1ZSA6IGFyclZhbHVlLCBpc0xvb3NlID8gYXJyVmFsdWUgOiBvdGhWYWx1ZSwgaW5kZXgpIDogdW5kZWZpbmVkO1xuXHRcblx0ICAgIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuXHQgICAgICBpZiAocmVzdWx0KSB7XG5cdCAgICAgICAgY29udGludWU7XG5cdCAgICAgIH1cblx0ICAgICAgcmV0dXJuIGZhbHNlO1xuXHQgICAgfVxuXHQgICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBhcnJheXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cblx0ICAgIGlmIChpc0xvb3NlKSB7XG5cdCAgICAgIGlmICghYXJyYXlTb21lKG90aGVyLCBmdW5jdGlvbihvdGhWYWx1ZSkge1xuXHQgICAgICAgICAgICByZXR1cm4gYXJyVmFsdWUgPT09IG90aFZhbHVlIHx8IGVxdWFsRnVuYyhhcnJWYWx1ZSwgb3RoVmFsdWUsIGN1c3RvbWl6ZXIsIGlzTG9vc2UsIHN0YWNrQSwgc3RhY2tCKTtcblx0ICAgICAgICAgIH0pKSB7XG5cdCAgICAgICAgcmV0dXJuIGZhbHNlO1xuXHQgICAgICB9XG5cdCAgICB9IGVsc2UgaWYgKCEoYXJyVmFsdWUgPT09IG90aFZhbHVlIHx8IGVxdWFsRnVuYyhhcnJWYWx1ZSwgb3RoVmFsdWUsIGN1c3RvbWl6ZXIsIGlzTG9vc2UsIHN0YWNrQSwgc3RhY2tCKSkpIHtcblx0ICAgICAgcmV0dXJuIGZhbHNlO1xuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gdHJ1ZTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBlcXVhbEFycmF5cztcblxuXG4vKioqLyB9LFxuLyogMzYgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdC8qKlxuXHQgKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uc29tZWAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrXG5cdCAqIHNob3J0aGFuZHMgYW5kIGB0aGlzYCBiaW5kaW5nLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkaWNhdGUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cblx0ICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFueSBlbGVtZW50IHBhc3NlcyB0aGUgcHJlZGljYXRlIGNoZWNrLFxuXHQgKiAgZWxzZSBgZmFsc2VgLlxuXHQgKi9cblx0ZnVuY3Rpb24gYXJyYXlTb21lKGFycmF5LCBwcmVkaWNhdGUpIHtcblx0ICB2YXIgaW5kZXggPSAtMSxcblx0ICAgICAgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcblx0ICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHQgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHtcblx0ICAgICAgcmV0dXJuIHRydWU7XG5cdCAgICB9XG5cdCAgfVxuXHQgIHJldHVybiBmYWxzZTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBhcnJheVNvbWU7XG5cblxuLyoqKi8gfSxcbi8qIDM3ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHQvKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG5cdHZhciBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuXHQgICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcblx0ICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcblx0ICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuXHQgICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG5cdCAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJztcblx0XG5cdC8qKlxuXHQgKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VJc0VxdWFsRGVlcGAgZm9yIGNvbXBhcmluZyBvYmplY3RzIG9mXG5cdCAqIHRoZSBzYW1lIGB0b1N0cmluZ1RhZ2AuXG5cdCAqXG5cdCAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIG9ubHkgc3VwcG9ydHMgY29tcGFyaW5nIHZhbHVlcyB3aXRoIHRhZ3Mgb2Zcblx0ICogYEJvb2xlYW5gLCBgRGF0ZWAsIGBFcnJvcmAsIGBOdW1iZXJgLCBgUmVnRXhwYCwgb3IgYFN0cmluZ2AuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjb21wYXJlLlxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSBgdG9TdHJpbmdUYWdgIG9mIHRoZSBvYmplY3RzIHRvIGNvbXBhcmUuXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuXHQgKi9cblx0ZnVuY3Rpb24gZXF1YWxCeVRhZyhvYmplY3QsIG90aGVyLCB0YWcpIHtcblx0ICBzd2l0Y2ggKHRhZykge1xuXHQgICAgY2FzZSBib29sVGFnOlxuXHQgICAgY2FzZSBkYXRlVGFnOlxuXHQgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWJlcnMsIGRhdGVzIHRvIG1pbGxpc2Vjb25kcyBhbmQgYm9vbGVhbnNcblx0ICAgICAgLy8gdG8gYDFgIG9yIGAwYCB0cmVhdGluZyBpbnZhbGlkIGRhdGVzIGNvZXJjZWQgdG8gYE5hTmAgYXMgbm90IGVxdWFsLlxuXHQgICAgICByZXR1cm4gK29iamVjdCA9PSArb3RoZXI7XG5cdFxuXHQgICAgY2FzZSBlcnJvclRhZzpcblx0ICAgICAgcmV0dXJuIG9iamVjdC5uYW1lID09IG90aGVyLm5hbWUgJiYgb2JqZWN0Lm1lc3NhZ2UgPT0gb3RoZXIubWVzc2FnZTtcblx0XG5cdCAgICBjYXNlIG51bWJlclRhZzpcblx0ICAgICAgLy8gVHJlYXQgYE5hTmAgdnMuIGBOYU5gIGFzIGVxdWFsLlxuXHQgICAgICByZXR1cm4gKG9iamVjdCAhPSArb2JqZWN0KVxuXHQgICAgICAgID8gb3RoZXIgIT0gK290aGVyXG5cdCAgICAgICAgOiBvYmplY3QgPT0gK290aGVyO1xuXHRcblx0ICAgIGNhc2UgcmVnZXhwVGFnOlxuXHQgICAgY2FzZSBzdHJpbmdUYWc6XG5cdCAgICAgIC8vIENvZXJjZSByZWdleGVzIHRvIHN0cmluZ3MgYW5kIHRyZWF0IHN0cmluZ3MgcHJpbWl0aXZlcyBhbmQgc3RyaW5nXG5cdCAgICAgIC8vIG9iamVjdHMgYXMgZXF1YWwuIFNlZSBodHRwczovL2VzNS5naXRodWIuaW8vI3gxNS4xMC42LjQgZm9yIG1vcmUgZGV0YWlscy5cblx0ICAgICAgcmV0dXJuIG9iamVjdCA9PSAob3RoZXIgKyAnJyk7XG5cdCAgfVxuXHQgIHJldHVybiBmYWxzZTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBlcXVhbEJ5VGFnO1xuXG5cbi8qKiovIH0sXG4vKiAzOCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGtleXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM5KTtcblx0XG5cdC8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMuICovXG5cdHZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cdFxuXHQvKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cblx0dmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cdFxuXHQvKipcblx0ICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbERlZXBgIGZvciBvYmplY3RzIHdpdGggc3VwcG9ydCBmb3Jcblx0ICogcGFydGlhbCBkZWVwIGNvbXBhcmlzb25zLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY29tcGFyZS5cblx0ICogQHBhcmFtIHtPYmplY3R9IG90aGVyIFRoZSBvdGhlciBvYmplY3QgdG8gY29tcGFyZS5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpbmcgdmFsdWVzLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0xvb3NlXSBTcGVjaWZ5IHBlcmZvcm1pbmcgcGFydGlhbCBjb21wYXJpc29ucy5cblx0ICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQV0gVHJhY2tzIHRyYXZlcnNlZCBgdmFsdWVgIG9iamVjdHMuXG5cdCAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0JdIFRyYWNrcyB0cmF2ZXJzZWQgYG90aGVyYCBvYmplY3RzLlxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cblx0ICovXG5cdGZ1bmN0aW9uIGVxdWFsT2JqZWN0cyhvYmplY3QsIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGlzTG9vc2UsIHN0YWNrQSwgc3RhY2tCKSB7XG5cdCAgdmFyIG9ialByb3BzID0ga2V5cyhvYmplY3QpLFxuXHQgICAgICBvYmpMZW5ndGggPSBvYmpQcm9wcy5sZW5ndGgsXG5cdCAgICAgIG90aFByb3BzID0ga2V5cyhvdGhlciksXG5cdCAgICAgIG90aExlbmd0aCA9IG90aFByb3BzLmxlbmd0aDtcblx0XG5cdCAgaWYgKG9iakxlbmd0aCAhPSBvdGhMZW5ndGggJiYgIWlzTG9vc2UpIHtcblx0ICAgIHJldHVybiBmYWxzZTtcblx0ICB9XG5cdCAgdmFyIGluZGV4ID0gb2JqTGVuZ3RoO1xuXHQgIHdoaWxlIChpbmRleC0tKSB7XG5cdCAgICB2YXIga2V5ID0gb2JqUHJvcHNbaW5kZXhdO1xuXHQgICAgaWYgKCEoaXNMb29zZSA/IGtleSBpbiBvdGhlciA6IGhhc093blByb3BlcnR5LmNhbGwob3RoZXIsIGtleSkpKSB7XG5cdCAgICAgIHJldHVybiBmYWxzZTtcblx0ICAgIH1cblx0ICB9XG5cdCAgdmFyIHNraXBDdG9yID0gaXNMb29zZTtcblx0ICB3aGlsZSAoKytpbmRleCA8IG9iakxlbmd0aCkge1xuXHQgICAga2V5ID0gb2JqUHJvcHNbaW5kZXhdO1xuXHQgICAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV0sXG5cdCAgICAgICAgb3RoVmFsdWUgPSBvdGhlcltrZXldLFxuXHQgICAgICAgIHJlc3VsdCA9IGN1c3RvbWl6ZXIgPyBjdXN0b21pemVyKGlzTG9vc2UgPyBvdGhWYWx1ZSA6IG9ialZhbHVlLCBpc0xvb3NlPyBvYmpWYWx1ZSA6IG90aFZhbHVlLCBrZXkpIDogdW5kZWZpbmVkO1xuXHRcblx0ICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuXHQgICAgaWYgKCEocmVzdWx0ID09PSB1bmRlZmluZWQgPyBlcXVhbEZ1bmMob2JqVmFsdWUsIG90aFZhbHVlLCBjdXN0b21pemVyLCBpc0xvb3NlLCBzdGFja0EsIHN0YWNrQikgOiByZXN1bHQpKSB7XG5cdCAgICAgIHJldHVybiBmYWxzZTtcblx0ICAgIH1cblx0ICAgIHNraXBDdG9yIHx8IChza2lwQ3RvciA9IGtleSA9PSAnY29uc3RydWN0b3InKTtcblx0ICB9XG5cdCAgaWYgKCFza2lwQ3Rvcikge1xuXHQgICAgdmFyIG9iakN0b3IgPSBvYmplY3QuY29uc3RydWN0b3IsXG5cdCAgICAgICAgb3RoQ3RvciA9IG90aGVyLmNvbnN0cnVjdG9yO1xuXHRcblx0ICAgIC8vIE5vbiBgT2JqZWN0YCBvYmplY3QgaW5zdGFuY2VzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWFsLlxuXHQgICAgaWYgKG9iakN0b3IgIT0gb3RoQ3RvciAmJlxuXHQgICAgICAgICgnY29uc3RydWN0b3InIGluIG9iamVjdCAmJiAnY29uc3RydWN0b3InIGluIG90aGVyKSAmJlxuXHQgICAgICAgICEodHlwZW9mIG9iakN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBvYmpDdG9yIGluc3RhbmNlb2Ygb2JqQ3RvciAmJlxuXHQgICAgICAgICAgdHlwZW9mIG90aEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBvdGhDdG9yIGluc3RhbmNlb2Ygb3RoQ3RvcikpIHtcblx0ICAgICAgcmV0dXJuIGZhbHNlO1xuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gdHJ1ZTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBlcXVhbE9iamVjdHM7XG5cblxuLyoqKi8gfSxcbi8qIDM5ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgZ2V0TmF0aXZlID0gX193ZWJwYWNrX3JlcXVpcmVfXygxMSksXG5cdCAgICBpc0FycmF5TGlrZSA9IF9fd2VicGFja19yZXF1aXJlX18oMTUpLFxuXHQgICAgaXNPYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDcpLFxuXHQgICAgc2hpbUtleXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQwKTtcblx0XG5cdC8qIE5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG5cdHZhciBuYXRpdmVLZXlzID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2tleXMnKTtcblx0XG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cblx0ICpcblx0ICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcblx0ICogW0VTIHNwZWNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5rZXlzKVxuXHQgKiBmb3IgbW9yZSBkZXRhaWxzLlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBtZW1iZXJPZiBfXG5cdCAqIEBjYXRlZ29yeSBPYmplY3Rcblx0ICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuXHQgKiBAZXhhbXBsZVxuXHQgKlxuXHQgKiBmdW5jdGlvbiBGb28oKSB7XG5cdCAqICAgdGhpcy5hID0gMTtcblx0ICogICB0aGlzLmIgPSAyO1xuXHQgKiB9XG5cdCAqXG5cdCAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG5cdCAqXG5cdCAqIF8ua2V5cyhuZXcgRm9vKTtcblx0ICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuXHQgKlxuXHQgKiBfLmtleXMoJ2hpJyk7XG5cdCAqIC8vID0+IFsnMCcsICcxJ11cblx0ICovXG5cdHZhciBrZXlzID0gIW5hdGl2ZUtleXMgPyBzaGltS2V5cyA6IGZ1bmN0aW9uKG9iamVjdCkge1xuXHQgIHZhciBDdG9yID0gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3QuY29uc3RydWN0b3I7XG5cdCAgaWYgKCh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlID09PSBvYmplY3QpIHx8XG5cdCAgICAgICh0eXBlb2Ygb2JqZWN0ICE9ICdmdW5jdGlvbicgJiYgaXNBcnJheUxpa2Uob2JqZWN0KSkpIHtcblx0ICAgIHJldHVybiBzaGltS2V5cyhvYmplY3QpO1xuXHQgIH1cblx0ICByZXR1cm4gaXNPYmplY3Qob2JqZWN0KSA/IG5hdGl2ZUtleXMob2JqZWN0KSA6IFtdO1xuXHR9O1xuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBrZXlzO1xuXG5cbi8qKiovIH0sXG4vKiA0MCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGlzQXJndW1lbnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygyMyksXG5cdCAgICBpc0FycmF5ID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNCksXG5cdCAgICBpc0luZGV4ID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNiksXG5cdCAgICBpc0xlbmd0aCA9IF9fd2VicGFja19yZXF1aXJlX18oMTgpLFxuXHQgICAga2V5c0luID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0MSk7XG5cdFxuXHQvKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xuXHR2YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXHRcblx0LyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG5cdHZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXHRcblx0LyoqXG5cdCAqIEEgZmFsbGJhY2sgaW1wbGVtZW50YXRpb24gb2YgYE9iamVjdC5rZXlzYCB3aGljaCBjcmVhdGVzIGFuIGFycmF5IG9mIHRoZVxuXHQgKiBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuXHQgKi9cblx0ZnVuY3Rpb24gc2hpbUtleXMob2JqZWN0KSB7XG5cdCAgdmFyIHByb3BzID0ga2V5c0luKG9iamVjdCksXG5cdCAgICAgIHByb3BzTGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuXHQgICAgICBsZW5ndGggPSBwcm9wc0xlbmd0aCAmJiBvYmplY3QubGVuZ3RoO1xuXHRcblx0ICB2YXIgYWxsb3dJbmRleGVzID0gISFsZW5ndGggJiYgaXNMZW5ndGgobGVuZ3RoKSAmJlxuXHQgICAgKGlzQXJyYXkob2JqZWN0KSB8fCBpc0FyZ3VtZW50cyhvYmplY3QpKTtcblx0XG5cdCAgdmFyIGluZGV4ID0gLTEsXG5cdCAgICAgIHJlc3VsdCA9IFtdO1xuXHRcblx0ICB3aGlsZSAoKytpbmRleCA8IHByb3BzTGVuZ3RoKSB7XG5cdCAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuXHQgICAgaWYgKChhbGxvd0luZGV4ZXMgJiYgaXNJbmRleChrZXksIGxlbmd0aCkpIHx8IGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSB7XG5cdCAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG5cdCAgICB9XG5cdCAgfVxuXHQgIHJldHVybiByZXN1bHQ7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gc2hpbUtleXM7XG5cblxuLyoqKi8gfSxcbi8qIDQxICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgaXNBcmd1bWVudHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIzKSxcblx0ICAgIGlzQXJyYXkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDI0KSxcblx0ICAgIGlzSW5kZXggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDI2KSxcblx0ICAgIGlzTGVuZ3RoID0gX193ZWJwYWNrX3JlcXVpcmVfXygxOCksXG5cdCAgICBpc09iamVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oNyk7XG5cdFxuXHQvKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xuXHR2YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXHRcblx0LyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG5cdHZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG5cdCAqXG5cdCAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBtZW1iZXJPZiBfXG5cdCAqIEBjYXRlZ29yeSBPYmplY3Rcblx0ICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuXHQgKiBAZXhhbXBsZVxuXHQgKlxuXHQgKiBmdW5jdGlvbiBGb28oKSB7XG5cdCAqICAgdGhpcy5hID0gMTtcblx0ICogICB0aGlzLmIgPSAyO1xuXHQgKiB9XG5cdCAqXG5cdCAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG5cdCAqXG5cdCAqIF8ua2V5c0luKG5ldyBGb28pO1xuXHQgKiAvLyA9PiBbJ2EnLCAnYicsICdjJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcblx0ICovXG5cdGZ1bmN0aW9uIGtleXNJbihvYmplY3QpIHtcblx0ICBpZiAob2JqZWN0ID09IG51bGwpIHtcblx0ICAgIHJldHVybiBbXTtcblx0ICB9XG5cdCAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG5cdCAgICBvYmplY3QgPSBPYmplY3Qob2JqZWN0KTtcblx0ICB9XG5cdCAgdmFyIGxlbmd0aCA9IG9iamVjdC5sZW5ndGg7XG5cdCAgbGVuZ3RoID0gKGxlbmd0aCAmJiBpc0xlbmd0aChsZW5ndGgpICYmXG5cdCAgICAoaXNBcnJheShvYmplY3QpIHx8IGlzQXJndW1lbnRzKG9iamVjdCkpICYmIGxlbmd0aCkgfHwgMDtcblx0XG5cdCAgdmFyIEN0b3IgPSBvYmplY3QuY29uc3RydWN0b3IsXG5cdCAgICAgIGluZGV4ID0gLTEsXG5cdCAgICAgIGlzUHJvdG8gPSB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlID09PSBvYmplY3QsXG5cdCAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCksXG5cdCAgICAgIHNraXBJbmRleGVzID0gbGVuZ3RoID4gMDtcblx0XG5cdCAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcblx0ICAgIHJlc3VsdFtpbmRleF0gPSAoaW5kZXggKyAnJyk7XG5cdCAgfVxuXHQgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcblx0ICAgIGlmICghKHNraXBJbmRleGVzICYmIGlzSW5kZXgoa2V5LCBsZW5ndGgpKSAmJlxuXHQgICAgICAgICEoa2V5ID09ICdjb25zdHJ1Y3RvcicgJiYgKGlzUHJvdG8gfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkpIHtcblx0ICAgICAgcmVzdWx0LnB1c2goa2V5KTtcblx0ICAgIH1cblx0ICB9XG5cdCAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBrZXlzSW47XG5cblxuLyoqKi8gfSxcbi8qIDQyICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgaXNMZW5ndGggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDE4KSxcblx0ICAgIGlzT2JqZWN0TGlrZSA9IF9fd2VicGFja19yZXF1aXJlX18oMTQpO1xuXHRcblx0LyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xuXHR2YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuXHQgICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuXHQgICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcblx0ICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG5cdCAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG5cdCAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcblx0ICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuXHQgICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG5cdCAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcblx0ICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuXHQgICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG5cdCAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcblx0ICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cdFxuXHR2YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuXHQgICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuXHQgICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuXHQgICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuXHQgICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG5cdCAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcblx0ICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuXHQgICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcblx0ICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG5cdCAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXHRcblx0LyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgb2YgdHlwZWQgYXJyYXlzLiAqL1xuXHR2YXIgdHlwZWRBcnJheVRhZ3MgPSB7fTtcblx0dHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG5cdHR5cGVkQXJyYXlUYWdzW2ludDhUYWddID0gdHlwZWRBcnJheVRhZ3NbaW50MTZUYWddID1cblx0dHlwZWRBcnJheVRhZ3NbaW50MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDhUYWddID1cblx0dHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxuXHR0eXBlZEFycmF5VGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcblx0dHlwZWRBcnJheVRhZ3NbYXJnc1RhZ10gPSB0eXBlZEFycmF5VGFnc1thcnJheVRhZ10gPVxuXHR0eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG5cdHR5cGVkQXJyYXlUYWdzW2RhdGVUYWddID0gdHlwZWRBcnJheVRhZ3NbZXJyb3JUYWddID1cblx0dHlwZWRBcnJheVRhZ3NbZnVuY1RhZ10gPSB0eXBlZEFycmF5VGFnc1ttYXBUYWddID1cblx0dHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW29iamVjdFRhZ10gPVxuXHR0eXBlZEFycmF5VGFnc1tyZWdleHBUYWddID0gdHlwZWRBcnJheVRhZ3Nbc2V0VGFnXSA9XG5cdHR5cGVkQXJyYXlUYWdzW3N0cmluZ1RhZ10gPSB0eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXHRcblx0LyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cblx0dmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblx0XG5cdC8qKlxuXHQgKiBVc2VkIHRvIHJlc29sdmUgdGhlIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuXHQgKiBvZiB2YWx1ZXMuXG5cdCAqL1xuXHR2YXIgb2JqVG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblx0XG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgdHlwZWQgYXJyYXkuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQG1lbWJlck9mIF9cblx0ICogQGNhdGVnb3J5IExhbmdcblx0ICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLCBlbHNlIGBmYWxzZWAuXG5cdCAqIEBleGFtcGxlXG5cdCAqXG5cdCAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcblx0ICogLy8gPT4gdHJ1ZVxuXHQgKlxuXHQgKiBfLmlzVHlwZWRBcnJheShbXSk7XG5cdCAqIC8vID0+IGZhbHNlXG5cdCAqL1xuXHRmdW5jdGlvbiBpc1R5cGVkQXJyYXkodmFsdWUpIHtcblx0ICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3Nbb2JqVG9TdHJpbmcuY2FsbCh2YWx1ZSldO1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGlzVHlwZWRBcnJheTtcblxuXG4vKioqLyB9LFxuLyogNDMgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBpc09iamVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oNyk7XG5cdFxuXHQvKipcblx0ICogQ29udmVydHMgYHZhbHVlYCB0byBhbiBvYmplY3QgaWYgaXQncyBub3Qgb25lLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuXHQgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBvYmplY3QuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b09iamVjdCh2YWx1ZSkge1xuXHQgIHJldHVybiBpc09iamVjdCh2YWx1ZSkgPyB2YWx1ZSA6IE9iamVjdCh2YWx1ZSk7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gdG9PYmplY3Q7XG5cblxuLyoqKi8gfSxcbi8qIDQ0ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgaXNTdHJpY3RDb21wYXJhYmxlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0NSksXG5cdCAgICBwYWlycyA9IF9fd2VicGFja19yZXF1aXJlX18oNDYpO1xuXHRcblx0LyoqXG5cdCAqIEdldHMgdGhlIHByb3BlcnkgbmFtZXMsIHZhbHVlcywgYW5kIGNvbXBhcmUgZmxhZ3Mgb2YgYG9iamVjdGAuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBtYXRjaCBkYXRhIG9mIGBvYmplY3RgLlxuXHQgKi9cblx0ZnVuY3Rpb24gZ2V0TWF0Y2hEYXRhKG9iamVjdCkge1xuXHQgIHZhciByZXN1bHQgPSBwYWlycyhvYmplY3QpLFxuXHQgICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXHRcblx0ICB3aGlsZSAobGVuZ3RoLS0pIHtcblx0ICAgIHJlc3VsdFtsZW5ndGhdWzJdID0gaXNTdHJpY3RDb21wYXJhYmxlKHJlc3VsdFtsZW5ndGhdWzFdKTtcblx0ICB9XG5cdCAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBnZXRNYXRjaERhdGE7XG5cblxuLyoqKi8gfSxcbi8qIDQ1ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgaXNPYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDcpO1xuXHRcblx0LyoqXG5cdCAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlIGZvciBzdHJpY3QgZXF1YWxpdHkgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpZiBzdWl0YWJsZSBmb3Igc3RyaWN0XG5cdCAqICBlcXVhbGl0eSBjb21wYXJpc29ucywgZWxzZSBgZmFsc2VgLlxuXHQgKi9cblx0ZnVuY3Rpb24gaXNTdHJpY3RDb21wYXJhYmxlKHZhbHVlKSB7XG5cdCAgcmV0dXJuIHZhbHVlID09PSB2YWx1ZSAmJiAhaXNPYmplY3QodmFsdWUpO1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGlzU3RyaWN0Q29tcGFyYWJsZTtcblxuXG4vKioqLyB9LFxuLyogNDYgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBrZXlzID0gX193ZWJwYWNrX3JlcXVpcmVfXygzOSksXG5cdCAgICB0b09iamVjdCA9IF9fd2VicGFja19yZXF1aXJlX18oNDMpO1xuXHRcblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0d28gZGltZW5zaW9uYWwgYXJyYXkgb2YgdGhlIGtleS12YWx1ZSBwYWlycyBmb3IgYG9iamVjdGAsXG5cdCAqIGUuZy4gYFtba2V5MSwgdmFsdWUxXSwgW2tleTIsIHZhbHVlMl1dYC5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAbWVtYmVyT2YgX1xuXHQgKiBAY2F0ZWdvcnkgT2JqZWN0XG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgYXJyYXkgb2Yga2V5LXZhbHVlIHBhaXJzLlxuXHQgKiBAZXhhbXBsZVxuXHQgKlxuXHQgKiBfLnBhaXJzKHsgJ2Jhcm5leSc6IDM2LCAnZnJlZCc6IDQwIH0pO1xuXHQgKiAvLyA9PiBbWydiYXJuZXknLCAzNl0sIFsnZnJlZCcsIDQwXV0gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcblx0ICovXG5cdGZ1bmN0aW9uIHBhaXJzKG9iamVjdCkge1xuXHQgIG9iamVjdCA9IHRvT2JqZWN0KG9iamVjdCk7XG5cdFxuXHQgIHZhciBpbmRleCA9IC0xLFxuXHQgICAgICBwcm9wcyA9IGtleXMob2JqZWN0KSxcblx0ICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuXHQgICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXHRcblx0ICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHQgICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcblx0ICAgIHJlc3VsdFtpbmRleF0gPSBba2V5LCBvYmplY3Rba2V5XV07XG5cdCAgfVxuXHQgIHJldHVybiByZXN1bHQ7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gcGFpcnM7XG5cblxuLyoqKi8gfSxcbi8qIDQ3ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgYmFzZUdldCA9IF9fd2VicGFja19yZXF1aXJlX18oNDgpLFxuXHQgICAgYmFzZUlzRXF1YWwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDMzKSxcblx0ICAgIGJhc2VTbGljZSA9IF9fd2VicGFja19yZXF1aXJlX18oNDkpLFxuXHQgICAgaXNBcnJheSA9IF9fd2VicGFja19yZXF1aXJlX18oMjQpLFxuXHQgICAgaXNLZXkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUwKSxcblx0ICAgIGlzU3RyaWN0Q29tcGFyYWJsZSA9IF9fd2VicGFja19yZXF1aXJlX18oNDUpLFxuXHQgICAgbGFzdCA9IF9fd2VicGFja19yZXF1aXJlX18oNTEpLFxuXHQgICAgdG9PYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQzKSxcblx0ICAgIHRvUGF0aCA9IF9fd2VicGFja19yZXF1aXJlX18oNTIpO1xuXHRcblx0LyoqXG5cdCAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLm1hdGNoZXNQcm9wZXJ0eWAgd2hpY2ggZG9lcyBub3QgY2xvbmUgYHNyY1ZhbHVlYC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cblx0ICogQHBhcmFtIHsqfSBzcmNWYWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cblx0ICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBiYXNlTWF0Y2hlc1Byb3BlcnR5KHBhdGgsIHNyY1ZhbHVlKSB7XG5cdCAgdmFyIGlzQXJyID0gaXNBcnJheShwYXRoKSxcblx0ICAgICAgaXNDb21tb24gPSBpc0tleShwYXRoKSAmJiBpc1N0cmljdENvbXBhcmFibGUoc3JjVmFsdWUpLFxuXHQgICAgICBwYXRoS2V5ID0gKHBhdGggKyAnJyk7XG5cdFxuXHQgIHBhdGggPSB0b1BhdGgocGF0aCk7XG5cdCAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuXHQgICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG5cdCAgICAgIHJldHVybiBmYWxzZTtcblx0ICAgIH1cblx0ICAgIHZhciBrZXkgPSBwYXRoS2V5O1xuXHQgICAgb2JqZWN0ID0gdG9PYmplY3Qob2JqZWN0KTtcblx0ICAgIGlmICgoaXNBcnIgfHwgIWlzQ29tbW9uKSAmJiAhKGtleSBpbiBvYmplY3QpKSB7XG5cdCAgICAgIG9iamVjdCA9IHBhdGgubGVuZ3RoID09IDEgPyBvYmplY3QgOiBiYXNlR2V0KG9iamVjdCwgYmFzZVNsaWNlKHBhdGgsIDAsIC0xKSk7XG5cdCAgICAgIGlmIChvYmplY3QgPT0gbnVsbCkge1xuXHQgICAgICAgIHJldHVybiBmYWxzZTtcblx0ICAgICAgfVxuXHQgICAgICBrZXkgPSBsYXN0KHBhdGgpO1xuXHQgICAgICBvYmplY3QgPSB0b09iamVjdChvYmplY3QpO1xuXHQgICAgfVxuXHQgICAgcmV0dXJuIG9iamVjdFtrZXldID09PSBzcmNWYWx1ZVxuXHQgICAgICA/IChzcmNWYWx1ZSAhPT0gdW5kZWZpbmVkIHx8IChrZXkgaW4gb2JqZWN0KSlcblx0ICAgICAgOiBiYXNlSXNFcXVhbChzcmNWYWx1ZSwgb2JqZWN0W2tleV0sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdCAgfTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBiYXNlTWF0Y2hlc1Byb3BlcnR5O1xuXG5cbi8qKiovIH0sXG4vKiA0OCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIHRvT2JqZWN0ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0Myk7XG5cdFxuXHQvKipcblx0ICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldGAgd2l0aG91dCBzdXBwb3J0IGZvciBzdHJpbmcgcGF0aHNcblx0ICogYW5kIGRlZmF1bHQgdmFsdWVzLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IFtwYXRoS2V5XSBUaGUga2V5IHJlcHJlc2VudGF0aW9uIG9mIHBhdGguXG5cdCAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXNvbHZlZCB2YWx1ZS5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2VHZXQob2JqZWN0LCBwYXRoLCBwYXRoS2V5KSB7XG5cdCAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG5cdCAgICByZXR1cm47XG5cdCAgfVxuXHQgIGlmIChwYXRoS2V5ICE9PSB1bmRlZmluZWQgJiYgcGF0aEtleSBpbiB0b09iamVjdChvYmplY3QpKSB7XG5cdCAgICBwYXRoID0gW3BhdGhLZXldO1xuXHQgIH1cblx0ICB2YXIgaW5kZXggPSAwLFxuXHQgICAgICBsZW5ndGggPSBwYXRoLmxlbmd0aDtcblx0XG5cdCAgd2hpbGUgKG9iamVjdCAhPSBudWxsICYmIGluZGV4IDwgbGVuZ3RoKSB7XG5cdCAgICBvYmplY3QgPSBvYmplY3RbcGF0aFtpbmRleCsrXV07XG5cdCAgfVxuXHQgIHJldHVybiAoaW5kZXggJiYgaW5kZXggPT0gbGVuZ3RoKSA/IG9iamVjdCA6IHVuZGVmaW5lZDtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0O1xuXG5cbi8qKiovIH0sXG4vKiA0OSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0LyoqXG5cdCAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnNsaWNlYCB3aXRob3V0IGFuIGl0ZXJhdGVlIGNhbGwgZ3VhcmQuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBzbGljZS5cblx0ICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD0wXSBUaGUgc3RhcnQgcG9zaXRpb24uXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbZW5kPWFycmF5Lmxlbmd0aF0gVGhlIGVuZCBwb3NpdGlvbi5cblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBzbGljZSBvZiBgYXJyYXlgLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzZVNsaWNlKGFycmF5LCBzdGFydCwgZW5kKSB7XG5cdCAgdmFyIGluZGV4ID0gLTEsXG5cdCAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XG5cdCAgc3RhcnQgPSBzdGFydCA9PSBudWxsID8gMCA6ICgrc3RhcnQgfHwgMCk7XG5cdCAgaWYgKHN0YXJ0IDwgMCkge1xuXHQgICAgc3RhcnQgPSAtc3RhcnQgPiBsZW5ndGggPyAwIDogKGxlbmd0aCArIHN0YXJ0KTtcblx0ICB9XG5cdCAgZW5kID0gKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IGxlbmd0aCkgPyBsZW5ndGggOiAoK2VuZCB8fCAwKTtcblx0ICBpZiAoZW5kIDwgMCkge1xuXHQgICAgZW5kICs9IGxlbmd0aDtcblx0ICB9XG5cdCAgbGVuZ3RoID0gc3RhcnQgPiBlbmQgPyAwIDogKChlbmQgLSBzdGFydCkgPj4+IDApO1xuXHQgIHN0YXJ0ID4+Pj0gMDtcblx0XG5cdCAgdmFyIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cdCAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcblx0ICAgIHJlc3VsdFtpbmRleF0gPSBhcnJheVtpbmRleCArIHN0YXJ0XTtcblx0ICB9XG5cdCAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBiYXNlU2xpY2U7XG5cblxuLyoqKi8gfSxcbi8qIDUwICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgaXNBcnJheSA9IF9fd2VicGFja19yZXF1aXJlX18oMjQpLFxuXHQgICAgdG9PYmplY3QgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQzKTtcblx0XG5cdC8qKiBVc2VkIHRvIG1hdGNoIHByb3BlcnR5IG5hbWVzIHdpdGhpbiBwcm9wZXJ0eSBwYXRocy4gKi9cblx0dmFyIHJlSXNEZWVwUHJvcCA9IC9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcblxcXFxdfFxcXFwuKSo/XFwxKVxcXS8sXG5cdCAgICByZUlzUGxhaW5Qcm9wID0gL15cXHcqJC87XG5cdFxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwcm9wZXJ0eSBuYW1lIGFuZCBub3QgYSBwcm9wZXJ0eSBwYXRoLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cblx0ICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkga2V5cyBvbi5cblx0ICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm9wZXJ0eSBuYW1lLCBlbHNlIGBmYWxzZWAuXG5cdCAqL1xuXHRmdW5jdGlvbiBpc0tleSh2YWx1ZSwgb2JqZWN0KSB7XG5cdCAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG5cdCAgaWYgKCh0eXBlID09ICdzdHJpbmcnICYmIHJlSXNQbGFpblByb3AudGVzdCh2YWx1ZSkpIHx8IHR5cGUgPT0gJ251bWJlcicpIHtcblx0ICAgIHJldHVybiB0cnVlO1xuXHQgIH1cblx0ICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcblx0ICAgIHJldHVybiBmYWxzZTtcblx0ICB9XG5cdCAgdmFyIHJlc3VsdCA9ICFyZUlzRGVlcFByb3AudGVzdCh2YWx1ZSk7XG5cdCAgcmV0dXJuIHJlc3VsdCB8fCAob2JqZWN0ICE9IG51bGwgJiYgdmFsdWUgaW4gdG9PYmplY3Qob2JqZWN0KSk7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gaXNLZXk7XG5cblxuLyoqKi8gfSxcbi8qIDUxICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHQvKipcblx0ICogR2V0cyB0aGUgbGFzdCBlbGVtZW50IG9mIGBhcnJheWAuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQG1lbWJlck9mIF9cblx0ICogQGNhdGVnb3J5IEFycmF5XG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBxdWVyeS5cblx0ICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGxhc3QgZWxlbWVudCBvZiBgYXJyYXlgLlxuXHQgKiBAZXhhbXBsZVxuXHQgKlxuXHQgKiBfLmxhc3QoWzEsIDIsIDNdKTtcblx0ICogLy8gPT4gM1xuXHQgKi9cblx0ZnVuY3Rpb24gbGFzdChhcnJheSkge1xuXHQgIHZhciBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG5cdCAgcmV0dXJuIGxlbmd0aCA/IGFycmF5W2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGxhc3Q7XG5cblxuLyoqKi8gfSxcbi8qIDUyICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgYmFzZVRvU3RyaW5nID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1MyksXG5cdCAgICBpc0FycmF5ID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNCk7XG5cdFxuXHQvKiogVXNlZCB0byBtYXRjaCBwcm9wZXJ0eSBuYW1lcyB3aXRoaW4gcHJvcGVydHkgcGF0aHMuICovXG5cdHZhciByZVByb3BOYW1lID0gL1teLltcXF1dK3xcXFsoPzooLT9cXGQrKD86XFwuXFxkKyk/KXwoW1wiJ10pKCg/Oig/IVxcMilbXlxcblxcXFxdfFxcXFwuKSo/KVxcMilcXF0vZztcblx0XG5cdC8qKiBVc2VkIHRvIG1hdGNoIGJhY2tzbGFzaGVzIGluIHByb3BlcnR5IHBhdGhzLiAqL1xuXHR2YXIgcmVFc2NhcGVDaGFyID0gL1xcXFwoXFxcXCk/L2c7XG5cdFxuXHQvKipcblx0ICogQ29udmVydHMgYHZhbHVlYCB0byBwcm9wZXJ0eSBwYXRoIGFycmF5IGlmIGl0J3Mgbm90IG9uZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSBwYXRoIGFycmF5LlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9QYXRoKHZhbHVlKSB7XG5cdCAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG5cdCAgICByZXR1cm4gdmFsdWU7XG5cdCAgfVxuXHQgIHZhciByZXN1bHQgPSBbXTtcblx0ICBiYXNlVG9TdHJpbmcodmFsdWUpLnJlcGxhY2UocmVQcm9wTmFtZSwgZnVuY3Rpb24obWF0Y2gsIG51bWJlciwgcXVvdGUsIHN0cmluZykge1xuXHQgICAgcmVzdWx0LnB1c2gocXVvdGUgPyBzdHJpbmcucmVwbGFjZShyZUVzY2FwZUNoYXIsICckMScpIDogKG51bWJlciB8fCBtYXRjaCkpO1xuXHQgIH0pO1xuXHQgIHJldHVybiByZXN1bHQ7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gdG9QYXRoO1xuXG5cbi8qKiovIH0sXG4vKiA1MyAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgaWYgaXQncyBub3Qgb25lLiBBbiBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWRcblx0ICogZm9yIGBudWxsYCBvciBgdW5kZWZpbmVkYCB2YWx1ZXMuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xuXHQgIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiAodmFsdWUgKyAnJyk7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gYmFzZVRvU3RyaW5nO1xuXG5cbi8qKiovIH0sXG4vKiA1NCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGlkZW50aXR5ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1NSk7XG5cdFxuXHQvKipcblx0ICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlQ2FsbGJhY2tgIHdoaWNoIG9ubHkgc3VwcG9ydHMgYHRoaXNgIGJpbmRpbmdcblx0ICogYW5kIHNwZWNpZnlpbmcgdGhlIG51bWJlciBvZiBhcmd1bWVudHMgdG8gcHJvdmlkZSB0byBgZnVuY2AuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGJpbmQuXG5cdCAqIEBwYXJhbSB7Kn0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gW2FyZ0NvdW50XSBUaGUgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byBwcm92aWRlIHRvIGBmdW5jYC5cblx0ICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBjYWxsYmFjay5cblx0ICovXG5cdGZ1bmN0aW9uIGJpbmRDYWxsYmFjayhmdW5jLCB0aGlzQXJnLCBhcmdDb3VudCkge1xuXHQgIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG5cdCAgICByZXR1cm4gaWRlbnRpdHk7XG5cdCAgfVxuXHQgIGlmICh0aGlzQXJnID09PSB1bmRlZmluZWQpIHtcblx0ICAgIHJldHVybiBmdW5jO1xuXHQgIH1cblx0ICBzd2l0Y2ggKGFyZ0NvdW50KSB7XG5cdCAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuXHQgICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIHZhbHVlKTtcblx0ICAgIH07XG5cdCAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcblx0ICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuXHQgICAgfTtcblx0ICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcblx0ICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcblx0ICAgIH07XG5cdCAgICBjYXNlIDU6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3RoZXIsIGtleSwgb2JqZWN0LCBzb3VyY2UpIHtcblx0ICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgb3RoZXIsIGtleSwgb2JqZWN0LCBzb3VyY2UpO1xuXHQgICAgfTtcblx0ICB9XG5cdCAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0FyZywgYXJndW1lbnRzKTtcblx0ICB9O1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGJpbmRDYWxsYmFjaztcblxuXG4vKioqLyB9LFxuLyogNTUgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBwcm92aWRlZCB0byBpdC5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAbWVtYmVyT2YgX1xuXHQgKiBAY2F0ZWdvcnkgVXRpbGl0eVxuXHQgKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cblx0ICogQHJldHVybnMgeyp9IFJldHVybnMgYHZhbHVlYC5cblx0ICogQGV4YW1wbGVcblx0ICpcblx0ICogdmFyIG9iamVjdCA9IHsgJ3VzZXInOiAnZnJlZCcgfTtcblx0ICpcblx0ICogXy5pZGVudGl0eShvYmplY3QpID09PSBvYmplY3Q7XG5cdCAqIC8vID0+IHRydWVcblx0ICovXG5cdGZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG5cdCAgcmV0dXJuIHZhbHVlO1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGlkZW50aXR5O1xuXG5cbi8qKiovIH0sXG4vKiA1NiAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGJhc2VQcm9wZXJ0eSA9IF9fd2VicGFja19yZXF1aXJlX18oMTcpLFxuXHQgICAgYmFzZVByb3BlcnR5RGVlcCA9IF9fd2VicGFja19yZXF1aXJlX18oNTcpLFxuXHQgICAgaXNLZXkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUwKTtcblx0XG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZSBhdCBgcGF0aGAgb24gYVxuXHQgKiBnaXZlbiBvYmplY3QuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQG1lbWJlck9mIF9cblx0ICogQGNhdGVnb3J5IFV0aWxpdHlcblx0ICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cblx0ICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG5cdCAqIEBleGFtcGxlXG5cdCAqXG5cdCAqIHZhciBvYmplY3RzID0gW1xuXHQgKiAgIHsgJ2EnOiB7ICdiJzogeyAnYyc6IDIgfSB9IH0sXG5cdCAqICAgeyAnYSc6IHsgJ2InOiB7ICdjJzogMSB9IH0gfVxuXHQgKiBdO1xuXHQgKlxuXHQgKiBfLm1hcChvYmplY3RzLCBfLnByb3BlcnR5KCdhLmIuYycpKTtcblx0ICogLy8gPT4gWzIsIDFdXG5cdCAqXG5cdCAqIF8ucGx1Y2soXy5zb3J0Qnkob2JqZWN0cywgXy5wcm9wZXJ0eShbJ2EnLCAnYicsICdjJ10pKSwgJ2EuYi5jJyk7XG5cdCAqIC8vID0+IFsxLCAyXVxuXHQgKi9cblx0ZnVuY3Rpb24gcHJvcGVydHkocGF0aCkge1xuXHQgIHJldHVybiBpc0tleShwYXRoKSA/IGJhc2VQcm9wZXJ0eShwYXRoKSA6IGJhc2VQcm9wZXJ0eURlZXAocGF0aCk7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gcHJvcGVydHk7XG5cblxuLyoqKi8gfSxcbi8qIDU3ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgYmFzZUdldCA9IF9fd2VicGFja19yZXF1aXJlX18oNDgpLFxuXHQgICAgdG9QYXRoID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1Mik7XG5cdFxuXHQvKipcblx0ICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUHJvcGVydHlgIHdoaWNoIHN1cHBvcnRzIGRlZXAgcGF0aHMuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG5cdCAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzZVByb3BlcnR5RGVlcChwYXRoKSB7XG5cdCAgdmFyIHBhdGhLZXkgPSAocGF0aCArICcnKTtcblx0ICBwYXRoID0gdG9QYXRoKHBhdGgpO1xuXHQgIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcblx0ICAgIHJldHVybiBiYXNlR2V0KG9iamVjdCwgcGF0aCwgcGF0aEtleSk7XG5cdCAgfTtcblx0fVxuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBiYXNlUHJvcGVydHlEZWVwO1xuXG5cbi8qKiovIH0sXG4vKiA1OCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGJhc2VJbmRleE9mID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0KSxcblx0ICAgIGNhY2hlSW5kZXhPZiA9IF9fd2VicGFja19yZXF1aXJlX18oNiksXG5cdCAgICBjcmVhdGVDYWNoZSA9IF9fd2VicGFja19yZXF1aXJlX18oOCk7XG5cdFxuXHQvKiogVXNlZCBhcyB0aGUgc2l6ZSB0byBlbmFibGUgbGFyZ2UgYXJyYXkgb3B0aW1pemF0aW9ucy4gKi9cblx0dmFyIExBUkdFX0FSUkFZX1NJWkUgPSAyMDA7XG5cdFxuXHQvKipcblx0ICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5pcWAgd2l0aG91dCBzdXBwb3J0IGZvciBjYWxsYmFjayBzaG9ydGhhbmRzXG5cdCAqIGFuZCBgdGhpc2AgYmluZGluZy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGluc3BlY3QuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtpdGVyYXRlZV0gVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZHVwbGljYXRlIGZyZWUgYXJyYXkuXG5cdCAqL1xuXHRmdW5jdGlvbiBiYXNlVW5pcShhcnJheSwgaXRlcmF0ZWUpIHtcblx0ICB2YXIgaW5kZXggPSAtMSxcblx0ICAgICAgaW5kZXhPZiA9IGJhc2VJbmRleE9mLFxuXHQgICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG5cdCAgICAgIGlzQ29tbW9uID0gdHJ1ZSxcblx0ICAgICAgaXNMYXJnZSA9IGlzQ29tbW9uICYmIGxlbmd0aCA+PSBMQVJHRV9BUlJBWV9TSVpFLFxuXHQgICAgICBzZWVuID0gaXNMYXJnZSA/IGNyZWF0ZUNhY2hlKCkgOiBudWxsLFxuXHQgICAgICByZXN1bHQgPSBbXTtcblx0XG5cdCAgaWYgKHNlZW4pIHtcblx0ICAgIGluZGV4T2YgPSBjYWNoZUluZGV4T2Y7XG5cdCAgICBpc0NvbW1vbiA9IGZhbHNlO1xuXHQgIH0gZWxzZSB7XG5cdCAgICBpc0xhcmdlID0gZmFsc2U7XG5cdCAgICBzZWVuID0gaXRlcmF0ZWUgPyBbXSA6IHJlc3VsdDtcblx0ICB9XG5cdCAgb3V0ZXI6XG5cdCAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcblx0ICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XSxcblx0ICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlID8gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBhcnJheSkgOiB2YWx1ZTtcblx0XG5cdCAgICBpZiAoaXNDb21tb24gJiYgdmFsdWUgPT09IHZhbHVlKSB7XG5cdCAgICAgIHZhciBzZWVuSW5kZXggPSBzZWVuLmxlbmd0aDtcblx0ICAgICAgd2hpbGUgKHNlZW5JbmRleC0tKSB7XG5cdCAgICAgICAgaWYgKHNlZW5bc2VlbkluZGV4XSA9PT0gY29tcHV0ZWQpIHtcblx0ICAgICAgICAgIGNvbnRpbnVlIG91dGVyO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgICBpZiAoaXRlcmF0ZWUpIHtcblx0ICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuXHQgICAgICB9XG5cdCAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcblx0ICAgIH1cblx0ICAgIGVsc2UgaWYgKGluZGV4T2Yoc2VlbiwgY29tcHV0ZWQsIDApIDwgMCkge1xuXHQgICAgICBpZiAoaXRlcmF0ZWUgfHwgaXNMYXJnZSkge1xuXHQgICAgICAgIHNlZW4ucHVzaChjb21wdXRlZCk7XG5cdCAgICAgIH1cblx0ICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gcmVzdWx0O1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IGJhc2VVbmlxO1xuXG5cbi8qKiovIH0sXG4vKiA1OSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0LyoqXG5cdCAqIEFuIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuaXFgIG9wdGltaXplZCBmb3Igc29ydGVkIGFycmF5cyB3aXRob3V0IHN1cHBvcnRcblx0ICogZm9yIGNhbGxiYWNrIHNob3J0aGFuZHMgYW5kIGB0aGlzYCBiaW5kaW5nLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW2l0ZXJhdGVlXSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBkdXBsaWNhdGUgZnJlZSBhcnJheS5cblx0ICovXG5cdGZ1bmN0aW9uIHNvcnRlZFVuaXEoYXJyYXksIGl0ZXJhdGVlKSB7XG5cdCAgdmFyIHNlZW4sXG5cdCAgICAgIGluZGV4ID0gLTEsXG5cdCAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCxcblx0ICAgICAgcmVzSW5kZXggPSAtMSxcblx0ICAgICAgcmVzdWx0ID0gW107XG5cdFxuXHQgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG5cdCAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF0sXG5cdCAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSA/IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgYXJyYXkpIDogdmFsdWU7XG5cdFxuXHQgICAgaWYgKCFpbmRleCB8fCBzZWVuICE9PSBjb21wdXRlZCkge1xuXHQgICAgICBzZWVuID0gY29tcHV0ZWQ7XG5cdCAgICAgIHJlc3VsdFsrK3Jlc0luZGV4XSA9IHZhbHVlO1xuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gcmVzdWx0O1xuXHR9XG5cdFxuXHRtb2R1bGUuZXhwb3J0cyA9IHNvcnRlZFVuaXE7XG5cblxuLyoqKi8gfSxcbi8qIDYwICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cdFxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdCAgdmFsdWU6IHRydWVcblx0fSk7XG5cdFxuXHRleHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoX3JlZikge1xuXHQgIHZhciBTdWJzY3JpcHRpb24gPSBfcmVmLlN1YnNjcmlwdGlvbjtcblx0ICB2YXIgc3Vic2NyaXB0aW9uc0J5VVVJRCA9IF9yZWYuc3Vic2NyaXB0aW9uc0J5VVVJRDtcblx0ICB2YXIgc3Vic2NyaXB0aW9uc0J5UHJvcGVydHkgPSBfcmVmLnN1YnNjcmlwdGlvbnNCeVByb3BlcnR5O1xuXHQgIHZhciBwcm9wZXJ0aWVzID0gX3JlZi5wcm9wZXJ0aWVzO1xuXHQgIHZhciBjYWxsYmFjayA9IF9yZWYuY2FsbGJhY2s7XG5cdFxuXHQgIC8qIG1ha2UgYSBzdWJzY3JpcHRpb24gKi9cblx0ICB2YXIgc3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uKHsgcHJvcGVydGllczogcHJvcGVydGllcywgY2FsbGJhY2s6IGNhbGxiYWNrIH0pO1xuXHRcblx0ICAvKiBhZGQgdGhlIHN1YnNjcmlwdGlvbiB0byB0aGUgc3Vic2NyaXB0aW9uc0J5VVVJRCBvYmplY3QgKi9cblx0ICBzdWJzY3JpcHRpb25zQnlVVUlEW3N1YnNjcmlwdGlvbi51dWlkXSA9IHN1YnNjcmlwdGlvbjtcblx0XG5cdCAgLyogYWRkIHJlZmVyZW5jZXMgdG8gdGhlIHN1YnNjcmlwdGlvbiB0byBlYWNoIG9mIHRoZSAqL1xuXHQgIC8qIHN1YnNjcmliZWQgcHJvcGVydGllcyAqL1xuXHQgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHkpIHtcblx0ICAgIHN1YnNjcmlwdGlvbnNCeVByb3BlcnR5LmFkZCh7IHByb3BlcnR5OiBwcm9wZXJ0eSwgc3Vic2NyaXB0aW9uOiBzdWJzY3JpcHRpb24gfSk7XG5cdCAgfSk7XG5cdFxuXHQgIHJldHVybiBzdWJzY3JpcHRpb24udXVpZDtcblx0fTtcblx0XG5cdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG4vKioqLyB9LFxuLyogNjEgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdCd1c2Ugc3RyaWN0Jztcblx0XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcblx0ICB2YWx1ZTogdHJ1ZVxuXHR9KTtcblx0XG5cdGZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblx0XG5cdHZhciBfbm9kZVV1aWQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDYyKTtcblx0XG5cdHZhciBfbm9kZVV1aWQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbm9kZVV1aWQpO1xuXHRcblx0dmFyIFNVQlNDUklQVElPTl9QUk9UT1RZUEUgPSB7XG5cdCAgcHJvcGVydGllczogW10sXG5cdCAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKCkge30sXG5cdCAgZ3VpZDogbnVsbFxuXHR9O1xuXHRcblx0ZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKF9yZWYpIHtcblx0ICB2YXIgcHJvcGVydGllcyA9IF9yZWYucHJvcGVydGllcztcblx0ICB2YXIgY2FsbGJhY2sgPSBfcmVmLmNhbGxiYWNrO1xuXHRcblx0ICB2YXIgc3Vic2NyaXB0aW9uID0gT2JqZWN0LmNyZWF0ZShTVUJTQ1JJUFRJT05fUFJPVE9UWVBFKTtcblx0XG5cdCAgc3Vic2NyaXB0aW9uLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuXHQgIHN1YnNjcmlwdGlvbi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXHQgIHN1YnNjcmlwdGlvbi51dWlkID0gX25vZGVVdWlkMlsnZGVmYXVsdCddLnY0KCk7XG5cdFxuXHQgIHJldHVybiBzdWJzY3JpcHRpb247XG5cdH07XG5cdFxuXHRleHBvcnRzLlNVQlNDUklQVElPTl9QUk9UT1RZUEUgPSBTVUJTQ1JJUFRJT05fUFJPVE9UWVBFO1xuXG4vKioqLyB9LFxuLyogNjIgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfX1dFQlBBQ0tfQU1EX0RFRklORV9SRVNVTFRfXzsvLyAgICAgdXVpZC5qc1xuXHQvL1xuXHQvLyAgICAgQ29weXJpZ2h0IChjKSAyMDEwLTIwMTIgUm9iZXJ0IEtpZWZmZXJcblx0Ly8gICAgIE1JVCBMaWNlbnNlIC0gaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRcblx0KGZ1bmN0aW9uKCkge1xuXHQgIHZhciBfZ2xvYmFsID0gdGhpcztcblx0XG5cdCAgLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gIFdlIGZlYXR1cmVcblx0ICAvLyBkZXRlY3QgdG8gZGV0ZXJtaW5lIHRoZSBiZXN0IFJORyBzb3VyY2UsIG5vcm1hbGl6aW5nIHRvIGEgZnVuY3Rpb24gdGhhdFxuXHQgIC8vIHJldHVybnMgMTI4LWJpdHMgb2YgcmFuZG9tbmVzcywgc2luY2UgdGhhdCdzIHdoYXQncyB1c3VhbGx5IHJlcXVpcmVkXG5cdCAgdmFyIF9ybmc7XG5cdFxuXHQgIC8vIE5vZGUuanMgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly9ub2RlanMub3JnL2RvY3MvdjAuNi4yL2FwaS9jcnlwdG8uaHRtbFxuXHQgIC8vXG5cdCAgLy8gTW9kZXJhdGVseSBmYXN0LCBoaWdoIHF1YWxpdHlcblx0ICBpZiAodHlwZW9mKF9nbG9iYWwucmVxdWlyZSkgPT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgdHJ5IHtcblx0ICAgICAgdmFyIF9yYiA9IF9nbG9iYWwucmVxdWlyZSgnY3J5cHRvJykucmFuZG9tQnl0ZXM7XG5cdCAgICAgIF9ybmcgPSBfcmIgJiYgZnVuY3Rpb24oKSB7cmV0dXJuIF9yYigxNik7fTtcblx0ICAgIH0gY2F0Y2goZSkge31cblx0ICB9XG5cdFxuXHQgIGlmICghX3JuZyAmJiBfZ2xvYmFsLmNyeXB0byAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG5cdCAgICAvLyBXSEFUV0cgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly93aWtpLndoYXR3Zy5vcmcvd2lraS9DcnlwdG9cblx0ICAgIC8vXG5cdCAgICAvLyBNb2RlcmF0ZWx5IGZhc3QsIGhpZ2ggcXVhbGl0eVxuXHQgICAgdmFyIF9ybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTtcblx0ICAgIF9ybmcgPSBmdW5jdGlvbiB3aGF0d2dSTkcoKSB7XG5cdCAgICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoX3JuZHM4KTtcblx0ICAgICAgcmV0dXJuIF9ybmRzODtcblx0ICAgIH07XG5cdCAgfVxuXHRcblx0ICBpZiAoIV9ybmcpIHtcblx0ICAgIC8vIE1hdGgucmFuZG9tKCktYmFzZWQgKFJORylcblx0ICAgIC8vXG5cdCAgICAvLyBJZiBhbGwgZWxzZSBmYWlscywgdXNlIE1hdGgucmFuZG9tKCkuICBJdCdzIGZhc3QsIGJ1dCBpcyBvZiB1bnNwZWNpZmllZFxuXHQgICAgLy8gcXVhbGl0eS5cblx0ICAgIHZhciAgX3JuZHMgPSBuZXcgQXJyYXkoMTYpO1xuXHQgICAgX3JuZyA9IGZ1bmN0aW9uKCkge1xuXHQgICAgICBmb3IgKHZhciBpID0gMCwgcjsgaSA8IDE2OyBpKyspIHtcblx0ICAgICAgICBpZiAoKGkgJiAweDAzKSA9PT0gMCkgciA9IE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMDtcblx0ICAgICAgICBfcm5kc1tpXSA9IHIgPj4+ICgoaSAmIDB4MDMpIDw8IDMpICYgMHhmZjtcblx0ICAgICAgfVxuXHRcblx0ICAgICAgcmV0dXJuIF9ybmRzO1xuXHQgICAgfTtcblx0ICB9XG5cdFxuXHQgIC8vIEJ1ZmZlciBjbGFzcyB0byB1c2Vcblx0ICB2YXIgQnVmZmVyQ2xhc3MgPSB0eXBlb2YoX2dsb2JhbC5CdWZmZXIpID09ICdmdW5jdGlvbicgPyBfZ2xvYmFsLkJ1ZmZlciA6IEFycmF5O1xuXHRcblx0ICAvLyBNYXBzIGZvciBudW1iZXIgPC0+IGhleCBzdHJpbmcgY29udmVyc2lvblxuXHQgIHZhciBfYnl0ZVRvSGV4ID0gW107XG5cdCAgdmFyIF9oZXhUb0J5dGUgPSB7fTtcblx0ICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG5cdCAgICBfYnl0ZVRvSGV4W2ldID0gKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cigxKTtcblx0ICAgIF9oZXhUb0J5dGVbX2J5dGVUb0hleFtpXV0gPSBpO1xuXHQgIH1cblx0XG5cdCAgLy8gKipgcGFyc2UoKWAgLSBQYXJzZSBhIFVVSUQgaW50byBpdCdzIGNvbXBvbmVudCBieXRlcyoqXG5cdCAgZnVuY3Rpb24gcGFyc2UocywgYnVmLCBvZmZzZXQpIHtcblx0ICAgIHZhciBpID0gKGJ1ZiAmJiBvZmZzZXQpIHx8IDAsIGlpID0gMDtcblx0XG5cdCAgICBidWYgPSBidWYgfHwgW107XG5cdCAgICBzLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWzAtOWEtZl17Mn0vZywgZnVuY3Rpb24ob2N0KSB7XG5cdCAgICAgIGlmIChpaSA8IDE2KSB7IC8vIERvbid0IG92ZXJmbG93IVxuXHQgICAgICAgIGJ1ZltpICsgaWkrK10gPSBfaGV4VG9CeXRlW29jdF07XG5cdCAgICAgIH1cblx0ICAgIH0pO1xuXHRcblx0ICAgIC8vIFplcm8gb3V0IHJlbWFpbmluZyBieXRlcyBpZiBzdHJpbmcgd2FzIHNob3J0XG5cdCAgICB3aGlsZSAoaWkgPCAxNikge1xuXHQgICAgICBidWZbaSArIGlpKytdID0gMDtcblx0ICAgIH1cblx0XG5cdCAgICByZXR1cm4gYnVmO1xuXHQgIH1cblx0XG5cdCAgLy8gKipgdW5wYXJzZSgpYCAtIENvbnZlcnQgVVVJRCBieXRlIGFycmF5IChhbGEgcGFyc2UoKSkgaW50byBhIHN0cmluZyoqXG5cdCAgZnVuY3Rpb24gdW5wYXJzZShidWYsIG9mZnNldCkge1xuXHQgICAgdmFyIGkgPSBvZmZzZXQgfHwgMCwgYnRoID0gX2J5dGVUb0hleDtcblx0ICAgIHJldHVybiAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuXHQgICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG5cdCAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcblx0ICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuXHQgICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG5cdCAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcblx0ICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuXHQgICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXTtcblx0ICB9XG5cdFxuXHQgIC8vICoqYHYxKClgIC0gR2VuZXJhdGUgdGltZS1iYXNlZCBVVUlEKipcblx0ICAvL1xuXHQgIC8vIEluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9MaW9zSy9VVUlELmpzXG5cdCAgLy8gYW5kIGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS91dWlkLmh0bWxcblx0XG5cdCAgLy8gcmFuZG9tICMncyB3ZSBuZWVkIHRvIGluaXQgbm9kZSBhbmQgY2xvY2tzZXFcblx0ICB2YXIgX3NlZWRCeXRlcyA9IF9ybmcoKTtcblx0XG5cdCAgLy8gUGVyIDQuNSwgY3JlYXRlIGFuZCA0OC1iaXQgbm9kZSBpZCwgKDQ3IHJhbmRvbSBiaXRzICsgbXVsdGljYXN0IGJpdCA9IDEpXG5cdCAgdmFyIF9ub2RlSWQgPSBbXG5cdCAgICBfc2VlZEJ5dGVzWzBdIHwgMHgwMSxcblx0ICAgIF9zZWVkQnl0ZXNbMV0sIF9zZWVkQnl0ZXNbMl0sIF9zZWVkQnl0ZXNbM10sIF9zZWVkQnl0ZXNbNF0sIF9zZWVkQnl0ZXNbNV1cblx0ICBdO1xuXHRcblx0ICAvLyBQZXIgNC4yLjIsIHJhbmRvbWl6ZSAoMTQgYml0KSBjbG9ja3NlcVxuXHQgIHZhciBfY2xvY2tzZXEgPSAoX3NlZWRCeXRlc1s2XSA8PCA4IHwgX3NlZWRCeXRlc1s3XSkgJiAweDNmZmY7XG5cdFxuXHQgIC8vIFByZXZpb3VzIHV1aWQgY3JlYXRpb24gdGltZVxuXHQgIHZhciBfbGFzdE1TZWNzID0gMCwgX2xhc3ROU2VjcyA9IDA7XG5cdFxuXHQgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcblx0ICBmdW5jdGlvbiB2MShvcHRpb25zLCBidWYsIG9mZnNldCkge1xuXHQgICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cdCAgICB2YXIgYiA9IGJ1ZiB8fCBbXTtcblx0XG5cdCAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XG5cdCAgICB2YXIgY2xvY2tzZXEgPSBvcHRpb25zLmNsb2Nrc2VxICE9IG51bGwgPyBvcHRpb25zLmNsb2Nrc2VxIDogX2Nsb2Nrc2VxO1xuXHRcblx0ICAgIC8vIFVVSUQgdGltZXN0YW1wcyBhcmUgMTAwIG5hbm8tc2Vjb25kIHVuaXRzIHNpbmNlIHRoZSBHcmVnb3JpYW4gZXBvY2gsXG5cdCAgICAvLyAoMTU4Mi0xMC0xNSAwMDowMCkuICBKU051bWJlcnMgYXJlbid0IHByZWNpc2UgZW5vdWdoIGZvciB0aGlzLCBzb1xuXHQgICAgLy8gdGltZSBpcyBoYW5kbGVkIGludGVybmFsbHkgYXMgJ21zZWNzJyAoaW50ZWdlciBtaWxsaXNlY29uZHMpIGFuZCAnbnNlY3MnXG5cdCAgICAvLyAoMTAwLW5hbm9zZWNvbmRzIG9mZnNldCBmcm9tIG1zZWNzKSBzaW5jZSB1bml4IGVwb2NoLCAxOTcwLTAxLTAxIDAwOjAwLlxuXHQgICAgdmFyIG1zZWNzID0gb3B0aW9ucy5tc2VjcyAhPSBudWxsID8gb3B0aW9ucy5tc2VjcyA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRcblx0ICAgIC8vIFBlciA0LjIuMS4yLCB1c2UgY291bnQgb2YgdXVpZCdzIGdlbmVyYXRlZCBkdXJpbmcgdGhlIGN1cnJlbnQgY2xvY2tcblx0ICAgIC8vIGN5Y2xlIHRvIHNpbXVsYXRlIGhpZ2hlciByZXNvbHV0aW9uIGNsb2NrXG5cdCAgICB2YXIgbnNlY3MgPSBvcHRpb25zLm5zZWNzICE9IG51bGwgPyBvcHRpb25zLm5zZWNzIDogX2xhc3ROU2VjcyArIDE7XG5cdFxuXHQgICAgLy8gVGltZSBzaW5jZSBsYXN0IHV1aWQgY3JlYXRpb24gKGluIG1zZWNzKVxuXHQgICAgdmFyIGR0ID0gKG1zZWNzIC0gX2xhc3RNU2VjcykgKyAobnNlY3MgLSBfbGFzdE5TZWNzKS8xMDAwMDtcblx0XG5cdCAgICAvLyBQZXIgNC4yLjEuMiwgQnVtcCBjbG9ja3NlcSBvbiBjbG9jayByZWdyZXNzaW9uXG5cdCAgICBpZiAoZHQgPCAwICYmIG9wdGlvbnMuY2xvY2tzZXEgPT0gbnVsbCkge1xuXHQgICAgICBjbG9ja3NlcSA9IGNsb2Nrc2VxICsgMSAmIDB4M2ZmZjtcblx0ICAgIH1cblx0XG5cdCAgICAvLyBSZXNldCBuc2VjcyBpZiBjbG9jayByZWdyZXNzZXMgKG5ldyBjbG9ja3NlcSkgb3Igd2UndmUgbW92ZWQgb250byBhIG5ld1xuXHQgICAgLy8gdGltZSBpbnRlcnZhbFxuXHQgICAgaWYgKChkdCA8IDAgfHwgbXNlY3MgPiBfbGFzdE1TZWNzKSAmJiBvcHRpb25zLm5zZWNzID09IG51bGwpIHtcblx0ICAgICAgbnNlY3MgPSAwO1xuXHQgICAgfVxuXHRcblx0ICAgIC8vIFBlciA0LjIuMS4yIFRocm93IGVycm9yIGlmIHRvbyBtYW55IHV1aWRzIGFyZSByZXF1ZXN0ZWRcblx0ICAgIGlmIChuc2VjcyA+PSAxMDAwMCkge1xuXHQgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3V1aWQudjEoKTogQ2FuXFwndCBjcmVhdGUgbW9yZSB0aGFuIDEwTSB1dWlkcy9zZWMnKTtcblx0ICAgIH1cblx0XG5cdCAgICBfbGFzdE1TZWNzID0gbXNlY3M7XG5cdCAgICBfbGFzdE5TZWNzID0gbnNlY3M7XG5cdCAgICBfY2xvY2tzZXEgPSBjbG9ja3NlcTtcblx0XG5cdCAgICAvLyBQZXIgNC4xLjQgLSBDb252ZXJ0IGZyb20gdW5peCBlcG9jaCB0byBHcmVnb3JpYW4gZXBvY2hcblx0ICAgIG1zZWNzICs9IDEyMjE5MjkyODAwMDAwO1xuXHRcblx0ICAgIC8vIGB0aW1lX2xvd2Bcblx0ICAgIHZhciB0bCA9ICgobXNlY3MgJiAweGZmZmZmZmYpICogMTAwMDAgKyBuc2VjcykgJSAweDEwMDAwMDAwMDtcblx0ICAgIGJbaSsrXSA9IHRsID4+PiAyNCAmIDB4ZmY7XG5cdCAgICBiW2krK10gPSB0bCA+Pj4gMTYgJiAweGZmO1xuXHQgICAgYltpKytdID0gdGwgPj4+IDggJiAweGZmO1xuXHQgICAgYltpKytdID0gdGwgJiAweGZmO1xuXHRcblx0ICAgIC8vIGB0aW1lX21pZGBcblx0ICAgIHZhciB0bWggPSAobXNlY3MgLyAweDEwMDAwMDAwMCAqIDEwMDAwKSAmIDB4ZmZmZmZmZjtcblx0ICAgIGJbaSsrXSA9IHRtaCA+Pj4gOCAmIDB4ZmY7XG5cdCAgICBiW2krK10gPSB0bWggJiAweGZmO1xuXHRcblx0ICAgIC8vIGB0aW1lX2hpZ2hfYW5kX3ZlcnNpb25gXG5cdCAgICBiW2krK10gPSB0bWggPj4+IDI0ICYgMHhmIHwgMHgxMDsgLy8gaW5jbHVkZSB2ZXJzaW9uXG5cdCAgICBiW2krK10gPSB0bWggPj4+IDE2ICYgMHhmZjtcblx0XG5cdCAgICAvLyBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGAgKFBlciA0LjIuMiAtIGluY2x1ZGUgdmFyaWFudClcblx0ICAgIGJbaSsrXSA9IGNsb2Nrc2VxID4+PiA4IHwgMHg4MDtcblx0XG5cdCAgICAvLyBgY2xvY2tfc2VxX2xvd2Bcblx0ICAgIGJbaSsrXSA9IGNsb2Nrc2VxICYgMHhmZjtcblx0XG5cdCAgICAvLyBgbm9kZWBcblx0ICAgIHZhciBub2RlID0gb3B0aW9ucy5ub2RlIHx8IF9ub2RlSWQ7XG5cdCAgICBmb3IgKHZhciBuID0gMDsgbiA8IDY7IG4rKykge1xuXHQgICAgICBiW2kgKyBuXSA9IG5vZGVbbl07XG5cdCAgICB9XG5cdFxuXHQgICAgcmV0dXJuIGJ1ZiA/IGJ1ZiA6IHVucGFyc2UoYik7XG5cdCAgfVxuXHRcblx0ICAvLyAqKmB2NCgpYCAtIEdlbmVyYXRlIHJhbmRvbSBVVUlEKipcblx0XG5cdCAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9icm9vZmEvbm9kZS11dWlkIGZvciBBUEkgZGV0YWlsc1xuXHQgIGZ1bmN0aW9uIHY0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG5cdCAgICAvLyBEZXByZWNhdGVkIC0gJ2Zvcm1hdCcgYXJndW1lbnQsIGFzIHN1cHBvcnRlZCBpbiB2MS4yXG5cdCAgICB2YXIgaSA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcblx0XG5cdCAgICBpZiAodHlwZW9mKG9wdGlvbnMpID09ICdzdHJpbmcnKSB7XG5cdCAgICAgIGJ1ZiA9IG9wdGlvbnMgPT0gJ2JpbmFyeScgPyBuZXcgQnVmZmVyQ2xhc3MoMTYpIDogbnVsbDtcblx0ICAgICAgb3B0aW9ucyA9IG51bGw7XG5cdCAgICB9XG5cdCAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XG5cdCAgICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBfcm5nKSgpO1xuXHRcblx0ICAgIC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcblx0ICAgIHJuZHNbNl0gPSAocm5kc1s2XSAmIDB4MGYpIHwgMHg0MDtcblx0ICAgIHJuZHNbOF0gPSAocm5kc1s4XSAmIDB4M2YpIHwgMHg4MDtcblx0XG5cdCAgICAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcblx0ICAgIGlmIChidWYpIHtcblx0ICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDE2OyBpaSsrKSB7XG5cdCAgICAgICAgYnVmW2kgKyBpaV0gPSBybmRzW2lpXTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHRcblx0ICAgIHJldHVybiBidWYgfHwgdW5wYXJzZShybmRzKTtcblx0ICB9XG5cdFxuXHQgIC8vIEV4cG9ydCBwdWJsaWMgQVBJXG5cdCAgdmFyIHV1aWQgPSB2NDtcblx0ICB1dWlkLnYxID0gdjE7XG5cdCAgdXVpZC52NCA9IHY0O1xuXHQgIHV1aWQucGFyc2UgPSBwYXJzZTtcblx0ICB1dWlkLnVucGFyc2UgPSB1bnBhcnNlO1xuXHQgIHV1aWQuQnVmZmVyQ2xhc3MgPSBCdWZmZXJDbGFzcztcblx0XG5cdCAgaWYgKHR5cGVvZihtb2R1bGUpICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdCAgICAvLyBQdWJsaXNoIGFzIG5vZGUuanMgbW9kdWxlXG5cdCAgICBtb2R1bGUuZXhwb3J0cyA9IHV1aWQ7XG5cdCAgfSBlbHNlICBpZiAodHJ1ZSkge1xuXHQgICAgLy8gUHVibGlzaCBhcyBBTUQgbW9kdWxlXG5cdCAgICAhKF9fV0VCUEFDS19BTURfREVGSU5FX1JFU1VMVF9fID0gZnVuY3Rpb24oKSB7cmV0dXJuIHV1aWQ7fS5jYWxsKGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18sIGV4cG9ydHMsIG1vZHVsZSksIF9fV0VCUEFDS19BTURfREVGSU5FX1JFU1VMVF9fICE9PSB1bmRlZmluZWQgJiYgKG1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0FNRF9ERUZJTkVfUkVTVUxUX18pKTtcblx0IFxuXHRcblx0ICB9IGVsc2Uge1xuXHQgICAgLy8gUHVibGlzaCBhcyBnbG9iYWwgKGluIGJyb3dzZXJzKVxuXHQgICAgdmFyIF9wcmV2aW91c1Jvb3QgPSBfZ2xvYmFsLnV1aWQ7XG5cdFxuXHQgICAgLy8gKipgbm9Db25mbGljdCgpYCAtIChicm93c2VyIG9ubHkpIHRvIHJlc2V0IGdsb2JhbCAndXVpZCcgdmFyKipcblx0ICAgIHV1aWQubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgICBfZ2xvYmFsLnV1aWQgPSBfcHJldmlvdXNSb290O1xuXHQgICAgICByZXR1cm4gdXVpZDtcblx0ICAgIH07XG5cdFxuXHQgICAgX2dsb2JhbC51dWlkID0gdXVpZDtcblx0ICB9XG5cdH0pLmNhbGwodGhpcyk7XG5cblxuLyoqKi8gfSxcbi8qIDYzICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cdFxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdCAgdmFsdWU6IHRydWVcblx0fSk7XG5cdHZhciBTVUJTQ1JJUFRJT05TX0JZX1BST1BFUlRZX1BST1RPVFlQRSA9IHtcblx0ICBhZGQ6IGZ1bmN0aW9uIGFkZChfcmVmKSB7XG5cdCAgICB2YXIgcHJvcGVydHkgPSBfcmVmLnByb3BlcnR5O1xuXHQgICAgdmFyIHN1YnNjcmlwdGlvbiA9IF9yZWYuc3Vic2NyaXB0aW9uO1xuXHRcblx0ICAgIHZhciBjdXJyZW50U3Vic2NyaXB0aW9ucyA9IHRoaXMuc3Vic2NyaXB0aW9uc1twcm9wZXJ0eV07XG5cdFxuXHQgICAgaWYgKCFjdXJyZW50U3Vic2NyaXB0aW9ucyB8fCBPYmplY3Qua2V5cyhjdXJyZW50U3Vic2NyaXB0aW9ucykubGVuZ3RoID09PSAwKSB7XG5cdCAgICAgIHRoaXMuc3Vic2NyaXB0aW9uc1twcm9wZXJ0eV0gPSB7fTtcblx0ICAgIH1cblx0XG5cdCAgICAvKiB1c2Vpbmcgb2JqZWN0IGxpa2UgYSBzZXQgaGVyZSAqL1xuXHQgICAgdGhpcy5zdWJzY3JpcHRpb25zW3Byb3BlcnR5XVtzdWJzY3JpcHRpb24udXVpZF0gPSB0cnVlO1xuXHQgIH0sXG5cdFxuXHQgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKF9yZWYyKSB7XG5cdCAgICB2YXIgcHJvcGVydHkgPSBfcmVmMi5wcm9wZXJ0eTtcblx0ICAgIHZhciBzdWJzY3JpcHRpb24gPSBfcmVmMi5zdWJzY3JpcHRpb247XG5cdFxuXHQgICAgdmFyIGN1cnJlbnRTdWJzY3JpcHRpb25zID0gdGhpcy5zdWJzY3JpcHRpb25zW3Byb3BlcnR5XTtcblx0XG5cdCAgICBpZiAoIWN1cnJlbnRTdWJzY3JpcHRpb25zIHx8IE9iamVjdC5rZXlzKGN1cnJlbnRTdWJzY3JpcHRpb25zKS5sZW5ndGggPT09IDApIHtcblx0ICAgICAgdGhpcy5zdWJzY3JpcHRpb25zW3Byb3BlcnR5XSA9IHt9O1xuXHQgICAgfVxuXHRcblx0ICAgIGRlbGV0ZSB0aGlzLnN1YnNjcmlwdGlvbnNbcHJvcGVydHldW3N1YnNjcmlwdGlvbi51dWlkXTtcblx0ICB9XG5cdFxuXHR9O1xuXHRcblx0ZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKCkge1xuXHQgIHZhciBzdWJzY3JpcHRpb25zQnlQcm9wZXJ0eSA9IE9iamVjdC5jcmVhdGUoU1VCU0NSSVBUSU9OU19CWV9QUk9QRVJUWV9QUk9UT1RZUEUpO1xuXHRcblx0ICBzdWJzY3JpcHRpb25zQnlQcm9wZXJ0eS5zdWJzY3JpcHRpb25zID0ge307XG5cdFxuXHQgIHJldHVybiBzdWJzY3JpcHRpb25zQnlQcm9wZXJ0eTtcblx0fTtcblx0XG5cdGV4cG9ydHMuU1VCU0NSSVBUSU9OU19CWV9QUk9QRVJUWV9QUk9UT1RZUEUgPSBTVUJTQ1JJUFRJT05TX0JZX1BST1BFUlRZX1BST1RPVFlQRTtcblxuLyoqKi8gfSxcbi8qIDY0ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cdFxuXHQvKiBzaW5nbGV0b24gb2JqZWN0IHVzZWQgdG8gaG9sZCBzdWJzY3JpcHRpb24gb2JqZWN0cyBieSB0aGVpciBVVUlEICovXG5cdFxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdCAgdmFsdWU6IHRydWVcblx0fSk7XG5cdGV4cG9ydHNbJ2RlZmF1bHQnXSA9IHt9O1xuXHRtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcblxuLyoqKi8gfSxcbi8qIDY1ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cdFxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdCAgdmFsdWU6IHRydWVcblx0fSk7XG5cdFxuXHRleHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoX3JlZikge1xuXHQgIHZhciBzdWJzY3JpcHRpb25VVUlEID0gX3JlZi5zdWJzY3JpcHRpb25VVUlEO1xuXHQgIHZhciBzdWJzY3JpcHRpb25zQnlVVUlEID0gX3JlZi5zdWJzY3JpcHRpb25zQnlVVUlEO1xuXHQgIHZhciBzdWJzY3JpcHRpb25zQnlQcm9wZXJ0eSA9IF9yZWYuc3Vic2NyaXB0aW9uc0J5UHJvcGVydHk7XG5cdFxuXHQgIHZhciBzdWJzY3JpcHRpb24gPSBzdWJzY3JpcHRpb25zQnlVVUlEW3N1YnNjcmlwdGlvblVVSURdO1xuXHRcblx0ICBpZiAoc3Vic2NyaXB0aW9uKSB7XG5cdCAgICAvKiByZW1vdmUgdGhlIHN1YnNjcmlwdGlvbiBmcm9tIHRoZSBzdWJzY3JpcHRpb25zQnlVVUlEIG9iamVjdCAqL1xuXHQgICAgZGVsZXRlIHN1YnNjcmlwdGlvbnNCeVVVSURbc3Vic2NyaXB0aW9uVVVJRF07XG5cdFxuXHQgICAgLyogcmVtb3ZlIHJlZmVyZW5jZXMgdG8gdGhlIHN1YnNjcmlwdGlvbiBmcm9tIGVhY2ggb2YgdGhlIHN1YnNjcmliZWQgcHJvcGVydGllcyAqL1xuXHQgICAgc3Vic2NyaXB0aW9uLnByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHkpIHtcblx0ICAgICAgc3Vic2NyaXB0aW9uc0J5UHJvcGVydHkucmVtb3ZlKHsgcHJvcGVydHk6IHByb3BlcnR5LCBzdWJzY3JpcHRpb246IHN1YnNjcmlwdGlvbiB9KTtcblx0ICAgIH0pO1xuXHQgIH1cblx0fTtcblx0XG5cdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG4vKioqLyB9XG4vKioqKioqLyBdKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbmRsWW5CaFkyczZMeTh2ZDJWaWNHRmpheTlpYjI5MGMzUnlZWEFnT1dNMVptVXdOMkl4TjJGbE9EWmhNR0UzWVRVaUxDSjNaV0p3WVdOck9pOHZMeTR2YW1GMllYTmpjbWx3ZEM5aGNHa3Vhbk1pTENKM1pXSndZV05yT2k4dkx5NHZhbUYyWVhOamNtbHdkQzluWlhSSVlYTm9VR0Z5WVcxekxtcHpJaXdpZDJWaWNHRmphem92THk4dUwycGhkbUZ6WTNKcGNIUXZhR0Z6YUVOb1lXNW5aVWhoYm1Sc1pYSXVhbk1pTENKM1pXSndZV05yT2k4dkx5NHZmaTlzYjJSaGMyZ3ZZWEp5WVhrdmFXNTBaWEp6WldOMGFXOXVMbXB6SWl3aWQyVmljR0ZqYXpvdkx5OHVMMzR2Ykc5a1lYTm9MMmx1ZEdWeWJtRnNMMkpoYzJWSmJtUmxlRTltTG1weklpd2lkMlZpY0dGamF6b3ZMeTh1TDM0dmJHOWtZWE5vTDJsdWRHVnlibUZzTDJsdVpHVjRUMlpPWVU0dWFuTWlMQ0ozWldKd1lXTnJPaTh2THk0dmZpOXNiMlJoYzJndmFXNTBaWEp1WVd3dlkyRmphR1ZKYm1SbGVFOW1MbXB6SWl3aWQyVmljR0ZqYXpvdkx5OHVMMzR2Ykc5a1lYTm9MMnhoYm1jdmFYTlBZbXBsWTNRdWFuTWlMQ0ozWldKd1lXTnJPaTh2THk0dmZpOXNiMlJoYzJndmFXNTBaWEp1WVd3dlkzSmxZWFJsUTJGamFHVXVhbk1pTENKM1pXSndZV05yT2k4dkx5NHZmaTlzYjJSaGMyZ3ZhVzUwWlhKdVlXd3ZVMlYwUTJGamFHVXVhbk1pTENKM1pXSndZV05yT2k4dkx5NHZmaTlzYjJSaGMyZ3ZhVzUwWlhKdVlXd3ZZMkZqYUdWUWRYTm9MbXB6SWl3aWQyVmljR0ZqYXpvdkx5OHVMMzR2Ykc5a1lYTm9MMmx1ZEdWeWJtRnNMMmRsZEU1aGRHbDJaUzVxY3lJc0luZGxZbkJoWTJzNkx5OHZMaTkrTDJ4dlpHRnphQzlzWVc1bkwybHpUbUYwYVhabExtcHpJaXdpZDJWaWNHRmphem92THk4dUwzNHZiRzlrWVhOb0wyeGhibWN2YVhOR2RXNWpkR2x2Ymk1cWN5SXNJbmRsWW5CaFkyczZMeTh2TGk5K0wyeHZaR0Z6YUM5cGJuUmxjbTVoYkM5cGMwOWlhbVZqZEV4cGEyVXVhbk1pTENKM1pXSndZV05yT2k4dkx5NHZmaTlzYjJSaGMyZ3ZhVzUwWlhKdVlXd3ZhWE5CY25KaGVVeHBhMlV1YW5NaUxDSjNaV0p3WVdOck9pOHZMeTR2Zmk5c2IyUmhjMmd2YVc1MFpYSnVZV3d2WjJWMFRHVnVaM1JvTG1weklpd2lkMlZpY0dGamF6b3ZMeTh1TDM0dmJHOWtZWE5vTDJsdWRHVnlibUZzTDJKaGMyVlFjbTl3WlhKMGVTNXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOStMMnh2WkdGemFDOXBiblJsY201aGJDOXBjMHhsYm1kMGFDNXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOStMMnh2WkdGemFDOW1kVzVqZEdsdmJpOXlaWE4wVUdGeVlXMHVhbk1pTENKM1pXSndZV05yT2k4dkx5NHZmaTlzYjJSaGMyZ3ZZWEp5WVhrdlpteGhkSFJsYmk1cWN5SXNJbmRsWW5CaFkyczZMeTh2TGk5K0wyeHZaR0Z6YUM5cGJuUmxjbTVoYkM5aVlYTmxSbXhoZEhSbGJpNXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOStMMnh2WkdGemFDOXBiblJsY201aGJDOWhjbkpoZVZCMWMyZ3Vhbk1pTENKM1pXSndZV05yT2k4dkx5NHZmaTlzYjJSaGMyZ3ZiR0Z1Wnk5cGMwRnlaM1Z0Wlc1MGN5NXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOStMMnh2WkdGemFDOXNZVzVuTDJselFYSnlZWGt1YW5NaUxDSjNaV0p3WVdOck9pOHZMeTR2Zmk5c2IyUmhjMmd2YVc1MFpYSnVZV3d2YVhOSmRHVnlZWFJsWlVOaGJHd3Vhbk1pTENKM1pXSndZV05yT2k4dkx5NHZmaTlzYjJSaGMyZ3ZhVzUwWlhKdVlXd3ZhWE5KYm1SbGVDNXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOXFZWFpoYzJOeWFYQjBMMnRsZVhOWGFYUm9RMmhoYm1kbFpGWmhiSFZsY3k1cWN5SXNJbmRsWW5CaFkyczZMeTh2TGk5K0wyeHZaR0Z6YUM5aGNuSmhlUzkxYm1seGRXVXVhbk1pTENKM1pXSndZV05yT2k4dkx5NHZmaTlzYjJSaGMyZ3ZZWEp5WVhrdmRXNXBjUzVxY3lJc0luZGxZbkJoWTJzNkx5OHZMaTkrTDJ4dlpHRnphQzlwYm5SbGNtNWhiQzlpWVhObFEyRnNiR0poWTJzdWFuTWlMQ0ozWldKd1lXTnJPaTh2THk0dmZpOXNiMlJoYzJndmFXNTBaWEp1WVd3dlltRnpaVTFoZEdOb1pYTXVhbk1pTENKM1pXSndZV05yT2k4dkx5NHZmaTlzYjJSaGMyZ3ZhVzUwWlhKdVlXd3ZZbUZ6WlVselRXRjBZMmd1YW5NaUxDSjNaV0p3WVdOck9pOHZMeTR2Zmk5c2IyUmhjMmd2YVc1MFpYSnVZV3d2WW1GelpVbHpSWEYxWVd3dWFuTWlMQ0ozWldKd1lXTnJPaTh2THk0dmZpOXNiMlJoYzJndmFXNTBaWEp1WVd3dlltRnpaVWx6UlhGMVlXeEVaV1Z3TG1weklpd2lkMlZpY0dGamF6b3ZMeTh1TDM0dmJHOWtZWE5vTDJsdWRHVnlibUZzTDJWeGRXRnNRWEp5WVhsekxtcHpJaXdpZDJWaWNHRmphem92THk4dUwzNHZiRzlrWVhOb0wybHVkR1Z5Ym1Gc0wyRnljbUY1VTI5dFpTNXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOStMMnh2WkdGemFDOXBiblJsY201aGJDOWxjWFZoYkVKNVZHRm5MbXB6SWl3aWQyVmljR0ZqYXpvdkx5OHVMMzR2Ykc5a1lYTm9MMmx1ZEdWeWJtRnNMMlZ4ZFdGc1QySnFaV04wY3k1cWN5SXNJbmRsWW5CaFkyczZMeTh2TGk5K0wyeHZaR0Z6YUM5dlltcGxZM1F2YTJWNWN5NXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOStMMnh2WkdGemFDOXBiblJsY201aGJDOXphR2x0UzJWNWN5NXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOStMMnh2WkdGemFDOXZZbXBsWTNRdmEyVjVjMGx1TG1weklpd2lkMlZpY0dGamF6b3ZMeTh1TDM0dmJHOWtZWE5vTDJ4aGJtY3ZhWE5VZVhCbFpFRnljbUY1TG1weklpd2lkMlZpY0dGamF6b3ZMeTh1TDM0dmJHOWtZWE5vTDJsdWRHVnlibUZzTDNSdlQySnFaV04wTG1weklpd2lkMlZpY0dGamF6b3ZMeTh1TDM0dmJHOWtZWE5vTDJsdWRHVnlibUZzTDJkbGRFMWhkR05vUkdGMFlTNXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOStMMnh2WkdGemFDOXBiblJsY201aGJDOXBjMU4wY21samRFTnZiWEJoY21GaWJHVXVhbk1pTENKM1pXSndZV05yT2k4dkx5NHZmaTlzYjJSaGMyZ3ZiMkpxWldOMEwzQmhhWEp6TG1weklpd2lkMlZpY0dGamF6b3ZMeTh1TDM0dmJHOWtZWE5vTDJsdWRHVnlibUZzTDJKaGMyVk5ZWFJqYUdWelVISnZjR1Z5ZEhrdWFuTWlMQ0ozWldKd1lXTnJPaTh2THk0dmZpOXNiMlJoYzJndmFXNTBaWEp1WVd3dlltRnpaVWRsZEM1cWN5SXNJbmRsWW5CaFkyczZMeTh2TGk5K0wyeHZaR0Z6YUM5cGJuUmxjbTVoYkM5aVlYTmxVMnhwWTJVdWFuTWlMQ0ozWldKd1lXTnJPaTh2THk0dmZpOXNiMlJoYzJndmFXNTBaWEp1WVd3dmFYTkxaWGt1YW5NaUxDSjNaV0p3WVdOck9pOHZMeTR2Zmk5c2IyUmhjMmd2WVhKeVlYa3ZiR0Z6ZEM1cWN5SXNJbmRsWW5CaFkyczZMeTh2TGk5K0wyeHZaR0Z6YUM5cGJuUmxjbTVoYkM5MGIxQmhkR2d1YW5NaUxDSjNaV0p3WVdOck9pOHZMeTR2Zmk5c2IyUmhjMmd2YVc1MFpYSnVZV3d2WW1GelpWUnZVM1J5YVc1bkxtcHpJaXdpZDJWaWNHRmphem92THk4dUwzNHZiRzlrWVhOb0wybHVkR1Z5Ym1Gc0wySnBibVJEWVd4c1ltRmpheTVxY3lJc0luZGxZbkJoWTJzNkx5OHZMaTkrTDJ4dlpHRnphQzkxZEdsc2FYUjVMMmxrWlc1MGFYUjVMbXB6SWl3aWQyVmljR0ZqYXpvdkx5OHVMMzR2Ykc5a1lYTm9MM1YwYVd4cGRIa3ZjSEp2Y0dWeWRIa3Vhbk1pTENKM1pXSndZV05yT2k4dkx5NHZmaTlzYjJSaGMyZ3ZhVzUwWlhKdVlXd3ZZbUZ6WlZCeWIzQmxjblI1UkdWbGNDNXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOStMMnh2WkdGemFDOXBiblJsY201aGJDOWlZWE5sVlc1cGNTNXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOStMMnh2WkdGemFDOXBiblJsY201aGJDOXpiM0owWldSVmJtbHhMbXB6SWl3aWQyVmljR0ZqYXpvdkx5OHVMMnBoZG1GelkzSnBjSFF2YzNWaWMyTnlhV0psTG1weklpd2lkMlZpY0dGamF6b3ZMeTh1TDJwaGRtRnpZM0pwY0hRdlUzVmljMk55YVhCMGFXOXVMbXB6SWl3aWQyVmljR0ZqYXpvdkx5OHVMMzR2Ym05a1pTMTFkV2xrTDNWMWFXUXVhbk1pTENKM1pXSndZV05yT2k4dkx5NHZhbUYyWVhOamNtbHdkQzl6ZFdKelkzSnBjSFJwYjI1elFubFFjbTl3WlhKMGVTNXFjeUlzSW5kbFluQmhZMnM2THk4dkxpOXFZWFpoYzJOeWFYQjBMM04xWW5OamNtbHdkR2x2Ym5OQ2VWVlZTVVF1YW5NaUxDSjNaV0p3WVdOck9pOHZMeTR2YW1GMllYTmpjbWx3ZEM5MWJuTjFZbk5qY21saVpTNXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPenRCUVVGQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJMSFZDUVVGbE8wRkJRMlk3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN096dEJRVWRCTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHM3UVVGRlFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN096czdPenM3UVVOMFEwRXNZVUZCV1N4RFFVRkRPenM3T3pzN096dHZSRUZGZFVJc1EwRkJNRUk3T3pzN2QwUkJRekZDTEVOQlFUaENPenM3T3pSRVFVTTVRaXhGUVVGclF6czdPenRuUkVGRGJFTXNSVUZCYzBJN096czdiVVJCUTNSQ0xFVkJRWGxDT3pzN096aEVRVU42UWl4RlFVRnZRenM3T3pzd1JFRkRjRU1zUlVGQlowTTdPenM3YTBSQlEyaERMRVZCUVhkQ096czdPMEZCUlRWRUxFdEJRVWtzZFVKQlFYVkNMRWRCUVVjc2NVUkJRWGxDTEVOQlFVTTdPenR6UWtGSGVrTTdRVUZEWWl4MVFrRkJiMElzYTBOQlFVYzdRVUZEY2tJc1UwRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFhRVUZYTEVWQlFVVTdRVUZEY2tJc1YwRkJTU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzBGQlExb3NWMEZCU1N4RFFVRkRMRmRCUVZjc1IwRkJSeXhKUVVGSkxFTkJRVU03VFVGRGVrSTdTVUZEUmp0QlFVTkVMRTlCUVVrc2EwSkJRVWM3UVVGRFRDeFpRVUZQTEUxQlFVMHNRMEZCUXl4blFrRkJaMElzUTBGQlF5eFpRVUZaTEVWQlFVVXNaVUZCU3l4RlFVRkpPMEZCUTNCRUxIRkVRVUZyUWp0QlFVTm9RaXhqUVVGTExFVkJRVXdzUzBGQlN6dEJRVU5NTEhOQ1FVRmhPMEZCUTJJc09FSkJRWEZDTzBGQlEzSkNMR2REUVVGMVFpeEZRVUYyUWl4MVFrRkJkVUk3UVVGRGRrSXNORUpCUVcxQ08xRkJRM0JDTEVOQlFVTXNRMEZCUXp0TlFVTktMRU5CUVVNc1EwRkJRenRKUVVOS08wRkJRMFFzV1VGQlV5eHhRa0ZCUXl4VlFVRlZMRVZCUVVVc1VVRkJVU3hGUVVGRk8wRkJRemxDTEZOQlFVa3NRMEZCUXl4dlFrRkJiMElzUlVGQlJTeERRVUZET3p0QlFVVTFRaXhaUVVGUExITkRRVUZWTzBGQlEyWXNiVUpCUVZrN1FVRkRXaXd3UWtGQmJVSTdRVUZEYmtJc09FSkJRWFZDTEVWQlFYWkNMSFZDUVVGMVFqdEJRVU4yUWl4cFFrRkJWU3hGUVVGV0xGVkJRVlU3UVVGRFZpeGxRVUZSTEVWQlFWSXNVVUZCVVR0TlFVTlVMRU5CUVVNc1EwRkJRenRKUVVOS08wRkJRMFFzWTBGQlZ5eDFRa0ZCUXl4blFrRkJaMElzUlVGQlJUdEJRVU0xUWl3MlEwRkJXVHRCUVVOV0xIVkNRVUZuUWl4RlFVRm9RaXhuUWtGQlowSTdRVUZEYUVJc01FSkJRVzFDTzBGQlEyNUNMRGhDUVVGMVFpeEZRVUYyUWl4MVFrRkJkVUk3VFVGRGVFSXNRMEZCUXl4RFFVRkRPMGxCUTBvN1JVRkRSanM3T3pzN096dEJRMnhFUkN4aFFVRlpMRU5CUVVNN096czdPenM3TzNOQ1FVVkZMRlZCUVVNc1IwRkJSeXhGUVVGTE8yOUNRVU5JTEVkQlFVY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhEUVVGRE96czdPMDlCUVRWQ0xFTkJRVU03VDBGQlJTeFBRVUZQT3p0QlFVVm1MRlZCUVU4c1IwRkJSeXhQUVVGUExFbEJRVWtzUlVGQlJTeERRVUZETzBGQlEzaENMRlZCUVU4c1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1ZVRkJReXhKUVVGSkxFVkJRVVVzV1VGQldTeEZRVUZMT3l0Q1FVTndReXhaUVVGWkxFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXpzN096dFRRVUZ5UXl4SFFVRkhPMU5CUVVVc1MwRkJTenM3UVVGRlppeFRRVUZKTEV0QlFVc3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlF6dEJRVU42UWl4WFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJUdEJRVU5tTEdGQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU03VVVGRGJrSXNUVUZCVFR0QlFVTk1MR0ZCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eFZRVUZWTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1VVRkRMMEk3VFVGRFJpeE5RVUZOTEVsQlFVa3NSMEZCUnl4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFVkJRVVU3UVVGRGVrSXNWMEZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF6dE5RVU5zUWpzN1FVRkZSQ3haUVVGUExFbEJRVWtzUTBGQlF6dEpRVU5pTEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN1JVRkRVanM3T3pzN096czdRVU55UWtRc1lVRkJXU3hEUVVGRE96czdPenM3T3p0dlJFRkZXU3hEUVVFeVFqczdPenNyUTBGRGFFTXNSVUZCYzBJN096czdPenM3T3pzN2MwSkJUek5DTEZWQlFVTXNTVUZCTWtZc1JVRkJTenRQUVVFdlJpeGhRVUZoTEVkQlFXUXNTVUZCTWtZc1EwRkJNVVlzWVVGQllUdFBRVUZGTEhWQ1FVRjFRaXhIUVVGMlF5eEpRVUV5Uml4RFFVRXpSU3gxUWtGQmRVSTdUMEZCUlN4dFFrRkJiVUlzUjBGQk5VUXNTVUZCTWtZc1EwRkJiRVFzYlVKQlFXMUNPMDlCUVVVc2NVSkJRWEZDTEVkQlFXNUdMRWxCUVRKR0xFTkJRVGRDTEhGQ1FVRnhRanRQUVVGRkxFdEJRVXNzUjBGQk1VWXNTVUZCTWtZc1EwRkJUaXhMUVVGTE96czdPMEZCUjNoSExFOUJRVWtzVTBGQlV5eEhRVUZITEdGQlFXRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03UVVGRE5VTXNUMEZCU1N4VFFVRlRMRWRCUVVjc1lVRkJZU3hEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXpzN1FVRkZOVU1zVDBGQlNTeGpRVUZqTEVkQlFVY3NUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXgxUWtGQmRVSXNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJRenM3TzBGQlIzaEZMRTlCUVVrc1pVRkJaU3hIUVVGSExIRkNRVUZ4UWl4RFFVRkRMRk5CUVZNc1JVRkJSU3hUUVVGVExFTkJRVU1zUTBGQlF6czdRVUZGYkVVc1QwRkJTU3gzUWtGQmQwSXNSMEZCUnl3d1EwRkJZU3hsUVVGbExFVkJRVVVzWTBGQll5eERRVUZETEVOQlFVTTdPenM3TzBGQlN6ZEZMRTlCUVVrc2FVSkJRV2xDTEVkQlFVY3NkMEpCUVhkQ0xFTkJRVU1zUjBGQlJ5eERRVUZETEdGQlFVY3NSVUZCU1R0QlFVTXhSQ3haUVVGUExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNkVUpCUVhWQ0xFTkJRVU1zWVVGQllTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkRhRVVzUTBGQlF5eERRVUZET3p0QlFVVklMRzlDUVVGcFFpeEhRVUZITERCRFFVRlBMSEZEUVVGUkxHbENRVUZwUWl4RFFVRkRMRU5CUVVNc1EwRkJRenM3T3p0QlFVbDJSQ3hQUVVGSkxHRkJRV0VzUjBGQlJ5eHBRa0ZCYVVJc1EwRkJReXhIUVVGSExFTkJRVU1zTUVKQlFXZENPMWxCUVVrc2JVSkJRVzFDTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03U1VGQlFTeERRVUZETEVOQlFVTTdPMEZCUlhKSExHZENRVUZoTEVOQlFVTXNUMEZCVHl4RFFVRkRMSE5DUVVGWkxFVkJRVWs3UVVGQlJTeHBRa0ZCV1N4RFFVRkRMRkZCUVZFc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dEpRVUZGTEVOQlFVTXNRMEZCUXp0RlFVTTVSVHM3T3pzN096czdRVU55UTBRN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRXNXVUZCVnl4VFFVRlRPMEZCUTNCQ0xHTkJRV0VzVFVGQlRUdEJRVU51UWp0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVzUlVGQlF6czdRVUZGUkRzN096czdPenRCUTNwRVFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQkxGbEJRVmNzVFVGQlRUdEJRVU5xUWl4WlFVRlhMRVZCUVVVN1FVRkRZaXhaUVVGWExFOUJRVTg3UVVGRGJFSXNZMEZCWVN4UFFVRlBPMEZCUTNCQ08wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk96czdPenM3TzBGRE1VSkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVzV1VGQlZ5eE5RVUZOTzBGQlEycENMRmxCUVZjc1QwRkJUenRCUVVOc1FpeFpRVUZYTEZGQlFWRTdRVUZEYmtJc1kwRkJZU3hQUVVGUE8wRkJRM0JDTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3T3pzN096czdRVU4wUWtFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJMRmxCUVZjc1QwRkJUenRCUVVOc1FpeFpRVUZYTEVWQlFVVTdRVUZEWWl4alFVRmhMRTlCUVU4N1FVRkRjRUk3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHM3UVVGRlFUczdPenM3T3p0QlEyeENRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJMRmxCUVZjc1JVRkJSVHRCUVVOaUxHTkJRV0VzVVVGQlVUdEJRVU55UWp0QlFVTkJPMEZCUTBFc2FVSkJRV2RDTzBGQlEyaENPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdPenM3T3pzN1FVTXpRa0U3UVVGRFFUczdRVUZGUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU3haUVVGWExFMUJRVTA3UVVGRGFrSXNZMEZCWVN4WlFVRlpPMEZCUTNwQ08wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPenM3T3pzN096dEJRM0JDUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRXNXVUZCVnl4TlFVRk5PMEZCUTJwQ08wRkJRMEU3UVVGRFFUczdRVUZGUVN4blFrRkJaVHRCUVVObU8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN08wRkJSVUU3T3pzN096czdPMEZETlVKQk96dEJRVVZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQkxGbEJRVmNzUlVGQlJUdEJRVU5pTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU3hKUVVGSE8wRkJRMGc3UVVGRFFUdEJRVU5CT3p0QlFVVkJPenM3T3pzN08wRkRia0pCT3p0QlFVVkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVzV1VGQlZ5eFBRVUZQTzBGQlEyeENMRmxCUVZjc1QwRkJUenRCUVVOc1FpeGpRVUZoTEVWQlFVVTdRVUZEWmp0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCT3pzN096czdPMEZEWmtFN1FVRkRRVHM3UVVGRlFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUczdRVUZGUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFTdzBSRUZCTWtRN1FVRkRNMFE3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTeFpRVUZYTEVWQlFVVTdRVUZEWWl4alFVRmhMRkZCUVZFN1FVRkRja0k3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUczdPenM3T3p0QlF5OURRVHM3UVVGRlFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVN4WlFVRlhMRVZCUVVVN1FVRkRZaXhqUVVGaExGRkJRVkU3UVVGRGNrSTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUczdPenM3T3p0QlEzSkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTEZsQlFWY3NSVUZCUlR0QlFVTmlMR05CUVdFc1VVRkJVVHRCUVVOeVFqdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHM3T3pzN096dEJRMWhCTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTeFpRVUZYTEVWQlFVVTdRVUZEWWl4alFVRmhMRkZCUVZFN1FVRkRja0k3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN096czdPenM3UVVOa1FUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTEZsQlFWY3NUMEZCVHp0QlFVTnNRaXhqUVVGaExFVkJRVVU3UVVGRFpqdEJRVU5CT3p0QlFVVkJPenM3T3pzN08wRkRaRUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVN4WlFVRlhMRTlCUVU4N1FVRkRiRUlzWTBGQllTeFRRVUZUTzBGQlEzUkNPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVUZGUVRzN096czdPenRCUTJKQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRXNXVUZCVnl4RlFVRkZPMEZCUTJJc1kwRkJZU3hSUVVGUk8wRkJRM0pDTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk96czdPenM3TzBGRGJrSkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVN4WlFVRlhMRk5CUVZNN1FVRkRjRUlzV1VGQlZ5eFBRVUZQTzBGQlEyeENMR05CUVdFc1UwRkJVenRCUVVOMFFqdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFc1MwRkJTVHRCUVVOS08wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHM3T3pzN096dEJRM3BFUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFc1dVRkJWeXhOUVVGTk8wRkJRMnBDTEZsQlFWY3NVVUZCVVR0QlFVTnVRaXhoUVVGWkxFOUJRVTg3UVVGRGJrSXNZMEZCWVN4TlFVRk5PMEZCUTI1Q08wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk96czdPenM3TzBGREwwSkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQkxGbEJRVmNzVFVGQlRUdEJRVU5xUWl4WlFVRlhMRkZCUVZFN1FVRkRia0lzV1VGQlZ5eFJRVUZSTzBGQlEyNUNMRmxCUVZjc1RVRkJUVHRCUVVOcVFpeGpRVUZoTEUxQlFVMDdRVUZEYmtJN1FVRkRRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVN4UlFVRlBPMEZCUTFBN1FVRkRRVHRCUVVOQkxFMUJRVXM3UVVGRFREdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk96czdPenM3TzBGRGVFTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVzV1VGQlZ5eE5RVUZOTzBGQlEycENMRmxCUVZjc1RVRkJUVHRCUVVOcVFpeGpRVUZoTEUxQlFVMDdRVUZEYmtJN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCT3pzN096czdPMEZEYmtKQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRXNXVUZCVnl4RlFVRkZPMEZCUTJJc1kwRkJZU3hSUVVGUk8wRkJRM0pDTzBGQlEwRTdRVUZEUVN3NFFrRkJOa0lzYTBKQlFXdENMRVZCUVVVN1FVRkRha1E3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCT3pzN096czdPMEZEYWtOQk8wRkJRMEU3UVVGRFFUczdRVUZGUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTEZsQlFWY3NSVUZCUlR0QlFVTmlMR05CUVdFc1VVRkJVVHRCUVVOeVFqdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFc01FSkJRWGxDTEd0Q1FVRnJRaXhGUVVGRk8wRkJRemRETzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3T3pzN096czdRVU4yUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFc1dVRkJWeXhGUVVGRk8wRkJRMklzV1VGQlZ5eEZRVUZGTzBGQlEySXNXVUZCVnl4RlFVRkZPMEZCUTJJc1kwRkJZU3hSUVVGUk8wRkJRM0pDTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3T3pzN096czdRVU16UWtFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRXNXVUZCVnl4RlFVRkZPMEZCUTJJc1dVRkJWeXhQUVVGUE8wRkJRMnhDTEdOQlFXRXNVVUZCVVR0QlFVTnlRanRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN096czdPenM3UVVOMlFrRXNZVUZCV1N4RFFVRkRPenM3T3pzN096czRRMEZGVFN4RlFVRnhRanM3T3p0elFrRkZla0lzVlVGQlF5eFRRVUZUTEVWQlFVVXNVMEZCVXl4RlFVRkxPMEZCUTNaRExFOUJRVWtzVDBGQlR5eEhRVUZITEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03UVVGRGNrTXNUMEZCU1N4UFFVRlBMRWRCUVVjc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXpzN1FVRkZja01zVDBGQlNTeFBRVUZQTEVkQlFVY3NiME5CUVU4c1QwRkJUeXhEUVVGRExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPenRCUVVVNVF5eFZRVUZQTEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1lVRkJSeXhGUVVGSk8wRkJRek5DTEZOQlFVa3NVVUZCVVN4SFFVRkhMRk5CUVZNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dEJRVU01UWl4VFFVRkpMRkZCUVZFc1IwRkJSeXhUUVVGVExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdPenRCUVVjNVFpeFRRVUZKTEZGQlFWRXNTMEZCU3l4UlFVRlJMRWxCUVVrc1VVRkJVU3hMUVVGTExGRkJRVkVzUlVGQlJUczdRVUZGYkVRc1kwRkJUeXhMUVVGTExFTkJRVU03VFVGRFpEczdRVUZGUkN4WlFVRlBMRkZCUVZFc1MwRkJTeXhSUVVGUkxFTkJRVU03U1VGRE9VSXNRMEZCUXl4RFFVRkRPMFZCUTBvN096czdPenM3TzBGRGRFSkVPenM3T3pzN08wRkRRVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVN4WlFVRlhMRTFCUVUwN1FVRkRha0lzV1VGQlZ5eFJRVUZSTzBGQlEyNUNMRmxCUVZjc2RVSkJRWFZDTzBGQlEyeERMRmxCUVZjc1JVRkJSVHRCUVVOaUxHTkJRV0VzVFVGQlRUdEJRVU51UWp0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU3hMUVVGSk8wRkJRMG83UVVGRFFUdEJRVU5CTzBGQlEwRXNZVUZCV1N4VFFVRlRMRWRCUVVjc1UwRkJVeXhIUVVGSExGTkJRVk03UVVGRE4wTXNXVUZCVnl4VFFVRlRMRWRCUVVjc1UwRkJVenRCUVVOb1F6dEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUczdPenM3T3p0QlEzUkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTeFpRVUZYTEVWQlFVVTdRVUZEWWl4WlFVRlhMRVZCUVVVN1FVRkRZaXhaUVVGWExFOUJRVTg3UVVGRGJFSXNZMEZCWVN4VFFVRlRPMEZCUTNSQ08wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUczdPenM3T3p0QlEyeERRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU3haUVVGWExFOUJRVTg3UVVGRGJFSXNZMEZCWVN4VFFVRlRPMEZCUTNSQ08wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCT3pzN096czdPMEZETjBKQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQkxGbEJRVmNzVDBGQlR6dEJRVU5zUWl4WlFVRlhMRTFCUVUwN1FVRkRha0lzV1VGQlZ5eFRRVUZUTzBGQlEzQkNMR05CUVdFc1VVRkJVVHRCUVVOeVFqdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJMRTFCUVVzN1FVRkRURHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk96czdPenM3TzBGRGJrUkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFc1dVRkJWeXhGUVVGRk8wRkJRMklzV1VGQlZ5eEZRVUZGTzBGQlEySXNXVUZCVnl4VFFVRlRPMEZCUTNCQ0xGbEJRVmNzVVVGQlVUdEJRVU51UWl4WlFVRlhMRTFCUVUwN1FVRkRha0lzV1VGQlZ5eE5RVUZOTzBGQlEycENMR05CUVdFc1VVRkJVVHRCUVVOeVFqdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVUZGUVRzN096czdPenRCUXpOQ1FUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQkxGbEJRVmNzVDBGQlR6dEJRVU5zUWl4WlFVRlhMRTlCUVU4N1FVRkRiRUlzV1VGQlZ5eFRRVUZUTzBGQlEzQkNMRmxCUVZjc1UwRkJVenRCUVVOd1FpeFpRVUZYTEZGQlFWRTdRVUZEYmtJc1dVRkJWeXhOUVVGTk8wRkJRMnBDTEZsQlFWY3NUVUZCVFR0QlFVTnFRaXhqUVVGaExGRkJRVkU3UVVGRGNrSTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFc1RVRkJTenRCUVVOTU8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFc1RVRkJTenRCUVVOTU8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdPMEZCUlVFN1FVRkRRVHM3UVVGRlFUdEJRVU5CT3p0QlFVVkJPenM3T3pzN08wRkRja2RCT3p0QlFVVkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTeFpRVUZYTEUxQlFVMDdRVUZEYWtJc1dVRkJWeXhOUVVGTk8wRkJRMnBDTEZsQlFWY3NVMEZCVXp0QlFVTndRaXhaUVVGWExGTkJRVk03UVVGRGNFSXNXVUZCVnl4UlFVRlJPMEZCUTI1Q0xGbEJRVmNzVFVGQlRUdEJRVU5xUWl4WlFVRlhMRTFCUVUwN1FVRkRha0lzWTBGQllTeFJRVUZSTzBGQlEzSkNPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJMRmxCUVZjN1FVRkRXRHRCUVVOQk8wRkJRMEVzVFVGQlN6dEJRVU5NTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3T3pzN096czdRVU5zUkVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTEZsQlFWY3NUVUZCVFR0QlFVTnFRaXhaUVVGWExGTkJRVk03UVVGRGNFSXNZMEZCWVN4UlFVRlJPMEZCUTNKQ08wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN096czdPenM3UVVOMFFrRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTEZsQlFWY3NUMEZCVHp0QlFVTnNRaXhaUVVGWExFOUJRVTg3UVVGRGJFSXNXVUZCVnl4UFFVRlBPMEZCUTJ4Q0xHTkJRV0VzVVVGQlVUdEJRVU55UWp0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk96czdPenM3TzBGREwwTkJPenRCUVVWQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRXNXVUZCVnl4UFFVRlBPMEZCUTJ4Q0xGbEJRVmNzVDBGQlR6dEJRVU5zUWl4WlFVRlhMRk5CUVZNN1FVRkRjRUlzV1VGQlZ5eFRRVUZUTzBGQlEzQkNMRmxCUVZjc1VVRkJVVHRCUVVOdVFpeFpRVUZYTEUxQlFVMDdRVUZEYWtJc1dVRkJWeXhOUVVGTk8wRkJRMnBDTEdOQlFXRXNVVUZCVVR0QlFVTnlRanRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCT3pzN096czdPMEZEYkVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTeFpRVUZYTEU5QlFVODdRVUZEYkVJc1kwRkJZU3hOUVVGTk8wRkJRMjVDTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3T3pzN096czdRVU0xUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVUZGUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQkxGbEJRVmNzVDBGQlR6dEJRVU5zUWl4alFVRmhMRTFCUVUwN1FVRkRia0k3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHM3T3pzN096dEJRM2hEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVzV1VGQlZ5eFBRVUZQTzBGQlEyeENMR05CUVdFc1RVRkJUVHRCUVVOdVFqdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3T3pzN096czdRVU12UkVFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQkxGbEJRVmNzUlVGQlJUdEJRVU5pTEdOQlFXRXNVVUZCVVR0QlFVTnlRanRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCT3pzN096czdPMEZEZWtWQk96dEJRVVZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFc1dVRkJWeXhGUVVGRk8wRkJRMklzWTBGQllTeFBRVUZQTzBGQlEzQkNPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCT3pzN096czdPMEZEWWtFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJMRmxCUVZjc1QwRkJUenRCUVVOc1FpeGpRVUZoTEUxQlFVMDdRVUZEYmtJN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUczdPenM3T3p0QlEzQkNRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJMRmxCUVZjc1JVRkJSVHRCUVVOaUxHTkJRV0VzVVVGQlVUdEJRVU55UWp0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCT3pzN096czdPMEZEWkVFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQkxGbEJRVmNzVDBGQlR6dEJRVU5zUWl4alFVRmhMRTFCUVUwN1FVRkRia0k3UVVGRFFUdEJRVU5CTEdGQlFWa3NNa0pCUVRKQ08wRkJRM1pETzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVUZGUVRzN096czdPenRCUTJoRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU3haUVVGWExFOUJRVTg3UVVGRGJFSXNXVUZCVnl4RlFVRkZPMEZCUTJJc1kwRkJZU3hUUVVGVE8wRkJRM1JDTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVUZGUVRzN096czdPenRCUXpWRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVzV1VGQlZ5eFBRVUZQTzBGQlEyeENMRmxCUVZjc1RVRkJUVHRCUVVOcVFpeFpRVUZYTEU5QlFVODdRVUZEYkVJc1kwRkJZU3hGUVVGRk8wRkJRMlk3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUczdPenM3T3p0QlF6VkNRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTEZsQlFWY3NUVUZCVFR0QlFVTnFRaXhaUVVGWExFOUJRVTg3UVVGRGJFSXNXVUZCVnl4UFFVRlBPMEZCUTJ4Q0xHTkJRV0VzVFVGQlRUdEJRVU51UWp0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdPenM3T3pzN1FVTXZRa0U3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVN4WlFVRlhMRVZCUVVVN1FVRkRZaXhaUVVGWExFOUJRVTg3UVVGRGJFSXNZMEZCWVN4UlFVRlJPMEZCUTNKQ08wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVUZGUVRzN096czdPenRCUXpOQ1FUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU3haUVVGWExFMUJRVTA3UVVGRGFrSXNZMEZCWVN4RlFVRkZPMEZCUTJZN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk96czdPenM3TzBGRGJFSkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUczdRVUZGUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRXNXVUZCVnl4RlFVRkZPMEZCUTJJc1kwRkJZU3hOUVVGTk8wRkJRMjVDTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTeEpRVUZITzBGQlEwZzdRVUZEUVRzN1FVRkZRVHM3T3pzN096dEJRek5DUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVzV1VGQlZ5eEZRVUZGTzBGQlEySXNZMEZCWVN4UFFVRlBPMEZCUTNCQ08wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPenM3T3pzN08wRkRXa0U3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQkxGbEJRVmNzVTBGQlV6dEJRVU53UWl4WlFVRlhMRVZCUVVVN1FVRkRZaXhaUVVGWExFOUJRVTg3UVVGRGJFSXNZMEZCWVN4VFFVRlRPMEZCUTNSQ08wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3T3pzN096czdRVU4wUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRXNXVUZCVnl4RlFVRkZPMEZCUTJJc1kwRkJZU3hGUVVGRk8wRkJRMlk3UVVGRFFUdEJRVU5CTEd0Q1FVRnBRanRCUVVOcVFqdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUczdPenM3T3p0QlEyNUNRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTeFpRVUZYTEdGQlFXRTdRVUZEZUVJc1kwRkJZU3hUUVVGVE8wRkJRM1JDTzBGQlEwRTdRVUZEUVR0QlFVTkJMRTlCUVUwc1QwRkJUeXhQUVVGUExGTkJRVk1zUlVGQlJTeEZRVUZGTzBGQlEycERMRTlCUVUwc1QwRkJUeXhQUVVGUExGTkJRVk1zUlVGQlJUdEJRVU12UWp0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk96czdPenM3TzBGRE9VSkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVN4WlFVRlhMR0ZCUVdFN1FVRkRlRUlzWTBGQllTeFRRVUZUTzBGQlEzUkNPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN096czdPenM3UVVOc1FrRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQkxGbEJRVmNzVFVGQlRUdEJRVU5xUWl4WlFVRlhMRk5CUVZNN1FVRkRjRUlzWTBGQllTeE5RVUZOTzBGQlEyNUNPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFTeEpRVUZITzBGQlEwZzdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk96czdPenM3TzBGRE0wUkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTeFpRVUZYTEUxQlFVMDdRVUZEYWtJc1dVRkJWeXhUUVVGVE8wRkJRM0JDTEdOQlFXRXNUVUZCVFR0QlFVTnVRanRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGQlJVRTdPenM3T3pzN1FVTTFRa0VzWVVGQldTeERRVUZET3pzN096czdjMEpCUlVVc1ZVRkJReXhKUVVGclJpeEZRVUZMTzA5QlFYUkdMRmxCUVZrc1IwRkJZaXhKUVVGclJpeERRVUZxUml4WlFVRlpPMDlCUVVVc2JVSkJRVzFDTEVkQlFXeERMRWxCUVd0R0xFTkJRVzVGTEcxQ1FVRnRRanRQUVVGRkxIVkNRVUYxUWl4SFFVRXpSQ3hKUVVGclJpeERRVUU1UXl4MVFrRkJkVUk3VDBGQlJTeFZRVUZWTEVkQlFYWkZMRWxCUVd0R0xFTkJRWEpDTEZWQlFWVTdUMEZCUlN4UlFVRlJMRWRCUVdwR0xFbEJRV3RHTEVOQlFWUXNVVUZCVVRzN08wRkJSUzlHTEU5QlFVa3NXVUZCV1N4SFFVRkhMRmxCUVZrc1EwRkJReXhGUVVGRExGVkJRVlVzUlVGQlZpeFZRVUZWTEVWQlFVVXNVVUZCVVN4RlFVRlNMRkZCUVZFc1JVRkJReXhEUVVGRExFTkJRVU03T3p0QlFVZDRSQ3h6UWtGQmJVSXNRMEZCUXl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzV1VGQldTeERRVUZET3pzN08wRkJTWFJFTEdGQlFWVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJReXhSUVVGUkxFVkJRVXM3UVVGREwwSXNORUpCUVhWQ0xFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVTXNVVUZCVVN4RlFVRlNMRkZCUVZFc1JVRkJSU3haUVVGWkxFVkJRVm9zV1VGQldTeEZRVUZETEVOQlFVTXNRMEZCUXp0SlFVTjJSQ3hEUVVGRExFTkJRVU03TzBGQlJVZ3NWVUZCVHl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRE8wVkJRekZDT3pzN096czdPenRCUTJoQ1JDeGhRVUZaTEVOQlFVTTdPenM3T3pzN08zRkRRVVZKTEVWQlFWYzdPenM3UVVGRk5VSXNTMEZCVFN4elFrRkJjMElzUjBGQlJ6dEJRVU0zUWl4aFFVRlZMRVZCUVVVc1JVRkJSVHRCUVVOa0xGZEJRVkVzUlVGQlJTeHZRa0ZCV1N4RlFVRkZPMEZCUTNoQ0xFOUJRVWtzUlVGQlJTeEpRVUZKTzBWQlExZ3NRMEZCUXpzN2MwSkJSV0VzVlVGQlF5eEpRVUZ6UWl4RlFVRkxPMDlCUVRGQ0xGVkJRVlVzUjBGQldDeEpRVUZ6UWl4RFFVRnlRaXhWUVVGVk8wOUJRVVVzVVVGQlVTeEhRVUZ5UWl4SlFVRnpRaXhEUVVGVUxGRkJRVkU3TzBGQlEyNURMRTlCUVVrc1dVRkJXU3hIUVVGSExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNjMEpCUVhOQ0xFTkJRVU1zUTBGQlF6czdRVUZGZWtRc1pVRkJXU3hEUVVGRExGVkJRVlVzUjBGQlJ5eFZRVUZWTEVOQlFVTTdRVUZEY2tNc1pVRkJXU3hEUVVGRExGRkJRVkVzUjBGQlJ5eFJRVUZSTEVOQlFVTTdRVUZEYWtNc1pVRkJXU3hEUVVGRExFbEJRVWtzUjBGQlJ5eHpRa0ZCU3l4RlFVRkZMRVZCUVVVc1EwRkJRenM3UVVGRk9VSXNWVUZCVHl4WlFVRlpMRU5CUVVNN1JVRkRja0k3TzFOQlJWRXNjMEpCUVhOQ0xFZEJRWFJDTEhOQ1FVRnpRaXhET3pzN096czdRVU53UWk5Q08wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRXNhVU5CUVdkRE8wRkJRMmhETEUxQlFVczdRVUZEVERzN1FVRkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQkxIbENRVUYzUWl4UlFVRlJPMEZCUTJoRE8wRkJRMEU3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRU3hyUWtGQmFVSXNVMEZCVXp0QlFVTXhRanRCUVVOQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEVzZFVOQlFYTkRMRVZCUVVVN1FVRkRlRU1zY1VKQlFXOUNPMEZCUTNCQ08wRkJRMEU3UVVGRFFTeE5RVUZMT3p0QlFVVk1PMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk8wRkJRMEU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN08wRkJSVUU3TzBGQlJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk96dEJRVVZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQkxITkRRVUZ4UXp0QlFVTnlRenM3UVVGRlFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTEc5Q1FVRnRRaXhQUVVGUE8wRkJRekZDTzBGQlEwRTdPMEZCUlVFN1FVRkRRVHM3UVVGRlFUczdRVUZGUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVGRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUVVWQk96dEJRVVZCTzBGQlEwRTdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEVzZFVKQlFYTkNMRk5CUVZNN1FVRkRMMEk3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkJSVUU3UVVGRFFUdEJRVU5CTzBGQlEwRXNTVUZCUnp0QlFVTklPMEZCUTBFc2JVUkJRWFZDTEdGQlFXRTdPenRCUVVkd1F5eEpRVUZITzBGQlEwZzdRVUZEUVRzN1FVRkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlFVVkJPMEZCUTBFN1FVRkRRU3hGUVVGRE96czdPenM3TzBGRGRGQkVMR0ZCUVZrc1EwRkJRenM3T3pzN1FVRkZZaXhMUVVGTkxHMURRVUZ0UXl4SFFVRkhPMEZCUXpGRExFMUJRVWNzWlVGQlF5eEpRVUYzUWl4RlFVRkZPMU5CUVhwQ0xGRkJRVkVzUjBGQlZDeEpRVUYzUWl4RFFVRjJRaXhSUVVGUk8xTkJRVVVzV1VGQldTeEhRVUYyUWl4SlFVRjNRaXhEUVVGaUxGbEJRVms3TzBGQlEzcENMRk5CUVVrc2IwSkJRVzlDTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6czdRVUZGZUVRc1UwRkJTU3hEUVVGRExHOUNRVUZ2UWl4SlFVRkpMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zYjBKQlFXOUNMRU5CUVVNc1EwRkJReXhOUVVGTkxFdEJRVXNzUTBGQlF5eEZRVUZGTzBGQlF6TkZMRmRCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVVVGQlVTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRPMDFCUTI1RE96czdRVUZIUkN4VFFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEZsQlFWa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU03U1VGRGVFUTdPMEZCUlVRc1UwRkJUU3hyUWtGQlF5eExRVUYzUWl4RlFVRkZPMU5CUVhwQ0xGRkJRVkVzUjBGQlZDeExRVUYzUWl4RFFVRjJRaXhSUVVGUk8xTkJRVVVzV1VGQldTeEhRVUYyUWl4TFFVRjNRaXhEUVVGaUxGbEJRVms3TzBGQlF6VkNMRk5CUVVrc2IwSkJRVzlDTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6czdRVUZGZUVRc1UwRkJTU3hEUVVGRExHOUNRVUZ2UWl4SlFVRkpMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zYjBKQlFXOUNMRU5CUVVNc1EwRkJReXhOUVVGTkxFdEJRVXNzUTBGQlF5eEZRVUZGTzBGQlF6TkZMRmRCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVVVGQlVTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRPMDFCUTI1RE96dEJRVVZFTEZsQlFVOHNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1NVRkRlRVE3TzBWQlJVWXNRMEZCUXpzN2MwSkJSV0VzV1VGQlRUdEJRVU51UWl4UFFVRkpMSFZDUVVGMVFpeEhRVUZITEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc2JVTkJRVzFETEVOQlFVTXNRMEZCUXpzN1FVRkZha1lzTUVKQlFYVkNMRU5CUVVNc1lVRkJZU3hIUVVGSExFVkJRVVVzUTBGQlF6czdRVUZGTTBNc1ZVRkJUeXgxUWtGQmRVSXNRMEZCUXp0RlFVTm9RenM3VTBGRlVTeHRRMEZCYlVNc1IwRkJia01zYlVOQlFXMURMRU03T3pzN096dEJRMnhETlVNc1lVRkJXU3hEUVVGRE96czdPenM3TzNOQ1FVbEZMRVZCUVVVN096czdPenM3UVVOS2FrSXNZVUZCV1N4RFFVRkRPenM3T3pzN2MwSkJSVVVzVlVGQlF5eEpRVUZuUlN4RlFVRkxPMDlCUVhCRkxHZENRVUZuUWl4SFFVRnFRaXhKUVVGblJTeERRVUV2UkN4blFrRkJaMEk3VDBGQlJTeHRRa0ZCYlVJc1IwRkJkRU1zU1VGQlowVXNRMEZCTjBNc2JVSkJRVzFDTzA5QlFVVXNkVUpCUVhWQ0xFZEJRUzlFTEVsQlFXZEZMRU5CUVhoQ0xIVkNRVUYxUWpzN1FVRkROMFVzVDBGQlNTeFpRVUZaTEVkQlFVY3NiVUpCUVcxQ0xFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1EwRkJRenM3UVVGRmVrUXNUMEZCU1N4WlFVRlpMRVZCUVVVN08wRkJSV2hDTEZsQlFVOHNiVUpCUVcxQ0xFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1EwRkJRenM3TzBGQlJ6ZERMR2xDUVVGWkxFTkJRVU1zVlVGQlZTeERRVUZETEU5QlFVOHNRMEZCUXl4clFrRkJVU3hGUVVGSk8wRkJRekZETERoQ1FVRjFRaXhEUVVGRExFMUJRVTBzUTBGQlF5eEZRVUZETEZGQlFWRXNSVUZCVWl4UlFVRlJMRVZCUVVVc1dVRkJXU3hGUVVGYUxGbEJRVmtzUlVGQlF5eERRVUZETEVOQlFVTTdUVUZETVVRc1EwRkJReXhEUVVGRE8wbEJRMG83UlVGRFJpSXNJbVpwYkdVaU9pSmlkVzVrYkdVdWFuTWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUlnWEhRdkx5QlVhR1VnYlc5a2RXeGxJR05oWTJobFhHNGdYSFIyWVhJZ2FXNXpkR0ZzYkdWa1RXOWtkV3hsY3lBOUlIdDlPMXh1WEc0Z1hIUXZMeUJVYUdVZ2NtVnhkV2x5WlNCbWRXNWpkR2x2Ymx4dUlGeDBablZ1WTNScGIyNGdYMTkzWldKd1lXTnJYM0psY1hWcGNtVmZYeWh0YjJSMWJHVkpaQ2tnZTF4dVhHNGdYSFJjZEM4dklFTm9aV05ySUdsbUlHMXZaSFZzWlNCcGN5QnBiaUJqWVdOb1pWeHVJRngwWEhScFppaHBibk4wWVd4c1pXUk5iMlIxYkdWelcyMXZaSFZzWlVsa1hTbGNiaUJjZEZ4MFhIUnlaWFIxY200Z2FXNXpkR0ZzYkdWa1RXOWtkV3hsYzF0dGIyUjFiR1ZKWkYwdVpYaHdiM0owY3p0Y2JseHVJRngwWEhRdkx5QkRjbVZoZEdVZ1lTQnVaWGNnYlc5a2RXeGxJQ2hoYm1RZ2NIVjBJR2wwSUdsdWRHOGdkR2hsSUdOaFkyaGxLVnh1SUZ4MFhIUjJZWElnYlc5a2RXeGxJRDBnYVc1emRHRnNiR1ZrVFc5a2RXeGxjMXR0YjJSMWJHVkpaRjBnUFNCN1hHNGdYSFJjZEZ4MFpYaHdiM0owY3pvZ2UzMHNYRzRnWEhSY2RGeDBhV1E2SUcxdlpIVnNaVWxrTEZ4dUlGeDBYSFJjZEd4dllXUmxaRG9nWm1Gc2MyVmNiaUJjZEZ4MGZUdGNibHh1SUZ4MFhIUXZMeUJGZUdWamRYUmxJSFJvWlNCdGIyUjFiR1VnWm5WdVkzUnBiMjVjYmlCY2RGeDBiVzlrZFd4bGMxdHRiMlIxYkdWSlpGMHVZMkZzYkNodGIyUjFiR1V1Wlhod2IzSjBjeXdnYlc5a2RXeGxMQ0J0YjJSMWJHVXVaWGh3YjNKMGN5d2dYMTkzWldKd1lXTnJYM0psY1hWcGNtVmZYeWs3WEc1Y2JpQmNkRngwTHk4Z1JteGhaeUIwYUdVZ2JXOWtkV3hsSUdGeklHeHZZV1JsWkZ4dUlGeDBYSFJ0YjJSMWJHVXViRzloWkdWa0lEMGdkSEoxWlR0Y2JseHVJRngwWEhRdkx5QlNaWFIxY200Z2RHaGxJR1Y0Y0c5eWRITWdiMllnZEdobElHMXZaSFZzWlZ4dUlGeDBYSFJ5WlhSMWNtNGdiVzlrZFd4bExtVjRjRzl5ZEhNN1hHNGdYSFI5WEc1Y2JseHVJRngwTHk4Z1pYaHdiM05sSUhSb1pTQnRiMlIxYkdWeklHOWlhbVZqZENBb1gxOTNaV0p3WVdOclgyMXZaSFZzWlhOZlh5bGNiaUJjZEY5ZmQyVmljR0ZqYTE5eVpYRjFhWEpsWDE4dWJTQTlJRzF2WkhWc1pYTTdYRzVjYmlCY2RDOHZJR1Y0Y0c5elpTQjBhR1VnYlc5a2RXeGxJR05oWTJobFhHNGdYSFJmWDNkbFluQmhZMnRmY21WeGRXbHlaVjlmTG1NZ1BTQnBibk4wWVd4c1pXUk5iMlIxYkdWek8xeHVYRzRnWEhRdkx5QmZYM2RsWW5CaFkydGZjSFZpYkdsalgzQmhkR2hmWDF4dUlGeDBYMTkzWldKd1lXTnJYM0psY1hWcGNtVmZYeTV3SUQwZ1hDSmNJanRjYmx4dUlGeDBMeThnVEc5aFpDQmxiblJ5ZVNCdGIyUjFiR1VnWVc1a0lISmxkSFZ5YmlCbGVIQnZjblJ6WEc0Z1hIUnlaWFIxY200Z1gxOTNaV0p3WVdOclgzSmxjWFZwY21WZlh5Z3dLVHRjYmx4dVhHNWNiaThxS2lCWFJVSlFRVU5MSUVaUFQxUkZVaUFxS2x4dUlDb3FJSGRsWW5CaFkyc3ZZbTl2ZEhOMGNtRndJRGxqTldabE1EZGlNVGRoWlRnMllUQmhOMkUxWEc0Z0tpb3ZJaXdpSjNWelpTQnpkSEpwWTNRbk8xeHVYRzVwYlhCdmNuUWdaMlYwU0dGemFGQmhjbUZ0Y3lBZ0lDQWdJQ0FnSUNBZ1puSnZiU0FuYW1GMllYTmpjbWx3ZEM5blpYUklZWE5vVUdGeVlXMXpKenRjYm1sdGNHOXlkQ0JvWVhOb1EyaGhibWRsU0dGdVpHeGxjaUFnSUNBZ0lDQm1jbTl0SUNkcVlYWmhjMk55YVhCMEwyaGhjMmhEYUdGdVoyVklZVzVrYkdWeUp6dGNibWx0Y0c5eWRDQnJaWGx6VjJsMGFFTm9ZVzVuWldSV1lXeDFaWE1nSUNCbWNtOXRJQ2RxWVhaaGMyTnlhWEIwTDJ0bGVYTlhhWFJvUTJoaGJtZGxaRlpoYkhWbGN5YzdYRzVwYlhCdmNuUWdjM1ZpYzJOeWFXSmxJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1puSnZiU0FuYW1GMllYTmpjbWx3ZEM5emRXSnpZM0pwWW1Vbk8xeHVhVzF3YjNKMElGTjFZbk5qY21sd2RHbHZiaUFnSUNBZ0lDQWdJQ0FnSUdaeWIyMGdKMnBoZG1GelkzSnBjSFF2VTNWaWMyTnlhWEIwYVc5dUp6dGNibWx0Y0c5eWRDQlRkV0p6WTNKcGNIUnBiMjV6UW5sUWNtOXdaWEowZVNCbWNtOXRJQ2RxWVhaaGMyTnlhWEIwTDNOMVluTmpjbWx3ZEdsdmJuTkNlVkJ5YjNCbGNuUjVKenRjYm1sdGNHOXlkQ0J6ZFdKelkzSnBjSFJwYjI1elFubFZWVWxFSUNBZ0lDQm1jbTl0SUNkcVlYWmhjMk55YVhCMEwzTjFZbk5qY21sd2RHbHZibk5DZVZWVlNVUW5PMXh1YVcxd2IzSjBJSFZ1YzNWaWMyTnlhV0psSUNBZ0lDQWdJQ0FnSUNBZ0lHWnliMjBnSjJwaGRtRnpZM0pwY0hRdmRXNXpkV0p6WTNKcFltVW5PMXh1WEc1c1pYUWdjM1ZpYzJOeWFYQjBhVzl1YzBKNVVISnZjR1Z5ZEhrZ1BTQlRkV0p6WTNKcGNIUnBiMjV6UW5sUWNtOXdaWEowZVNncE8xeHVYRzR2S2lCd2NtOWlZV0pzZVNCemFHOTFiR1FnYldsbmNtRjBaU0IwYUdseklIUnZJR0VnWm1GamRHOXllU0JoZENCemIyMWxJSEJ2YVc1MElIUnZJR0YyYjJsa0lIQnZjM05wWW14bElITnBibWRzWlhSdmJpQnBjM04xWlhNZ0tpOWNibVY0Y0c5eWRDQmtaV1poZFd4MElIdGNiaUFnWlc1emRYSmxTVzVwZEdsaGJHbDZZWFJwYjI0b0tTQjdYRzRnSUNBZ2FXWWdLQ0YwYUdsekxtbHVhWFJwWVd4cGVtVmtLU0I3WEc0Z0lDQWdJQ0IwYUdsekxtbHVhWFFvS1R0Y2JpQWdJQ0FnSUhSb2FYTXVhVzVwZEdsaGJHbDZaV1FnUFNCMGNuVmxPMXh1SUNBZ0lIMWNiaUFnZlN4Y2JpQWdhVzVwZENncElIdGNiaUFnSUNCeVpYUjFjbTRnZDJsdVpHOTNMbUZrWkVWMlpXNTBUR2x6ZEdWdVpYSW9KMmhoYzJoamFHRnVaMlVuTENCbGRtVnVkQ0E5UGlCN1hHNGdJQ0FnSUNCb1lYTm9RMmhoYm1kbFNHRnVaR3hsY2loN1hHNGdJQ0FnSUNBZ0lHVjJaVzUwTEZ4dUlDQWdJQ0FnSUNCblpYUklZWE5vVUdGeVlXMXpMRnh1SUNBZ0lDQWdJQ0JyWlhselYybDBhRU5vWVc1blpXUldZV3gxWlhNc1hHNGdJQ0FnSUNBZ0lITjFZbk5qY21sd2RHbHZibk5DZVZCeWIzQmxjblI1TEZ4dUlDQWdJQ0FnSUNCemRXSnpZM0pwY0hScGIyNXpRbmxWVlVsRVhHNGdJQ0FnSUNCOUtUdGNiaUFnSUNCOUtUdGNiaUFnZlN4Y2JpQWdjM1ZpYzJOeWFXSmxLSEJ5YjNCbGNuUnBaWE1zSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnZEdocGN5NWxibk4xY21WSmJtbDBhV0ZzYVhwaGRHbHZiaWdwTzF4dVhHNGdJQ0FnY21WMGRYSnVJSE4xWW5OamNtbGlaU2g3WEc0Z0lDQWdJQ0JUZFdKelkzSnBjSFJwYjI0c1hHNGdJQ0FnSUNCemRXSnpZM0pwY0hScGIyNXpRbmxWVlVsRUxGeHVJQ0FnSUNBZ2MzVmljMk55YVhCMGFXOXVjMEo1VUhKdmNHVnlkSGtzWEc0Z0lDQWdJQ0J3Y205d1pYSjBhV1Z6TEZ4dUlDQWdJQ0FnWTJGc2JHSmhZMnRjYmlBZ0lDQjlLVHRjYmlBZ2ZTeGNiaUFnZFc1emRXSnpZM0pwWW1Vb2MzVmljMk55YVhCMGFXOXVWVlZKUkNrZ2UxeHVJQ0FnSUhWdWMzVmljMk55YVdKbEtIdGNiaUFnSUNBZ0lITjFZbk5qY21sd2RHbHZibFZWU1VRc1hHNGdJQ0FnSUNCemRXSnpZM0pwY0hScGIyNXpRbmxWVlVsRUxGeHVJQ0FnSUNBZ2MzVmljMk55YVhCMGFXOXVjMEo1VUhKdmNHVnlkSGxjYmlBZ0lDQjlLVHRjYmlBZ2ZWeHVmVHRjYmx4dVhHNWNiaThxS2lCWFJVSlFRVU5MSUVaUFQxUkZVaUFxS2x4dUlDb3FJQzR2YW1GMllYTmpjbWx3ZEM5aGNHa3Vhbk5jYmlBcUtpOGlMQ0luZFhObElITjBjbWxqZENjN1hHNWNibVY0Y0c5eWRDQmtaV1poZFd4MElDaDFjbXdwSUQwK0lIdGNiaUFnYkdWMElGdGZMQ0IxY214SVlYTm9YU0E5SUhWeWJDNXpjR3hwZENnbkl5Y3BPMXh1WEc0Z0lIVnliRWhoYzJnZ1BTQjFjbXhJWVhOb0lIeDhJQ2NuTzF4dUlDQnlaWFIxY200Z2RYSnNTR0Z6YUM1emNHeHBkQ2duSmljcExuSmxaSFZqWlNnb2FHRnphQ3dnYTJWNVZtRnNkV1ZRWVdseUtTQTlQaUI3WEc0Z0lDQWdiR1YwSUZ0clpYa3NJSFpoYkhWbFhTQTlJR3RsZVZaaGJIVmxVR0ZwY2k1emNHeHBkQ2duUFNjcE8xeHVYRzRnSUNBZ2FXWWdLSFpoYkhWbElIeDhJQ0ZwYzA1aFRpaDJZV3gxWlNrcGUxeHVJQ0FnSUNBZ2FXWW9hWE5PWVU0b2RtRnNkV1VwS1NCN1hHNGdJQ0FnSUNBZ0lHaGhjMmhiYTJWNVhTQTlJSFpoYkhWbE95QWdYRzRnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQm9ZWE5vVzJ0bGVWMGdQU0J3WVhKelpVWnNiMkYwS0haaGJIVmxLVHRjYmlBZ0lDQWdJSDFjYmlBZ0lDQjlJR1ZzYzJVZ2FXWWdLR3RsZVM1c1pXNW5kR2dnUGlBd0tTQjdYRzRnSUNBZ0lDQm9ZWE5vVzJ0bGVWMGdQU0IwY25WbE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUhKbGRIVnliaUJvWVhOb08xeHVJQ0I5TENCN2ZTazdYRzU5TzF4dVhHNWNibHh1THlvcUlGZEZRbEJCUTBzZ1JrOVBWRVZTSUNvcVhHNGdLaW9nTGk5cVlYWmhjMk55YVhCMEwyZGxkRWhoYzJoUVlYSmhiWE11YW5OY2JpQXFLaThpTENJbmRYTmxJSE4wY21samRDYzdYRzVjYm1sdGNHOXlkQ0JwYm5SbGNuTmxZM1JwYjI0Z1puSnZiU0FuYkc5a1lYTm9MMkZ5Y21GNUwybHVkR1Z5YzJWamRHbHZiaWM3WEc1cGJYQnZjblFnWm14aGRIUmxiaUJtY205dElDZHNiMlJoYzJndllYSnlZWGt2Wm14aGRIUmxiaWM3WEc1cGJYQnZjblFnZFc1cGNYVmxJR1p5YjIwZ0oyeHZaR0Z6YUM5aGNuSmhlUzlwYm5SbGNuTmxZM1JwYjI0bk8xeHVYRzR2S2lCdVpXVmtjeUJ6ZFdKelkzSnBjSFJwYjI0Z2MyVjBjeUIwYnlCaVpTQmtaV1pwYm1Wa0lITnZiV1YzYUdWeVpTQXFMMXh1THlvZ1lXNGdaWFpsYm5RZ2QybDBhQ0JoSUhOMVluTmpjbWx3ZEdsdmJpQnpaWFFnZDJsc2JDQnZibXg1SUdacGNtVWdiMjVqWlNBcUwxeHVMeW9nWm05eUlHRnNiQ0J2WmlCMGFHVWdZMmhoYm1kbGN5QnBiaUIwYUdVZ2MyVjBMaUFxTDF4dVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENBb2UyZGxkRWhoYzJoUVlYSmhiWE1zSUhOMVluTmpjbWx3ZEdsdmJuTkNlVkJ5YjNCbGNuUjVMQ0J6ZFdKelkzSnBjSFJwYjI1elFubFZWVWxFTENCclpYbHpWMmwwYUVOb1lXNW5aV1JXWVd4MVpYTXNJR1YyWlc1MGZTa2dQVDRnZTF4dUlDQXZLaUJuWlhRZ2RHaGxJRzVsZHlCd1lYSmhiWE1nYjJKcVpXTjBJQ292WEc0Z0lDOHFJR2RsZENCMGFHVWdiMnhrSUhCaGNtRnRjeUJ2WW1wbFkzUWdLaTljYmlBZ2JHVjBJRzlzWkZCaGNtRnRjeUE5SUdkbGRFaGhjMmhRWVhKaGJYTW9aWFpsYm5RdWIyeGtWVkpNS1R0Y2JpQWdiR1YwSUc1bGQxQmhjbUZ0Y3lBOUlHZGxkRWhoYzJoUVlYSmhiWE1vWlhabGJuUXVibVYzVlZKTUtUdGNibHh1SUNCc1pYUWdjM1ZpYzJOeWFXSmxaRXRsZVhNZ1BTQlBZbXBsWTNRdWEyVjVjeWh6ZFdKelkzSnBjSFJwYjI1elFubFFjbTl3WlhKMGVTNXpkV0p6WTNKcGNIUnBiMjV6S1R0Y2JseHVJQ0F2S2lCcFpHVnVkR2xtZVNCMGFHVWdhMlY1Y3lCM2FYUm9JR05vWVc1blpXUWdkbUZzZFdWeklDb3ZYRzRnSUd4bGRDQnJaWGx6VjJsMGFFTm9ZVzVuWlhNZ1BTQnJaWGx6VjJsMGFFTm9ZVzVuWldSV1lXeDFaWE1vYjJ4a1VHRnlZVzF6TENCdVpYZFFZWEpoYlhNcE8xeHVYRzRnSUd4bGRDQnJaWGx6VjJsMGFGTjFZbk5qY21saVpXUkZkbVZ1ZEhNZ1BTQnBiblJsY25ObFkzUnBiMjRvYTJWNWMxZHBkR2hEYUdGdVoyVnpMQ0J6ZFdKelkzSnBZbVZrUzJWNWN5azdYRzVjYmlBZ0x5OGdhMlY1YzFkcGRHaFRkV0p6WTNKcFltVmtSWFpsYm5SekxseHVJQ0F2S2lCc2IyOXdJSFJvY205MVoyZ2dZV3hzSUc5bUlIUm9aU0J6ZFdKelkzSnBZbVZrUlhabGJuUWdibUZ0WlhNZ2JHOXZhMmx1WnlBcUwxeHVJQ0F2S2lCbWIzSWdaR2xtWm1WeVpXNWpaWE1nWW1WMGQyVmxiaUJ1WlhkUVlYSmhiWE1nWVc1a0lHOXNaRkJoY21GdGN5QXFMMXh1SUNCc1pYUWdjM1ZpYzJOeWFYQjBhVzl1VlZWSlJITWdQU0JyWlhselYybDBhRk4xWW5OamNtbGlaV1JGZG1WdWRITXViV0Z3S0d0bGVTQTlQaUI3WEc0Z0lDQWdjbVYwZFhKdUlFOWlhbVZqZEM1clpYbHpLSE4xWW5OamNtbHdkR2x2Ym5OQ2VWQnliM0JsY25SNUxuTjFZbk5qY21sd2RHbHZibk5iYTJWNVhTazdYRzRnSUgwcE8xeHVYRzRnSUhOMVluTmpjbWx3ZEdsdmJsVlZTVVJ6SUQwZ2RXNXBjWFZsS0dac1lYUjBaVzRvYzNWaWMyTnlhWEIwYVc5dVZWVkpSSE1wS1R0Y2JseHVJQ0F2S2lCMGNtbG5aMlZ5SUdWMlpXNTBjeUJtYjNJZ1pXRmphQ0J2WmlCMGFHVWdaWFpsYm5SeklHWnZkVzVrSUNvdlhHNWNiaUFnYkdWMElITjFZbk5qY21sd2RHbHZibk1nUFNCemRXSnpZM0pwY0hScGIyNVZWVWxFY3k1dFlYQW9jM1ZpYzJOeWFYQjBhVzl1VlZWSlJDQTlQaUJ6ZFdKelkzSnBjSFJwYjI1elFubFZWVWxFVzNOMVluTmpjbWx3ZEdsdmJsVlZTVVJkS1R0Y2JseHVJQ0J6ZFdKelkzSnBjSFJwYjI1ekxtWnZja1ZoWTJnb2MzVmljMk55YVhCMGFXOXVJRDArSUhzZ2MzVmljMk55YVhCMGFXOXVMbU5oYkd4aVlXTnJLRzVsZDFCaGNtRnRjeWs3SUgwcE8xeHVmVHRjYmx4dVhHNWNiaThxS2lCWFJVSlFRVU5MSUVaUFQxUkZVaUFxS2x4dUlDb3FJQzR2YW1GMllYTmpjbWx3ZEM5b1lYTm9RMmhoYm1kbFNHRnVaR3hsY2k1cWMxeHVJQ29xTHlJc0luWmhjaUJpWVhObFNXNWtaWGhQWmlBOUlISmxjWFZwY21Vb0p5NHVMMmx1ZEdWeWJtRnNMMkpoYzJWSmJtUmxlRTltSnlrc1hHNGdJQ0FnWTJGamFHVkpibVJsZUU5bUlEMGdjbVZ4ZFdseVpTZ25MaTR2YVc1MFpYSnVZV3d2WTJGamFHVkpibVJsZUU5bUp5a3NYRzRnSUNBZ1kzSmxZWFJsUTJGamFHVWdQU0J5WlhGMWFYSmxLQ2N1TGk5cGJuUmxjbTVoYkM5amNtVmhkR1ZEWVdOb1pTY3BMRnh1SUNBZ0lHbHpRWEp5WVhsTWFXdGxJRDBnY21WeGRXbHlaU2duTGk0dmFXNTBaWEp1WVd3dmFYTkJjbkpoZVV4cGEyVW5LU3hjYmlBZ0lDQnlaWE4wVUdGeVlXMGdQU0J5WlhGMWFYSmxLQ2N1TGk5bWRXNWpkR2x2Ymk5eVpYTjBVR0Z5WVcwbktUdGNibHh1THlvcVhHNGdLaUJEY21WaGRHVnpJR0Z1SUdGeWNtRjVJRzltSUhWdWFYRjFaU0IyWVd4MVpYTWdkR2hoZENCaGNtVWdhVzVqYkhWa1pXUWdhVzRnWVd4c0lHOW1JSFJvWlNCd2NtOTJhV1JsWkZ4dUlDb2dZWEp5WVhseklIVnphVzVuSUZ0Z1UyRnRaVlpoYkhWbFdtVnliMkJkS0doMGRIQTZMeTlsWTIxaExXbHVkR1Z5Ym1GMGFXOXVZV3d1YjNKbkwyVmpiV0V0TWpZeUx6WXVNQzhqYzJWakxYTmhiV1YyWVd4MVpYcGxjbThwWEc0Z0tpQm1iM0lnWlhGMVlXeHBkSGtnWTI5dGNHRnlhWE52Ym5NdVhHNGdLbHh1SUNvZ1FITjBZWFJwWTF4dUlDb2dRRzFsYldKbGNrOW1JRjljYmlBcUlFQmpZWFJsWjI5eWVTQkJjbkpoZVZ4dUlDb2dRSEJoY21GdElIc3VMaTVCY25KaGVYMGdXMkZ5Y21GNWMxMGdWR2hsSUdGeWNtRjVjeUIwYnlCcGJuTndaV04wTGx4dUlDb2dRSEpsZEhWeWJuTWdlMEZ5Y21GNWZTQlNaWFIxY201eklIUm9aU0J1WlhjZ1lYSnlZWGtnYjJZZ2MyaGhjbVZrSUhaaGJIVmxjeTVjYmlBcUlFQmxlR0Z0Y0d4bFhHNGdLaUJmTG1sdWRHVnljMlZqZEdsdmJpaGJNU3dnTWwwc0lGczBMQ0F5WFN3Z1d6SXNJREZkS1R0Y2JpQXFJQzh2SUQwK0lGc3lYVnh1SUNvdlhHNTJZWElnYVc1MFpYSnpaV04wYVc5dUlEMGdjbVZ6ZEZCaGNtRnRLR1oxYm1OMGFXOXVLR0Z5Y21GNWN5a2dlMXh1SUNCMllYSWdiM1JvVEdWdVozUm9JRDBnWVhKeVlYbHpMbXhsYm1kMGFDeGNiaUFnSUNBZ0lHOTBhRWx1WkdWNElEMGdiM1JvVEdWdVozUm9MRnh1SUNBZ0lDQWdZMkZqYUdWeklEMGdRWEp5WVhrb2JHVnVaM1JvS1N4Y2JpQWdJQ0FnSUdsdVpHVjRUMllnUFNCaVlYTmxTVzVrWlhoUFppeGNiaUFnSUNBZ0lHbHpRMjl0Ylc5dUlEMGdkSEoxWlN4Y2JpQWdJQ0FnSUhKbGMzVnNkQ0E5SUZ0ZE8xeHVYRzRnSUhkb2FXeGxJQ2h2ZEdoSmJtUmxlQzB0S1NCN1hHNGdJQ0FnZG1GeUlIWmhiSFZsSUQwZ1lYSnlZWGx6VzI5MGFFbHVaR1Y0WFNBOUlHbHpRWEp5WVhsTWFXdGxLSFpoYkhWbElEMGdZWEp5WVhselcyOTBhRWx1WkdWNFhTa2dQeUIyWVd4MVpTQTZJRnRkTzF4dUlDQWdJR05oWTJobGMxdHZkR2hKYm1SbGVGMGdQU0FvYVhORGIyMXRiMjRnSmlZZ2RtRnNkV1V1YkdWdVozUm9JRDQ5SURFeU1Da2dQeUJqY21WaGRHVkRZV05vWlNodmRHaEpibVJsZUNBbUppQjJZV3gxWlNrZ09pQnVkV3hzTzF4dUlDQjlYRzRnSUhaaGNpQmhjbkpoZVNBOUlHRnljbUY1YzFzd1hTeGNiaUFnSUNBZ0lHbHVaR1Y0SUQwZ0xURXNYRzRnSUNBZ0lDQnNaVzVuZEdnZ1BTQmhjbkpoZVNBL0lHRnljbUY1TG14bGJtZDBhQ0E2SURBc1hHNGdJQ0FnSUNCelpXVnVJRDBnWTJGamFHVnpXekJkTzF4dVhHNGdJRzkxZEdWeU9seHVJQ0IzYUdsc1pTQW9LeXRwYm1SbGVDQThJR3hsYm1kMGFDa2dlMXh1SUNBZ0lIWmhiSFZsSUQwZ1lYSnlZWGxiYVc1a1pYaGRPMXh1SUNBZ0lHbG1JQ2dvYzJWbGJpQS9JR05oWTJobFNXNWtaWGhQWmloelpXVnVMQ0IyWVd4MVpTa2dPaUJwYm1SbGVFOW1LSEpsYzNWc2RDd2dkbUZzZFdVc0lEQXBLU0E4SURBcElIdGNiaUFnSUNBZ0lIWmhjaUJ2ZEdoSmJtUmxlQ0E5SUc5MGFFeGxibWQwYUR0Y2JpQWdJQ0FnSUhkb2FXeGxJQ2d0TFc5MGFFbHVaR1Y0S1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJqWVdOb1pTQTlJR05oWTJobGMxdHZkR2hKYm1SbGVGMDdYRzRnSUNBZ0lDQWdJR2xtSUNnb1kyRmphR1VnUHlCallXTm9aVWx1WkdWNFQyWW9ZMkZqYUdVc0lIWmhiSFZsS1NBNklHbHVaR1Y0VDJZb1lYSnlZWGx6VzI5MGFFbHVaR1Y0WFN3Z2RtRnNkV1VzSURBcEtTQThJREFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQmpiMjUwYVc1MVpTQnZkWFJsY2p0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2FXWWdLSE5sWlc0cElIdGNiaUFnSUNBZ0lDQWdjMlZsYmk1d2RYTm9LSFpoYkhWbEtUdGNiaUFnSUNBZ0lIMWNiaUFnSUNBZ0lISmxjM1ZzZEM1d2RYTm9LSFpoYkhWbEtUdGNiaUFnSUNCOVhHNGdJSDFjYmlBZ2NtVjBkWEp1SUhKbGMzVnNkRHRjYm4wcE8xeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR2x1ZEdWeWMyVmpkR2x2Ymp0Y2JseHVYRzVjYmk4cUtpb3FLaW9xS2lvcUtpb3FLaW9xS2x4dUlDb3FJRmRGUWxCQlEwc2dSazlQVkVWU1hHNGdLaW9nTGk5K0wyeHZaR0Z6YUM5aGNuSmhlUzlwYm5SbGNuTmxZM1JwYjI0dWFuTmNiaUFxS2lCdGIyUjFiR1VnYVdRZ1BTQXpYRzRnS2lvZ2JXOWtkV3hsSUdOb2RXNXJjeUE5SURCY2JpQXFLaThpTENKMllYSWdhVzVrWlhoUFprNWhUaUE5SUhKbGNYVnBjbVVvSnk0dmFXNWtaWGhQWms1aFRpY3BPMXh1WEc0dktpcGNiaUFxSUZSb1pTQmlZWE5sSUdsdGNHeGxiV1Z1ZEdGMGFXOXVJRzltSUdCZkxtbHVaR1Y0VDJaZ0lIZHBkR2h2ZFhRZ2MzVndjRzl5ZENCbWIzSWdZbWx1WVhKNUlITmxZWEpqYUdWekxseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdlMEZ5Y21GNWZTQmhjbkpoZVNCVWFHVWdZWEp5WVhrZ2RHOGdjMlZoY21Ob0xseHVJQ29nUUhCaGNtRnRJSHNxZlNCMllXeDFaU0JVYUdVZ2RtRnNkV1VnZEc4Z2MyVmhjbU5vSUdadmNpNWNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0JtY205dFNXNWtaWGdnVkdobElHbHVaR1Y0SUhSdklITmxZWEpqYUNCbWNtOXRMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UyNTFiV0psY24wZ1VtVjBkWEp1Y3lCMGFHVWdhVzVrWlhnZ2IyWWdkR2hsSUcxaGRHTm9aV1FnZG1Gc2RXVXNJR1ZzYzJVZ1lDMHhZQzVjYmlBcUwxeHVablZ1WTNScGIyNGdZbUZ6WlVsdVpHVjRUMllvWVhKeVlYa3NJSFpoYkhWbExDQm1jbTl0U1c1a1pYZ3BJSHRjYmlBZ2FXWWdLSFpoYkhWbElDRTlQU0IyWVd4MVpTa2dlMXh1SUNBZ0lISmxkSFZ5YmlCcGJtUmxlRTltVG1GT0tHRnljbUY1TENCbWNtOXRTVzVrWlhncE8xeHVJQ0I5WEc0Z0lIWmhjaUJwYm1SbGVDQTlJR1p5YjIxSmJtUmxlQ0F0SURFc1hHNGdJQ0FnSUNCc1pXNW5kR2dnUFNCaGNuSmhlUzVzWlc1bmRHZzdYRzVjYmlBZ2QyaHBiR1VnS0NzcmFXNWtaWGdnUENCc1pXNW5kR2dwSUh0Y2JpQWdJQ0JwWmlBb1lYSnlZWGxiYVc1a1pYaGRJRDA5UFNCMllXeDFaU2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJR2x1WkdWNE8xeHVJQ0FnSUgxY2JpQWdmVnh1SUNCeVpYUjFjbTRnTFRFN1hHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnWW1GelpVbHVaR1Y0VDJZN1hHNWNibHh1WEc0dktpb3FLaW9xS2lvcUtpb3FLaW9xS2lwY2JpQXFLaUJYUlVKUVFVTkxJRVpQVDFSRlVseHVJQ29xSUM0dmZpOXNiMlJoYzJndmFXNTBaWEp1WVd3dlltRnpaVWx1WkdWNFQyWXVhbk5jYmlBcUtpQnRiMlIxYkdVZ2FXUWdQU0EwWEc0Z0tpb2diVzlrZFd4bElHTm9kVzVyY3lBOUlEQmNiaUFxS2k4aUxDSXZLaXBjYmlBcUlFZGxkSE1nZEdobElHbHVaR1Y0SUdGMElIZG9hV05vSUhSb1pTQm1hWEp6ZENCdlkyTjFjbkpsYm1ObElHOW1JR0JPWVU1Z0lHbHpJR1p2ZFc1a0lHbHVJR0JoY25KaGVXQXVYRzRnS2x4dUlDb2dRSEJ5YVhaaGRHVmNiaUFxSUVCd1lYSmhiU0I3UVhKeVlYbDlJR0Z5Y21GNUlGUm9aU0JoY25KaGVTQjBieUJ6WldGeVkyZ3VYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnWm5KdmJVbHVaR1Y0SUZSb1pTQnBibVJsZUNCMGJ5QnpaV0Z5WTJnZ1puSnZiUzVjYmlBcUlFQndZWEpoYlNCN1ltOXZiR1ZoYm4wZ1cyWnliMjFTYVdkb2RGMGdVM0JsWTJsbWVTQnBkR1Z5WVhScGJtY2dabkp2YlNCeWFXZG9kQ0IwYnlCc1pXWjBMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UyNTFiV0psY24wZ1VtVjBkWEp1Y3lCMGFHVWdhVzVrWlhnZ2IyWWdkR2hsSUcxaGRHTm9aV1FnWUU1aFRtQXNJR1ZzYzJVZ1lDMHhZQzVjYmlBcUwxeHVablZ1WTNScGIyNGdhVzVrWlhoUFprNWhUaWhoY25KaGVTd2dabkp2YlVsdVpHVjRMQ0JtY205dFVtbG5hSFFwSUh0Y2JpQWdkbUZ5SUd4bGJtZDBhQ0E5SUdGeWNtRjVMbXhsYm1kMGFDeGNiaUFnSUNBZ0lHbHVaR1Y0SUQwZ1puSnZiVWx1WkdWNElDc2dLR1p5YjIxU2FXZG9kQ0EvSURBZ09pQXRNU2s3WEc1Y2JpQWdkMmhwYkdVZ0tDaG1jbTl0VW1sbmFIUWdQeUJwYm1SbGVDMHRJRG9nS3l0cGJtUmxlQ0E4SUd4bGJtZDBhQ2twSUh0Y2JpQWdJQ0IyWVhJZ2IzUm9aWElnUFNCaGNuSmhlVnRwYm1SbGVGMDdYRzRnSUNBZ2FXWWdLRzkwYUdWeUlDRTlQU0J2ZEdobGNpa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlHbHVaR1Y0TzF4dUlDQWdJSDFjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdMVEU3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdhVzVrWlhoUFprNWhUanRjYmx4dVhHNWNiaThxS2lvcUtpb3FLaW9xS2lvcUtpb3FLbHh1SUNvcUlGZEZRbEJCUTBzZ1JrOVBWRVZTWEc0Z0tpb2dMaTkrTDJ4dlpHRnphQzlwYm5SbGNtNWhiQzlwYm1SbGVFOW1UbUZPTG1welhHNGdLaW9nYlc5a2RXeGxJR2xrSUQwZ05WeHVJQ29xSUcxdlpIVnNaU0JqYUhWdWEzTWdQU0F3WEc0Z0tpb3ZJaXdpZG1GeUlHbHpUMkpxWldOMElEMGdjbVZ4ZFdseVpTZ25MaTR2YkdGdVp5OXBjMDlpYW1WamRDY3BPMXh1WEc0dktpcGNiaUFxSUVOb1pXTnJjeUJwWmlCZ2RtRnNkV1ZnSUdseklHbHVJR0JqWVdOb1pXQWdiV2x0YVdOcmFXNW5JSFJvWlNCeVpYUjFjbTRnYzJsbmJtRjBkWEpsSUc5bVhHNGdLaUJnWHk1cGJtUmxlRTltWUNCaWVTQnlaWFIxY201cGJtY2dZREJnSUdsbUlIUm9aU0IyWVd4MVpTQnBjeUJtYjNWdVpDd2daV3h6WlNCZ0xURmdMbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWNHRnlZVzBnZTA5aWFtVmpkSDBnWTJGamFHVWdWR2hsSUdOaFkyaGxJSFJ2SUhObFlYSmphQzVjYmlBcUlFQndZWEpoYlNCN0tuMGdkbUZzZFdVZ1ZHaGxJSFpoYkhWbElIUnZJSE5sWVhKamFDQm1iM0l1WEc0Z0tpQkFjbVYwZFhKdWN5QjdiblZ0WW1WeWZTQlNaWFIxY201eklHQXdZQ0JwWmlCZ2RtRnNkV1ZnSUdseklHWnZkVzVrTENCbGJITmxJR0F0TVdBdVhHNGdLaTljYm1aMWJtTjBhVzl1SUdOaFkyaGxTVzVrWlhoUFppaGpZV05vWlN3Z2RtRnNkV1VwSUh0Y2JpQWdkbUZ5SUdSaGRHRWdQU0JqWVdOb1pTNWtZWFJoTEZ4dUlDQWdJQ0FnY21WemRXeDBJRDBnS0hSNWNHVnZaaUIyWVd4MVpTQTlQU0FuYzNSeWFXNW5KeUI4ZkNCcGMwOWlhbVZqZENoMllXeDFaU2twSUQ4Z1pHRjBZUzV6WlhRdWFHRnpLSFpoYkhWbEtTQTZJR1JoZEdFdWFHRnphRnQyWVd4MVpWMDdYRzVjYmlBZ2NtVjBkWEp1SUhKbGMzVnNkQ0EvSURBZ09pQXRNVHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQmpZV05vWlVsdVpHVjRUMlk3WEc1Y2JseHVYRzR2S2lvcUtpb3FLaW9xS2lvcUtpb3FLaXBjYmlBcUtpQlhSVUpRUVVOTElFWlBUMVJGVWx4dUlDb3FJQzR2Zmk5c2IyUmhjMmd2YVc1MFpYSnVZV3d2WTJGamFHVkpibVJsZUU5bUxtcHpYRzRnS2lvZ2JXOWtkV3hsSUdsa0lEMGdObHh1SUNvcUlHMXZaSFZzWlNCamFIVnVhM01nUFNBd1hHNGdLaW92SWl3aUx5b3FYRzRnS2lCRGFHVmphM01nYVdZZ1lIWmhiSFZsWUNCcGN5QjBhR1VnVzJ4aGJtZDFZV2RsSUhSNWNHVmRLR2gwZEhCek9pOHZaWE0xTG1kcGRHaDFZaTVwYnk4amVEZ3BJRzltSUdCUFltcGxZM1JnTGx4dUlDb2dLR1V1Wnk0Z1lYSnlZWGx6TENCbWRXNWpkR2x2Ym5Nc0lHOWlhbVZqZEhNc0lISmxaMlY0WlhNc0lHQnVaWGNnVG5WdFltVnlLREFwWUN3Z1lXNWtJR0J1WlhjZ1UzUnlhVzVuS0NjbktXQXBYRzRnS2x4dUlDb2dRSE4wWVhScFkxeHVJQ29nUUcxbGJXSmxjazltSUY5Y2JpQXFJRUJqWVhSbFoyOXllU0JNWVc1blhHNGdLaUJBY0dGeVlXMGdleXA5SUhaaGJIVmxJRlJvWlNCMllXeDFaU0IwYnlCamFHVmpheTVjYmlBcUlFQnlaWFIxY201eklIdGliMjlzWldGdWZTQlNaWFIxY201eklHQjBjblZsWUNCcFppQmdkbUZzZFdWZ0lHbHpJR0Z1SUc5aWFtVmpkQ3dnWld4elpTQmdabUZzYzJWZ0xseHVJQ29nUUdWNFlXMXdiR1ZjYmlBcVhHNGdLaUJmTG1selQySnFaV04wS0h0OUtUdGNiaUFxSUM4dklEMCtJSFJ5ZFdWY2JpQXFYRzRnS2lCZkxtbHpUMkpxWldOMEtGc3hMQ0F5TENBelhTazdYRzRnS2lBdkx5QTlQaUIwY25WbFhHNGdLbHh1SUNvZ1h5NXBjMDlpYW1WamRDZ3hLVHRjYmlBcUlDOHZJRDArSUdaaGJITmxYRzRnS2k5Y2JtWjFibU4wYVc5dUlHbHpUMkpxWldOMEtIWmhiSFZsS1NCN1hHNGdJQzh2SUVGMmIybGtJR0VnVmpnZ1NrbFVJR0oxWnlCcGJpQkRhSEp2YldVZ01Ua3RNakF1WEc0Z0lDOHZJRk5sWlNCb2RIUndjem92TDJOdlpHVXVaMjl2WjJ4bExtTnZiUzl3TDNZNEwybHpjM1ZsY3k5a1pYUmhhV3cvYVdROU1qSTVNU0JtYjNJZ2JXOXlaU0JrWlhSaGFXeHpMbHh1SUNCMllYSWdkSGx3WlNBOUlIUjVjR1Z2WmlCMllXeDFaVHRjYmlBZ2NtVjBkWEp1SUNFaGRtRnNkV1VnSmlZZ0tIUjVjR1VnUFQwZ0oyOWlhbVZqZENjZ2ZId2dkSGx3WlNBOVBTQW5ablZ1WTNScGIyNG5LVHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQnBjMDlpYW1WamREdGNibHh1WEc1Y2JpOHFLaW9xS2lvcUtpb3FLaW9xS2lvcUtseHVJQ29xSUZkRlFsQkJRMHNnUms5UFZFVlNYRzRnS2lvZ0xpOStMMnh2WkdGemFDOXNZVzVuTDJselQySnFaV04wTG1welhHNGdLaW9nYlc5a2RXeGxJR2xrSUQwZ04xeHVJQ29xSUcxdlpIVnNaU0JqYUhWdWEzTWdQU0F3WEc0Z0tpb3ZJaXdpZG1GeUlGTmxkRU5oWTJobElEMGdjbVZ4ZFdseVpTZ25MaTlUWlhSRFlXTm9aU2NwTEZ4dUlDQWdJR2RsZEU1aGRHbDJaU0E5SUhKbGNYVnBjbVVvSnk0dloyVjBUbUYwYVhabEp5azdYRzVjYmk4cUtpQk9ZWFJwZG1VZ2JXVjBhRzlrSUhKbFptVnlaVzVqWlhNdUlDb3ZYRzUyWVhJZ1UyVjBJRDBnWjJWMFRtRjBhWFpsS0dkc2IySmhiQ3dnSjFObGRDY3BPMXh1WEc0dktpQk9ZWFJwZG1VZ2JXVjBhRzlrSUhKbFptVnlaVzVqWlhNZ1ptOXlJSFJvYjNObElIZHBkR2dnZEdobElITmhiV1VnYm1GdFpTQmhjeUJ2ZEdobGNpQmdiRzlrWVhOb1lDQnRaWFJvYjJSekxpQXFMMXh1ZG1GeUlHNWhkR2wyWlVOeVpXRjBaU0E5SUdkbGRFNWhkR2wyWlNoUFltcGxZM1FzSUNkamNtVmhkR1VuS1R0Y2JseHVMeW9xWEc0Z0tpQkRjbVZoZEdWeklHRWdZRk5sZEdBZ1kyRmphR1VnYjJKcVpXTjBJSFJ2SUc5d2RHbHRhWHBsSUd4cGJtVmhjaUJ6WldGeVkyaGxjeUJ2WmlCc1lYSm5aU0JoY25KaGVYTXVYRzRnS2x4dUlDb2dRSEJ5YVhaaGRHVmNiaUFxSUVCd1lYSmhiU0I3UVhKeVlYbDlJRnQyWVd4MVpYTmRJRlJvWlNCMllXeDFaWE1nZEc4Z1kyRmphR1V1WEc0Z0tpQkFjbVYwZFhKdWN5QjdiblZzYkh4UFltcGxZM1I5SUZKbGRIVnlibk1nZEdobElHNWxkeUJqWVdOb1pTQnZZbXBsWTNRZ2FXWWdZRk5sZEdBZ2FYTWdjM1Z3Y0c5eWRHVmtMQ0JsYkhObElHQnVkV3hzWUM1Y2JpQXFMMXh1Wm5WdVkzUnBiMjRnWTNKbFlYUmxRMkZqYUdVb2RtRnNkV1Z6S1NCN1hHNGdJSEpsZEhWeWJpQW9ibUYwYVhabFEzSmxZWFJsSUNZbUlGTmxkQ2tnUHlCdVpYY2dVMlYwUTJGamFHVW9kbUZzZFdWektTQTZJRzUxYkd3N1hHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnWTNKbFlYUmxRMkZqYUdVN1hHNWNibHh1WEc0dktpb3FLaW9xS2lvcUtpb3FLaW9xS2lwY2JpQXFLaUJYUlVKUVFVTkxJRVpQVDFSRlVseHVJQ29xSUM0dmZpOXNiMlJoYzJndmFXNTBaWEp1WVd3dlkzSmxZWFJsUTJGamFHVXVhbk5jYmlBcUtpQnRiMlIxYkdVZ2FXUWdQU0E0WEc0Z0tpb2diVzlrZFd4bElHTm9kVzVyY3lBOUlEQmNiaUFxS2k4aUxDSjJZWElnWTJGamFHVlFkWE5vSUQwZ2NtVnhkV2x5WlNnbkxpOWpZV05vWlZCMWMyZ25LU3hjYmlBZ0lDQm5aWFJPWVhScGRtVWdQU0J5WlhGMWFYSmxLQ2N1TDJkbGRFNWhkR2wyWlNjcE8xeHVYRzR2S2lvZ1RtRjBhWFpsSUcxbGRHaHZaQ0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUZObGRDQTlJR2RsZEU1aGRHbDJaU2huYkc5aVlXd3NJQ2RUWlhRbktUdGNibHh1THlvZ1RtRjBhWFpsSUcxbGRHaHZaQ0J5WldabGNtVnVZMlZ6SUdadmNpQjBhRzl6WlNCM2FYUm9JSFJvWlNCellXMWxJRzVoYldVZ1lYTWdiM1JvWlhJZ1lHeHZaR0Z6YUdBZ2JXVjBhRzlrY3k0Z0tpOWNiblpoY2lCdVlYUnBkbVZEY21WaGRHVWdQU0JuWlhST1lYUnBkbVVvVDJKcVpXTjBMQ0FuWTNKbFlYUmxKeWs3WEc1Y2JpOHFLbHh1SUNwY2JpQXFJRU55WldGMFpYTWdZU0JqWVdOb1pTQnZZbXBsWTNRZ2RHOGdjM1J2Y21VZ2RXNXBjWFZsSUhaaGJIVmxjeTVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FIQmhjbUZ0SUh0QmNuSmhlWDBnVzNaaGJIVmxjMTBnVkdobElIWmhiSFZsY3lCMGJ5QmpZV05vWlM1Y2JpQXFMMXh1Wm5WdVkzUnBiMjRnVTJWMFEyRmphR1VvZG1Gc2RXVnpLU0I3WEc0Z0lIWmhjaUJzWlc1bmRHZ2dQU0IyWVd4MVpYTWdQeUIyWVd4MVpYTXViR1Z1WjNSb0lEb2dNRHRjYmx4dUlDQjBhR2x6TG1SaGRHRWdQU0I3SUNkb1lYTm9Kem9nYm1GMGFYWmxRM0psWVhSbEtHNTFiR3dwTENBbmMyVjBKem9nYm1WM0lGTmxkQ0I5TzF4dUlDQjNhR2xzWlNBb2JHVnVaM1JvTFMwcElIdGNiaUFnSUNCMGFHbHpMbkIxYzJnb2RtRnNkV1Z6VzJ4bGJtZDBhRjBwTzF4dUlDQjlYRzU5WEc1Y2JpOHZJRUZrWkNCbWRXNWpkR2x2Ym5NZ2RHOGdkR2hsSUdCVFpYUmdJR05oWTJobExseHVVMlYwUTJGamFHVXVjSEp2ZEc5MGVYQmxMbkIxYzJnZ1BTQmpZV05vWlZCMWMyZzdYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnVTJWMFEyRmphR1U3WEc1Y2JseHVYRzR2S2lvcUtpb3FLaW9xS2lvcUtpb3FLaXBjYmlBcUtpQlhSVUpRUVVOTElFWlBUMVJGVWx4dUlDb3FJQzR2Zmk5c2IyUmhjMmd2YVc1MFpYSnVZV3d2VTJWMFEyRmphR1V1YW5OY2JpQXFLaUJ0YjJSMWJHVWdhV1FnUFNBNVhHNGdLaW9nYlc5a2RXeGxJR05vZFc1cmN5QTlJREJjYmlBcUtpOGlMQ0oyWVhJZ2FYTlBZbXBsWTNRZ1BTQnlaWEYxYVhKbEtDY3VMaTlzWVc1bkwybHpUMkpxWldOMEp5azdYRzVjYmk4cUtseHVJQ29nUVdSa2N5QmdkbUZzZFdWZ0lIUnZJSFJvWlNCallXTm9aUzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FHNWhiV1VnY0hWemFGeHVJQ29nUUcxbGJXSmxjazltSUZObGRFTmhZMmhsWEc0Z0tpQkFjR0Z5WVcwZ2V5cDlJSFpoYkhWbElGUm9aU0IyWVd4MVpTQjBieUJqWVdOb1pTNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z1kyRmphR1ZRZFhOb0tIWmhiSFZsS1NCN1hHNGdJSFpoY2lCa1lYUmhJRDBnZEdocGN5NWtZWFJoTzF4dUlDQnBaaUFvZEhsd1pXOW1JSFpoYkhWbElEMDlJQ2R6ZEhKcGJtY25JSHg4SUdselQySnFaV04wS0haaGJIVmxLU2tnZTF4dUlDQWdJR1JoZEdFdWMyVjBMbUZrWkNoMllXeDFaU2s3WEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnWkdGMFlTNW9ZWE5vVzNaaGJIVmxYU0E5SUhSeWRXVTdYRzRnSUgxY2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JqWVdOb1pWQjFjMmc3WEc1Y2JseHVYRzR2S2lvcUtpb3FLaW9xS2lvcUtpb3FLaXBjYmlBcUtpQlhSVUpRUVVOTElFWlBUMVJGVWx4dUlDb3FJQzR2Zmk5c2IyUmhjMmd2YVc1MFpYSnVZV3d2WTJGamFHVlFkWE5vTG1welhHNGdLaW9nYlc5a2RXeGxJR2xrSUQwZ01UQmNiaUFxS2lCdGIyUjFiR1VnWTJoMWJtdHpJRDBnTUZ4dUlDb3FMeUlzSW5aaGNpQnBjMDVoZEdsMlpTQTlJSEpsY1hWcGNtVW9KeTR1TDJ4aGJtY3ZhWE5PWVhScGRtVW5LVHRjYmx4dUx5b3FYRzRnS2lCSFpYUnpJSFJvWlNCdVlYUnBkbVVnWm5WdVkzUnBiMjRnWVhRZ1lHdGxlV0FnYjJZZ1lHOWlhbVZqZEdBdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ3WVhKaGJTQjdUMkpxWldOMGZTQnZZbXBsWTNRZ1ZHaGxJRzlpYW1WamRDQjBieUJ4ZFdWeWVTNWNiaUFxSUVCd1lYSmhiU0I3YzNSeWFXNW5mU0JyWlhrZ1ZHaGxJR3RsZVNCdlppQjBhR1VnYldWMGFHOWtJSFJ2SUdkbGRDNWNiaUFxSUVCeVpYUjFjbTV6SUhzcWZTQlNaWFIxY201eklIUm9aU0JtZFc1amRHbHZiaUJwWmlCcGRDZHpJRzVoZEdsMlpTd2daV3h6WlNCZ2RXNWtaV1pwYm1Wa1lDNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z1oyVjBUbUYwYVhabEtHOWlhbVZqZEN3Z2EyVjVLU0I3WEc0Z0lIWmhjaUIyWVd4MVpTQTlJRzlpYW1WamRDQTlQU0J1ZFd4c0lEOGdkVzVrWldacGJtVmtJRG9nYjJKcVpXTjBXMnRsZVYwN1hHNGdJSEpsZEhWeWJpQnBjMDVoZEdsMlpTaDJZV3gxWlNrZ1B5QjJZV3gxWlNBNklIVnVaR1ZtYVc1bFpEdGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCblpYUk9ZWFJwZG1VN1hHNWNibHh1WEc0dktpb3FLaW9xS2lvcUtpb3FLaW9xS2lwY2JpQXFLaUJYUlVKUVFVTkxJRVpQVDFSRlVseHVJQ29xSUM0dmZpOXNiMlJoYzJndmFXNTBaWEp1WVd3dloyVjBUbUYwYVhabExtcHpYRzRnS2lvZ2JXOWtkV3hsSUdsa0lEMGdNVEZjYmlBcUtpQnRiMlIxYkdVZ1kyaDFibXR6SUQwZ01GeHVJQ29xTHlJc0luWmhjaUJwYzBaMWJtTjBhVzl1SUQwZ2NtVnhkV2x5WlNnbkxpOXBjMFoxYm1OMGFXOXVKeWtzWEc0Z0lDQWdhWE5QWW1wbFkzUk1hV3RsSUQwZ2NtVnhkV2x5WlNnbkxpNHZhVzUwWlhKdVlXd3ZhWE5QWW1wbFkzUk1hV3RsSnlrN1hHNWNiaThxS2lCVmMyVmtJSFJ2SUdSbGRHVmpkQ0JvYjNOMElHTnZibk4wY25WamRHOXljeUFvVTJGbVlYSnBJRDRnTlNrdUlDb3ZYRzUyWVhJZ2NtVkpjMGh2YzNSRGRHOXlJRDBnTDE1Y1hGdHZZbXBsWTNRZ0xpcy9RMjl1YzNSeWRXTjBiM0pjWEYwa0x6dGNibHh1THlvcUlGVnpaV1FnWm05eUlHNWhkR2wyWlNCdFpYUm9iMlFnY21WbVpYSmxibU5sY3k0Z0tpOWNiblpoY2lCdlltcGxZM1JRY205MGJ5QTlJRTlpYW1WamRDNXdjbTkwYjNSNWNHVTdYRzVjYmk4cUtpQlZjMlZrSUhSdklISmxjMjlzZG1VZ2RHaGxJR1JsWTI5dGNHbHNaV1FnYzI5MWNtTmxJRzltSUdaMWJtTjBhVzl1Y3k0Z0tpOWNiblpoY2lCbWJsUnZVM1J5YVc1bklEMGdSblZ1WTNScGIyNHVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5PMXh1WEc0dktpb2dWWE5sWkNCMGJ5QmphR1ZqYXlCdlltcGxZM1J6SUdadmNpQnZkMjRnY0hKdmNHVnlkR2xsY3k0Z0tpOWNiblpoY2lCb1lYTlBkMjVRY205d1pYSjBlU0E5SUc5aWFtVmpkRkJ5YjNSdkxtaGhjMDkzYmxCeWIzQmxjblI1TzF4dVhHNHZLaW9nVlhObFpDQjBieUJrWlhSbFkzUWdhV1lnWVNCdFpYUm9iMlFnYVhNZ2JtRjBhWFpsTGlBcUwxeHVkbUZ5SUhKbFNYTk9ZWFJwZG1VZ1BTQlNaV2RGZUhBb0oxNG5JQ3RjYmlBZ1ptNVViMU4wY21sdVp5NWpZV3hzS0doaGMwOTNibEJ5YjNCbGNuUjVLUzV5WlhCc1lXTmxLQzliWEZ4Y1hGNGtMaW9yUHlncFcxeGNYWHQ5ZkYwdlp5d2dKMXhjWEZ3a0ppY3BYRzRnSUM1eVpYQnNZV05sS0M5b1lYTlBkMjVRY205d1pYSjBlWHdvWm5WdVkzUnBiMjRwTGlvL0tEODlYRnhjWEZ4Y0tDbDhJR1p2Y2lBdUt6OG9QejFjWEZ4Y1hGeGRLUzluTENBbkpERXVLajhuS1NBcklDY2tKMXh1S1R0Y2JseHVMeW9xWEc0Z0tpQkRhR1ZqYTNNZ2FXWWdZSFpoYkhWbFlDQnBjeUJoSUc1aGRHbDJaU0JtZFc1amRHbHZiaTVjYmlBcVhHNGdLaUJBYzNSaGRHbGpYRzRnS2lCQWJXVnRZbVZ5VDJZZ1gxeHVJQ29nUUdOaGRHVm5iM0o1SUV4aGJtZGNiaUFxSUVCd1lYSmhiU0I3S24wZ2RtRnNkV1VnVkdobElIWmhiSFZsSUhSdklHTm9aV05yTGx4dUlDb2dRSEpsZEhWeWJuTWdlMkp2YjJ4bFlXNTlJRkpsZEhWeWJuTWdZSFJ5ZFdWZ0lHbG1JR0IyWVd4MVpXQWdhWE1nWVNCdVlYUnBkbVVnWm5WdVkzUnBiMjRzSUdWc2MyVWdZR1poYkhObFlDNWNiaUFxSUVCbGVHRnRjR3hsWEc0Z0tseHVJQ29nWHk1cGMwNWhkR2wyWlNoQmNuSmhlUzV3Y205MGIzUjVjR1V1Y0hWemFDazdYRzRnS2lBdkx5QTlQaUIwY25WbFhHNGdLbHh1SUNvZ1h5NXBjMDVoZEdsMlpTaGZLVHRjYmlBcUlDOHZJRDArSUdaaGJITmxYRzRnS2k5Y2JtWjFibU4wYVc5dUlHbHpUbUYwYVhabEtIWmhiSFZsS1NCN1hHNGdJR2xtSUNoMllXeDFaU0E5UFNCdWRXeHNLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHWmhiSE5sTzF4dUlDQjlYRzRnSUdsbUlDaHBjMFoxYm1OMGFXOXVLSFpoYkhWbEtTa2dlMXh1SUNBZ0lISmxkSFZ5YmlCeVpVbHpUbUYwYVhabExuUmxjM1FvWm01VWIxTjBjbWx1Wnk1allXeHNLSFpoYkhWbEtTazdYRzRnSUgxY2JpQWdjbVYwZFhKdUlHbHpUMkpxWldOMFRHbHJaU2gyWVd4MVpTa2dKaVlnY21WSmMwaHZjM1JEZEc5eUxuUmxjM1FvZG1Gc2RXVXBPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHbHpUbUYwYVhabE8xeHVYRzVjYmx4dUx5b3FLaW9xS2lvcUtpb3FLaW9xS2lvcVhHNGdLaW9nVjBWQ1VFRkRTeUJHVDA5VVJWSmNiaUFxS2lBdUwzNHZiRzlrWVhOb0wyeGhibWN2YVhOT1lYUnBkbVV1YW5OY2JpQXFLaUJ0YjJSMWJHVWdhV1FnUFNBeE1seHVJQ29xSUcxdlpIVnNaU0JqYUhWdWEzTWdQU0F3WEc0Z0tpb3ZJaXdpZG1GeUlHbHpUMkpxWldOMElEMGdjbVZ4ZFdseVpTZ25MaTlwYzA5aWFtVmpkQ2NwTzF4dVhHNHZLaW9nWUU5aWFtVmpkQ04wYjFOMGNtbHVaMkFnY21WemRXeDBJSEpsWm1WeVpXNWpaWE11SUNvdlhHNTJZWElnWm5WdVkxUmhaeUE5SUNkYmIySnFaV04wSUVaMWJtTjBhVzl1WFNjN1hHNWNiaThxS2lCVmMyVmtJR1p2Y2lCdVlYUnBkbVVnYldWMGFHOWtJSEpsWm1WeVpXNWpaWE11SUNvdlhHNTJZWElnYjJKcVpXTjBVSEp2ZEc4Z1BTQlBZbXBsWTNRdWNISnZkRzkwZVhCbE8xeHVYRzR2S2lwY2JpQXFJRlZ6WldRZ2RHOGdjbVZ6YjJ4MlpTQjBhR1VnVzJCMGIxTjBjbWx1WjFSaFoyQmRLR2gwZEhBNkx5OWxZMjFoTFdsdWRHVnlibUYwYVc5dVlXd3ViM0puTDJWamJXRXRNall5THpZdU1DOGpjMlZqTFc5aWFtVmpkQzV3Y205MGIzUjVjR1V1ZEc5emRISnBibWNwWEc0Z0tpQnZaaUIyWVd4MVpYTXVYRzRnS2k5Y2JuWmhjaUJ2WW1wVWIxTjBjbWx1WnlBOUlHOWlhbVZqZEZCeWIzUnZMblJ2VTNSeWFXNW5PMXh1WEc0dktpcGNiaUFxSUVOb1pXTnJjeUJwWmlCZ2RtRnNkV1ZnSUdseklHTnNZWE56YVdacFpXUWdZWE1nWVNCZ1JuVnVZM1JwYjI1Z0lHOWlhbVZqZEM1Y2JpQXFYRzRnS2lCQWMzUmhkR2xqWEc0Z0tpQkFiV1Z0WW1WeVQyWWdYMXh1SUNvZ1FHTmhkR1ZuYjNKNUlFeGhibWRjYmlBcUlFQndZWEpoYlNCN0tuMGdkbUZzZFdVZ1ZHaGxJSFpoYkhWbElIUnZJR05vWldOckxseHVJQ29nUUhKbGRIVnlibk1nZTJKdmIyeGxZVzU5SUZKbGRIVnlibk1nWUhSeWRXVmdJR2xtSUdCMllXeDFaV0FnYVhNZ1kyOXljbVZqZEd4NUlHTnNZWE56YVdacFpXUXNJR1ZzYzJVZ1lHWmhiSE5sWUM1Y2JpQXFJRUJsZUdGdGNHeGxYRzRnS2x4dUlDb2dYeTVwYzBaMWJtTjBhVzl1S0Y4cE8xeHVJQ29nTHk4Z1BUNGdkSEoxWlZ4dUlDcGNiaUFxSUY4dWFYTkdkVzVqZEdsdmJpZ3ZZV0pqTHlrN1hHNGdLaUF2THlBOVBpQm1ZV3h6WlZ4dUlDb3ZYRzVtZFc1amRHbHZiaUJwYzBaMWJtTjBhVzl1S0haaGJIVmxLU0I3WEc0Z0lDOHZJRlJvWlNCMWMyVWdiMllnWUU5aWFtVmpkQ04wYjFOMGNtbHVaMkFnWVhadmFXUnpJR2x6YzNWbGN5QjNhWFJvSUhSb1pTQmdkSGx3Wlc5bVlDQnZjR1Z5WVhSdmNseHVJQ0F2THlCcGJpQnZiR1JsY2lCMlpYSnphVzl1Y3lCdlppQkRhSEp2YldVZ1lXNWtJRk5oWm1GeWFTQjNhR2xqYUNCeVpYUjFjbTRnSjJaMWJtTjBhVzl1SnlCbWIzSWdjbVZuWlhobGMxeHVJQ0F2THlCaGJtUWdVMkZtWVhKcElEZ2dkMmhwWTJnZ2NtVjBkWEp1Y3lBbmIySnFaV04wSnlCbWIzSWdkSGx3WldRZ1lYSnlZWGtnWTI5dWMzUnlkV04wYjNKekxseHVJQ0J5WlhSMWNtNGdhWE5QWW1wbFkzUW9kbUZzZFdVcElDWW1JRzlpYWxSdlUzUnlhVzVuTG1OaGJHd29kbUZzZFdVcElEMDlJR1oxYm1OVVlXYzdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ2FYTkdkVzVqZEdsdmJqdGNibHh1WEc1Y2JpOHFLaW9xS2lvcUtpb3FLaW9xS2lvcUtseHVJQ29xSUZkRlFsQkJRMHNnUms5UFZFVlNYRzRnS2lvZ0xpOStMMnh2WkdGemFDOXNZVzVuTDJselJuVnVZM1JwYjI0dWFuTmNiaUFxS2lCdGIyUjFiR1VnYVdRZ1BTQXhNMXh1SUNvcUlHMXZaSFZzWlNCamFIVnVhM01nUFNBd1hHNGdLaW92SWl3aUx5b3FYRzRnS2lCRGFHVmphM01nYVdZZ1lIWmhiSFZsWUNCcGN5QnZZbXBsWTNRdGJHbHJaUzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FIQmhjbUZ0SUhzcWZTQjJZV3gxWlNCVWFHVWdkbUZzZFdVZ2RHOGdZMmhsWTJzdVhHNGdLaUJBY21WMGRYSnVjeUI3WW05dmJHVmhibjBnVW1WMGRYSnVjeUJnZEhKMVpXQWdhV1lnWUhaaGJIVmxZQ0JwY3lCdlltcGxZM1F0YkdsclpTd2daV3h6WlNCZ1ptRnNjMlZnTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJwYzA5aWFtVmpkRXhwYTJVb2RtRnNkV1VwSUh0Y2JpQWdjbVYwZFhKdUlDRWhkbUZzZFdVZ0ppWWdkSGx3Wlc5bUlIWmhiSFZsSUQwOUlDZHZZbXBsWTNRbk8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdselQySnFaV04wVEdsclpUdGNibHh1WEc1Y2JpOHFLaW9xS2lvcUtpb3FLaW9xS2lvcUtseHVJQ29xSUZkRlFsQkJRMHNnUms5UFZFVlNYRzRnS2lvZ0xpOStMMnh2WkdGemFDOXBiblJsY201aGJDOXBjMDlpYW1WamRFeHBhMlV1YW5OY2JpQXFLaUJ0YjJSMWJHVWdhV1FnUFNBeE5GeHVJQ29xSUcxdlpIVnNaU0JqYUhWdWEzTWdQU0F3WEc0Z0tpb3ZJaXdpZG1GeUlHZGxkRXhsYm1kMGFDQTlJSEpsY1hWcGNtVW9KeTR2WjJWMFRHVnVaM1JvSnlrc1hHNGdJQ0FnYVhOTVpXNW5kR2dnUFNCeVpYRjFhWEpsS0NjdUwybHpUR1Z1WjNSb0p5azdYRzVjYmk4cUtseHVJQ29nUTJobFkydHpJR2xtSUdCMllXeDFaV0FnYVhNZ1lYSnlZWGt0YkdsclpTNWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUhCaGNtRnRJSHNxZlNCMllXeDFaU0JVYUdVZ2RtRnNkV1VnZEc4Z1kyaGxZMnN1WEc0Z0tpQkFjbVYwZFhKdWN5QjdZbTl2YkdWaGJuMGdVbVYwZFhKdWN5QmdkSEoxWldBZ2FXWWdZSFpoYkhWbFlDQnBjeUJoY25KaGVTMXNhV3RsTENCbGJITmxJR0JtWVd4elpXQXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHbHpRWEp5WVhsTWFXdGxLSFpoYkhWbEtTQjdYRzRnSUhKbGRIVnliaUIyWVd4MVpTQWhQU0J1ZFd4c0lDWW1JR2x6VEdWdVozUm9LR2RsZEV4bGJtZDBhQ2gyWVd4MVpTa3BPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHbHpRWEp5WVhsTWFXdGxPMXh1WEc1Y2JseHVMeW9xS2lvcUtpb3FLaW9xS2lvcUtpb3FYRzRnS2lvZ1YwVkNVRUZEU3lCR1QwOVVSVkpjYmlBcUtpQXVMMzR2Ykc5a1lYTm9MMmx1ZEdWeWJtRnNMMmx6UVhKeVlYbE1hV3RsTG1welhHNGdLaW9nYlc5a2RXeGxJR2xrSUQwZ01UVmNiaUFxS2lCdGIyUjFiR1VnWTJoMWJtdHpJRDBnTUZ4dUlDb3FMeUlzSW5aaGNpQmlZWE5sVUhKdmNHVnlkSGtnUFNCeVpYRjFhWEpsS0NjdUwySmhjMlZRY205d1pYSjBlU2NwTzF4dVhHNHZLaXBjYmlBcUlFZGxkSE1nZEdobElGd2liR1Z1WjNSb1hDSWdjSEp2Y0dWeWRIa2dkbUZzZFdVZ2IyWWdZRzlpYW1WamRHQXVYRzRnS2x4dUlDb2dLaXBPYjNSbE9pb3FJRlJvYVhNZ1puVnVZM1JwYjI0Z2FYTWdkWE5sWkNCMGJ5QmhkbTlwWkNCaElGdEtTVlFnWW5WblhTaG9kSFJ3Y3pvdkwySjFaM011ZDJWaWEybDBMbTl5Wnk5emFHOTNYMkoxWnk1aloyay9hV1E5TVRReU56a3lLVnh1SUNvZ2RHaGhkQ0JoWm1abFkzUnpJRk5oWm1GeWFTQnZiaUJoZENCc1pXRnpkQ0JwVDFNZ09DNHhMVGd1TXlCQlVrMDJOQzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FIQmhjbUZ0SUh0UFltcGxZM1I5SUc5aWFtVmpkQ0JVYUdVZ2IySnFaV04wSUhSdklIRjFaWEo1TGx4dUlDb2dRSEpsZEhWeWJuTWdleXA5SUZKbGRIVnlibk1nZEdobElGd2liR1Z1WjNSb1hDSWdkbUZzZFdVdVhHNGdLaTljYm5aaGNpQm5aWFJNWlc1bmRHZ2dQU0JpWVhObFVISnZjR1Z5ZEhrb0oyeGxibWQwYUNjcE8xeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR2RsZEV4bGJtZDBhRHRjYmx4dVhHNWNiaThxS2lvcUtpb3FLaW9xS2lvcUtpb3FLbHh1SUNvcUlGZEZRbEJCUTBzZ1JrOVBWRVZTWEc0Z0tpb2dMaTkrTDJ4dlpHRnphQzlwYm5SbGNtNWhiQzluWlhSTVpXNW5kR2d1YW5OY2JpQXFLaUJ0YjJSMWJHVWdhV1FnUFNBeE5seHVJQ29xSUcxdlpIVnNaU0JqYUhWdWEzTWdQU0F3WEc0Z0tpb3ZJaXdpTHlvcVhHNGdLaUJVYUdVZ1ltRnpaU0JwYlhCc1pXMWxiblJoZEdsdmJpQnZaaUJnWHk1d2NtOXdaWEowZVdBZ2QybDBhRzkxZENCemRYQndiM0owSUdadmNpQmtaV1Z3SUhCaGRHaHpMbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWNHRnlZVzBnZTNOMGNtbHVaMzBnYTJWNUlGUm9aU0JyWlhrZ2IyWWdkR2hsSUhCeWIzQmxjblI1SUhSdklHZGxkQzVjYmlBcUlFQnlaWFIxY201eklIdEdkVzVqZEdsdmJuMGdVbVYwZFhKdWN5QjBhR1VnYm1WM0lHWjFibU4wYVc5dUxseHVJQ292WEc1bWRXNWpkR2x2YmlCaVlYTmxVSEp2Y0dWeWRIa29hMlY1S1NCN1hHNGdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpaHZZbXBsWTNRcElIdGNiaUFnSUNCeVpYUjFjbTRnYjJKcVpXTjBJRDA5SUc1MWJHd2dQeUIxYm1SbFptbHVaV1FnT2lCdlltcGxZM1JiYTJWNVhUdGNiaUFnZlR0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JpWVhObFVISnZjR1Z5ZEhrN1hHNWNibHh1WEc0dktpb3FLaW9xS2lvcUtpb3FLaW9xS2lwY2JpQXFLaUJYUlVKUVFVTkxJRVpQVDFSRlVseHVJQ29xSUM0dmZpOXNiMlJoYzJndmFXNTBaWEp1WVd3dlltRnpaVkJ5YjNCbGNuUjVMbXB6WEc0Z0tpb2diVzlrZFd4bElHbGtJRDBnTVRkY2JpQXFLaUJ0YjJSMWJHVWdZMmgxYm10eklEMGdNRnh1SUNvcUx5SXNJaThxS2x4dUlDb2dWWE5sWkNCaGN5QjBhR1VnVzIxaGVHbHRkVzBnYkdWdVozUm9YU2hvZEhSd09pOHZaV050WVMxcGJuUmxjbTVoZEdsdmJtRnNMbTl5Wnk5bFkyMWhMVEkyTWk4MkxqQXZJM05sWXkxdWRXMWlaWEl1YldGNFgzTmhabVZmYVc1MFpXZGxjaWxjYmlBcUlHOW1JR0Z1SUdGeWNtRjVMV3hwYTJVZ2RtRnNkV1V1WEc0Z0tpOWNiblpoY2lCTlFWaGZVMEZHUlY5SlRsUkZSMFZTSUQwZ09UQXdOekU1T1RJMU5EYzBNRGs1TVR0Y2JseHVMeW9xWEc0Z0tpQkRhR1ZqYTNNZ2FXWWdZSFpoYkhWbFlDQnBjeUJoSUhaaGJHbGtJR0Z5Y21GNUxXeHBhMlVnYkdWdVozUm9MbHh1SUNwY2JpQXFJQ29xVG05MFpUb3FLaUJVYUdseklHWjFibU4wYVc5dUlHbHpJR0poYzJWa0lHOXVJRnRnVkc5TVpXNW5kR2hnWFNob2RIUndPaTh2WldOdFlTMXBiblJsY201aGRHbHZibUZzTG05eVp5OWxZMjFoTFRJMk1pODJMakF2STNObFl5MTBiMnhsYm1kMGFDa3VYRzRnS2x4dUlDb2dRSEJ5YVhaaGRHVmNiaUFxSUVCd1lYSmhiU0I3S24wZ2RtRnNkV1VnVkdobElIWmhiSFZsSUhSdklHTm9aV05yTGx4dUlDb2dRSEpsZEhWeWJuTWdlMkp2YjJ4bFlXNTlJRkpsZEhWeWJuTWdZSFJ5ZFdWZ0lHbG1JR0IyWVd4MVpXQWdhWE1nWVNCMllXeHBaQ0JzWlc1bmRHZ3NJR1ZzYzJVZ1lHWmhiSE5sWUM1Y2JpQXFMMXh1Wm5WdVkzUnBiMjRnYVhOTVpXNW5kR2dvZG1Gc2RXVXBJSHRjYmlBZ2NtVjBkWEp1SUhSNWNHVnZaaUIyWVd4MVpTQTlQU0FuYm5WdFltVnlKeUFtSmlCMllXeDFaU0ErSUMweElDWW1JSFpoYkhWbElDVWdNU0E5UFNBd0lDWW1JSFpoYkhWbElEdzlJRTFCV0Y5VFFVWkZYMGxPVkVWSFJWSTdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ2FYTk1aVzVuZEdnN1hHNWNibHh1WEc0dktpb3FLaW9xS2lvcUtpb3FLaW9xS2lwY2JpQXFLaUJYUlVKUVFVTkxJRVpQVDFSRlVseHVJQ29xSUM0dmZpOXNiMlJoYzJndmFXNTBaWEp1WVd3dmFYTk1aVzVuZEdndWFuTmNiaUFxS2lCdGIyUjFiR1VnYVdRZ1BTQXhPRnh1SUNvcUlHMXZaSFZzWlNCamFIVnVhM01nUFNBd1hHNGdLaW92SWl3aUx5b3FJRlZ6WldRZ1lYTWdkR2hsSUdCVWVYQmxSWEp5YjNKZ0lHMWxjM05oWjJVZ1ptOXlJRndpUm5WdVkzUnBiMjV6WENJZ2JXVjBhRzlrY3k0Z0tpOWNiblpoY2lCR1ZVNURYMFZTVWs5U1gxUkZXRlFnUFNBblJYaHdaV04wWldRZ1lTQm1kVzVqZEdsdmJpYzdYRzVjYmk4cUlFNWhkR2wyWlNCdFpYUm9iMlFnY21WbVpYSmxibU5sY3lCbWIzSWdkR2h2YzJVZ2QybDBhQ0IwYUdVZ2MyRnRaU0J1WVcxbElHRnpJRzkwYUdWeUlHQnNiMlJoYzJoZ0lHMWxkR2h2WkhNdUlDb3ZYRzUyWVhJZ2JtRjBhWFpsVFdGNElEMGdUV0YwYUM1dFlYZzdYRzVjYmk4cUtseHVJQ29nUTNKbFlYUmxjeUJoSUdaMWJtTjBhVzl1SUhSb1lYUWdhVzUyYjJ0bGN5QmdablZ1WTJBZ2QybDBhQ0IwYUdVZ1lIUm9hWE5nSUdKcGJtUnBibWNnYjJZZ2RHaGxYRzRnS2lCamNtVmhkR1ZrSUdaMWJtTjBhVzl1SUdGdVpDQmhjbWQxYldWdWRITWdabkp2YlNCZ2MzUmhjblJnSUdGdVpDQmlaWGx2Ym1RZ2NISnZkbWxrWldRZ1lYTWdZVzRnWVhKeVlYa3VYRzRnS2x4dUlDb2dLaXBPYjNSbE9pb3FJRlJvYVhNZ2JXVjBhRzlrSUdseklHSmhjMlZrSUc5dUlIUm9aU0JiY21WemRDQndZWEpoYldWMFpYSmRLR2gwZEhCek9pOHZaR1YyWld4dmNHVnlMbTF2ZW1sc2JHRXViM0puTDFkbFlpOUtZWFpoVTJOeWFYQjBMMUpsWm1WeVpXNWpaUzlHZFc1amRHbHZibk12Y21WemRGOXdZWEpoYldWMFpYSnpLUzVjYmlBcVhHNGdLaUJBYzNSaGRHbGpYRzRnS2lCQWJXVnRZbVZ5VDJZZ1gxeHVJQ29nUUdOaGRHVm5iM0o1SUVaMWJtTjBhVzl1WEc0Z0tpQkFjR0Z5WVcwZ2UwWjFibU4wYVc5dWZTQm1kVzVqSUZSb1pTQm1kVzVqZEdsdmJpQjBieUJoY0hCc2VTQmhJSEpsYzNRZ2NHRnlZVzFsZEdWeUlIUnZMbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUZ0emRHRnlkRDFtZFc1akxteGxibWQwYUMweFhTQlVhR1VnYzNSaGNuUWdjRzl6YVhScGIyNGdiMllnZEdobElISmxjM1FnY0dGeVlXMWxkR1Z5TGx4dUlDb2dRSEpsZEhWeWJuTWdlMFoxYm1OMGFXOXVmU0JTWlhSMWNtNXpJSFJvWlNCdVpYY2dablZ1WTNScGIyNHVYRzRnS2lCQVpYaGhiWEJzWlZ4dUlDcGNiaUFxSUhaaGNpQnpZWGtnUFNCZkxuSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpaDNhR0YwTENCdVlXMWxjeWtnZTF4dUlDb2dJQ0J5WlhSMWNtNGdkMmhoZENBcklDY2dKeUFySUY4dWFXNXBkR2xoYkNodVlXMWxjeWt1YW05cGJpZ25MQ0FuS1NBclhHNGdLaUFnSUNBZ0tGOHVjMmw2WlNodVlXMWxjeWtnUGlBeElEOGdKeXdnSmlBbklEb2dKeWNwSUNzZ1h5NXNZWE4wS0c1aGJXVnpLVHRjYmlBcUlIMHBPMXh1SUNwY2JpQXFJSE5oZVNnbmFHVnNiRzhuTENBblpuSmxaQ2NzSUNkaVlYSnVaWGtuTENBbmNHVmlZbXhsY3ljcE8xeHVJQ29nTHk4Z1BUNGdKMmhsYkd4dklHWnlaV1FzSUdKaGNtNWxlU3dnSmlCd1pXSmliR1Z6SjF4dUlDb3ZYRzVtZFc1amRHbHZiaUJ5WlhOMFVHRnlZVzBvWm5WdVl5d2djM1JoY25RcElIdGNiaUFnYVdZZ0tIUjVjR1Z2WmlCbWRXNWpJQ0U5SUNkbWRXNWpkR2x2YmljcElIdGNiaUFnSUNCMGFISnZkeUJ1WlhjZ1ZIbHdaVVZ5Y205eUtFWlZUa05mUlZKU1QxSmZWRVZZVkNrN1hHNGdJSDFjYmlBZ2MzUmhjblFnUFNCdVlYUnBkbVZOWVhnb2MzUmhjblFnUFQwOUlIVnVaR1ZtYVc1bFpDQS9JQ2htZFc1akxteGxibWQwYUNBdElERXBJRG9nS0N0emRHRnlkQ0I4ZkNBd0tTd2dNQ2s3WEc0Z0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlncElIdGNiaUFnSUNCMllYSWdZWEpuY3lBOUlHRnlaM1Z0Wlc1MGN5eGNiaUFnSUNBZ0lDQWdhVzVrWlhnZ1BTQXRNU3hjYmlBZ0lDQWdJQ0FnYkdWdVozUm9JRDBnYm1GMGFYWmxUV0Y0S0dGeVozTXViR1Z1WjNSb0lDMGdjM1JoY25Rc0lEQXBMRnh1SUNBZ0lDQWdJQ0J5WlhOMElEMGdRWEp5WVhrb2JHVnVaM1JvS1R0Y2JseHVJQ0FnSUhkb2FXeGxJQ2dySzJsdVpHVjRJRHdnYkdWdVozUm9LU0I3WEc0Z0lDQWdJQ0J5WlhOMFcybHVaR1Y0WFNBOUlHRnlaM05iYzNSaGNuUWdLeUJwYm1SbGVGMDdYRzRnSUNBZ2ZWeHVJQ0FnSUhOM2FYUmphQ0FvYzNSaGNuUXBJSHRjYmlBZ0lDQWdJR05oYzJVZ01Eb2djbVYwZFhKdUlHWjFibU11WTJGc2JDaDBhR2x6TENCeVpYTjBLVHRjYmlBZ0lDQWdJR05oYzJVZ01Ub2djbVYwZFhKdUlHWjFibU11WTJGc2JDaDBhR2x6TENCaGNtZHpXekJkTENCeVpYTjBLVHRjYmlBZ0lDQWdJR05oYzJVZ01qb2djbVYwZFhKdUlHWjFibU11WTJGc2JDaDBhR2x6TENCaGNtZHpXekJkTENCaGNtZHpXekZkTENCeVpYTjBLVHRjYmlBZ0lDQjlYRzRnSUNBZ2RtRnlJRzkwYUdWeVFYSm5jeUE5SUVGeWNtRjVLSE4wWVhKMElDc2dNU2s3WEc0Z0lDQWdhVzVrWlhnZ1BTQXRNVHRjYmlBZ0lDQjNhR2xzWlNBb0t5dHBibVJsZUNBOElITjBZWEowS1NCN1hHNGdJQ0FnSUNCdmRHaGxja0Z5WjNOYmFXNWtaWGhkSUQwZ1lYSm5jMXRwYm1SbGVGMDdYRzRnSUNBZ2ZWeHVJQ0FnSUc5MGFHVnlRWEpuYzF0emRHRnlkRjBnUFNCeVpYTjBPMXh1SUNBZ0lISmxkSFZ5YmlCbWRXNWpMbUZ3Y0d4NUtIUm9hWE1zSUc5MGFHVnlRWEpuY3lrN1hHNGdJSDA3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdjbVZ6ZEZCaGNtRnRPMXh1WEc1Y2JseHVMeW9xS2lvcUtpb3FLaW9xS2lvcUtpb3FYRzRnS2lvZ1YwVkNVRUZEU3lCR1QwOVVSVkpjYmlBcUtpQXVMMzR2Ykc5a1lYTm9MMloxYm1OMGFXOXVMM0psYzNSUVlYSmhiUzVxYzF4dUlDb3FJRzF2WkhWc1pTQnBaQ0E5SURFNVhHNGdLaW9nYlc5a2RXeGxJR05vZFc1cmN5QTlJREJjYmlBcUtpOGlMQ0oyWVhJZ1ltRnpaVVpzWVhSMFpXNGdQU0J5WlhGMWFYSmxLQ2N1TGk5cGJuUmxjbTVoYkM5aVlYTmxSbXhoZEhSbGJpY3BMRnh1SUNBZ0lHbHpTWFJsY21GMFpXVkRZV3hzSUQwZ2NtVnhkV2x5WlNnbkxpNHZhVzUwWlhKdVlXd3ZhWE5KZEdWeVlYUmxaVU5oYkd3bktUdGNibHh1THlvcVhHNGdLaUJHYkdGMGRHVnVjeUJoSUc1bGMzUmxaQ0JoY25KaGVTNGdTV1lnWUdselJHVmxjR0FnYVhNZ1lIUnlkV1ZnSUhSb1pTQmhjbkpoZVNCcGN5QnlaV04xY25OcGRtVnNlVnh1SUNvZ1pteGhkSFJsYm1Wa0xDQnZkR2hsY25kcGMyVWdhWFFuY3lCdmJteDVJR1pzWVhSMFpXNWxaQ0JoSUhOcGJtZHNaU0JzWlhabGJDNWNiaUFxWEc0Z0tpQkFjM1JoZEdsalhHNGdLaUJBYldWdFltVnlUMllnWDF4dUlDb2dRR05oZEdWbmIzSjVJRUZ5Y21GNVhHNGdLaUJBY0dGeVlXMGdlMEZ5Y21GNWZTQmhjbkpoZVNCVWFHVWdZWEp5WVhrZ2RHOGdabXhoZEhSbGJpNWNiaUFxSUVCd1lYSmhiU0I3WW05dmJHVmhibjBnVzJselJHVmxjRjBnVTNCbFkybG1lU0JoSUdSbFpYQWdabXhoZEhSbGJpNWNiaUFxSUVCd1lYSmhiUzBnZTA5aWFtVmpkSDBnVzJkMVlYSmtYU0JGYm1GaWJHVnpJSFZ6WlNCaGN5QmhJR05oYkd4aVlXTnJJR1p2Y2lCbWRXNWpkR2x2Ym5NZ2JHbHJaU0JnWHk1dFlYQmdMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UwRnljbUY1ZlNCU1pYUjFjbTV6SUhSb1pTQnVaWGNnWm14aGRIUmxibVZrSUdGeWNtRjVMbHh1SUNvZ1FHVjRZVzF3YkdWY2JpQXFYRzRnS2lCZkxtWnNZWFIwWlc0b1d6RXNJRnN5TENBekxDQmJORjFkWFNrN1hHNGdLaUF2THlBOVBpQmJNU3dnTWl3Z015d2dXelJkWFZ4dUlDcGNiaUFxSUM4dklIVnphVzVuSUdCcGMwUmxaWEJnWEc0Z0tpQmZMbVpzWVhSMFpXNG9XekVzSUZzeUxDQXpMQ0JiTkYxZFhTd2dkSEoxWlNrN1hHNGdLaUF2THlBOVBpQmJNU3dnTWl3Z015d2dORjFjYmlBcUwxeHVablZ1WTNScGIyNGdabXhoZEhSbGJpaGhjbkpoZVN3Z2FYTkVaV1Z3TENCbmRXRnlaQ2tnZTF4dUlDQjJZWElnYkdWdVozUm9JRDBnWVhKeVlYa2dQeUJoY25KaGVTNXNaVzVuZEdnZ09pQXdPMXh1SUNCcFppQW9aM1ZoY21RZ0ppWWdhWE5KZEdWeVlYUmxaVU5oYkd3b1lYSnlZWGtzSUdselJHVmxjQ3dnWjNWaGNtUXBLU0I3WEc0Z0lDQWdhWE5FWldWd0lEMGdabUZzYzJVN1hHNGdJSDFjYmlBZ2NtVjBkWEp1SUd4bGJtZDBhQ0EvSUdKaGMyVkdiR0YwZEdWdUtHRnljbUY1TENCcGMwUmxaWEFwSURvZ1cxMDdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1pteGhkSFJsYmp0Y2JseHVYRzVjYmk4cUtpb3FLaW9xS2lvcUtpb3FLaW9xS2x4dUlDb3FJRmRGUWxCQlEwc2dSazlQVkVWU1hHNGdLaW9nTGk5K0wyeHZaR0Z6YUM5aGNuSmhlUzltYkdGMGRHVnVMbXB6WEc0Z0tpb2diVzlrZFd4bElHbGtJRDBnTWpCY2JpQXFLaUJ0YjJSMWJHVWdZMmgxYm10eklEMGdNRnh1SUNvcUx5SXNJblpoY2lCaGNuSmhlVkIxYzJnZ1BTQnlaWEYxYVhKbEtDY3VMMkZ5Y21GNVVIVnphQ2NwTEZ4dUlDQWdJR2x6UVhKbmRXMWxiblJ6SUQwZ2NtVnhkV2x5WlNnbkxpNHZiR0Z1Wnk5cGMwRnlaM1Z0Wlc1MGN5Y3BMRnh1SUNBZ0lHbHpRWEp5WVhrZ1BTQnlaWEYxYVhKbEtDY3VMaTlzWVc1bkwybHpRWEp5WVhrbktTeGNiaUFnSUNCcGMwRnljbUY1VEdsclpTQTlJSEpsY1hWcGNtVW9KeTR2YVhOQmNuSmhlVXhwYTJVbktTeGNiaUFnSUNCcGMwOWlhbVZqZEV4cGEyVWdQU0J5WlhGMWFYSmxLQ2N1TDJselQySnFaV04wVEdsclpTY3BPMXh1WEc0dktpcGNiaUFxSUZSb1pTQmlZWE5sSUdsdGNHeGxiV1Z1ZEdGMGFXOXVJRzltSUdCZkxtWnNZWFIwWlc1Z0lIZHBkR2dnWVdSa1pXUWdjM1Z3Y0c5eWRDQm1iM0lnY21WemRISnBZM1JwYm1kY2JpQXFJR1pzWVhSMFpXNXBibWNnWVc1a0lITndaV05wWm5scGJtY2dkR2hsSUhOMFlYSjBJR2x1WkdWNExseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdlMEZ5Y21GNWZTQmhjbkpoZVNCVWFHVWdZWEp5WVhrZ2RHOGdabXhoZEhSbGJpNWNiaUFxSUVCd1lYSmhiU0I3WW05dmJHVmhibjBnVzJselJHVmxjRjBnVTNCbFkybG1lU0JoSUdSbFpYQWdabXhoZEhSbGJpNWNiaUFxSUVCd1lYSmhiU0I3WW05dmJHVmhibjBnVzJselUzUnlhV04wWFNCU1pYTjBjbWxqZENCbWJHRjBkR1Z1YVc1bklIUnZJR0Z5Y21GNWN5MXNhV3RsSUc5aWFtVmpkSE11WEc0Z0tpQkFjR0Z5WVcwZ2UwRnljbUY1ZlNCYmNtVnpkV3gwUFZ0ZFhTQlVhR1VnYVc1cGRHbGhiQ0J5WlhOMWJIUWdkbUZzZFdVdVhHNGdLaUJBY21WMGRYSnVjeUI3UVhKeVlYbDlJRkpsZEhWeWJuTWdkR2hsSUc1bGR5Qm1iR0YwZEdWdVpXUWdZWEp5WVhrdVhHNGdLaTljYm1aMWJtTjBhVzl1SUdKaGMyVkdiR0YwZEdWdUtHRnljbUY1TENCcGMwUmxaWEFzSUdselUzUnlhV04wTENCeVpYTjFiSFFwSUh0Y2JpQWdjbVZ6ZFd4MElIeDhJQ2h5WlhOMWJIUWdQU0JiWFNrN1hHNWNiaUFnZG1GeUlHbHVaR1Y0SUQwZ0xURXNYRzRnSUNBZ0lDQnNaVzVuZEdnZ1BTQmhjbkpoZVM1c1pXNW5kR2c3WEc1Y2JpQWdkMmhwYkdVZ0tDc3JhVzVrWlhnZ1BDQnNaVzVuZEdncElIdGNiaUFnSUNCMllYSWdkbUZzZFdVZ1BTQmhjbkpoZVZ0cGJtUmxlRjA3WEc0Z0lDQWdhV1lnS0dselQySnFaV04wVEdsclpTaDJZV3gxWlNrZ0ppWWdhWE5CY25KaGVVeHBhMlVvZG1Gc2RXVXBJQ1ltWEc0Z0lDQWdJQ0FnSUNocGMxTjBjbWxqZENCOGZDQnBjMEZ5Y21GNUtIWmhiSFZsS1NCOGZDQnBjMEZ5WjNWdFpXNTBjeWgyWVd4MVpTa3BLU0I3WEc0Z0lDQWdJQ0JwWmlBb2FYTkVaV1Z3S1NCN1hHNGdJQ0FnSUNBZ0lDOHZJRkpsWTNWeWMybDJaV3g1SUdac1lYUjBaVzRnWVhKeVlYbHpJQ2h6ZFhOalpYQjBhV0pzWlNCMGJ5QmpZV3hzSUhOMFlXTnJJR3hwYldsMGN5a3VYRzRnSUNBZ0lDQWdJR0poYzJWR2JHRjBkR1Z1S0haaGJIVmxMQ0JwYzBSbFpYQXNJR2x6VTNSeWFXTjBMQ0J5WlhOMWJIUXBPMXh1SUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdZWEp5WVhsUWRYTm9LSEpsYzNWc2RDd2dkbUZzZFdVcE8xeHVJQ0FnSUNBZ2ZWeHVJQ0FnSUgwZ1pXeHpaU0JwWmlBb0lXbHpVM1J5YVdOMEtTQjdYRzRnSUNBZ0lDQnlaWE4xYkhSYmNtVnpkV3gwTG14bGJtZDBhRjBnUFNCMllXeDFaVHRjYmlBZ0lDQjlYRzRnSUgxY2JpQWdjbVYwZFhKdUlISmxjM1ZzZER0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JpWVhObFJteGhkSFJsYmp0Y2JseHVYRzVjYmk4cUtpb3FLaW9xS2lvcUtpb3FLaW9xS2x4dUlDb3FJRmRGUWxCQlEwc2dSazlQVkVWU1hHNGdLaW9nTGk5K0wyeHZaR0Z6YUM5cGJuUmxjbTVoYkM5aVlYTmxSbXhoZEhSbGJpNXFjMXh1SUNvcUlHMXZaSFZzWlNCcFpDQTlJREl4WEc0Z0tpb2diVzlrZFd4bElHTm9kVzVyY3lBOUlEQmNiaUFxS2k4aUxDSXZLaXBjYmlBcUlFRndjR1Z1WkhNZ2RHaGxJR1ZzWlcxbGJuUnpJRzltSUdCMllXeDFaWE5nSUhSdklHQmhjbkpoZVdBdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ3WVhKaGJTQjdRWEp5WVhsOUlHRnljbUY1SUZSb1pTQmhjbkpoZVNCMGJ5QnRiMlJwWm5rdVhHNGdLaUJBY0dGeVlXMGdlMEZ5Y21GNWZTQjJZV3gxWlhNZ1ZHaGxJSFpoYkhWbGN5QjBieUJoY0hCbGJtUXVYRzRnS2lCQWNtVjBkWEp1Y3lCN1FYSnlZWGw5SUZKbGRIVnlibk1nWUdGeWNtRjVZQzVjYmlBcUwxeHVablZ1WTNScGIyNGdZWEp5WVhsUWRYTm9LR0Z5Y21GNUxDQjJZV3gxWlhNcElIdGNiaUFnZG1GeUlHbHVaR1Y0SUQwZ0xURXNYRzRnSUNBZ0lDQnNaVzVuZEdnZ1BTQjJZV3gxWlhNdWJHVnVaM1JvTEZ4dUlDQWdJQ0FnYjJabWMyVjBJRDBnWVhKeVlYa3ViR1Z1WjNSb08xeHVYRzRnSUhkb2FXeGxJQ2dySzJsdVpHVjRJRHdnYkdWdVozUm9LU0I3WEc0Z0lDQWdZWEp5WVhsYmIyWm1jMlYwSUNzZ2FXNWtaWGhkSUQwZ2RtRnNkV1Z6VzJsdVpHVjRYVHRjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdZWEp5WVhrN1hHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnWVhKeVlYbFFkWE5vTzF4dVhHNWNibHh1THlvcUtpb3FLaW9xS2lvcUtpb3FLaW9xWEc0Z0tpb2dWMFZDVUVGRFN5QkdUMDlVUlZKY2JpQXFLaUF1TDM0dmJHOWtZWE5vTDJsdWRHVnlibUZzTDJGeWNtRjVVSFZ6YUM1cWMxeHVJQ29xSUcxdlpIVnNaU0JwWkNBOUlESXlYRzRnS2lvZ2JXOWtkV3hsSUdOb2RXNXJjeUE5SURCY2JpQXFLaThpTENKMllYSWdhWE5CY25KaGVVeHBhMlVnUFNCeVpYRjFhWEpsS0NjdUxpOXBiblJsY201aGJDOXBjMEZ5Y21GNVRHbHJaU2NwTEZ4dUlDQWdJR2x6VDJKcVpXTjBUR2xyWlNBOUlISmxjWFZwY21Vb0p5NHVMMmx1ZEdWeWJtRnNMMmx6VDJKcVpXTjBUR2xyWlNjcE8xeHVYRzR2S2lvZ1ZYTmxaQ0JtYjNJZ2JtRjBhWFpsSUcxbGRHaHZaQ0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUc5aWFtVmpkRkJ5YjNSdklEMGdUMkpxWldOMExuQnliM1J2ZEhsd1pUdGNibHh1THlvcUlGVnpaV1FnZEc4Z1kyaGxZMnNnYjJKcVpXTjBjeUJtYjNJZ2IzZHVJSEJ5YjNCbGNuUnBaWE11SUNvdlhHNTJZWElnYUdGelQzZHVVSEp2Y0dWeWRIa2dQU0J2WW1wbFkzUlFjbTkwYnk1b1lYTlBkMjVRY205d1pYSjBlVHRjYmx4dUx5b3FJRTVoZEdsMlpTQnRaWFJvYjJRZ2NtVm1aWEpsYm1ObGN5NGdLaTljYm5aaGNpQndjbTl3WlhKMGVVbHpSVzUxYldWeVlXSnNaU0E5SUc5aWFtVmpkRkJ5YjNSdkxuQnliM0JsY25SNVNYTkZiblZ0WlhKaFlteGxPMXh1WEc0dktpcGNiaUFxSUVOb1pXTnJjeUJwWmlCZ2RtRnNkV1ZnSUdseklHTnNZWE56YVdacFpXUWdZWE1nWVc0Z1lHRnlaM1Z0Wlc1MGMyQWdiMkpxWldOMExseHVJQ3BjYmlBcUlFQnpkR0YwYVdOY2JpQXFJRUJ0WlcxaVpYSlBaaUJmWEc0Z0tpQkFZMkYwWldkdmNua2dUR0Z1WjF4dUlDb2dRSEJoY21GdElIc3FmU0IyWVd4MVpTQlVhR1VnZG1Gc2RXVWdkRzhnWTJobFkyc3VYRzRnS2lCQWNtVjBkWEp1Y3lCN1ltOXZiR1ZoYm4wZ1VtVjBkWEp1Y3lCZ2RISjFaV0FnYVdZZ1lIWmhiSFZsWUNCcGN5QmpiM0p5WldOMGJIa2dZMnhoYzNOcFptbGxaQ3dnWld4elpTQmdabUZzYzJWZ0xseHVJQ29nUUdWNFlXMXdiR1ZjYmlBcVhHNGdLaUJmTG1selFYSm5kVzFsYm5SektHWjFibU4wYVc5dUtDa2dleUJ5WlhSMWNtNGdZWEpuZFcxbGJuUnpPeUI5S0NrcE8xeHVJQ29nTHk4Z1BUNGdkSEoxWlZ4dUlDcGNiaUFxSUY4dWFYTkJjbWQxYldWdWRITW9XekVzSURJc0lETmRLVHRjYmlBcUlDOHZJRDArSUdaaGJITmxYRzRnS2k5Y2JtWjFibU4wYVc5dUlHbHpRWEpuZFcxbGJuUnpLSFpoYkhWbEtTQjdYRzRnSUhKbGRIVnliaUJwYzA5aWFtVmpkRXhwYTJVb2RtRnNkV1VwSUNZbUlHbHpRWEp5WVhsTWFXdGxLSFpoYkhWbEtTQW1KbHh1SUNBZ0lHaGhjMDkzYmxCeWIzQmxjblI1TG1OaGJHd29kbUZzZFdVc0lDZGpZV3hzWldVbktTQW1KaUFoY0hKdmNHVnlkSGxKYzBWdWRXMWxjbUZpYkdVdVkyRnNiQ2gyWVd4MVpTd2dKMk5oYkd4bFpTY3BPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHbHpRWEpuZFcxbGJuUnpPMXh1WEc1Y2JseHVMeW9xS2lvcUtpb3FLaW9xS2lvcUtpb3FYRzRnS2lvZ1YwVkNVRUZEU3lCR1QwOVVSVkpjYmlBcUtpQXVMMzR2Ykc5a1lYTm9MMnhoYm1jdmFYTkJjbWQxYldWdWRITXVhbk5jYmlBcUtpQnRiMlIxYkdVZ2FXUWdQU0F5TTF4dUlDb3FJRzF2WkhWc1pTQmphSFZ1YTNNZ1BTQXdYRzRnS2lvdklpd2lkbUZ5SUdkbGRFNWhkR2wyWlNBOUlISmxjWFZwY21Vb0p5NHVMMmx1ZEdWeWJtRnNMMmRsZEU1aGRHbDJaU2NwTEZ4dUlDQWdJR2x6VEdWdVozUm9JRDBnY21WeGRXbHlaU2duTGk0dmFXNTBaWEp1WVd3dmFYTk1aVzVuZEdnbktTeGNiaUFnSUNCcGMwOWlhbVZqZEV4cGEyVWdQU0J5WlhGMWFYSmxLQ2N1TGk5cGJuUmxjbTVoYkM5cGMwOWlhbVZqZEV4cGEyVW5LVHRjYmx4dUx5b3FJR0JQWW1wbFkzUWpkRzlUZEhKcGJtZGdJSEpsYzNWc2RDQnlaV1psY21WdVkyVnpMaUFxTDF4dWRtRnlJR0Z5Y21GNVZHRm5JRDBnSjF0dlltcGxZM1FnUVhKeVlYbGRKenRjYmx4dUx5b3FJRlZ6WldRZ1ptOXlJRzVoZEdsMlpTQnRaWFJvYjJRZ2NtVm1aWEpsYm1ObGN5NGdLaTljYm5aaGNpQnZZbXBsWTNSUWNtOTBieUE5SUU5aWFtVmpkQzV3Y205MGIzUjVjR1U3WEc1Y2JpOHFLbHh1SUNvZ1ZYTmxaQ0IwYnlCeVpYTnZiSFpsSUhSb1pTQmJZSFJ2VTNSeWFXNW5WR0ZuWUYwb2FIUjBjRG92TDJWamJXRXRhVzUwWlhKdVlYUnBiMjVoYkM1dmNtY3ZaV050WVMweU5qSXZOaTR3THlOelpXTXRiMkpxWldOMExuQnliM1J2ZEhsd1pTNTBiM04wY21sdVp5bGNiaUFxSUc5bUlIWmhiSFZsY3k1Y2JpQXFMMXh1ZG1GeUlHOWlhbFJ2VTNSeWFXNW5JRDBnYjJKcVpXTjBVSEp2ZEc4dWRHOVRkSEpwYm1jN1hHNWNiaThxSUU1aGRHbDJaU0J0WlhSb2IyUWdjbVZtWlhKbGJtTmxjeUJtYjNJZ2RHaHZjMlVnZDJsMGFDQjBhR1VnYzJGdFpTQnVZVzFsSUdGeklHOTBhR1Z5SUdCc2IyUmhjMmhnSUcxbGRHaHZaSE11SUNvdlhHNTJZWElnYm1GMGFYWmxTWE5CY25KaGVTQTlJR2RsZEU1aGRHbDJaU2hCY25KaGVTd2dKMmx6UVhKeVlYa25LVHRjYmx4dUx5b3FYRzRnS2lCRGFHVmphM01nYVdZZ1lIWmhiSFZsWUNCcGN5QmpiR0Z6YzJsbWFXVmtJR0Z6SUdGdUlHQkJjbkpoZVdBZ2IySnFaV04wTGx4dUlDcGNiaUFxSUVCemRHRjBhV05jYmlBcUlFQnRaVzFpWlhKUFppQmZYRzRnS2lCQVkyRjBaV2R2Y25rZ1RHRnVaMXh1SUNvZ1FIQmhjbUZ0SUhzcWZTQjJZV3gxWlNCVWFHVWdkbUZzZFdVZ2RHOGdZMmhsWTJzdVhHNGdLaUJBY21WMGRYSnVjeUI3WW05dmJHVmhibjBnVW1WMGRYSnVjeUJnZEhKMVpXQWdhV1lnWUhaaGJIVmxZQ0JwY3lCamIzSnlaV04wYkhrZ1kyeGhjM05wWm1sbFpDd2daV3h6WlNCZ1ptRnNjMlZnTGx4dUlDb2dRR1Y0WVcxd2JHVmNiaUFxWEc0Z0tpQmZMbWx6UVhKeVlYa29XekVzSURJc0lETmRLVHRjYmlBcUlDOHZJRDArSUhSeWRXVmNiaUFxWEc0Z0tpQmZMbWx6UVhKeVlYa29ablZ1WTNScGIyNG9LU0I3SUhKbGRIVnliaUJoY21kMWJXVnVkSE03SUgwb0tTazdYRzRnS2lBdkx5QTlQaUJtWVd4elpWeHVJQ292WEc1MllYSWdhWE5CY25KaGVTQTlJRzVoZEdsMlpVbHpRWEp5WVhrZ2ZId2dablZ1WTNScGIyNG9kbUZzZFdVcElIdGNiaUFnY21WMGRYSnVJR2x6VDJKcVpXTjBUR2xyWlNoMllXeDFaU2tnSmlZZ2FYTk1aVzVuZEdnb2RtRnNkV1V1YkdWdVozUm9LU0FtSmlCdlltcFViMU4wY21sdVp5NWpZV3hzS0haaGJIVmxLU0E5UFNCaGNuSmhlVlJoWnp0Y2JuMDdYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnYVhOQmNuSmhlVHRjYmx4dVhHNWNiaThxS2lvcUtpb3FLaW9xS2lvcUtpb3FLbHh1SUNvcUlGZEZRbEJCUTBzZ1JrOVBWRVZTWEc0Z0tpb2dMaTkrTDJ4dlpHRnphQzlzWVc1bkwybHpRWEp5WVhrdWFuTmNiaUFxS2lCdGIyUjFiR1VnYVdRZ1BTQXlORnh1SUNvcUlHMXZaSFZzWlNCamFIVnVhM01nUFNBd1hHNGdLaW92SWl3aWRtRnlJR2x6UVhKeVlYbE1hV3RsSUQwZ2NtVnhkV2x5WlNnbkxpOXBjMEZ5Y21GNVRHbHJaU2NwTEZ4dUlDQWdJR2x6U1c1a1pYZ2dQU0J5WlhGMWFYSmxLQ2N1TDJselNXNWtaWGduS1N4Y2JpQWdJQ0JwYzA5aWFtVmpkQ0E5SUhKbGNYVnBjbVVvSnk0dUwyeGhibWN2YVhOUFltcGxZM1FuS1R0Y2JseHVMeW9xWEc0Z0tpQkRhR1ZqYTNNZ2FXWWdkR2hsSUhCeWIzWnBaR1ZrSUdGeVozVnRaVzUwY3lCaGNtVWdabkp2YlNCaGJpQnBkR1Z5WVhSbFpTQmpZV3hzTGx4dUlDcGNiaUFxSUVCd2NtbDJZWFJsWEc0Z0tpQkFjR0Z5WVcwZ2V5cDlJSFpoYkhWbElGUm9aU0J3YjNSbGJuUnBZV3dnYVhSbGNtRjBaV1VnZG1Gc2RXVWdZWEpuZFcxbGJuUXVYRzRnS2lCQWNHRnlZVzBnZXlwOUlHbHVaR1Y0SUZSb1pTQndiM1JsYm5ScFlXd2dhWFJsY21GMFpXVWdhVzVrWlhnZ2IzSWdhMlY1SUdGeVozVnRaVzUwTGx4dUlDb2dRSEJoY21GdElIc3FmU0J2WW1wbFkzUWdWR2hsSUhCdmRHVnVkR2xoYkNCcGRHVnlZWFJsWlNCdlltcGxZM1FnWVhKbmRXMWxiblF1WEc0Z0tpQkFjbVYwZFhKdWN5QjdZbTl2YkdWaGJuMGdVbVYwZFhKdWN5QmdkSEoxWldBZ2FXWWdkR2hsSUdGeVozVnRaVzUwY3lCaGNtVWdabkp2YlNCaGJpQnBkR1Z5WVhSbFpTQmpZV3hzTENCbGJITmxJR0JtWVd4elpXQXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHbHpTWFJsY21GMFpXVkRZV3hzS0haaGJIVmxMQ0JwYm1SbGVDd2diMkpxWldOMEtTQjdYRzRnSUdsbUlDZ2hhWE5QWW1wbFkzUW9iMkpxWldOMEtTa2dlMXh1SUNBZ0lISmxkSFZ5YmlCbVlXeHpaVHRjYmlBZ2ZWeHVJQ0IyWVhJZ2RIbHdaU0E5SUhSNWNHVnZaaUJwYm1SbGVEdGNiaUFnYVdZZ0tIUjVjR1VnUFQwZ0oyNTFiV0psY2lkY2JpQWdJQ0FnSUQ4Z0tHbHpRWEp5WVhsTWFXdGxLRzlpYW1WamRDa2dKaVlnYVhOSmJtUmxlQ2hwYm1SbGVDd2diMkpxWldOMExteGxibWQwYUNrcFhHNGdJQ0FnSUNBNklDaDBlWEJsSUQwOUlDZHpkSEpwYm1jbklDWW1JR2x1WkdWNElHbHVJRzlpYW1WamRDa3BJSHRjYmlBZ0lDQjJZWElnYjNSb1pYSWdQU0J2WW1wbFkzUmJhVzVrWlhoZE8xeHVJQ0FnSUhKbGRIVnliaUIyWVd4MVpTQTlQVDBnZG1Gc2RXVWdQeUFvZG1Gc2RXVWdQVDA5SUc5MGFHVnlLU0E2SUNodmRHaGxjaUFoUFQwZ2IzUm9aWElwTzF4dUlDQjlYRzRnSUhKbGRIVnliaUJtWVd4elpUdGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCcGMwbDBaWEpoZEdWbFEyRnNiRHRjYmx4dVhHNWNiaThxS2lvcUtpb3FLaW9xS2lvcUtpb3FLbHh1SUNvcUlGZEZRbEJCUTBzZ1JrOVBWRVZTWEc0Z0tpb2dMaTkrTDJ4dlpHRnphQzlwYm5SbGNtNWhiQzlwYzBsMFpYSmhkR1ZsUTJGc2JDNXFjMXh1SUNvcUlHMXZaSFZzWlNCcFpDQTlJREkxWEc0Z0tpb2diVzlrZFd4bElHTm9kVzVyY3lBOUlEQmNiaUFxS2k4aUxDSXZLaW9nVlhObFpDQjBieUJrWlhSbFkzUWdkVzV6YVdkdVpXUWdhVzUwWldkbGNpQjJZV3gxWlhNdUlDb3ZYRzUyWVhJZ2NtVkpjMVZwYm5RZ1BTQXZYbHhjWkNza0x6dGNibHh1THlvcVhHNGdLaUJWYzJWa0lHRnpJSFJvWlNCYmJXRjRhVzExYlNCc1pXNW5kR2hkS0doMGRIQTZMeTlsWTIxaExXbHVkR1Z5Ym1GMGFXOXVZV3d1YjNKbkwyVmpiV0V0TWpZeUx6WXVNQzhqYzJWakxXNTFiV0psY2k1dFlYaGZjMkZtWlY5cGJuUmxaMlZ5S1Z4dUlDb2diMllnWVc0Z1lYSnlZWGt0YkdsclpTQjJZV3gxWlM1Y2JpQXFMMXh1ZG1GeUlFMUJXRjlUUVVaRlgwbE9WRVZIUlZJZ1BTQTVNREEzTVRrNU1qVTBOelF3T1RreE8xeHVYRzR2S2lwY2JpQXFJRU5vWldOcmN5QnBaaUJnZG1Gc2RXVmdJR2x6SUdFZ2RtRnNhV1FnWVhKeVlYa3RiR2xyWlNCcGJtUmxlQzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FIQmhjbUZ0SUhzcWZTQjJZV3gxWlNCVWFHVWdkbUZzZFdVZ2RHOGdZMmhsWTJzdVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXMnhsYm1kMGFEMU5RVmhmVTBGR1JWOUpUbFJGUjBWU1hTQlVhR1VnZFhCd1pYSWdZbTkxYm1SeklHOW1JR0VnZG1Gc2FXUWdhVzVrWlhndVhHNGdLaUJBY21WMGRYSnVjeUI3WW05dmJHVmhibjBnVW1WMGRYSnVjeUJnZEhKMVpXQWdhV1lnWUhaaGJIVmxZQ0JwY3lCaElIWmhiR2xrSUdsdVpHVjRMQ0JsYkhObElHQm1ZV3h6WldBdVhHNGdLaTljYm1aMWJtTjBhVzl1SUdselNXNWtaWGdvZG1Gc2RXVXNJR3hsYm1kMGFDa2dlMXh1SUNCMllXeDFaU0E5SUNoMGVYQmxiMllnZG1Gc2RXVWdQVDBnSjI1MWJXSmxjaWNnZkh3Z2NtVkpjMVZwYm5RdWRHVnpkQ2gyWVd4MVpTa3BJRDhnSzNaaGJIVmxJRG9nTFRFN1hHNGdJR3hsYm1kMGFDQTlJR3hsYm1kMGFDQTlQU0J1ZFd4c0lEOGdUVUZZWDFOQlJrVmZTVTVVUlVkRlVpQTZJR3hsYm1kMGFEdGNiaUFnY21WMGRYSnVJSFpoYkhWbElENGdMVEVnSmlZZ2RtRnNkV1VnSlNBeElEMDlJREFnSmlZZ2RtRnNkV1VnUENCc1pXNW5kR2c3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdhWE5KYm1SbGVEdGNibHh1WEc1Y2JpOHFLaW9xS2lvcUtpb3FLaW9xS2lvcUtseHVJQ29xSUZkRlFsQkJRMHNnUms5UFZFVlNYRzRnS2lvZ0xpOStMMnh2WkdGemFDOXBiblJsY201aGJDOXBjMGx1WkdWNExtcHpYRzRnS2lvZ2JXOWtkV3hsSUdsa0lEMGdNalpjYmlBcUtpQnRiMlIxYkdVZ1kyaDFibXR6SUQwZ01GeHVJQ29xTHlJc0lpZDFjMlVnYzNSeWFXTjBKenRjYmx4dWFXMXdiM0owSUhWdWFYRjFaU0JtY205dElDZHNiMlJoYzJndllYSnlZWGt2ZFc1cGNYVmxKenRjYmx4dVpYaHdiM0owSUdSbFptRjFiSFFnS0c5c1pGQmhjbUZ0Y3l3Z2JtVjNVR0Z5WVcxektTQTlQaUI3WEc0Z0lHeGxkQ0J2YkdSTFpYbHpJRDBnVDJKcVpXTjBMbXRsZVhNb2IyeGtVR0Z5WVcxektUdGNiaUFnYkdWMElHNWxkMHRsZVhNZ1BTQlBZbXBsWTNRdWEyVjVjeWh1WlhkUVlYSmhiWE1wTzF4dVhHNGdJR3hsZENCaGJHeExaWGx6SUQwZ2RXNXBjWFZsS0c5c1pFdGxlWE11WTI5dVkyRjBLRzVsZDB0bGVYTXBLVHRjYmx4dUlDQnlaWFIxY200Z1lXeHNTMlY1Y3k1bWFXeDBaWElvYTJWNUlEMCtJSHRjYmlBZ0lDQnNaWFFnYjJ4a1ZtRnNkV1VnUFNCdmJHUlFZWEpoYlhOYmEyVjVYVHRjYmlBZ0lDQnNaWFFnYm1WM1ZtRnNkV1VnUFNCdVpYZFFZWEpoYlhOYmEyVjVYVHRjYmx4dUlDQWdJQzhxSUdoaGJtUnNaU0JPWVU0Z0tpOWNiaUFnSUNCcFppQW9iMnhrVm1Gc2RXVWdJVDA5SUc5c1pGWmhiSFZsSUNZbUlHNWxkMVpoYkhWbElDRTlQU0J1WlhkV1lXeDFaU2tnZTF4dUlDQWdJQ0FnTHlvZ1ltOTBhQ0J2YkdSV1lXeDFaU0JoYm1RZ2JtVjNWbUZzZFdVZ1pYRjFZV3dnVG1GT0lDb3ZYRzRnSUNBZ0lDQnlaWFIxY200Z1ptRnNjMlU3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdjbVYwZFhKdUlHOXNaRlpoYkhWbElDRTlQU0J1WlhkV1lXeDFaVHRjYmlBZ2ZTazdYRzU5TzF4dVhHNWNibHh1THlvcUlGZEZRbEJCUTBzZ1JrOVBWRVZTSUNvcVhHNGdLaW9nTGk5cVlYWmhjMk55YVhCMEwydGxlWE5YYVhSb1EyaGhibWRsWkZaaGJIVmxjeTVxYzF4dUlDb3FMeUlzSW0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnY21WeGRXbHlaU2duTGk5MWJtbHhKeWs3WEc1Y2JseHVYRzR2S2lvcUtpb3FLaW9xS2lvcUtpb3FLaXBjYmlBcUtpQlhSVUpRUVVOTElFWlBUMVJGVWx4dUlDb3FJQzR2Zmk5c2IyUmhjMmd2WVhKeVlYa3ZkVzVwY1hWbExtcHpYRzRnS2lvZ2JXOWtkV3hsSUdsa0lEMGdNamhjYmlBcUtpQnRiMlIxYkdVZ1kyaDFibXR6SUQwZ01GeHVJQ29xTHlJc0luWmhjaUJpWVhObFEyRnNiR0poWTJzZ1BTQnlaWEYxYVhKbEtDY3VMaTlwYm5SbGNtNWhiQzlpWVhObFEyRnNiR0poWTJzbktTeGNiaUFnSUNCaVlYTmxWVzVwY1NBOUlISmxjWFZwY21Vb0p5NHVMMmx1ZEdWeWJtRnNMMkpoYzJWVmJtbHhKeWtzWEc0Z0lDQWdhWE5KZEdWeVlYUmxaVU5oYkd3Z1BTQnlaWEYxYVhKbEtDY3VMaTlwYm5SbGNtNWhiQzlwYzBsMFpYSmhkR1ZsUTJGc2JDY3BMRnh1SUNBZ0lITnZjblJsWkZWdWFYRWdQU0J5WlhGMWFYSmxLQ2N1TGk5cGJuUmxjbTVoYkM5emIzSjBaV1JWYm1seEp5azdYRzVjYmk4cUtseHVJQ29nUTNKbFlYUmxjeUJoSUdSMWNHeHBZMkYwWlMxbWNtVmxJSFpsY25OcGIyNGdiMllnWVc0Z1lYSnlZWGtzSUhWemFXNW5YRzRnS2lCYllGTmhiV1ZXWVd4MVpWcGxjbTlnWFNob2RIUndPaTh2WldOdFlTMXBiblJsY201aGRHbHZibUZzTG05eVp5OWxZMjFoTFRJMk1pODJMakF2STNObFl5MXpZVzFsZG1Gc2RXVjZaWEp2S1Z4dUlDb2dabTl5SUdWeGRXRnNhWFI1SUdOdmJYQmhjbWx6YjI1ekxDQnBiaUIzYUdsamFDQnZibXg1SUhSb1pTQm1hWEp6ZENCdlkyTjFjbVZ1WTJVZ2IyWWdaV0ZqYUNCbGJHVnRaVzUwWEc0Z0tpQnBjeUJyWlhCMExpQlFjbTkyYVdScGJtY2dZSFJ5ZFdWZ0lHWnZjaUJnYVhOVGIzSjBaV1JnSUhCbGNtWnZjbTF6SUdFZ1ptRnpkR1Z5SUhObFlYSmphQ0JoYkdkdmNtbDBhRzFjYmlBcUlHWnZjaUJ6YjNKMFpXUWdZWEp5WVhsekxpQkpaaUJoYmlCcGRHVnlZWFJsWlNCbWRXNWpkR2x2YmlCcGN5QndjbTkyYVdSbFpDQnBkQ2R6SUdsdWRtOXJaV1FnWm05eVhHNGdLaUJsWVdOb0lHVnNaVzFsYm5RZ2FXNGdkR2hsSUdGeWNtRjVJSFJ2SUdkbGJtVnlZWFJsSUhSb1pTQmpjbWwwWlhKcGIyNGdZbmtnZDJocFkyZ2dkVzVwY1hWbGJtVnpjMXh1SUNvZ2FYTWdZMjl0Y0hWMFpXUXVJRlJvWlNCZ2FYUmxjbUYwWldWZ0lHbHpJR0p2ZFc1a0lIUnZJR0IwYUdselFYSm5ZQ0JoYm1RZ2FXNTJiMnRsWkNCM2FYUm9JSFJvY21WbFhHNGdLaUJoY21kMWJXVnVkSE02SUNoMllXeDFaU3dnYVc1a1pYZ3NJR0Z5Y21GNUtTNWNiaUFxWEc0Z0tpQkpaaUJoSUhCeWIzQmxjblI1SUc1aGJXVWdhWE1nY0hKdmRtbGtaV1FnWm05eUlHQnBkR1Z5WVhSbFpXQWdkR2hsSUdOeVpXRjBaV1FnWUY4dWNISnZjR1Z5ZEhsZ1hHNGdLaUJ6ZEhsc1pTQmpZV3hzWW1GamF5QnlaWFIxY201eklIUm9aU0J3Y205d1pYSjBlU0IyWVd4MVpTQnZaaUIwYUdVZ1oybDJaVzRnWld4bGJXVnVkQzVjYmlBcVhHNGdLaUJKWmlCaElIWmhiSFZsSUdseklHRnNjMjhnY0hKdmRtbGtaV1FnWm05eUlHQjBhR2x6UVhKbllDQjBhR1VnWTNKbFlYUmxaQ0JnWHk1dFlYUmphR1Z6VUhKdmNHVnlkSGxnWEc0Z0tpQnpkSGxzWlNCallXeHNZbUZqYXlCeVpYUjFjbTV6SUdCMGNuVmxZQ0JtYjNJZ1pXeGxiV1Z1ZEhNZ2RHaGhkQ0JvWVhabElHRWdiV0YwWTJocGJtY2djSEp2Y0dWeWRIbGNiaUFxSUhaaGJIVmxMQ0JsYkhObElHQm1ZV3h6WldBdVhHNGdLbHh1SUNvZ1NXWWdZVzRnYjJKcVpXTjBJR2x6SUhCeWIzWnBaR1ZrSUdadmNpQmdhWFJsY21GMFpXVmdJSFJvWlNCamNtVmhkR1ZrSUdCZkxtMWhkR05vWlhOZ0lITjBlV3hsWEc0Z0tpQmpZV3hzWW1GamF5QnlaWFIxY201eklHQjBjblZsWUNCbWIzSWdaV3hsYldWdWRITWdkR2hoZENCb1lYWmxJSFJvWlNCd2NtOXdaWEowYVdWeklHOW1JSFJvWlNCbmFYWmxibHh1SUNvZ2IySnFaV04wTENCbGJITmxJR0JtWVd4elpXQXVYRzRnS2x4dUlDb2dRSE4wWVhScFkxeHVJQ29nUUcxbGJXSmxjazltSUY5Y2JpQXFJRUJoYkdsaGN5QjFibWx4ZFdWY2JpQXFJRUJqWVhSbFoyOXllU0JCY25KaGVWeHVJQ29nUUhCaGNtRnRJSHRCY25KaGVYMGdZWEp5WVhrZ1ZHaGxJR0Z5Y21GNUlIUnZJR2x1YzNCbFkzUXVYRzRnS2lCQWNHRnlZVzBnZTJKdmIyeGxZVzU5SUZ0cGMxTnZjblJsWkYwZ1UzQmxZMmxtZVNCMGFHVWdZWEp5WVhrZ2FYTWdjMjl5ZEdWa0xseHVJQ29nUUhCaGNtRnRJSHRHZFc1amRHbHZibnhQWW1wbFkzUjhjM1J5YVc1bmZTQmJhWFJsY21GMFpXVmRJRlJvWlNCbWRXNWpkR2x2YmlCcGJuWnZhMlZrSUhCbGNpQnBkR1Z5WVhScGIyNHVYRzRnS2lCQWNHRnlZVzBnZXlwOUlGdDBhR2x6UVhKblhTQlVhR1VnWUhSb2FYTmdJR0pwYm1ScGJtY2diMllnWUdsMFpYSmhkR1ZsWUM1Y2JpQXFJRUJ5WlhSMWNtNXpJSHRCY25KaGVYMGdVbVYwZFhKdWN5QjBhR1VnYm1WM0lHUjFjR3hwWTJGMFpTMTJZV3gxWlMxbWNtVmxJR0Z5Y21GNUxseHVJQ29nUUdWNFlXMXdiR1ZjYmlBcVhHNGdLaUJmTG5WdWFYRW9XeklzSURFc0lESmRLVHRjYmlBcUlDOHZJRDArSUZzeUxDQXhYVnh1SUNwY2JpQXFJQzh2SUhWemFXNW5JR0JwYzFOdmNuUmxaR0JjYmlBcUlGOHVkVzVwY1NoYk1Td2dNU3dnTWwwc0lIUnlkV1VwTzF4dUlDb2dMeThnUFQ0Z1d6RXNJREpkWEc0Z0tseHVJQ29nTHk4Z2RYTnBibWNnWVc0Z2FYUmxjbUYwWldVZ1puVnVZM1JwYjI1Y2JpQXFJRjh1ZFc1cGNTaGJNU3dnTWk0MUxDQXhMalVzSURKZExDQm1kVzVqZEdsdmJpaHVLU0I3WEc0Z0tpQWdJSEpsZEhWeWJpQjBhR2x6TG1ac2IyOXlLRzRwTzF4dUlDb2dmU3dnVFdGMGFDazdYRzRnS2lBdkx5QTlQaUJiTVN3Z01pNDFYVnh1SUNwY2JpQXFJQzh2SUhWemFXNW5JSFJvWlNCZ1h5NXdjbTl3WlhKMGVXQWdZMkZzYkdKaFkyc2djMmh2Y25Sb1lXNWtYRzRnS2lCZkxuVnVhWEVvVzNzZ0ozZ25PaUF4SUgwc0lIc2dKM2duT2lBeUlIMHNJSHNnSjNnbk9pQXhJSDFkTENBbmVDY3BPMXh1SUNvZ0x5OGdQVDRnVzNzZ0ozZ25PaUF4SUgwc0lIc2dKM2duT2lBeUlIMWRYRzRnS2k5Y2JtWjFibU4wYVc5dUlIVnVhWEVvWVhKeVlYa3NJR2x6VTI5eWRHVmtMQ0JwZEdWeVlYUmxaU3dnZEdocGMwRnlaeWtnZTF4dUlDQjJZWElnYkdWdVozUm9JRDBnWVhKeVlYa2dQeUJoY25KaGVTNXNaVzVuZEdnZ09pQXdPMXh1SUNCcFppQW9JV3hsYm1kMGFDa2dlMXh1SUNBZ0lISmxkSFZ5YmlCYlhUdGNiaUFnZlZ4dUlDQnBaaUFvYVhOVGIzSjBaV1FnSVQwZ2JuVnNiQ0FtSmlCMGVYQmxiMllnYVhOVGIzSjBaV1FnSVQwZ0oySnZiMnhsWVc0bktTQjdYRzRnSUNBZ2RHaHBjMEZ5WnlBOUlHbDBaWEpoZEdWbE8xeHVJQ0FnSUdsMFpYSmhkR1ZsSUQwZ2FYTkpkR1Z5WVhSbFpVTmhiR3dvWVhKeVlYa3NJR2x6VTI5eWRHVmtMQ0IwYUdselFYSm5LU0EvSUhWdVpHVm1hVzVsWkNBNklHbHpVMjl5ZEdWa08xeHVJQ0FnSUdselUyOXlkR1ZrSUQwZ1ptRnNjMlU3WEc0Z0lIMWNiaUFnYVhSbGNtRjBaV1VnUFNCcGRHVnlZWFJsWlNBOVBTQnVkV3hzSUQ4Z2FYUmxjbUYwWldVZ09pQmlZWE5sUTJGc2JHSmhZMnNvYVhSbGNtRjBaV1VzSUhSb2FYTkJjbWNzSURNcE8xeHVJQ0J5WlhSMWNtNGdLR2x6VTI5eWRHVmtLVnh1SUNBZ0lEOGdjMjl5ZEdWa1ZXNXBjU2hoY25KaGVTd2dhWFJsY21GMFpXVXBYRzRnSUNBZ09pQmlZWE5sVlc1cGNTaGhjbkpoZVN3Z2FYUmxjbUYwWldVcE8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUhWdWFYRTdYRzVjYmx4dVhHNHZLaW9xS2lvcUtpb3FLaW9xS2lvcUtpcGNiaUFxS2lCWFJVSlFRVU5MSUVaUFQxUkZVbHh1SUNvcUlDNHZmaTlzYjJSaGMyZ3ZZWEp5WVhrdmRXNXBjUzVxYzF4dUlDb3FJRzF2WkhWc1pTQnBaQ0E5SURJNVhHNGdLaW9nYlc5a2RXeGxJR05vZFc1cmN5QTlJREJjYmlBcUtpOGlMQ0oyWVhJZ1ltRnpaVTFoZEdOb1pYTWdQU0J5WlhGMWFYSmxLQ2N1TDJKaGMyVk5ZWFJqYUdWekp5a3NYRzRnSUNBZ1ltRnpaVTFoZEdOb1pYTlFjbTl3WlhKMGVTQTlJSEpsY1hWcGNtVW9KeTR2WW1GelpVMWhkR05vWlhOUWNtOXdaWEowZVNjcExGeHVJQ0FnSUdKcGJtUkRZV3hzWW1GamF5QTlJSEpsY1hWcGNtVW9KeTR2WW1sdVpFTmhiR3hpWVdOckp5a3NYRzRnSUNBZ2FXUmxiblJwZEhrZ1BTQnlaWEYxYVhKbEtDY3VMaTkxZEdsc2FYUjVMMmxrWlc1MGFYUjVKeWtzWEc0Z0lDQWdjSEp2Y0dWeWRIa2dQU0J5WlhGMWFYSmxLQ2N1TGk5MWRHbHNhWFI1TDNCeWIzQmxjblI1SnlrN1hHNWNiaThxS2x4dUlDb2dWR2hsSUdKaGMyVWdhVzF3YkdWdFpXNTBZWFJwYjI0Z2IyWWdZRjh1WTJGc2JHSmhZMnRnSUhkb2FXTm9JSE4xY0hCdmNuUnpJSE53WldOcFpubHBibWNnZEdobFhHNGdLaUJ1ZFcxaVpYSWdiMllnWVhKbmRXMWxiblJ6SUhSdklIQnliM1pwWkdVZ2RHOGdZR1oxYm1OZ0xseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdleXA5SUZ0bWRXNWpQVjh1YVdSbGJuUnBkSGxkSUZSb1pTQjJZV3gxWlNCMGJ5QmpiMjUyWlhKMElIUnZJR0VnWTJGc2JHSmhZMnN1WEc0Z0tpQkFjR0Z5WVcwZ2V5cDlJRnQwYUdselFYSm5YU0JVYUdVZ1lIUm9hWE5nSUdKcGJtUnBibWNnYjJZZ1lHWjFibU5nTGx4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlGdGhjbWREYjNWdWRGMGdWR2hsSUc1MWJXSmxjaUJ2WmlCaGNtZDFiV1Z1ZEhNZ2RHOGdjSEp2ZG1sa1pTQjBieUJnWm5WdVkyQXVYRzRnS2lCQWNtVjBkWEp1Y3lCN1JuVnVZM1JwYjI1OUlGSmxkSFZ5Ym5NZ2RHaGxJR05oYkd4aVlXTnJMbHh1SUNvdlhHNW1kVzVqZEdsdmJpQmlZWE5sUTJGc2JHSmhZMnNvWm5WdVl5d2dkR2hwYzBGeVp5d2dZWEpuUTI5MWJuUXBJSHRjYmlBZ2RtRnlJSFI1Y0dVZ1BTQjBlWEJsYjJZZ1puVnVZenRjYmlBZ2FXWWdLSFI1Y0dVZ1BUMGdKMloxYm1OMGFXOXVKeWtnZTF4dUlDQWdJSEpsZEhWeWJpQjBhR2x6UVhKbklEMDlQU0IxYm1SbFptbHVaV1JjYmlBZ0lDQWdJRDhnWm5WdVkxeHVJQ0FnSUNBZ09pQmlhVzVrUTJGc2JHSmhZMnNvWm5WdVl5d2dkR2hwYzBGeVp5d2dZWEpuUTI5MWJuUXBPMXh1SUNCOVhHNGdJR2xtSUNobWRXNWpJRDA5SUc1MWJHd3BJSHRjYmlBZ0lDQnlaWFIxY200Z2FXUmxiblJwZEhrN1hHNGdJSDFjYmlBZ2FXWWdLSFI1Y0dVZ1BUMGdKMjlpYW1WamRDY3BJSHRjYmlBZ0lDQnlaWFIxY200Z1ltRnpaVTFoZEdOb1pYTW9ablZ1WXlrN1hHNGdJSDFjYmlBZ2NtVjBkWEp1SUhSb2FYTkJjbWNnUFQwOUlIVnVaR1ZtYVc1bFpGeHVJQ0FnSUQ4Z2NISnZjR1Z5ZEhrb1puVnVZeWxjYmlBZ0lDQTZJR0poYzJWTllYUmphR1Z6VUhKdmNHVnlkSGtvWm5WdVl5d2dkR2hwYzBGeVp5azdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1ltRnpaVU5oYkd4aVlXTnJPMXh1WEc1Y2JseHVMeW9xS2lvcUtpb3FLaW9xS2lvcUtpb3FYRzRnS2lvZ1YwVkNVRUZEU3lCR1QwOVVSVkpjYmlBcUtpQXVMMzR2Ykc5a1lYTm9MMmx1ZEdWeWJtRnNMMkpoYzJWRFlXeHNZbUZqYXk1cWMxeHVJQ29xSUcxdlpIVnNaU0JwWkNBOUlETXdYRzRnS2lvZ2JXOWtkV3hsSUdOb2RXNXJjeUE5SURCY2JpQXFLaThpTENKMllYSWdZbUZ6WlVselRXRjBZMmdnUFNCeVpYRjFhWEpsS0NjdUwySmhjMlZKYzAxaGRHTm9KeWtzWEc0Z0lDQWdaMlYwVFdGMFkyaEVZWFJoSUQwZ2NtVnhkV2x5WlNnbkxpOW5aWFJOWVhSamFFUmhkR0VuS1N4Y2JpQWdJQ0IwYjA5aWFtVmpkQ0E5SUhKbGNYVnBjbVVvSnk0dmRHOVBZbXBsWTNRbktUdGNibHh1THlvcVhHNGdLaUJVYUdVZ1ltRnpaU0JwYlhCc1pXMWxiblJoZEdsdmJpQnZaaUJnWHk1dFlYUmphR1Z6WUNCM2FHbGphQ0JrYjJWeklHNXZkQ0JqYkc5dVpTQmdjMjkxY21ObFlDNWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUhCaGNtRnRJSHRQWW1wbFkzUjlJSE52ZFhKalpTQlVhR1VnYjJKcVpXTjBJRzltSUhCeWIzQmxjblI1SUhaaGJIVmxjeUIwYnlCdFlYUmphQzVjYmlBcUlFQnlaWFIxY201eklIdEdkVzVqZEdsdmJuMGdVbVYwZFhKdWN5QjBhR1VnYm1WM0lHWjFibU4wYVc5dUxseHVJQ292WEc1bWRXNWpkR2x2YmlCaVlYTmxUV0YwWTJobGN5aHpiM1Z5WTJVcElIdGNiaUFnZG1GeUlHMWhkR05vUkdGMFlTQTlJR2RsZEUxaGRHTm9SR0YwWVNoemIzVnlZMlVwTzF4dUlDQnBaaUFvYldGMFkyaEVZWFJoTG14bGJtZDBhQ0E5UFNBeElDWW1JRzFoZEdOb1JHRjBZVnN3WFZzeVhTa2dlMXh1SUNBZ0lIWmhjaUJyWlhrZ1BTQnRZWFJqYUVSaGRHRmJNRjFiTUYwc1hHNGdJQ0FnSUNBZ0lIWmhiSFZsSUQwZ2JXRjBZMmhFWVhSaFd6QmRXekZkTzF4dVhHNGdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVLRzlpYW1WamRDa2dlMXh1SUNBZ0lDQWdhV1lnS0c5aWFtVmpkQ0E5UFNCdWRXeHNLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJtWVd4elpUdGNiaUFnSUNBZ0lIMWNiaUFnSUNBZ0lISmxkSFZ5YmlCdlltcGxZM1JiYTJWNVhTQTlQVDBnZG1Gc2RXVWdKaVlnS0haaGJIVmxJQ0U5UFNCMWJtUmxabWx1WldRZ2ZId2dLR3RsZVNCcGJpQjBiMDlpYW1WamRDaHZZbXBsWTNRcEtTazdYRzRnSUNBZ2ZUdGNiaUFnZlZ4dUlDQnlaWFIxY200Z1puVnVZM1JwYjI0b2IySnFaV04wS1NCN1hHNGdJQ0FnY21WMGRYSnVJR0poYzJWSmMwMWhkR05vS0c5aWFtVmpkQ3dnYldGMFkyaEVZWFJoS1R0Y2JpQWdmVHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQmlZWE5sVFdGMFkyaGxjenRjYmx4dVhHNWNiaThxS2lvcUtpb3FLaW9xS2lvcUtpb3FLbHh1SUNvcUlGZEZRbEJCUTBzZ1JrOVBWRVZTWEc0Z0tpb2dMaTkrTDJ4dlpHRnphQzlwYm5SbGNtNWhiQzlpWVhObFRXRjBZMmhsY3k1cWMxeHVJQ29xSUcxdlpIVnNaU0JwWkNBOUlETXhYRzRnS2lvZ2JXOWtkV3hsSUdOb2RXNXJjeUE5SURCY2JpQXFLaThpTENKMllYSWdZbUZ6WlVselJYRjFZV3dnUFNCeVpYRjFhWEpsS0NjdUwySmhjMlZKYzBWeGRXRnNKeWtzWEc0Z0lDQWdkRzlQWW1wbFkzUWdQU0J5WlhGMWFYSmxLQ2N1TDNSdlQySnFaV04wSnlrN1hHNWNiaThxS2x4dUlDb2dWR2hsSUdKaGMyVWdhVzF3YkdWdFpXNTBZWFJwYjI0Z2IyWWdZRjh1YVhOTllYUmphR0FnZDJsMGFHOTFkQ0J6ZFhCd2IzSjBJR1p2Y2lCallXeHNZbUZqYTF4dUlDb2djMmh2Y25Sb1lXNWtjeUJoYm1RZ1lIUm9hWE5nSUdKcGJtUnBibWN1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCdlltcGxZM1FnVkdobElHOWlhbVZqZENCMGJ5QnBibk53WldOMExseHVJQ29nUUhCaGNtRnRJSHRCY25KaGVYMGdiV0YwWTJoRVlYUmhJRlJvWlNCd2NtOXdaWEo1SUc1aGJXVnpMQ0IyWVd4MVpYTXNJR0Z1WkNCamIyMXdZWEpsSUdac1lXZHpJSFJ2SUcxaGRHTm9MbHh1SUNvZ1FIQmhjbUZ0SUh0R2RXNWpkR2x2Ym4wZ1cyTjFjM1J2YldsNlpYSmRJRlJvWlNCbWRXNWpkR2x2YmlCMGJ5QmpkWE4wYjIxcGVtVWdZMjl0Y0dGeWFXNW5JRzlpYW1WamRITXVYRzRnS2lCQWNtVjBkWEp1Y3lCN1ltOXZiR1ZoYm4wZ1VtVjBkWEp1Y3lCZ2RISjFaV0FnYVdZZ1lHOWlhbVZqZEdBZ2FYTWdZU0J0WVhSamFDd2daV3h6WlNCZ1ptRnNjMlZnTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJpWVhObFNYTk5ZWFJqYUNodlltcGxZM1FzSUcxaGRHTm9SR0YwWVN3Z1kzVnpkRzl0YVhwbGNpa2dlMXh1SUNCMllYSWdhVzVrWlhnZ1BTQnRZWFJqYUVSaGRHRXViR1Z1WjNSb0xGeHVJQ0FnSUNBZ2JHVnVaM1JvSUQwZ2FXNWtaWGdzWEc0Z0lDQWdJQ0J1YjBOMWMzUnZiV2w2WlhJZ1BTQWhZM1Z6ZEc5dGFYcGxjanRjYmx4dUlDQnBaaUFvYjJKcVpXTjBJRDA5SUc1MWJHd3BJSHRjYmlBZ0lDQnlaWFIxY200Z0lXeGxibWQwYUR0Y2JpQWdmVnh1SUNCdlltcGxZM1FnUFNCMGIwOWlhbVZqZENodlltcGxZM1FwTzF4dUlDQjNhR2xzWlNBb2FXNWtaWGd0TFNrZ2UxeHVJQ0FnSUhaaGNpQmtZWFJoSUQwZ2JXRjBZMmhFWVhSaFcybHVaR1Y0WFR0Y2JpQWdJQ0JwWmlBb0tHNXZRM1Z6ZEc5dGFYcGxjaUFtSmlCa1lYUmhXekpkS1Z4dUlDQWdJQ0FnSUNBZ0lEOGdaR0YwWVZzeFhTQWhQVDBnYjJKcVpXTjBXMlJoZEdGYk1GMWRYRzRnSUNBZ0lDQWdJQ0FnT2lBaEtHUmhkR0ZiTUYwZ2FXNGdiMkpxWldOMEtWeHVJQ0FnSUNBZ0lDQXBJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQm1ZV3h6WlR0Y2JpQWdJQ0I5WEc0Z0lIMWNiaUFnZDJocGJHVWdLQ3NyYVc1a1pYZ2dQQ0JzWlc1bmRHZ3BJSHRjYmlBZ0lDQmtZWFJoSUQwZ2JXRjBZMmhFWVhSaFcybHVaR1Y0WFR0Y2JpQWdJQ0IyWVhJZ2EyVjVJRDBnWkdGMFlWc3dYU3hjYmlBZ0lDQWdJQ0FnYjJKcVZtRnNkV1VnUFNCdlltcGxZM1JiYTJWNVhTeGNiaUFnSUNBZ0lDQWdjM0pqVm1Gc2RXVWdQU0JrWVhSaFd6RmRPMXh1WEc0Z0lDQWdhV1lnS0c1dlEzVnpkRzl0YVhwbGNpQW1KaUJrWVhSaFd6SmRLU0I3WEc0Z0lDQWdJQ0JwWmlBb2IySnFWbUZzZFdVZ1BUMDlJSFZ1WkdWbWFXNWxaQ0FtSmlBaEtHdGxlU0JwYmlCdlltcGxZM1FwS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCbVlXeHpaVHRjYmlBZ0lDQWdJSDFjYmlBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ2RtRnlJSEpsYzNWc2RDQTlJR04xYzNSdmJXbDZaWElnUHlCamRYTjBiMjFwZW1WeUtHOWlhbFpoYkhWbExDQnpjbU5XWVd4MVpTd2dhMlY1S1NBNklIVnVaR1ZtYVc1bFpEdGNiaUFnSUNBZ0lHbG1JQ2doS0hKbGMzVnNkQ0E5UFQwZ2RXNWtaV1pwYm1Wa0lEOGdZbUZ6WlVselJYRjFZV3dvYzNKalZtRnNkV1VzSUc5aWFsWmhiSFZsTENCamRYTjBiMjFwZW1WeUxDQjBjblZsS1NBNklISmxjM1ZzZENrcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWmhiSE5sTzF4dUlDQWdJQ0FnZlZ4dUlDQWdJSDFjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdkSEoxWlR0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JpWVhObFNYTk5ZWFJqYUR0Y2JseHVYRzVjYmk4cUtpb3FLaW9xS2lvcUtpb3FLaW9xS2x4dUlDb3FJRmRGUWxCQlEwc2dSazlQVkVWU1hHNGdLaW9nTGk5K0wyeHZaR0Z6YUM5cGJuUmxjbTVoYkM5aVlYTmxTWE5OWVhSamFDNXFjMXh1SUNvcUlHMXZaSFZzWlNCcFpDQTlJRE15WEc0Z0tpb2diVzlrZFd4bElHTm9kVzVyY3lBOUlEQmNiaUFxS2k4aUxDSjJZWElnWW1GelpVbHpSWEYxWVd4RVpXVndJRDBnY21WeGRXbHlaU2duTGk5aVlYTmxTWE5GY1hWaGJFUmxaWEFuS1N4Y2JpQWdJQ0JwYzA5aWFtVmpkQ0E5SUhKbGNYVnBjbVVvSnk0dUwyeGhibWN2YVhOUFltcGxZM1FuS1N4Y2JpQWdJQ0JwYzA5aWFtVmpkRXhwYTJVZ1BTQnlaWEYxYVhKbEtDY3VMMmx6VDJKcVpXTjBUR2xyWlNjcE8xeHVYRzR2S2lwY2JpQXFJRlJvWlNCaVlYTmxJR2x0Y0d4bGJXVnVkR0YwYVc5dUlHOW1JR0JmTG1selJYRjFZV3hnSUhkcGRHaHZkWFFnYzNWd2NHOXlkQ0JtYjNJZ1lIUm9hWE5nSUdKcGJtUnBibWRjYmlBcUlHQmpkWE4wYjIxcGVtVnlZQ0JtZFc1amRHbHZibk11WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN0tuMGdkbUZzZFdVZ1ZHaGxJSFpoYkhWbElIUnZJR052YlhCaGNtVXVYRzRnS2lCQWNHRnlZVzBnZXlwOUlHOTBhR1Z5SUZSb1pTQnZkR2hsY2lCMllXeDFaU0IwYnlCamIyMXdZWEpsTGx4dUlDb2dRSEJoY21GdElIdEdkVzVqZEdsdmJuMGdXMk4xYzNSdmJXbDZaWEpkSUZSb1pTQm1kVzVqZEdsdmJpQjBieUJqZFhOMGIyMXBlbVVnWTI5dGNHRnlhVzVuSUhaaGJIVmxjeTVjYmlBcUlFQndZWEpoYlNCN1ltOXZiR1ZoYm4wZ1cybHpURzl2YzJWZElGTndaV05wWm5rZ2NHVnlabTl5YldsdVp5QndZWEowYVdGc0lHTnZiWEJoY21semIyNXpMbHh1SUNvZ1FIQmhjbUZ0SUh0QmNuSmhlWDBnVzNOMFlXTnJRVjBnVkhKaFkydHpJSFJ5WVhabGNuTmxaQ0JnZG1Gc2RXVmdJRzlpYW1WamRITXVYRzRnS2lCQWNHRnlZVzBnZTBGeWNtRjVmU0JiYzNSaFkydENYU0JVY21GamEzTWdkSEpoZG1WeWMyVmtJR0J2ZEdobGNtQWdiMkpxWldOMGN5NWNiaUFxSUVCeVpYUjFjbTV6SUh0aWIyOXNaV0Z1ZlNCU1pYUjFjbTV6SUdCMGNuVmxZQ0JwWmlCMGFHVWdkbUZzZFdWeklHRnlaU0JsY1hWcGRtRnNaVzUwTENCbGJITmxJR0JtWVd4elpXQXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHSmhjMlZKYzBWeGRXRnNLSFpoYkhWbExDQnZkR2hsY2l3Z1kzVnpkRzl0YVhwbGNpd2dhWE5NYjI5elpTd2djM1JoWTJ0QkxDQnpkR0ZqYTBJcElIdGNiaUFnYVdZZ0tIWmhiSFZsSUQwOVBTQnZkR2hsY2lrZ2UxeHVJQ0FnSUhKbGRIVnliaUIwY25WbE8xeHVJQ0I5WEc0Z0lHbG1JQ2gyWVd4MVpTQTlQU0J1ZFd4c0lIeDhJRzkwYUdWeUlEMDlJRzUxYkd3Z2ZId2dLQ0ZwYzA5aWFtVmpkQ2gyWVd4MVpTa2dKaVlnSVdselQySnFaV04wVEdsclpTaHZkR2hsY2lrcEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUhaaGJIVmxJQ0U5UFNCMllXeDFaU0FtSmlCdmRHaGxjaUFoUFQwZ2IzUm9aWEk3WEc0Z0lIMWNiaUFnY21WMGRYSnVJR0poYzJWSmMwVnhkV0ZzUkdWbGNDaDJZV3gxWlN3Z2IzUm9aWElzSUdKaGMyVkpjMFZ4ZFdGc0xDQmpkWE4wYjIxcGVtVnlMQ0JwYzB4dmIzTmxMQ0J6ZEdGamEwRXNJSE4wWVdOclFpazdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1ltRnpaVWx6UlhGMVlXdzdYRzVjYmx4dVhHNHZLaW9xS2lvcUtpb3FLaW9xS2lvcUtpcGNiaUFxS2lCWFJVSlFRVU5MSUVaUFQxUkZVbHh1SUNvcUlDNHZmaTlzYjJSaGMyZ3ZhVzUwWlhKdVlXd3ZZbUZ6WlVselJYRjFZV3d1YW5OY2JpQXFLaUJ0YjJSMWJHVWdhV1FnUFNBek0xeHVJQ29xSUcxdlpIVnNaU0JqYUhWdWEzTWdQU0F3WEc0Z0tpb3ZJaXdpZG1GeUlHVnhkV0ZzUVhKeVlYbHpJRDBnY21WeGRXbHlaU2duTGk5bGNYVmhiRUZ5Y21GNWN5Y3BMRnh1SUNBZ0lHVnhkV0ZzUW5sVVlXY2dQU0J5WlhGMWFYSmxLQ2N1TDJWeGRXRnNRbmxVWVdjbktTeGNiaUFnSUNCbGNYVmhiRTlpYW1WamRITWdQU0J5WlhGMWFYSmxLQ2N1TDJWeGRXRnNUMkpxWldOMGN5Y3BMRnh1SUNBZ0lHbHpRWEp5WVhrZ1BTQnlaWEYxYVhKbEtDY3VMaTlzWVc1bkwybHpRWEp5WVhrbktTeGNiaUFnSUNCcGMxUjVjR1ZrUVhKeVlYa2dQU0J5WlhGMWFYSmxLQ2N1TGk5c1lXNW5MMmx6Vkhsd1pXUkJjbkpoZVNjcE8xeHVYRzR2S2lvZ1lFOWlhbVZqZENOMGIxTjBjbWx1WjJBZ2NtVnpkV3gwSUhKbFptVnlaVzVqWlhNdUlDb3ZYRzUyWVhJZ1lYSm5jMVJoWnlBOUlDZGJiMkpxWldOMElFRnlaM1Z0Wlc1MGMxMG5MRnh1SUNBZ0lHRnljbUY1VkdGbklEMGdKMXR2WW1wbFkzUWdRWEp5WVhsZEp5eGNiaUFnSUNCdlltcGxZM1JVWVdjZ1BTQW5XMjlpYW1WamRDQlBZbXBsWTNSZEp6dGNibHh1THlvcUlGVnpaV1FnWm05eUlHNWhkR2wyWlNCdFpYUm9iMlFnY21WbVpYSmxibU5sY3k0Z0tpOWNiblpoY2lCdlltcGxZM1JRY205MGJ5QTlJRTlpYW1WamRDNXdjbTkwYjNSNWNHVTdYRzVjYmk4cUtpQlZjMlZrSUhSdklHTm9aV05ySUc5aWFtVmpkSE1nWm05eUlHOTNiaUJ3Y205d1pYSjBhV1Z6TGlBcUwxeHVkbUZ5SUdoaGMwOTNibEJ5YjNCbGNuUjVJRDBnYjJKcVpXTjBVSEp2ZEc4dWFHRnpUM2R1VUhKdmNHVnlkSGs3WEc1Y2JpOHFLbHh1SUNvZ1ZYTmxaQ0IwYnlCeVpYTnZiSFpsSUhSb1pTQmJZSFJ2VTNSeWFXNW5WR0ZuWUYwb2FIUjBjRG92TDJWamJXRXRhVzUwWlhKdVlYUnBiMjVoYkM1dmNtY3ZaV050WVMweU5qSXZOaTR3THlOelpXTXRiMkpxWldOMExuQnliM1J2ZEhsd1pTNTBiM04wY21sdVp5bGNiaUFxSUc5bUlIWmhiSFZsY3k1Y2JpQXFMMXh1ZG1GeUlHOWlhbFJ2VTNSeWFXNW5JRDBnYjJKcVpXTjBVSEp2ZEc4dWRHOVRkSEpwYm1jN1hHNWNiaThxS2x4dUlDb2dRU0J6Y0dWamFXRnNhWHBsWkNCMlpYSnphVzl1SUc5bUlHQmlZWE5sU1hORmNYVmhiR0FnWm05eUlHRnljbUY1Y3lCaGJtUWdiMkpxWldOMGN5QjNhR2xqYUNCd1pYSm1iM0p0YzF4dUlDb2daR1ZsY0NCamIyMXdZWEpwYzI5dWN5QmhibVFnZEhKaFkydHpJSFJ5WVhabGNuTmxaQ0J2WW1wbFkzUnpJR1Z1WVdKc2FXNW5JRzlpYW1WamRITWdkMmwwYUNCamFYSmpkV3hoY2x4dUlDb2djbVZtWlhKbGJtTmxjeUIwYnlCaVpTQmpiMjF3WVhKbFpDNWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUhCaGNtRnRJSHRQWW1wbFkzUjlJRzlpYW1WamRDQlVhR1VnYjJKcVpXTjBJSFJ2SUdOdmJYQmhjbVV1WEc0Z0tpQkFjR0Z5WVcwZ2UwOWlhbVZqZEgwZ2IzUm9aWElnVkdobElHOTBhR1Z5SUc5aWFtVmpkQ0IwYnlCamIyMXdZWEpsTGx4dUlDb2dRSEJoY21GdElIdEdkVzVqZEdsdmJuMGdaWEYxWVd4R2RXNWpJRlJvWlNCbWRXNWpkR2x2YmlCMGJ5QmtaWFJsY20xcGJtVWdaWEYxYVhaaGJHVnVkSE1nYjJZZ2RtRnNkV1Z6TGx4dUlDb2dRSEJoY21GdElIdEdkVzVqZEdsdmJuMGdXMk4xYzNSdmJXbDZaWEpkSUZSb1pTQm1kVzVqZEdsdmJpQjBieUJqZFhOMGIyMXBlbVVnWTI5dGNHRnlhVzVuSUc5aWFtVmpkSE11WEc0Z0tpQkFjR0Z5WVcwZ2UySnZiMnhsWVc1OUlGdHBjMHh2YjNObFhTQlRjR1ZqYVdaNUlIQmxjbVp2Y20xcGJtY2djR0Z5ZEdsaGJDQmpiMjF3WVhKcGMyOXVjeTVjYmlBcUlFQndZWEpoYlNCN1FYSnlZWGw5SUZ0emRHRmphMEU5VzExZElGUnlZV05yY3lCMGNtRjJaWEp6WldRZ1lIWmhiSFZsWUNCdlltcGxZM1J6TGx4dUlDb2dRSEJoY21GdElIdEJjbkpoZVgwZ1czTjBZV05yUWoxYlhWMGdWSEpoWTJ0eklIUnlZWFpsY25ObFpDQmdiM1JvWlhKZ0lHOWlhbVZqZEhNdVhHNGdLaUJBY21WMGRYSnVjeUI3WW05dmJHVmhibjBnVW1WMGRYSnVjeUJnZEhKMVpXQWdhV1lnZEdobElHOWlhbVZqZEhNZ1lYSmxJR1Z4ZFdsMllXeGxiblFzSUdWc2MyVWdZR1poYkhObFlDNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z1ltRnpaVWx6UlhGMVlXeEVaV1Z3S0c5aWFtVmpkQ3dnYjNSb1pYSXNJR1Z4ZFdGc1JuVnVZeXdnWTNWemRHOXRhWHBsY2l3Z2FYTk1iMjl6WlN3Z2MzUmhZMnRCTENCemRHRmphMElwSUh0Y2JpQWdkbUZ5SUc5aWFrbHpRWEp5SUQwZ2FYTkJjbkpoZVNodlltcGxZM1FwTEZ4dUlDQWdJQ0FnYjNSb1NYTkJjbklnUFNCcGMwRnljbUY1S0c5MGFHVnlLU3hjYmlBZ0lDQWdJRzlpYWxSaFp5QTlJR0Z5Y21GNVZHRm5MRnh1SUNBZ0lDQWdiM1JvVkdGbklEMGdZWEp5WVhsVVlXYzdYRzVjYmlBZ2FXWWdLQ0Z2WW1wSmMwRnljaWtnZTF4dUlDQWdJRzlpYWxSaFp5QTlJRzlpYWxSdlUzUnlhVzVuTG1OaGJHd29iMkpxWldOMEtUdGNiaUFnSUNCcFppQW9iMkpxVkdGbklEMDlJR0Z5WjNOVVlXY3BJSHRjYmlBZ0lDQWdJRzlpYWxSaFp5QTlJRzlpYW1WamRGUmhaenRjYmlBZ0lDQjlJR1ZzYzJVZ2FXWWdLRzlpYWxSaFp5QWhQU0J2WW1wbFkzUlVZV2NwSUh0Y2JpQWdJQ0FnSUc5aWFrbHpRWEp5SUQwZ2FYTlVlWEJsWkVGeWNtRjVLRzlpYW1WamRDazdYRzRnSUNBZ2ZWeHVJQ0I5WEc0Z0lHbG1JQ2doYjNSb1NYTkJjbklwSUh0Y2JpQWdJQ0J2ZEdoVVlXY2dQU0J2WW1wVWIxTjBjbWx1Wnk1allXeHNLRzkwYUdWeUtUdGNiaUFnSUNCcFppQW9iM1JvVkdGbklEMDlJR0Z5WjNOVVlXY3BJSHRjYmlBZ0lDQWdJRzkwYUZSaFp5QTlJRzlpYW1WamRGUmhaenRjYmlBZ0lDQjlJR1ZzYzJVZ2FXWWdLRzkwYUZSaFp5QWhQU0J2WW1wbFkzUlVZV2NwSUh0Y2JpQWdJQ0FnSUc5MGFFbHpRWEp5SUQwZ2FYTlVlWEJsWkVGeWNtRjVLRzkwYUdWeUtUdGNiaUFnSUNCOVhHNGdJSDFjYmlBZ2RtRnlJRzlpYWtselQySnFJRDBnYjJKcVZHRm5JRDA5SUc5aWFtVmpkRlJoWnl4Y2JpQWdJQ0FnSUc5MGFFbHpUMkpxSUQwZ2IzUm9WR0ZuSUQwOUlHOWlhbVZqZEZSaFp5eGNiaUFnSUNBZ0lHbHpVMkZ0WlZSaFp5QTlJRzlpYWxSaFp5QTlQU0J2ZEdoVVlXYzdYRzVjYmlBZ2FXWWdLR2x6VTJGdFpWUmhaeUFtSmlBaEtHOWlha2x6UVhKeUlIeDhJRzlpYWtselQySnFLU2tnZTF4dUlDQWdJSEpsZEhWeWJpQmxjWFZoYkVKNVZHRm5LRzlpYW1WamRDd2diM1JvWlhJc0lHOWlhbFJoWnlrN1hHNGdJSDFjYmlBZ2FXWWdLQ0ZwYzB4dmIzTmxLU0I3WEc0Z0lDQWdkbUZ5SUc5aWFrbHpWM0poY0hCbFpDQTlJRzlpYWtselQySnFJQ1ltSUdoaGMwOTNibEJ5YjNCbGNuUjVMbU5oYkd3b2IySnFaV04wTENBblgxOTNjbUZ3Y0dWa1gxOG5LU3hjYmlBZ0lDQWdJQ0FnYjNSb1NYTlhjbUZ3Y0dWa0lEMGdiM1JvU1hOUFltb2dKaVlnYUdGelQzZHVVSEp2Y0dWeWRIa3VZMkZzYkNodmRHaGxjaXdnSjE5ZmQzSmhjSEJsWkY5Zkp5azdYRzVjYmlBZ0lDQnBaaUFvYjJKcVNYTlhjbUZ3Y0dWa0lIeDhJRzkwYUVselYzSmhjSEJsWkNrZ2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUdWeGRXRnNSblZ1WXlodlltcEpjMWR5WVhCd1pXUWdQeUJ2WW1wbFkzUXVkbUZzZFdVb0tTQTZJRzlpYW1WamRDd2diM1JvU1hOWGNtRndjR1ZrSUQ4Z2IzUm9aWEl1ZG1Gc2RXVW9LU0E2SUc5MGFHVnlMQ0JqZFhOMGIyMXBlbVZ5TENCcGMweHZiM05sTENCemRHRmphMEVzSUhOMFlXTnJRaWs3WEc0Z0lDQWdmVnh1SUNCOVhHNGdJR2xtSUNnaGFYTlRZVzFsVkdGbktTQjdYRzRnSUNBZ2NtVjBkWEp1SUdaaGJITmxPMXh1SUNCOVhHNGdJQzh2SUVGemMzVnRaU0JqZVdOc2FXTWdkbUZzZFdWeklHRnlaU0JsY1hWaGJDNWNiaUFnTHk4Z1JtOXlJRzF2Y21VZ2FXNW1iM0p0WVhScGIyNGdiMjRnWkdWMFpXTjBhVzVuSUdOcGNtTjFiR0Z5SUhKbFptVnlaVzVqWlhNZ2MyVmxJR2gwZEhCek9pOHZaWE0xTG1kcGRHaDFZaTVwYnk4alNrOHVYRzRnSUhOMFlXTnJRU0I4ZkNBb2MzUmhZMnRCSUQwZ1cxMHBPMXh1SUNCemRHRmphMElnZkh3Z0tITjBZV05yUWlBOUlGdGRLVHRjYmx4dUlDQjJZWElnYkdWdVozUm9JRDBnYzNSaFkydEJMbXhsYm1kMGFEdGNiaUFnZDJocGJHVWdLR3hsYm1kMGFDMHRLU0I3WEc0Z0lDQWdhV1lnS0hOMFlXTnJRVnRzWlc1bmRHaGRJRDA5SUc5aWFtVmpkQ2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJSE4wWVdOclFsdHNaVzVuZEdoZElEMDlJRzkwYUdWeU8xeHVJQ0FnSUgxY2JpQWdmVnh1SUNBdkx5QkJaR1FnWUc5aWFtVmpkR0FnWVc1a0lHQnZkR2hsY21BZ2RHOGdkR2hsSUhOMFlXTnJJRzltSUhSeVlYWmxjbk5sWkNCdlltcGxZM1J6TGx4dUlDQnpkR0ZqYTBFdWNIVnphQ2h2WW1wbFkzUXBPMXh1SUNCemRHRmphMEl1Y0hWemFDaHZkR2hsY2lrN1hHNWNiaUFnZG1GeUlISmxjM1ZzZENBOUlDaHZZbXBKYzBGeWNpQS9JR1Z4ZFdGc1FYSnlZWGx6SURvZ1pYRjFZV3hQWW1wbFkzUnpLU2h2WW1wbFkzUXNJRzkwYUdWeUxDQmxjWFZoYkVaMWJtTXNJR04xYzNSdmJXbDZaWElzSUdselRHOXZjMlVzSUhOMFlXTnJRU3dnYzNSaFkydENLVHRjYmx4dUlDQnpkR0ZqYTBFdWNHOXdLQ2s3WEc0Z0lITjBZV05yUWk1d2IzQW9LVHRjYmx4dUlDQnlaWFIxY200Z2NtVnpkV3gwTzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR0poYzJWSmMwVnhkV0ZzUkdWbGNEdGNibHh1WEc1Y2JpOHFLaW9xS2lvcUtpb3FLaW9xS2lvcUtseHVJQ29xSUZkRlFsQkJRMHNnUms5UFZFVlNYRzRnS2lvZ0xpOStMMnh2WkdGemFDOXBiblJsY201aGJDOWlZWE5sU1hORmNYVmhiRVJsWlhBdWFuTmNiaUFxS2lCdGIyUjFiR1VnYVdRZ1BTQXpORnh1SUNvcUlHMXZaSFZzWlNCamFIVnVhM01nUFNBd1hHNGdLaW92SWl3aWRtRnlJR0Z5Y21GNVUyOXRaU0E5SUhKbGNYVnBjbVVvSnk0dllYSnlZWGxUYjIxbEp5azdYRzVjYmk4cUtseHVJQ29nUVNCemNHVmphV0ZzYVhwbFpDQjJaWEp6YVc5dUlHOW1JR0JpWVhObFNYTkZjWFZoYkVSbFpYQmdJR1p2Y2lCaGNuSmhlWE1nZDJsMGFDQnpkWEJ3YjNKMElHWnZjbHh1SUNvZ2NHRnlkR2xoYkNCa1pXVndJR052YlhCaGNtbHpiMjV6TGx4dUlDcGNiaUFxSUVCd2NtbDJZWFJsWEc0Z0tpQkFjR0Z5WVcwZ2UwRnljbUY1ZlNCaGNuSmhlU0JVYUdVZ1lYSnlZWGtnZEc4Z1kyOXRjR0Z5WlM1Y2JpQXFJRUJ3WVhKaGJTQjdRWEp5WVhsOUlHOTBhR1Z5SUZSb1pTQnZkR2hsY2lCaGNuSmhlU0IwYnlCamIyMXdZWEpsTGx4dUlDb2dRSEJoY21GdElIdEdkVzVqZEdsdmJuMGdaWEYxWVd4R2RXNWpJRlJvWlNCbWRXNWpkR2x2YmlCMGJ5QmtaWFJsY20xcGJtVWdaWEYxYVhaaGJHVnVkSE1nYjJZZ2RtRnNkV1Z6TGx4dUlDb2dRSEJoY21GdElIdEdkVzVqZEdsdmJuMGdXMk4xYzNSdmJXbDZaWEpkSUZSb1pTQm1kVzVqZEdsdmJpQjBieUJqZFhOMGIyMXBlbVVnWTI5dGNHRnlhVzVuSUdGeWNtRjVjeTVjYmlBcUlFQndZWEpoYlNCN1ltOXZiR1ZoYm4wZ1cybHpURzl2YzJWZElGTndaV05wWm5rZ2NHVnlabTl5YldsdVp5QndZWEowYVdGc0lHTnZiWEJoY21semIyNXpMbHh1SUNvZ1FIQmhjbUZ0SUh0QmNuSmhlWDBnVzNOMFlXTnJRVjBnVkhKaFkydHpJSFJ5WVhabGNuTmxaQ0JnZG1Gc2RXVmdJRzlpYW1WamRITXVYRzRnS2lCQWNHRnlZVzBnZTBGeWNtRjVmU0JiYzNSaFkydENYU0JVY21GamEzTWdkSEpoZG1WeWMyVmtJR0J2ZEdobGNtQWdiMkpxWldOMGN5NWNiaUFxSUVCeVpYUjFjbTV6SUh0aWIyOXNaV0Z1ZlNCU1pYUjFjbTV6SUdCMGNuVmxZQ0JwWmlCMGFHVWdZWEp5WVhseklHRnlaU0JsY1hWcGRtRnNaVzUwTENCbGJITmxJR0JtWVd4elpXQXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHVnhkV0ZzUVhKeVlYbHpLR0Z5Y21GNUxDQnZkR2hsY2l3Z1pYRjFZV3hHZFc1akxDQmpkWE4wYjIxcGVtVnlMQ0JwYzB4dmIzTmxMQ0J6ZEdGamEwRXNJSE4wWVdOclFpa2dlMXh1SUNCMllYSWdhVzVrWlhnZ1BTQXRNU3hjYmlBZ0lDQWdJR0Z5Y2t4bGJtZDBhQ0E5SUdGeWNtRjVMbXhsYm1kMGFDeGNiaUFnSUNBZ0lHOTBhRXhsYm1kMGFDQTlJRzkwYUdWeUxteGxibWQwYUR0Y2JseHVJQ0JwWmlBb1lYSnlUR1Z1WjNSb0lDRTlJRzkwYUV4bGJtZDBhQ0FtSmlBaEtHbHpURzl2YzJVZ0ppWWdiM1JvVEdWdVozUm9JRDRnWVhKeVRHVnVaM1JvS1NrZ2UxeHVJQ0FnSUhKbGRIVnliaUJtWVd4elpUdGNiaUFnZlZ4dUlDQXZMeUJKWjI1dmNtVWdibTl1TFdsdVpHVjRJSEJ5YjNCbGNuUnBaWE11WEc0Z0lIZG9hV3hsSUNncksybHVaR1Y0SUR3Z1lYSnlUR1Z1WjNSb0tTQjdYRzRnSUNBZ2RtRnlJR0Z5Y2xaaGJIVmxJRDBnWVhKeVlYbGJhVzVrWlhoZExGeHVJQ0FnSUNBZ0lDQnZkR2hXWVd4MVpTQTlJRzkwYUdWeVcybHVaR1Y0WFN4Y2JpQWdJQ0FnSUNBZ2NtVnpkV3gwSUQwZ1kzVnpkRzl0YVhwbGNpQS9JR04xYzNSdmJXbDZaWElvYVhOTWIyOXpaU0EvSUc5MGFGWmhiSFZsSURvZ1lYSnlWbUZzZFdVc0lHbHpURzl2YzJVZ1B5QmhjbkpXWVd4MVpTQTZJRzkwYUZaaGJIVmxMQ0JwYm1SbGVDa2dPaUIxYm1SbFptbHVaV1E3WEc1Y2JpQWdJQ0JwWmlBb2NtVnpkV3gwSUNFOVBTQjFibVJsWm1sdVpXUXBJSHRjYmlBZ0lDQWdJR2xtSUNoeVpYTjFiSFFwSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVkR2x1ZFdVN1hHNGdJQ0FnSUNCOVhHNGdJQ0FnSUNCeVpYUjFjbTRnWm1Gc2MyVTdYRzRnSUNBZ2ZWeHVJQ0FnSUM4dklGSmxZM1Z5YzJsMlpXeDVJR052YlhCaGNtVWdZWEp5WVhseklDaHpkWE5qWlhCMGFXSnNaU0IwYnlCallXeHNJSE4wWVdOcklHeHBiV2wwY3lrdVhHNGdJQ0FnYVdZZ0tHbHpURzl2YzJVcElIdGNiaUFnSUNBZ0lHbG1JQ2doWVhKeVlYbFRiMjFsS0c5MGFHVnlMQ0JtZFc1amRHbHZiaWh2ZEdoV1lXeDFaU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHRnljbFpoYkhWbElEMDlQU0J2ZEdoV1lXeDFaU0I4ZkNCbGNYVmhiRVoxYm1Nb1lYSnlWbUZzZFdVc0lHOTBhRlpoYkhWbExDQmpkWE4wYjIxcGVtVnlMQ0JwYzB4dmIzTmxMQ0J6ZEdGamEwRXNJSE4wWVdOclFpazdYRzRnSUNBZ0lDQWdJQ0FnZlNrcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWmhiSE5sTzF4dUlDQWdJQ0FnZlZ4dUlDQWdJSDBnWld4elpTQnBaaUFvSVNoaGNuSldZV3gxWlNBOVBUMGdiM1JvVm1Gc2RXVWdmSHdnWlhGMVlXeEdkVzVqS0dGeWNsWmhiSFZsTENCdmRHaFdZV3gxWlN3Z1kzVnpkRzl0YVhwbGNpd2dhWE5NYjI5elpTd2djM1JoWTJ0QkxDQnpkR0ZqYTBJcEtTa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlHWmhiSE5sTzF4dUlDQWdJSDFjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdkSEoxWlR0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JsY1hWaGJFRnljbUY1Y3p0Y2JseHVYRzVjYmk4cUtpb3FLaW9xS2lvcUtpb3FLaW9xS2x4dUlDb3FJRmRGUWxCQlEwc2dSazlQVkVWU1hHNGdLaW9nTGk5K0wyeHZaR0Z6YUM5cGJuUmxjbTVoYkM5bGNYVmhiRUZ5Y21GNWN5NXFjMXh1SUNvcUlHMXZaSFZzWlNCcFpDQTlJRE0xWEc0Z0tpb2diVzlrZFd4bElHTm9kVzVyY3lBOUlEQmNiaUFxS2k4aUxDSXZLaXBjYmlBcUlFRWdjM0JsWTJsaGJHbDZaV1FnZG1WeWMybHZiaUJ2WmlCZ1h5NXpiMjFsWUNCbWIzSWdZWEp5WVhseklIZHBkR2h2ZFhRZ2MzVndjRzl5ZENCbWIzSWdZMkZzYkdKaFkydGNiaUFxSUhOb2IzSjBhR0Z1WkhNZ1lXNWtJR0IwYUdsellDQmlhVzVrYVc1bkxseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdlMEZ5Y21GNWZTQmhjbkpoZVNCVWFHVWdZWEp5WVhrZ2RHOGdhWFJsY21GMFpTQnZkbVZ5TGx4dUlDb2dRSEJoY21GdElIdEdkVzVqZEdsdmJuMGdjSEpsWkdsallYUmxJRlJvWlNCbWRXNWpkR2x2YmlCcGJuWnZhMlZrSUhCbGNpQnBkR1Z5WVhScGIyNHVYRzRnS2lCQWNtVjBkWEp1Y3lCN1ltOXZiR1ZoYm4wZ1VtVjBkWEp1Y3lCZ2RISjFaV0FnYVdZZ1lXNTVJR1ZzWlcxbGJuUWdjR0Z6YzJWeklIUm9aU0J3Y21Wa2FXTmhkR1VnWTJobFkyc3NYRzRnS2lBZ1pXeHpaU0JnWm1Gc2MyVmdMbHh1SUNvdlhHNW1kVzVqZEdsdmJpQmhjbkpoZVZOdmJXVW9ZWEp5WVhrc0lIQnlaV1JwWTJGMFpTa2dlMXh1SUNCMllYSWdhVzVrWlhnZ1BTQXRNU3hjYmlBZ0lDQWdJR3hsYm1kMGFDQTlJR0Z5Y21GNUxteGxibWQwYUR0Y2JseHVJQ0IzYUdsc1pTQW9LeXRwYm1SbGVDQThJR3hsYm1kMGFDa2dlMXh1SUNBZ0lHbG1JQ2h3Y21Wa2FXTmhkR1VvWVhKeVlYbGJhVzVrWlhoZExDQnBibVJsZUN3Z1lYSnlZWGtwS1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnZEhKMVpUdGNiaUFnSUNCOVhHNGdJSDFjYmlBZ2NtVjBkWEp1SUdaaGJITmxPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHRnljbUY1VTI5dFpUdGNibHh1WEc1Y2JpOHFLaW9xS2lvcUtpb3FLaW9xS2lvcUtseHVJQ29xSUZkRlFsQkJRMHNnUms5UFZFVlNYRzRnS2lvZ0xpOStMMnh2WkdGemFDOXBiblJsY201aGJDOWhjbkpoZVZOdmJXVXVhbk5jYmlBcUtpQnRiMlIxYkdVZ2FXUWdQU0F6Tmx4dUlDb3FJRzF2WkhWc1pTQmphSFZ1YTNNZ1BTQXdYRzRnS2lvdklpd2lMeW9xSUdCUFltcGxZM1FqZEc5VGRISnBibWRnSUhKbGMzVnNkQ0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUdKdmIyeFVZV2NnUFNBblcyOWlhbVZqZENCQ2IyOXNaV0Z1WFNjc1hHNGdJQ0FnWkdGMFpWUmhaeUE5SUNkYmIySnFaV04wSUVSaGRHVmRKeXhjYmlBZ0lDQmxjbkp2Y2xSaFp5QTlJQ2RiYjJKcVpXTjBJRVZ5Y205eVhTY3NYRzRnSUNBZ2JuVnRZbVZ5VkdGbklEMGdKMXR2WW1wbFkzUWdUblZ0WW1WeVhTY3NYRzRnSUNBZ2NtVm5aWGh3VkdGbklEMGdKMXR2WW1wbFkzUWdVbVZuUlhod1hTY3NYRzRnSUNBZ2MzUnlhVzVuVkdGbklEMGdKMXR2WW1wbFkzUWdVM1J5YVc1blhTYzdYRzVjYmk4cUtseHVJQ29nUVNCemNHVmphV0ZzYVhwbFpDQjJaWEp6YVc5dUlHOW1JR0JpWVhObFNYTkZjWFZoYkVSbFpYQmdJR1p2Y2lCamIyMXdZWEpwYm1jZ2IySnFaV04wY3lCdlpseHVJQ29nZEdobElITmhiV1VnWUhSdlUzUnlhVzVuVkdGbllDNWNiaUFxWEc0Z0tpQXFLazV2ZEdVNktpb2dWR2hwY3lCbWRXNWpkR2x2YmlCdmJteDVJSE4xY0hCdmNuUnpJR052YlhCaGNtbHVaeUIyWVd4MVpYTWdkMmwwYUNCMFlXZHpJRzltWEc0Z0tpQmdRbTl2YkdWaGJtQXNJR0JFWVhSbFlDd2dZRVZ5Y205eVlDd2dZRTUxYldKbGNtQXNJR0JTWldkRmVIQmdMQ0J2Y2lCZ1UzUnlhVzVuWUM1Y2JpQXFYRzRnS2lCQWNISnBkbUYwWlZ4dUlDb2dRSEJoY21GdElIdFBZbXBsWTNSOUlHOWlhbVZqZENCVWFHVWdiMkpxWldOMElIUnZJR052YlhCaGNtVXVYRzRnS2lCQWNHRnlZVzBnZTA5aWFtVmpkSDBnYjNSb1pYSWdWR2hsSUc5MGFHVnlJRzlpYW1WamRDQjBieUJqYjIxd1lYSmxMbHh1SUNvZ1FIQmhjbUZ0SUh0emRISnBibWQ5SUhSaFp5QlVhR1VnWUhSdlUzUnlhVzVuVkdGbllDQnZaaUIwYUdVZ2IySnFaV04wY3lCMGJ5QmpiMjF3WVhKbExseHVJQ29nUUhKbGRIVnlibk1nZTJKdmIyeGxZVzU5SUZKbGRIVnlibk1nWUhSeWRXVmdJR2xtSUhSb1pTQnZZbXBsWTNSeklHRnlaU0JsY1hWcGRtRnNaVzUwTENCbGJITmxJR0JtWVd4elpXQXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHVnhkV0ZzUW5sVVlXY29iMkpxWldOMExDQnZkR2hsY2l3Z2RHRm5LU0I3WEc0Z0lITjNhWFJqYUNBb2RHRm5LU0I3WEc0Z0lDQWdZMkZ6WlNCaWIyOXNWR0ZuT2x4dUlDQWdJR05oYzJVZ1pHRjBaVlJoWnpwY2JpQWdJQ0FnSUM4dklFTnZaWEpqWlNCa1lYUmxjeUJoYm1RZ1ltOXZiR1ZoYm5NZ2RHOGdiblZ0WW1WeWN5d2daR0YwWlhNZ2RHOGdiV2xzYkdselpXTnZibVJ6SUdGdVpDQmliMjlzWldGdWMxeHVJQ0FnSUNBZ0x5OGdkRzhnWURGZ0lHOXlJR0F3WUNCMGNtVmhkR2x1WnlCcGJuWmhiR2xrSUdSaGRHVnpJR052WlhKalpXUWdkRzhnWUU1aFRtQWdZWE1nYm05MElHVnhkV0ZzTGx4dUlDQWdJQ0FnY21WMGRYSnVJQ3R2WW1wbFkzUWdQVDBnSzI5MGFHVnlPMXh1WEc0Z0lDQWdZMkZ6WlNCbGNuSnZjbFJoWnpwY2JpQWdJQ0FnSUhKbGRIVnliaUJ2WW1wbFkzUXVibUZ0WlNBOVBTQnZkR2hsY2k1dVlXMWxJQ1ltSUc5aWFtVmpkQzV0WlhOellXZGxJRDA5SUc5MGFHVnlMbTFsYzNOaFoyVTdYRzVjYmlBZ0lDQmpZWE5sSUc1MWJXSmxjbFJoWnpwY2JpQWdJQ0FnSUM4dklGUnlaV0YwSUdCT1lVNWdJSFp6TGlCZ1RtRk9ZQ0JoY3lCbGNYVmhiQzVjYmlBZ0lDQWdJSEpsZEhWeWJpQW9iMkpxWldOMElDRTlJQ3R2WW1wbFkzUXBYRzRnSUNBZ0lDQWdJRDhnYjNSb1pYSWdJVDBnSzI5MGFHVnlYRzRnSUNBZ0lDQWdJRG9nYjJKcVpXTjBJRDA5SUN0dmRHaGxjanRjYmx4dUlDQWdJR05oYzJVZ2NtVm5aWGh3VkdGbk9seHVJQ0FnSUdOaGMyVWdjM1J5YVc1blZHRm5PbHh1SUNBZ0lDQWdMeThnUTI5bGNtTmxJSEpsWjJWNFpYTWdkRzhnYzNSeWFXNW5jeUJoYm1RZ2RISmxZWFFnYzNSeWFXNW5jeUJ3Y21sdGFYUnBkbVZ6SUdGdVpDQnpkSEpwYm1kY2JpQWdJQ0FnSUM4dklHOWlhbVZqZEhNZ1lYTWdaWEYxWVd3dUlGTmxaU0JvZEhSd2N6b3ZMMlZ6TlM1bmFYUm9kV0l1YVc4dkkzZ3hOUzR4TUM0MkxqUWdabTl5SUcxdmNtVWdaR1YwWVdsc2N5NWNiaUFnSUNBZ0lISmxkSFZ5YmlCdlltcGxZM1FnUFQwZ0tHOTBhR1Z5SUNzZ0p5Y3BPMXh1SUNCOVhHNGdJSEpsZEhWeWJpQm1ZV3h6WlR0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JsY1hWaGJFSjVWR0ZuTzF4dVhHNWNibHh1THlvcUtpb3FLaW9xS2lvcUtpb3FLaW9xWEc0Z0tpb2dWMFZDVUVGRFN5QkdUMDlVUlZKY2JpQXFLaUF1TDM0dmJHOWtZWE5vTDJsdWRHVnlibUZzTDJWeGRXRnNRbmxVWVdjdWFuTmNiaUFxS2lCdGIyUjFiR1VnYVdRZ1BTQXpOMXh1SUNvcUlHMXZaSFZzWlNCamFIVnVhM01nUFNBd1hHNGdLaW92SWl3aWRtRnlJR3RsZVhNZ1BTQnlaWEYxYVhKbEtDY3VMaTl2WW1wbFkzUXZhMlY1Y3ljcE8xeHVYRzR2S2lvZ1ZYTmxaQ0JtYjNJZ2JtRjBhWFpsSUcxbGRHaHZaQ0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUc5aWFtVmpkRkJ5YjNSdklEMGdUMkpxWldOMExuQnliM1J2ZEhsd1pUdGNibHh1THlvcUlGVnpaV1FnZEc4Z1kyaGxZMnNnYjJKcVpXTjBjeUJtYjNJZ2IzZHVJSEJ5YjNCbGNuUnBaWE11SUNvdlhHNTJZWElnYUdGelQzZHVVSEp2Y0dWeWRIa2dQU0J2WW1wbFkzUlFjbTkwYnk1b1lYTlBkMjVRY205d1pYSjBlVHRjYmx4dUx5b3FYRzRnS2lCQklITndaV05wWVd4cGVtVmtJSFpsY25OcGIyNGdiMllnWUdKaGMyVkpjMFZ4ZFdGc1JHVmxjR0FnWm05eUlHOWlhbVZqZEhNZ2QybDBhQ0J6ZFhCd2IzSjBJR1p2Y2x4dUlDb2djR0Z5ZEdsaGJDQmtaV1Z3SUdOdmJYQmhjbWx6YjI1ekxseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdlMDlpYW1WamRIMGdiMkpxWldOMElGUm9aU0J2WW1wbFkzUWdkRzhnWTI5dGNHRnlaUzVjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCdmRHaGxjaUJVYUdVZ2IzUm9aWElnYjJKcVpXTjBJSFJ2SUdOdmJYQmhjbVV1WEc0Z0tpQkFjR0Z5WVcwZ2UwWjFibU4wYVc5dWZTQmxjWFZoYkVaMWJtTWdWR2hsSUdaMWJtTjBhVzl1SUhSdklHUmxkR1Z5YldsdVpTQmxjWFZwZG1Gc1pXNTBjeUJ2WmlCMllXeDFaWE11WEc0Z0tpQkFjR0Z5WVcwZ2UwWjFibU4wYVc5dWZTQmJZM1Z6ZEc5dGFYcGxjbDBnVkdobElHWjFibU4wYVc5dUlIUnZJR04xYzNSdmJXbDZaU0JqYjIxd1lYSnBibWNnZG1Gc2RXVnpMbHh1SUNvZ1FIQmhjbUZ0SUh0aWIyOXNaV0Z1ZlNCYmFYTk1iMjl6WlYwZ1UzQmxZMmxtZVNCd1pYSm1iM0p0YVc1bklIQmhjblJwWVd3Z1kyOXRjR0Z5YVhOdmJuTXVYRzRnS2lCQWNHRnlZVzBnZTBGeWNtRjVmU0JiYzNSaFkydEJYU0JVY21GamEzTWdkSEpoZG1WeWMyVmtJR0IyWVd4MVpXQWdiMkpxWldOMGN5NWNiaUFxSUVCd1lYSmhiU0I3UVhKeVlYbDlJRnR6ZEdGamEwSmRJRlJ5WVdOcmN5QjBjbUYyWlhKelpXUWdZRzkwYUdWeVlDQnZZbXBsWTNSekxseHVJQ29nUUhKbGRIVnlibk1nZTJKdmIyeGxZVzU5SUZKbGRIVnlibk1nWUhSeWRXVmdJR2xtSUhSb1pTQnZZbXBsWTNSeklHRnlaU0JsY1hWcGRtRnNaVzUwTENCbGJITmxJR0JtWVd4elpXQXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHVnhkV0ZzVDJKcVpXTjBjeWh2WW1wbFkzUXNJRzkwYUdWeUxDQmxjWFZoYkVaMWJtTXNJR04xYzNSdmJXbDZaWElzSUdselRHOXZjMlVzSUhOMFlXTnJRU3dnYzNSaFkydENLU0I3WEc0Z0lIWmhjaUJ2WW1wUWNtOXdjeUE5SUd0bGVYTW9iMkpxWldOMEtTeGNiaUFnSUNBZ0lHOWlha3hsYm1kMGFDQTlJRzlpYWxCeWIzQnpMbXhsYm1kMGFDeGNiaUFnSUNBZ0lHOTBhRkJ5YjNCeklEMGdhMlY1Y3lodmRHaGxjaWtzWEc0Z0lDQWdJQ0J2ZEdoTVpXNW5kR2dnUFNCdmRHaFFjbTl3Y3k1c1pXNW5kR2c3WEc1Y2JpQWdhV1lnS0c5aWFreGxibWQwYUNBaFBTQnZkR2hNWlc1bmRHZ2dKaVlnSVdselRHOXZjMlVwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdabUZzYzJVN1hHNGdJSDFjYmlBZ2RtRnlJR2x1WkdWNElEMGdiMkpxVEdWdVozUm9PMXh1SUNCM2FHbHNaU0FvYVc1a1pYZ3RMU2tnZTF4dUlDQWdJSFpoY2lCclpYa2dQU0J2WW1wUWNtOXdjMXRwYm1SbGVGMDdYRzRnSUNBZ2FXWWdLQ0VvYVhOTWIyOXpaU0EvSUd0bGVTQnBiaUJ2ZEdobGNpQTZJR2hoYzA5M2JsQnliM0JsY25SNUxtTmhiR3dvYjNSb1pYSXNJR3RsZVNrcEtTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z1ptRnNjMlU3WEc0Z0lDQWdmVnh1SUNCOVhHNGdJSFpoY2lCemEybHdRM1J2Y2lBOUlHbHpURzl2YzJVN1hHNGdJSGRvYVd4bElDZ3JLMmx1WkdWNElEd2diMkpxVEdWdVozUm9LU0I3WEc0Z0lDQWdhMlY1SUQwZ2IySnFVSEp2Y0hOYmFXNWtaWGhkTzF4dUlDQWdJSFpoY2lCdlltcFdZV3gxWlNBOUlHOWlhbVZqZEZ0clpYbGRMRnh1SUNBZ0lDQWdJQ0J2ZEdoV1lXeDFaU0E5SUc5MGFHVnlXMnRsZVYwc1hHNGdJQ0FnSUNBZ0lISmxjM1ZzZENBOUlHTjFjM1J2YldsNlpYSWdQeUJqZFhOMGIyMXBlbVZ5S0dselRHOXZjMlVnUHlCdmRHaFdZV3gxWlNBNklHOWlhbFpoYkhWbExDQnBjMHh2YjNObFB5QnZZbXBXWVd4MVpTQTZJRzkwYUZaaGJIVmxMQ0JyWlhrcElEb2dkVzVrWldacGJtVmtPMXh1WEc0Z0lDQWdMeThnVW1WamRYSnphWFpsYkhrZ1kyOXRjR0Z5WlNCdlltcGxZM1J6SUNoemRYTmpaWEIwYVdKc1pTQjBieUJqWVd4c0lITjBZV05ySUd4cGJXbDBjeWt1WEc0Z0lDQWdhV1lnS0NFb2NtVnpkV3gwSUQwOVBTQjFibVJsWm1sdVpXUWdQeUJsY1hWaGJFWjFibU1vYjJKcVZtRnNkV1VzSUc5MGFGWmhiSFZsTENCamRYTjBiMjFwZW1WeUxDQnBjMHh2YjNObExDQnpkR0ZqYTBFc0lITjBZV05yUWlrZ09pQnlaWE4xYkhRcEtTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z1ptRnNjMlU3WEc0Z0lDQWdmVnh1SUNBZ0lITnJhWEJEZEc5eUlIeDhJQ2h6YTJsd1EzUnZjaUE5SUd0bGVTQTlQU0FuWTI5dWMzUnlkV04wYjNJbktUdGNiaUFnZlZ4dUlDQnBaaUFvSVhOcmFYQkRkRzl5S1NCN1hHNGdJQ0FnZG1GeUlHOWlha04wYjNJZ1BTQnZZbXBsWTNRdVkyOXVjM1J5ZFdOMGIzSXNYRzRnSUNBZ0lDQWdJRzkwYUVOMGIzSWdQU0J2ZEdobGNpNWpiMjV6ZEhKMVkzUnZjanRjYmx4dUlDQWdJQzh2SUU1dmJpQmdUMkpxWldOMFlDQnZZbXBsWTNRZ2FXNXpkR0Z1WTJWeklIZHBkR2dnWkdsbVptVnlaVzUwSUdOdmJuTjBjblZqZEc5eWN5QmhjbVVnYm05MElHVnhkV0ZzTGx4dUlDQWdJR2xtSUNodlltcERkRzl5SUNFOUlHOTBhRU4wYjNJZ0ppWmNiaUFnSUNBZ0lDQWdLQ2RqYjI1emRISjFZM1J2Y2ljZ2FXNGdiMkpxWldOMElDWW1JQ2RqYjI1emRISjFZM1J2Y2ljZ2FXNGdiM1JvWlhJcElDWW1YRzRnSUNBZ0lDQWdJQ0VvZEhsd1pXOW1JRzlpYWtOMGIzSWdQVDBnSjJaMWJtTjBhVzl1SnlBbUppQnZZbXBEZEc5eUlHbHVjM1JoYm1ObGIyWWdiMkpxUTNSdmNpQW1KbHh1SUNBZ0lDQWdJQ0FnSUhSNWNHVnZaaUJ2ZEdoRGRHOXlJRDA5SUNkbWRXNWpkR2x2YmljZ0ppWWdiM1JvUTNSdmNpQnBibk4wWVc1alpXOW1JRzkwYUVOMGIzSXBLU0I3WEc0Z0lDQWdJQ0J5WlhSMWNtNGdabUZzYzJVN1hHNGdJQ0FnZlZ4dUlDQjlYRzRnSUhKbGRIVnliaUIwY25WbE8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdWeGRXRnNUMkpxWldOMGN6dGNibHh1WEc1Y2JpOHFLaW9xS2lvcUtpb3FLaW9xS2lvcUtseHVJQ29xSUZkRlFsQkJRMHNnUms5UFZFVlNYRzRnS2lvZ0xpOStMMnh2WkdGemFDOXBiblJsY201aGJDOWxjWFZoYkU5aWFtVmpkSE11YW5OY2JpQXFLaUJ0YjJSMWJHVWdhV1FnUFNBek9GeHVJQ29xSUcxdlpIVnNaU0JqYUhWdWEzTWdQU0F3WEc0Z0tpb3ZJaXdpZG1GeUlHZGxkRTVoZEdsMlpTQTlJSEpsY1hWcGNtVW9KeTR1TDJsdWRHVnlibUZzTDJkbGRFNWhkR2wyWlNjcExGeHVJQ0FnSUdselFYSnlZWGxNYVd0bElEMGdjbVZ4ZFdseVpTZ25MaTR2YVc1MFpYSnVZV3d2YVhOQmNuSmhlVXhwYTJVbktTeGNiaUFnSUNCcGMwOWlhbVZqZENBOUlISmxjWFZwY21Vb0p5NHVMMnhoYm1jdmFYTlBZbXBsWTNRbktTeGNiaUFnSUNCemFHbHRTMlY1Y3lBOUlISmxjWFZwY21Vb0p5NHVMMmx1ZEdWeWJtRnNMM05vYVcxTFpYbHpKeWs3WEc1Y2JpOHFJRTVoZEdsMlpTQnRaWFJvYjJRZ2NtVm1aWEpsYm1ObGN5Qm1iM0lnZEdodmMyVWdkMmwwYUNCMGFHVWdjMkZ0WlNCdVlXMWxJR0Z6SUc5MGFHVnlJR0JzYjJSaGMyaGdJRzFsZEdodlpITXVJQ292WEc1MllYSWdibUYwYVhabFMyVjVjeUE5SUdkbGRFNWhkR2wyWlNoUFltcGxZM1FzSUNkclpYbHpKeWs3WEc1Y2JpOHFLbHh1SUNvZ1EzSmxZWFJsY3lCaGJpQmhjbkpoZVNCdlppQjBhR1VnYjNkdUlHVnVkVzFsY21GaWJHVWdjSEp2Y0dWeWRIa2dibUZ0WlhNZ2IyWWdZRzlpYW1WamRHQXVYRzRnS2x4dUlDb2dLaXBPYjNSbE9pb3FJRTV2YmkxdlltcGxZM1FnZG1Gc2RXVnpJR0Z5WlNCamIyVnlZMlZrSUhSdklHOWlhbVZqZEhNdUlGTmxaU0IwYUdWY2JpQXFJRnRGVXlCemNHVmpYU2hvZEhSd09pOHZaV050WVMxcGJuUmxjbTVoZEdsdmJtRnNMbTl5Wnk5bFkyMWhMVEkyTWk4MkxqQXZJM05sWXkxdlltcGxZM1F1YTJWNWN5bGNiaUFxSUdadmNpQnRiM0psSUdSbGRHRnBiSE11WEc0Z0tseHVJQ29nUUhOMFlYUnBZMXh1SUNvZ1FHMWxiV0psY2s5bUlGOWNiaUFxSUVCallYUmxaMjl5ZVNCUFltcGxZM1JjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCdlltcGxZM1FnVkdobElHOWlhbVZqZENCMGJ5QnhkV1Z5ZVM1Y2JpQXFJRUJ5WlhSMWNtNXpJSHRCY25KaGVYMGdVbVYwZFhKdWN5QjBhR1VnWVhKeVlYa2diMllnY0hKdmNHVnlkSGtnYm1GdFpYTXVYRzRnS2lCQVpYaGhiWEJzWlZ4dUlDcGNiaUFxSUdaMWJtTjBhVzl1SUVadmJ5Z3BJSHRjYmlBcUlDQWdkR2hwY3k1aElEMGdNVHRjYmlBcUlDQWdkR2hwY3k1aUlEMGdNanRjYmlBcUlIMWNiaUFxWEc0Z0tpQkdiMjh1Y0hKdmRHOTBlWEJsTG1NZ1BTQXpPMXh1SUNwY2JpQXFJRjh1YTJWNWN5aHVaWGNnUm05dktUdGNiaUFxSUM4dklEMCtJRnNuWVNjc0lDZGlKMTBnS0dsMFpYSmhkR2x2YmlCdmNtUmxjaUJwY3lCdWIzUWdaM1ZoY21GdWRHVmxaQ2xjYmlBcVhHNGdLaUJmTG10bGVYTW9KMmhwSnlrN1hHNGdLaUF2THlBOVBpQmJKekFuTENBbk1TZGRYRzRnS2k5Y2JuWmhjaUJyWlhseklEMGdJVzVoZEdsMlpVdGxlWE1nUHlCemFHbHRTMlY1Y3lBNklHWjFibU4wYVc5dUtHOWlhbVZqZENrZ2UxeHVJQ0IyWVhJZ1EzUnZjaUE5SUc5aWFtVmpkQ0E5UFNCdWRXeHNJRDhnZFc1a1pXWnBibVZrSURvZ2IySnFaV04wTG1OdmJuTjBjblZqZEc5eU8xeHVJQ0JwWmlBb0tIUjVjR1Z2WmlCRGRHOXlJRDA5SUNkbWRXNWpkR2x2YmljZ0ppWWdRM1J2Y2k1d2NtOTBiM1I1Y0dVZ1BUMDlJRzlpYW1WamRDa2dmSHhjYmlBZ0lDQWdJQ2gwZVhCbGIyWWdiMkpxWldOMElDRTlJQ2RtZFc1amRHbHZiaWNnSmlZZ2FYTkJjbkpoZVV4cGEyVW9iMkpxWldOMEtTa3BJSHRjYmlBZ0lDQnlaWFIxY200Z2MyaHBiVXRsZVhNb2IySnFaV04wS1R0Y2JpQWdmVnh1SUNCeVpYUjFjbTRnYVhOUFltcGxZM1FvYjJKcVpXTjBLU0EvSUc1aGRHbDJaVXRsZVhNb2IySnFaV04wS1NBNklGdGRPMXh1ZlR0Y2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQnJaWGx6TzF4dVhHNWNibHh1THlvcUtpb3FLaW9xS2lvcUtpb3FLaW9xWEc0Z0tpb2dWMFZDVUVGRFN5QkdUMDlVUlZKY2JpQXFLaUF1TDM0dmJHOWtZWE5vTDI5aWFtVmpkQzlyWlhsekxtcHpYRzRnS2lvZ2JXOWtkV3hsSUdsa0lEMGdNemxjYmlBcUtpQnRiMlIxYkdVZ1kyaDFibXR6SUQwZ01GeHVJQ29xTHlJc0luWmhjaUJwYzBGeVozVnRaVzUwY3lBOUlISmxjWFZwY21Vb0p5NHVMMnhoYm1jdmFYTkJjbWQxYldWdWRITW5LU3hjYmlBZ0lDQnBjMEZ5Y21GNUlEMGdjbVZ4ZFdseVpTZ25MaTR2YkdGdVp5OXBjMEZ5Y21GNUp5a3NYRzRnSUNBZ2FYTkpibVJsZUNBOUlISmxjWFZwY21Vb0p5NHZhWE5KYm1SbGVDY3BMRnh1SUNBZ0lHbHpUR1Z1WjNSb0lEMGdjbVZ4ZFdseVpTZ25MaTlwYzB4bGJtZDBhQ2NwTEZ4dUlDQWdJR3RsZVhOSmJpQTlJSEpsY1hWcGNtVW9KeTR1TDI5aWFtVmpkQzlyWlhselNXNG5LVHRjYmx4dUx5b3FJRlZ6WldRZ1ptOXlJRzVoZEdsMlpTQnRaWFJvYjJRZ2NtVm1aWEpsYm1ObGN5NGdLaTljYm5aaGNpQnZZbXBsWTNSUWNtOTBieUE5SUU5aWFtVmpkQzV3Y205MGIzUjVjR1U3WEc1Y2JpOHFLaUJWYzJWa0lIUnZJR05vWldOcklHOWlhbVZqZEhNZ1ptOXlJRzkzYmlCd2NtOXdaWEowYVdWekxpQXFMMXh1ZG1GeUlHaGhjMDkzYmxCeWIzQmxjblI1SUQwZ2IySnFaV04wVUhKdmRHOHVhR0Z6VDNkdVVISnZjR1Z5ZEhrN1hHNWNiaThxS2x4dUlDb2dRU0JtWVd4c1ltRmpheUJwYlhCc1pXMWxiblJoZEdsdmJpQnZaaUJnVDJKcVpXTjBMbXRsZVhOZ0lIZG9hV05vSUdOeVpXRjBaWE1nWVc0Z1lYSnlZWGtnYjJZZ2RHaGxYRzRnS2lCdmQyNGdaVzUxYldWeVlXSnNaU0J3Y205d1pYSjBlU0J1WVcxbGN5QnZaaUJnYjJKcVpXTjBZQzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FIQmhjbUZ0SUh0UFltcGxZM1I5SUc5aWFtVmpkQ0JVYUdVZ2IySnFaV04wSUhSdklIRjFaWEo1TGx4dUlDb2dRSEpsZEhWeWJuTWdlMEZ5Y21GNWZTQlNaWFIxY201eklIUm9aU0JoY25KaGVTQnZaaUJ3Y205d1pYSjBlU0J1WVcxbGN5NWNiaUFxTDF4dVpuVnVZM1JwYjI0Z2MyaHBiVXRsZVhNb2IySnFaV04wS1NCN1hHNGdJSFpoY2lCd2NtOXdjeUE5SUd0bGVYTkpiaWh2WW1wbFkzUXBMRnh1SUNBZ0lDQWdjSEp2Y0hOTVpXNW5kR2dnUFNCd2NtOXdjeTVzWlc1bmRHZ3NYRzRnSUNBZ0lDQnNaVzVuZEdnZ1BTQndjbTl3YzB4bGJtZDBhQ0FtSmlCdlltcGxZM1F1YkdWdVozUm9PMXh1WEc0Z0lIWmhjaUJoYkd4dmQwbHVaR1Y0WlhNZ1BTQWhJV3hsYm1kMGFDQW1KaUJwYzB4bGJtZDBhQ2hzWlc1bmRHZ3BJQ1ltWEc0Z0lDQWdLR2x6UVhKeVlYa29iMkpxWldOMEtTQjhmQ0JwYzBGeVozVnRaVzUwY3lodlltcGxZM1FwS1R0Y2JseHVJQ0IyWVhJZ2FXNWtaWGdnUFNBdE1TeGNiaUFnSUNBZ0lISmxjM1ZzZENBOUlGdGRPMXh1WEc0Z0lIZG9hV3hsSUNncksybHVaR1Y0SUR3Z2NISnZjSE5NWlc1bmRHZ3BJSHRjYmlBZ0lDQjJZWElnYTJWNUlEMGdjSEp2Y0hOYmFXNWtaWGhkTzF4dUlDQWdJR2xtSUNnb1lXeHNiM2RKYm1SbGVHVnpJQ1ltSUdselNXNWtaWGdvYTJWNUxDQnNaVzVuZEdncEtTQjhmQ0JvWVhOUGQyNVFjbTl3WlhKMGVTNWpZV3hzS0c5aWFtVmpkQ3dnYTJWNUtTa2dlMXh1SUNBZ0lDQWdjbVZ6ZFd4MExuQjFjMmdvYTJWNUtUdGNiaUFnSUNCOVhHNGdJSDFjYmlBZ2NtVjBkWEp1SUhKbGMzVnNkRHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQnphR2x0UzJWNWN6dGNibHh1WEc1Y2JpOHFLaW9xS2lvcUtpb3FLaW9xS2lvcUtseHVJQ29xSUZkRlFsQkJRMHNnUms5UFZFVlNYRzRnS2lvZ0xpOStMMnh2WkdGemFDOXBiblJsY201aGJDOXphR2x0UzJWNWN5NXFjMXh1SUNvcUlHMXZaSFZzWlNCcFpDQTlJRFF3WEc0Z0tpb2diVzlrZFd4bElHTm9kVzVyY3lBOUlEQmNiaUFxS2k4aUxDSjJZWElnYVhOQmNtZDFiV1Z1ZEhNZ1BTQnlaWEYxYVhKbEtDY3VMaTlzWVc1bkwybHpRWEpuZFcxbGJuUnpKeWtzWEc0Z0lDQWdhWE5CY25KaGVTQTlJSEpsY1hWcGNtVW9KeTR1TDJ4aGJtY3ZhWE5CY25KaGVTY3BMRnh1SUNBZ0lHbHpTVzVrWlhnZ1BTQnlaWEYxYVhKbEtDY3VMaTlwYm5SbGNtNWhiQzlwYzBsdVpHVjRKeWtzWEc0Z0lDQWdhWE5NWlc1bmRHZ2dQU0J5WlhGMWFYSmxLQ2N1TGk5cGJuUmxjbTVoYkM5cGMweGxibWQwYUNjcExGeHVJQ0FnSUdselQySnFaV04wSUQwZ2NtVnhkV2x5WlNnbkxpNHZiR0Z1Wnk5cGMwOWlhbVZqZENjcE8xeHVYRzR2S2lvZ1ZYTmxaQ0JtYjNJZ2JtRjBhWFpsSUcxbGRHaHZaQ0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUc5aWFtVmpkRkJ5YjNSdklEMGdUMkpxWldOMExuQnliM1J2ZEhsd1pUdGNibHh1THlvcUlGVnpaV1FnZEc4Z1kyaGxZMnNnYjJKcVpXTjBjeUJtYjNJZ2IzZHVJSEJ5YjNCbGNuUnBaWE11SUNvdlhHNTJZWElnYUdGelQzZHVVSEp2Y0dWeWRIa2dQU0J2WW1wbFkzUlFjbTkwYnk1b1lYTlBkMjVRY205d1pYSjBlVHRjYmx4dUx5b3FYRzRnS2lCRGNtVmhkR1Z6SUdGdUlHRnljbUY1SUc5bUlIUm9aU0J2ZDI0Z1lXNWtJR2x1YUdWeWFYUmxaQ0JsYm5WdFpYSmhZbXhsSUhCeWIzQmxjblI1SUc1aGJXVnpJRzltSUdCdlltcGxZM1JnTGx4dUlDcGNiaUFxSUNvcVRtOTBaVG9xS2lCT2IyNHRiMkpxWldOMElIWmhiSFZsY3lCaGNtVWdZMjlsY21ObFpDQjBieUJ2WW1wbFkzUnpMbHh1SUNwY2JpQXFJRUJ6ZEdGMGFXTmNiaUFxSUVCdFpXMWlaWEpQWmlCZlhHNGdLaUJBWTJGMFpXZHZjbmtnVDJKcVpXTjBYRzRnS2lCQWNHRnlZVzBnZTA5aWFtVmpkSDBnYjJKcVpXTjBJRlJvWlNCdlltcGxZM1FnZEc4Z2NYVmxjbmt1WEc0Z0tpQkFjbVYwZFhKdWN5QjdRWEp5WVhsOUlGSmxkSFZ5Ym5NZ2RHaGxJR0Z5Y21GNUlHOW1JSEJ5YjNCbGNuUjVJRzVoYldWekxseHVJQ29nUUdWNFlXMXdiR1ZjYmlBcVhHNGdLaUJtZFc1amRHbHZiaUJHYjI4b0tTQjdYRzRnS2lBZ0lIUm9hWE11WVNBOUlERTdYRzRnS2lBZ0lIUm9hWE11WWlBOUlESTdYRzRnS2lCOVhHNGdLbHh1SUNvZ1JtOXZMbkJ5YjNSdmRIbHdaUzVqSUQwZ016dGNiaUFxWEc0Z0tpQmZMbXRsZVhOSmJpaHVaWGNnUm05dktUdGNiaUFxSUM4dklEMCtJRnNuWVNjc0lDZGlKeXdnSjJNblhTQW9hWFJsY21GMGFXOXVJRzl5WkdWeUlHbHpJRzV2ZENCbmRXRnlZVzUwWldWa0tWeHVJQ292WEc1bWRXNWpkR2x2YmlCclpYbHpTVzRvYjJKcVpXTjBLU0I3WEc0Z0lHbG1JQ2h2WW1wbFkzUWdQVDBnYm5Wc2JDa2dlMXh1SUNBZ0lISmxkSFZ5YmlCYlhUdGNiaUFnZlZ4dUlDQnBaaUFvSVdselQySnFaV04wS0c5aWFtVmpkQ2twSUh0Y2JpQWdJQ0J2WW1wbFkzUWdQU0JQWW1wbFkzUW9iMkpxWldOMEtUdGNiaUFnZlZ4dUlDQjJZWElnYkdWdVozUm9JRDBnYjJKcVpXTjBMbXhsYm1kMGFEdGNiaUFnYkdWdVozUm9JRDBnS0d4bGJtZDBhQ0FtSmlCcGMweGxibWQwYUNoc1pXNW5kR2dwSUNZbVhHNGdJQ0FnS0dselFYSnlZWGtvYjJKcVpXTjBLU0I4ZkNCcGMwRnlaM1Z0Wlc1MGN5aHZZbXBsWTNRcEtTQW1KaUJzWlc1bmRHZ3BJSHg4SURBN1hHNWNiaUFnZG1GeUlFTjBiM0lnUFNCdlltcGxZM1F1WTI5dWMzUnlkV04wYjNJc1hHNGdJQ0FnSUNCcGJtUmxlQ0E5SUMweExGeHVJQ0FnSUNBZ2FYTlFjbTkwYnlBOUlIUjVjR1Z2WmlCRGRHOXlJRDA5SUNkbWRXNWpkR2x2YmljZ0ppWWdRM1J2Y2k1d2NtOTBiM1I1Y0dVZ1BUMDlJRzlpYW1WamRDeGNiaUFnSUNBZ0lISmxjM1ZzZENBOUlFRnljbUY1S0d4bGJtZDBhQ2tzWEc0Z0lDQWdJQ0J6YTJsd1NXNWtaWGhsY3lBOUlHeGxibWQwYUNBK0lEQTdYRzVjYmlBZ2QyaHBiR1VnS0NzcmFXNWtaWGdnUENCc1pXNW5kR2dwSUh0Y2JpQWdJQ0J5WlhOMWJIUmJhVzVrWlhoZElEMGdLR2x1WkdWNElDc2dKeWNwTzF4dUlDQjlYRzRnSUdadmNpQW9kbUZ5SUd0bGVTQnBiaUJ2WW1wbFkzUXBJSHRjYmlBZ0lDQnBaaUFvSVNoemEybHdTVzVrWlhobGN5QW1KaUJwYzBsdVpHVjRLR3RsZVN3Z2JHVnVaM1JvS1NrZ0ppWmNiaUFnSUNBZ0lDQWdJU2hyWlhrZ1BUMGdKMk52Ym5OMGNuVmpkRzl5SnlBbUppQW9hWE5RY205MGJ5QjhmQ0FoYUdGelQzZHVVSEp2Y0dWeWRIa3VZMkZzYkNodlltcGxZM1FzSUd0bGVTa3BLU2tnZTF4dUlDQWdJQ0FnY21WemRXeDBMbkIxYzJnb2EyVjVLVHRjYmlBZ0lDQjlYRzRnSUgxY2JpQWdjbVYwZFhKdUlISmxjM1ZzZER0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JyWlhselNXNDdYRzVjYmx4dVhHNHZLaW9xS2lvcUtpb3FLaW9xS2lvcUtpcGNiaUFxS2lCWFJVSlFRVU5MSUVaUFQxUkZVbHh1SUNvcUlDNHZmaTlzYjJSaGMyZ3ZiMkpxWldOMEwydGxlWE5KYmk1cWMxeHVJQ29xSUcxdlpIVnNaU0JwWkNBOUlEUXhYRzRnS2lvZ2JXOWtkV3hsSUdOb2RXNXJjeUE5SURCY2JpQXFLaThpTENKMllYSWdhWE5NWlc1bmRHZ2dQU0J5WlhGMWFYSmxLQ2N1TGk5cGJuUmxjbTVoYkM5cGMweGxibWQwYUNjcExGeHVJQ0FnSUdselQySnFaV04wVEdsclpTQTlJSEpsY1hWcGNtVW9KeTR1TDJsdWRHVnlibUZzTDJselQySnFaV04wVEdsclpTY3BPMXh1WEc0dktpb2dZRTlpYW1WamRDTjBiMU4wY21sdVoyQWdjbVZ6ZFd4MElISmxabVZ5Wlc1alpYTXVJQ292WEc1MllYSWdZWEpuYzFSaFp5QTlJQ2RiYjJKcVpXTjBJRUZ5WjNWdFpXNTBjMTBuTEZ4dUlDQWdJR0Z5Y21GNVZHRm5JRDBnSjF0dlltcGxZM1FnUVhKeVlYbGRKeXhjYmlBZ0lDQmliMjlzVkdGbklEMGdKMXR2WW1wbFkzUWdRbTl2YkdWaGJsMG5MRnh1SUNBZ0lHUmhkR1ZVWVdjZ1BTQW5XMjlpYW1WamRDQkVZWFJsWFNjc1hHNGdJQ0FnWlhKeWIzSlVZV2NnUFNBblcyOWlhbVZqZENCRmNuSnZjbDBuTEZ4dUlDQWdJR1oxYm1OVVlXY2dQU0FuVzI5aWFtVmpkQ0JHZFc1amRHbHZibDBuTEZ4dUlDQWdJRzFoY0ZSaFp5QTlJQ2RiYjJKcVpXTjBJRTFoY0YwbkxGeHVJQ0FnSUc1MWJXSmxjbFJoWnlBOUlDZGJiMkpxWldOMElFNTFiV0psY2wwbkxGeHVJQ0FnSUc5aWFtVmpkRlJoWnlBOUlDZGJiMkpxWldOMElFOWlhbVZqZEYwbkxGeHVJQ0FnSUhKbFoyVjRjRlJoWnlBOUlDZGJiMkpxWldOMElGSmxaMFY0Y0YwbkxGeHVJQ0FnSUhObGRGUmhaeUE5SUNkYmIySnFaV04wSUZObGRGMG5MRnh1SUNBZ0lITjBjbWx1WjFSaFp5QTlJQ2RiYjJKcVpXTjBJRk4wY21sdVoxMG5MRnh1SUNBZ0lIZGxZV3ROWVhCVVlXY2dQU0FuVzI5aWFtVmpkQ0JYWldGclRXRndYU2M3WEc1Y2JuWmhjaUJoY25KaGVVSjFabVpsY2xSaFp5QTlJQ2RiYjJKcVpXTjBJRUZ5Y21GNVFuVm1abVZ5WFNjc1hHNGdJQ0FnWm14dllYUXpNbFJoWnlBOUlDZGJiMkpxWldOMElFWnNiMkYwTXpKQmNuSmhlVjBuTEZ4dUlDQWdJR1pzYjJGME5qUlVZV2NnUFNBblcyOWlhbVZqZENCR2JHOWhkRFkwUVhKeVlYbGRKeXhjYmlBZ0lDQnBiblE0VkdGbklEMGdKMXR2WW1wbFkzUWdTVzUwT0VGeWNtRjVYU2NzWEc0Z0lDQWdhVzUwTVRaVVlXY2dQU0FuVzI5aWFtVmpkQ0JKYm5ReE5rRnljbUY1WFNjc1hHNGdJQ0FnYVc1ME16SlVZV2NnUFNBblcyOWlhbVZqZENCSmJuUXpNa0Z5Y21GNVhTY3NYRzRnSUNBZ2RXbHVkRGhVWVdjZ1BTQW5XMjlpYW1WamRDQlZhVzUwT0VGeWNtRjVYU2NzWEc0Z0lDQWdkV2x1ZERoRGJHRnRjR1ZrVkdGbklEMGdKMXR2WW1wbFkzUWdWV2x1ZERoRGJHRnRjR1ZrUVhKeVlYbGRKeXhjYmlBZ0lDQjFhVzUwTVRaVVlXY2dQU0FuVzI5aWFtVmpkQ0JWYVc1ME1UWkJjbkpoZVYwbkxGeHVJQ0FnSUhWcGJuUXpNbFJoWnlBOUlDZGJiMkpxWldOMElGVnBiblF6TWtGeWNtRjVYU2M3WEc1Y2JpOHFLaUJWYzJWa0lIUnZJR2xrWlc1MGFXWjVJR0IwYjFOMGNtbHVaMVJoWjJBZ2RtRnNkV1Z6SUc5bUlIUjVjR1ZrSUdGeWNtRjVjeTRnS2k5Y2JuWmhjaUIwZVhCbFpFRnljbUY1VkdGbmN5QTlJSHQ5TzF4dWRIbHdaV1JCY25KaGVWUmhaM05iWm14dllYUXpNbFJoWjEwZ1BTQjBlWEJsWkVGeWNtRjVWR0ZuYzF0bWJHOWhkRFkwVkdGblhTQTlYRzUwZVhCbFpFRnljbUY1VkdGbmMxdHBiblE0VkdGblhTQTlJSFI1Y0dWa1FYSnlZWGxVWVdkelcybHVkREUyVkdGblhTQTlYRzUwZVhCbFpFRnljbUY1VkdGbmMxdHBiblF6TWxSaFoxMGdQU0IwZVhCbFpFRnljbUY1VkdGbmMxdDFhVzUwT0ZSaFoxMGdQVnh1ZEhsd1pXUkJjbkpoZVZSaFozTmJkV2x1ZERoRGJHRnRjR1ZrVkdGblhTQTlJSFI1Y0dWa1FYSnlZWGxVWVdkelczVnBiblF4TmxSaFoxMGdQVnh1ZEhsd1pXUkJjbkpoZVZSaFozTmJkV2x1ZERNeVZHRm5YU0E5SUhSeWRXVTdYRzUwZVhCbFpFRnljbUY1VkdGbmMxdGhjbWR6VkdGblhTQTlJSFI1Y0dWa1FYSnlZWGxVWVdkelcyRnljbUY1VkdGblhTQTlYRzUwZVhCbFpFRnljbUY1VkdGbmMxdGhjbkpoZVVKMVptWmxjbFJoWjEwZ1BTQjBlWEJsWkVGeWNtRjVWR0ZuYzF0aWIyOXNWR0ZuWFNBOVhHNTBlWEJsWkVGeWNtRjVWR0ZuYzF0a1lYUmxWR0ZuWFNBOUlIUjVjR1ZrUVhKeVlYbFVZV2R6VzJWeWNtOXlWR0ZuWFNBOVhHNTBlWEJsWkVGeWNtRjVWR0ZuYzF0bWRXNWpWR0ZuWFNBOUlIUjVjR1ZrUVhKeVlYbFVZV2R6VzIxaGNGUmhaMTBnUFZ4dWRIbHdaV1JCY25KaGVWUmhaM05iYm5WdFltVnlWR0ZuWFNBOUlIUjVjR1ZrUVhKeVlYbFVZV2R6VzI5aWFtVmpkRlJoWjEwZ1BWeHVkSGx3WldSQmNuSmhlVlJoWjNOYmNtVm5aWGh3VkdGblhTQTlJSFI1Y0dWa1FYSnlZWGxVWVdkelczTmxkRlJoWjEwZ1BWeHVkSGx3WldSQmNuSmhlVlJoWjNOYmMzUnlhVzVuVkdGblhTQTlJSFI1Y0dWa1FYSnlZWGxVWVdkelczZGxZV3ROWVhCVVlXZGRJRDBnWm1Gc2MyVTdYRzVjYmk4cUtpQlZjMlZrSUdadmNpQnVZWFJwZG1VZ2JXVjBhRzlrSUhKbFptVnlaVzVqWlhNdUlDb3ZYRzUyWVhJZ2IySnFaV04wVUhKdmRHOGdQU0JQWW1wbFkzUXVjSEp2ZEc5MGVYQmxPMXh1WEc0dktpcGNiaUFxSUZWelpXUWdkRzhnY21WemIyeDJaU0IwYUdVZ1cyQjBiMU4wY21sdVoxUmhaMkJkS0doMGRIQTZMeTlsWTIxaExXbHVkR1Z5Ym1GMGFXOXVZV3d1YjNKbkwyVmpiV0V0TWpZeUx6WXVNQzhqYzJWakxXOWlhbVZqZEM1d2NtOTBiM1I1Y0dVdWRHOXpkSEpwYm1jcFhHNGdLaUJ2WmlCMllXeDFaWE11WEc0Z0tpOWNiblpoY2lCdlltcFViMU4wY21sdVp5QTlJRzlpYW1WamRGQnliM1J2TG5SdlUzUnlhVzVuTzF4dVhHNHZLaXBjYmlBcUlFTm9aV05yY3lCcFppQmdkbUZzZFdWZ0lHbHpJR05zWVhOemFXWnBaV1FnWVhNZ1lTQjBlWEJsWkNCaGNuSmhlUzVjYmlBcVhHNGdLaUJBYzNSaGRHbGpYRzRnS2lCQWJXVnRZbVZ5VDJZZ1gxeHVJQ29nUUdOaGRHVm5iM0o1SUV4aGJtZGNiaUFxSUVCd1lYSmhiU0I3S24wZ2RtRnNkV1VnVkdobElIWmhiSFZsSUhSdklHTm9aV05yTGx4dUlDb2dRSEpsZEhWeWJuTWdlMkp2YjJ4bFlXNTlJRkpsZEhWeWJuTWdZSFJ5ZFdWZ0lHbG1JR0IyWVd4MVpXQWdhWE1nWTI5eWNtVmpkR3g1SUdOc1lYTnphV1pwWldRc0lHVnNjMlVnWUdaaGJITmxZQzVjYmlBcUlFQmxlR0Z0Y0d4bFhHNGdLbHh1SUNvZ1h5NXBjMVI1Y0dWa1FYSnlZWGtvYm1WM0lGVnBiblE0UVhKeVlYa3BPMXh1SUNvZ0x5OGdQVDRnZEhKMVpWeHVJQ3BjYmlBcUlGOHVhWE5VZVhCbFpFRnljbUY1S0Z0ZEtUdGNiaUFxSUM4dklEMCtJR1poYkhObFhHNGdLaTljYm1aMWJtTjBhVzl1SUdselZIbHdaV1JCY25KaGVTaDJZV3gxWlNrZ2UxeHVJQ0J5WlhSMWNtNGdhWE5QWW1wbFkzUk1hV3RsS0haaGJIVmxLU0FtSmlCcGMweGxibWQwYUNoMllXeDFaUzVzWlc1bmRHZ3BJQ1ltSUNFaGRIbHdaV1JCY25KaGVWUmhaM05iYjJKcVZHOVRkSEpwYm1jdVkyRnNiQ2gyWVd4MVpTbGRPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHbHpWSGx3WldSQmNuSmhlVHRjYmx4dVhHNWNiaThxS2lvcUtpb3FLaW9xS2lvcUtpb3FLbHh1SUNvcUlGZEZRbEJCUTBzZ1JrOVBWRVZTWEc0Z0tpb2dMaTkrTDJ4dlpHRnphQzlzWVc1bkwybHpWSGx3WldSQmNuSmhlUzVxYzF4dUlDb3FJRzF2WkhWc1pTQnBaQ0E5SURReVhHNGdLaW9nYlc5a2RXeGxJR05vZFc1cmN5QTlJREJjYmlBcUtpOGlMQ0oyWVhJZ2FYTlBZbXBsWTNRZ1BTQnlaWEYxYVhKbEtDY3VMaTlzWVc1bkwybHpUMkpxWldOMEp5azdYRzVjYmk4cUtseHVJQ29nUTI5dWRtVnlkSE1nWUhaaGJIVmxZQ0IwYnlCaGJpQnZZbXBsWTNRZ2FXWWdhWFFuY3lCdWIzUWdiMjVsTGx4dUlDcGNiaUFxSUVCd2NtbDJZWFJsWEc0Z0tpQkFjR0Z5WVcwZ2V5cDlJSFpoYkhWbElGUm9aU0IyWVd4MVpTQjBieUJ3Y205alpYTnpMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UwOWlhbVZqZEgwZ1VtVjBkWEp1Y3lCMGFHVWdiMkpxWldOMExseHVJQ292WEc1bWRXNWpkR2x2YmlCMGIwOWlhbVZqZENoMllXeDFaU2tnZTF4dUlDQnlaWFIxY200Z2FYTlBZbXBsWTNRb2RtRnNkV1VwSUQ4Z2RtRnNkV1VnT2lCUFltcGxZM1FvZG1Gc2RXVXBPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlIUnZUMkpxWldOME8xeHVYRzVjYmx4dUx5b3FLaW9xS2lvcUtpb3FLaW9xS2lvcVhHNGdLaW9nVjBWQ1VFRkRTeUJHVDA5VVJWSmNiaUFxS2lBdUwzNHZiRzlrWVhOb0wybHVkR1Z5Ym1Gc0wzUnZUMkpxWldOMExtcHpYRzRnS2lvZ2JXOWtkV3hsSUdsa0lEMGdORE5jYmlBcUtpQnRiMlIxYkdVZ1kyaDFibXR6SUQwZ01GeHVJQ29xTHlJc0luWmhjaUJwYzFOMGNtbGpkRU52YlhCaGNtRmliR1VnUFNCeVpYRjFhWEpsS0NjdUwybHpVM1J5YVdOMFEyOXRjR0Z5WVdKc1pTY3BMRnh1SUNBZ0lIQmhhWEp6SUQwZ2NtVnhkV2x5WlNnbkxpNHZiMkpxWldOMEwzQmhhWEp6SnlrN1hHNWNiaThxS2x4dUlDb2dSMlYwY3lCMGFHVWdjSEp2Y0dWeWVTQnVZVzFsY3l3Z2RtRnNkV1Z6TENCaGJtUWdZMjl0Y0dGeVpTQm1iR0ZuY3lCdlppQmdiMkpxWldOMFlDNWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUhCaGNtRnRJSHRQWW1wbFkzUjlJRzlpYW1WamRDQlVhR1VnYjJKcVpXTjBJSFJ2SUhGMVpYSjVMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UwRnljbUY1ZlNCU1pYUjFjbTV6SUhSb1pTQnRZWFJqYUNCa1lYUmhJRzltSUdCdlltcGxZM1JnTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJuWlhSTllYUmphRVJoZEdFb2IySnFaV04wS1NCN1hHNGdJSFpoY2lCeVpYTjFiSFFnUFNCd1lXbHljeWh2WW1wbFkzUXBMRnh1SUNBZ0lDQWdiR1Z1WjNSb0lEMGdjbVZ6ZFd4MExteGxibWQwYUR0Y2JseHVJQ0IzYUdsc1pTQW9iR1Z1WjNSb0xTMHBJSHRjYmlBZ0lDQnlaWE4xYkhSYmJHVnVaM1JvWFZzeVhTQTlJR2x6VTNSeWFXTjBRMjl0Y0dGeVlXSnNaU2h5WlhOMWJIUmJiR1Z1WjNSb1hWc3hYU2s3WEc0Z0lIMWNiaUFnY21WMGRYSnVJSEpsYzNWc2REdGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCblpYUk5ZWFJqYUVSaGRHRTdYRzVjYmx4dVhHNHZLaW9xS2lvcUtpb3FLaW9xS2lvcUtpcGNiaUFxS2lCWFJVSlFRVU5MSUVaUFQxUkZVbHh1SUNvcUlDNHZmaTlzYjJSaGMyZ3ZhVzUwWlhKdVlXd3ZaMlYwVFdGMFkyaEVZWFJoTG1welhHNGdLaW9nYlc5a2RXeGxJR2xrSUQwZ05EUmNiaUFxS2lCdGIyUjFiR1VnWTJoMWJtdHpJRDBnTUZ4dUlDb3FMeUlzSW5aaGNpQnBjMDlpYW1WamRDQTlJSEpsY1hWcGNtVW9KeTR1TDJ4aGJtY3ZhWE5QWW1wbFkzUW5LVHRjYmx4dUx5b3FYRzRnS2lCRGFHVmphM01nYVdZZ1lIWmhiSFZsWUNCcGN5QnpkV2wwWVdKc1pTQm1iM0lnYzNSeWFXTjBJR1Z4ZFdGc2FYUjVJR052YlhCaGNtbHpiMjV6TENCcExtVXVJR0E5UFQxZ0xseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdleXA5SUhaaGJIVmxJRlJvWlNCMllXeDFaU0IwYnlCamFHVmpheTVjYmlBcUlFQnlaWFIxY201eklIdGliMjlzWldGdWZTQlNaWFIxY201eklHQjBjblZsWUNCcFppQmdkbUZzZFdWZ0lHbG1JSE4xYVhSaFlteGxJR1p2Y2lCemRISnBZM1JjYmlBcUlDQmxjWFZoYkdsMGVTQmpiMjF3WVhKcGMyOXVjeXdnWld4elpTQmdabUZzYzJWZ0xseHVJQ292WEc1bWRXNWpkR2x2YmlCcGMxTjBjbWxqZEVOdmJYQmhjbUZpYkdVb2RtRnNkV1VwSUh0Y2JpQWdjbVYwZFhKdUlIWmhiSFZsSUQwOVBTQjJZV3gxWlNBbUppQWhhWE5QWW1wbFkzUW9kbUZzZFdVcE8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdselUzUnlhV04wUTI5dGNHRnlZV0pzWlR0Y2JseHVYRzVjYmk4cUtpb3FLaW9xS2lvcUtpb3FLaW9xS2x4dUlDb3FJRmRGUWxCQlEwc2dSazlQVkVWU1hHNGdLaW9nTGk5K0wyeHZaR0Z6YUM5cGJuUmxjbTVoYkM5cGMxTjBjbWxqZEVOdmJYQmhjbUZpYkdVdWFuTmNiaUFxS2lCdGIyUjFiR1VnYVdRZ1BTQTBOVnh1SUNvcUlHMXZaSFZzWlNCamFIVnVhM01nUFNBd1hHNGdLaW92SWl3aWRtRnlJR3RsZVhNZ1BTQnlaWEYxYVhKbEtDY3VMMnRsZVhNbktTeGNiaUFnSUNCMGIwOWlhbVZqZENBOUlISmxjWFZwY21Vb0p5NHVMMmx1ZEdWeWJtRnNMM1J2VDJKcVpXTjBKeWs3WEc1Y2JpOHFLbHh1SUNvZ1EzSmxZWFJsY3lCaElIUjNieUJrYVcxbGJuTnBiMjVoYkNCaGNuSmhlU0J2WmlCMGFHVWdhMlY1TFhaaGJIVmxJSEJoYVhKeklHWnZjaUJnYjJKcVpXTjBZQ3hjYmlBcUlHVXVaeTRnWUZ0YmEyVjVNU3dnZG1Gc2RXVXhYU3dnVzJ0bGVUSXNJSFpoYkhWbE1sMWRZQzVjYmlBcVhHNGdLaUJBYzNSaGRHbGpYRzRnS2lCQWJXVnRZbVZ5VDJZZ1gxeHVJQ29nUUdOaGRHVm5iM0o1SUU5aWFtVmpkRnh1SUNvZ1FIQmhjbUZ0SUh0UFltcGxZM1I5SUc5aWFtVmpkQ0JVYUdVZ2IySnFaV04wSUhSdklIRjFaWEo1TGx4dUlDb2dRSEpsZEhWeWJuTWdlMEZ5Y21GNWZTQlNaWFIxY201eklIUm9aU0J1WlhjZ1lYSnlZWGtnYjJZZ2EyVjVMWFpoYkhWbElIQmhhWEp6TGx4dUlDb2dRR1Y0WVcxd2JHVmNiaUFxWEc0Z0tpQmZMbkJoYVhKektIc2dKMkpoY201bGVTYzZJRE0yTENBblpuSmxaQ2M2SURRd0lIMHBPMXh1SUNvZ0x5OGdQVDRnVzFzblltRnlibVY1Snl3Z016WmRMQ0JiSjJaeVpXUW5MQ0EwTUYxZElDaHBkR1Z5WVhScGIyNGdiM0prWlhJZ2FYTWdibTkwSUdkMVlYSmhiblJsWldRcFhHNGdLaTljYm1aMWJtTjBhVzl1SUhCaGFYSnpLRzlpYW1WamRDa2dlMXh1SUNCdlltcGxZM1FnUFNCMGIwOWlhbVZqZENodlltcGxZM1FwTzF4dVhHNGdJSFpoY2lCcGJtUmxlQ0E5SUMweExGeHVJQ0FnSUNBZ2NISnZjSE1nUFNCclpYbHpLRzlpYW1WamRDa3NYRzRnSUNBZ0lDQnNaVzVuZEdnZ1BTQndjbTl3Y3k1c1pXNW5kR2dzWEc0Z0lDQWdJQ0J5WlhOMWJIUWdQU0JCY25KaGVTaHNaVzVuZEdncE8xeHVYRzRnSUhkb2FXeGxJQ2dySzJsdVpHVjRJRHdnYkdWdVozUm9LU0I3WEc0Z0lDQWdkbUZ5SUd0bGVTQTlJSEJ5YjNCelcybHVaR1Y0WFR0Y2JpQWdJQ0J5WlhOMWJIUmJhVzVrWlhoZElEMGdXMnRsZVN3Z2IySnFaV04wVzJ0bGVWMWRPMXh1SUNCOVhHNGdJSEpsZEhWeWJpQnlaWE4xYkhRN1hHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnY0dGcGNuTTdYRzVjYmx4dVhHNHZLaW9xS2lvcUtpb3FLaW9xS2lvcUtpcGNiaUFxS2lCWFJVSlFRVU5MSUVaUFQxUkZVbHh1SUNvcUlDNHZmaTlzYjJSaGMyZ3ZiMkpxWldOMEwzQmhhWEp6TG1welhHNGdLaW9nYlc5a2RXeGxJR2xrSUQwZ05EWmNiaUFxS2lCdGIyUjFiR1VnWTJoMWJtdHpJRDBnTUZ4dUlDb3FMeUlzSW5aaGNpQmlZWE5sUjJWMElEMGdjbVZ4ZFdseVpTZ25MaTlpWVhObFIyVjBKeWtzWEc0Z0lDQWdZbUZ6WlVselJYRjFZV3dnUFNCeVpYRjFhWEpsS0NjdUwySmhjMlZKYzBWeGRXRnNKeWtzWEc0Z0lDQWdZbUZ6WlZOc2FXTmxJRDBnY21WeGRXbHlaU2duTGk5aVlYTmxVMnhwWTJVbktTeGNiaUFnSUNCcGMwRnljbUY1SUQwZ2NtVnhkV2x5WlNnbkxpNHZiR0Z1Wnk5cGMwRnljbUY1Snlrc1hHNGdJQ0FnYVhOTFpYa2dQU0J5WlhGMWFYSmxLQ2N1TDJselMyVjVKeWtzWEc0Z0lDQWdhWE5UZEhKcFkzUkRiMjF3WVhKaFlteGxJRDBnY21WeGRXbHlaU2duTGk5cGMxTjBjbWxqZEVOdmJYQmhjbUZpYkdVbktTeGNiaUFnSUNCc1lYTjBJRDBnY21WeGRXbHlaU2duTGk0dllYSnlZWGt2YkdGemRDY3BMRnh1SUNBZ0lIUnZUMkpxWldOMElEMGdjbVZ4ZFdseVpTZ25MaTkwYjA5aWFtVmpkQ2NwTEZ4dUlDQWdJSFJ2VUdGMGFDQTlJSEpsY1hWcGNtVW9KeTR2ZEc5UVlYUm9KeWs3WEc1Y2JpOHFLbHh1SUNvZ1ZHaGxJR0poYzJVZ2FXMXdiR1Z0Wlc1MFlYUnBiMjRnYjJZZ1lGOHViV0YwWTJobGMxQnliM0JsY25SNVlDQjNhR2xqYUNCa2IyVnpJRzV2ZENCamJHOXVaU0JnYzNKalZtRnNkV1ZnTGx4dUlDcGNiaUFxSUVCd2NtbDJZWFJsWEc0Z0tpQkFjR0Z5WVcwZ2UzTjBjbWx1WjMwZ2NHRjBhQ0JVYUdVZ2NHRjBhQ0J2WmlCMGFHVWdjSEp2Y0dWeWRIa2dkRzhnWjJWMExseHVJQ29nUUhCaGNtRnRJSHNxZlNCemNtTldZV3gxWlNCVWFHVWdkbUZzZFdVZ2RHOGdZMjl0Y0dGeVpTNWNiaUFxSUVCeVpYUjFjbTV6SUh0R2RXNWpkR2x2Ym4wZ1VtVjBkWEp1Y3lCMGFHVWdibVYzSUdaMWJtTjBhVzl1TGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJpWVhObFRXRjBZMmhsYzFCeWIzQmxjblI1S0hCaGRHZ3NJSE55WTFaaGJIVmxLU0I3WEc0Z0lIWmhjaUJwYzBGeWNpQTlJR2x6UVhKeVlYa29jR0YwYUNrc1hHNGdJQ0FnSUNCcGMwTnZiVzF2YmlBOUlHbHpTMlY1S0hCaGRHZ3BJQ1ltSUdselUzUnlhV04wUTI5dGNHRnlZV0pzWlNoemNtTldZV3gxWlNrc1hHNGdJQ0FnSUNCd1lYUm9TMlY1SUQwZ0tIQmhkR2dnS3lBbkp5azdYRzVjYmlBZ2NHRjBhQ0E5SUhSdlVHRjBhQ2h3WVhSb0tUdGNiaUFnY21WMGRYSnVJR1oxYm1OMGFXOXVLRzlpYW1WamRDa2dlMXh1SUNBZ0lHbG1JQ2h2WW1wbFkzUWdQVDBnYm5Wc2JDa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlHWmhiSE5sTzF4dUlDQWdJSDFjYmlBZ0lDQjJZWElnYTJWNUlEMGdjR0YwYUV0bGVUdGNiaUFnSUNCdlltcGxZM1FnUFNCMGIwOWlhbVZqZENodlltcGxZM1FwTzF4dUlDQWdJR2xtSUNnb2FYTkJjbklnZkh3Z0lXbHpRMjl0Ylc5dUtTQW1KaUFoS0d0bGVTQnBiaUJ2WW1wbFkzUXBLU0I3WEc0Z0lDQWdJQ0J2WW1wbFkzUWdQU0J3WVhSb0xteGxibWQwYUNBOVBTQXhJRDhnYjJKcVpXTjBJRG9nWW1GelpVZGxkQ2h2WW1wbFkzUXNJR0poYzJWVGJHbGpaU2h3WVhSb0xDQXdMQ0F0TVNrcE8xeHVJQ0FnSUNBZ2FXWWdLRzlpYW1WamRDQTlQU0J1ZFd4c0tTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQm1ZV3h6WlR0Y2JpQWdJQ0FnSUgxY2JpQWdJQ0FnSUd0bGVTQTlJR3hoYzNRb2NHRjBhQ2s3WEc0Z0lDQWdJQ0J2WW1wbFkzUWdQU0IwYjA5aWFtVmpkQ2h2WW1wbFkzUXBPMXh1SUNBZ0lIMWNiaUFnSUNCeVpYUjFjbTRnYjJKcVpXTjBXMnRsZVYwZ1BUMDlJSE55WTFaaGJIVmxYRzRnSUNBZ0lDQS9JQ2h6Y21OV1lXeDFaU0FoUFQwZ2RXNWtaV1pwYm1Wa0lIeDhJQ2hyWlhrZ2FXNGdiMkpxWldOMEtTbGNiaUFnSUNBZ0lEb2dZbUZ6WlVselJYRjFZV3dvYzNKalZtRnNkV1VzSUc5aWFtVmpkRnRyWlhsZExDQjFibVJsWm1sdVpXUXNJSFJ5ZFdVcE8xeHVJQ0I5TzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR0poYzJWTllYUmphR1Z6VUhKdmNHVnlkSGs3WEc1Y2JseHVYRzR2S2lvcUtpb3FLaW9xS2lvcUtpb3FLaXBjYmlBcUtpQlhSVUpRUVVOTElFWlBUMVJGVWx4dUlDb3FJQzR2Zmk5c2IyUmhjMmd2YVc1MFpYSnVZV3d2WW1GelpVMWhkR05vWlhOUWNtOXdaWEowZVM1cWMxeHVJQ29xSUcxdlpIVnNaU0JwWkNBOUlEUTNYRzRnS2lvZ2JXOWtkV3hsSUdOb2RXNXJjeUE5SURCY2JpQXFLaThpTENKMllYSWdkRzlQWW1wbFkzUWdQU0J5WlhGMWFYSmxLQ2N1TDNSdlQySnFaV04wSnlrN1hHNWNiaThxS2x4dUlDb2dWR2hsSUdKaGMyVWdhVzF3YkdWdFpXNTBZWFJwYjI0Z2IyWWdZR2RsZEdBZ2QybDBhRzkxZENCemRYQndiM0owSUdadmNpQnpkSEpwYm1jZ2NHRjBhSE5jYmlBcUlHRnVaQ0JrWldaaGRXeDBJSFpoYkhWbGN5NWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUhCaGNtRnRJSHRQWW1wbFkzUjlJRzlpYW1WamRDQlVhR1VnYjJKcVpXTjBJSFJ2SUhGMVpYSjVMbHh1SUNvZ1FIQmhjbUZ0SUh0QmNuSmhlWDBnY0dGMGFDQlVhR1VnY0dGMGFDQnZaaUIwYUdVZ2NISnZjR1Z5ZEhrZ2RHOGdaMlYwTGx4dUlDb2dRSEJoY21GdElIdHpkSEpwYm1kOUlGdHdZWFJvUzJWNVhTQlVhR1VnYTJWNUlISmxjSEpsYzJWdWRHRjBhVzl1SUc5bUlIQmhkR2d1WEc0Z0tpQkFjbVYwZFhKdWN5QjdLbjBnVW1WMGRYSnVjeUIwYUdVZ2NtVnpiMngyWldRZ2RtRnNkV1V1WEc0Z0tpOWNibVoxYm1OMGFXOXVJR0poYzJWSFpYUW9iMkpxWldOMExDQndZWFJvTENCd1lYUm9TMlY1S1NCN1hHNGdJR2xtSUNodlltcGxZM1FnUFQwZ2JuVnNiQ2tnZTF4dUlDQWdJSEpsZEhWeWJqdGNiaUFnZlZ4dUlDQnBaaUFvY0dGMGFFdGxlU0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JSEJoZEdoTFpYa2dhVzRnZEc5UFltcGxZM1FvYjJKcVpXTjBLU2tnZTF4dUlDQWdJSEJoZEdnZ1BTQmJjR0YwYUV0bGVWMDdYRzRnSUgxY2JpQWdkbUZ5SUdsdVpHVjRJRDBnTUN4Y2JpQWdJQ0FnSUd4bGJtZDBhQ0E5SUhCaGRHZ3ViR1Z1WjNSb08xeHVYRzRnSUhkb2FXeGxJQ2h2WW1wbFkzUWdJVDBnYm5Wc2JDQW1KaUJwYm1SbGVDQThJR3hsYm1kMGFDa2dlMXh1SUNBZ0lHOWlhbVZqZENBOUlHOWlhbVZqZEZ0d1lYUm9XMmx1WkdWNEt5dGRYVHRjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdLR2x1WkdWNElDWW1JR2x1WkdWNElEMDlJR3hsYm1kMGFDa2dQeUJ2WW1wbFkzUWdPaUIxYm1SbFptbHVaV1E3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdZbUZ6WlVkbGREdGNibHh1WEc1Y2JpOHFLaW9xS2lvcUtpb3FLaW9xS2lvcUtseHVJQ29xSUZkRlFsQkJRMHNnUms5UFZFVlNYRzRnS2lvZ0xpOStMMnh2WkdGemFDOXBiblJsY201aGJDOWlZWE5sUjJWMExtcHpYRzRnS2lvZ2JXOWtkV3hsSUdsa0lEMGdORGhjYmlBcUtpQnRiMlIxYkdVZ1kyaDFibXR6SUQwZ01GeHVJQ29xTHlJc0lpOHFLbHh1SUNvZ1ZHaGxJR0poYzJVZ2FXMXdiR1Z0Wlc1MFlYUnBiMjRnYjJZZ1lGOHVjMnhwWTJWZ0lIZHBkR2h2ZFhRZ1lXNGdhWFJsY21GMFpXVWdZMkZzYkNCbmRXRnlaQzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FIQmhjbUZ0SUh0QmNuSmhlWDBnWVhKeVlYa2dWR2hsSUdGeWNtRjVJSFJ2SUhOc2FXTmxMbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUZ0emRHRnlkRDB3WFNCVWFHVWdjM1JoY25RZ2NHOXphWFJwYjI0dVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXMlZ1WkQxaGNuSmhlUzVzWlc1bmRHaGRJRlJvWlNCbGJtUWdjRzl6YVhScGIyNHVYRzRnS2lCQWNtVjBkWEp1Y3lCN1FYSnlZWGw5SUZKbGRIVnlibk1nZEdobElITnNhV05sSUc5bUlHQmhjbkpoZVdBdVhHNGdLaTljYm1aMWJtTjBhVzl1SUdKaGMyVlRiR2xqWlNoaGNuSmhlU3dnYzNSaGNuUXNJR1Z1WkNrZ2UxeHVJQ0IyWVhJZ2FXNWtaWGdnUFNBdE1TeGNiaUFnSUNBZ0lHeGxibWQwYUNBOUlHRnljbUY1TG14bGJtZDBhRHRjYmx4dUlDQnpkR0Z5ZENBOUlITjBZWEowSUQwOUlHNTFiR3dnUHlBd0lEb2dLQ3R6ZEdGeWRDQjhmQ0F3S1R0Y2JpQWdhV1lnS0hOMFlYSjBJRHdnTUNrZ2UxeHVJQ0FnSUhOMFlYSjBJRDBnTFhOMFlYSjBJRDRnYkdWdVozUm9JRDhnTUNBNklDaHNaVzVuZEdnZ0t5QnpkR0Z5ZENrN1hHNGdJSDFjYmlBZ1pXNWtJRDBnS0dWdVpDQTlQVDBnZFc1a1pXWnBibVZrSUh4OElHVnVaQ0ErSUd4bGJtZDBhQ2tnUHlCc1pXNW5kR2dnT2lBb0syVnVaQ0I4ZkNBd0tUdGNiaUFnYVdZZ0tHVnVaQ0E4SURBcElIdGNiaUFnSUNCbGJtUWdLejBnYkdWdVozUm9PMXh1SUNCOVhHNGdJR3hsYm1kMGFDQTlJSE4wWVhKMElENGdaVzVrSUQ4Z01DQTZJQ2dvWlc1a0lDMGdjM1JoY25RcElENCtQaUF3S1R0Y2JpQWdjM1JoY25RZ1BqNCtQU0F3TzF4dVhHNGdJSFpoY2lCeVpYTjFiSFFnUFNCQmNuSmhlU2hzWlc1bmRHZ3BPMXh1SUNCM2FHbHNaU0FvS3l0cGJtUmxlQ0E4SUd4bGJtZDBhQ2tnZTF4dUlDQWdJSEpsYzNWc2RGdHBibVJsZUYwZ1BTQmhjbkpoZVZ0cGJtUmxlQ0FySUhOMFlYSjBYVHRjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdjbVZ6ZFd4ME8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdKaGMyVlRiR2xqWlR0Y2JseHVYRzVjYmk4cUtpb3FLaW9xS2lvcUtpb3FLaW9xS2x4dUlDb3FJRmRGUWxCQlEwc2dSazlQVkVWU1hHNGdLaW9nTGk5K0wyeHZaR0Z6YUM5cGJuUmxjbTVoYkM5aVlYTmxVMnhwWTJVdWFuTmNiaUFxS2lCdGIyUjFiR1VnYVdRZ1BTQTBPVnh1SUNvcUlHMXZaSFZzWlNCamFIVnVhM01nUFNBd1hHNGdLaW92SWl3aWRtRnlJR2x6UVhKeVlYa2dQU0J5WlhGMWFYSmxLQ2N1TGk5c1lXNW5MMmx6UVhKeVlYa25LU3hjYmlBZ0lDQjBiMDlpYW1WamRDQTlJSEpsY1hWcGNtVW9KeTR2ZEc5UFltcGxZM1FuS1R0Y2JseHVMeW9xSUZWelpXUWdkRzhnYldGMFkyZ2djSEp2Y0dWeWRIa2dibUZ0WlhNZ2QybDBhR2x1SUhCeWIzQmxjblI1SUhCaGRHaHpMaUFxTDF4dWRtRnlJSEpsU1hORVpXVndVSEp2Y0NBOUlDOWNYQzU4WEZ4YktEODZXMTViWEZ4ZFhTcDhLRnRjSWlkZEtTZy9PaWcvSVZ4Y01TbGJYbHhjYmx4Y1hGeGRmRnhjWEZ3dUtTby9YRnd4S1Z4Y1hTOHNYRzRnSUNBZ2NtVkpjMUJzWVdsdVVISnZjQ0E5SUM5ZVhGeDNLaVF2TzF4dVhHNHZLaXBjYmlBcUlFTm9aV05yY3lCcFppQmdkbUZzZFdWZ0lHbHpJR0VnY0hKdmNHVnlkSGtnYm1GdFpTQmhibVFnYm05MElHRWdjSEp2Y0dWeWRIa2djR0YwYUM1Y2JpQXFYRzRnS2lCQWNISnBkbUYwWlZ4dUlDb2dRSEJoY21GdElIc3FmU0IyWVd4MVpTQlVhR1VnZG1Gc2RXVWdkRzhnWTJobFkyc3VYRzRnS2lCQWNHRnlZVzBnZTA5aWFtVmpkSDBnVzI5aWFtVmpkRjBnVkdobElHOWlhbVZqZENCMGJ5QnhkV1Z5ZVNCclpYbHpJRzl1TGx4dUlDb2dRSEpsZEhWeWJuTWdlMkp2YjJ4bFlXNTlJRkpsZEhWeWJuTWdZSFJ5ZFdWZ0lHbG1JR0IyWVd4MVpXQWdhWE1nWVNCd2NtOXdaWEowZVNCdVlXMWxMQ0JsYkhObElHQm1ZV3h6WldBdVhHNGdLaTljYm1aMWJtTjBhVzl1SUdselMyVjVLSFpoYkhWbExDQnZZbXBsWTNRcElIdGNiaUFnZG1GeUlIUjVjR1VnUFNCMGVYQmxiMllnZG1Gc2RXVTdYRzRnSUdsbUlDZ29kSGx3WlNBOVBTQW5jM1J5YVc1bkp5QW1KaUJ5WlVselVHeGhhVzVRY205d0xuUmxjM1FvZG1Gc2RXVXBLU0I4ZkNCMGVYQmxJRDA5SUNkdWRXMWlaWEluS1NCN1hHNGdJQ0FnY21WMGRYSnVJSFJ5ZFdVN1hHNGdJSDFjYmlBZ2FXWWdLR2x6UVhKeVlYa29kbUZzZFdVcEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdaaGJITmxPMXh1SUNCOVhHNGdJSFpoY2lCeVpYTjFiSFFnUFNBaGNtVkpjMFJsWlhCUWNtOXdMblJsYzNRb2RtRnNkV1VwTzF4dUlDQnlaWFIxY200Z2NtVnpkV3gwSUh4OElDaHZZbXBsWTNRZ0lUMGdiblZzYkNBbUppQjJZV3gxWlNCcGJpQjBiMDlpYW1WamRDaHZZbXBsWTNRcEtUdGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCcGMwdGxlVHRjYmx4dVhHNWNiaThxS2lvcUtpb3FLaW9xS2lvcUtpb3FLbHh1SUNvcUlGZEZRbEJCUTBzZ1JrOVBWRVZTWEc0Z0tpb2dMaTkrTDJ4dlpHRnphQzlwYm5SbGNtNWhiQzlwYzB0bGVTNXFjMXh1SUNvcUlHMXZaSFZzWlNCcFpDQTlJRFV3WEc0Z0tpb2diVzlrZFd4bElHTm9kVzVyY3lBOUlEQmNiaUFxS2k4aUxDSXZLaXBjYmlBcUlFZGxkSE1nZEdobElHeGhjM1FnWld4bGJXVnVkQ0J2WmlCZ1lYSnlZWGxnTGx4dUlDcGNiaUFxSUVCemRHRjBhV05jYmlBcUlFQnRaVzFpWlhKUFppQmZYRzRnS2lCQVkyRjBaV2R2Y25rZ1FYSnlZWGxjYmlBcUlFQndZWEpoYlNCN1FYSnlZWGw5SUdGeWNtRjVJRlJvWlNCaGNuSmhlU0IwYnlCeGRXVnllUzVjYmlBcUlFQnlaWFIxY201eklIc3FmU0JTWlhSMWNtNXpJSFJvWlNCc1lYTjBJR1ZzWlcxbGJuUWdiMllnWUdGeWNtRjVZQzVjYmlBcUlFQmxlR0Z0Y0d4bFhHNGdLbHh1SUNvZ1h5NXNZWE4wS0ZzeExDQXlMQ0F6WFNrN1hHNGdLaUF2THlBOVBpQXpYRzRnS2k5Y2JtWjFibU4wYVc5dUlHeGhjM1FvWVhKeVlYa3BJSHRjYmlBZ2RtRnlJR3hsYm1kMGFDQTlJR0Z5Y21GNUlEOGdZWEp5WVhrdWJHVnVaM1JvSURvZ01EdGNiaUFnY21WMGRYSnVJR3hsYm1kMGFDQS9JR0Z5Y21GNVcyeGxibWQwYUNBdElERmRJRG9nZFc1a1pXWnBibVZrTzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR3hoYzNRN1hHNWNibHh1WEc0dktpb3FLaW9xS2lvcUtpb3FLaW9xS2lwY2JpQXFLaUJYUlVKUVFVTkxJRVpQVDFSRlVseHVJQ29xSUM0dmZpOXNiMlJoYzJndllYSnlZWGt2YkdGemRDNXFjMXh1SUNvcUlHMXZaSFZzWlNCcFpDQTlJRFV4WEc0Z0tpb2diVzlrZFd4bElHTm9kVzVyY3lBOUlEQmNiaUFxS2k4aUxDSjJZWElnWW1GelpWUnZVM1J5YVc1bklEMGdjbVZ4ZFdseVpTZ25MaTlpWVhObFZHOVRkSEpwYm1jbktTeGNiaUFnSUNCcGMwRnljbUY1SUQwZ2NtVnhkV2x5WlNnbkxpNHZiR0Z1Wnk5cGMwRnljbUY1SnlrN1hHNWNiaThxS2lCVmMyVmtJSFJ2SUcxaGRHTm9JSEJ5YjNCbGNuUjVJRzVoYldWeklIZHBkR2hwYmlCd2NtOXdaWEowZVNCd1lYUm9jeTRnS2k5Y2JuWmhjaUJ5WlZCeWIzQk9ZVzFsSUQwZ0wxdGVMbHRjWEYxZEszeGNYRnNvUHpvb0xUOWNYR1FyS0Q4NlhGd3VYRnhrS3lrL0tYd29XMXdpSjEwcEtDZy9PaWcvSVZ4Y01pbGJYbHhjYmx4Y1hGeGRmRnhjWEZ3dUtTby9LVnhjTWlsY1hGMHZaenRjYmx4dUx5b3FJRlZ6WldRZ2RHOGdiV0YwWTJnZ1ltRmphM05zWVhOb1pYTWdhVzRnY0hKdmNHVnlkSGtnY0dGMGFITXVJQ292WEc1MllYSWdjbVZGYzJOaGNHVkRhR0Z5SUQwZ0wxeGNYRndvWEZ4Y1hDay9MMmM3WEc1Y2JpOHFLbHh1SUNvZ1EyOXVkbVZ5ZEhNZ1lIWmhiSFZsWUNCMGJ5QndjbTl3WlhKMGVTQndZWFJvSUdGeWNtRjVJR2xtSUdsMEozTWdibTkwSUc5dVpTNWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUhCaGNtRnRJSHNxZlNCMllXeDFaU0JVYUdVZ2RtRnNkV1VnZEc4Z2NISnZZMlZ6Y3k1Y2JpQXFJRUJ5WlhSMWNtNXpJSHRCY25KaGVYMGdVbVYwZFhKdWN5QjBhR1VnY0hKdmNHVnlkSGtnY0dGMGFDQmhjbkpoZVM1Y2JpQXFMMXh1Wm5WdVkzUnBiMjRnZEc5UVlYUm9LSFpoYkhWbEtTQjdYRzRnSUdsbUlDaHBjMEZ5Y21GNUtIWmhiSFZsS1NrZ2UxeHVJQ0FnSUhKbGRIVnliaUIyWVd4MVpUdGNiaUFnZlZ4dUlDQjJZWElnY21WemRXeDBJRDBnVzEwN1hHNGdJR0poYzJWVWIxTjBjbWx1WnloMllXeDFaU2t1Y21Wd2JHRmpaU2h5WlZCeWIzQk9ZVzFsTENCbWRXNWpkR2x2YmlodFlYUmphQ3dnYm5WdFltVnlMQ0J4ZFc5MFpTd2djM1J5YVc1bktTQjdYRzRnSUNBZ2NtVnpkV3gwTG5CMWMyZ29jWFZ2ZEdVZ1B5QnpkSEpwYm1jdWNtVndiR0ZqWlNoeVpVVnpZMkZ3WlVOb1lYSXNJQ2NrTVNjcElEb2dLRzUxYldKbGNpQjhmQ0J0WVhSamFDa3BPMXh1SUNCOUtUdGNiaUFnY21WMGRYSnVJSEpsYzNWc2REdGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCMGIxQmhkR2c3WEc1Y2JseHVYRzR2S2lvcUtpb3FLaW9xS2lvcUtpb3FLaXBjYmlBcUtpQlhSVUpRUVVOTElFWlBUMVJGVWx4dUlDb3FJQzR2Zmk5c2IyUmhjMmd2YVc1MFpYSnVZV3d2ZEc5UVlYUm9MbXB6WEc0Z0tpb2diVzlrZFd4bElHbGtJRDBnTlRKY2JpQXFLaUJ0YjJSMWJHVWdZMmgxYm10eklEMGdNRnh1SUNvcUx5SXNJaThxS2x4dUlDb2dRMjl1ZG1WeWRITWdZSFpoYkhWbFlDQjBieUJoSUhOMGNtbHVaeUJwWmlCcGRDZHpJRzV2ZENCdmJtVXVJRUZ1SUdWdGNIUjVJSE4wY21sdVp5QnBjeUJ5WlhSMWNtNWxaRnh1SUNvZ1ptOXlJR0J1ZFd4c1lDQnZjaUJnZFc1a1pXWnBibVZrWUNCMllXeDFaWE11WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN0tuMGdkbUZzZFdVZ1ZHaGxJSFpoYkhWbElIUnZJSEJ5YjJObGMzTXVYRzRnS2lCQWNtVjBkWEp1Y3lCN2MzUnlhVzVuZlNCU1pYUjFjbTV6SUhSb1pTQnpkSEpwYm1jdVhHNGdLaTljYm1aMWJtTjBhVzl1SUdKaGMyVlViMU4wY21sdVp5aDJZV3gxWlNrZ2UxeHVJQ0J5WlhSMWNtNGdkbUZzZFdVZ1BUMGdiblZzYkNBL0lDY25JRG9nS0haaGJIVmxJQ3NnSnljcE8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdKaGMyVlViMU4wY21sdVp6dGNibHh1WEc1Y2JpOHFLaW9xS2lvcUtpb3FLaW9xS2lvcUtseHVJQ29xSUZkRlFsQkJRMHNnUms5UFZFVlNYRzRnS2lvZ0xpOStMMnh2WkdGemFDOXBiblJsY201aGJDOWlZWE5sVkc5VGRISnBibWN1YW5OY2JpQXFLaUJ0YjJSMWJHVWdhV1FnUFNBMU0xeHVJQ29xSUcxdlpIVnNaU0JqYUhWdWEzTWdQU0F3WEc0Z0tpb3ZJaXdpZG1GeUlHbGtaVzUwYVhSNUlEMGdjbVZ4ZFdseVpTZ25MaTR2ZFhScGJHbDBlUzlwWkdWdWRHbDBlU2NwTzF4dVhHNHZLaXBjYmlBcUlFRWdjM0JsWTJsaGJHbDZaV1FnZG1WeWMybHZiaUJ2WmlCZ1ltRnpaVU5oYkd4aVlXTnJZQ0IzYUdsamFDQnZibXg1SUhOMWNIQnZjblJ6SUdCMGFHbHpZQ0JpYVc1a2FXNW5YRzRnS2lCaGJtUWdjM0JsWTJsbWVXbHVaeUIwYUdVZ2JuVnRZbVZ5SUc5bUlHRnlaM1Z0Wlc1MGN5QjBieUJ3Y205MmFXUmxJSFJ2SUdCbWRXNWpZQzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FIQmhjbUZ0SUh0R2RXNWpkR2x2Ym4wZ1puVnVZeUJVYUdVZ1puVnVZM1JwYjI0Z2RHOGdZbWx1WkM1Y2JpQXFJRUJ3WVhKaGJTQjdLbjBnZEdocGMwRnlaeUJVYUdVZ1lIUm9hWE5nSUdKcGJtUnBibWNnYjJZZ1lHWjFibU5nTGx4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlGdGhjbWREYjNWdWRGMGdWR2hsSUc1MWJXSmxjaUJ2WmlCaGNtZDFiV1Z1ZEhNZ2RHOGdjSEp2ZG1sa1pTQjBieUJnWm5WdVkyQXVYRzRnS2lCQWNtVjBkWEp1Y3lCN1JuVnVZM1JwYjI1OUlGSmxkSFZ5Ym5NZ2RHaGxJR05oYkd4aVlXTnJMbHh1SUNvdlhHNW1kVzVqZEdsdmJpQmlhVzVrUTJGc2JHSmhZMnNvWm5WdVl5d2dkR2hwYzBGeVp5d2dZWEpuUTI5MWJuUXBJSHRjYmlBZ2FXWWdLSFI1Y0dWdlppQm1kVzVqSUNFOUlDZG1kVzVqZEdsdmJpY3BJSHRjYmlBZ0lDQnlaWFIxY200Z2FXUmxiblJwZEhrN1hHNGdJSDFjYmlBZ2FXWWdLSFJvYVhOQmNtY2dQVDA5SUhWdVpHVm1hVzVsWkNrZ2UxeHVJQ0FnSUhKbGRIVnliaUJtZFc1ak8xeHVJQ0I5WEc0Z0lITjNhWFJqYUNBb1lYSm5RMjkxYm5RcElIdGNiaUFnSUNCallYTmxJREU2SUhKbGRIVnliaUJtZFc1amRHbHZiaWgyWVd4MVpTa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlHWjFibU11WTJGc2JDaDBhR2x6UVhKbkxDQjJZV3gxWlNrN1hHNGdJQ0FnZlR0Y2JpQWdJQ0JqWVhObElETTZJSEpsZEhWeWJpQm1kVzVqZEdsdmJpaDJZV3gxWlN3Z2FXNWtaWGdzSUdOdmJHeGxZM1JwYjI0cElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCbWRXNWpMbU5oYkd3b2RHaHBjMEZ5Wnl3Z2RtRnNkV1VzSUdsdVpHVjRMQ0JqYjJ4c1pXTjBhVzl1S1R0Y2JpQWdJQ0I5TzF4dUlDQWdJR05oYzJVZ05Eb2djbVYwZFhKdUlHWjFibU4wYVc5dUtHRmpZM1Z0ZFd4aGRHOXlMQ0IyWVd4MVpTd2dhVzVrWlhnc0lHTnZiR3hsWTNScGIyNHBJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQm1kVzVqTG1OaGJHd29kR2hwYzBGeVp5d2dZV05qZFcxMWJHRjBiM0lzSUhaaGJIVmxMQ0JwYm1SbGVDd2dZMjlzYkdWamRHbHZiaWs3WEc0Z0lDQWdmVHRjYmlBZ0lDQmpZWE5sSURVNklISmxkSFZ5YmlCbWRXNWpkR2x2YmloMllXeDFaU3dnYjNSb1pYSXNJR3RsZVN3Z2IySnFaV04wTENCemIzVnlZMlVwSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJtZFc1akxtTmhiR3dvZEdocGMwRnlaeXdnZG1Gc2RXVXNJRzkwYUdWeUxDQnJaWGtzSUc5aWFtVmpkQ3dnYzI5MWNtTmxLVHRjYmlBZ0lDQjlPMXh1SUNCOVhHNGdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0lDQnlaWFIxY200Z1puVnVZeTVoY0hCc2VTaDBhR2x6UVhKbkxDQmhjbWQxYldWdWRITXBPMXh1SUNCOU8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdKcGJtUkRZV3hzWW1GamF6dGNibHh1WEc1Y2JpOHFLaW9xS2lvcUtpb3FLaW9xS2lvcUtseHVJQ29xSUZkRlFsQkJRMHNnUms5UFZFVlNYRzRnS2lvZ0xpOStMMnh2WkdGemFDOXBiblJsY201aGJDOWlhVzVrUTJGc2JHSmhZMnN1YW5OY2JpQXFLaUJ0YjJSMWJHVWdhV1FnUFNBMU5GeHVJQ29xSUcxdlpIVnNaU0JqYUhWdWEzTWdQU0F3WEc0Z0tpb3ZJaXdpTHlvcVhHNGdLaUJVYUdseklHMWxkR2h2WkNCeVpYUjFjbTV6SUhSb1pTQm1hWEp6ZENCaGNtZDFiV1Z1ZENCd2NtOTJhV1JsWkNCMGJ5QnBkQzVjYmlBcVhHNGdLaUJBYzNSaGRHbGpYRzRnS2lCQWJXVnRZbVZ5VDJZZ1gxeHVJQ29nUUdOaGRHVm5iM0o1SUZWMGFXeHBkSGxjYmlBcUlFQndZWEpoYlNCN0tuMGdkbUZzZFdVZ1FXNTVJSFpoYkhWbExseHVJQ29nUUhKbGRIVnlibk1nZXlwOUlGSmxkSFZ5Ym5NZ1lIWmhiSFZsWUM1Y2JpQXFJRUJsZUdGdGNHeGxYRzRnS2x4dUlDb2dkbUZ5SUc5aWFtVmpkQ0E5SUhzZ0ozVnpaWEluT2lBblpuSmxaQ2NnZlR0Y2JpQXFYRzRnS2lCZkxtbGtaVzUwYVhSNUtHOWlhbVZqZENrZ1BUMDlJRzlpYW1WamREdGNiaUFxSUM4dklEMCtJSFJ5ZFdWY2JpQXFMMXh1Wm5WdVkzUnBiMjRnYVdSbGJuUnBkSGtvZG1Gc2RXVXBJSHRjYmlBZ2NtVjBkWEp1SUhaaGJIVmxPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHbGtaVzUwYVhSNU8xeHVYRzVjYmx4dUx5b3FLaW9xS2lvcUtpb3FLaW9xS2lvcVhHNGdLaW9nVjBWQ1VFRkRTeUJHVDA5VVJWSmNiaUFxS2lBdUwzNHZiRzlrWVhOb0wzVjBhV3hwZEhrdmFXUmxiblJwZEhrdWFuTmNiaUFxS2lCdGIyUjFiR1VnYVdRZ1BTQTFOVnh1SUNvcUlHMXZaSFZzWlNCamFIVnVhM01nUFNBd1hHNGdLaW92SWl3aWRtRnlJR0poYzJWUWNtOXdaWEowZVNBOUlISmxjWFZwY21Vb0p5NHVMMmx1ZEdWeWJtRnNMMkpoYzJWUWNtOXdaWEowZVNjcExGeHVJQ0FnSUdKaGMyVlFjbTl3WlhKMGVVUmxaWEFnUFNCeVpYRjFhWEpsS0NjdUxpOXBiblJsY201aGJDOWlZWE5sVUhKdmNHVnlkSGxFWldWd0p5a3NYRzRnSUNBZ2FYTkxaWGtnUFNCeVpYRjFhWEpsS0NjdUxpOXBiblJsY201aGJDOXBjMHRsZVNjcE8xeHVYRzR2S2lwY2JpQXFJRU55WldGMFpYTWdZU0JtZFc1amRHbHZiaUIwYUdGMElISmxkSFZ5Ym5NZ2RHaGxJSEJ5YjNCbGNuUjVJSFpoYkhWbElHRjBJR0J3WVhSb1lDQnZiaUJoWEc0Z0tpQm5hWFpsYmlCdlltcGxZM1F1WEc0Z0tseHVJQ29nUUhOMFlYUnBZMXh1SUNvZ1FHMWxiV0psY2s5bUlGOWNiaUFxSUVCallYUmxaMjl5ZVNCVmRHbHNhWFI1WEc0Z0tpQkFjR0Z5WVcwZ2UwRnljbUY1ZkhOMGNtbHVaMzBnY0dGMGFDQlVhR1VnY0dGMGFDQnZaaUIwYUdVZ2NISnZjR1Z5ZEhrZ2RHOGdaMlYwTGx4dUlDb2dRSEpsZEhWeWJuTWdlMFoxYm1OMGFXOXVmU0JTWlhSMWNtNXpJSFJvWlNCdVpYY2dablZ1WTNScGIyNHVYRzRnS2lCQVpYaGhiWEJzWlZ4dUlDcGNiaUFxSUhaaGNpQnZZbXBsWTNSeklEMGdXMXh1SUNvZ0lDQjdJQ2RoSnpvZ2V5QW5ZaWM2SUhzZ0oyTW5PaUF5SUgwZ2ZTQjlMRnh1SUNvZ0lDQjdJQ2RoSnpvZ2V5QW5ZaWM2SUhzZ0oyTW5PaUF4SUgwZ2ZTQjlYRzRnS2lCZE8xeHVJQ3BjYmlBcUlGOHViV0Z3S0c5aWFtVmpkSE1zSUY4dWNISnZjR1Z5ZEhrb0oyRXVZaTVqSnlrcE8xeHVJQ29nTHk4Z1BUNGdXeklzSURGZFhHNGdLbHh1SUNvZ1h5NXdiSFZqYXloZkxuTnZjblJDZVNodlltcGxZM1J6TENCZkxuQnliM0JsY25SNUtGc25ZU2NzSUNkaUp5d2dKMk1uWFNrcExDQW5ZUzVpTG1NbktUdGNiaUFxSUM4dklEMCtJRnN4TENBeVhWeHVJQ292WEc1bWRXNWpkR2x2YmlCd2NtOXdaWEowZVNod1lYUm9LU0I3WEc0Z0lISmxkSFZ5YmlCcGMwdGxlU2h3WVhSb0tTQS9JR0poYzJWUWNtOXdaWEowZVNod1lYUm9LU0E2SUdKaGMyVlFjbTl3WlhKMGVVUmxaWEFvY0dGMGFDazdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ2NISnZjR1Z5ZEhrN1hHNWNibHh1WEc0dktpb3FLaW9xS2lvcUtpb3FLaW9xS2lwY2JpQXFLaUJYUlVKUVFVTkxJRVpQVDFSRlVseHVJQ29xSUM0dmZpOXNiMlJoYzJndmRYUnBiR2wwZVM5d2NtOXdaWEowZVM1cWMxeHVJQ29xSUcxdlpIVnNaU0JwWkNBOUlEVTJYRzRnS2lvZ2JXOWtkV3hsSUdOb2RXNXJjeUE5SURCY2JpQXFLaThpTENKMllYSWdZbUZ6WlVkbGRDQTlJSEpsY1hWcGNtVW9KeTR2WW1GelpVZGxkQ2NwTEZ4dUlDQWdJSFJ2VUdGMGFDQTlJSEpsY1hWcGNtVW9KeTR2ZEc5UVlYUm9KeWs3WEc1Y2JpOHFLbHh1SUNvZ1FTQnpjR1ZqYVdGc2FYcGxaQ0IyWlhKemFXOXVJRzltSUdCaVlYTmxVSEp2Y0dWeWRIbGdJSGRvYVdOb0lITjFjSEJ2Y25SeklHUmxaWEFnY0dGMGFITXVYRzRnS2x4dUlDb2dRSEJ5YVhaaGRHVmNiaUFxSUVCd1lYSmhiU0I3UVhKeVlYbDhjM1J5YVc1bmZTQndZWFJvSUZSb1pTQndZWFJvSUc5bUlIUm9aU0J3Y205d1pYSjBlU0IwYnlCblpYUXVYRzRnS2lCQWNtVjBkWEp1Y3lCN1JuVnVZM1JwYjI1OUlGSmxkSFZ5Ym5NZ2RHaGxJRzVsZHlCbWRXNWpkR2x2Ymk1Y2JpQXFMMXh1Wm5WdVkzUnBiMjRnWW1GelpWQnliM0JsY25SNVJHVmxjQ2h3WVhSb0tTQjdYRzRnSUhaaGNpQndZWFJvUzJWNUlEMGdLSEJoZEdnZ0t5QW5KeWs3WEc0Z0lIQmhkR2dnUFNCMGIxQmhkR2dvY0dGMGFDazdYRzRnSUhKbGRIVnliaUJtZFc1amRHbHZiaWh2WW1wbFkzUXBJSHRjYmlBZ0lDQnlaWFIxY200Z1ltRnpaVWRsZENodlltcGxZM1FzSUhCaGRHZ3NJSEJoZEdoTFpYa3BPMXh1SUNCOU8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdKaGMyVlFjbTl3WlhKMGVVUmxaWEE3WEc1Y2JseHVYRzR2S2lvcUtpb3FLaW9xS2lvcUtpb3FLaXBjYmlBcUtpQlhSVUpRUVVOTElFWlBUMVJGVWx4dUlDb3FJQzR2Zmk5c2IyUmhjMmd2YVc1MFpYSnVZV3d2WW1GelpWQnliM0JsY25SNVJHVmxjQzVxYzF4dUlDb3FJRzF2WkhWc1pTQnBaQ0E5SURVM1hHNGdLaW9nYlc5a2RXeGxJR05vZFc1cmN5QTlJREJjYmlBcUtpOGlMQ0oyWVhJZ1ltRnpaVWx1WkdWNFQyWWdQU0J5WlhGMWFYSmxLQ2N1TDJKaGMyVkpibVJsZUU5bUp5a3NYRzRnSUNBZ1kyRmphR1ZKYm1SbGVFOW1JRDBnY21WeGRXbHlaU2duTGk5allXTm9aVWx1WkdWNFQyWW5LU3hjYmlBZ0lDQmpjbVZoZEdWRFlXTm9aU0E5SUhKbGNYVnBjbVVvSnk0dlkzSmxZWFJsUTJGamFHVW5LVHRjYmx4dUx5b3FJRlZ6WldRZ1lYTWdkR2hsSUhOcGVtVWdkRzhnWlc1aFlteGxJR3hoY21kbElHRnljbUY1SUc5d2RHbHRhWHBoZEdsdmJuTXVJQ292WEc1MllYSWdURUZTUjBWZlFWSlNRVmxmVTBsYVJTQTlJREl3TUR0Y2JseHVMeW9xWEc0Z0tpQlVhR1VnWW1GelpTQnBiWEJzWlcxbGJuUmhkR2x2YmlCdlppQmdYeTUxYm1seFlDQjNhWFJvYjNWMElITjFjSEJ2Y25RZ1ptOXlJR05oYkd4aVlXTnJJSE5vYjNKMGFHRnVaSE5jYmlBcUlHRnVaQ0JnZEdocGMyQWdZbWx1WkdsdVp5NWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUhCaGNtRnRJSHRCY25KaGVYMGdZWEp5WVhrZ1ZHaGxJR0Z5Y21GNUlIUnZJR2x1YzNCbFkzUXVYRzRnS2lCQWNHRnlZVzBnZTBaMWJtTjBhVzl1ZlNCYmFYUmxjbUYwWldWZElGUm9aU0JtZFc1amRHbHZiaUJwYm5admEyVmtJSEJsY2lCcGRHVnlZWFJwYjI0dVhHNGdLaUJBY21WMGRYSnVjeUI3UVhKeVlYbDlJRkpsZEhWeWJuTWdkR2hsSUc1bGR5QmtkWEJzYVdOaGRHVWdabkpsWlNCaGNuSmhlUzVjYmlBcUwxeHVablZ1WTNScGIyNGdZbUZ6WlZWdWFYRW9ZWEp5WVhrc0lHbDBaWEpoZEdWbEtTQjdYRzRnSUhaaGNpQnBibVJsZUNBOUlDMHhMRnh1SUNBZ0lDQWdhVzVrWlhoUFppQTlJR0poYzJWSmJtUmxlRTltTEZ4dUlDQWdJQ0FnYkdWdVozUm9JRDBnWVhKeVlYa3ViR1Z1WjNSb0xGeHVJQ0FnSUNBZ2FYTkRiMjF0YjI0Z1BTQjBjblZsTEZ4dUlDQWdJQ0FnYVhOTVlYSm5aU0E5SUdselEyOXRiVzl1SUNZbUlHeGxibWQwYUNBK1BTQk1RVkpIUlY5QlVsSkJXVjlUU1ZwRkxGeHVJQ0FnSUNBZ2MyVmxiaUE5SUdselRHRnlaMlVnUHlCamNtVmhkR1ZEWVdOb1pTZ3BJRG9nYm5Wc2JDeGNiaUFnSUNBZ0lISmxjM1ZzZENBOUlGdGRPMXh1WEc0Z0lHbG1JQ2h6WldWdUtTQjdYRzRnSUNBZ2FXNWtaWGhQWmlBOUlHTmhZMmhsU1c1a1pYaFBaanRjYmlBZ0lDQnBjME52YlcxdmJpQTlJR1poYkhObE8xeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lHbHpUR0Z5WjJVZ1BTQm1ZV3h6WlR0Y2JpQWdJQ0J6WldWdUlEMGdhWFJsY21GMFpXVWdQeUJiWFNBNklISmxjM1ZzZER0Y2JpQWdmVnh1SUNCdmRYUmxjanBjYmlBZ2QyaHBiR1VnS0NzcmFXNWtaWGdnUENCc1pXNW5kR2dwSUh0Y2JpQWdJQ0IyWVhJZ2RtRnNkV1VnUFNCaGNuSmhlVnRwYm1SbGVGMHNYRzRnSUNBZ0lDQWdJR052YlhCMWRHVmtJRDBnYVhSbGNtRjBaV1VnUHlCcGRHVnlZWFJsWlNoMllXeDFaU3dnYVc1a1pYZ3NJR0Z5Y21GNUtTQTZJSFpoYkhWbE8xeHVYRzRnSUNBZ2FXWWdLR2x6UTI5dGJXOXVJQ1ltSUhaaGJIVmxJRDA5UFNCMllXeDFaU2tnZTF4dUlDQWdJQ0FnZG1GeUlITmxaVzVKYm1SbGVDQTlJSE5sWlc0dWJHVnVaM1JvTzF4dUlDQWdJQ0FnZDJocGJHVWdLSE5sWlc1SmJtUmxlQzB0S1NCN1hHNGdJQ0FnSUNBZ0lHbG1JQ2h6WldWdVczTmxaVzVKYm1SbGVGMGdQVDA5SUdOdmJYQjFkR1ZrS1NCN1hHNGdJQ0FnSUNBZ0lDQWdZMjl1ZEdsdWRXVWdiM1YwWlhJN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lIMWNiaUFnSUNBZ0lHbG1JQ2hwZEdWeVlYUmxaU2tnZTF4dUlDQWdJQ0FnSUNCelpXVnVMbkIxYzJnb1kyOXRjSFYwWldRcE8xeHVJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2NtVnpkV3gwTG5CMWMyZ29kbUZzZFdVcE8xeHVJQ0FnSUgxY2JpQWdJQ0JsYkhObElHbG1JQ2hwYm1SbGVFOW1LSE5sWlc0c0lHTnZiWEIxZEdWa0xDQXdLU0E4SURBcElIdGNiaUFnSUNBZ0lHbG1JQ2hwZEdWeVlYUmxaU0I4ZkNCcGMweGhjbWRsS1NCN1hHNGdJQ0FnSUNBZ0lITmxaVzR1Y0hWemFDaGpiMjF3ZFhSbFpDazdYRzRnSUNBZ0lDQjlYRzRnSUNBZ0lDQnlaWE4xYkhRdWNIVnphQ2gyWVd4MVpTazdYRzRnSUNBZ2ZWeHVJQ0I5WEc0Z0lISmxkSFZ5YmlCeVpYTjFiSFE3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdZbUZ6WlZWdWFYRTdYRzVjYmx4dVhHNHZLaW9xS2lvcUtpb3FLaW9xS2lvcUtpcGNiaUFxS2lCWFJVSlFRVU5MSUVaUFQxUkZVbHh1SUNvcUlDNHZmaTlzYjJSaGMyZ3ZhVzUwWlhKdVlXd3ZZbUZ6WlZWdWFYRXVhbk5jYmlBcUtpQnRiMlIxYkdVZ2FXUWdQU0ExT0Z4dUlDb3FJRzF2WkhWc1pTQmphSFZ1YTNNZ1BTQXdYRzRnS2lvdklpd2lMeW9xWEc0Z0tpQkJiaUJwYlhCc1pXMWxiblJoZEdsdmJpQnZaaUJnWHk1MWJtbHhZQ0J2Y0hScGJXbDZaV1FnWm05eUlITnZjblJsWkNCaGNuSmhlWE1nZDJsMGFHOTFkQ0J6ZFhCd2IzSjBYRzRnS2lCbWIzSWdZMkZzYkdKaFkyc2djMmh2Y25Sb1lXNWtjeUJoYm1RZ1lIUm9hWE5nSUdKcGJtUnBibWN1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1FYSnlZWGw5SUdGeWNtRjVJRlJvWlNCaGNuSmhlU0IwYnlCcGJuTndaV04wTGx4dUlDb2dRSEJoY21GdElIdEdkVzVqZEdsdmJuMGdXMmwwWlhKaGRHVmxYU0JVYUdVZ1puVnVZM1JwYjI0Z2FXNTJiMnRsWkNCd1pYSWdhWFJsY21GMGFXOXVMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UwRnljbUY1ZlNCU1pYUjFjbTV6SUhSb1pTQnVaWGNnWkhWd2JHbGpZWFJsSUdaeVpXVWdZWEp5WVhrdVhHNGdLaTljYm1aMWJtTjBhVzl1SUhOdmNuUmxaRlZ1YVhFb1lYSnlZWGtzSUdsMFpYSmhkR1ZsS1NCN1hHNGdJSFpoY2lCelpXVnVMRnh1SUNBZ0lDQWdhVzVrWlhnZ1BTQXRNU3hjYmlBZ0lDQWdJR3hsYm1kMGFDQTlJR0Z5Y21GNUxteGxibWQwYUN4Y2JpQWdJQ0FnSUhKbGMwbHVaR1Y0SUQwZ0xURXNYRzRnSUNBZ0lDQnlaWE4xYkhRZ1BTQmJYVHRjYmx4dUlDQjNhR2xzWlNBb0t5dHBibVJsZUNBOElHeGxibWQwYUNrZ2UxeHVJQ0FnSUhaaGNpQjJZV3gxWlNBOUlHRnljbUY1VzJsdVpHVjRYU3hjYmlBZ0lDQWdJQ0FnWTI5dGNIVjBaV1FnUFNCcGRHVnlZWFJsWlNBL0lHbDBaWEpoZEdWbEtIWmhiSFZsTENCcGJtUmxlQ3dnWVhKeVlYa3BJRG9nZG1Gc2RXVTdYRzVjYmlBZ0lDQnBaaUFvSVdsdVpHVjRJSHg4SUhObFpXNGdJVDA5SUdOdmJYQjFkR1ZrS1NCN1hHNGdJQ0FnSUNCelpXVnVJRDBnWTI5dGNIVjBaV1E3WEc0Z0lDQWdJQ0J5WlhOMWJIUmJLeXR5WlhOSmJtUmxlRjBnUFNCMllXeDFaVHRjYmlBZ0lDQjlYRzRnSUgxY2JpQWdjbVYwZFhKdUlISmxjM1ZzZER0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0J6YjNKMFpXUlZibWx4TzF4dVhHNWNibHh1THlvcUtpb3FLaW9xS2lvcUtpb3FLaW9xWEc0Z0tpb2dWMFZDVUVGRFN5QkdUMDlVUlZKY2JpQXFLaUF1TDM0dmJHOWtZWE5vTDJsdWRHVnlibUZzTDNOdmNuUmxaRlZ1YVhFdWFuTmNiaUFxS2lCdGIyUjFiR1VnYVdRZ1BTQTFPVnh1SUNvcUlHMXZaSFZzWlNCamFIVnVhM01nUFNBd1hHNGdLaW92SWl3aUozVnpaU0J6ZEhKcFkzUW5PMXh1WEc1bGVIQnZjblFnWkdWbVlYVnNkQ0FvZTFOMVluTmpjbWx3ZEdsdmJpd2djM1ZpYzJOeWFYQjBhVzl1YzBKNVZWVkpSQ3dnYzNWaWMyTnlhWEIwYVc5dWMwSjVVSEp2Y0dWeWRIa3NJSEJ5YjNCbGNuUnBaWE1zSUdOaGJHeGlZV05yZlNrZ1BUNGdlMXh1SUNBdktpQnRZV3RsSUdFZ2MzVmljMk55YVhCMGFXOXVJQ292WEc0Z0lHeGxkQ0J6ZFdKelkzSnBjSFJwYjI0Z1BTQlRkV0p6WTNKcGNIUnBiMjRvZTNCeWIzQmxjblJwWlhNc0lHTmhiR3hpWVdOcmZTazdYRzVjYmlBZ0x5b2dZV1JrSUhSb1pTQnpkV0p6WTNKcGNIUnBiMjRnZEc4Z2RHaGxJSE4xWW5OamNtbHdkR2x2Ym5OQ2VWVlZTVVFnYjJKcVpXTjBJQ292WEc0Z0lITjFZbk5qY21sd2RHbHZibk5DZVZWVlNVUmJjM1ZpYzJOeWFYQjBhVzl1TG5WMWFXUmRJRDBnYzNWaWMyTnlhWEIwYVc5dU8xeHVYRzRnSUM4cUlHRmtaQ0J5WldabGNtVnVZMlZ6SUhSdklIUm9aU0J6ZFdKelkzSnBjSFJwYjI0Z2RHOGdaV0ZqYUNCdlppQjBhR1VnS2k5Y2JpQWdMeW9nYzNWaWMyTnlhV0psWkNCd2NtOXdaWEowYVdWeklDb3ZYRzRnSUhCeWIzQmxjblJwWlhNdVptOXlSV0ZqYUNnb2NISnZjR1Z5ZEhrcElEMCtJSHRjYmlBZ0lDQnpkV0p6WTNKcGNIUnBiMjV6UW5sUWNtOXdaWEowZVM1aFpHUW9lM0J5YjNCbGNuUjVMQ0J6ZFdKelkzSnBjSFJwYjI1OUtUdGNiaUFnZlNrN1hHNWNiaUFnY21WMGRYSnVJSE4xWW5OamNtbHdkR2x2Ymk1MWRXbGtPMXh1ZlR0Y2JseHVYRzVjYmx4dVhHNHZLaW9nVjBWQ1VFRkRTeUJHVDA5VVJWSWdLaXBjYmlBcUtpQXVMMnBoZG1GelkzSnBjSFF2YzNWaWMyTnlhV0psTG1welhHNGdLaW92SWl3aUozVnpaU0J6ZEhKcFkzUW5PMXh1WEc1cGJYQnZjblFnZFhWcFpDQm1jbTl0SUNkdWIyUmxMWFYxYVdRbk8xeHVYRzVqYjI1emRDQlRWVUpUUTFKSlVGUkpUMDVmVUZKUFZFOVVXVkJGSUQwZ2UxeHVJQ0J3Y205d1pYSjBhV1Z6T2lCYlhTeGNiaUFnWTJGc2JHSmhZMnM2SUdaMWJtTjBhVzl1SUNncElIdDlMRnh1SUNCbmRXbGtPaUJ1ZFd4c1hHNTlPMXh1WEc1bGVIQnZjblFnWkdWbVlYVnNkQ0FvZTNCeWIzQmxjblJwWlhNc0lHTmhiR3hpWVdOcmZTa2dQVDRnZTF4dUlDQnNaWFFnYzNWaWMyTnlhWEIwYVc5dUlEMGdUMkpxWldOMExtTnlaV0YwWlNoVFZVSlRRMUpKVUZSSlQwNWZVRkpQVkU5VVdWQkZLVHRjYmx4dUlDQnpkV0p6WTNKcGNIUnBiMjR1Y0hKdmNHVnlkR2xsY3lBOUlIQnliM0JsY25ScFpYTTdYRzRnSUhOMVluTmpjbWx3ZEdsdmJpNWpZV3hzWW1GamF5QTlJR05oYkd4aVlXTnJPMXh1SUNCemRXSnpZM0pwY0hScGIyNHVkWFZwWkNBOUlIVjFhV1F1ZGpRb0tUdGNibHh1SUNCeVpYUjFjbTRnYzNWaWMyTnlhWEIwYVc5dU8xeHVmVHRjYmx4dVpYaHdiM0owSUhzZ1UxVkNVME5TU1ZCVVNVOU9YMUJTVDFSUFZGbFFSU0I5TzF4dVhHNWNibHh1THlvcUlGZEZRbEJCUTBzZ1JrOVBWRVZTSUNvcVhHNGdLaW9nTGk5cVlYWmhjMk55YVhCMEwxTjFZbk5qY21sd2RHbHZiaTVxYzF4dUlDb3FMeUlzSWk4dklDQWdJQ0IxZFdsa0xtcHpYRzR2TDF4dUx5OGdJQ0FnSUVOdmNIbHlhV2RvZENBb1l5a2dNakF4TUMweU1ERXlJRkp2WW1WeWRDQkxhV1ZtWm1WeVhHNHZMeUFnSUNBZ1RVbFVJRXhwWTJWdWMyVWdMU0JvZEhSd09pOHZiM0JsYm5OdmRYSmpaUzV2Y21jdmJHbGpaVzV6WlhNdmJXbDBMV3hwWTJWdWMyVXVjR2h3WEc1Y2JpaG1kVzVqZEdsdmJpZ3BJSHRjYmlBZ2RtRnlJRjluYkc5aVlXd2dQU0IwYUdsek8xeHVYRzRnSUM4dklGVnVhWEYxWlNCSlJDQmpjbVZoZEdsdmJpQnlaWEYxYVhKbGN5QmhJR2hwWjJnZ2NYVmhiR2wwZVNCeVlXNWtiMjBnSXlCblpXNWxjbUYwYjNJdUlDQlhaU0JtWldGMGRYSmxYRzRnSUM4dklHUmxkR1ZqZENCMGJ5QmtaWFJsY20xcGJtVWdkR2hsSUdKbGMzUWdVazVISUhOdmRYSmpaU3dnYm05eWJXRnNhWHBwYm1jZ2RHOGdZU0JtZFc1amRHbHZiaUIwYUdGMFhHNGdJQzh2SUhKbGRIVnlibk1nTVRJNExXSnBkSE1nYjJZZ2NtRnVaRzl0Ym1WemN5d2djMmx1WTJVZ2RHaGhkQ2R6SUhkb1lYUW5jeUIxYzNWaGJHeDVJSEpsY1hWcGNtVmtYRzRnSUhaaGNpQmZjbTVuTzF4dVhHNGdJQzh2SUU1dlpHVXVhbk1nWTNKNWNIUnZMV0poYzJWa0lGSk9SeUF0SUdoMGRIQTZMeTl1YjJSbGFuTXViM0puTDJSdlkzTXZkakF1Tmk0eUwyRndhUzlqY25sd2RHOHVhSFJ0YkZ4dUlDQXZMMXh1SUNBdkx5Qk5iMlJsY21GMFpXeDVJR1poYzNRc0lHaHBaMmdnY1hWaGJHbDBlVnh1SUNCcFppQW9kSGx3Wlc5bUtGOW5iRzlpWVd3dWNtVnhkV2x5WlNrZ1BUMGdKMloxYm1OMGFXOXVKeWtnZTF4dUlDQWdJSFJ5ZVNCN1hHNGdJQ0FnSUNCMllYSWdYM0ppSUQwZ1gyZHNiMkpoYkM1eVpYRjFhWEpsS0NkamNubHdkRzhuS1M1eVlXNWtiMjFDZVhSbGN6dGNiaUFnSUNBZ0lGOXlibWNnUFNCZmNtSWdKaVlnWm5WdVkzUnBiMjRvS1NCN2NtVjBkWEp1SUY5eVlpZ3hOaWs3ZlR0Y2JpQWdJQ0I5SUdOaGRHTm9LR1VwSUh0OVhHNGdJSDFjYmx4dUlDQnBaaUFvSVY5eWJtY2dKaVlnWDJkc2IySmhiQzVqY25sd2RHOGdKaVlnWTNKNWNIUnZMbWRsZEZKaGJtUnZiVlpoYkhWbGN5a2dlMXh1SUNBZ0lDOHZJRmRJUVZSWFJ5Qmpjbmx3ZEc4dFltRnpaV1FnVWs1SElDMGdhSFIwY0RvdkwzZHBhMmt1ZDJoaGRIZG5MbTl5Wnk5M2FXdHBMME55ZVhCMGIxeHVJQ0FnSUM4dlhHNGdJQ0FnTHk4Z1RXOWtaWEpoZEdWc2VTQm1ZWE4wTENCb2FXZG9JSEYxWVd4cGRIbGNiaUFnSUNCMllYSWdYM0p1WkhNNElEMGdibVYzSUZWcGJuUTRRWEp5WVhrb01UWXBPMXh1SUNBZ0lGOXlibWNnUFNCbWRXNWpkR2x2YmlCM2FHRjBkMmRTVGtjb0tTQjdYRzRnSUNBZ0lDQmpjbmx3ZEc4dVoyVjBVbUZ1Wkc5dFZtRnNkV1Z6S0Y5eWJtUnpPQ2s3WEc0Z0lDQWdJQ0J5WlhSMWNtNGdYM0p1WkhNNE8xeHVJQ0FnSUgwN1hHNGdJSDFjYmx4dUlDQnBaaUFvSVY5eWJtY3BJSHRjYmlBZ0lDQXZMeUJOWVhSb0xuSmhibVJ2YlNncExXSmhjMlZrSUNoU1RrY3BYRzRnSUNBZ0x5OWNiaUFnSUNBdkx5QkpaaUJoYkd3Z1pXeHpaU0JtWVdsc2N5d2dkWE5sSUUxaGRHZ3VjbUZ1Wkc5dEtDa3VJQ0JKZENkeklHWmhjM1FzSUdKMWRDQnBjeUJ2WmlCMWJuTndaV05wWm1sbFpGeHVJQ0FnSUM4dklIRjFZV3hwZEhrdVhHNGdJQ0FnZG1GeUlDQmZjbTVrY3lBOUlHNWxkeUJCY25KaGVTZ3hOaWs3WEc0Z0lDQWdYM0p1WnlBOUlHWjFibU4wYVc5dUtDa2dlMXh1SUNBZ0lDQWdabTl5SUNoMllYSWdhU0E5SURBc0lISTdJR2tnUENBeE5qc2dhU3NyS1NCN1hHNGdJQ0FnSUNBZ0lHbG1JQ2dvYVNBbUlEQjRNRE1wSUQwOVBTQXdLU0J5SUQwZ1RXRjBhQzV5WVc1a2IyMG9LU0FxSURCNE1UQXdNREF3TURBd08xeHVJQ0FnSUNBZ0lDQmZjbTVrYzF0cFhTQTlJSElnUGo0K0lDZ29hU0FtSURCNE1ETXBJRHc4SURNcElDWWdNSGhtWmp0Y2JpQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ2NtVjBkWEp1SUY5eWJtUnpPMXh1SUNBZ0lIMDdYRzRnSUgxY2JseHVJQ0F2THlCQ2RXWm1aWElnWTJ4aGMzTWdkRzhnZFhObFhHNGdJSFpoY2lCQ2RXWm1aWEpEYkdGemN5QTlJSFI1Y0dWdlppaGZaMnh2WW1Gc0xrSjFabVpsY2lrZ1BUMGdKMloxYm1OMGFXOXVKeUEvSUY5bmJHOWlZV3d1UW5WbVptVnlJRG9nUVhKeVlYazdYRzVjYmlBZ0x5OGdUV0Z3Y3lCbWIzSWdiblZ0WW1WeUlEd3RQaUJvWlhnZ2MzUnlhVzVuSUdOdmJuWmxjbk5wYjI1Y2JpQWdkbUZ5SUY5aWVYUmxWRzlJWlhnZ1BTQmJYVHRjYmlBZ2RtRnlJRjlvWlhoVWIwSjVkR1VnUFNCN2ZUdGNiaUFnWm05eUlDaDJZWElnYVNBOUlEQTdJR2tnUENBeU5UWTdJR2tyS3lrZ2UxeHVJQ0FnSUY5aWVYUmxWRzlJWlhoYmFWMGdQU0FvYVNBcklEQjRNVEF3S1M1MGIxTjBjbWx1WnlneE5pa3VjM1ZpYzNSeUtERXBPMXh1SUNBZ0lGOW9aWGhVYjBKNWRHVmJYMko1ZEdWVWIwaGxlRnRwWFYwZ1BTQnBPMXh1SUNCOVhHNWNiaUFnTHk4Z0tpcGdjR0Z5YzJVb0tXQWdMU0JRWVhKelpTQmhJRlZWU1VRZ2FXNTBieUJwZENkeklHTnZiWEJ2Ym1WdWRDQmllWFJsY3lvcVhHNGdJR1oxYm1OMGFXOXVJSEJoY25ObEtITXNJR0oxWml3Z2IyWm1jMlYwS1NCN1hHNGdJQ0FnZG1GeUlHa2dQU0FvWW5WbUlDWW1JRzltWm5ObGRDa2dmSHdnTUN3Z2FXa2dQU0F3TzF4dVhHNGdJQ0FnWW5WbUlEMGdZblZtSUh4OElGdGRPMXh1SUNBZ0lITXVkRzlNYjNkbGNrTmhjMlVvS1M1eVpYQnNZV05sS0M5Yk1DMDVZUzFtWFhzeWZTOW5MQ0JtZFc1amRHbHZiaWh2WTNRcElIdGNiaUFnSUNBZ0lHbG1JQ2hwYVNBOElERTJLU0I3SUM4dklFUnZiaWQwSUc5MlpYSm1iRzkzSVZ4dUlDQWdJQ0FnSUNCaWRXWmJhU0FySUdscEt5dGRJRDBnWDJobGVGUnZRbmwwWlZ0dlkzUmRPMXh1SUNBZ0lDQWdmVnh1SUNBZ0lIMHBPMXh1WEc0Z0lDQWdMeThnV21WeWJ5QnZkWFFnY21WdFlXbHVhVzVuSUdKNWRHVnpJR2xtSUhOMGNtbHVaeUIzWVhNZ2MyaHZjblJjYmlBZ0lDQjNhR2xzWlNBb2FXa2dQQ0F4TmlrZ2UxeHVJQ0FnSUNBZ1luVm1XMmtnS3lCcGFTc3JYU0E5SURBN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnY21WMGRYSnVJR0oxWmp0Y2JpQWdmVnh1WEc0Z0lDOHZJQ29xWUhWdWNHRnljMlVvS1dBZ0xTQkRiMjUyWlhKMElGVlZTVVFnWW5sMFpTQmhjbkpoZVNBb1lXeGhJSEJoY25ObEtDa3BJR2x1ZEc4Z1lTQnpkSEpwYm1jcUtseHVJQ0JtZFc1amRHbHZiaUIxYm5CaGNuTmxLR0oxWml3Z2IyWm1jMlYwS1NCN1hHNGdJQ0FnZG1GeUlHa2dQU0J2Wm1aelpYUWdmSHdnTUN3Z1luUm9JRDBnWDJKNWRHVlViMGhsZUR0Y2JpQWdJQ0J5WlhSMWNtNGdJR0owYUZ0aWRXWmJhU3NyWFYwZ0t5QmlkR2hiWW5WbVcya3JLMTFkSUN0Y2JpQWdJQ0FnSUNBZ0lDQWdJR0owYUZ0aWRXWmJhU3NyWFYwZ0t5QmlkR2hiWW5WbVcya3JLMTFkSUNzZ0p5MG5JQ3RjYmlBZ0lDQWdJQ0FnSUNBZ0lHSjBhRnRpZFdaYmFTc3JYVjBnS3lCaWRHaGJZblZtVzJrcksxMWRJQ3NnSnkwbklDdGNiaUFnSUNBZ0lDQWdJQ0FnSUdKMGFGdGlkV1piYVNzclhWMGdLeUJpZEdoYlluVm1XMmtySzExZElDc2dKeTBuSUN0Y2JpQWdJQ0FnSUNBZ0lDQWdJR0owYUZ0aWRXWmJhU3NyWFYwZ0t5QmlkR2hiWW5WbVcya3JLMTFkSUNzZ0p5MG5JQ3RjYmlBZ0lDQWdJQ0FnSUNBZ0lHSjBhRnRpZFdaYmFTc3JYVjBnS3lCaWRHaGJZblZtVzJrcksxMWRJQ3RjYmlBZ0lDQWdJQ0FnSUNBZ0lHSjBhRnRpZFdaYmFTc3JYVjBnS3lCaWRHaGJZblZtVzJrcksxMWRJQ3RjYmlBZ0lDQWdJQ0FnSUNBZ0lHSjBhRnRpZFdaYmFTc3JYVjBnS3lCaWRHaGJZblZtVzJrcksxMWRPMXh1SUNCOVhHNWNiaUFnTHk4Z0tpcGdkakVvS1dBZ0xTQkhaVzVsY21GMFpTQjBhVzFsTFdKaGMyVmtJRlZWU1VRcUtseHVJQ0F2TDF4dUlDQXZMeUJKYm5Od2FYSmxaQ0JpZVNCb2RIUndjem92TDJkcGRHaDFZaTVqYjIwdlRHbHZjMHN2VlZWSlJDNXFjMXh1SUNBdkx5QmhibVFnYUhSMGNEb3ZMMlJ2WTNNdWNIbDBhRzl1TG05eVp5OXNhV0p5WVhKNUwzVjFhV1F1YUhSdGJGeHVYRzRnSUM4dklISmhibVJ2YlNBakozTWdkMlVnYm1WbFpDQjBieUJwYm1sMElHNXZaR1VnWVc1a0lHTnNiMk5yYzJWeFhHNGdJSFpoY2lCZmMyVmxaRUo1ZEdWeklEMGdYM0p1WnlncE8xeHVYRzRnSUM4dklGQmxjaUEwTGpVc0lHTnlaV0YwWlNCaGJtUWdORGd0WW1sMElHNXZaR1VnYVdRc0lDZzBOeUJ5WVc1a2IyMGdZbWwwY3lBcklHMTFiSFJwWTJGemRDQmlhWFFnUFNBeEtWeHVJQ0IyWVhJZ1gyNXZaR1ZKWkNBOUlGdGNiaUFnSUNCZmMyVmxaRUo1ZEdWeld6QmRJSHdnTUhnd01TeGNiaUFnSUNCZmMyVmxaRUo1ZEdWeld6RmRMQ0JmYzJWbFpFSjVkR1Z6V3pKZExDQmZjMlZsWkVKNWRHVnpXek5kTENCZmMyVmxaRUo1ZEdWeld6UmRMQ0JmYzJWbFpFSjVkR1Z6V3pWZFhHNGdJRjA3WEc1Y2JpQWdMeThnVUdWeUlEUXVNaTR5TENCeVlXNWtiMjFwZW1VZ0tERTBJR0pwZENrZ1kyeHZZMnR6WlhGY2JpQWdkbUZ5SUY5amJHOWphM05sY1NBOUlDaGZjMlZsWkVKNWRHVnpXelpkSUR3OElEZ2dmQ0JmYzJWbFpFSjVkR1Z6V3pkZEtTQW1JREI0TTJabVpqdGNibHh1SUNBdkx5QlFjbVYyYVc5MWN5QjFkV2xrSUdOeVpXRjBhVzl1SUhScGJXVmNiaUFnZG1GeUlGOXNZWE4wVFZObFkzTWdQU0F3TENCZmJHRnpkRTVUWldOeklEMGdNRHRjYmx4dUlDQXZMeUJUWldVZ2FIUjBjSE02THk5bmFYUm9kV0l1WTI5dEwySnliMjltWVM5dWIyUmxMWFYxYVdRZ1ptOXlJRUZRU1NCa1pYUmhhV3h6WEc0Z0lHWjFibU4wYVc5dUlIWXhLRzl3ZEdsdmJuTXNJR0oxWml3Z2IyWm1jMlYwS1NCN1hHNGdJQ0FnZG1GeUlHa2dQU0JpZFdZZ0ppWWdiMlptYzJWMElIeDhJREE3WEc0Z0lDQWdkbUZ5SUdJZ1BTQmlkV1lnZkh3Z1cxMDdYRzVjYmlBZ0lDQnZjSFJwYjI1eklEMGdiM0IwYVc5dWN5QjhmQ0I3ZlR0Y2JseHVJQ0FnSUhaaGNpQmpiRzlqYTNObGNTQTlJRzl3ZEdsdmJuTXVZMnh2WTJ0elpYRWdJVDBnYm5Wc2JDQS9JRzl3ZEdsdmJuTXVZMnh2WTJ0elpYRWdPaUJmWTJ4dlkydHpaWEU3WEc1Y2JpQWdJQ0F2THlCVlZVbEVJSFJwYldWemRHRnRjSE1nWVhKbElERXdNQ0J1WVc1dkxYTmxZMjl1WkNCMWJtbDBjeUJ6YVc1alpTQjBhR1VnUjNKbFoyOXlhV0Z1SUdWd2IyTm9MRnh1SUNBZ0lDOHZJQ2d4TlRneUxURXdMVEUxSURBd09qQXdLUzRnSUVwVFRuVnRZbVZ5Y3lCaGNtVnVKM1FnY0hKbFkybHpaU0JsYm05MVoyZ2dabTl5SUhSb2FYTXNJSE52WEc0Z0lDQWdMeThnZEdsdFpTQnBjeUJvWVc1a2JHVmtJR2x1ZEdWeWJtRnNiSGtnWVhNZ0oyMXpaV056SnlBb2FXNTBaV2RsY2lCdGFXeHNhWE5sWTI5dVpITXBJR0Z1WkNBbmJuTmxZM01uWEc0Z0lDQWdMeThnS0RFd01DMXVZVzV2YzJWamIyNWtjeUJ2Wm1aelpYUWdabkp2YlNCdGMyVmpjeWtnYzJsdVkyVWdkVzVwZUNCbGNHOWphQ3dnTVRrM01DMHdNUzB3TVNBd01Eb3dNQzVjYmlBZ0lDQjJZWElnYlhObFkzTWdQU0J2Y0hScGIyNXpMbTF6WldOeklDRTlJRzUxYkd3Z1B5QnZjSFJwYjI1ekxtMXpaV056SURvZ2JtVjNJRVJoZEdVb0tTNW5aWFJVYVcxbEtDazdYRzVjYmlBZ0lDQXZMeUJRWlhJZ05DNHlMakV1TWl3Z2RYTmxJR052ZFc1MElHOW1JSFYxYVdRbmN5Qm5aVzVsY21GMFpXUWdaSFZ5YVc1bklIUm9aU0JqZFhKeVpXNTBJR05zYjJOclhHNGdJQ0FnTHk4Z1kzbGpiR1VnZEc4Z2MybHRkV3hoZEdVZ2FHbG5hR1Z5SUhKbGMyOXNkWFJwYjI0Z1kyeHZZMnRjYmlBZ0lDQjJZWElnYm5ObFkzTWdQU0J2Y0hScGIyNXpMbTV6WldOeklDRTlJRzUxYkd3Z1B5QnZjSFJwYjI1ekxtNXpaV056SURvZ1gyeGhjM1JPVTJWamN5QXJJREU3WEc1Y2JpQWdJQ0F2THlCVWFXMWxJSE5wYm1ObElHeGhjM1FnZFhWcFpDQmpjbVZoZEdsdmJpQW9hVzRnYlhObFkzTXBYRzRnSUNBZ2RtRnlJR1IwSUQwZ0tHMXpaV056SUMwZ1gyeGhjM1JOVTJWamN5a2dLeUFvYm5ObFkzTWdMU0JmYkdGemRFNVRaV056S1M4eE1EQXdNRHRjYmx4dUlDQWdJQzh2SUZCbGNpQTBMakl1TVM0eUxDQkNkVzF3SUdOc2IyTnJjMlZ4SUc5dUlHTnNiMk5ySUhKbFozSmxjM05wYjI1Y2JpQWdJQ0JwWmlBb1pIUWdQQ0F3SUNZbUlHOXdkR2x2Ym5NdVkyeHZZMnR6WlhFZ1BUMGdiblZzYkNrZ2UxeHVJQ0FnSUNBZ1kyeHZZMnR6WlhFZ1BTQmpiRzlqYTNObGNTQXJJREVnSmlBd2VETm1abVk3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdMeThnVW1WelpYUWdibk5sWTNNZ2FXWWdZMnh2WTJzZ2NtVm5jbVZ6YzJWeklDaHVaWGNnWTJ4dlkydHpaWEVwSUc5eUlIZGxKM1psSUcxdmRtVmtJRzl1ZEc4Z1lTQnVaWGRjYmlBZ0lDQXZMeUIwYVcxbElHbHVkR1Z5ZG1Gc1hHNGdJQ0FnYVdZZ0tDaGtkQ0E4SURBZ2ZId2diWE5sWTNNZ1BpQmZiR0Z6ZEUxVFpXTnpLU0FtSmlCdmNIUnBiMjV6TG01elpXTnpJRDA5SUc1MWJHd3BJSHRjYmlBZ0lDQWdJRzV6WldOeklEMGdNRHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQXZMeUJRWlhJZ05DNHlMakV1TWlCVWFISnZkeUJsY25KdmNpQnBaaUIwYjI4Z2JXRnVlU0IxZFdsa2N5QmhjbVVnY21WeGRXVnpkR1ZrWEc0Z0lDQWdhV1lnS0c1elpXTnpJRDQ5SURFd01EQXdLU0I3WEc0Z0lDQWdJQ0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9KM1YxYVdRdWRqRW9LVG9nUTJGdVhGd25kQ0JqY21WaGRHVWdiVzl5WlNCMGFHRnVJREV3VFNCMWRXbGtjeTl6WldNbktUdGNiaUFnSUNCOVhHNWNiaUFnSUNCZmJHRnpkRTFUWldOeklEMGdiWE5sWTNNN1hHNGdJQ0FnWDJ4aGMzUk9VMlZqY3lBOUlHNXpaV056TzF4dUlDQWdJRjlqYkc5amEzTmxjU0E5SUdOc2IyTnJjMlZ4TzF4dVhHNGdJQ0FnTHk4Z1VHVnlJRFF1TVM0MElDMGdRMjl1ZG1WeWRDQm1jbTl0SUhWdWFYZ2daWEJ2WTJnZ2RHOGdSM0psWjI5eWFXRnVJR1Z3YjJOb1hHNGdJQ0FnYlhObFkzTWdLejBnTVRJeU1Ua3lPVEk0TURBd01EQTdYRzVjYmlBZ0lDQXZMeUJnZEdsdFpWOXNiM2RnWEc0Z0lDQWdkbUZ5SUhSc0lEMGdLQ2h0YzJWamN5QW1JREI0Wm1abVptWm1aaWtnS2lBeE1EQXdNQ0FySUc1elpXTnpLU0FsSURCNE1UQXdNREF3TURBd08xeHVJQ0FnSUdKYmFTc3JYU0E5SUhSc0lENCtQaUF5TkNBbUlEQjRabVk3WEc0Z0lDQWdZbHRwS3l0ZElEMGdkR3dnUGo0K0lERTJJQ1lnTUhobVpqdGNiaUFnSUNCaVcya3JLMTBnUFNCMGJDQStQajRnT0NBbUlEQjRabVk3WEc0Z0lDQWdZbHRwS3l0ZElEMGdkR3dnSmlBd2VHWm1PMXh1WEc0Z0lDQWdMeThnWUhScGJXVmZiV2xrWUZ4dUlDQWdJSFpoY2lCMGJXZ2dQU0FvYlhObFkzTWdMeUF3ZURFd01EQXdNREF3TUNBcUlERXdNREF3S1NBbUlEQjRabVptWm1abVpqdGNiaUFnSUNCaVcya3JLMTBnUFNCMGJXZ2dQajQrSURnZ0ppQXdlR1ptTzF4dUlDQWdJR0piYVNzclhTQTlJSFJ0YUNBbUlEQjRabVk3WEc1Y2JpQWdJQ0F2THlCZ2RHbHRaVjlvYVdkb1gyRnVaRjkyWlhKemFXOXVZRnh1SUNBZ0lHSmJhU3NyWFNBOUlIUnRhQ0ErUGo0Z01qUWdKaUF3ZUdZZ2ZDQXdlREV3T3lBdkx5QnBibU5zZFdSbElIWmxjbk5wYjI1Y2JpQWdJQ0JpVzJrcksxMGdQU0IwYldnZ1BqNCtJREUySUNZZ01IaG1aanRjYmx4dUlDQWdJQzh2SUdCamJHOWphMTl6WlhGZmFHbGZZVzVrWDNKbGMyVnlkbVZrWUNBb1VHVnlJRFF1TWk0eUlDMGdhVzVqYkhWa1pTQjJZWEpwWVc1MEtWeHVJQ0FnSUdKYmFTc3JYU0E5SUdOc2IyTnJjMlZ4SUQ0K1BpQTRJSHdnTUhnNE1EdGNibHh1SUNBZ0lDOHZJR0JqYkc5amExOXpaWEZmYkc5M1lGeHVJQ0FnSUdKYmFTc3JYU0E5SUdOc2IyTnJjMlZ4SUNZZ01IaG1aanRjYmx4dUlDQWdJQzh2SUdCdWIyUmxZRnh1SUNBZ0lIWmhjaUJ1YjJSbElEMGdiM0IwYVc5dWN5NXViMlJsSUh4OElGOXViMlJsU1dRN1hHNGdJQ0FnWm05eUlDaDJZWElnYmlBOUlEQTdJRzRnUENBMk95QnVLeXNwSUh0Y2JpQWdJQ0FnSUdKYmFTQXJJRzVkSUQwZ2JtOWtaVnR1WFR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0J5WlhSMWNtNGdZblZtSUQ4Z1luVm1JRG9nZFc1d1lYSnpaU2hpS1R0Y2JpQWdmVnh1WEc0Z0lDOHZJQ29xWUhZMEtDbGdJQzBnUjJWdVpYSmhkR1VnY21GdVpHOXRJRlZWU1VRcUtseHVYRzRnSUM4dklGTmxaU0JvZEhSd2N6b3ZMMmRwZEdoMVlpNWpiMjB2WW5KdmIyWmhMMjV2WkdVdGRYVnBaQ0JtYjNJZ1FWQkpJR1JsZEdGcGJITmNiaUFnWm5WdVkzUnBiMjRnZGpRb2IzQjBhVzl1Y3l3Z1luVm1MQ0J2Wm1aelpYUXBJSHRjYmlBZ0lDQXZMeUJFWlhCeVpXTmhkR1ZrSUMwZ0oyWnZjbTFoZENjZ1lYSm5kVzFsYm5Rc0lHRnpJSE4xY0hCdmNuUmxaQ0JwYmlCMk1TNHlYRzRnSUNBZ2RtRnlJR2tnUFNCaWRXWWdKaVlnYjJabWMyVjBJSHg4SURBN1hHNWNiaUFnSUNCcFppQW9kSGx3Wlc5bUtHOXdkR2x2Ym5NcElEMDlJQ2R6ZEhKcGJtY25LU0I3WEc0Z0lDQWdJQ0JpZFdZZ1BTQnZjSFJwYjI1eklEMDlJQ2RpYVc1aGNua25JRDhnYm1WM0lFSjFabVpsY2tOc1lYTnpLREUyS1NBNklHNTFiR3c3WEc0Z0lDQWdJQ0J2Y0hScGIyNXpJRDBnYm5Wc2JEdGNiaUFnSUNCOVhHNGdJQ0FnYjNCMGFXOXVjeUE5SUc5d2RHbHZibk1nZkh3Z2UzMDdYRzVjYmlBZ0lDQjJZWElnY201a2N5QTlJRzl3ZEdsdmJuTXVjbUZ1Wkc5dElIeDhJQ2h2Y0hScGIyNXpMbkp1WnlCOGZDQmZjbTVuS1NncE8xeHVYRzRnSUNBZ0x5OGdVR1Z5SURRdU5Dd2djMlYwSUdKcGRITWdabTl5SUhabGNuTnBiMjRnWVc1a0lHQmpiRzlqYTE5elpYRmZhR2xmWVc1a1gzSmxjMlZ5ZG1Wa1lGeHVJQ0FnSUhKdVpITmJObDBnUFNBb2NtNWtjMXMyWFNBbUlEQjRNR1lwSUh3Z01IZzBNRHRjYmlBZ0lDQnlibVJ6V3poZElEMGdLSEp1WkhOYk9GMGdKaUF3ZURObUtTQjhJREI0T0RBN1hHNWNiaUFnSUNBdkx5QkRiM0I1SUdKNWRHVnpJSFJ2SUdKMVptWmxjaXdnYVdZZ2NISnZkbWxrWldSY2JpQWdJQ0JwWmlBb1luVm1LU0I3WEc0Z0lDQWdJQ0JtYjNJZ0tIWmhjaUJwYVNBOUlEQTdJR2xwSUR3Z01UWTdJR2xwS3lzcElIdGNiaUFnSUNBZ0lDQWdZblZtVzJrZ0t5QnBhVjBnUFNCeWJtUnpXMmxwWFR0Y2JpQWdJQ0FnSUgxY2JpQWdJQ0I5WEc1Y2JpQWdJQ0J5WlhSMWNtNGdZblZtSUh4OElIVnVjR0Z5YzJVb2NtNWtjeWs3WEc0Z0lIMWNibHh1SUNBdkx5QkZlSEJ2Y25RZ2NIVmliR2xqSUVGUVNWeHVJQ0IyWVhJZ2RYVnBaQ0E5SUhZME8xeHVJQ0IxZFdsa0xuWXhJRDBnZGpFN1hHNGdJSFYxYVdRdWRqUWdQU0IyTkR0Y2JpQWdkWFZwWkM1d1lYSnpaU0E5SUhCaGNuTmxPMXh1SUNCMWRXbGtMblZ1Y0dGeWMyVWdQU0IxYm5CaGNuTmxPMXh1SUNCMWRXbGtMa0oxWm1abGNrTnNZWE56SUQwZ1FuVm1abVZ5UTJ4aGMzTTdYRzVjYmlBZ2FXWWdLSFI1Y0dWdlppaHRiMlIxYkdVcElDRTlJQ2QxYm1SbFptbHVaV1FuSUNZbUlHMXZaSFZzWlM1bGVIQnZjblJ6S1NCN1hHNGdJQ0FnTHk4Z1VIVmliR2x6YUNCaGN5QnViMlJsTG1weklHMXZaSFZzWlZ4dUlDQWdJRzF2WkhWc1pTNWxlSEJ2Y25SeklEMGdkWFZwWkR0Y2JpQWdmU0JsYkhObElDQnBaaUFvZEhsd1pXOW1JR1JsWm1sdVpTQTlQVDBnSjJaMWJtTjBhVzl1SnlBbUppQmtaV1pwYm1VdVlXMWtLU0I3WEc0Z0lDQWdMeThnVUhWaWJHbHphQ0JoY3lCQlRVUWdiVzlrZFd4bFhHNGdJQ0FnWkdWbWFXNWxLR1oxYm1OMGFXOXVLQ2tnZTNKbGRIVnliaUIxZFdsa08zMHBPMXh1SUZ4dVhHNGdJSDBnWld4elpTQjdYRzRnSUNBZ0x5OGdVSFZpYkdsemFDQmhjeUJuYkc5aVlXd2dLR2x1SUdKeWIzZHpaWEp6S1Z4dUlDQWdJSFpoY2lCZmNISmxkbWx2ZFhOU2IyOTBJRDBnWDJkc2IySmhiQzUxZFdsa08xeHVYRzRnSUNBZ0x5OGdLaXBnYm05RGIyNW1iR2xqZENncFlDQXRJQ2hpY205M2MyVnlJRzl1YkhrcElIUnZJSEpsYzJWMElHZHNiMkpoYkNBbmRYVnBaQ2NnZG1GeUtpcGNiaUFnSUNCMWRXbGtMbTV2UTI5dVpteHBZM1FnUFNCbWRXNWpkR2x2YmlncElIdGNiaUFnSUNBZ0lGOW5iRzlpWVd3dWRYVnBaQ0E5SUY5d2NtVjJhVzkxYzFKdmIzUTdYRzRnSUNBZ0lDQnlaWFIxY200Z2RYVnBaRHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdYMmRzYjJKaGJDNTFkV2xrSUQwZ2RYVnBaRHRjYmlBZ2ZWeHVmU2t1WTJGc2JDaDBhR2x6S1R0Y2JseHVYRzVjYmk4cUtpb3FLaW9xS2lvcUtpb3FLaW9xS2x4dUlDb3FJRmRGUWxCQlEwc2dSazlQVkVWU1hHNGdLaW9nTGk5K0wyNXZaR1V0ZFhWcFpDOTFkV2xrTG1welhHNGdLaW9nYlc5a2RXeGxJR2xrSUQwZ05qSmNiaUFxS2lCdGIyUjFiR1VnWTJoMWJtdHpJRDBnTUZ4dUlDb3FMeUlzSWlkMWMyVWdjM1J5YVdOMEp6dGNibHh1WTI5dWMzUWdVMVZDVTBOU1NWQlVTVTlPVTE5Q1dWOVFVazlRUlZKVVdWOVFVazlVVDFSWlVFVWdQU0I3WEc0Z0lHRmtaQ2g3Y0hKdmNHVnlkSGtzSUhOMVluTmpjbWx3ZEdsdmJuMHBJSHRjYmlBZ0lDQnNaWFFnWTNWeWNtVnVkRk4xWW5OamNtbHdkR2x2Ym5NZ1BTQjBhR2x6TG5OMVluTmpjbWx3ZEdsdmJuTmJjSEp2Y0dWeWRIbGRPMXh1SUNBZ0lGeHVJQ0FnSUdsbUlDZ2hZM1Z5Y21WdWRGTjFZbk5qY21sd2RHbHZibk1nZkh3Z1QySnFaV04wTG10bGVYTW9ZM1Z5Y21WdWRGTjFZbk5qY21sd2RHbHZibk1wTG14bGJtZDBhQ0E5UFQwZ01Da2dlMXh1SUNBZ0lDQWdkR2hwY3k1emRXSnpZM0pwY0hScGIyNXpXM0J5YjNCbGNuUjVYU0E5SUh0OU8xeHVJQ0FnSUgxY2JseHVJQ0FnSUM4cUlIVnpaV2x1WnlCdlltcGxZM1FnYkdsclpTQmhJSE5sZENCb1pYSmxJQ292WEc0Z0lDQWdkR2hwY3k1emRXSnpZM0pwY0hScGIyNXpXM0J5YjNCbGNuUjVYVnR6ZFdKelkzSnBjSFJwYjI0dWRYVnBaRjBnUFNCMGNuVmxPMXh1SUNCOUxGeHVYRzRnSUhKbGJXOTJaU2g3Y0hKdmNHVnlkSGtzSUhOMVluTmpjbWx3ZEdsdmJuMHBJSHRjYmlBZ0lDQnNaWFFnWTNWeWNtVnVkRk4xWW5OamNtbHdkR2x2Ym5NZ1BTQjBhR2x6TG5OMVluTmpjbWx3ZEdsdmJuTmJjSEp2Y0dWeWRIbGRPMXh1WEc0Z0lDQWdhV1lnS0NGamRYSnlaVzUwVTNWaWMyTnlhWEIwYVc5dWN5QjhmQ0JQWW1wbFkzUXVhMlY1Y3loamRYSnlaVzUwVTNWaWMyTnlhWEIwYVc5dWN5a3ViR1Z1WjNSb0lEMDlQU0F3S1NCN1hHNGdJQ0FnSUNCMGFHbHpMbk4xWW5OamNtbHdkR2x2Ym5OYmNISnZjR1Z5ZEhsZElEMGdlMzA3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdaR1ZzWlhSbElIUm9hWE11YzNWaWMyTnlhWEIwYVc5dWMxdHdjbTl3WlhKMGVWMWJjM1ZpYzJOeWFYQjBhVzl1TG5WMWFXUmRPMXh1SUNCOVhHNWNibjA3WEc1Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUNncElEMCtJSHRjYmlBZ2JHVjBJSE4xWW5OamNtbHdkR2x2Ym5OQ2VWQnliM0JsY25SNUlEMGdUMkpxWldOMExtTnlaV0YwWlNoVFZVSlRRMUpKVUZSSlQwNVRYMEpaWDFCU1QxQkZVbFJaWDFCU1QxUlBWRmxRUlNrN1hHNWNiaUFnYzNWaWMyTnlhWEIwYVc5dWMwSjVVSEp2Y0dWeWRIa3VjM1ZpYzJOeWFYQjBhVzl1Y3lBOUlIdDlPMXh1WEc0Z0lISmxkSFZ5YmlCemRXSnpZM0pwY0hScGIyNXpRbmxRY205d1pYSjBlVHRjYm4wN1hHNWNibVY0Y0c5eWRDQjdJRk5WUWxORFVrbFFWRWxQVGxOZlFsbGZVRkpQVUVWU1ZGbGZVRkpQVkU5VVdWQkZJSDA3WEc1Y2JseHVYRzR2S2lvZ1YwVkNVRUZEU3lCR1QwOVVSVklnS2lwY2JpQXFLaUF1TDJwaGRtRnpZM0pwY0hRdmMzVmljMk55YVhCMGFXOXVjMEo1VUhKdmNHVnlkSGt1YW5OY2JpQXFLaThpTENJbmRYTmxJSE4wY21samRDYzdYRzVjYmk4cUlITnBibWRzWlhSdmJpQnZZbXBsWTNRZ2RYTmxaQ0IwYnlCb2IyeGtJSE4xWW5OamNtbHdkR2x2YmlCdlltcGxZM1J6SUdKNUlIUm9aV2x5SUZWVlNVUWdLaTljYmx4dVpYaHdiM0owSUdSbFptRjFiSFFnZTMwN1hHNWNibHh1WEc0dktpb2dWMFZDVUVGRFN5QkdUMDlVUlZJZ0tpcGNiaUFxS2lBdUwycGhkbUZ6WTNKcGNIUXZjM1ZpYzJOeWFYQjBhVzl1YzBKNVZWVkpSQzVxYzF4dUlDb3FMeUlzSWlkMWMyVWdjM1J5YVdOMEp6dGNibHh1Wlhod2IzSjBJR1JsWm1GMWJIUWdLSHR6ZFdKelkzSnBjSFJwYjI1VlZVbEVMQ0J6ZFdKelkzSnBjSFJwYjI1elFubFZWVWxFTENCemRXSnpZM0pwY0hScGIyNXpRbmxRY205d1pYSjBlWDBwSUQwK0lIdGNiaUFnYkdWMElITjFZbk5qY21sd2RHbHZiaUE5SUhOMVluTmpjbWx3ZEdsdmJuTkNlVlZWU1VSYmMzVmljMk55YVhCMGFXOXVWVlZKUkYwN1hHNWNiaUFnYVdZZ0tITjFZbk5qY21sd2RHbHZiaWtnZTF4dUlDQWdJQzhxSUhKbGJXOTJaU0IwYUdVZ2MzVmljMk55YVhCMGFXOXVJR1p5YjIwZ2RHaGxJSE4xWW5OamNtbHdkR2x2Ym5OQ2VWVlZTVVFnYjJKcVpXTjBJQ292WEc0Z0lDQWdaR1ZzWlhSbElITjFZbk5qY21sd2RHbHZibk5DZVZWVlNVUmJjM1ZpYzJOeWFYQjBhVzl1VlZWSlJGMDdYRzVjYmlBZ0lDQXZLaUJ5WlcxdmRtVWdjbVZtWlhKbGJtTmxjeUIwYnlCMGFHVWdjM1ZpYzJOeWFYQjBhVzl1SUdaeWIyMGdaV0ZqYUNCdlppQjBhR1VnYzNWaWMyTnlhV0psWkNCd2NtOXdaWEowYVdWeklDb3ZYRzRnSUNBZ2MzVmljMk55YVhCMGFXOXVMbkJ5YjNCbGNuUnBaWE11Wm05eVJXRmphQ2h3Y205d1pYSjBlU0E5UGlCN1hHNGdJQ0FnSUNCemRXSnpZM0pwY0hScGIyNXpRbmxRY205d1pYSjBlUzV5WlcxdmRtVW9lM0J5YjNCbGNuUjVMQ0J6ZFdKelkzSnBjSFJwYjI1OUtUdGNiaUFnSUNCOUtUdGNiaUFnZlZ4dWZUdGNibHh1WEc1Y2JpOHFLaUJYUlVKUVFVTkxJRVpQVDFSRlVpQXFLbHh1SUNvcUlDNHZhbUYyWVhOamNtbHdkQzkxYm5OMVluTmpjbWxpWlM1cWMxeHVJQ29xTHlKZExDSnpiM1Z5WTJWU2IyOTBJam9pSW4wPVxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2hhc2gtc3Vic2NyaWJlci9idW5kbGUuanNcbiAqKiBtb2R1bGUgaWQgPSAxMjhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=