import { AnyAction } from 'redux';

/**
 * Action type for those functions that returns a thunk
 */
export const THUNK_ACTION = 'THUNK_ACTION';

/**
 * An action which has a functional payload (async / non-async)
 */
export interface AsyncAction extends AnyAction {
  payload: Function;
}

/**
 * Actions which are accepted in this module
 */
export type CallAction = AsyncAction | AnyAction;

/**
 * A list of actions that were called
 */
export type CallList = Array<CallAction>;

/**
 * jest.fn().mock.calls
 */
export type JestCallList = Array<CallList>;

/**
 * action.type of a dispatched action
 */
export type CallActionType = string;

/**
 * Extra arguments passed to a thunk
 * i.e. getState + extraArguments
 */
export type ThunkArgs = [(Function | null)?, any?];

/**
 * Accepted results from a dispatched thunk
 */
export type DispatchResult = CallAction | Promise<any> | any;

/**
 * The stepper object that is returned from
 * calling callStepper
 */
export interface CallStepper {
  next(): CallAction | void;
}

export interface ActionTesterInterface {
  /**
   * Gets a list of dispatched actions
   * in the order in which they were called.
   *
   * @returns Array of Flux Standard Actions
   */
  readonly calls: CallList;

  /**
   * Gets a list containing only the type of dispatched actions
   * in the order in which they were called
   *
   * @returns Array of action.type
   */
  callTypes(): Array<CallActionType>;

  /**
   * Gets the action that was called by index
   *
   * @param index - the position of the action which was called.
   * @returns Flux Standard CallAction
   * @returns void
   */
  callIndex(index: number): CallAction | void;

  /**
   * Gets a faux stepper function to step through the calls
   *
   * @returns Object with next() step function
   */
  callStepper(): CallStepper;

  /**
   * Runs an action and runs through the call tree
   *
   * @returns Flux Standard CallAction
   * @returns Promise - for async functions
   * @returns Any basic type
   */
  dispatch(action: CallAction | Function): CallAction | Promise<any> | any;

  /**
   * Sets the remaining 2 arguments of a thunk action.
   *
   * @param getState - Mock store.getState function
   * @param extraArgument - Mock values injected via thunk.withExtraArgument
   * @returns void
   */
  setArgs(getState: Function | null, extraArgument: any): void;
}

/**
 * A test framework independent ActionTester
 */
export class ActionTester implements ActionTesterInterface {
  callList: CallList = [];
  thunkArgs: ThunkArgs = [];

  get calls(): CallList {
    return this.callList;
  }

  callTypes = (): Array<CallActionType> => {
    return this.calls.map((action: CallAction) => action.type);
  };

  callStepper = (): CallStepper => {
    let index = 0;

    return {
      next: () => {
        const current = this.callIndex(index);
        index = index + 1;
        return current;
      }
    };
  };

  callIndex = (index: number): CallAction | void => {
    if (index < 0) {
      return void 0;
    }
    return this.calls[index];
  };

  setArgs = (getState: Function | null, extraArgument: any): void => {
    this.thunkArgs = [getState, extraArgument];
  };

  dispatch = (action: CallAction | Function): DispatchResult => {
    if (typeof action === 'function') {
      return this.dispatch({
        type: THUNK_ACTION,
        payload: action
      });
    }

    this.add(action);

    if (typeof action.payload === 'function') {
      return action.payload(this.dispatch, ...this.thunkArgs);
    }

    return action;
  };

  /**
   * Adds to list of dispatched values
   * (internal method)
   *
   * @param action - Flux Standard CallAction
   * @returns void
   */
  add = (action: CallAction): void => {
    this.callList.push(action);
  };
}

/**
 * Jest compatible ActionTester
 */
export class JestActionTester extends ActionTester {
  jestFn: any;

  /**
   * Takes in jest mock function
   *
   * @param fn - jest.fn()
   */
  constructor(jestFn: any) {
    super();
    this.jestFn = jestFn;
  }

  get calls(): CallList {
    return this.jestFn.mock.calls.map((c: JestCallList) => c[0]);
  }

  callIndex = (index: number): CallAction | void => {
    const called = this.jestFn.mock.calls[index];
    return Array.isArray(called) ? called[0] : void 0;
  };

  add = (action: CallAction): void => {
    this.jestFn(action);
  };
}
