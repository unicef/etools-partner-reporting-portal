import {getPartnersDummyData, geUnicefUsersDummyData} from '../../components/pages/ip-reporting/list/list-dummy-data';
import {Action, ActionCreator} from 'redux';
import {AnyObject} from '@unicef-polymer/etools-types';

export const SET_UNICEF_USERS_DATA = 'SET_UNICEF_USERS_DATA';
export const SET_PARTNERS = 'SET_PARTNERS';

export interface CommonDataActionSetUnicefUsersData extends Action<'SET_UNICEF_USERS_DATA'> {
  unicefUsersData: AnyObject[];
}

export type CommonDataAction = CommonDataActionSetUnicefUsersData;

export const setUnicefUsers: ActionCreator<CommonDataActionSetUnicefUsersData> = (unicefUsersData: AnyObject[]) => {
  return {
    type: SET_UNICEF_USERS_DATA,
    unicefUsersData
  };
};

export const setPartners = (partners: AnyObject[]) => {
  return {
    type: SET_PARTNERS,
    partners
  };
};

export const loadPartners = () => (dispatch: any) => {
  // here will make request to endpoint to load data
  dispatch(setPartners(getPartnersDummyData()));
};

export const loadUnicefUsers = () => (dispatch: any) => {
  // here will make request to endpoint to load data
  dispatch(setUnicefUsers(geUnicefUsersDummyData()));
};
