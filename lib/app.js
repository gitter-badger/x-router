var path = require('path');
var URL = require('url');
var querystring = require('querystring');
var Router = require('tinyrouter');
var meta = require('./meta.js');
var connector = require('./connector/');
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