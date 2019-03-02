import { FluxStandardAction } from './common';

export type CallList = Array<FluxStandardAction<any>>;
export type ActionType = string;
export type JestCallList = Array<CallList>;
export type ThunkArgs = [(Function | null)?, any?];

export interface ActionTester {
  /**
   * Gets a list of dispatched actions
   * in the order in which they were called.
   *
   * @returns array of FSA object
   */
  readonly calls: CallList;

  /**
   * Gets a list containing only the type of dispatched actions
   * in the order in which they were called
   *
   * @returns array of action.type
   */
  readonly callTypes: Array<ActionType>;

  /**
   * Adds to list of dispatched values
   *
   * @param action - Flux Standard Action
   * @returns void
   */
  add(action: FluxStandardAction<any>): void;

  /**
   * Runs an action and returns the value of the functional payload
   * or the original action.
   *
   * @returns Flux Standard Action
   * @returns Promise - for async functions
   * @returns Any basic type
   */
  run(
    action: FluxStandardAction<any>
  ): FluxStandardAction<any> | Promise<any> | any;

  /**
   * Runs the thunk function
   *
   * @returns Flux Standard Action
   * @returns Promise - for async functions
   * @returns Any basic type
   */
  runThunk(action: Function): FluxStandardAction<any> | Promise<any> | any;

  /**
   * Sets the remaining 2 arguments of a thunk action.
   *
   * @param getState - Mock store.getState function
   * @param extraArgument - Mock values injected via thunk.withExtraArgument
   */
  setArgs(getState: Function | null, extraArgument: any): void;
}

/**
 * A test framework independent ActionTester
 */
export class SimpleTester implements ActionTester {
  callList: CallList = [];
  thunkArgs: ThunkArgs = [];

  get calls() {
    return this.callList;
  }

  get callTypes() {
    return this.calls.map((action: FluxStandardAction<any>) => action.type);
  }

  setArgs = (getState: Function | null, extraArgument: any) => {
    this.thunkArgs = [getState, extraArgument];
  };

  add = (action: FluxStandardAction<any>) => {
    this.callList.push(action);
  };

  run = (action: FluxStandardAction<any>) => {
    this.add(action);

    return action && typeof action.payload === 'function'
      ? this.runThunk(action.payload)
      : action;
  };

  runThunk = (
    action: Function
  ): FluxStandardAction<any> | Promise<any> | any => {
    return action(this.run, ...this.thunkArgs);
  };
}

/**
 * Jest compatible ActionTester
 */
export class JestTester extends SimpleTester {
  dispatch: any;

  /**
   * Takes in jest mock function
   *
   * @param fn - jest.fn()
   */
  constructor(fn: Function) {
    super();
    this.dispatch = fn;
  }

  get calls() {
    return this.dispatch.mock.calls.map((c: JestCallList) => c[0]);
  }

  add = (action: FluxStandardAction<any>) => this.dispatch(action);
}
