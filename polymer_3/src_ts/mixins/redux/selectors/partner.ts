import {createSelector} from 'reselect';
import {RootState} from '../../../typings/redux.types';
import {GenericObject} from '../../../typings/globals.types';

//use instead of App.Selectors.Partner.loading
export const partnerLoading = createSelector(
  (state: RootState) => state.partner.current,
  (currentPartner: GenericObject) => {
    return typeof currentPartner.id === 'undefined';
  }
);
