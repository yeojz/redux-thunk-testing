# redux-thunk-testing

> Test utilities for less painful async thunk testing

[![npm][npm-badge]][npm-link]
[![Build Status][circle-badge]][circle-link]
[![npm downloads][npm-downloads-badge]][npm-link]
[![TypeScript Support][type-ts-badge]][type-ts-link]

---

<!-- TOC depthFrom:2 -->

- [Motivation](#motivation)
- [About This Package](#about-this-package)
- [Usage](#usage)
  - [Installation](#installation)
  - [Example](#example)
    - [Complex](#complex)
    - [Simple](#simple)
      - [actions.js](#actionsjs)
      - [actions.test.js](#actionstestjs)
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

## Usage

### Installation

Install the library via:

```bash
npm install redux-thunk-testing --save
```

### Example

#### Complex

Tests written for the "make a sandwich" code from the `redux-thunk` [Readme.md][redux-thunk-readme-link]
There has been slight modification to the example to use async/await.

A copy with some modifications using async/await can be found

The following is just one example. For all tests, refer to
the [tests/readme-complex][readme-complex] folder.

```js
test('make a sandwich unsuccessfully', async () => {
  extraArgs.api.fetchSecretSauce.mockImplementationOnce(() => {
    throw new Error('oops');
  });
  await tester.dispatch(makeASandwichWithSecretSauce('me'));

  // should call in this order
  expect(tester.callTypes()).toEqual(['THUNK_ACTION', 'APOLOGIZE']);

  expect(tester.callNumber(2)).toHaveProperty(
    'fromPerson',
    'The Sandwich Shop'
  );

  expect(tester.callNumber(2)).toHaveProperty('toPerson', 'me');
});
```

#### Simple

This example can be found at [tests/readme-simple][readme-simple] folder.

##### actions.js

```js
  function action1() {
    return {
      type: 'ACTION_1'
    }
  }

  function action2() {
    return {
      type: 'ACTION_2'
    }
  }

  function action() {
    return (dispatch) => {
      dispatch(action1())
      dispatch(action2())
    }
  }
```

##### actions.test.js

```js
test('should dispatch all actions in order', async () => {
  const tester = new JestTester(jest.fn()) // or new SimpleTester()
  await tester.dispatch(action());

  // Using bulk checks
  expect(tester.callTypes()).toEqual([
    "ACTION_1",
    "ACTION_2"
  ]);

  // Using a stepper
  const steps = tester.callStepper();
  expect(steps.next()).toHaveProperty('type', "ACTION_1");
  expect(steps.next()).toHaveProperty('type', "ACTION_2");
  expect(steps.next()).toBeUndefined();
})
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
[readme-simple]: https://github.com/yeojz/redux-thunk-testing/blob/master/tests/simple
[readme-complex]: https://github.com/yeojz/redux-thunk-testing/blob/master/tests/complex
