
import {createSelector} from 'reselect';
import {RootState} from '../../typings/redux.types';
import {Workspace} from '../../typings/entities.types';

//use instead of App.Selectors.Workspace.id
export const workspaceId = createSelector(
  (state: RootState) => state.workspaces.all,
  (state: RootState) => state.workspaces.current,
  (workspaces: Workspace[], code: string) => {
    return workspaces.length ? workspaces.filter(function (workspace: any) {
      return workspace.code === code;
    })[0].id : void 0;
  }
);
