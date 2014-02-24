var http = require('http');
var mocha = require('mocha');
var expect = require('chai').expect;
var assert = require('assert');

var COLON_SLASHES = '://';
var DEFAULT_PROTOCOL = 'http';
var PROXY_ADDRESS = 'www-west.sony.com';

describe('proxy-out', function(){
  describe('http.get', function(){
    it('should ensure host header use matches that passed to proxy-out on require', function(done){
      require('./proxy-out')(DEFAULT_PROTOCOL + COLON_SLASHES + PROXY_ADDRESS);

      http.get('http://google.com', function(res){
        expect(res.req._headers.host).to.equal(PROXY_ADDRESS);
        done();
      });
    });
  });
});

