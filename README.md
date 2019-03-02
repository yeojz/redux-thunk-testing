# redux-thunk-testing

> Test utilities for less painful async thunk testing

[![npm][npm-badge]][npm-link]
[![Build Status][circle-badge]][circle-link]
[![npm downloads][npm-downloads-badge]][npm-link]
[![TypeScript Support][type-ts-badge]][type-ts-link]

---

<!-- TOC depthFrom:2 -->

- [The problem](#the-problem)
- [About this package](#about-this-package)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [License](#license)

<!-- /TOC -->

## The problem

[redux-thunk](https://www.npmjs.com/package/redux-thunk) is a simple middleware
for async and side-effects logic, and is nearly as ubiquitous as redux itself.

However, as we add more complex async actions, it becomes harder and more unwieldy to test.
There are projects [redux-saga](https://www.npmjs.com/package/redux-saga) which are designed to handle
such cases, but it might not be a viable option depending on requirements and project at hand.

## About this package

`redux-thunk-testing` is a utility class for testing these complex thunk actions and their side effects.

## Installation

Install the library via:

```bash
npm install redux-thunk-testing --save
```

## Getting Started

```js
export function action1() {
  return {
    type: "ACTION_1",
    payload: async (dispatch) => {
      await dispatch(action2());
      await dispatch(action3());
    }
  };
}
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
[type-ts-link]: https://github.com/yeojz/redux-thunk-testing/tree/master/packages/types-ts
