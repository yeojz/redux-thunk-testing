import prettyFormat from 'pretty-format';

/**
 * Actions must have a `type` field that indicates the type of action being
 * performed.
 *
 * Copy of https://github.com/reduxjs/redux/blob/32ac7e64bf548e0287807fae9e622aa9c55ff065/index.d.ts#L18
 *
 * @template T the type of the action's `type` tag.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Action<T = any> {
  type: T;
}

/**
 * An Action type which accepts any other properties.
 *
 * Copy of https://github.com/reduxjs/redux/blob/32ac7e64bf548e0287807fae9e622aa9c55ff065/index.d.ts#L28
 */
export interface AnyAction extends Action {
  // Allows any extra properties to be defined in an action.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [extraProps: string]: any;
}

/**
 * An Async Action type which has a Function as payload.
 * This extends from AnyAction and thus other properties are also accepted.
 *
 * However, you can also think of this as a derivation of Flux Standard Action,
 */
export interface AsyncAction extends AnyAction {
  payload: Function;
}

/**
 * A Test Action defines actions which conforms to either an
 * AsyncAction or an AnyAction.
 */
export type TestAction = AsyncAction | AnyAction;

/**
 * Action type for those functions that returns a thunk
 */
export const THUNK_ACTION = 'THUNK_ACTION';

/**
 * ThunkArgs refers to the "getState" and "extraArguments" parameters
 * of a thunk. For reference, a thunk is called with the following
 * signature (dispatch, getState, extraArguments.)
 *
 * In the context of this project, these are used with mocks to guide the
 * executed thunk to a particular execution flow for testing.
 */
export type ThunkArgs = [(Function | null)?, unknown?];

/**
 * CallList is a lit of TestActions which are executed
 * during the process of executing a thunk.
 */
export type CallList = TestAction[];

/**
 * jest.fn().mock.calls
 */
export type JestCallList = CallList[];

/**
 * An action tracer that allows you to step through
 * the list of dispatched actions one by one.
 */
export interface ActionTracer {
  current(): TestAction | void;
  next(): TestAction | void;
  prev(): TestAction | void;
}

/**
 * The action runner takes an action and recursively
 * calls any thunks with an action runner.
 *
 * @param action The action to be dispatched. Can be a thunk.
 * @returns A promise
 */
export interface ActionRunner {
  (action: TestAction | Function): Promise<unknown>;
}

/**
 * This is a minimal interface for storing the dispatched
 * actions and all subsequent actions that were triggered from it
 * in a call stack.
 *
 * Think of it as a mock equivalent.
 */
export interface ActionStore {
  /**
   * Returns the entire call stack.
   */
  readonly calls: CallList;

  /**
   * Gets an action at a particular index of the call stack.
   *
   * @param index The position of the action which was called.
   * @returns An action or undefined if not found.
   */
  index(index: number): TestAction | void;

  /**
   * Adds an action to it's own internal call stack.
   *
   * @param action TestAction
   * @returns void
   */
  add(action: TestAction): unknown;
}

/**
 * Normalizes actions by converting thunks into an AsyncAction
 *
 * @param action An action or thunk
 * @returns An action object
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
 * Normalizes and stringifies the values using pretty-format
 *
 * @param value Any value
 * @returns A pretty-formatted stringified value.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSnapshotString(value: any): string {
  return prettyFormat(value, { printFunctionName: false });
}

/**
 * Creates a snapshot friendly representation of an action.
 *
 * @param action An action or thunk.
 * @returns A pretty-formatted stringified action or thunk.
 */
export function actionSnapshot(action: TestAction | Function): string {
  const normalized = actionNormalizer(action);
  return createSnapshotString(normalized);
}

/**
 * Creates a snapshot representation for all values within an array
 *
 * @param actions An array of actions.
 * @returns A pretty-formatted stringified list of actions.
 */
export function actionArraySnapshot(
  actions: (TestAction | Function)[]
): string {
  const normalized = actions.map(actionNormalizer);
  return createSnapshotString(normalized);
}

/**
 * Creates a snapshot representation of entire action call stack of an [[ActionStore]]
 *
 * @param tester An ActionStore compatible instance.
 * @returns A pretty-formatted stringified list of actions.
 */
export function actionTesterSnapshot(tester: ActionStore): string {
  return actionArraySnapshot(tester.calls);
}

/**
 * An action runner runs an action and recursively executes all
 * thunks that are found within the executed action as well
 * and it's subsequent actions.
 *
 * @param tester An ActionStore compatible instance.
 * @param thunkArgs getState and extraArguments of a thunk
 * @returns An action runner.
 */
export function createActionRunner(
  tester: ActionStore,
  ...thunkArgs: ThunkArgs
): ActionRunner {
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
 * Gets a tracer instance for the specified ActionStore
 *
 * @param tester An ActionStore compatible instance.
 * @returns An action tracer
 */
export function actionTracer(tester: ActionStore): ActionTracer {
  let index = -1;

  return {
    current: (): TestAction | void => tester.index(index),
    next: (): TestAction | void => {
      index = index + 1;
      return tester.index(index);
    },
    prev: (): TestAction | void => {
      index = index - 1;
      return tester.index(index);
    }
  };
}

/**
 * Gets an array of action.types from the call stack of the specified ActionStore
 *
 * @param tester An ActionStore compaitble instance
 * @returns An array of action.types
 */
export function actionTypes(tester: ActionStore): string[] {
  return tester.calls.map((action: TestAction): string => action.type);
}

/**
 * A test-framework independent test runner
 * This encapsulates the singular functions within this library into a class
 */
export class ActionTester implements ActionStore {
  private callList: CallList = [];
  private thunkArgs: ThunkArgs = [];

  public get calls(): CallList {
    return this.callList;
  }

  public add = (action: TestAction): void => {
    this.callList.push(action);
  };

  public index = (index: number): TestAction | void => {
    if (index < 0) {
      return void 0;
    }
    return this.calls[index];
  };

  /**
   * Sets the remaining 2 arguments of a thunk action.
   *
   * @param getState Mock store.getState function
   * @param extraArgument Mock values injected via thunk.withExtraArgument
   * @returns void
   */
  public setArgs = (
    getState?: Function | null,
    extraArgument?: unknown
  ): void => {
    this.thunkArgs = [getState, extraArgument];
  };

  /**
   * Dispatches an action and recursively executes all thunks of an action
   * and it's subsequent actions.
   *
   * @param action TestAction | Function
   * @returns Promise<unknown>
   */
  public dispatch = async (action: TestAction | Function): Promise<unknown> => {
    const runner = createActionRunner(this, ...this.thunkArgs);
    return runner(action);
  };

  /**
   * Gets an array of action.type of dispatched actions
   *
   * @returns An array of action.type
   */
  public toTypes = (): string[] => actionTypes(this);

  /**
   * Gets a object containing step functions to step through the calls.
   *
   * @returns An action tracer
   */
  public toTracer = (): ActionTracer => actionTracer(this);

  /**
   * Generates a snapshot of the dispatched actions.
   *
   * @returns  A pretty-formatted stringified value.
   */
  public toSnapshot = (): string => {
    return actionTesterSnapshot(this);
  };
}

/**
 * An ActionTester class which is jest compatible
 */
export class JestActionTester extends ActionTester {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private jestFn: any;

  /**
   * Takes in jest mock function.
   *
   * @param jestFn jest.fn()
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(jestFn: any) {
    super();
    this.jestFn = jestFn;
  }

  /**
   * Re-maps all jest.fn().mock.calls array to the ActionTester
   * compatible version
   *
   * @returns An array of actions
   */
  public get calls(): CallList {
    return this.jestFn.mock.calls.map((c: JestCallList): CallList => c[0]);
  }

  /**
   * Retrieves the action from the provided jest.fn()
   */
  public index = (index: number): TestAction | void => {
    const called = this.jestFn.mock.calls[index];
    return Array.isArray(called) ? called[0] : void 0;
  };

  /**
   * Calls the action with the provided jest.fn();
   */
  public add = (action: TestAction): void => {
    this.jestFn(action);
  };
}
