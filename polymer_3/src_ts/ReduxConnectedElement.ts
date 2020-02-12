import {PolymerElement} from '@polymer/polymer';
import {store} from './redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import {property} from '@polymer/decorators';
import {RootState} from './typings/redux.types';
import {GenericObject} from './typings/globals.types';

export class ReduxConnectedElement extends connect(store)(PolymerElement) {
  @property({type: Object})
  elState!: RootState;

  stateChanged(state: RootState) {
    this.elState = state; // Assign by reference to reduce memory, clone before actual use
    console.log('stateChanged...');
  }

  getReduxStateValue(pathValue: string) {
    return pathValue;
  }

  getReduxStateArray(pathValue: []) {
    if (pathValue === undefined) {
      return undefined;
    }
    return [...pathValue];
  }

  getReduxStateObject(pathValue: GenericObject) {
    if (pathValue === undefined) {
      return undefined;
    }
    return {...pathValue};
  }
}
