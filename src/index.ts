import { Dispatch, Middleware } from 'redux';
import { AsyncStandardAction, FluxStandardAction } from './global';

export interface standardAsyncOptions {
  dispatchStart?: boolean;
}

export function createStandardAsyncMiddleware(
  options: standardAsyncOptions
): Middleware {
  const { dispatchStart = true } = options;

  return () => (next: Dispatch) => (
    action: AsyncStandardAction | FluxStandardAction<any>
  ) => {
    if (typeof action.payload === 'function') {
      const { payload, ...rest } = action;

      // announce action start
      if (dispatchStart) {
        next(rest);
      }

      // convert to a thunk action
      return next(action.payload);
    }

    return next(action);
  };
}

export const standardAsyncMiddleware: Middleware = createStandardAsyncMiddleware(
  {}
);
