var http = require('http'),
    https = require('https'),
    url = require('url');
 
var _request = http.request;
var _proxy = { host: '', port: 0 };

http.request = https.request = function (options, callback) {
    if ('string' === typeof options) {
      var parsed = url.parse(options);

      options = {
        host:     parsed.host,
        port:     parsed.port,
        path:     parsed.path,
        protocol: parsed.protocol
      };
    }

    // Apply our proxy settings
    options.path = options.pathname = options.protocol + '//' + options.host + options.path;
    options.host = _proxy.host;
    options.port = _proxy.port;

    // Call the original request
    return _request(options, callback);
};

http.get = https.get = function(options, callback) {
  var req = http.request(options, callback);
  req.end();
  return req;
};

module.exports = function (host, port) {
    _proxy = { host: host, port: port };
};

