import {combineReducers} from 'redux';
import Constants from '../../etools-prp-common/constants';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';

export class ProgrammeDocumentsState {
  all: any[] = [];
  current = '';
  count = 0;
  loading = false;
}

export const ProgrammeDocuments = combineReducers({
  all: allPDsReducer,
  current: currentPDReducer,
  count: PDsCountReducer,
  loading: loadingPDsReducer
});

function allPDsReducer(state: GenericObject[] = [], action: any) {
  switch (action.type) {
    case Constants.SET_PROGRAMME_DOCUMENTS:
      return action.data.slice();

    case Constants.ADD_PROGRAMME_DOCUMENTS:
      return state.concat([action.data]);

    case Constants.RESET:
      return [];

    default:
      return state;
  }
}

function currentPDReducer(state = '', action: any) {
  switch (action.type) {
    case Constants.SET_CURRENT_PD:
      return action.pdId;

    case Constants.RESET:
      return '';

    default:
      return state;
  }
}

function PDsCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_PROGRAMME_DOCUMENTS_COUNT:
      return action.count;

    default:
      return state;
  }
}

function loadingPDsReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.PROGRAMME_DOCUMENTS_LOADING_START:
      return true;

    case Constants.PROGRAMME_DOCUMENTS_LOADING_STOP:
      return false;

    default:
      return state;
  }
}
