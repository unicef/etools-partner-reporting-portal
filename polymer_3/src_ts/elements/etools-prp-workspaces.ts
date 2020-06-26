import {property} from '@polymer/decorators/lib/decorators';
import {ReduxConnectedElement} from '../ReduxConnectedElement';

/**
 * Why the f$%& is this component needed?
 * @polymer
 * @customElement
 */
class EtoolsPrpWorkspaces extends ReduxConnectedElement {
  @property({type: String, computed: 'getReduxStateValue(rootState.workspaces.current)'})
  _current!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.workspaces.all)'})
  _all!: any[];

  @property({type: String, notify: true, computed: '_computeCurrent(_current)'})
  current!: string;

  @property({type: Array, notify: true, computed: '_computeAll(_all)'})
  all!: any[];

  _computeCurrent(_current: string) {
    return _current;
  }

  _computeAll(_all: any[]) {
    return _all.slice();
  }
}

window.customElements.define('etools-prp-workspaces', EtoolsPrpWorkspaces);
