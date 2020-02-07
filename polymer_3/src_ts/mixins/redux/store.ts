
import {
  createStore,
  compose,
  applyMiddleware,
  combineReducers
} from 'redux';

import thunk from 'redux-thunk';
import {Localize} from './reducers/localize';
import {Auth} from './reducers/auth';
import {Workspaces} from './reducers/workspaces';
import {Location} from './reducers/location';
import {App} from './reducers/app';


declare global {
  interface Window {
    process?: Record<string, any>;
    /* eslint-disable-next-line no-undef */
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}


var composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

let rootReducer = combineReducers({
  localize: Localize,
  auth: Auth,
  workspaces: Workspaces,
  location: Location,
  app: App,
  partner: Partner,
  indicators: Indicators,
  programmeDocuments: ProgrammeDocuments,
  programmeDocumentsIndicators: ProgrammeDocumentsIndicators,
  programmeDocumentDetails: ProgrammeDocumentDetails,
  programmeDocumentReports: ProgrammeDocumentReports,
  programmeDocumentReportsAttachments: ProgrammeDocumentReportsAttachments,
  progressReports: ProgressReports,
  responsePlans: ResponsePlans,
  disaggregations: Disaggregations,
  partnerProjects: PartnerProjects,
  partnerActivities: PartnerActivities,
  clusterActivities: ClusterActivities,
  clusterObjectives: ClusterObjectives,
  clusterDisaggregations: ClusterDisaggregations,
  clusterIndicatorReports: ClusterIndicatorReports,
  clusterDashboardData: ClusterDashboardData,
  userProfile: UserProfile,
  analysis: Analysis,
  config: Config
});

export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);
