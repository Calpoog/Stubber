jest.mock('../fetch.js', () => jest.fn());
jest.mock('../xhr.js', () => jest.fn());

const postMessageSpy = jest.spyOn(window, 'postMessage');
const aelSpy = jest.spyOn(window, 'addEventListener');

import { setup, findStub, sendMessage } from '../setup.js';

describe('Context script', () => {
  beforeAll(() => {
    setup(window);
  });

  afterEach(() => postMessageSpy.mockClear());

  it('messages that it has been injected', () => {
    expect(postMessageSpy).toHaveBeenCalled();
  });

  it('can receive stub updates', async () => {
    return new Promise((resolve) => {
      window.postMessage(
        {
          type: 'stubber-update-stubs',
          source: 'stubber.content',
          stubs: [
            { method: 'GET', url: 'abc' },
            { method: 'POST', url: 'xyz' },
          ],
        },
        '*'
      );

      let count = 0;
      window.addEventListener(
        'message',
        async () => {
          if (++count < 2) return;
          expect(findStub('abc', 'GET')).toBeTruthy();
          expect(findStub('xyz', 'POST')).toBeTruthy();
          expect(findStub('not', 'there')).toBeFalsy();
          resolve();
        },
        false
      );
    });
  });

  it('can send a message to content script', () => {
    postMessageSpy.mockClear();
    sendMessage({ hello: true });
    expect(postMessageSpy).toBeCalledTimes(1);
    const arg = postMessageSpy.mock.calls[0][0];
    expect(arg.source).toBe('stubber.context');
    expect(arg.hello).toBe(true);
  });
});
