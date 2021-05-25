import {createStore, compose, applyMiddleware, combineReducers, StoreEnhancer} from 'redux';

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
import {ClusterActivities} from './reducers/clusterActivities';
import {ClusterDashboardData} from './reducers/clusterDashboardData';
import {ClusterObjectives} from './reducers/clusterObjectives';
import {ClusterDisaggregations} from './reducers/clusterDisaggregations';
import {ClusterIndicatorReports} from './reducers/clusterIndicatorReports';
import {CurrenciesData} from './reducers/currencies';

declare global {
  interface Window {
    process?: Record<string, any>;
    /* eslint-disable-next-line no-undef */
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

// Sets up a Chrome extension for time travel debugging.
// See https://github.com/zalmoxisus/redux-devtools-extension for more information.
const devCompose: <Ext0, StateExt0>(f1: StoreEnhancer<Ext0, StateExt0>) => StoreEnhancer<Ext0, StateExt0> =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
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
  config: Config,
  currencies: CurrenciesData
});

export const store = createStore(rootReducer, devCompose(applyMiddleware(thunk)));

export type ReduxDispatch = typeof store.dispatch;
