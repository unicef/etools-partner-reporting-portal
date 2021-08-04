import {LocaLizeState} from '../redux/reducers/localize';
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

export interface RootState {
  localize: LocaLizeState;
  auth: AuthState;
  workspaces: WorkspacesState;
  app: AppState;
  partner: PartnerState;
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
