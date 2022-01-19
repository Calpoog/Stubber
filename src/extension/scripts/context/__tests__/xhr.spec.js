import { sendMessage, findStub, getEngaged } from '../setup';
import proxyXMLHttpRequest from '../xhr';

jest.mock('../setup');

getEngaged.mockImplementation(async () => true);

const originalSend = jest.fn(() => {
  console.log('original send!');
});
window.XMLHttpRequest.prototype.send = originalSend;
const originalOpen = jest.spyOn(window.XMLHttpRequest.prototype, 'open');

function httpRequest(url, complete = false) {
  return new Promise((resolve) => {
    const xhr = new window.XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      resolve(xhr);
    };
    // xhr.responseType = 'json';
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send(null);

    if (complete) {
      xhr.dispatchEvent(new ProgressEvent('load'));
    }

    jest.runOnlyPendingTimers();
  });
}

describe('xhr', () => {
  beforeAll(() => {
    proxyXMLHttpRequest(window);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => jest.useRealTimers());

  it('does not proxy without stubs', async () => {
    expect.assertions(2);
    await httpRequest('abc', true);
    expect(findStub).toBeCalledTimes(1);
    expect(originalSend).toBeCalledTimes(1);
  });

  it('proxies with a stub match', async () => {
    expect.assertions(6);
    findStub.mockImplementationOnce(() => ({
      name: 'A stub',
      headers: { a: 'b' },
      response: 'stubbed',
    }));
    httpRequest('abc').then((xhr) => {
      expect(findStub).toBeCalledTimes(1);
      expect(sendMessage.mock.calls[0][0].name).toBe('request');
      expect(sendMessage.mock.calls[1][0].name).toBe('response');
      expect(sendMessage.mock.calls[1][0].response.stubbed).toBe(true);
      expect(xhr.response).toBe('stubbed');
      expect(originalSend).not.toBeCalled();
    });
  });

  it('redirects with a stub match', async () => {
    expect.assertions(5);
    findStub.mockImplementationOnce(() => ({
      name: 'A stub',
      headers: { a: 'b' },
      redirectURL: 'bob',
    }));
    httpRequest('abc', true).then((xhr) => {
      expect(findStub).toBeCalledTimes(1);
      expect(sendMessage.mock.calls[0][0].name).toBe('request');
      expect(sendMessage.mock.calls[1][0].name).toBe('response');
      expect(sendMessage.mock.calls[1][0].response.redirected).toBe(true);
      expect(originalSend).toBeCalledTimes(1);
    });
  });

  it('can rewrite regex for redirects', async () => {
    expect.assertions(3);
    findStub.mockImplementationOnce(() => ({
      name: 'A stub',
      headers: { a: 'b' },
      redirectURL: 'bob{1}',
      regex: true,
      url: '(cal)vin',
    }));
    httpRequest('calvin', true).then(() => {
      expect(findStub).toBeCalledTimes(1);
      expect(originalSend).toBeCalled();
      expect(originalOpen.mock.calls[0][1]).toBe('bobcal');
    });
  });
});
