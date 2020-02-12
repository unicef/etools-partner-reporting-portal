import {PolymerElement} from '@polymer/polymer';
import {store} from './redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import {property} from '@polymer/decorators';
import {RootState} from './typings/redux.types';
import {GenericObject} from './typings/globals.types';

export class ReduxConnectedElement extends connect(store)(PolymerElement) {
  @property({type: Object})
  rootState!: RootState;

  stateChanged(state: RootState) {
    this.rootState = state; // Assign by reference to reduce memory, clone before actual use
    console.log('stateChanged...');
  }

  getReduxStateValue(pathValue: string) {
    console.log(pathValue);
    return pathValue;
  }

  getReduxStateArray(pathValue: []) {
    if (pathValue === undefined) {
      return undefined;
    }
    console.log(pathValue);
    return [...pathValue];
  }

  getReduxStateObject(pathValue: GenericObject) {
    if (pathValue === undefined) {
      return undefined;
    }
    console.log(pathValue);
    return {...pathValue};
  }
}
