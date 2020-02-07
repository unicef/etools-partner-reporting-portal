import {LocaLizeState} from '../mixins/redux/reducers/localize';
import {AuthState} from '../mixins/redux/reducers/auth';
import {WorkspacesState} from '../mixins/redux/reducers/workspaces';
import {AppState} from '../mixins/redux/reducers/app';
import {PartnerState} from '../mixins/redux/reducers/partner';

export interface RootState {
  localize: LocaLizeState,
  auth: AuthState,
  workspaces: WorkspacesState,
  app: AppState,
  partner: PartnerState
}
