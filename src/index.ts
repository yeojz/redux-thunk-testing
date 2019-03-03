import { CallAction } from './common';

export const THUNK_ACTION = 'THUNK_ACTION';

export type CallList = Array<CallAction>;
export type CallActionType = string;
export type JestCallList = Array<CallList>;
export type ThunkArgs = [(Function | null)?, any?];
export type DispatchResult = CallAction | Promise<any> | any;

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
   * Resets the state of the mock
   *
   * @returns void
   */
  reset(): void;

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
   * Gets the action that was called by the number.
   *
   * @param num - the order number in which action is called (i.e. index + 1)
   * @returns Flux Standard CallAction
   * @returns void
   */
  callNumber(num: number): CallAction | void;

  /**
   * Gets a faux stepper function to step through the calls
   *
   * @returns Object with next() step function
   */
  callStepper(): CallStepper;

  /**
   * Adds to list of dispatched values
   *
   * @param action - Flux Standard CallAction
   * @returns void
   */
  add(action: CallAction): void;

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

  reset = (): void => {
    this.callList = [];
  };

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
    return this.calls[index];
  };

  callNumber = (num: number): CallAction | void => {
    return this.callIndex(num - 1);
  };

  setArgs = (getState: Function | null, extraArgument: any): void => {
    this.thunkArgs = [getState, extraArgument];
  };

  add = (action: CallAction): void => {
    this.callList.push(action);
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

  add = (action: CallAction): void => this.jestFn(action);
}
