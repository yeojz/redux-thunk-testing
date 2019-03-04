import { action, action1, action2 } from './actions';
import { JestActionTester, actionArraySnapshot } from '../../src';

describe('simple', () => {
  async function getTester() {
    const tester = new JestActionTester(jest.fn()); // or new SimpleTester()
    await tester.dispatch(action());
    return tester;
  }

  test('using types', async () => {
    const tester = await getTester();

    expect(tester.toTypes()).toEqual(['THUNK_ACTION', 'ACTION_1', 'ACTION_2']);
  });

  test('using tracer', async () => {
    const tester = await getTester();
    const steps = tester.toTracer();

    expect(steps.next()).toHaveProperty('type', 'THUNK_ACTION');
    expect(steps.next()).toHaveProperty('type', 'ACTION_1');
    expect(steps.next()).toHaveProperty('type', 'ACTION_2');
    expect(steps.next()).toBeUndefined();
  });

  test('using snapshot', async () => {
    const tester = await getTester();

    const expected = actionArraySnapshot([action(), action1(), action2()]);

    expect(tester.toSnapshot()).toEqual(expected);
  });
});
