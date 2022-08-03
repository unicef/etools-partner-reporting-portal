import {Action, ActionCreator} from 'redux';
import {EtoolsUserModel} from '../../components/user/user-model';
// import {ThunkAction} from 'redux-thunk';
// import {RootState} from '../store';
import {AnyObject} from '../../types/globals';

export const UPDATE_USER_DATA = 'UPDATE_USER_DATA';
export const UPDATE_USER_PERMISSIONS = 'UPDATE_USER_PERMISSIONS';

export interface UserActionUpdate extends Action<'UPDATE_USER_DATA'> {
  data: EtoolsUserModel;
}
export interface UserActionUpdatePermissions extends Action<'UPDATE_USER_PERMISSIONS'> {
  permissions: AnyObject;
}

export type UserAction = UserActionUpdate | UserActionUpdatePermissions;
// @ts-ignore - for now
// type ThunkResult = ThunkAction<void, RootState, undefined, UserAction>;

export const updateUserData: ActionCreator<UserActionUpdate> = (data: EtoolsUserModel) => {
  return {
    type: UPDATE_USER_DATA,
    data
  };
};

export const updateUserPermissions: ActionCreator<UserActionUpdatePermissions> = (permissions: AnyObject) => {
  return {
    type: UPDATE_USER_PERMISSIONS,
    permissions
  };
};
