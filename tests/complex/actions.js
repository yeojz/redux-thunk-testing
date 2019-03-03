function makeASandwich(forPerson, secretSauce) {
  return {
    type: 'MAKE_SANDWICH',
    forPerson,
    secretSauce
  };
}

function apologize(fromPerson, toPerson, error) {
  return {
    type: 'APOLOGIZE',
    fromPerson,
    toPerson,
    error
  };
}

function withdrawMoney(amount) {
  return {
    type: 'WITHDRAW',
    amount
  };
}

export function makeASandwichWithSecretSauce(forPerson) {
  return async (dispatch, _, { api }) => {
    try {
      const sauce = await api.fetchSecretSauce();
      dispatch(makeASandwich(forPerson, sauce));
    } catch (error) {
      dispatch(apologize('The Sandwich Shop', forPerson, error));
    }
  };
}

export function makeSandwichesForEverybody() {
  return async (dispatch, getState) => {
    if (!getState().sandwiches.isShopOpen) {
      return;
    }

    await dispatch(makeASandwichWithSecretSauce('My Grandma'));

    await Promise.all([
      dispatch(makeASandwichWithSecretSauce('Me')),
      dispatch(makeASandwichWithSecretSauce('My wife'))
    ]);

    await dispatch(makeASandwichWithSecretSauce('Our kids'));

    await dispatch(
      getState().myMoney > 42
        ? withdrawMoney(42)
        : apologize('Me', 'The Sandwich Shop')
    );
  };
}
