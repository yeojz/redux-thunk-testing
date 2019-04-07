// /* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  actionZero,
  actionTypes,
  actionAnonymous,
  actionThree,
  actionSix
} from '../examples/actions';
import {
  ActionTester,
  JestActionTester,
  THUNK_ACTION,
  actionArraySnapshot,
  actionSnapshot
} from './index';

type AsyncTest = Promise<void>;

function runTestSuite(name: string, getTester: () => ActionTester): void {
  async function runCheck(
    extraArgs: unknown,
    expectedResult: string[]
  ): AsyncTest {
    const tester = getTester();

    tester.setArgs(null, extraArgs);
    await tester.dispatch(actionZero());

    expect(tester.toTypes()).toEqual(expectedResult);
  }

  test(`[${name}] path: 0 -> 3 -> 6`, async (): AsyncTest => {
    await runCheck({}, [
      actionTypes.ACTION_0,
      actionTypes.ACTION_3,
      actionTypes.ACTION_6
    ]);
  });

  test(`[${name}] path: 0 -> 1 -> 4 -> thunk -> 6`, async (): AsyncTest => {
    await runCheck(
      {
        one: true
      },
      [actionTypes.ACTION_0, actionTypes.ACTION_1, actionTypes.ACTION_4]
    );
  });

  test(`[${name}] path: 0 -> 1 -> 2 -> 4`, async (): AsyncTest => {
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

  test(`[${name}] path: 0 -> 1 -> 2 -> 5 -> thunk -> 6`, async (): AsyncTest => {
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

  test(`[${name}] path: thunk -> 6`, async (): AsyncTest => {
    const tester = getTester();
    tester.setArgs(null, {});
    await tester.dispatch(actionAnonymous());

    expect(tester.toTypes()).toEqual([THUNK_ACTION, actionTypes.ACTION_6]);
  });

  test(`[${name}] path: thunk -> 6 (use index())`, async (): AsyncTest => {
    const tester = getTester();
    tester.setArgs(null, {});
    await tester.dispatch(actionAnonymous());

    expect(tester.index(-1)).toBeUndefined();
    expect(tester.index(0)).toHaveProperty('type', THUNK_ACTION);
    expect(tester.index(1)).toHaveProperty('type', actionTypes.ACTION_6);
  });

  test(`[${name}] step: 0 -> 3 -> 6`, async (): AsyncTest => {
    const tester = getTester();
    tester.setArgs(null, {});
    await tester.dispatch(actionZero());

    const steps = tester.toTracer();

    expect(steps.next()).toHaveProperty('type', actionTypes.ACTION_0);
    expect(steps.next()).toHaveProperty('type', actionTypes.ACTION_3);
    expect(steps.next()).toHaveProperty('type', actionTypes.ACTION_6);

    expect(steps.prev()).toHaveProperty('type', actionTypes.ACTION_3);
    expect(steps.current()).toHaveProperty('type', actionTypes.ACTION_3);
    expect(steps.next()).toHaveProperty('type', actionTypes.ACTION_6);

    expect(steps.next()).toBeUndefined();
  });

  test(`[${name}] snapshot: 0 -> 3 -> 6`, async (): AsyncTest => {
    const tester = getTester();

    tester.setArgs(null, {});
    await tester.dispatch(actionZero());

    const expectedResult = actionArraySnapshot([
      actionZero(),
      actionThree(),
      actionSix()
    ]);

    expect(tester.toSnapshot()).toEqual(expectedResult);
  });

  test(`[${name}] snapshot: thunk -> 6`, async (): AsyncTest => {
    const tester = getTester();
    tester.setArgs(null, {});
    await tester.dispatch(actionAnonymous());

    const expectedResult = actionArraySnapshot([
      actionAnonymous(),
      actionSix()
    ]);

    expect(tester.toSnapshot()).toEqual(expectedResult);
  });

  test(`[${name}] allow for callback style without async`, (done): void => {
    const tester = getTester();

    tester.setArgs(null, {});
    tester.dispatch(
      actionZero(),
      (): void => {
        expect(tester.toTypes()).toEqual([
          actionTypes.ACTION_0,
          actionTypes.ACTION_3,
          actionTypes.ACTION_6
        ]);

        done();
      }
    );
  });
}

runTestSuite('ActionTester', (): ActionTester => new ActionTester());

runTestSuite(
  'JestActionTester',
  (): JestActionTester => new JestActionTester(jest.fn())
);

test('[actionSnapshot] should return expected value', (): void => {
  const current = actionSnapshot({ type: 'TEST' });
  expect(current).toEqual(`Object {\n  "type": "TEST",\n}`);
});
