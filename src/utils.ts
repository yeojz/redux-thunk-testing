import { FluxStandardAction } from './global';

export type CalledActions = Array<FluxStandardAction<any>>;
export type CalledActionsJest = Array<CalledActions>;
export type ThunkArgs = Array<any>;

export interface ActionTester {
  readonly calls: CalledActions;
  readonly listTypes: Array<string>;
  push(action: any): void;
  run(action: FluxStandardAction<any>): any;
  setThunkArgs(getState: Function | null, extraArgument: any): void;
}

export class SimpleTester implements ActionTester {
  calledActions: CalledActions = [];
  thunkArgs: ThunkArgs = [];

  get calls(): CalledActions {
    return this.calledActions;
  }

  get listTypes(): Array<string> {
    return this.calls.map((action: FluxStandardAction<any>) => action.type);
  };

  setThunkArgs = (getState: Function | null, extraArgument: any) => {
    this.thunkArgs = [getState, extraArgument];
  };

  push = (action: FluxStandardAction<any>): void => {
    this.calledActions.push(action);
  };

  run = (action: FluxStandardAction<any>): FluxStandardAction<any> => {
    this.push(action);

    return action && typeof action.payload === 'function'
      ? action.payload(this.run, ...this.thunkArgs)
      : action;
  };
}

export class JestTester extends SimpleTester {
  dispatch: any;

  constructor(fn: Function) {
    super();
    this.dispatch = fn;
  }

  get calls(): CalledActions {
    return this.dispatch.mock.calls.map((c: CalledActionsJest) => c[0]);
  }

  push = (action: FluxStandardAction<any>) => this.dispatch(action);
}
