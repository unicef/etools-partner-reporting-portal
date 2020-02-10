import {PolymerElement} from '@polymer/polymer';
import {store} from './redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import {property} from '@polymer/decorators';
import {RootState} from './typings/redux.types';
import {GenericObject} from './typings/globals.types';

export class ReduxConnectedElement extends connect(store)(PolymerElement) {
  @property({type: Object})
  state!: RootState;

  stateChanged(state: RootState) {
    this.state = state; // Assign by reference to reduce memory, clone before actual use
  }

  getReduxStateValue(pathValue: string) {
    return pathValue;
  }

  getReduxStateArray(pathValue: Array<GenericObject>) {
    return [...pathValue];
  }

  getReduxStateObject(pathValue: GenericObject) {
    return {...pathValue};
  }
}
