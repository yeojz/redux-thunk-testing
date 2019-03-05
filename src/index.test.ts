import {
  actionZero,
  actionTypes,
  actionAnonymous,
  actionThree,
  actionSix
} from '../tests/actions';
import {
  ActionTester,
  JestActionTester,
  THUNK_ACTION,
  actionArraySnapshot,
  convertGenericToSnapshot
} from './index';

function runTestSuite(getTester: () => ActionTester) {
  async function runCheck(extraArgs: any, expectedResult: Array<string>) {
    const tester = getTester();

    tester.setArgs(null, extraArgs);
    await tester.dispatch(actionZero());

    expect(tester.toTypes()).toEqual(expectedResult);
  }

  test('path: 0 -> 3 -> 6', async () => {
    await runCheck({}, [
      actionTypes.ACTION_0,
      actionTypes.ACTION_3,
      actionTypes.ACTION_6
    ]);
  });

  test('path: 0 -> 1 -> 4 -> thunk -> 6', async () => {
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

    expect(tester.toTypes()).toEqual([THUNK_ACTION, actionTypes.ACTION_6]);
  });

  test('path: thunk -> 6 (use index())', async () => {
    const tester = getTester();
    tester.setArgs(null, {});
    await tester.dispatch(actionAnonymous());

    expect(tester.index(-1)).toBeUndefined();
    expect(tester.index(0)).toHaveProperty('type', THUNK_ACTION);
    expect(tester.index(1)).toHaveProperty('type', actionTypes.ACTION_6);
  });

  test('step: 0 -> 3 -> 6', async () => {
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

  test('snapshot: 0 -> 3 -> 6', async () => {
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

  test('snapshot: thunk -> 6', async () => {
    const tester = getTester();
    tester.setArgs(null, {});
    await tester.dispatch(actionAnonymous());

    const expectedResult = actionArraySnapshot([
      actionAnonymous(),
      actionSix()
    ]);

    expect(tester.toSnapshot()).toEqual(expectedResult);
  });
}

describe('index', () => {
  describe('ActionTester', () => {
    runTestSuite(() => new ActionTester());
  });

  describe('JestActionTester', () => {
    runTestSuite(() => new JestActionTester(jest.fn()));
  });

  describe('convertGenericToSnapshot', () => {
    const action = [
      {
        type: 'A1',
        payload: () => null
      },
      {
        type: 'B1',
        payload: {
          b2: [1, true, 'something', () => null],
          b3: {
            1: 'val1',
            '2': 'val2',
            '3': 3
          }
        }
      }
    ];

    expect(convertGenericToSnapshot(action)).toMatchSnapshot();
  });
});
