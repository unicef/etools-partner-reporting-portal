import { createSelector } from 'reselect';
export const workspaceId = createSelector((state) => state.workspaces.all, (state) => state.workspaces.current, (workspaces, code) => {
    if (workspaces === undefined || code === undefined) {
        return void 0;
    }
    return workspaces.length
        ? workspaces.filter(function (workspace) {
            return workspace.code === code;
        })[0].id
        : void 0;
});
