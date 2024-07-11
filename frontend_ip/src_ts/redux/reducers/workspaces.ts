import { BASE_PATH } from '../../etools-prp-common/config';
import Constants from '../../etools-prp-common/constants';
import {Workspace} from '../../typings/entities.types';

export class WorkspacesState {
  all?: Workspace[];
  current?: string;
  baseUrl?: string;
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
        current: action.workspace,
        baseUrl: `/${BASE_PATH}/${action.workspace}/${action.app}`
      };

    default:
      return state;
  }
};
