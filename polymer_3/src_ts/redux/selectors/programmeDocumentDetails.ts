import {createSelector} from 'reselect';
import {RootState} from '../../typings/redux.types';
import {GenericObject} from '../../typings/globals.types';

// App.Selectors.ProgrammeDocumentDetails
export const programmeDocumentDetailsLoading = createSelector(
  function (state: RootState) {
    return state.programmeDocumentDetails.current;
  },
  function (currentPDDetails: GenericObject) {
    return typeof currentPDDetails.id === 'undefined';
  }
);
