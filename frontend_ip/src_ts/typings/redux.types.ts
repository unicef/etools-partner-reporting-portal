import {AuthState} from '../redux/reducers/auth';
import {WorkspacesState} from '../redux/reducers/workspaces';
import {AppState} from '../redux/reducers/app';
import {PartnerState} from '../redux/reducers/partner';
import {ProgrammeDocumentsState} from '../redux/reducers/programmeDocuments';
import {UserProfileState} from '../redux/reducers/userProfile';
import {IndicatorsState} from '../redux/reducers/indicators';
import {ProgrammeDocumentsIndicatorsState} from '../redux/reducers/programmeDocumentsIndicators';
import {ProgrammeDocumentReportsState} from '../redux/reducers/programmeDocumentReports';
import {ProgrammeDocumentReportsAttachmentsState} from '../redux/reducers/programmeDocumentReportsAttachments';
import {ProgressReportsState} from '../redux/reducers/progressReports';
import {ResponsePlansState} from '../redux/reducers/responsePlans';
import {DisaggregationsState} from '../redux/reducers/disaggregations';
import {CurrenciesDataState} from '../redux/reducers/currencies';
import {LocationState} from '../redux/reducers/location';
import {ActiveLanguageState} from '../redux/reducers/active-language';

export interface RootState {
  activeLanguage: ActiveLanguageState;
  auth: AuthState;
  workspaces: WorkspacesState;
  app: AppState;
  partner: PartnerState;
  location: LocationState;
  indicators: IndicatorsState;
  programmeDocuments: ProgrammeDocumentsState;
  programmeDocumentsIndicators: ProgrammeDocumentsIndicatorsState;
  programmeDocumentReports: ProgrammeDocumentReportsState;
  programmeDocumentReportsAttachments: ProgrammeDocumentReportsAttachmentsState;
  progressReports: ProgressReportsState;
  responsePlans: ResponsePlansState;
  disaggregations: DisaggregationsState;
  userProfile: UserProfileState;
  currencies: CurrenciesDataState;
}
