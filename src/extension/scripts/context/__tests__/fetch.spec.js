import { sendMessage, findStub, getEngaged } from '../setup';
import proxyFetch from '../fetch';

jest.mock('../setup');

getEngaged.mockImplementation(async () => true);

const MockBlob = jest.fn(function ([body]) {
  this.text = async () => body;
});
const MockRequest = jest.fn((resource) => ({
  url: resource.url || resource,
}));
const MockResponse = jest.fn(function (body, init) {
  this.headers = {
    entries: () => [['x', 'y']],
  };
  this.clone = function () {
    return this;
  };
  this.text = async function () {
    return body ? body.text() : 'fetch text';
  };
});

global.Request = MockRequest;
global.Response = MockResponse;
global.Blob = MockBlob;

// mock original request
const originalFetch = jest.fn(() => new MockResponse());
window.fetch = originalFetch;

describe('fetch', () => {
  beforeAll(() => {
    proxyFetch(window);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not proxy without stubs', async () => {
    expect.assertions(7);
    const response = await fetch('');
    expect(findStub).toBeCalledTimes(1);
    expect(MockRequest).toBeCalled();
    expect(MockResponse).toBeCalled();
    expect(originalFetch).toBeCalled();
    expect(sendMessage.mock.calls[0][0].name).toBe('request');
    expect(sendMessage.mock.calls[1][0].name).toBe('response');
    expect(response.text()).resolves.toBe('fetch text');
  });

  it('proxies with a stub match', async () => {
    expect.assertions(4);
    findStub.mockImplementationOnce(() => ({
      name: 'A stub',
      headers: { a: 'b' },
      response: 'stubbed',
    }));
    const response = await fetch('calvin');
    expect(findStub).toBeCalledTimes(1);
    expect(sendMessage.mock.calls[0][0].name).toBe('request');
    expect(sendMessage.mock.calls[1][0].response.stubbed).toBe(true);
    expect(response.text()).resolves.toBe('stubbed');
  });

  it('redirects with a stub match', async () => {
    expect.assertions(6);
    findStub.mockImplementationOnce(() => ({
      name: 'A stub',
      headers: { a: 'b' },
      redirectURL: 'bob',
    }));
    const response = await fetch('calvin');
    expect(findStub).toBeCalledTimes(1);
    expect(originalFetch).toBeCalled();
    expect(originalFetch.mock.calls[0][0].url).toBe('bob');
    expect(sendMessage.mock.calls[0][0].name).toBe('request');
    expect(sendMessage.mock.calls[1][0].response.redirected).toBe(true);
    expect(response.text()).resolves.toBe('fetch text');
  });

  it('can rewrite regex for redirects', async () => {
    expect.assertions(4);
    findStub.mockImplementationOnce(() => ({
      name: 'A stub',
      headers: { a: 'b' },
      redirectURL: 'bob{1}',
      regex: true,
      url: '(cal)vin',
    }));
    const response = await fetch('calvin');
    expect(findStub).toBeCalledTimes(1);
    expect(originalFetch).toBeCalled();
    expect(originalFetch.mock.calls[0][0].url).toBe('bobcal');
    expect(response.text()).resolves.toBe('fetch text');
  });
});
