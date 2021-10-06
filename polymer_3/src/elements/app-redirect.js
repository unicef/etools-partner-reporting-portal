var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../ReduxConnectedElement';
import { property } from '@polymer/decorators';
import RoutingMixin from '../mixins/routing-mixin';
/**
 * @polymer
 * @customElement
 * @appliesMixin RoutingMixin
 */
class AppRedirect extends RoutingMixin(ReduxConnectedElement) {
    static get observers() {
        return [
            '_redirectIfNeeded(app, workspace, profile)'
        ];
    }
    _redirectIfNeeded(app, workspace, profile) {
        if (!app || !workspace || !profile) {
            return;
        }
        if (!profile.access || !profile.access.length) {
            location.href = '/unauthorized';
        }
        else if (profile.access.indexOf(app) === -1) {
            // @ts-ignore
            location.href = this.buildBaseUrl(workspace, profile.access[0]);
        }
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.app.current)' })
], AppRedirect.prototype, "app", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.workspaces.current)' })
], AppRedirect.prototype, "workspace", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)' })
], AppRedirect.prototype, "profile", void 0);
window.customElements.define('app-redirect', AppRedirect);
export { AppRedirect as AppRedirectEl };
