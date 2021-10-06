import Constants from '../../etools-prp-common/constants';
export class WorkspacesState {
}
const INITIAL_STATE = new WorkspacesState();
export const Workspaces = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case Constants.SET_WORKSPACES:
            return Object.assign(Object.assign({}, state), { all: action.workspaces.slice() });
        case Constants.RESET:
            return new WorkspacesState();
        case Constants.SET_WORKSPACE:
            return Object.assign(Object.assign({}, state), { current: action.workspace });
        default:
            return state;
    }
};
