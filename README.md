# redux-thunk-testing

> Test utility for less painful async thunk testing / snapshot testing

[![npm][npm-badge]][npm-link]
[![Build Status][circle-badge]][circle-link]
[![TypeScript Support][type-ts-badge]][type-ts-link]

---

<!-- TOC depthFrom:2 -->

- [Motivation](#motivation)
- [About This Package](#about-this-package)
- [Features](#features)
- [Installation](#installation)
- [Examples](#examples)
  - [About code in tests/complex](#about-code-in-testscomplex)
- [Notes](#notes)
  - [Functions/thunks are all assumed to be async](#functionsthunks-are-all-assumed-to-be-async)
  - [`THUNK_ACTION`](#thunkaction)
  - [Using thunks as the payload of a Flux Standard Action](#using-thunks-as-the-payload-of-a-flux-standard-action)
- [License](#license)

<!-- /TOC -->

## Motivation

[redux-thunk][redux-thunk-link] is a simple middleware for async and side-effects logic,
and is nearly as ubiquitous as redux itself.

However, as we add more complex flows and async actions, it becomes harder and more unwieldy to test.
There are projects like [redux-saga][redux-saga-link] which are designed to handle
such cases, but it might not be a viable option depending on requirements and constraints of
the project at hand.

## About This Package

`redux-thunk-testing` is a small utility/wrapper for testing these complex thunk actions and
their side effects. It runs through the action, executing all the thunks that are found,
and provides small utility methods to help with testing.

## Features

- **Snapshot Testing**
- Supports thunk.withExtraArgument
- Supports flux standard actions with a thunk function
- TypeScript support ([definition file](https://unpkg.com/redux-thunk-testing/index.d.ts))

## Installation

Install the library via:

```bash
npm install redux-thunk-testing --save-dev
```

## Examples

- [src/index.test.ts][index-test-ts]
- [tests/simple][example-simple]
- [tests/complex][example-complex]

### About code in tests/complex

These are sample tests written for the "make a sandwich" code from
`redux-thunk` [README.md][redux-thunk-readme-link]. The original code was converted
to use `async/await`, but otherwise no logic modifications were done to it.

**Snippet:**

```js
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

  // Snapshot Testing
  expect(tester.toSnapshot()).toEqual(expected);

  // Alternatively, just check the types
  expect(tester.toTypes()).toEqual([
    'THUNK_ACTION',
    'THUNK_ACTION',
    'MAKE_SANDWICH',
    'THUNK_ACTION',
    'THUNK_ACTION',
    'MAKE_SANDWICH',
    'MAKE_SANDWICH',
    'THUNK_ACTION',
    'MAKE_SANDWICH',
    'WITHDRAW'
  ]);
});
```

## Notes

### Functions/thunks are all assumed to be async

All thunks are treated as `async` methods / returning `promises`.
As such, you should always call `await` on the dispatch method of the ActionTester.

i.e. `await tester.dispatch(action())`

### `THUNK_ACTION`

This `action.type` is logged when the action being dispatched is a function an not
as a functional payload of a "Flux Standard Action"

```js
// Given
const action = () => async (dispatch, getState, extraArgs) => {
  // code ...
}

// testing for when
store.dispatch(action());

// will result in (within the test suite)
store.dispatch({
  type: 'THUNK_ACTION',
  payload: action()
})
```

### Using thunks as the payload of a Flux Standard Action

If you want to use thunk as the payload of a Flux Standard Action,
you'll need to add the following middleware.

```js
const thunkFSA = () => next => action => {
  if (typeof action.payload === 'function') {
     // Convert to a thunk action
    return next(action.payload);
  }
   return next(action);
}

// Add it to your redux store.
import thunk from 'redux-thunk';

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkFSA, // needs to be applied before the thunk
    thunk
  )
);
```

## License

`redux-thunk-testing` is [MIT licensed](./LICENSE)

[npm-badge]: https://img.shields.io/npm/v/redux-thunk-testing.svg?style=flat-square
[npm-link]: https://www.npmjs.com/package/redux-thunk-testing
[npm-next-badge]: https://img.shields.io/npm/v/redux-thunk-testing/next.svg?style=flat-square
[npm-downloads-badge]: https://img.shields.io/npm/dt/redux-thunk-testing.svg?style=flat-square
[circle-badge]: https://img.shields.io/circleci/project/github/yeojz/redux-thunk-testing/master.svg?style=flat-square
[circle-link]: https://circleci.com/gh/yeojz/redux-thunk-testing
[type-ts-badge]: https://img.shields.io/badge/typedef-.d.ts-blue.svg?style=flat-square&longCache=true
[type-ts-link]: https://github.com/yeojz/redux-thunk-testing/tree/master/src/index.ts

[redux-thunk-link]: https://www.npmjs.com/package/redux-thunk
[redux-thunk-readme-link]: https://github.com/reduxjs/redux-thunk/blob/d5b6921037ea4ac414e8b6ba3398e4cd6287784c/README.md#Composition
[redux-sage-link]: https://www.npmjs.com/package/redux-saga
[example-simple]: https://github.com/yeojz/redux-thunk-testing/blob/master/tests/simple
[example-complex]: https://github.com/yeojz/redux-thunk-testing/blob/master/tests/complex
[index-test-ts]: https://github.com/yeojz/redux-thunk-testing/blob/master/src/index.test.ts
