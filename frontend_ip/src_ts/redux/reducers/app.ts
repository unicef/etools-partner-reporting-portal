import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import Constants from '../../etools-prp-common/constants';

export class AppState {
  current: string | undefined = undefined;
  activeLanguage: string = 'en';
  routeDetails: EtoolsRouteDetails = {} as EtoolsRouteDetails;
}

const INITIAL_STATE = new AppState();

export const App = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case Constants.SET_APP:
      return {
        ...state,
        current: action.app
      };

    case Constants.UPDATE_ROUTE_DETAILS:
      return {
        ...state,
        routeDetails: action.routeDetails
      };

    case Constants.RESET:
      return new AppState();

    default:
      return state;
  }
};