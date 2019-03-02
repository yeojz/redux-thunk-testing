import { actionZero, actionTypes } from '../examples/actions';
import {
  JestTester,
  SimpleTester,
  getDispatchFlow,
  ActionTester
} from './utils';

interface TestSuite {
  name: string;
  getTester(): ActionTester;
}

function runTesterSuite(option: TestSuite) {
  async function runActionCheck(extraArgs: any, exepctedResult: Array<string>) {
    const tester = option.getTester();

    tester.setThunkArgs(null, extraArgs);
    await tester.run(actionZero());

    expect(getDispatchFlow(tester)).toEqual(exepctedResult);
  }

  describe(option.name, () => {
    test('path 0 -> 3 -> 6', async () => {
      await runActionCheck({}, [
        actionTypes.ACTION_0,
        actionTypes.ACTION_3,
        actionTypes.ACTION_6
      ]);
    });

    test('path 0 -> 1 -> 4', async () => {
      await runActionCheck(
        {
          one: true
        },
        [actionTypes.ACTION_0, actionTypes.ACTION_1, actionTypes.ACTION_4]
      );
    });

    test('path 0 -> 1 -> 2 -> 4', async () => {
      await runActionCheck(
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

    test('path 0 -> 1 -> 2 -> 5 -> 6', async () => {
      await runActionCheck(
        {
          one: true,
          two: true
        },
        [
          actionTypes.ACTION_0,
          actionTypes.ACTION_1,
          actionTypes.ACTION_2,
          actionTypes.ACTION_5,
          actionTypes.ACTION_6
        ]
      );
    });
  });
}

describe('utils', () => {
  [
    {
      name: 'SimpleTester',
      getTester: () => new SimpleTester()
    },
    {
      name: 'JestTester',
      getTester: () => new JestTester(jest.fn())
    }
  ].forEach(runTesterSuite);
});