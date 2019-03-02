import { MiddlewareAPI, Dispatch } from 'redux';

let api: MiddlewareAPI<Dispatch, any>;

import {
  asyncActionMiddleware,
  createAsyncActionMiddleware
} from './middleware';

describe('middleware', () => {
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
      asyncActionMiddleware(api)(dispatch)(actionNormal);

      expect(dispatch.mock.calls.length).toEqual(1);
    });
  });

  describe('payload IS a function', () => {
    test('calls next with action + thunk', () => {
      asyncActionMiddleware(api)(dispatch)(actionFn);

      expect(dispatch.mock.calls.length).toEqual(2);
      expect(dispatch.mock.calls[1][0]).toEqual(actionFn.payload);
    });

    test('calls next with thunk only', () => {
      const middleware = createAsyncActionMiddleware({
        dispatchStart: false
      });

      middleware(api)(dispatch)(actionFn);

      expect(dispatch.mock.calls.length).toEqual(1);
      expect(dispatch.mock.calls[0][0]).toEqual(actionFn.payload);
    });
  });
});
