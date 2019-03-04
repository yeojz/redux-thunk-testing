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

      expect(tester.toTypes()).toEqual(['THUNK_ACTION', 'MAKE_SANDWICH']);
    });

    test('make a sandwich unsuccessfully', async () => {
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => {
        throw new Error('oops');
      });
      await tester.dispatch(makeASandwichWithSecretSauce('me'));

      expect(tester.toTypes()).toEqual(['THUNK_ACTION', 'APOLOGIZE']);

      expect(tester.index(1)).toHaveProperty('fromPerson', 'The Sandwich Shop');
      expect(tester.index(1)).toHaveProperty('toPerson', 'me');
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

      expect(tester.toTypes()).toEqual(['THUNK_ACTION']);
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

      expect(tester.toTypes()).toEqual([
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

    test('not enough money to make sandwiches for all + no sauce for me', async () => {
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => 'grandma');
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => {
        throw new Error('oops');
      });
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => 'wife');
      extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => 'kids');
      getState.mockImplementation(() => ({
        sandwiches: {
          isShopOpen: true
        },
        myMoney: 0
      }));

      await tester.dispatch(makeSandwichesForEverybody());

      expect(tester.toTypes()).toEqual([
        'THUNK_ACTION',
        'THUNK_ACTION',
        'MAKE_SANDWICH',
        'THUNK_ACTION',
        'APOLOGIZE',
        'THUNK_ACTION',
        'MAKE_SANDWICH',
        'THUNK_ACTION',
        'MAKE_SANDWICH',
        'APOLOGIZE'
      ]);
    });
  });
});
