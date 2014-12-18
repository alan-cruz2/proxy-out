var url = require('url');
var http = require('http');
var mocha = require('mocha');
var expect = require('chai').expect;

var proxyUrl = process.env.http_proxy;
var proxyParts = proxyUrl ? url.parse(proxyUrl) : {};

if(!proxyUrl || !proxyParts.hostname) {
  throw 'Your http_proxy environment variable is not set!';
}

var successCodes = [200, 301, 302];
describe('proxy-out', function() {
  describe('http.get', function() {
    it('should be able to connect to google via the supplied proxy (string)', function(done) {
      require('./proxy-out')(proxyUrl);
      http.get('http://google.com', function(res) {
        expect(successCodes).to.include(res.statusCode);
        done();
      });
    });

    it('should be able to connect to google via the supplied proxy (string with port)', function(done) {
      require('./proxy-out')(proxyUrl);
      http.get('http://google.com:80', function(res) {
        expect(successCodes).to.include(res.statusCode);
        done();
      });
    });

    it('should be able to connect to google via the supplied proxy (uri with host)', function(done) {
      require('./proxy-out')(proxyUrl);
      http.get({
        protocol: 'http:',
        host: 'google.com:80',
        path: ''
      }, function(res) {
        expect(successCodes).to.include(res.statusCode);
        done();
      });
    });

    it('should be able to connect to google via the supplied proxy (uri)', function(done) {
      require('./proxy-out')(proxyUrl);
      http.get({ 
        port: 80,
        protocol: 'http:',
        hostname: 'google.com',
        path: ''
      }, function(res) {
        expect(successCodes).to.include(res.statusCode);
        done();
      });
    });

    it('should be able to connect to google via the supplied proxy (object with uri)', function(done) {
      require('./proxy-out')(proxyUrl);
      http.get({ 
        uri: {
          port: 80,
          protocol: 'http:',
          hostname: 'google.com',
          path: ''
        }
      }, function(res) {
        expect(successCodes).to.include(res.statusCode);
        done();
      });
    });
  });
  describe('http.post', function() {
    it('should be able to post via the supplied proxy', function(done) {
      require('./proxy-out')(proxyUrl);
      var req = http.request({
        port: 80,
        method: 'POST',
        protocol: 'http:',
        hostname: 'google.com',
        path: ''
      }, function(res) {
        expect(res.req.method).to.eq('POST');
        done();
      });
      req.end();
    });
  });
});

