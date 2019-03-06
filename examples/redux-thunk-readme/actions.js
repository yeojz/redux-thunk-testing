export function makeASandwich(forPerson, secretSauce) {
  return {
    type: 'MAKE_SANDWICH',
    forPerson,
    secretSauce
  };
}

export function apologize(fromPerson, toPerson, error) {
  return {
    type: 'APOLOGIZE',
    fromPerson,
    toPerson,
    error: error ? error.message : error
  };
}

export function withdrawMoney(amount) {
  return {
    type: 'WITHDRAW',
    amount
  };
}

export function makeASandwichWithSecretSauce(forPerson) {
  return function(dispatch, _, { api }) {
    return api
      .fetchSecretSauce()
      .then(
        sauce => dispatch(makeASandwich(forPerson, sauce)),
        error => dispatch(apologize('The Sandwich Shop', forPerson, error))
      );
  };
}

export function makeSandwichesForEverybody() {
  return function(dispatch, getState) {
    if (!getState().sandwiches.isShopOpen) {
      return Promise.resolve();
    }

    return dispatch(makeASandwichWithSecretSauce('My Grandma'))
      .then(() =>
        Promise.all([
          dispatch(makeASandwichWithSecretSauce('Me')),
          dispatch(makeASandwichWithSecretSauce('My wife'))
        ])
      )
      .then(() => dispatch(makeASandwichWithSecretSauce('Our kids')))
      .then(() =>
        dispatch(
          getState().myMoney > 42
            ? withdrawMoney(42)
            : apologize('Me', 'The Sandwich Shop')
        )
      );
  };
}
