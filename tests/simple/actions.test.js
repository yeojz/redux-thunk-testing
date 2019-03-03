import { action } from './actions';
import { JestActionTester } from '../../src';

describe('readme-simple', () => {
  test('using bulk comparison', async () => {
    const tester = new JestActionTester(jest.fn()); // or new SimpleTester()
    await tester.dispatch(action());

    expect(tester.callTypes()).toEqual([
      'THUNK_ACTION',
      'ACTION_1',
      'ACTION_2'
    ]);
  });

  test('using the stepper', async () => {
    const tester = new JestActionTester(jest.fn()); // or new SimpleTester()
    await tester.dispatch(action());

    const steps = tester.callStepper();
    expect(steps.next()).toHaveProperty('type', 'THUNK_ACTION');
    expect(steps.next()).toHaveProperty('type', 'ACTION_1');
    expect(steps.next()).toHaveProperty('type', 'ACTION_2');
    expect(steps.next()).toBeUndefined();
  });
});
