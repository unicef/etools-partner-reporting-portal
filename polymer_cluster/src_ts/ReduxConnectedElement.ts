import {PolymerElement} from '@polymer/polymer';
import {store} from './redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import {property} from '@polymer/decorators';
import {RootState} from './typings/redux.types';
import {GenericObject} from './typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';

export class ReduxConnectedElement extends connect(store)(PolymerElement) {
  @property({type: Object})
  rootState!: RootState;

  @property({type: Object})
  reduxStore!: typeof store;

  private sDebouncer!: Debouncer;

  stateChanged(state: RootState) {
    this.sDebouncer = Debouncer.debounce(this.sDebouncer, timeOut.after(50), () => {
      // if (JSON.stringify(this.rootState) != JSON.stringify(state)) {
      this.rootState = state; // Assign by reference to reduce memory, clone before actual use
      // }
    });
  }

  constructor() {
    super();
    this.reduxStore = store;
  }

  getReduxStateValue(pathValue: string) {
    // console.log(pathValue);
    return pathValue;
  }

  getReduxStateArray(pathValue: []) {
    if (pathValue === undefined) {
      return undefined;
    }
    // console.log(pathValue);
    return [...pathValue];
  }

  getReduxStateObject(pathValue: GenericObject) {
    if (pathValue === undefined) {
      return undefined;
    }
    // console.log(pathValue);
    return {...pathValue};
  }
}
