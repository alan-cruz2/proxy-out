proxy-out
=========

### Installation

To use, simply require at any point before making your outgoing HTTP or HTTPS requests (Generally at the top of your server JS):
```
require('proxy-out')('http://my.proxy.com:80');
```

Requiring proxy-out will override your http.request, http.get, https.request and https.get methods to route through your proxy. This is useful if you're working in a corporate space, behind a corporate proxy.

### Whitelisting

Sometimes, you'll want to route to internal destinations and won't want them running through a proxy (A proxy won't know how to get back to your localhost, for instance). In this situation, you can add a whitelist by supplying the hostnames as an array like so:

```
require('proxy-out')('http://my.proxy.com:80', ['localhost', '127.0.0.1', 'my-site.local']);
```

### Testing

Testing actually attempts to connect to an external site (Google.com), so you'll need a working proxy. By default, test.js checks for the environment variable `http_proxy`.

```
export http_proxy=http://my.proxy.com:80
npm test
```
