import { actionZero, actionTypes, actionAnonymous } from '../tests/actions';
import {
  ActionTesterInterface,
  JestActionTester,
  ActionTester,
  THUNK_ACTION
} from './index';

function runTestSuite(getTester: () => ActionTesterInterface) {
  async function runCheck(extraArgs: any, expectedResult: Array<string>) {
    const tester = getTester();

    tester.setArgs(null, extraArgs);
    await tester.dispatch(actionZero());

    expect(tester.callTypes()).toEqual(expectedResult);
  }

  test('path: 0 -> 3 -> 6', async () => {
    await runCheck({}, [
      actionTypes.ACTION_0,
      actionTypes.ACTION_3,
      actionTypes.ACTION_6
    ]);
  });

  test('path: 0 -> 1 -> 4', async () => {
    await runCheck(
      {
        one: true
      },
      [actionTypes.ACTION_0, actionTypes.ACTION_1, actionTypes.ACTION_4]
    );
  });

  test('path: 0 -> 1 -> 2 -> 4', async () => {
    await runCheck(
      {
        one: true,
        two: true,
        four: true
      },
      [
        actionTypes.ACTION_0,
        actionTypes.ACTION_1,
        actionTypes.ACTION_2,
        actionTypes.ACTION_4
      ]
    );
  });

  test('path: 0 -> 1 -> 2 -> 5 -> thunk -> 6', async () => {
    await runCheck(
      {
        one: true,
        two: true
      },
      [
        actionTypes.ACTION_0,
        actionTypes.ACTION_1,
        actionTypes.ACTION_2,
        actionTypes.ACTION_5,
        THUNK_ACTION,
        actionTypes.ACTION_6
      ]
    );
  });

  test('path: thunk -> 6', async () => {
    const tester = getTester();
    tester.setArgs(null, {});
    await tester.dispatch(actionAnonymous());

    expect(tester.callTypes()).toEqual([THUNK_ACTION, actionTypes.ACTION_6]);
  });

  test('path: thunk -> 6 (use callNumber / callIndex)', async () => {
    const tester = getTester();
    tester.setArgs(null, {});
    await tester.dispatch(actionAnonymous());

    expect(tester.callIndex(0)).toHaveProperty('type', THUNK_ACTION);
    expect(tester.callNumber(1)).toHaveProperty('type', THUNK_ACTION);

    expect(tester.callIndex(1)).toHaveProperty('type', actionTypes.ACTION_6);
    expect(tester.callNumber(2)).toHaveProperty('type', actionTypes.ACTION_6);
  })

  test('step: 0 -> 3 -> 6', async () => {
    const tester = getTester();
    tester.setArgs(null, {});
    await tester.dispatch(actionZero());

    const steps = tester.callStepper();

    expect(steps.next()).toHaveProperty('type', actionTypes.ACTION_0);
    expect(steps.next()).toHaveProperty('type', actionTypes.ACTION_3);
    expect(steps.next()).toHaveProperty('type', actionTypes.ACTION_6);
    expect(steps.next()).toBeUndefined();
  });
}

describe('utils', () => {
  describe('ActionTester', () => {
    runTestSuite(() => new ActionTester());
  });

  describe('JestActionTester', () => {
    runTestSuite(() => new JestActionTester(jest.fn()));
  });
});
