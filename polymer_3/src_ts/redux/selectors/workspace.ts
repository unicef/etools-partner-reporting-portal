import {createSelector} from 'reselect';
import {RootState} from '../../typings/redux.types';
import {Workspace} from '../../typings/entities.types';

export const workspaceId = createSelector(
  (state: RootState) => state.workspaces.all,
  (state: RootState) => state.workspaces.current,
  (workspaces?: Workspace[], code?: string) => {
    if (workspaces === undefined || code === undefined) {
      return void 0;
    }
    return workspaces.length
      ? workspaces.filter(function (workspace: any) {
          return workspace.code === code;
        })[0].id
      : void 0;
  }
);
