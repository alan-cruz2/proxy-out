var url = require('url');
var http = require('http');
var mocha = require('mocha');
var expect = require('chai').expect;

var proxyUrl = process.env.http_proxy;
var proxyParts = proxyUrl ? url.parse(proxyUrl) : {};

if(!proxyUrl || !proxyParts.hostname) {
  throw 'Your http_proxy environment variable is not set!';
}

var headers;
describe('proxy-out', function() {
  describe('http.get', function() {
    it('should be able to connect to google via the supplied proxy', function(done) {
      require('./proxy-out')(proxyUrl);
      http.get('http://google.com', function(res) {
        headers = res.req._headers;
        done();
      });
    });

    it('should ensure host header use matches that passed to proxy-out on require', function(done) {
      expect(headers).to.exist;
      expect(headers.host).to.equal(proxyParts.hostname);
      done();
    });
  });
});

