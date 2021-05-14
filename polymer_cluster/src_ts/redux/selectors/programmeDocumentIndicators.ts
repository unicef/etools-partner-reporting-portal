import {RootState} from '../../typings/redux.types';
import {createSelector} from 'reselect';

// App.Selectors.ProgrammeDocumentIndicators
export const pdIndicatorsAll = createSelector(pdId, pick('byPd'), byPd);
export const pdIndicatorsLoading = createSelector(pdId, pick('loading'), byPd);

function pdId(state: RootState) {
  return state.programmeDocuments.current;
}

function byPd(pdId: any, data: any) {
  return data[pdId];
}

function pick(key: string) {
  return function (state: RootState) {
    // @ts-ignore
    return state.programmeDocumentsIndicators[key];
  };
}
