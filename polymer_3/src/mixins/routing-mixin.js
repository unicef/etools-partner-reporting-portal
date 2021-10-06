var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from '@polymer/decorators';
import { BASE_PATH } from '../config';
/**
 * @polymer
 * @mixinFunction
 */
function RoutingMixin(baseClass) {
    class RoutingClass extends baseClass {
        constructor() {
            super(...arguments);
            this.BEHAVIOR_NAME = 'RoutingBehavior';
        }
        _$computeBaseUrl(workspace, app) {
            return '/' + BASE_PATH + '/' + workspace + '/' + app;
        }
        _$computeBaseUrlCluster(workspace, app, planId) {
            return this._$computeBaseUrl(workspace, app) + '/plan/' + planId;
        }
        buildBaseUrl() {
            return this._$computeBaseUrl.apply(this, arguments);
        }
        /**
         * Need pass baseUrl so polymer knew when to update the
         * expression within the template.
         */
        buildUrl(baseUrl, tail) {
            if (tail.length && tail[0] !== '/') {
                tail = '/' + tail;
            }
            return baseUrl + tail;
        }
        connectedCallback() {
            super.connectedCallback();
            const self = this;
            setTimeout(() => {
                if (typeof this.reduxStore.dispatch !== 'function') { // Duck typing
                    throw new Error(self.BEHAVIOR_NAME + ' requires ReduxBehavior');
                }
            });
        }
    }
    __decorate([
        property({ type: String, computed: 'getReduxStateValue(rootState.workspaces.current)' })
    ], RoutingClass.prototype, "_$currentWorkspace", void 0);
    __decorate([
        property({ type: String, computed: 'getReduxStateValue(rootState.app.current)' })
    ], RoutingClass.prototype, "_$currentApp", void 0);
    __decorate([
        property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
    ], RoutingClass.prototype, "_$currentPlan", void 0);
    __decorate([
        property({ type: String, computed: '_$computeBaseUrl(_$currentWorkspace, _$currentApp)' })
    ], RoutingClass.prototype, "_baseUrl", void 0);
    __decorate([
        property({ type: String, computed: '_$computeBaseUrlCluster(_$currentWorkspace, _$currentApp, _$currentPlan)' })
    ], RoutingClass.prototype, "_baseUrlCluster", void 0);
    return RoutingClass;
}
export default RoutingMixin;
