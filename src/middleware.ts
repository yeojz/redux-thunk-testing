import { Dispatch, Middleware } from 'redux';
import { CallAction } from './common';

export interface AsyncActionOptions {
  /**
   * Determines if the action with a thunk payload
   * should be dispatched before dispatching the thunk
   */
  dispatchStart?: boolean;
}

export function createAsyncActionMiddleware(
  options: AsyncActionOptions
): Middleware {
  const { dispatchStart = true } = options;

  return () => (next: Dispatch) => (action: CallAction) => {
    if (typeof action.payload === 'function') {
      const { payload, ...rest } = action;

      // Announce action start
      if (dispatchStart) {
        next(rest);
      }

      // Convert to a thunk action
      return next(action.payload);
    }

    return next(action);
  };
}

export const asyncActionMiddleware: Middleware = createAsyncActionMiddleware(
  {}
);
