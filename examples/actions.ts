import { CallAction } from '../src/common';

export const actionTypes = {
  ACTION_0: 'ACTION_0',
  ACTION_1: 'ACTION_1',
  ACTION_2: 'ACTION_2',
  ACTION_3: 'ACTION_3',
  ACTION_4: 'ACTION_4',
  ACTION_5: 'ACTION_5',
  ACTION_6: 'ACTION_6'
};

export function actionAnonymous() {
  return (dispatch: Function) => {
    return dispatch(actionSix());
  };
}

export function actionSix() {
  return {
    type: actionTypes.ACTION_6,
    payload: '6'
  };
}

export function actionFive() {
  return {
    type: actionTypes.ACTION_5,
    payload: '5'
  };
}

export function actionFour(): CallAction {
  return {
    type: actionTypes.ACTION_4,
    payload: false
  };
}

export function actionThree(): CallAction {
  return {
    type: actionTypes.ACTION_3,
    payload: (dispatch: Function) => {
      return dispatch(actionSix());
    }
  };
}

export function actionTwo(): CallAction {
  return {
    type: actionTypes.ACTION_2,
    payload: async (dispatch: Function, _: any, extraArgs: any) => {
      if (extraArgs.four) {
        await dispatch(actionFour());
        return {};
      }
      await dispatch(actionFive());
      await dispatch(actionAnonymous());
    }
  };
}

export function actionOne(): CallAction {
  return {
    type: actionTypes.ACTION_1,
    payload: async (dispatch: Function, _: any, extraArgs: any) => {
      if (extraArgs.two) {
        return extraArgs;
      }

      return await dispatch(actionFour());
    }
  };
}

export function actionZero(): CallAction {
  return {
    type: actionTypes.ACTION_0,
    payload: async (dispatch: Function, _: any, extraArgs: any) => {
      if (extraArgs.one) {
        const result = await dispatch(actionOne());

        if (result.two) {
          return await dispatch(actionTwo());
        }

        return;
      }

      return dispatch(actionThree());
    }
  };
}
