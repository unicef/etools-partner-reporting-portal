import {LocaLizeState} from '../redux/reducers/localize';
import {AuthState} from '../redux/reducers/auth';
import {WorkspacesState} from '../redux/reducers/workspaces';
import {AppState} from '../redux/reducers/app';
import {PartnerState} from '../redux/reducers/partner';

export interface RootState {
  localize: LocaLizeState,
  auth: AuthState,
  workspaces: WorkspacesState,
  app: AppState,
  partner: PartnerState
}
