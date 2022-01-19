import { findStub, getEngaged, sendMessage } from './setup';
import { v4 as uuidv4 } from 'uuid';

export default function proxyXMLHttpRequest(window) {
  // XMLHttpRequest proxying
  const xhr = window.XMLHttpRequest;
  const originalOpen = xhr.prototype.open;
  const originalSend = xhr.prototype.send;
  const originalGetResponseHeader = xhr.prototype.getResponseHeader;
  const originalGetAllResponseHeaders = xhr.prototype.getAllResponseHeaders;
  xhr.prototype.open = function open(method, url, asynchronous = true, user, password) {
    if (getEngaged()) {
      const config = {};
      Object.defineProperties(this, {
        // if Stubber is on when open is first called, we want to make sure the other proxied methods
        // still happen even if its turned off before they are called.
        _stubberOn: {
          value: true,
          writable: true,
          enumerable: true,
          configurable: true,
        },
        _stubber: {
          value: config,
          writable: true,
          enumerable: true,
          configurable: true,
        },
      });
      console.log(method + ' ' + url);

      // mark if this request is being stubbed
      const stub = findStub(url, method);

      // remember this in case we stub it
      config.responseURL = url; // original URL saved here in case there's a redirectURL
      config.method = method;

      if (stub) {
        config.responseStub = stub;

        // if the stub specifies a redirect URL, this XMLHttpRequest keeps going as usual just using a different endpoint
        if (stub.redirectURL) {
          // do any replacements of Location vars
          const location = document.createElement('a');
          location.href = url;

          // for simplicity (and because not a lot of reasons why) there's no way to change the outgoing request headers/body
          url = stub.redirectURL;

          ['href', 'protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash', 'origin'].forEach((piece) => {
            url = url.replace(new RegExp('{' + piece + '}', 'gi'), location[piece]);
          });
          // we define "path" as everything in the url minus the origin
          url = url.replace(/\{path\}/g, location.href.replace(location.origin, ''));

          // if it was regex and they had capture groups they can use those too
          const captures = location.href.match(new RegExp(stub.url));
          url = url.replace(/\{(\d+)\}/g, (_, num) => captures[parseInt(num)]);

          config.finalURL = url;
        }
      } else {
        // remove our load listener if its being reused
        if (config.internalListener) {
          this.removeEventListener('error', config.internalListener);
          this.removeEventListener('abort', config.internalListener);
          this.removeEventListener('timeout', config.internalListener);
          this.removeEventListener('load', config.internalListener);
        }
      }
    }

    return originalOpen.call(this, method, url, asynchronous, user, password);
  };

  xhr.prototype.send = function send(body) {
    if (!this._stubberOn) return originalSend.call(this, body);

    const config = this._stubber;
    const id = uuidv4();
    const stub = config.responseStub;

    // tell the devtools that a request happened for the request log
    sendMessage({
      name: 'request',
      request: {
        method: config.method,
        url: config.responseURL,
        id,
      },
    });

    // if it has a stub, respond with that, otherwise defer to wrapped xhr
    // the wrapped xhr might be going to a new URL that originally specified if it had a redirectURL
    if (stub && !stub.redirectURL) {
      // Stubber provided a static stub
      console.log('Stubbing response', stub);
      // simulate load
      Object.defineProperties(this, {
        readyState: {
          value: this.DONE,
          enumerable: true,
          writable: true,
        },
        response: {
          value: stub.response,
          enumerable: true,
          writable: true,
        },
        responseText: {
          value: stub.response,
          enumerable: true,
          writable: true,
        },
        status: {
          value: parseInt(stub.status),
          enumerable: true,
          writable: true,
        },
        statusText: {
          value: stub.statusText || 'OK',
          enumerable: true,
          writable: true,
        },
        responseURL: {
          value: config.responseURL,
          enumerable: true,
          writable: true,
        },
      });

      setTimeout(() => {
        const loadEvent = new ProgressEvent('load');
        Object.defineProperty(loadEvent, 'target', {
          value: this,
          enumerable: true,
        });

        const loadendEvent = new ProgressEvent('loadend');
        Object.defineProperty(loadendEvent, 'target', {
          value: this,
          enumerable: true,
        });

        this.dispatchEvent(loadEvent);
        this.dispatchEvent(loadendEvent);

        // tell the devtools we stubbed it
        sendMessage({
          name: 'response',
          response: {
            id,
            response: stub.response,
            status: stub.status,
            stubbed: true,
          },
        });
      }, (stub.delay || 0) * 1000);
    } else {
      if (stub?.redirectURL) {
        console.log('Redirecting request to ', config.finalURL || stub.redirectURL);
      }

      // listen to response so we can send it to the devtools
      config.internalListener = (e) => {
        const headers = originalGetAllResponseHeaders
          .call(this)
          .trim()
          .split(/[\r\n]+/)
          .reduce((headers, line) => {
            const parts = line.split(': ');
            const header = parts.shift();
            const value = parts.join(': ');
            return { ...headers, [header]: value };
          }, {});

        sendMessage({
          name: 'response',
          response: {
            id,
            response: e.target.response,
            headers,
            status: e.type === 'load' ? e.target.status : `(${e.type})`,
            statusText: e.target.statusText,
            redirected: !!stub?.redirectURL,
          },
        });
      };
      this.addEventListener('error', config.internalListener);
      this.addEventListener('abort', config.internalListener);
      this.addEventListener('timeout', config.internalListener);
      this.addEventListener('load', config.internalListener);

      setTimeout(() => originalSend.call(this, body), (stub?.delay || 0) * 1000);
    }
  };

  xhr.prototype.getResponseHeader = function getResponseHeader(name) {
    if (!this._stubberOn) return originalGetResponseHeader.call(this, name);
    if (this.readyState < 2) return null;

    const config = this._stubber;

    if (config.responseStub?.headers) {
      return config.responseStub.headers[name] || null;
    } else {
      return originalGetResponseHeader.call(this, name);
    }
  };

  xhr.prototype.getAllResponseHeaders = function getAllResponseHeaders() {
    if (!this._stubberOn) return originalGetAllResponseHeaders.call(this);
    if (this.readyState < 2) return null;

    const config = this._stubber;

    if (config.responseStub?.headers) {
      return (
        Object.entries(config.responseStub.headers).reduce(
          (str, [key, value]) => `${str}${key.toLowerCase()}: ${value}\r\n`,
          ''
        ) || null
      );
    } else {
      return originalGetAllResponseHeaders.call(this);
    }
  };
}
