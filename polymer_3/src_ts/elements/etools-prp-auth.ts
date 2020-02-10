import {PolymerElement} from '@polymer/polymer';
import UtilsMixin from '../mixins/utils-mixin';
import {property} from '@polymer/decorators/lib/decorators';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpAuth extends (UtilsMixin(PolymerElement)){

  @property({type: String})
  token!: string;
  // statePath: 'auth.token'

  @property({type: Boolean, notify: true, computed: '_computeAuthenticated(token)'})
  authenticated!: boolean;

  connectedCallback() {
    super.connectedCallback();
    // Use saved token, if present
    let savedToken = localStorage.getItem(this.token);

    if (savedToken && !this.token) {
      localStorage.setItem('etools-prp-auth-token', String(savedToken));
    }
  }

  _computeAuthenticated(token: string) {
    return !!token;
  }
}

window.customElements.define('etools-prp-auth', EtoolsPrpAuth);
