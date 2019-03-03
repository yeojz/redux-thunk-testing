import { AnyAction } from 'redux';

/**
 * An action which has a functional payload (async / non-async)
 */
export interface AsyncAction extends AnyAction {
  payload: Function
}

/**
 * Actions which are accepted in this module
 */
export type CallAction = AsyncAction | AnyAction
