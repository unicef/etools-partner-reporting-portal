import {Reducer} from 'redux';
import {UPDATE_USER_DATA, UPDATE_USER_PERMISSIONS} from '../actions/user';
import {EtoolsUserModel} from '../../components/user/user-model';
import {RootAction} from '../store';
import {AnyObject} from '../../types/globals';

export interface UserState {
  data: EtoolsUserModel | null;
  permissions: AnyObject | null;
}

const INITIAL_USER_DATA: UserState = {
  data: null,
  permissions: null
};

const userData: Reducer<UserState, RootAction> = (state = INITIAL_USER_DATA, action) => {
  switch (action.type) {
    case UPDATE_USER_DATA:
      return {
        ...state,
        data: action.data
      };
    case UPDATE_USER_PERMISSIONS:
      return {
        ...state,
        permissions: action.permissions
      };
    default:
      return state;
  }
};

export default userData;
