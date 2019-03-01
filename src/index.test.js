import {
  standardAsyncMiddleware,
  createStandardAsyncMiddleware
} from './index';

describe('index', () => {
  const dispatch = jest.fn();
  const actionNormal = {
    type: 'TEST',
    payload: {}
  };

  const actionFn = {
    type: 'TEST',
    payload: jest.fn()
  };

  beforeEach(() => {
    dispatch.mockReset();
    actionFn.payload.mockReset();
  });

  describe('payload IS NOT a function', () => {
    test('calls next with action AS-IS', () => {
      standardAsyncMiddleware()(dispatch)(actionNormal);

      expect(dispatch.mock.calls.length).toEqual(1);
    });
  });

  describe('payload IS a function', () => {
    test('calls next with action + thunk', () => {
      standardAsyncMiddleware()(dispatch)(actionFn);

      expect(dispatch.mock.calls.length).toEqual(2);
      expect(dispatch.mock.calls[1][0]).toEqual(actionFn.payload);
    });

    test('calls next with thunk only', () => {
      const middleware = createStandardAsyncMiddleware({
        dispatchStart: false
      });

      middleware()(dispatch)(actionFn);

      expect(dispatch.mock.calls.length).toEqual(1);
      expect(dispatch.mock.calls[0][0]).toEqual(actionFn.payload);
    });
  });
});
