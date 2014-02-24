var url = require('url'),
    http = require('http'),
    https = require('https'),
    tunnel = require('tunnel');

var COLON_SLASHES = '://';
var DEFAULT_PROTOCOL = 'http';
var SECURE_PROTOCOL = 'https';

var _httpsAgent, _proxy;

// Our export method simply sets our proxy information
module.exports = function(proxyUrl) {
  // Use http protocol if not specified
  if(!proxyUrl.match(COLON_SLASHES)) {
    proxyUrl = DEFAULT_PROTOCOL + COLON_SLASHES + proxyUrl;
  }

  var parsed = url.parse(proxyUrl);
  _proxy = {
    port:     parsed.port     || 80,
    protocol: parsed.protocol || DEFAULT_PROTOCOL,
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
    protocol: parsed.protocol || DEFAULT_PROTOCOL
  };

  if(options.protocol === SECURE_PROTOCOL && !parsed.port) {
    options.port = 443;
  }

  return options;
};

// Helper function to apply proxy settings to an options object
var _proxifyOptions = function(options) {
  return {
    path:     options.protocol + COLON_SLASHES + options.host + options.path,
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

  // We don't want to interfere with CONNECT requests
  if (options && options.method !== 'CONNECT') {
    options = _proxifyOptions(options);
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

  options.agent = _httpsAgent;
  return _httpsRequest(options, callback);
};

// Override HTTPS get method
https.get = function(options, callback) {
  var req = https.request(options, callback);
  req.end();
  return req;
};

