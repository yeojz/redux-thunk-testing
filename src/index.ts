import { AnyAction } from 'redux';

/**
 * Action type for those functions that returns a thunk
 */
export const THUNK_ACTION = 'THUNK_ACTION';

/**
 * Function tag
 * Used when replacing functions in a snapshot
 */
export const FUNCTION_TAG = '[Function]';

export interface AnyObject {
  [keys: string]: unknown;
  [keys: number]: unknown;
}

/**
 * An action which has a functional payload (async / non-async)
 */
export interface AsyncAction extends AnyAction {
  payload: Function;
}

/**
 * Actions which are accepted in this module
 */
export type TestAction = AsyncAction | AnyAction;

/**
 * Extra arguments passed to a thunk
 * i.e. getState + extraArguments
 */
export type ThunkArgs = [(Function | null)?, any?];

/**
 * A list of actions that were called
 */
export type CallList = Array<TestAction>;

/**
 * jest.fn().mock.calls
 */
export type JestCallList = Array<CallList>;

/**
 * An action tracer that allows you
 * to step through action one by one.
 */
export interface IActionTracer {
  current(): TestAction | void;
  next(): TestAction | void;
  prev(): TestAction | void;
}

/**
 * Store for calls
 */
export interface IActionStore {
  readonly calls: CallList;

  /**
   * Gets the action that was called by index
   *
   * @param index - the position of the action which was called.
   * @returns TestAction | void
   */
  index(index: number): TestAction | void;

  /**
   * Adds to list of dispatched values
   * (internal method)
   *
   * @param action TestAction
   * @returns void
   */
  add(action: TestAction): unknown;
}

/**
 * Normalizes actions
 * converts thunks to actions with thunk payloads
 *
 * @param action Function
 * @return TestAction
 */
export function actionNormalizer(action: TestAction | Function): TestAction {
  if (typeof action === 'function') {
    return {
      type: THUNK_ACTION,
      payload: action
    };
  }

  return action;
}

/**
 * Alias for actionNormalizer
 */
export const actionNormaliser = actionNormalizer;

/**
 * Deep converts an object into a snapshot friendly structure
 *
 * @param value object
 * @returns object
 */
export function convertObjectToSnapshot(value: AnyObject): AnyObject {
  return Object.getOwnPropertyNames(value).reduce(
    (collect: AnyObject, key: keyof AnyObject): AnyObject => ({
      ...collect,
      [key]: convertGenericToSnapshot(value[key])
    }),
    <AnyObject>{}
  );
}

/**
 * Deep converts a generic value into a snapshot friendly structure
 *
 * @param value any basic types
 * @returns any basic types
 */
export function convertGenericToSnapshot(value: unknown): unknown {
  if (typeof value === 'function') {
    return FUNCTION_TAG;
  }

  if (Array.isArray(value)) {
    return value.map(convertGenericToSnapshot);
  }

  if (typeof value === 'object' && value != null) {
    return convertObjectToSnapshot(<AnyObject>value);
  }

  return value;
}

/**
 * Snapshots an action for comparison
 *
 * @param action TestAction | Function
 * @returns TestAction
 */
export function actionSnapshot(action: TestAction | Function): TestAction {
  if (typeof action === 'function') {
    return {
      type: THUNK_ACTION,
      payload: FUNCTION_TAG
    };
  }

  return <TestAction>convertGenericToSnapshot(action);
}

/**
 * Generates an array of snapshots from a list of actions
 *
 * @param actions Array<TestAction>
 * @returns Array<TestAction>
 */
export function actionArraySnapshot(
  actions: Array<TestAction | Function>
): Array<TestAction> {
  return actions.map(c => actionSnapshot(c));
}

/**
 * Generates an array of snapshots from the action tester
 *
 * @param tester IActionStore
 * @returns Array<TestAction>
 */
export function actionTesterSnapshot(tester: IActionStore): Array<TestAction> {
  return actionArraySnapshot(tester.calls);
}

/**
 * Creates an action runner
 *
 * @param tester IActionStore
 * @param thunkArgs getState + extraArguments
 * @returns Function
 */
export function createActionRunner(
  tester: IActionStore,
  ...thunkArgs: ThunkArgs
) {
  /**
   * The action runner.
   * Recursively calls the action and executes the thunk
   *
   * @param action TestAction | Function
   * @returns Promise<unknown>
   */
  async function actionRunner(action: TestAction | Function): Promise<unknown> {
    const normalised = actionNormalizer(action);

    tester.add(normalised);

    if (typeof normalised.payload === 'function') {
      return await normalised.payload(actionRunner, ...thunkArgs);
    }

    return normalised;
  }

  return actionRunner;
}

/**
 * Gets as current(), prev(), next() step methods for stepping through
 * the called actions
 *
 * @param tester IActionStore
 * @returns IActionTracer
 */
export function actionTracer(tester: IActionStore): IActionTracer {
  let index = -1;

  return {
    current: () => tester.index(index),
    next: () => {
      index = index + 1;
      return tester.index(index);
    },
    prev: () => {
      index = index - 1;
      return tester.index(index);
    }
  };
}

/**
 * Gets a list of action.type that were called.
 *
 * @param tester - IActionStore
 * @returns Array<string>
 */
export function actionTypes(tester: IActionStore): Array<string> {
  return tester.calls.map((action: TestAction) => action.type);
}

/**
 * A test-framework independent utility
 */
export class ActionTester implements IActionStore {
  callList: CallList = [];
  thunkArgs: ThunkArgs = [];

  get calls(): CallList {
    return this.callList;
  }

  add = (action: TestAction): void => {
    this.callList.push(action);
  };

  index = (index: number): TestAction | void => {
    if (index < 0) {
      return void 0;
    }
    return this.calls[index];
  };

  /**
   * Sets the remaining 2 arguments of a thunk action.
   *
   * @param getState - Mock store.getState function
   * @param extraArgument - Mock values injected via thunk.withExtraArgument
   * @returns void
   */
  setArgs = (getState: Function | null, extraArgument: any): void => {
    this.thunkArgs = [getState, extraArgument];
  };

  /**
   * dispatches an action and runs through the call tree
   *
   * @param action TestAction | Function
   * @returns Promise<unknown>
   */
  dispatch = async (action: TestAction | Function): Promise<unknown> => {
    const runner = createActionRunner(this, ...this.thunkArgs);
    return runner(action);
  };

  /**
   * Gets a list containing only the type of dispatched actions
   * in the order in which they were called
   *
   * @returns Array<string>
   */
  toTypes = (): Array<string> => actionTypes(this);

  /**
   * Gets a faux tracer/stepper function to step through the calls
   *
   * @returns IActionTracer
   */
  toTracer = (): IActionTracer => actionTracer(this);

  /**
   * Generates a snapshot of actions dispatched
   *
   * @returns Array<TestAction>
   */
  toSnapshot = (): Array<TestAction> => {
    return actionTesterSnapshot(this);
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
   * @param jestFn jest.fn()
   */
  constructor(jestFn: any) {
    super();
    this.jestFn = jestFn;
  }

  get calls(): CallList {
    return this.jestFn.mock.calls.map((c: JestCallList) => c[0]);
  }

  index = (index: number): TestAction | void => {
    const called = this.jestFn.mock.calls[index];
    return Array.isArray(called) ? called[0] : void 0;
  };

  add = (action: TestAction): void => {
    this.jestFn(action);
  };
}
