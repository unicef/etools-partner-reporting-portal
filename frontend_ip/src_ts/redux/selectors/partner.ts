import {createSelector} from 'reselect';
import {RootState} from '../../typings/redux.types';

// use instead of App.Selectors.Partner.loading
export const partnerLoading = createSelector(
  (state: RootState) => state.partner.current,
  (state: RootState) => state.userProfile.profile,
  (currentPartner: any, profile?: any) => {
    return profile ? profile.partner && typeof currentPartner.id === 'undefined' : true;
  }
);
