import { JestActionTester } from '../../src';

import {
  makeSandwichesForEverybody,
  makeASandwichWithSecretSauce
} from './actions';

describe('readme-complex', () => {
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

      expect(tester.callTypes()).toEqual(['THUNK_ACTION', 'MAKE_SANDWICH']);
    });

    test('make a sandwich unsuccessfully', async () => {
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => {
        throw new Error('oops');
      });
      await tester.dispatch(makeASandwichWithSecretSauce('me'));

      expect(tester.callTypes()).toEqual(['THUNK_ACTION', 'APOLOGIZE']);

      expect(tester.callNumber(2)).toHaveProperty(
        'fromPerson',
        'The Sandwich Shop'
      );

      expect(tester.callNumber(2)).toHaveProperty('toPerson', 'me');
    });
  });

  describe('makeSandwichesForEverybody', () => {
    test('when shop is closed', async () => {
      getState.mockImplementation(() => ({
        sandwiches: {
          isShopOpen: false
        }
      }));

      const result = await tester.dispatch(makeSandwichesForEverybody());

      expect(tester.callTypes()).toEqual(['THUNK_ACTION']);
      expect(result).toEqual('closed');
    });

    test('have enough money to make sandwiches for all', async () => {
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => 'grandma');
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => 'me');
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => 'wife');
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => 'kids');
      getState.mockImplementation(() => ({
        sandwiches: {
          isShopOpen: true
        },
        myMoney: 100
      }));

      await tester.dispatch(makeSandwichesForEverybody());

      expect(tester.callTypes()).toEqual([
        'THUNK_ACTION', // makeSandwichesForEverybody
        'THUNK_ACTION', // makeASandwichWithSecretSauce('My Grandma')
        'MAKE_SANDWICH', // makeASandwich('My Grandma')
        'THUNK_ACTION', // makeASandwichWithSecretSauce('Me'))
        'THUNK_ACTION', // makeASandwichWithSecretSauce('My wife')
        'MAKE_SANDWICH', // makeASandwich('Me')
        'MAKE_SANDWICH', // makeASandwich('My wife')
        'THUNK_ACTION', // makeASandwichWithSecretSauce('our kids')
        'MAKE_SANDWICH', // makeASandwich('our kids')
        'WITHDRAW' // withdrawMoney
      ]);
    });
  });
});
