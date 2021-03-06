/*!
* x-router
* https://github.com/attrs/x-router
*
* Copyright attrs and others
* Released under the MIT license
* https://github.com/attrs/x-router/blob/master/LICENSE
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("xrouter", [], factory);
	else if(typeof exports === 'object')
		exports["xrouter"] = factory();
	else
		root["xrouter"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
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

	var xrouter = module.exports = __webpack_require__(1);
	xrouter.initiator.add(__webpack_require__(20));
	xrouter.initiator.add(__webpack_require__(22));
	
	xrouter.href = function() {
	  return xrouter.connector.href.apply(xrouter.connector, arguments);
	};
	
	// browser only
	if( typeof window === 'object' ) {
	  var closest = function(el, selector) {
	    var matches = (window.document || window.ownerDocument).querySelectorAll(selector), i;
	    do {
	      i = matches.length;
	      while (--i >= 0 && matches.item(i) !== el) {};
	    } while ((i < 0) && (el = el.parentElement)); 
	    return el;
	  };
	  
	  xrouter.get = function(id, axis) {
	    if( !id ) return null;
	    if( typeof id == 'string' ) {
	      var selector = '[data-xrouter-id="' + id + '"]';
	      var matched;
	        
	      if( axis && axis.nodeType === 1 ) {
	        if( axis.closest ) matched = axis.closest(selector);
	        else matched = closest(axis, selector);
	      }
	      
	      matched = matched || (window.document || window.ownerDocument).querySelector(selector);
	      
	      return matched && matched.xrouter;
	    }
	    
	    var node = id[0] || id;
	    if( node.parentNode ) return (function() {
	      while( node ) {
	        if( node.xrouter ) return node.xrouter;
	        node = node.parentNode;
	      }
	    })();
	  };
	  
	  xrouter.scanner = __webpack_require__(23).start();
	  window.xrouter = xrouter;
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var path = __webpack_require__(2);
	var URL = __webpack_require__(4);
	var querystring = __webpack_require__(8);
	var Router = __webpack_require__(11);
	var meta = __webpack_require__(14);
	var connector = __webpack_require__(15);
	var initiators = [];
	
	function abs(curl, url) {
	  if( !url ) return '/';
	  if( url[0] === '/' ) return url;
	  if( !curl ) return '/' + url;
	  
	  //console.warn(curl, url, URL.resolve(curl, url));
	  return URL.resolve(curl, url);
	}
	
	/*
	console.debug('http://localhost/a/b/c?a=b', abs(null, 'http://localhost:9000/a/b/c?a=b'));
	console.debug('/a/b/c?a=b', abs(null, '/a/b/c?a=b'));
	console.debug('/g/d /a/b/c?a=b', abs('/g/d', '/a/b/c?a=b'));
	console.debug('/g/d/ /a/b/c?a=b', abs('/g/d/', '/a/b/c?a=b'));
	console.debug('/g/d a/b/c?a=b', abs('/g/d', 'a/b/c?a=b'));
	console.debug('/g/d/ a/b/c?a=b', abs('/g/d/', 'a/b/c?a=b'));
	
	console.debug(abs('/first/second/third/fourth?a=b', '.'));
	console.debug(abs('/first/second/third/fourth?a=b', './'));
	console.debug(abs('/first/second/third/fourth?a=b', '../'));
	console.debug(abs('/first/second/third/fourth?a=b', '../../'));
	console.debug(abs('/first/second/third/fourth?a=b', '/'));
	console.debug(abs('/first/second/third/fourth?a=b', 'done?b=c#hash'));
	console.debug(abs('/first/second/third/fourth/?a=b', 'done?b=c#hash'));
	console.debug(abs('/first/second/third/fourth?a=b', './done?b=c#hash'));
	console.debug(abs('/first/second/third/fourth?a=b', '../done?b=c#hash'));
	console.debug(abs('/first/second/third/fourth?a=b', '../../done?b=c#hash'));
	console.debug(abs('/first/second/third/fourth?a=b', '/done?b=c#hash'));
	console.debug(abs('http://localhost/first/second/third/fourth?a=b', '.'));
	console.debug(abs('http://localhost/first/second/third/fourth?a=b', './'));
	console.debug(abs('http://localhost/first/second/third/fourth?a=b', '../'));
	console.debug(abs('http://localhost/first/second/third/fourth?a=b', '../../'));
	console.debug(abs('http://localhost/first/second/third/fourth?a=b', '/'));
	console.debug(abs('http://localhost/first/second/third/fourth?a=b', 'done?b=c#hash'));
	console.debug(abs('http://localhost/first/second/third/fourth/?a=b', 'done?b=c#hash'));
	console.debug(abs('http://localhost/first/second/third/fourth?a=b', './done?b=c#hash'));
	console.debug(abs('http://localhost/first/second/third/fourth?a=b', '../done?b=c#hash'));
	console.debug(abs('http://localhost/first/second/third/fourth?a=b', '../../done?b=c#hash'));
	console.debug(abs('http://localhost/first/second/third/fourth?a=b', '/done?b=c#hash'));
	*/
	
	var globalscope = global.xrouter_globalscope = global.xrouter_globalscope || {};
	
	function Application(id) {
	  var router = Router(id),
	    debug = meta('debug') === 'true' ? true : false,
	    config = {},
	    request,
	    response,
	    session = {},
	    history = [],
	    referer,
	    currenthref,
	    committedhref;
	    
	  if( debug ) console.debug('app created', id);
	  
	  // add global initiator
	  initiators.forEach(function(initiator) {
	    router.use(initiator.call(router));
	  });
	  
	  // config
	  router.debug = function(b) {
	    if( !arguments.length ) return debug;
	    debug = !!b;
	    return this;
	  };
	  
	  router.config = function(key, value) {
	    if( arguments.length <= 1 ) return config[key];
	    if( value === null || value === undefined ) delete config[key];
	    else config[key] = value;
	    return this;
	  };
	  
	  router.set = function(key, value) {
	    router.config(key, value);
	    return this;
	  };
	  
	  router.session = function() {
	    return session;
	  };
	  
	  // history
	  var pushhistory = function(href, replace) {
	    if( replace ) history[history.length - 1] = href;
	    else history.push(href);
	    
	    if( history.length > 30 ) history = history.slice(history.length - 30);
	  };
	  
	  router.state = function(index) {
	    index = +index || 0;
	    return history[history.length - 1 + index];
	  };
	  
	  router.history = function() {
	    return history;
	  };
	  
	  router.referer = function() {
	    return referer;
	  };
	  
	  router.on('writestate', function(e) {
	    if( e.detail.sub ) return;
	    router.fire('subapp.writestate', e.detail, 'up', false);
	  });
	  
	  var subappurls = {};
	  router.on('subapp.writestate', function(e) {
	    var request = e.detail.request;
	    var response = e.detail.response;
	    var parent = request.parent;
	    var app = request.app;
	    
	    var subappurl = subappurls[app.id] = subappurls[app.id] || {};
	    subappurl.lastpoint = parent.parentURL || subappurl.lastpoint;
	    
	    if( subappurl.lastpoint ) {
	      var href = subappurl.lastpoint + request.href;
	      pushhistory(href, e.detail.replace);
	      
	      router.fire('writestate', {
	        href: href,
	        subapp: true,
	        commit: e.detail.commit,
	        replace: e.detail.replace,
	        request: request,
	        response: response
	      });
	    }
	  });
	  
	  // request
	  router.prepare = function(request, response) {
	    var resconfig = {};
	    var finished = false;
	    var href = request.url;
	    var parsed = URL.parse(href);
	    
	    var app = {
	      request: {
	        parent: request,
	        app: router,
	        
	        method: request.method || 'get',
	        referer: request.referer,
	        requesthref: request.requesthref,
	        fullhref: request.fullhref || request.href,
	        href: href,
	        url: href,
	        parsed: parsed,
	        hash: parsed.hash,
	        query: querystring.parse(parsed.query),
	        
	        session: session,
	        global: request.global || globalscope,
	        options: request.options,
	        body: request.body
	      },
	      response: {
	        parent: response,
	        get: function(key) {
	          return resconfig[key];
	        },
	        set: function(key, value) {
	          app.response.config(key, value);
	          return this;
	        },
	        config: function(key, value) {
	          if( !arguments.length ) return resconfig;
	          if( arguments.length === 1 ) return resconfig[key];
	          if( value === null || value === undefined ) delete resconfig[key];
	          else resconfig[key] = value;
	          return this;
	        },
	        end: function() {
	          var request = app.request;
	          var response = app.response;
	          
	          if( finished ) return console.warn('[x-router] request \'' + request.href + '\' already finished.');
	          finished = true;
	          
	          router.fire('end', {
	            url: request.url,
	            href: request.href,
	            request: request,
	            response: response
	          });
	        }
	      }
	    };
	    
	    if( debug ) console.debug('app build', router.id, app);
	    return app;
	  };
	  
	  router.href = function(requesthref, body, options) {
	    if( !arguments.length ) return currenthref;
	    if( typeof body === 'boolean' ) options = {writestate:body}, body = null;
	    if( typeof options === 'boolean' ) options = {writestate:options};
	    if( !options || typeof options !== 'object' ) options = {};
	    if( !requesthref ) return console.error('[x-router] missing url');
	    if( typeof requesthref === 'number' ) url = url + '';
	    if( typeof requesthref !== 'string' ) return console.error('[x-router] illegal type of url');
	    
	    var href = abs(router.state(), requesthref);
	    var body = body;
	    var force = options.force === true ? true : false;
	    var writestate = options.writestate === false ? false : true;
	    var replace = options.replace === true ? true : false;
	    var pop = options.pop === true ? true : false;
	    
	    if( !writestate ) force = true;
	    if( router.config('always') === true ) force = true;
	    
	    if( debug ) console.debug('href', requesthref, {
	      href: href,
	      currenthref: currenthref,
	      committedhref: committedhref,
	      force: force,
	      writestate: writestate,
	      prevstate: router.state()
	    });
	    
	    if( !force ) {
	      if( currenthref === href || committedhref === href ) {
	        if( debug ) console.debug('ignored', href, currenthref, committedhref);
	      }
	    }
	    
	    var prepared = router.prepare({
	      requesthref: requesthref,
	      referer: currenthref,
	      url: href,
	      options: options,
	      body: body
	    });
	    
	    var request = prepared.request;
	    var response = prepared.response;
	    
	    if( router.fire('beforerequest', {
	      href: href,
	      request: request,
	      response: response
	    }) ) {
	      if( writestate ) {
	        pushhistory(href, replace);
	        
	        //console.error('writestate', router.id, href);
	        router.fire('writestate', {
	          href: href,
	          pop: pop,
	          replace: replace,
	          commit: false,
	          request: request,
	          response: response
	        });
	      }
	      
	      currenthref = href;
	      router(request, response);
	      
	      router.fire('request', {
	        href: href,
	        request: request,
	        response: response
	      });
	    } else if( debug ) {
	      console.debug('[x-router] beforerequest event prevented');
	    }
	    
	    return this;
	  };
	  
	  router.refresh = function(statebase) {
	    statebase = statebase === false ? false : true;
	    
	    if( !statebase ) {
	      if( currenthref ) return router.href(currenthref, null, {force: true});
	      return;
	    }
	    
	    var state = router.state();
	    if( state ) return router.href(state, null, {force: true});
	  };
	  
	  router.on('end', function(e) {
	    var href = e.detail.href;
	    var request = e.detail.request;
	    var response = e.detail.response;
	    var writestate = e.detail.request.options.writestate === false ? false : true;
	    
	    if( writestate ) {
	      committedhref = href;
	      pushhistory(href, true);
	      
	      router.fire('writestate', {
	        href: href,
	        commit: true,
	        replace: true,
	        request: request,
	        response: response
	      });
	    }
	  });
	  
	  router.on('replace', function(e) {
	    if( debug ) console.debug('[x-router] route replaced', e.detail);
	    if( e.detail.request.app !== router ) return;
	    
	    var request = e.detail.request;
	    if( request.options.writestate !== false ) {
	      pushhistory(e.detail.href, true);
	      
	      router.fire('writestate', {
	        href: e.detail.href,
	        replace: true,
	        commit: false,
	        request: request,
	        response: e.detail.response
	      });
	    }
	  });
	  
	  router.listen = function(options) {
	    router.connector = connector.connect(router, options);
	    return this;
	  };
	  
	  router.close = function() {
	    connector.disconnect(router);
	    delete router.connector;
	    return this;
	  };
	  
	  return router;
	};
	
	Application.connector = connector;
	Application.Router = Router;
	Application.initiator = {
	  add: function(fn) {
	    initiators.push(fn);
	    return this;
	  },
	  remove: function(fn) {
	    if( ~initiators.indexOf(fn) ) initiators.splice(initiators.indexOf(fn), 1);
	    return this;
	  },
	  list: function() {
	    return initiators;
	  }
	};
	
	module.exports = Application;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }
	
	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }
	
	  return parts;
	}
	
	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};
	
	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;
	
	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();
	
	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }
	
	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }
	
	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)
	
	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');
	
	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};
	
	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';
	
	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');
	
	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }
	
	  return (isAbsolute ? '/' : '') + path;
	};
	
	// posix version
	exports.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};
	
	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};
	
	
	// path.relative(from, to)
	// posix version
	exports.relative = function(from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);
	
	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }
	
	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }
	
	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }
	
	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));
	
	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }
	
	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }
	
	  outputParts = outputParts.concat(toParts.slice(samePartsLength));
	
	  return outputParts.join('/');
	};
	
	exports.sep = '/';
	exports.delimiter = ':';
	
	exports.dirname = function(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];
	
	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }
	
	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }
	
	  return root + dir;
	};
	
	
	exports.basename = function(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};
	
	
	exports.extname = function(path) {
	  return splitPath(path)[3];
	};
	
	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}
	
	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b'
	    ? function (str, start, len) { return str.substr(start, len) }
	    : function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ },
/* 3 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var punycode = __webpack_require__(5);
	var util = __webpack_require__(7);
	
	exports.parse = urlParse;
	exports.resolve = urlResolve;
	exports.resolveObject = urlResolveObject;
	exports.format = urlFormat;
	
	exports.Url = Url;
	
	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}
	
	// Reference: RFC 3986, RFC 1808, RFC 2396
	
	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	    portPattern = /:[0-9]*$/,
	
	    // Special case for a simple path URL
	    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
	
	    // RFC 2396: characters reserved for delimiting URLs.
	    // We actually just auto-escape these.
	    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
	
	    // RFC 2396: characters not allowed for various reasons.
	    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),
	
	    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	    autoEscape = ['\''].concat(unwise),
	    // Characters that are never ever allowed in a hostname.
	    // Note that any invalid chars are also handled, but these
	    // are the ones that are *expected* to be seen, so we fast-path
	    // them.
	    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	    hostEndingChars = ['/', '?', '#'],
	    hostnameMaxLen = 255,
	    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
	    // protocols that can allow "unsafe" and "unwise" chars.
	    unsafeProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that never have a hostname.
	    hostlessProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that always contain a // bit.
	    slashedProtocol = {
	      'http': true,
	      'https': true,
	      'ftp': true,
	      'gopher': true,
	      'file': true,
	      'http:': true,
	      'https:': true,
	      'ftp:': true,
	      'gopher:': true,
	      'file:': true
	    },
	    querystring = __webpack_require__(8);
	
	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && util.isObject(url) && url instanceof Url) return url;
	
	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}
	
	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  if (!util.isString(url)) {
	    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
	  }
	
	  // Copy chrome, IE, opera backslash-handling behavior.
	  // Back slashes before the query string get converted to forward slashes
	  // See: https://code.google.com/p/chromium/issues/detail?id=25916
	  var queryIndex = url.indexOf('?'),
	      splitter =
	          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
	      uSplit = url.split(splitter),
	      slashRegex = /\\/g;
	  uSplit[0] = uSplit[0].replace(slashRegex, '/');
	  url = uSplit.join(splitter);
	
	  var rest = url;
	
	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();
	
	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    var simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      this.path = rest;
	      this.href = rest;
	      this.pathname = simplePath[1];
	      if (simplePath[2]) {
	        this.search = simplePath[2];
	        if (parseQueryString) {
	          this.query = querystring.parse(this.search.substr(1));
	        } else {
	          this.query = this.search.substr(1);
	        }
	      } else if (parseQueryString) {
	        this.search = '';
	        this.query = {};
	      }
	      return this;
	    }
	  }
	
	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    this.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }
	
	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }
	
	  if (!hostlessProtocol[proto] &&
	      (slashes || (proto && !slashedProtocol[proto]))) {
	
	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c
	
	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.
	
	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (var i = 0; i < hostEndingChars.length; i++) {
	      var hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	
	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }
	
	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = decodeURIComponent(auth);
	    }
	
	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (var i = 0; i < nonHostChars.length; i++) {
	      var hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;
	
	    this.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);
	
	    // pull out port.
	    this.parseHost();
	
	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';
	
	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = this.hostname[0] === '[' &&
	        this.hostname[this.hostname.length - 1] === ']';
	
	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = this.hostname.split(/\./);
	      for (var i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }
	
	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      this.hostname = this.hostname.toLowerCase();
	    }
	
	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a punycoded representation of "domain".
	      // It only converts parts of the domain name that
	      // have non-ASCII characters, i.e. it doesn't matter if
	      // you call it with a domain that already is ASCII-only.
	      this.hostname = punycode.toASCII(this.hostname);
	    }
	
	    var p = this.port ? ':' + this.port : '';
	    var h = this.hostname || '';
	    this.host = h + p;
	    this.href += this.host;
	
	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }
	
	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {
	
	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (var i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      if (rest.indexOf(ae) === -1)
	        continue;
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }
	
	
	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    this.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      this.query = querystring.parse(this.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    this.search = '';
	    this.query = {};
	  }
	  if (rest) this.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	      this.hostname && !this.pathname) {
	    this.pathname = '/';
	  }
	
	  //to support http.request
	  if (this.pathname || this.search) {
	    var p = this.pathname || '';
	    var s = this.search || '';
	    this.path = p + s;
	  }
	
	  // finally, reconstruct the href based on what has been validated.
	  this.href = this.format();
	  return this;
	};
	
	// format a parsed object into a url string
	function urlFormat(obj) {
	  // ensure it's an object, and not a string url.
	  // If it's an obj, this is a no-op.
	  // this way, you can call url_format() on strings
	  // to clean up potentially wonky urls.
	  if (util.isString(obj)) obj = urlParse(obj);
	  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
	  return obj.format();
	}
	
	Url.prototype.format = function() {
	  var auth = this.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }
	
	  var protocol = this.protocol || '',
	      pathname = this.pathname || '',
	      hash = this.hash || '',
	      host = false,
	      query = '';
	
	  if (this.host) {
	    host = auth + this.host;
	  } else if (this.hostname) {
	    host = auth + (this.hostname.indexOf(':') === -1 ?
	        this.hostname :
	        '[' + this.hostname + ']');
	    if (this.port) {
	      host += ':' + this.port;
	    }
	  }
	
	  if (this.query &&
	      util.isObject(this.query) &&
	      Object.keys(this.query).length) {
	    query = querystring.stringify(this.query);
	  }
	
	  var search = this.search || (query && ('?' + query)) || '';
	
	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';
	
	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (this.slashes ||
	      (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }
	
	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;
	
	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');
	
	  return protocol + host + pathname + search + hash;
	};
	
	function urlResolve(source, relative) {
	  return urlParse(source, false, true).resolve(relative);
	}
	
	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};
	
	function urlResolveObject(source, relative) {
	  if (!source) return relative;
	  return urlParse(source, false, true).resolveObject(relative);
	}
	
	Url.prototype.resolveObject = function(relative) {
	  if (util.isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }
	
	  var result = new Url();
	  var tkeys = Object.keys(this);
	  for (var tk = 0; tk < tkeys.length; tk++) {
	    var tkey = tkeys[tk];
	    result[tkey] = this[tkey];
	  }
	
	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;
	
	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }
	
	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    var rkeys = Object.keys(relative);
	    for (var rk = 0; rk < rkeys.length; rk++) {
	      var rkey = rkeys[rk];
	      if (rkey !== 'protocol')
	        result[rkey] = relative[rkey];
	    }
	
	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	        result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }
	
	    result.href = result.format();
	    return result;
	  }
	
	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      var keys = Object.keys(relative);
	      for (var v = 0; v < keys.length; v++) {
	        var k = keys[v];
	        result[k] = relative[k];
	      }
	      result.href = result.format();
	      return result;
	    }
	
	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      var relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }
	
	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	      isRelAbs = (
	          relative.host ||
	          relative.pathname && relative.pathname.charAt(0) === '/'
	      ),
	      mustEndAbs = (isRelAbs || isSourceAbs ||
	                    (result.host && relative.pathname)),
	      removeAllDots = mustEndAbs,
	      srcPath = result.pathname && result.pathname.split('/') || [],
	      relPath = relative.pathname && relative.pathname.split('/') || [],
	      psychotic = result.protocol && !slashedProtocol[result.protocol];
	
	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }
	
	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	                  relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	                      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!util.isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especially happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                       result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	                    (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	      (result.host || relative.host || srcPath.length > 1) &&
	      (last === '.' || last === '..') || last === '');
	
	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last === '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }
	
	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }
	
	  if (mustEndAbs && srcPath[0] !== '' &&
	      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }
	
	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }
	
	  var isAbsolute = srcPath[0] === '' ||
	      (srcPath[0] && srcPath[0].charAt(0) === '/');
	
	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	                                    srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especially happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                     result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }
	
	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);
	
	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }
	
	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }
	
	  //to support request.http
	  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	                  (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};
	
	Url.prototype.parseHost = function() {
	  var host = this.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) this.hostname = host;
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/punycode v1.3.2 by @mathias */
	;(function(root) {
	
		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports &&
			!exports.nodeType && exports;
		var freeModule = typeof module == 'object' && module &&
			!module.nodeType && module;
		var freeGlobal = typeof global == 'object' && global;
		if (
			freeGlobal.global === freeGlobal ||
			freeGlobal.window === freeGlobal ||
			freeGlobal.self === freeGlobal
		) {
			root = freeGlobal;
		}
	
		/**
		 * The `punycode` object.
		 * @name punycode
		 * @type Object
		 */
		var punycode,
	
		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1
	
		/** Bootstring parameters */
		base = 36,
		tMin = 1,
		tMax = 26,
		skew = 38,
		damp = 700,
		initialBias = 72,
		initialN = 128, // 0x80
		delimiter = '-', // '\x2D'
	
		/** Regular expressions */
		regexPunycode = /^xn--/,
		regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators
	
		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},
	
		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		floor = Math.floor,
		stringFromCharCode = String.fromCharCode,
	
		/** Temporary variable */
		key;
	
		/*--------------------------------------------------------------------------*/
	
		/**
		 * A generic error utility function.
		 * @private
		 * @param {String} type The error type.
		 * @returns {Error} Throws a `RangeError` with the applicable error message.
		 */
		function error(type) {
			throw RangeError(errors[type]);
		}
	
		/**
		 * A generic `Array#map` utility function.
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} callback The function that gets called for every array
		 * item.
		 * @returns {Array} A new array of values returned by the callback function.
		 */
		function map(array, fn) {
			var length = array.length;
			var result = [];
			while (length--) {
				result[length] = fn(array[length]);
			}
			return result;
		}
	
		/**
		 * A simple `Array#map`-like wrapper to work with domain name strings or email
		 * addresses.
		 * @private
		 * @param {String} domain The domain name or email address.
		 * @param {Function} callback The function that gets called for every
		 * character.
		 * @returns {Array} A new string of characters returned by the callback
		 * function.
		 */
		function mapDomain(string, fn) {
			var parts = string.split('@');
			var result = '';
			if (parts.length > 1) {
				// In email addresses, only the domain name should be punycoded. Leave
				// the local part (i.e. everything up to `@`) intact.
				result = parts[0] + '@';
				string = parts[1];
			}
			// Avoid `split(regex)` for IE8 compatibility. See #17.
			string = string.replace(regexSeparators, '\x2E');
			var labels = string.split('.');
			var encoded = map(labels, fn).join('.');
			return result + encoded;
		}
	
		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}
	
		/**
		 * Creates a string based on an array of numeric code points.
		 * @see `punycode.ucs2.decode`
		 * @memberOf punycode.ucs2
		 * @name encode
		 * @param {Array} codePoints The array of numeric code points.
		 * @returns {String} The new Unicode string (UCS-2).
		 */
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}
	
		/**
		 * Converts a basic code point into a digit/integer.
		 * @see `digitToBasic()`
		 * @private
		 * @param {Number} codePoint The basic numeric code point value.
		 * @returns {Number} The numeric value of a basic code point (for use in
		 * representing integers) in the range `0` to `base - 1`, or `base` if
		 * the code point does not represent a value.
		 */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}
	
		/**
		 * Converts a digit/integer into a basic code point.
		 * @see `basicToDigit()`
		 * @private
		 * @param {Number} digit The numeric value of a basic code point.
		 * @returns {Number} The basic code point whose value (when used for
		 * representing integers) is `digit`, which needs to be in the range
		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		 * used; else, the lowercase form is used. The behavior is undefined
		 * if `flag` is non-zero and `digit` has no uppercase form.
		 */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}
	
		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * http://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}
	
		/**
		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The Punycode string of ASCII-only symbols.
		 * @returns {String} The resulting string of Unicode symbols.
		 */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,
			    /** Cached calculation results */
			    baseMinusT;
	
			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.
	
			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}
	
			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}
	
			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.
	
			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {
	
				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {
	
					if (index >= inputLength) {
						error('invalid-input');
					}
	
					digit = basicToDigit(input.charCodeAt(index++));
	
					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}
	
					i += digit * w;
					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	
					if (digit < t) {
						break;
					}
	
					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}
	
					w *= baseMinusT;
	
				}
	
				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);
	
				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}
	
				n += floor(i / out);
				i %= out;
	
				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);
	
			}
	
			return ucs2encode(output);
		}
	
		/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;
	
			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);
	
			// Cache the length
			inputLength = input.length;
	
			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;
	
			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}
	
			handledCPCount = basicLength = output.length;
	
			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.
	
			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}
	
			// Main encoding loop:
			while (handledCPCount < inputLength) {
	
				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}
	
				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}
	
				delta += (m - n) * handledCPCountPlusOne;
				n = m;
	
				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];
	
					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}
	
					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base; /* no condition */; k += base) {
							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(
								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = floor(qMinusT / baseMinusT);
						}
	
						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}
	
				++delta;
				++n;
	
			}
			return output.join('');
		}
	
		/**
		 * Converts a Punycode string representing a domain name or an email address
		 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
		 * it doesn't matter if you call it on a string that has already been
		 * converted to Unicode.
		 * @memberOf punycode
		 * @param {String} input The Punycoded domain name or email address to
		 * convert to Unicode.
		 * @returns {String} The Unicode representation of the given Punycode
		 * string.
		 */
		function toUnicode(input) {
			return mapDomain(input, function(string) {
				return regexPunycode.test(string)
					? decode(string.slice(4).toLowerCase())
					: string;
			});
		}
	
		/**
		 * Converts a Unicode string representing a domain name or an email address to
		 * Punycode. Only the non-ASCII parts of the domain name will be converted,
		 * i.e. it doesn't matter if you call it with a domain that's already in
		 * ASCII.
		 * @memberOf punycode
		 * @param {String} input The domain name or email address to convert, as a
		 * Unicode string.
		 * @returns {String} The Punycode representation of the given domain name or
		 * email address.
		 */
		function toASCII(input) {
			return mapDomain(input, function(string) {
				return regexNonASCII.test(string)
					? 'xn--' + encode(string)
					: string;
			});
		}
	
		/*--------------------------------------------------------------------------*/
	
		/** Define the public API */
		punycode = {
			/**
			 * A string representing the current Punycode.js version number.
			 * @memberOf punycode
			 * @type String
			 */
			'version': '1.3.2',
			/**
			 * An object of methods to convert from JavaScript's internal character
			 * representation (UCS-2) to Unicode code points, and back.
			 * @see <https://mathiasbynens.be/notes/javascript-encoding>
			 * @memberOf punycode
			 * @type Object
			 */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};
	
		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (freeExports && freeModule) {
			if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.punycode = punycode;
		}
	
	}(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)(module), (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = {
	  isString: function(arg) {
	    return typeof(arg) === 'string';
	  },
	  isObject: function(arg) {
	    return typeof(arg) === 'object' && arg !== null;
	  },
	  isNull: function(arg) {
	    return arg === null;
	  },
	  isNullOrUndefined: function(arg) {
	    return arg == null;
	  }
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.decode = exports.parse = __webpack_require__(9);
	exports.encode = exports.stringify = __webpack_require__(10);


/***/ },
/* 9 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};
	
	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }
	
	  var regexp = /\+/g;
	  qs = qs.split(sep);
	
	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }
	
	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }
	
	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;
	
	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }
	
	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);
	
	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }
	
	  return obj;
	};


/***/ },
/* 10 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;
	
	    case 'boolean':
	      return v ? 'true' : 'false';
	
	    case 'number':
	      return isFinite(v) ? v : '';
	
	    default:
	      return '';
	  }
	};
	
	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }
	
	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);
	
	  }
	
	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var path = __webpack_require__(2);
	var URL = __webpack_require__(4);
	var RoutePattern = __webpack_require__(12);
	var Events = __webpack_require__(13);
	
	
	if( !String.prototype.startsWith ) {
	  String.prototype.startsWith = function(searchString, position){
	    position = position || 0;
	    return this.substr(position, searchString.length) === searchString;
	  };
	}
	
	if( !String.prototype.endsWith ) {
	  String.prototype.endsWith = function(suffix) {
	    return this.indexOf(suffix, this.length - suffix.length) !== -1;
	  };
	}
	
	if( !Array.prototype.forEach ) {
	  Array.prototype.forEach = function(callback){
	    for (var i = 0; i < this.length; i++){
	      callback.apply(this, [this[i], i, this]);
	    }
	  };
	}
	
	if( !Array.prototype.indexOf ) {
	  Array.prototype.indexOf = function(obj, start) {
	    for (var i = (start || 0); i < this.length; i++) {
	      if (this[i] == obj) return i;
	    }
	    return -1;
	  };
	}
	
	
	function patternize(source, ignoresubdir) {
	  var pettern = RoutePattern.fromString(source);
	  var ap = RoutePattern.fromString(source + '/*after');
	  
	  return {
	    match: function(url) {
	      if( source === '/' && ignoresubdir ) return true;
	      
	      if( pettern.matches(url) ) {
	        return pettern.match(url).namedParams;
	      } else if( ignoresubdir && ap.matches(url) ) {
	        var params = ap.match(url).namedParams;
	        delete params.after;
	        return params;
	      }
	      return false;
	    },
	    matches: function(url) {
	      return pattern.matches(url) ? true : (ignoresubdir && ap.matches(url) ? true : false);
	    }
	  };
	}
	
	function dividepath(axis, full) {
	  if( axis[0] === '/' ) axis = axis.substring(1);
	  if( full[0] === '/' ) full = full.substring(1);
	  if( axis.endsWith('/') ) axis = axis.substring(0, axis.length - 1);
	  if( full.endsWith('/') ) full = full.substring(0, full.length - 1);
	  if( !axis ) return {
	    sub: '/' + full,
	    parent: ''
	  };
	  
	  while(~axis.indexOf('//')) axis.split('//').join('/');
	  while(~full.indexOf('//')) full.split('//').join('/');
	  
	  axis = axis.split('/');
	  full = full.split('/');
	  var sub = [], parent = [];
	  
	  for(var i=0; i < full.length; i++) {
	    if( axis[i] && axis[i][0] !== ':' &&  full[i] !== axis[i] ) return null;
	    
	    if( i >= axis.length ) sub.push(full[i]);
	    else parent.push(full[i]);
	  }
	  
	  return {
	    parent: '/' + parent.join('/'),
	    sub: '/' + sub.join('/')
	  };
	}
	
	function mix() {
	  var result = {};
	  [].forEach.call(arguments, function(o) {
	    if( o && typeof o === 'object' ) {
	      for(var k in o ) result[k] = o[k];
	    }
	  });
	  return result;
	}
	
	var seq = 0;
	function Router(id) {
	  id = id || seq++;
	  var boot = true;
	  var routes = [];
	  
	  var body = function Router(req, res, onext) {
	    var oRequest = req = req || {};
	    var oResponse = res = res || {};
	    
	    // app 인 경우
	    if( typeof body.prepare === 'function' ) {
	      var prepared = body.prepare(req, res);
	      req = prepared.request;
	      res = prepared.response;
	    }
	    
	    var oParentURL = req.parentURL = req.parentURL || '';
	    var oURL = req.url = req.url || '/';
	    var oHref = req.href = req.href || req.url;
	    var oParams = req.params = req.params || {};
	    var finished = false;
	    
	    var next = function(err) {
	      if( finished ) return console.error('next function twice called.', id, err);
	      finished = true;
	      boot = false;
	      req.parentURL = oParentURL;
	      req.url = oURL;
	      req.href = oHref;
	      req.params = oParams;
	      
	      if( err ) {
	        events.fire('error', {
	          router: body,
	          href: req.href,
	          url: req.url,
	          request: req,
	          response: res,
	          error: err
	        });
	        
	        return onext && onext(err);
	      }
	      
	      events.fire('notfound', {
	        router: body,
	        href: req.href,
	        url: req.url,
	        request: req,
	        response: res
	      });
	      
	      onext && onext();
	    };
	    
	    var index = 0;
	    var forward = function(err) {
	      if( err ) return next(err);
	      
	      var route = routes[index++];
	      
	      if( !route ) return next();
	      if( !boot && route.type === 'boot' ) return forward();
	      //console.log(route, boot, route.pattern, route.pattern.match(req.url));
	      
	      var fn = route.fn;
	      var type = route.type;
	      var routepath = route.path;
	      var params = route.pattern && route.pattern.match(req.url);
	      
	      if( !params ) return forward();
	      req.params = mix(oParams, params);
	      
	      req.parentURL = oParentURL;
	      req.url = oURL;
	      req.boot = boot;
	      
	      // replace
	      if( typeof fn == 'string' ) {
	        if( fn[0] == '/' || fn[0] == '.' ) {
	          return console.error('[tinyrouter] illegal replace url', fn);
	        }
	        
	        var ohref = req.href;
	        req.url = oURL = '/' + fn;
	        req.href = path.join(oParentURL || '/', fn);
	        
	        /*console.debug('replace', {
	          ohref: ohref,
	          oParentURL: oParentURL,
	          to: fn,
	          'req.parentURL': req.parentURL,
	          'req.href': req.href,
	          'req.url': req.url
	        });*/
	        
	        events.fire('replace', {
	          router: body,
	          previous: ohref,
	          href: req.href,
	          url: req.url,
	          request: req,
	          response: res
	        }, 'up');
	        
	        return forward();
	      }
	      
	      // sub routing
	      if( fn.__router__ || fn.Routable ) {
	        /*console.info('-------');
	        console.info('id', fn.id);
	        console.info('routepath', routepath);
	        console.info('url', req.url);*/
	        
	        var div = dividepath(routepath, URL.parse(req.url).pathname);
	        req.parentURL = div.parent ? path.join(oParentURL, div.parent) : oParentURL;
	        req.url = req.url.substring(div.parent.length);
	        
	        //console.log('sub routing', routepath, oURL, '->', req.url);
	        
	        /*console.info('result parent', req.parentURL);
	        console.info('result url', req.url);
	        console.info('div', div);
	        console.info('-------');*/
	      }
	      
	      events.fire('route', {
	        router: body,
	        config: route,
	        href: req.href,
	        url: req.url,
	        request: req,
	        response: res
	      }, 'up');
	      
	      route.fn.apply(body, [req, res, forward]);
	    };
	    forward();
	  };
	  
	  body.Routable = true;
	  body.id = id;
	  
	  body.exists = function(url) {
	    var exists = false;
	    routes.forEach(function(route) {
	      if( exists ) return;
	      if( route.type === 'get' ) {
	        var params = route.pattern.match(url);
	        if( params ) exists = true;
	      } else if( route.type === 'use' ) {
	        exists = route.fn.exists(url.substring(route.path.length));
	      }
	    });
	    return exists;
	  };
	  
	  var add = function(route) {
	    var fn = route.fn;
	    if( fn && fn === body ) throw new Error('cannot add router itself: ' + fn.id);
	    
	    // adapt each
	    if( fn.__router__ || fn.Routable ) {
	      fn.connect && fn.connect(body, 'up');
	      events.connect(fn, 'down');
	    }
	    
	    routes.push(route);
	    events.fire('add', {
	      router: body,
	      config: route
	    });
	  };
	  
	  body.use = function(path, fn) {
	    if( typeof path === 'function' ) fn = path, path = '/';
	    if( typeof path !== 'string' ) throw new TypeError('illegal type of path:' + typeof(path));
	    
	    add({
	      type: 'use',
	      path: path || '/',
	      pattern: patternize(path, true),
	      fn: fn
	    });
	    return this;
	  };
	  
	  body.get = function(path, fn) {
	    if( typeof path === 'function' ) fn = path, path = '/';
	    if( typeof path !== 'string' ) throw new TypeError('illegal type of path:' + typeof(path));
	    
	    add({
	      type: 'get',
	      path: path || '/',
	      pattern: patternize(path),
	      fn: fn
	    });
	    return this;
	  };
	  
	  body.boot = function(path, fn) {
	    if( typeof path === 'function' ) fn = path, path = '/';
	    if( typeof path !== 'string' ) throw new TypeError('illegal type of path:' + typeof(path));
	    
	    add({
	      type: 'boot',
	      path: path || '/',
	      pattern: patternize(path, true),
	      fn: fn
	    });
	    return this;
	  };
	  
	  body.notfound = function(fn) {
	    body.on('notfound', fn);
	    return this;
	  };
	  
	  body.error = function(fn) {
	    body.on('error', fn);
	    return this;
	  };
	  
	  body.drop = body.remove = function(fn) {
	    var dropfns = [];
	    routes.forEach(function(route) {
	      if( route.fn === fn ) dropfns.push(route);
	    });
	    
	    dropfns.forEach(function(route) {
	      if( route.fn ) {
	        route.fn.disconnect && route.fn.disconnect(body);
	        events.connect(route.fn, 'down');
	      }
	      
	      routes.splice(routes.indexOf(route), 1);
	      
	      events.fire('remove', {
	        router: body,
	        config: route
	      });
	    });
	    return this;
	  };
	  
	  body.clear = function() {
	    routes = [];
	    return this;
	  };
	  
	  var events = Events(body);
	  body.on = function(type, fn) {
	    events.on.apply(events, arguments);
	    return this;
	  };
	  
	  body.once = function(type, fn) {
	    events.once.apply(events, arguments);
	    return this;
	  };
	  
	  body.off = function(type, fn) {
	    events.off.apply(events, arguments);
	    return this;
	  };
	  
	  body.fire = function(type, detail, direction, includeself) {
	    return events.fire.apply(events, arguments);
	  };
	  
	  body.connect = function(router, direction) {
	    events.connect(router, direction);
	    return this;
	  };
	  
	  body.disconnect = function(router) {
	    events.disconnect(router);
	    return this;
	  };
	  
	  body.hasListener = function(type) {
	    return events.has.apply(events, arguments);
	  };
	  
	  return body;
	};
	
	module.exports = Router;
	
	
	
	
	
	/*
	(function() {
	  var defined = '/hello/:planet?foo=:foo&fruit=:fruit#:section';
	  var url = '/hello/earth?foo=bar&fruit=apple#chapter2';
	  var pattern = RoutePattern.fromString(defined);
	  var matches = pattern.matches(url);
	  var params = pattern.match(url);
	  
	  console.log('match', matches);
	  console.log(JSON.stringify(params, null, '  '));
	  
	  console.log('/', subpath('/', '/system/user/list'));
	  console.log('/system', subpath('/system', '/system/user/list'));
	  console.log('/system/user', subpath('/system/user', '/system/user/list'));
	  console.log('/system/user/list', subpath('/system/user/list', '/system/user/list'));
	  console.log('/:a', subpath('/:a', '/system/user/list'));
	  console.log('/:a/:b', subpath('/:a/:b', '/system/user/list'));
	  console.log('/:a/:b/:c', subpath('/:a/:b/:c', '/system/user/list'));
	
	  var p = patternize('/', true);
	  console.log('/a/b/c', p.match('/a/b/c'));
	});
	*/

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var querystring = __webpack_require__(8);
	
	// # Utility functions
	//
	// ## Shallow merge two or more objects, e.g.
	// merge({a: 1, b: 2}, {a: 2}, {a: 3}) => {a: 3, b: 2}
	function merge() {
	  return [].slice.call(arguments).reduce(function (merged, source) {
	    for (var prop in source) {
	      merged[prop] = source[prop];
	    }
	    return merged;
	  }, {});
	}
	
	// Split a location string into different parts, e.g.:
	// splitLocation("/foo/bar?fruit=apple#some-hash") => {
	//  path: "/foo/bar", queryString: "fruit=apple", hash: "some-hash" 
	// }
	function splitLocation(location) {
	  var re = /([^\?#]*)?(\?[^#]*)?(#.*)?$/;
	  var match = re.exec(location);
	  return {
	    path: match[1] || '',
	    queryString: match[2] && match[2].substring(1) || '',
	    hash: match[3] && match[3].substring(1) || ''
	  }
	}
	
	// # QueryStringPattern
	// The QueryStringPattern holds a compiled version of the query string part of a route string, i.e.
	// ?foo=:foo&fruit=:fruit
	var QueryStringPattern = (function () {
	
	  // The RoutePattern constructor
	  // Takes a route string or regexp as parameter and provides a set of utility functions for matching against a 
	  // location path
	  function QueryStringPattern(options) {
	
	    // The query parameters specified
	    this.params = options.params;
	
	    // if allowWildcards is set to true, unmatched query parameters will be ignored
	    this.allowWildcards = options.allowWildcards;
	
	    // The original route string (optional)
	    this.routeString = options.routeString;
	  }
	
	  QueryStringPattern.prototype.matches = function (queryString) {
	    var givenParams = (queryString || '').split("&").reduce(function (params, pair) {
	      var parts = pair.split("="),
	        name = parts[0],
	        value = parts[1];
	      if (name) params[name] = value;
	      return params;
	    }, {});
	
	    var requiredParam, requiredParams = [].concat(this.params);
	    while (requiredParam = requiredParams.shift()) {
	      if (!givenParams.hasOwnProperty(requiredParam.key)) return false;
	      if (requiredParam.value && givenParams[requiredParam.key] != requiredParam.value) return false;
	    }
	    if (!this.allowWildcards && this.params.length) {
	      if (Object.getOwnPropertyNames(givenParams).length > this.params.length) return false;
	    }
	    return true;
	  };
	
	  QueryStringPattern.prototype.match = function (queryString) {
	
	    if (!this.matches(queryString)) return null;
	
	    var data = {
	      params: [],
	      namedParams: {},
	      namedQueryParams: {}
	    };
	
	    if (!queryString) {
	      return data;
	    }
	
	    // Create a mapping from each key in params to their named param
	    var namedParams = this.params.reduce(function (names, param) {
	      names[param.key] = param.name;
	      return names;
	    }, {});
	
	    var parsedQueryString = querystring.parse(queryString);
	    Object.keys(parsedQueryString).forEach(function(key) {
	      var value = parsedQueryString[key];
	      data.params.push(value);
	      if (namedParams[key]) {
	        data.namedQueryParams[namedParams[key]] = data.namedParams[namedParams[key]] = value;
	      }
	    });
	    return data;
	  };
	
	  QueryStringPattern.fromString = function (routeString) {
	
	    var options = {
	      routeString: routeString,
	      allowWildcards: false,
	      params: []
	    };
	
	    // Extract named parameters from the route string
	    // Construct an array with some metadata about each of the named parameters
	    routeString.split("&").forEach(function (pair) {
	      if (!pair) return;
	
	      var parts = pair.split("="),
	        name = parts[0],
	        value = parts[1] || '';
	
	      var wildcard = false;
	
	      var param = { key: name };
	
	      // Named parameters starts with ":"
	      if (value.charAt(0) == ':') {
	        // Thus the name of the parameter is whatever comes after ":"
	        param.name = value.substring(1);
	      }
	      else if (name == '*' && value == '') {
	        // If current param is a wildcard parameter, the options are flagged as accepting wildcards
	        // and the current parameter is not added to the options' list of params
	        wildcard = options.allowWildcards = true;
	      }
	      else {
	        // The value is an exact match, i.e. the route string 
	        // page=search&q=:query will match only when the page parameter is "search"
	        param.value = value;
	      }
	      if (!wildcard) {
	        options.params.push(param);
	      }
	    });
	    return new QueryStringPattern(options);
	  };
	
	  return QueryStringPattern;
	})();
	
	// # PathPattern
	// The PathPattern holds a compiled version of the path part of a route string, i.e.
	// /some/:dir
	var PathPattern = (function () {
	
	  // These are the regexps used to construct a regular expression from a route pattern string
	  // Based on route patterns in Backbone.js
	  var
	    pathParam = /:\w+/g,
	    splatParam = /\*\w+/g,
	    namedParams = /(:[^\/\.]+)|(\*\w+)/g,
	    subPath = /\*/g,
	    escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
	
	  // The PathPattern constructor
	  // Takes a route string or regexp as parameter and provides a set of utility functions for matching against a 
	  // location path
	  function PathPattern(options) {
	    // The route string are compiled to a regexp (if it isn't already)
	    this.regexp = options.regexp;
	
	    // The query parameters specified in the path part of the route
	    this.params = options.params;
	
	    // The original routestring (optional)
	    this.routeString = options.routeString;
	  }
	
	  PathPattern.prototype.matches = function (pathname) {
	    return this.regexp.test(pathname);
	  };
	
	  // Extracts all matched parameters
	  PathPattern.prototype.match = function (pathname) {
	
	    if (!this.matches(pathname)) return null;
	    
	    // The captured data from pathname
	    var data = {
	      params: [],
	      namedParams: {}
	    };
	
	    // Using a regexp to capture named parameters on the pathname (the order of the parameters is significant)
	    (this.regexp.exec(pathname) || []).slice(1).forEach(function (value, idx) {
	      if(value !== undefined) {
	        value = decodeURIComponent(value);
	      }
	
	      data.namedParams[this.params[idx]] = value;
	      data.params.push(value);
	    }, this);
	
	    return data;
	  };
	
	  PathPattern.routePathToRegexp = function (path) {
	    path = path
	      .replace(escapeRegExp, "\\$&")
	      .replace(pathParam, "([^/]+)")
	      .replace(splatParam, "(.*)?")
	      .replace(subPath, ".*?")
	      .replace(/\/?$/, "/?");
	    return new RegExp("^/?" + path + "$");
	  };
	
	  // This compiles a route string into a set of options which a new PathPattern is created with 
	  PathPattern.fromString = function (routeString) {
	
	    // Whatever comes after ? and # is ignored
	    routeString = routeString.split(/\?|#/)[0];
	
	    // Create the options object
	    // Keep the original routeString and a create a regexp for the pathname part of the url
	    var options = {
	      routeString: routeString,
	      regexp: PathPattern.routePathToRegexp(routeString),
	      params: (routeString.match(namedParams) || []).map(function (param) {
	        return param.substring(1);
	      })
	    };
	
	    // Options object are created, now instantiate the PathPattern
	    return new PathPattern(options);
	  };
	
	  return PathPattern;
	}());
	
	// # RegExpPattern
	// The RegExpPattern is just a simple wrapper around a regex, used to provide a similar api as the other route patterns
	var RegExpPattern = (function () {
	  // The RegExpPattern constructor
	  // Wraps a regexp and provides a *Pattern api for it
	  function RegExpPattern(regex) {
	    this.regex = regex;
	  }
	
	  RegExpPattern.prototype.matches = function (loc) {
	    return this.regex.test(loc);
	  };
	
	  // Extracts all matched parameters
	  RegExpPattern.prototype.match = function (location) {
	
	    if (!this.matches(location)) return null;
	
	    var loc = splitLocation(location);
	
	    return {
	      params: this.regex.exec(location).slice(1),
	      queryParams: querystring.parse(loc.queryString),
	      namedParams: {}
	    };
	  };
	
	  return RegExpPattern;
	}());
	
	// # RoutePattern
	// The RoutePattern combines the PathPattern and the QueryStringPattern so it can represent a full location
	// (excluding the scheme + domain part)
	// It also allows for having path-like routes in the hash part of the location
	// Allows for route strings like:
	// /some/:page?param=:param&foo=:foo#:bookmark
	// /some/:page?param=:param&foo=:foo#/:section/:bookmark
	// 
	// Todo: maybe allow for parameterization of the kind of route pattern to use for the hash?
	// Maybe use the QueryStringPattern for cases like
	// /some/:page?param=:param&foo=:foo#?onlyCareAbout=:thisPartOfTheHash&*
	// Need to test how browsers handles urls like that
	var RoutePattern = (function () {
	
	  // The RoutePattern constructor
	  // Takes a route string or regexp as parameter and provides a set of utility functions for matching against a 
	  // location path
	  function RoutePattern(options) {
	    // The route string are compiled to a regexp (if it isn't already)
	    this.pathPattern = options.pathPattern;
	    this.queryStringPattern = options.queryStringPattern;
	    this.hashPattern = options.hashPattern;
	
	    // The original routestring (optional)
	    this.routeString = options.routeString;
	  }
	
	  RoutePattern.prototype.matches = function (location) {
	    // Whatever comes after ? and # is ignored
	    var loc = splitLocation(location);
	
	    return (!this.pathPattern || this.pathPattern.matches(loc.path)) &&
	      (!this.queryStringPattern || this.queryStringPattern.matches(loc.queryString) ) &&
	      (!this.hashPattern || this.hashPattern.matches(loc.hash))
	  };
	
	  // Extracts all matched parameters
	  RoutePattern.prototype.match = function (location) {
	
	    if (!this.matches(location)) return null;
	
	    // Whatever comes after ? and # is ignored
	    var loc = splitLocation(location),
	      match,
	      pattern;
	
	    var data = {
	      params: [],
	      namedParams: {},
	      pathParams: {},
	      queryParams: querystring.parse(loc.queryString),
	      namedQueryParams: {},
	      hashParams: {}
	    };
	
	    var addMatch = function (match) {
	      data.params = data.params.concat(match.params);
	      data.namedParams = merge(data.namedParams, match.namedParams);
	    };
	
	    if (pattern = this.pathPattern) {
	      match = pattern.match(loc.path);
	      if (match) addMatch(match);
	      data.pathParams = match ? match.namedParams : {};
	    }
	    if (pattern = this.queryStringPattern) {
	      match = pattern.match(loc.queryString);
	      if (match) addMatch(match);
	      data.namedQueryParams = match ? match.namedQueryParams : {};
	    }
	    if (pattern = this.hashPattern) {
	      match = pattern.match(loc.hash);
	      if (match) addMatch(match);
	      data.hashParams = match ? match.namedParams : {};
	    }
	    return data;
	  };
	
	  // This compiles a route string into a set of options which a new RoutePattern is created with 
	  RoutePattern.fromString = function (routeString) {
	    var parts = splitLocation(routeString);
	
	    var matchPath = parts.path;
	    var matchQueryString = parts.queryString || routeString.indexOf("?") > -1;
	    var matchHash = parts.hash || routeString.indexOf("#") > -1;
	
	    // Options object are created, now instantiate the RoutePattern
	    return new RoutePattern({
	      pathPattern: matchPath && PathPattern.fromString(parts.path),
	      queryStringPattern: matchQueryString && QueryStringPattern.fromString(parts.queryString),
	      hashPattern: matchHash && PathPattern.fromString(parts.hash),
	      routeString: routeString
	    });
	  };
	
	  return RoutePattern;
	}());
	
	// CommonJS export
	module.exports = RoutePattern;
	
	// Also export the individual pattern classes
	RoutePattern.QueryStringPattern = QueryStringPattern;
	RoutePattern.PathPattern = PathPattern;
	RoutePattern.RegExpPattern = RegExpPattern;


/***/ },
/* 13 */
/***/ function(module, exports) {

	if( !Array.prototype.every ) {
	  Array.prototype.every = function(callbackfn, thisArg) {
	    var T, k;
	    
	    if (this == null) {
	      throw new TypeError('this is null or not defined');
	    }
	    
	    var O = Object(this);
	    var len = O.length >>> 0;
	    if (typeof callbackfn !== 'function') {
	      throw new TypeError();
	    }
	    if (arguments.length > 1) {
	      T = thisArg;
	    }
	    k = 0;
	    while (k < len) {
	      var kValue;
	      if (k in O) {
	        kValue = O[k];
	        var testResult = callbackfn.call(T, kValue, k, O);
	        if (!testResult) {
	          return false;
	        }
	      }
	      k++;
	    }
	    return true;
	  };
	}
	
	function EventObject(type, detail, target, cancelable) {
	  this.type = type;
	  this.detail = detail || {};
	  this.target = this.currentTarget = target;
	  this.cancelable = cancelable === true ? true : false;
	  this.defaultPrevented = false;
	  this.stopped = false;
	  this.timeStamp = new Date().getTime();
	}
	
	EventObject.prototype = {
	  preventDefault: function() {
	    if( this.cancelable ) this.defaultPrevented = true;
	  },
	  stopPropagation: function() {
	    this.stopped = true;
	  },
	  stopImmediatePropagation: function() {
	    this.stoppedImmediate = true;
	  }
	};
	
	EventObject.createEvent = function(type, detail, target, cancelable) {
	  return new EventObject(type, detail, target, cancelable);
	};
	
	
	module.exports = function(scope) {
	  var listeners = {}, paused = false, related = [];
	  
	  var on = function(type, fn) {
	    if( !type || typeof type !== 'string' ) return console.error('type must be a string');
	    if( typeof fn !== 'function' ) return console.error('listener must be a function');
	    
	    var types = type.split(' ');
	    types.forEach(function(type) {
	      listeners[type] = listeners[type] || [];
	      listeners[type].push(fn);
	    });
	    
	    return this;
	  };
	  
	  var once = function(type, fn) {
	    if( !type || typeof type !== 'string' ) return console.error('type must be a string');
	    if( typeof fn !== 'function' ) return console.error('listener must be a function');
	    
	    var types = type.split(' ');
	    types.forEach(function(type) {
	      if( !type ) return;
	      
	      var wrap = function(e) {
	        off(type, wrap);
	        return fn.call(this, e);
	      };
	      on(type, wrap);
	    });
	    
	    return this;
	  };
	  
	  var off = function(type, fn) {
	    if( !type || typeof type !== 'string' ) return console.error('type must be a string');
	    if( typeof fn !== 'function' ) return console.error('listener must be a function');
	    
	    var types = type.split(' ');
	    types.forEach(function(type) {
	      var fns = listeners[type];
	      if( fns ) for(var i;~(i = fns.indexOf(fn));) fns.splice(i, 1);
	    });
	    
	    return this;
	  };
	  
	  var has = function(type) {
	    if( typeof type === 'function' ) {
	      var found = false;
	      listeners.forEach(function(fn) {
	        if( found ) return;
	        if( fn === type ) found = true;
	      });
	      return found;
	    }
	    return listeners[type] && listeners[type].length ? true : false;
	  };
	  
	  var fire = function(type, detail, direction, includeself) {
	    if( paused ) return;
	    
	    var typename = (type && type.type) || type;
	    
	    var event;
	    if( typeof type === 'string' ) {
	      event = EventObject.createEvent(type, detail, scope);
	    } else if( type instanceof EventObject ) {
	      event = type;
	    } else {
	      return console.error('illegal arguments, type is must be a string or event', type);
	    }
	    event.currentTarget = scope;
	    
	    var stopped = false, stopRelated = false, prevented = false;
	    var action = function(listener) {
	      if( stopped ) return;
	      listener.call(scope, event);
	      if( event.defaultPrevented === true ) prevented = true;
	      if( event.stopped === true ) stopRelated = true;
	      if( event.stoppedImmediate === true ) stopped = true, stopRelated = true;
	    };
	    
	    if( !direction || includeself !== false ) {
	      (listeners['*'] || []).slice().reverse().forEach(action);
	      (listeners[event.type] || []).slice().reverse().forEach(action);
	    }
	    
	    if( direction && !stopRelated ) {
	      prevented = !related.every(function(node) {
	        if( !node.target.fire || (direction !== 'both' && node.direction !== direction) ) return true;
	        return node.target.fire(type, detail, direction);
	      });
	    }
	    
	    return !prevented;
	  };
	  
	  var destroy = function() {
	    listeners = null;
	    return this;
	  };
	  
	  var pause = function() {
	    paused = true;
	    return this;
	  };
	  
	  var resume = function() {
	    paused = false;
	    return this;
	  };
	  
	  var connect = function(target, direction) {
	    if( !target ) return console.warn('illegal argument: target cannot be null', target);
	    if( !~['up', 'down'].indexOf(direction) ) return console.warn('illegal argument: direction must be "up" or "down" but ', direction);
	    
	    related.push({
	      target: target,
	      direction: direction
	    });
	    
	    return this;
	  };
	  
	  var disconnect = function(target) {
	    if( !node ) return this;
	    
	    var fordelete = [];
	    related.forEach(function(node) {
	      if( node.target === target ) fordelete.push(node);
	    });
	    
	    fordelete.forEach(function(node) {
	      related.splice(related.indexOf(node), 1);
	    });
	    
	    return this;
	  };
	  
	  return {
	    on: on,
	    once: once,
	    off: off,
	    fire: fire,
	    has: has,
	    destroy: destroy,
	    pause: pause,
	    resume: resume,
	    connect: connect,
	    disconnect: disconnect
	  };
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function(name, alt) {
	  if( typeof document === 'object' && document.head ) {
	    var tag = document.head.querySelector('meta[name="xrouter.' + name + '"]');
	    return (tag && tag.getAttribute('content')) || alt || null;
	  }
	  
	  return alt || null;
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var meta = __webpack_require__(14);
	var debug = meta('debug') === 'true' ? true : false;
	var defmode = meta('mode');
	
	var apps = [];
	var instances = [];
	
	module.exports = {
	  connectors: {
	    pushstate: __webpack_require__(16),
	    hashbang: __webpack_require__(18)('!'),
	    hash: __webpack_require__(18)(),
	    auto: __webpack_require__(19)
	  },
	  href: function(href, body, options) {
	    var args = arguments;
	    apps.forEach(function(app) {
	      app.href.apply(app, args);
	    });
	    
	    return this;
	  },
	  instances: function() {
	    return apps.slice();
	  },
	  connect: function(app, options) {
	    if( !app ) return console.error('missing argument:app');
	    if( ~apps.indexOf(app) ) return console.error('already listening', app.id);
	    
	    options = options || {};
	    var mode = options.mode || defmode || 'auto';
	    
	    if( debug ) console.debug('[x-router] mode:', mode);
	    var Connector = this.connectors[mode];
	    if( !Connector ) {
	      console.warn('[x-router] unsupported mode: ', mode);
	      Connector = this.connectors['auto'];
	    }
	    
	    var connector = Connector(app);
	    apps.push(app);
	    instances.push(connector);
	    return connector;
	  },
	  disconnect: function(app) {
	    var pos = apps.indexOf(app);
	    if( ~pos ) apps.splice(pos, 1);
	    if( ~pos ) instances.splice(pos, 1);
	    return this;
	  }
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var URL = __webpack_require__(4);
	var domready = __webpack_require__(17);
	
	var stateseq = 0;
	function genstateseq(app) {
	  stateseq = stateseq + 1;
	  return app.id + ':' + stateseq;
	}
	
	function chref() {
	  return URL.parse(location.href).path;
	}
	
	module.exports = function(app) {
	  if( typeof history !== 'object' && !(history && history.pushState) ) return console.error('[x-router] browser does not support \'history.pushState\'');
	  
	  var staterefs = {}, laststateid, empty = {};
	  
	  var pathbar_popstate = function(e) {
	    //console.debug('pop', e.state, staterefs[e.state], chref());
	    if( !(e.state in staterefs) ) return;
	    var state = staterefs[e.state];
	    var body = state.body;
	    if( body === empty ) body = null;
	    
	    app.href(chref(), body, {pop:true});
	  };
	  
	  var pathbar_writestate = function(e) {
	    if( e.detail.pop ) return;
	  
	    if( e.detail.replace ) {
	      //delete staterefs[laststateid];
	      var stateid = laststateid = genstateseq(app);
	      staterefs[stateid] = e.detail.body || empty;
	      
	      //console.debug('replace', stateid, e.detail.href);
	      history.replaceState(stateid, null, e.detail.href);
	    } else {
	      var stateid = laststateid = genstateseq(app);
	      staterefs[stateid] = e.detail.body || empty;
	      
	      // TODO: 현재의 브라우저 경로와 같은 href 라면 replaceState 를 하는게 맞을지.
	      
	      //console.debug('push', stateid, e.detail.href);
	      history.pushState(stateid, null, e.detail.href);
	    }
	  };
	  
	  window.addEventListener('popstate', pathbar_popstate);
	  app.on('writestate', pathbar_writestate);
	  
	  domready(function() {
	    app.href(chref());
	  });
	  
	  return {
	    disconnect: function(app) {
	      document.removeEventListener('popstate', pathbar_popstate);
	      app.off('writestate', pathbar_writestate);
	    }
	  }
	};


/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = function(fn) {
	  if( document.body ) {
	    fn();
	  } else {
	    if( document.addEventListener ) {
	      document.addEventListener('DOMContentLoaded', function() {
	        window.setTimeout(fn, 1);
	      });
	    } else if( document.attachEvent ) {
	      document.attachEvent('onreadystatechange', function () {
	        if( document.readyState === 'complete' ) window.setTimeout(fn, 1);
	      });
	    }
	  }
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var domready = __webpack_require__(17);
	
	function chref(n) {
	  return location.hash.substring(n) || '/';
	}
	
	module.exports = function(prefix) {
	  prefix = '#' + (prefix || '');
	  var n = prefix.length;
	  
	  return function(app) {
	    var lasthref;
	    var hashchangelistener = function() {
	      var href = chref(n);
	      if( location.hash.startsWith(prefix + '/') && lasthref !== href ) app.href(href);
	    };
	  
	    if( window.addEventListener ) window.addEventListener('hashchange', hashchangelistener);
	    else window.attachEvent('hashchange', hashchangelistener);
	  
	    var writestatelistener = function(e) {
	      if( e.detail.pop ) return;
	      
	      var href = prefix + e.detail.href;
	      if( href === lasthref ) return;
	      
	      lasthref = e.detail.href;
	      if( e.detail.replace ) {
	        location.replace(href);
	      } else {
	        location.assign(href);
	      }
	    };
	  
	    app.on('writestate', writestatelistener);
	  
	    domready(function() {
	      if( location.hash.startsWith(prefix + '/') ) app.href(chref(n));
	      else app.href('/');
	    });
	  
	    return {
	      disconnect: function(app) {
	        if( window.addEventListener ) window.removeEventListener('hashchange', hashchangelistener);
	        else window.detachEvent('hashchange', hashchangelistener);
	        app.off('writestate', writestatelistener);
	      }
	    }
	  };
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(app) {
	  if( typeof history == 'object' && history && history.pushState )
	    return __webpack_require__(16)(app);
	  
	  return __webpack_require__(18)('!')(app);
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var path = __webpack_require__(2);
	var ajax = __webpack_require__(21);
	
	function DefaultRenderer(options, done) {
	  var target = options.target;
	  var src = options.src;
	  var html = options.html;
	  
	  var render = function(err, html) {
	    if( err ) return done(err);
	    if( typeof html === 'object' && html.html ) html = html.html;
	    if( typeof html !== 'string' ) return done(new Error('html must be a string'));
	    
	    target.innerHTML = html;
	    done();
	  };
	  
	  if( src ) ajax(src, render);
	  else if( html ) render(null, html);
	  else done(new Error('missing src or html'));
	};
	
	
	module.exports = function() {
	  var engines = {
	    default: DefaultRenderer
	  };
	  
	  this.engine = function(name, fn) {
	    if( arguments.length === 1 ) return engines[name];
	    engines[name] = fn;
	    return this;
	  };
	  
	  return function(request, response, next) {
	    var app = request.app;
	    response.render = function(src, options, odone) {
	      if( arguments.length == 2 && typeof options === 'function' ) odone = options, options = null;
	      
	      var done = function(err, result) {
	        if( err ) return odone ? odone.call(this, err) : console.error(err);
	        var oarg = [].slice.call(arguments, 1);
	        var arg = [null, target];
	        if( odone ) odone.apply(this, arg.concat(oarg));
	      };
	      
	      var o = {};
	      var engine;
	      
	      if( !src ) {
	        return done(new Error('missing src'));
	      } if( typeof src === 'string' ) {
	        var extname = path.extname(src).substring(1).toLowerCase();
	        var defenginename = response.config('view engine') || app.config('view engine') || 'default';
	        var enginename = (options && options.engine) || extname || defenginename;
	        var base = response.config('views') || app.config('views') || '/';
	        
	        engine = app.engine(enginename) || app.engine(defenginename);
	        if( !engine ) return done(new Error('not exists engine: ' + enginename));
	        
	        if( !(~src.indexOf('://') || src.indexOf('//') === 0) ) {
	          if( src[0] === '/' ) src = '.' + src;
	          o.src = path.join(base, src);
	        } else {
	          o.src = src;
	        }
	      } else if( typeof src === 'object' ) {
	        var defenginename = response.config('view engine') || app.config('view engine') || 'default';
	        var enginename = (options && options.engine) || (function() {
	          for(var k in src) {
	            if( app.engine(k) ) return k;
	          }
	        })();
	        
	        engine = app.engine(enginename) || app.engine(defenginename);
	        if( !engine ) return done(new Error('not exists engine: ' + enginename));
	        
	        o.html = src.html;
	      } else {
	        return done(new Error('illegal type of src: ' + typeof src));
	      }
	      
	      if( !options ) options = {};
	      if( typeof options === 'string' ) options = {target:options};
	      if( typeof options !== 'object' ) return done(new TypeError('options must be an object or string(target)'));
	      
	      for(var k in options) o[k] = options[k];
	      
	      var target = o.target || response.config('view target') || app.config('view target');
	      if( typeof target === 'string' ) target = document.querySelector(target);
	      if( !target ) return done(new Error('view target not found: ' + (o.target || response.config('view target') || app.config('view target'))));
	      o.target = target;
	      o.request = request;
	      o.response = response;
	      
	      if( app.fire('beforerender', {
	        href: request.href,
	        options: o,
	        src: src,
	        target: target,
	        url: request.url,
	        request: request,
	        response: response
	      }) ) {
	        setTimeout(function() {
	          engine.call(app, o, function(err) {
	            if( err ) return done(err);
	            
	            app.fire('render', {
	              href: request.href,
	              options: o,
	              src: src,
	              target: target,
	              url: request.url,
	              request: request,
	              response: response
	            });
	            
	            if( app.id ) target.setAttribute('data-xrouter-id', app.id + '');
	            target.xrouter = app;
	            
	            done.apply(this, arguments);
	            if( willbeend ) response.end();
	          });
	        }, 1);
	      }
	    
	      var willbeend = false;
	      return {
	        end: function() {
	          willbeend = true;
	        }
	      };
	    };
	    
	    response.render.html = function(html, options, done) {
	      if( typeof html !== 'string' ) return done && done(new Error('html must be a string'));
	      
	      html = {html: html};
	      return response.render.apply(this, arguments);
	    };
	    
	    next();
	  };
	};

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = function(src, done, options) {
	  if( !src ) throw new Error('missing src');
	  if( arguments.length == 2 && typeof done !== 'function' ) options = done, done = null;
	  if( typeof options == 'boolean' ) options = {sync:options};
	  
	  var text,
	    error,
	    sync = (options && options.sync) === true ? true : false,
	    method = (options && options.method) || 'GET';
	    scope = (options && options.scope) || this;
	  
	  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
	  xhr.open(method, src, !sync);
	  
	  if( options ) {
	    for(var k in options.headers) xhr.setRequestHeader(k, options.headers);
	    if( options.mimetype ) xhr.overrideMimeType(options.mimetype);
	  }
	  
	  xhr.onreadystatechange = function(e) {
	    if( this.readyState == 4 ) {
	      if( this.status == 0 || (this.status >= 200 && this.status < 300) ) {
	        text = this.responseText;
	        done && done.call(scope, null, text, xhr);
	      } else {
	        error = new Error('[' + this.status + '] ' + this.responseText);
	        done && done.call(scope, error, null, xhr);
	      }
	    }
	  };
	  
	  if( options && options.payload ) xhr.send(JSON.stringify(options.payload));
	  else xhr.send();
	  
	  if( error ) throw error;
	  return text;
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var path = __webpack_require__(2);
	
	module.exports = function() {
	  return function(request, response, next) {
	    response.redirect = function(href, body, options) {
	      response.end();
	      
	      options = options || {};
	      options.redirect = true;
	      body = body || request.body;
	      
	      if( href[0] !== '#' && href[0] !== '/' ) {
	        href = path.resolve(path.join(request.parentURL, request.url), href);
	      }
	      
	      request.app.fire('redirect', {
	        options: options,
	        body: body,
	        href: href,
	        request: request,
	        response: response
	      });
	      
	      request.app.href(href, body, options);
	      return this;
	    };
	    
	    next();
	  };
	};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var meta = __webpack_require__(14);
	var domready = __webpack_require__(17);
	var apps = __webpack_require__(1);
	var connector = __webpack_require__(15);
	var ieversion = __webpack_require__(24);
	
	var debug = meta('debug') === 'true' ? true : false;
	var ROUTE_SELECTOR = '*[route], *[data-route], *[routes], *[data-routes]';
	if( !document.head ) document.head = document.getElementsByTagName('head')[0];
	
	function isExternal(href) {
	  var p = href.indexOf(':'), s = href.indexOf('/');
	  return (~p && p < s) || href.indexOf('//') === 0 || href.toLowerCase().indexOf('javascript:') === 0;
	};
	
	function routify(a) {
	  if( !a.__xrouter_scan__ ) {
	    a.__xrouter_scan__ = true;
	    
	    a.onroute = null;
	    a.onrouteresponse = null;
	    a.onrouterequest = null;
	    
	    a.onclick = function(e) {
	      var name = a.getAttribute('data-route') || a.getAttribute('route') || a.getAttribute('data-routes') || a.getAttribute('routes');
	      var href = a.getAttribute('data-href') || a.getAttribute('href');
	      var ghost = a.getAttribute('data-ghost') || a.hasAttribute('ghost');
	      var replace = a.getAttribute('data-replace') || a.hasAttribute('replace');
	      
	      if( !href || isExternal(href) ) return;
	      if( !ieversion || ieversion > 8 ) e.preventDefault();
	      
	      var app = name ? apps.get(name, a) : apps.get(a);
	      
	      if( !app && name ) {
	        console.error('[x-router] not found: ' + name);
	      } else if( href ) {
	        (app || connector).href(href, {
	          srcElement: a
	        }, {
	          writestate: ghost ? false : true,
	          replace: replace
	        });
	      }
	      
	      return false;
	    };
	  }
	  return this;
	}
	
	function scan() {
	  [].forEach.call(document.querySelectorAll(ROUTE_SELECTOR), routify);
	  return this;
	}
	
	var observer;
	function bootup() {
	  scan();
	  
	  // observe anchor tags
	  if( meta('observe') !== 'false' ) {
	    if( window.MutationObserver ) {
	      if( observer ) observer.disconnect();
	      observer = new MutationObserver(function(mutations) {
	        mutations.forEach(function(mutation) {
	          [].forEach.call(mutation.addedNodes, function(node) {
	            if( node.nodeType === 1 ) {
	              if( node.hasAttribute('route') || node.hasAttribute('routes') ) routify(node);
	              if( node.hasAttribute('data-route') || node.hasAttribute('data-routes') ) routify(node);
	              if( node.querySelectorAll ) [].forEach.call(node.querySelectorAll(ROUTE_SELECTOR), routify);
	            }
	          });
	        });
	      });
	      
	      observer.observe(document.body, {
	        childList: true,
	        subtree: true
	      });
	    } else {
	      window.setInterval(scan, +meta('observe.delay') || 1000);
	    }
	  }
	}
	
	module.exports = {
	  start: function() {
	    domready(bootup);
	    return this;
	  },
	  scan: scan
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = (function() {
	  var nav = navigator.userAgent.toLowerCase();
	  return (nav.indexOf('msie') != -1) ? parseInt(nav.split('msie')[1]) : false;
	})();

/***/ }
/******/ ])
});
;
//# sourceMappingURL=x-router.js.map