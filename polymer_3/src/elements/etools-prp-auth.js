var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import UtilsMixin from '../mixins/utils-mixin';
import { property } from '@polymer/decorators/lib/decorators';
import { ReduxConnectedElement } from '../ReduxConnectedElement';
import { setToken } from '../redux/actions';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpAuth extends (UtilsMixin(ReduxConnectedElement)) {
    connectedCallback() {
        super.connectedCallback();
        // Use saved token, if present
        let savedToken = localStorage.getItem('token');
        if (savedToken && !this.token) {
            this.reduxStore.dispatch(setToken(savedToken));
        }
    }
    _computeAuthenticated(token) {
        return !!token;
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.auth.token)' })
], EtoolsPrpAuth.prototype, "token", void 0);
__decorate([
    property({ type: Boolean, notify: true, computed: '_computeAuthenticated(token)' })
], EtoolsPrpAuth.prototype, "authenticated", void 0);
window.customElements.define('etools-prp-auth', EtoolsPrpAuth);
