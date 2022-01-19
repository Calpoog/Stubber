import { findStub, getEngaged, sendMessage } from './setup';
import { v4 as uuidv4 } from 'uuid';

function wait(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export default function proxyFetch(window) {
  // fetch proxying
  const origFetch = window.fetch;
  // eslint-disable-next-line no-global-assign
  window.fetch = async function (resource, init) {
    if (!getEngaged()) return origFetch(resource, init);

    const id = uuidv4();
    // Make a Request object whether the resource is already one or just a string
    const request = new Request(resource);
    const method = init?.method || resource?.method || 'GET';

    sendMessage({
      name: 'request',
      request: {
        fetch: true,
        method,
        url: request.url,
        id,
      },
    });

    // check if there's a stub
    const stub = findStub(request.url, method);
    let redirected = false;
    if (stub) {
      console.log('Stubbing response', stub);
      // if the stub specifies a redirect URL, this fetch keeps going as usual just using a different endpoint
      if (stub.redirectURL) {
        // do any replacements of Location vars
        let url = request.url;
        const location = document.createElement('a');
        location.href = url;
        redirected = true;

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

        // modify the Request object to use the new url
        Object.defineProperties(request, {
          url: {
            value: url,
            enumerable: true,
            writable: true,
          },
        });
        console.log('rewrote Request', request);
      } else {
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

        // stub and return a Promise with stubbed data
        const headers = new Headers(stub.headers);
        const status = parseInt(stub.status);
        await wait((stub.delay || 0) * 1000);

        return new Response(new Blob([stub.response], { type: headers.get('Content-Type') || 'text/html' }), {
          status: status,
          statusText: stub.statusText || 'OK',
          ok: status >= 200 && status <= 299,
          headers,
        });
      }
    }

    try {
      await wait((stub?.delay || 0) * 1000);
      const response = await origFetch(request, init);
      const text = await response.clone().text();

      sendMessage({
        name: 'response',
        response: {
          id,
          response: text,
          headers: Array.from(response.headers.entries()).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
          status: response.status,
          statusText: response.statusText,
          redirected,
        },
      });

      return response;
    } catch (e) {
      sendMessage({
        name: 'response',
        response: {
          id,
          response: '',
          status: '(error)',
          redirected,
        },
      });
      return Promise.reject(e);
    }
  };
}
