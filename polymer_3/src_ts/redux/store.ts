
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
import {Partner} from './reducers/partner';
import {Indicators} from './reducers/indicators';
import {ProgrammeDocuments} from './reducers/programmeDocuments';
import {Analysis} from './reducers/analysis';
import {Config} from './reducers/config';
import {UserProfile} from './reducers/userProfile';
import {ProgrammeDocumentsIndicators} from './reducers/programmeDocumentsIndicators';
import {ProgrammeDocumentDetails} from './reducers/programmeDocumentDetails';
import {ProgrammeDocumentReports} from './reducers/programmeDocumentReports';
import {ProgrammeDocumentReportsAttachments} from './reducers/programmeDocumentReportsAttachments';
import {ProgressReports} from './reducers/progressReports';
import {ResponsePlans} from './reducers/responsePlans';
import {Disaggregations} from './reducers/disaggregations';
import {PartnerProjects} from './reducers/partnerProjects';
import {PartnerActivities} from './reducers/partnerActivities';


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
  // clusterActivities: ClusterActivities,
  // clusterObjectives: ClusterObjectives,
  // clusterDisaggregations: ClusterDisaggregations,
  // clusterIndicatorReports: ClusterIndicatorReports,
  // clusterDashboardData: ClusterDashboardData,
  userProfile: UserProfile,
  analysis: Analysis,
  config: Config
});

export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);
