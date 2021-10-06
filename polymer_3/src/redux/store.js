import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { Localize } from './reducers/localize';
import { Auth } from './reducers/auth';
import { Workspaces } from './reducers/workspaces';
import { Location } from './reducers/location';
import { App } from './reducers/app';
import { Partner } from './reducers/partner';
import { Indicators } from './reducers/indicators';
import { ProgrammeDocuments } from './reducers/programmeDocuments';
import { UserProfile } from './reducers/userProfile';
import { ProgrammeDocumentsIndicators } from './reducers/programmeDocumentsIndicators';
import { ProgrammeDocumentReports } from './reducers/programmeDocumentReports';
import { ProgrammeDocumentReportsAttachments } from './reducers/programmeDocumentReportsAttachments';
import { ProgressReports } from './reducers/progressReports';
import { ResponsePlans } from './reducers/responsePlans';
import { Disaggregations } from './reducers/disaggregations';
import { CurrenciesData } from './reducers/currencies';
// Sets up a Chrome extension for time travel debugging.
// See https://github.com/zalmoxisus/redux-devtools-extension for more information.
const devCompose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
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
    programmeDocumentReports: ProgrammeDocumentReports,
    programmeDocumentReportsAttachments: ProgrammeDocumentReportsAttachments,
    progressReports: ProgressReports,
    responsePlans: ResponsePlans,
    disaggregations: Disaggregations,
    userProfile: UserProfile,
    currencies: CurrenciesData
});
export const store = createStore(rootReducer, devCompose(applyMiddleware(thunk)));
