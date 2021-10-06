import Constants from '../../etools-prp-common/constants';
export class AppState {
    constructor() {
        this.current = undefined;
    }
}
const INITIAL_STATE = new AppState();
export const App = (state = INITIAL_STATE, action) => {
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
