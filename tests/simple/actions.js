export function action1() {
  return {
    type: 'ACTION_1'
  };
}

export function action2() {
  return {
    type: 'ACTION_2'
  };
}

export function action() {
  return dispatch => {
    dispatch(action1());
    dispatch(action2());
  };
}
