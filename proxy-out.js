var http = require('http'),
    https = require('https'),
    url = require('url');
 
var _request = http.request;
var _proxy = {
  port: 80,
  protocol: 'http:' 
};

http.request = https.request = function (options, callback) {
    // Parse destination URL
    if ('string' === typeof options) {
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
    }

    // Apply our proxy settings
    options = {
      path:     options.protocol + '//' + options.host + ':' + options.port + options.path,
      host:     _proxy.hostname,
      port:     _proxy.port,
      protocol: _proxy.protocol,
      hostname: _proxy.hostname
    };

    // Call the original request
    return _request(options, callback);
};

http.get = https.get = function(options, callback) {
  var req = http.request(options, callback);
  req.end();
  return req;
};

module.exports = function(proxyUrl) {
    var parsed = url.parse(proxyUrl);

    _proxy = {
      port:     parsed.port     || _proxy.port,
      protocol: parsed.protocol || _proxy.protocol,
      hostname: parsed.hostname
    };
};

