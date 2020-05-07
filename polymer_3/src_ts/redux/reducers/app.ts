import Constants from '../../constants';

export class AppState {
  current: string | undefined = undefined;
}

const INITIAL_STATE = new AppState();

export const App = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case Constants.SET_APP:
      return {
        current: action.app
      };

    case Constants.RESET:
      return new AppState();

    default:
      return state;
  }
};
