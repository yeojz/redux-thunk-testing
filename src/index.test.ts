import { actionZero, actionTypes, actionAnonymous } from '../examples/actions';
import { JestTester, SimpleTester, THUNK_ACTION } from './index';

function runTestSuite(getTester: Function) {
  async function runCheck(extraArgs: any, expectedResult: Array<string>) {
    const tester = getTester();

    tester.setArgs(null, extraArgs);
    await tester.run(actionZero());

    expect(tester.callTypes).toEqual(expectedResult);
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
    await tester.run(actionAnonymous());

    expect(tester.callTypes).toEqual([THUNK_ACTION, actionTypes.ACTION_6]);
  });

  test('step: 0 -> 3 -> 6', async () => {
    const tester = getTester();

    tester.setArgs(null, {});
    await tester.run(actionZero());

    const steps = tester.callStepper();

    expect(steps.next().type).toEqual(actionTypes.ACTION_0);
    expect(steps.next().type).toEqual(actionTypes.ACTION_3);
    expect(steps.next().type).toEqual(actionTypes.ACTION_6);
    expect(steps.next()).toBeUndefined();
  });
}

describe('utils', () => {
  describe('SimpleTester', () => {
    runTestSuite(() => new SimpleTester());
  });

  describe('JestTester', () => {
    runTestSuite(() => new JestTester(jest.fn()));
  });
});
