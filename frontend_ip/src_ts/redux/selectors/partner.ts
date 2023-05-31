import {createSelector} from 'reselect';
import {RootState} from '../../typings/redux.types';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';

// use instead of App.Selectors.Partner.loading
export const partnerLoading = createSelector(
  (state: RootState) => state.partner.current,
  (state: RootState) => state.userProfile.profile,
  (currentPartner: GenericObject, profile?: GenericObject) => {
    return profile ? profile.partner && typeof currentPartner.id === 'undefined' : true;
  }
);
