import UtilsMixin from '../mixins/utils-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {store} from '../redux/store';
import {setToken} from '../redux/actions';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpAuth extends (UtilsMixin(ReduxConnectedElement)){

  @property({type: String, computed: 'getReduxStateValue(state.auth.token)'})
  token!: string;
  // statePath: 'auth.token'

  @property({type: Boolean, notify: true, computed: '_computeAuthenticated(token)'})
  authenticated!: boolean;

  connectedCallback() {
    super.connectedCallback();
    // Use saved token, if present
    let savedToken = localStorage.getItem('token');

    if (savedToken && !this.token) {
      store.dispatch(setToken(savedToken));
    }
  }

  _computeAuthenticated(token: string) {
    return !!token;
  }
}

window.customElements.define('etools-prp-auth', EtoolsPrpAuth);
