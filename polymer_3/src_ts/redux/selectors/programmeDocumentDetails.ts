import {createSelector} from 'reselect';
import {RootState} from '../../typings/redux.types';

// App.Selectors.ProgrammeDocumentDetails
export const programmeDocumentDetailsLoading = createSelector(
  function (state: RootState) {
    return state.programmeDocumentDetails.current;
  },
  function (currentPDDetails) {
    return typeof currentPDDetails.id === 'undefined';
  }
)
