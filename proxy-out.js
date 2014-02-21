var http = require('http'),
    https = require('https'),
    url = require('url'),
    tunnel = require('tunnel');
 
var _httpsAgent, _httpAgent;

// Our export method simply sets our proxy information
module.exports = function(proxyUrl) {
    var parsed = url.parse(proxyUrl);

    var proxy = {
      port:     parsed.port     || 80,
      protocol: parsed.protocol || 'http:',
      host:     parsed.hostname
    };
    
    _httpTunnelingAgent  = tunnel.httpOverHttp({ proxy: proxy })
    _httpsTunnelingAgent = tunnel.httpsOverHttp({ proxy: proxy })
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

// Override HTTPS request method
var _httpsRequest = https.request;
https.request = function(options, callback) {
    // Parse destination URL
    if ('string' === typeof options) {
      options = _parseOptions(options);
    }

    options.agent = _httpsTunnelingAgent;
    return _httpsRequest(options, callback);
};

// Override HTTPS get method
https.get = function(options, callback) {
    var req = https.request(options, callback);
    req.end();
    return req;
};


// HTTP Requests are currently broken!
// ----------------------------------

/*
var _httpRequest = http.request;
http.request = function(options, callback) {
    // Parse destination URL
    if ('string' === typeof options) {
      options = _parseOptions(options);
    }

    // We don't want to interfere with CONNECT requests
    if (options && options.method !== 'CONNECT') {
      options.agent = _httpTunnelingAgent;
    }

    return _httpRequest(options, callback);
};

http.get = function(options, callback) {
    var req = http.request(options, callback);
    req.end();
    return req;
};
*/

