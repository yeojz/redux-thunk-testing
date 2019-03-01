import { FluxStandardAction } from './global';

export type CalledActions = Array<FluxStandardAction<any>>;
export type CalledActionsJest = Array<CalledActions>;
export type ThunkArgs = Array<any>;

export interface ActionTester {
  calls(): CalledActions;
  push(action: any): void;
  run(action: FluxStandardAction<any>): any;
  setArgs(...args: ThunkArgs): void;
}

export class SimpleTester implements ActionTester {
  called: CalledActions = [];
  args: ThunkArgs = [];

  setArgs = (...args: ThunkArgs) => {
    this.args = args;
  };

  calls = (): CalledActions => {
    return this.called;
  };

  push = (action: FluxStandardAction<any>): void => {
    this.called.push(action);
  };

  run = (action: FluxStandardAction<any>): FluxStandardAction<any> => {
    this.push(action);

    return action && typeof action.payload === 'function'
      ? action.payload(this.run, ...this.args)
      : action;
  };
}

export class JestTester extends SimpleTester {
  dispatch: any;

  constructor(fn: Function) {
    super();
    this.dispatch = fn;
  }

  calls = (): CalledActions => {
    return this.dispatch.mock.calls.map((c: CalledActionsJest) => c[0]);
  };

  push = (...args: Array<any>) => this.dispatch(...args);
}

export function getDispatchFlow(dispatch: ActionTester): Array<string> {
  return dispatch.calls().map((action: FluxStandardAction<any>) => action.type);
}
