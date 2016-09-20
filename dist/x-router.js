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
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
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

	var path = __webpack_require__(1);
	var URL = __webpack_require__(3);
	var Router = __webpack_require__(9);
	
	if( !document.head ) document.head = document.getElementsByTagName('head')[0];
	var a = document.createElement('a');
	function normalize(url) {
	  if( typeof url !== 'string' ) throw new TypeError('illegal url');
	  
	  a.href = url || '';
	  var fullpath = a.href;
	  fullpath = fullpath.substring(fullpath.indexOf('://') + 3);
	  if( !~fullpath.indexOf('/') ) fullpath = '/';
	  else fullpath = fullpath.substring(fullpath.indexOf('/'));
	  
	  var pathname = fullpath;
	  pathname = ~pathname.indexOf('?') ? pathname.substring(0, pathname.indexOf('?')) : pathname;
	  pathname = ~pathname.indexOf('#') ? pathname.substring(0, pathname.indexOf('#')) : pathname;
	  
	  return {
	    href: a.href,
	    protocol: a.protocol,
	    hostname: a.hostname,
	    port: a.port,
	    pathname: pathname,
	    fullpath: pathname + (a.search ? a.search : '') + (a.hash ? a.hash : ''),
	    search: a.search,
	    hash: a.hash,
	    host: a.host
	  };
	}
	
	function meta(name, alt) {
	  var tag = document.head.querySelector('meta[name="xrouter.' + name + '"]');
	  return (tag && tag.getAttribute('content')) || alt;
	}
	
	function parseQuery(query) {
	  query = query.trim();
	  if( query[0] === '?' ) query = query.substring(1);
	  var match,
	      pl     = /\+/g,
	      search = /([^&=]+)=?([^&]*)/g,
	      decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); };
	      
	  var params = {};
	  while (match = search.exec(query)) {
	    var key = decode(match[1]);
	    var value = decode(match[2]);
	    if( Array.isArray(params[key]) ) params[key].push(value);
	    else if( params[key] ) (params[key] = [params[key]]).push(value);
	    else params[key] = value;
	  }
	  return params;
	}
	
	function addEventListener(scope, type, fn, bubble) { 
	  if( scope.addEventListener ) scope.addEventListener(type, fn, bubble);
	  else scope.attachEvent(type, fn); 
	}
	
	function capture(o) {
	  return JSON.parse(JSON.stringify(o));
	}
	
	var debug = meta('debug') === 'true' ? true : false;
	
	// class Application
	function Application(options) {
	  var baseURL = '',
	    router = Router('root'),
	    hashrouter,
	    request,
	    response,
	    session = {},
	    engines = {},
	    timeout,
	    config = {},
	    referer,
	    laststate,
	    lasthref;
	  
	  Application.apps.push(router);
	  
	  options = options || {};
	  router.debug = 'debug' in options ? options.debug : debug;
	  
	  setTimeout(function() {
	    if( options.baseURL ) router.base(options.baseURL);
	    if( options.timeout ) router.timeout(options.timeout);
	  }, 0);
	  
	  router.timeout = function(msec) {
	    if( typeof msec !== 'number' ) return console.warn('illegal timeout ' + msec);
	    timeout = msec;
	  };
	  
	  router.base = function(url) {
	    if( !arguments.length ) return baseURL;
	    if( !url ) {
	      baseURL = '';
	      return this;
	    }
	    baseURL = path.dirname(path.resolve(url, 'index.html'));
	    return this;
	  };
	  
	  var _get = router.get;
	  router.get = function(key) {
	    if( arguments.length <= 1 ) return config[key];
	    return _get.apply(router, arguments);
	  };
	  
	  router.set = function(key, value) {
	    config[key] = value;
	    if( key === 'debug' ) router.debug = value;
	    return this;
	  };
	  
	  router.router = function(name) {
	    return Router(name);
	  };
	  
	  var container = document.createElement('div');
	  router.util = {
	    evalhtml: function(html) {
	      container.innerHTML = html;
	      var children = [].slice.call(container.childNodes);
	      container.innerHTML = '';
	      return children;
	    },
	    ajax: function(src, done) {
	      if( !src ) throw new Error('missing src');
	      var text, error;
	      var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
	      xhr.open('GET', src, true);
	      xhr.onreadystatechange = function(e) {
	        if( this.readyState == 4 ) {
	          if( this.status == 0 || (this.status >= 200 && this.status < 300) ) done.call(router, null, this.responseText);
	          else done.call(router, new Error('[' + this.status + '] ' + this.responseText));
	        }
	      };
	      xhr.send();
	    }
	  };
	  
	  router.fullhref = function(url) {
	    if( !url ) return baseURL || '/';
	    
	    url = url.trim();
	    if( url[0] === '/' ) {
	      url = baseURL + url;
	    } else {
	      if( !laststate ) url = baseURL + '/' + url;
	      else url = baseURL + '/' + path.dirname(laststate) + '/' + url;
	    }
	    
	    return normalize(url.split('//').join('/')).fullpath;
	  };
	  
	  router.engine = function(name, fn) {
	    if( arguments.length === 1 ) return engines[name] || Application.engine(name);
	    engines[name] = fn;
	    return this;
	  };
	  
	  /*router.replace = function(href, body) {
	    var parsed = normalize(router.fullhref(href || ''));
	    var url = parsed.pathname;
	    if( url.indexOf(baseURL) !== 0 )
	      return console.error('given href \'' + url + '\' is not a sub url of base url \'' + baseURL + '\'');
	    
	    url = url.substring(baseURL.length);
	    laststate = parsed.fullpath;
	    router.fire('replace', {
	      href: parsed.fullpath,
	      url: url,
	      body: body
	    });
	    return this;
	  };*/
	    
	  router.on('replace', function(e) {
	    if( router.debug ) console.info('replaced', e.detail);
	    laststate = e.detail.replaced;
	  });
	  
	  router.href = function(originalhref, body, options) {
	    if( !arguments.length ) return lasthref;
	    if( typeof body === 'boolean' ) options = {writestate:body}, body = null;
	    if( typeof options === 'boolean' ) options = {writestate:options};
	    if( !options || typeof options !== 'object' ) options = {};
	    if( options.ghost === true ) options.writestate = true;
	    
	    var fullhref = router.fullhref(originalhref);
	    var href = fullhref.substring(baseURL.length) || '/';
	    var parsed = normalize(href || '');
	    var url = parsed.pathname;
	    var force = options.force === true ? true : false;
	    
	    if( router.debug ) console.info('href', originalhref, {
	      fullhref: fullhref,
	      href: href,
	      url: url,
	      laststate: laststate,
	      lasthref: lasthref
	    });
	    
	    //console.log('href', arguments[0], url););
	    if( !href ) force = true;
	    if( !force && lasthref === parsed.fullpath ) return;
	    
	    referer = lasthref;
	    lasthref = parsed.fullpath;
	    if( options.writestate !== false ) laststate = parsed.fullpath;
	    
	    if( router.debug ) console.log('request', parsed.fullpath);
	    
	    hashrouter = Router('hash');
	    request = router.request = {
	      app: router,
	      originalhref: originalhref,
	      fullhref: fullhref,
	      href: parsed.fullpath,
	      parsed: parsed,
	      baseURL: baseURL,
	      referer: referer,
	      method: 'get',
	      url: url || '/',
	      options: options,
	      hashname: parsed.hash,
	      query: parseQuery(parsed.search),
	      params: {},
	      body: body || {},
	      session: session
	    };
	    
	    //console.log('req', capture(request));
	    
	    var finished = false;
	    response = router.response = {
	      render: function render(src, options, odone) {
	        if( arguments.length == 2 && typeof options === 'function' ) odone = options, options = null;
	        var done = function(err, result) {
	          if( err ) return odone ? odone.call(this, err) : console.error(err);
	          var oarg = [].slice.call(arguments, 1);
	          var arg = [null, target];
	          if( odone ) odone.apply(this, arg.concat(oarg));
	        };
	        
	        if( !options ) options = {};
	        if( typeof options === 'string' ) options = {target:options};
	        if( typeof options !== 'object' ) return done(new TypeError('options must be an object or string(target)'));
	        
	        var o = {};
	        for(var k in options) o[k] = options[k];
	        
	        var target = o.target || config['view target'];
	        if( typeof target === 'string' ) target = document.querySelector(target);
	        if( !target ) return done(new Error('target not found: ' + (target || config['view target'])));
	        o.target = target;
	        
	        var extname = (typeof src === 'string') ? path.extname(src).substring(1).toLowerCase() : '';
	        var defenginename = config['view engine'] || 'default';
	        var enginename = extname || defenginename;
	        var engine = router.engine(enginename) || router.engine(defenginename);
	        var base = config['views'] || '/';
	        
	        if( !engine ) return done(new Error('not exists engine: ' + enginename));
	        if( typeof src === 'string' && !(~src.indexOf('://') || src.indexOf('//') == 0) ) {
	          if( src.trim()[0] === '/' ) src = '.' + src;
	          src = URL.resolve(base, src);
	        }
	        
	        if( router.fire('beforerender', {
	          fullhref: fullhref,
	          href: parsed.fullpath,
	          options: o,
	          src: src,
	          target: target,
	          url: request.currentURL,
	          request: request,
	          response: response
	        }) ) {
	          engine.call(router, src, o, function(err) {
	            if( err ) return done(err);
	            
	            router.fire('render', {
	              fullhref: fullhref,
	              href: parsed.fullpath,
	              options: o,
	              src: src,
	              target: target,
	              url: request.currentURL,
	              request: request,
	              response: response
	            });
	            
	            done.apply(this, arguments);
	          });
	        }
	        
	        return this;
	      },
	      redirect: function(to, body, options) {
	        response.end();
	        options = options || {};
	        options.redirect = true;
	        body = body || request.body || {};
	        
	        if( to[0] !== '#' && to[0] !== '/' ) {
	          to = path.resolve(path.join(request.parentURL, request.url), to);
	        }
	        
	        router.fire('redirect', {
	          fullhref: fullhref,
	          href: parsed.fullpath,
	          options: options,
	          referer: laststate,
	          url: request.currentURL,
	          to: to,
	          requested: arguments[0],
	          request: request,
	          response: response
	        });
	        
	        router.href(to, body, options);
	        return this;
	      },
	      hash: function(hash, fn) {
	        hashrouter.get('#' + hash, fn);
	        return this;
	      },
	      exechash: function(hash, done) {
	        router.exechash(req.hash, done);
	        return this;
	      },
	      end: function(exechash) {
	        if( finished ) return console.warn('[x-router] request \'' + request.href + '\' already finished.');
	        finished = true;
	        
	        //router.exechash(req.hash, fire);
	        
	        router.fire('end', {
	          fullhref: fullhref,
	          href: parsed.fullpath,
	          url: request.currentURL,
	          request: request,
	          response: response
	        });
	      }
	    };
	    
	    if( timeout > 0 ) {
	      setTimeout(function() {
	        if( finished ) return;
	        console.warn('[x-router] router timeout(' + timeout + ')');
	        response.end();
	      }, timeout);
	    }
	    
	    router.fire('request', {
	      fullhref: fullhref,
	      href: parsed.fullpath,
	      url: url,
	      request: request,
	      response: response
	    });
	    
	    if( options.writestate !== false && options.replacestate !== true && options.redirect !== true ) {
	      referer = parsed.fullpath;
	    }
	    
	    router(request, response);
	    return this;
	  };
	  
	  router.on('*', function wrapapp(e) {
	    e.app = router;
	    if( !e.stopped ) Application.fire(e);
	  });
	  
	  return router;
	};
	
	// initialize context feature
	(function() {
	  var currentapp, apps = [], listeners = {}, engines = {};
	  
	  var current = function(app) {
	    if( !arguments.length ) return currentapp || apps[0];
	    if( !~apps.indexOf(app) ) return console.error('[x-router] not defined app', app);
	    currentapp = app;
	    return this;
	  };
	  
	  var href = function() {
	    var app = current();
	    if( !app ) return console.warn('[x-router] not yet initialized');
	    app.href.apply(currentapp, arguments);
	  };
	  
	  var on = function(type, fn) {
	    listeners[type] = listeners[type] || [];
	    listeners[type].push(fn);
	    return this;
	  };
	  
	  var once = function(type, fn) {
	    var wrap = function(e) {
	      off(type, wrap);
	      return fn.call(Application, e);
	    };
	    on(type, wrap);
	    return this;
	  };
	  
	  var off = function(type, fn) {
	    var fns = listeners[type];
	    if( fns )
	      for(var i;~(i = fns.indexOf(fn));) fns.splice(i, 1);
	    
	    return this;
	  };
	
	  var fire = function(event) {
	    if( !listeners[event.type] ) return;
	    
	    var stopped = false, prevented = false;
	    var action = function(listener) {
	      if( stopped ) return;
	      listener.call(this, event);
	      if( event.defaultPrevented === true ) prevented = true;
	      if( event.stoppedImmediate === true ) stopped = true;
	    };
	    
	    listeners[event.type].forEach(action);
	    return !prevented;
	  };
	  
	  var engine = function(name, fn) {
	    if( arguments.length === 1 ) return engines[name];
	    engines[name] = fn;
	    return this;
	  };
	  
	  Application.apps = apps;
	  Application.Router = Router;
	  Application.current = current;
	  Application.href = href;
	  Application.engine = engine;
	  Application.on = on;
	  Application.once = once;
	  Application.off = off;
	  Application.fire = fire;
	  
	  // @deprecated
	  //Application.router = Router;
	})();
	
	// add default rendering engine
	Application.engine('default', function defaultRenderer(src, options, done) {
	  var target = options.target;
	  var render = function(err, contents) {
	    if( err ) return done(err);
	    if( typeof contents === 'string' ) contents = this.util.evalhtml(contents);
	    else if( typeof contents !== 'object' ) return done(new TypeError('invalid type of src:' + typeof contents));
	    else if( typeof contents.length !== 'number' ) contents = [contents];
	    
	    target.innerHTML = '';
	    [].forEach.call(contents, function(node) {
	      target.appendChild(node);
	    });
	    done();
	  };
	  
	  if( typeof src === 'string' ) this.util.ajax(src, render);
	  else render(null, src);
	});
	
	module.exports = Application;
	
	// instantiate main routes && trigger
	(function() {
	  var mode = meta('mode') || (history.pushState ? 'pushstate' : 'hash');
	  
	  if( !~['pushstate', 'hash', 'none', 'auto'].indexOf(mode) ) {
	    console.warn('[x-router] unsupported mode: ' + mode);
	    mode = history.pushState ? 'pushstate' : 'hash';
	  } else if( mode === 'auto' ) {
	    mode = history.pushState ? 'pushstate' : 'hash';
	  } else if( mode === 'pushstate' && !history.pushState ) {
	    console.warn('[x-router] browser does not support `history.pushState`');
	    mode = 'hash';
	  }
	  
	  if( debug ) console.info('xrouter.mode', meta('mode'), mode);
	  
	  var app = function() {
	    return Application.current();
	  };
	  
	  var validatelocation = function(href) {
	    if( !href ) return console.error('validatelocation: missing href');
	    var base = app().base() || '';
	    href = normalize(href).fullpath;
	    if( !href.indexOf(base) ) return href.substring(base.length);
	    return href;
	  }
	  
	  if( mode === 'pushstate' ) {
	    if( !history.pushState ) return console.error('[x-router] browser does not support \'history.pushState\'');
	    
	    var pushState = history.pushState;
	    var replaceState = history.replaceState;
	    
	    history.pushState = function(state, title, href) {
	      pushState.apply(history, arguments);
	      Application.href(validatelocation(location.href), state);
	    };
	    
	    history.replaceState = function(state, title, href) {
	      replaceState.apply(history, arguments);
	      Application.href(validatelocation(location.href), state, {
	        replacestate: true
	      });
	    };
	    
	    window.onpopstate = function(e) {
	      Application.href(validatelocation(location.href), e.state, {pop:true});
	    };
	    
	    var push = function(href, body) {
	      pushState.call(history, body, null, href);
	    };
	    
	    var replace = function(href, body) {
	      replaceState.call(history, body, null, href);
	    };
	    
	    Application.on('replace', function(e) {
	      if( app() !== e.app ) return;
	      var href = path.join(e.app.base(), e.detail.replaced);
	      replace(href, e.detail.request.body);
	    });
	    
	    Application.on('request', function(e) {
	      if( app() !== e.app ) return;
	      var href = e.detail.fullhref;
	      var body = e.detail.request.body;
	      var o = e.detail.request.options;
	      if( o.pop || o.writestate === false ) return;
	      if( o.replacestate || o.redirect ) replace(href, body);
	      else push(href, body);
	    });
	  } else if( mode === 'hash' ) {
	    var lasturl;
	    addEventListener(window, 'hashchange', function() {
	      var url = location.hash.substring(1);
	      if( url === lasturl ) return;
	      if( url ) Application.href(location.hash.substring(1));
	    });
	    
	    var replace = function(url, body) {
	      lasturl = url;
	      location.replace('#' + url);
	    };
	    
	    var push = function(url, body) {
	      lasturl = url;
	      location.assign('#' + url);
	    };
	    
	    Application.on('replace', function(e) {
	      if( app() !== e.app ) return;
	      var href = path.join(e.app.base(), e.detail.replaced);
	      replace(href, e.detail.request.body);
	    });
	    
	    Application.on('request', function(e) {
	      if( app() !== e.app ) return;
	      var url = e.detail.fullhref;
	      var body = e.detail.request.body;
	      var o = e.detail.request.options;
	      if( o.pop || o.writestate === false ) return;
	      if( o.replacestate || o.redirect ) replace(url, body);
	      else push(url, body);
	    });
	  }
	  
	  var ie = (function(){
	    var undef,
	        v = 3,
	        div = document.createElement('div'),
	        all = div.getElementsByTagName('i');
	        
	    while(div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',all[0]);
	    return v > 4 ? v : undef;
	  }());
	  
	  var observer;
	  function bootup() {
	    function routify(a) {
	      if( !a.__xrouter__ ) {
	        a.__xrouter__ = true;
	        
	        a.onroute = null;
	        a.onrouteresponse = null;
	        a.onrouterequest = null;
	        
	        if( ie <= 8 ) {
	          a.onclick = function(e) {
	            var ghost = a.hasAttribute('data-ghost') || a.hasAttribute('ghost');
	            var href = a.getAttribute('data-href') || a.getAttribute('href');
	            var p = href.indexOf(':'), s = href.indexOf('/');
	            
	            if( !href || (~p && p < s) ) return;
	            
	            Application.href(href, null, {
	              writestate: ghost ? false : true
	            });
	            
	            return false;
	          };
	        } else {
	          a.onclick = function(e) {
	            var ghost = a.hasAttribute('data-ghost') || a.hasAttribute('ghost');
	            var href = a.getAttribute('data-href') || a.getAttribute('href');
	            var p = href.indexOf(':'), s = href.indexOf('/');
	            
	            if( !href || (~p && p < s) ) return;
	            e.preventDefault();
	            
	            Application.href(href, null, {
	              writestate: ghost ? false : true
	            });
	          };
	        } 
	      }
	      return this;
	    }
	    
	    var routeselector = '*[route], *[data-route], *[routes], *[data-routes]';
	    function scan() {
	      [].forEach.call(document.querySelectorAll(routeselector), routify);
	      return this;
	    }
	    
	    scan();
	    
	    if( mode === 'hash' ) Application.href(validatelocation(location.hash.substring(1)));
	    else if( mode === 'pushstate') Application.href(validatelocation(location.href));
	    // mode 가 none 인 경우, 직접 call 하는 걸로..
	    
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
	                if( node.querySelectorAll ) [].forEach.call(node.querySelectorAll(routeselector), routify);
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
	  
	  if( document.body ) bootup();
	  else {
	    if( document.addEventListener ) {
	      document.addEventListener('DOMContentLoaded', function() {
	        window.setTimeout(bootup,1);
	      });
	    } else if( document.attachEvent ) {
	      document.attachEvent('onreadystatechange', function () {
	        if( document.readyState === 'complete' ) window.setTimeout(bootup,1);
	      });
	    }
	  };
	  
	  /* will be @deprecated : xrouter.href(...) */
	  window.route = function() {
	    console.warn('[x-router] window.route() is deprecated(will be removed in 0.4.x), use window.xrouter.href()');
	    var current = app();
	    current.href.apply(current, arguments);
	  };
	  
	  window.xrouter = Application;
	})();
	


/***/ },
/* 1 */
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 2 */
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
/* 3 */
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
	
	var punycode = __webpack_require__(4);
	
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
	    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
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
	    querystring = __webpack_require__(6);
	
	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && isObject(url) && url instanceof Url) return url;
	
	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}
	
	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  if (!isString(url)) {
	    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
	  }
	
	  var rest = url;
	
	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();
	
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
	      // IDNA Support: Returns a puny coded representation of "domain".
	      // It only converts the part of the domain name that
	      // has non ASCII characters. I.e. it dosent matter if
	      // you call it with a domain that already is in ASCII.
	      var domainArray = this.hostname.split('.');
	      var newOut = [];
	      for (var i = 0; i < domainArray.length; ++i) {
	        var s = domainArray[i];
	        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
	            'xn--' + punycode.encode(s) : s);
	      }
	      this.hostname = newOut.join('.');
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
	  if (isString(obj)) obj = urlParse(obj);
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
	      isObject(this.query) &&
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
	  if (isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }
	
	  var result = new Url();
	  Object.keys(this).forEach(function(k) {
	    result[k] = this[k];
	  }, this);
	
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
	    Object.keys(relative).forEach(function(k) {
	      if (k !== 'protocol')
	        result[k] = relative[k];
	    });
	
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
	      Object.keys(relative).forEach(function(k) {
	        result[k] = relative[k];
	      });
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
	  } else if (!isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especialy happens in cases like
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
	    if (!isNull(result.pathname) || !isNull(result.search)) {
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
	      (result.host || relative.host) && (last === '.' || last === '..') ||
	      last === '');
	
	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last == '.') {
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
	    //this especialy happens in cases like
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
	  if (!isNull(result.pathname) || !isNull(result.search)) {
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
	
	function isString(arg) {
	  return typeof arg === "string";
	}
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	
	function isNull(arg) {
	  return arg === null;
	}
	function isNullOrUndefined(arg) {
	  return  arg == null;
	}


/***/ },
/* 4 */
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)(module), (function() { return this; }())))

/***/ },
/* 5 */
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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.decode = exports.parse = __webpack_require__(7);
	exports.encode = exports.stringify = __webpack_require__(8);


/***/ },
/* 7 */
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
/* 8 */
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var path = __webpack_require__(1);
	var RoutePattern = __webpack_require__(10);
	var EventObject = __webpack_require__(11);
	
	function endsWith(str, word) {
	  var i = str.toLowerCase().indexOf(word);
	  return i > 0 && i === str.length - word.length;
	}
	
	function patternize(source, ignoresubdir) {
	  var pettern = RoutePattern.fromString(source);
	  var ap = RoutePattern.fromString(source + '/*after');
	  
	  return {
	    match: function(url) {
	      if( source === '/' ) return ignoresubdir ? true : (source === url);
	      
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
	  if( endsWith(axis, '/') ) axis = axis.substring(0, axis.length - 1);
	  if( endsWith(full, '/') ) full = full.substring(0, full.length - 1);
	  if( !axis ) return {
	    sub: '/' + full,
	    parent: '/'
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
	
	
	var routermark = {};
	function Router(id) {
	  id = id || (Math.random() + '') || 'unknwon';
	  var boot = true;
	  var routes = [];
	  var listeners = {};
	  var error;
	  
	  var body = function Router(req, res, onext) {
	    if( !req.url || req.url[0] !== '/' ) return console.error('illegal state: url not defined in request: ', req.url);
	    error = null;
	    onext = onext || function() {};
	    req.app = req.app || body;
	    
	    var oParentURL = req.parentURL || '';
	    var oURL = req.url;
	    var oParams = req.params || {};
	    var i = 0, finished = false;
	    
	    var next = function(err) {
	      if( finished ) return console.error('next function twice called.', id, err);
	      finished = true;
	      
	      req.url = oURL;
	      req.parentURL = oParentURL;
	      req.params = oParams;
	      boot = false;
	      
	      if( err ) {
	        body.fire('error', {
	          router: body,
	          href: req.href,
	          url: req.currentURL,
	          request: req,
	          response: res,
	          error: err
	        });
	        
	        return onext(err);
	      }
	      
	      body.fire('notfound', {
	        router: body,
	        href: req.href,
	        url: req.currentURL,
	        request: req,
	        response: res
	      });
	      
	      onext();
	    };
	    
	    var forward = function(err) {
	      if( err ) return next(err);
	      
	      var route = routes[i++];
	      if( !route ) return next();
	      if( !boot && route.type === 'boot' ) return forward();
	      //console.log(route, boot, route.pattern, route.pattern.match(req.url));
	      
	      var params = route.pattern && route.pattern.match(req.url);
	      if( !params ) return forward();
	      req.params = mix(oParams, params);
	      
	      var fn = route.fn;
	      var routepath = route.path;
	      var type = route.type;
	      
	      if( typeof fn == 'string' ) {
	        fn = fn.trim();
	        if( !fn.indexOf('/') || !fn.indexOf('..') ) {
	          return res.redirect && res.redirect(path.resolve(req.parentURL, fn));
	        } else {
	          var ohref = req.href || '';
	          var acc = ohref;
	          acc = ~acc.indexOf('?') ? acc.substring(0, acc.indexOf('?')) : acc;
	          acc = ~acc.indexOf('#') ? acc.substring(0, acc.indexOf('#')) : acc;
	          acc = ~acc.indexOf('&') ? acc.substring(0, acc.indexOf('&')) : acc;
	          acc = ohref.substring(acc.length);
	          
	          req.url = oURL = '/' + fn.split('./').join('');
	          req.href = path.join(req.parentURL, req.url) + acc;
	          body.fire('replace', {
	            previous: ohref,
	            replaced: req.href,
	            request: req,
	            response: res
	          });
	          return forward();
	        }
	      }
	      
	      var parentURL = req.parentURL = oParentURL;
	      var url = req.url = oURL;
	      var div = dividepath(routepath, url);
	      var currentURL = path.join(oParentURL, div.parent);
	      
	      req.boot = boot;
	      req.currentURL = currentURL;
	      
	      if( fn.__router__ ) {
	        url = req.url = div.sub;
	        parentURL = req.parentURL = currentURL;
	      }
	      
	      body.fire('route', {
	        routetype: type,
	        config: route,
	        url: currentURL,
	        href: req.href,
	        fn: fn,
	        params: params,
	        boot: boot,
	        request: req,
	        response: res
	      });
	      
	      route.fn.apply(body, [req, res, forward]);
	    };
	    forward();
	  };
	  
	  body.id = id;
	  body.__router__ = routermark;
	  
	  var adaptchild = function(fn) {
	    if( fn.__router__ === routermark ) {
	      fn.parent = body;
	    }
	    return fn;
	  };
	  
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
	  
	  body.use = function(path, fn) {
	    if( typeof path === 'function' ) fn = path, path = '/';
	    if( typeof path !== 'string' ) throw new TypeError('illegal type of path:' + typeof(path));
	    
	    routes.push({
	      type: 'use',
	      path: path || '/',
	      pattern: patternize(path, true),
	      fn: adaptchild(fn)
	    });
	    return this;
	  };
	  
	  body.get = function(path, fn) {
	    if( typeof path === 'function' ) fn = path, path = '/';
	    if( typeof path !== 'string' ) throw new TypeError('illegal type of path:' + typeof(path));
	    
	    routes.push({
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
	    
	    routes.push({
	      type: 'boot',
	      path: path || '/',
	      pattern: patternize(path, true),
	      fn: adaptchild(fn)
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
	  
	  body.drop = function(fn) {
	    var dropfns = [];
	    routes.forEach(function(route) {
	      if( route.fn === fn ) dropfns.push(route);
	    });
	    
	    dropfns.forEach(function(route) {
	      routes.splice(routes.indexOf(route), 1);
	    });
	    return this;
	  };
	  
	  body.clear = function() {
	    routes = [];
	    return this;
	  };
	  
	  body.on = function(type, fn) {
	    listeners[type] = listeners[type] || [];
	    listeners[type].push(fn);
	    
	    return this;
	  };
	  
	  body.once = function(type, fn) {
	    var wrap = function(e) {
	      body.off(type, wrap);
	      return fn.call(this, e);
	    };
	    body.on(type, wrap);
	    return this;
	  };
	  
	  body.off = function(type, fn) {
	    var fns = listeners[type];
	    if( fns )
	      for(var i;~(i = fns.indexOf(fn));) fns.splice(i, 1);
	    
	    return this;
	  };
	  
	  body.fire = function(type, detail) {
	    var typename = (type && type.type) || type;
	    if( !listeners[typename] && !listeners['*'] && !(~['route', 'replace'].indexOf(typename) && body.parent) ) return;
	    
	    var event;
	    if( typeof type === 'string' ) {
	      event = EventObject.createEvent(type, detail, body);
	    } else if( type instanceof EventObject ) {
	      event = type;
	    } else {
	      return console.error('illegal arguments, type is must be a string or event', type);
	    }
	    event.currentTarget = body;
	    
	    var stopped = false, prevented = false;
	    var action = function(listener, scope) {
	      if( stopped ) return;
	      listener.call(scope, event);
	      if( event.defaultPrevented === true ) prevented = true;
	      if( event.stoppedImmediate === true ) stopped = true;
	    };
	    
	    (listeners['*'] || []).forEach(action, body);
	    (listeners[event.type] || []).forEach(action, body);
	    
	    if( ~['route', 'replace'].indexOf(event.type) && body.parent ) {
	      body.parent.fire(event);
	    }
	    
	    return !prevented;
	  };
	  
	  body.hasListener = function(type) {
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var querystring = __webpack_require__(6);
	
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
/* 11 */
/***/ function(module, exports) {

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
	
	module.exports = EventObject;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=x-router.js.map