var _ = require('underscore'),
    url = require('url'),
    http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy-agent'),
    httpsProxy = require('https-proxy-agent');

var _httpsAgent, _httpAgent, _proxy, _whitelist;

// Our export method simply sets our proxy information
module.exports = function(proxyUrl, whitelist) {
  _whitelist = whitelist || [];
  _whitelist = (typeof _whitelist === 'string') ? [_whitelist] : _whitelist;

  // Use http protocol if not specified
  if(!proxyUrl.match('://')) {
    proxyUrl = 'http://' + proxyUrl;
  }

  _httpAgent = httpProxy(proxyUrl);
  _httpsAgent = httpsProxy(proxyUrl);
};

// Helper function to parse a URL string into an options object
var _parseOptions = function(options) {
  var parsed = url.parse(options);

  options = {
    host:     parsed.host,
    hostname: parsed.hostname,
    path:     parsed.path,
    port:     parsed.port     || 80,
    protocol: parsed.protocol || 'http:'
  };

  if(options.protocol === 'https:' && !parsed.port) {
    options.port = 443;
  }
  return options;
};

// Override HTTP request method
var _httpRequest = http.request;
http.request = function(options, callback) {
  // Parse destination URL
  if ('string' === typeof options) {
    options = _parseOptions(options);
  }

  // If there is no supplied protocol, pull from uri or default to 'https:'
  if(!options.protocol) {
    _.extend(options, options.uri);
    options.protocol = options.protocol || 'http:';
  }

  // If no hostname is provided get it from host
  !options.hostname && (options.hostname = options.host.substring(0, options.host.indexOf(':')));

  if(options.agent){
    return _httpRequest(options, callback);
  } else if(_whitelist.indexOf(options.hostname) < 0){
    options.agent = _httpAgent;
    return _httpRequest(options, callback);
  }
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

  // If there is no supplied protocol, pull from uri or default to 'https:'
  if(!options.protocol) {
    _.extend(options, options.uri);
    options.protocol = options.protocol || 'https:';
  }

  if(_whitelist.indexOf(options.hostname) < 0) {
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
