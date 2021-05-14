import UtilsMixin from '../mixins/utils-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {setToken} from '../redux/actions';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpAuth extends UtilsMixin(ReduxConnectedElement) {
  @property({type: String, computed: 'getReduxStateValue(rootState.auth.token)'})
  token!: string;

  @property({type: Boolean, notify: true, computed: '_computeAuthenticated(token)'})
  authenticated!: boolean;

  connectedCallback() {
    super.connectedCallback();
    // Use saved token, if present
    const savedToken = localStorage.getItem('token');

    if (savedToken && !this.token) {
      this.reduxStore.dispatch(setToken(savedToken));
    }
  }

  _computeAuthenticated(token: string) {
    return !!token;
  }
}

window.customElements.define('etools-prp-auth', EtoolsPrpAuth);
