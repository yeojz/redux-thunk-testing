import { JestActionTester, actionArraySnapshot } from '../../src';

import {
  makeSandwichesForEverybody,
  makeASandwichWithSecretSauce,
  makeASandwich,
  withdrawMoney,
  apologize
} from './actions';

describe('complex', () => {
  let tester;

  const getState = jest.fn();
  const extraArgs = {
    api: {
      fetchSecretSauce: jest.fn()
    }
  };

  beforeEach(() => {
    getState.mockReset();
    extraArgs.api.fetchSecretSauce.mockReset();

    tester = new JestActionTester(jest.fn());
    tester.setArgs(getState, extraArgs);
  });

  describe('makeASandwichWithSecretSauce', () => {
    test('make a sandwich successfully', async () => {
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => 'ok sauce');
      await tester.dispatch(makeASandwichWithSecretSauce('me'));

      expect(tester.toTypes()).toEqual(['THUNK_ACTION', 'MAKE_SANDWICH']);
    });

    test('make a sandwich unsuccessfully', async () => {
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => {
        throw new Error('oops');
      });
      await tester.dispatch(makeASandwichWithSecretSauce('me'));
      const steps = tester.toTracer();

      steps.next(); // skipping one

      expect(steps.next()).toHaveProperty('fromPerson', 'The Sandwich Shop');
      expect(steps.current()).toHaveProperty('toPerson', 'me');
    });
  });

  describe('makeSandwichesForEverybody', () => {
    test('when shop is closed', async () => {
      getState.mockImplementation(() => ({
        sandwiches: {
          isShopOpen: false
        }
      }));

      await tester.dispatch(makeSandwichesForEverybody());

      const expected = actionArraySnapshot([makeSandwichesForEverybody()]);

      expect(tester.toSnapshot()).toEqual(expected);
    });

    test('have enough money to make sandwiches for all', async () => {
      extraArgs.api.fetchSecretSauce.mockImplementation(() => 'sauce');
      getState.mockImplementation(() => ({
        sandwiches: {
          isShopOpen: true
        },
        myMoney: 100
      }));

      await tester.dispatch(makeSandwichesForEverybody());

      const expected = actionArraySnapshot([
        makeSandwichesForEverybody(),
        makeASandwichWithSecretSauce('My Grandma'),
        makeASandwich('My Grandma', 'sauce'),
        makeASandwichWithSecretSauce('Me'),
        makeASandwichWithSecretSauce('My wife'),
        makeASandwich('Me', 'sauce'),
        makeASandwich('My wife', 'sauce'),
        makeASandwichWithSecretSauce('Our kids'),
        makeASandwich('Our kids', 'sauce'),
        withdrawMoney(42)
      ]);

      expect(tester.toSnapshot()).toEqual(expected);
    });

    test('not enough money to make sandwiches for all + no sauce for me', async () => {
      const err = new Error('oops');
      // Running setup twice because we're mocking each implementation once.
      // thus we need it for actionArraySnapshot();
      function setup() {
        extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => 'grandma');
        extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => {
          throw err;
        });
        extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => 'wife');
        extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => 'kids');
        getState.mockImplementation(() => ({
          sandwiches: {
            isShopOpen: true
          },
          myMoney: 0
        }));
      }

      setup();
      await tester.dispatch(makeSandwichesForEverybody());

      setup();
      const expected = actionArraySnapshot([
        makeSandwichesForEverybody(),
        makeASandwichWithSecretSauce('My Grandma'),
        makeASandwich('My Grandma', 'grandma'),
        makeASandwichWithSecretSauce('Me'),
        apologize('The Sandwich Shop', 'Me', err),
        makeASandwichWithSecretSauce('My wife'),
        makeASandwich('My wife', 'wife'),
        makeASandwichWithSecretSauce('Our kids'),
        makeASandwich('Our kids', 'kids'),
        apologize('Me', 'The Sandwich Shop')
      ]);

      expect(tester.toSnapshot()).toEqual(expected);
    });
  });
});
