var _ = require('underscore'),
    url = require('url'),
    http = require('http'),
    https = require('https'),
    tunnel = require('tunnel');
 
var _httpsAgent, _proxy, _whitelist;

// Our export method simply sets our proxy information
module.exports = function(proxyUrl, whitelist) {
  _whitelist = whitelist || [];
  _whitelist = (typeof _whitelist === 'string') ? [_whitelist] : _whitelist;

  // Use http protocol if not specified
  if(!proxyUrl.match('://')) {
    proxyUrl = 'http://' + proxyUrl;
  }

  var parsed = url.parse(proxyUrl);
  _proxy = {
    port:     parsed.port     || 80,
    protocol: parsed.protocol || 'http:',
    host:     parsed.hostname
  };
  
  _httpsAgent = tunnel.httpsOverHttp({ proxy: _proxy });
};

// Helper function to parse a URL string into an options object
var _parseOptions = function(options) {
  var parsed = url.parse(options);

  options = {
    host:     parsed.host,
    path:     parsed.path,
    port:     parsed.port     || 80,
    protocol: parsed.protocol || 'http:'
  };

  if(options.protocol === 'https:' && !parsed.port) {
    options.port = 443;
  } 

  return options;
};

// Helper function to apply proxy settings to an options object
var _proxifyOptions = function(options) {
  return {
    path:     options.protocol + '//' + options.host + options.path,
    host:     _proxy.host,
    port:     _proxy.port,
    protocol: _proxy.protocol
  };
};

// Override HTTP request method
var _httpRequest = http.request;
http.request = function(options, callback) {
  // Parse destination URL
  if ('string' === typeof options) {
    options = _parseOptions(options);
  }

  // If there is no supplied protocol, assume a URI option is being passed
  if(!options.protocol) {
    _.extend(options, options.uri);
  }

  if(_whitelist.indexOf(options.host) < 0) {
    // We don't want to interfere with CONNECT requests
    if (options && options.method !== 'CONNECT') {
      options = _proxifyOptions(options);
    }
  }

  return _httpRequest(options, callback);
};

// Override HTTPS get method
http.get = function(options, callback) {
  var req = http.request(options, callback);
  req.end();
  return req;
};

// Override HTTPS request method
var _httpsRequest = https.request;
https.request = function(options, callback) {
  // Parse destination URL
  if ('string' === typeof options) {
    options = _parseOptions(options);
  }

  // If there is no supplied protocol, assume a URI option is being passed
  if(!options.protocol) {
    _.extend(options, options.uri);
  }

  if(_whitelist.indexOf(options.host) < 0) {
    options.agent = _httpsAgent;
  }

  return _httpsRequest(options, callback);
};

// Override HTTPS get method
https.get = function(options, callback) {
  var req = https.request(options, callback);
  req.end();
  return req;
};

