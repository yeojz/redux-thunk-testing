# redux-thunk-testing

> Test utility and Snapshot testing for complex and nested redux-thunks

[![npm][npm-badge]][npm-link]
[![Build Status][circle-badge]][circle-link]
[![Coverage Status][codecov-badge]][codecov-link]
[![TypeScript Support][type-ts-badge]][type-ts-link]

---

<!-- TOC depthFrom:2 -->

- [Motivation](#motivation)
- [About This Package](#about-this-package)
- [Features](#features)
- [Installation](#installation)
- [Documentation](#documentation)
- [Examples](#examples)
  - [About the redux-thunk-readme-example](#about-the-redux-thunk-readme-example)
- [Notes](#notes)
  - [Thunks are assumed to be async](#thunks-are-assumed-to-be-async)
  - [`THUNK_ACTION`](#thunkaction)
  - [Flux Standard Action with Thunk payload](#flux-standard-action-with-thunk-payload)
- [License](#license)

<!-- /TOC -->

## Motivation

[redux-thunk][redux-thunk-link] is a simple middleware for async and side-effects logic,
and is nearly as ubiquitous as redux itself.

However, as more complex flows and async actions are added, it becomes harder and more unwieldy to test.
Some projects like [redux-saga][redux-saga-link] were created to help handle such issues, but
there might be situations where using such projects might not be a viable option due to
constraints and requirements of the project.

## About This Package

`redux-thunk-testing` is a small utility/wrapper which aims to help in testing complex thunk actions
and their side effects easily. Conceptually, it runs through the action, executing all the thunks that
are found, and subsequently provides utilities around the results for testing.

## Features

- Supports **Snapshot Testing**
- Test framework agnostic.
  - Provides `ActionTester` which can be used on it's own.
  - Provides `JestActionTester` for usage with `jest.fn()`
- Supports `thunk.withExtraArgument`
  - For more info about extraArguments, check out: [here][article-redux-thunk-readme] and [here][article-medium]
- Supports `flux standard actions` with a thunk function as payload. [see notes](#flux-standard-action-with-thunk-payload)
- TypeScript support ([definition file](https://unpkg.com/redux-thunk-testing/index.d.ts))
- Provides both `functional` and `classes` utilities.

## Installation

Install the library via:

```bash
npm install redux-thunk-testing --save-dev
```

## Documentation

Quick overview of functions / classes

- `class` ActionTester
- `class` JestActionTester
- `function` actionArraySnapshot
- `function` actionSnapshot
- `function` actionTesterSnapshot
- `function` actionTracer
- `function` actionTypes
- `function` createActionRunner

Please refer to [Project Documentation][project-docs] for the full list
of available methods.

## Examples

- [simple][example-simple]
  - [snapshot][example-simple-snapshot]
- [redux-thunk-readme-example][redux-thunk-readme-example]
  - [snapshot][redux-thunk-readme-example-snapshot]

### About the redux-thunk-readme-example

These are sample tests written for the "make a sandwich" code example from
`redux-thunk` [README.md][redux-thunk-readme-link]. A copy of the example
has been copied over. Please see [redux-thunk-readme-example/action.js][redux-thunk-readme-example-action-js].

**Small change:**

Unlike the original example, `fetchSecretSauce()` is assumed to be injected as an extraArgument
to a thunk. _This is the only change._

**Snippet:**

```js
test('have enough money to make sandwiches for all', async () => {
  // Setup tester + other thunk paramters
  const tester = new JestActionTester(jest.fn());
  // OR if you're not using jest.
  const tester = new ActionTester();

  // Setup other optional thunk parameters if you use them.
  // It is highly recommended to use thunk.withExtraArguments to inject
  // your dependencies like apis. It makes testing much easier as shown here.
  const getState = jest.fn();
  const extraArgs = {
    api: {
      fetchSecretSauce: jest.fn()
    }
  };
  tester.setArgs(getState, extraArgs);

  // Mocking the return values of api etc.
  extraArgs.api.fetchSecretSauce.mockImplementation(() => Promise.resolve('sauce'));
  getState.mockImplementation(() => ({
    sandwiches: {
      isShopOpen: true
    },
    myMoney: 100
  }));

  // Dispatch the action
  await tester.dispatch(makeSandwichesForEverybody());

  // Using Jest Snapshot
  expect(tester.toSnapshot()).toMatchSnapshot();

  // Snapshot Testing
  // Generating our own inline snapshot with
  // expected function calls
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

### Thunks are assumed to be async

All thunks are treated as `async` methods / returning `promises`.
As such, you should always call `await` or `Promise.resolve` when
dispatching the action with ActionTester.

i.e. `await tester.dispatch(action())` or `Promise.resolve(tester.dispatch(action()))`

Even if you're returning a basic type (eg: `boolean`, `string`), the parser will
still call it with `async` / `Promise.resolve`

### `THUNK_ACTION`

This `action.type` is logged when the action being dispatched is a direct function / thunk and not
a functional payload of a "Flux Standard Action"

```js
// Given
const action = () => async (dispatch, getState, extraArgs) => {
  // code ...
}

// when testing
tester.dispatch(action());

// will resolve to (within the test suite)
tester.dispatch({
  type: 'THUNK_ACTION',
  payload: action()
})
```

### Flux Standard Action with Thunk payload

p.s: **This is optional**

If you don't want to see "THUNK_ACTION" in your tests, you
might want to consider dispatching FSA with a thunk payload.

i.e.

```js
// Instead of
function action() {
  return dispatch => {
    // code
  }
}

// Try
function action() {
  return {
    type: "NAMED_ACTION",
    payload: dispatch => {
      // code
    }
  }
}

```

However, in order to do the above, you'll need the following middleware.

```js
const fsaThunk = () => next => action => {
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
    fsaThunk, // needs to be applied before the thunk
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
[codecov-badge]: https://img.shields.io/codecov/c/github/yeojz/redux-thunk-testing/master.svg?style=flat-square
[codecov-link]: https://codecov.io/gh/yeojz/redux-thunk-testing
[project-docs]: https://yeojz.github.io/redux-thunk-testing

[redux-saga-link]: https://www.npmjs.com/package/redux-saga

[example-simple]: https://github.com/yeojz/redux-thunk-testing/blob/master/examples/simple
[example-simple-snapshot]: https://github.com/yeojz/redux-thunk-testing/blob/master/examples/simple/__snapshots__/actions.test.js.snap

[redux-thunk-link]: https://www.npmjs.com/package/redux-thunk
[redux-thunk-readme-link]: https://github.com/reduxjs/redux-thunk/blob/d5b6921037ea4ac414e8b6ba3398e4cd6287784c/README.md#Composition
[redux-thunk-readme-example]: https://github.com/yeojz/redux-thunk-testing/blob/master/examples/redux-thunk-readme-example
[redux-thunk-readme-example-action-js]: https://github.com/yeojz/redux-thunk-testing/blob/master/examples/complex/action.js
[redux-thunk-readme-example-snapshot]: https://github.com/yeojz/redux-thunk-testing/blob/master/examples/complex/__snapshots__/actions.test.js.snap

[article-redux-thunk-readme]: https://github.com/reduxjs/redux-thunk#injecting-a-custom-argument
[article-medium]: https://medium.com/@yeojz/redux-thunk-skipping-mocks-using-withextraargument-513d38d38554
