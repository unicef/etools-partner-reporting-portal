import Constants from '../../constants';
import {Workspace} from '../../typings/entities.types';

export class WorkspacesState {
  all?: Workspace[];
  current?: string;
}

const INITIAL_STATE = new WorkspacesState();

export const Workspaces = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case Constants.SET_WORKSPACES:
      return {
        ...state,
        all: action.workspaces.slice()
      };

    case Constants.RESET:
      return new WorkspacesState();

    case Constants.SET_WORKSPACE:
      return {
        ...state,
        current: action.workspace
      };

    default:
      return state;
  }
};
