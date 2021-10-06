var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from '@polymer/decorators/lib/decorators';
import { ReduxConnectedElement } from '../etools-prp-common/ReduxConnectedElement';
/**
 * Why the f$%& is this component needed?
 * @polymer
 * @customElement
 */
class EtoolsPrpWorkspaces extends ReduxConnectedElement {
    _computeCurrent(_current) {
        return _current;
    }
    _computeAll(_all) {
        return _all.slice();
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.workspaces.current)' })
], EtoolsPrpWorkspaces.prototype, "_current", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.workspaces.all)' })
], EtoolsPrpWorkspaces.prototype, "_all", void 0);
__decorate([
    property({ type: String, notify: true, computed: '_computeCurrent(_current)' })
], EtoolsPrpWorkspaces.prototype, "current", void 0);
__decorate([
    property({ type: Array, notify: true, computed: '_computeAll(_all)' })
], EtoolsPrpWorkspaces.prototype, "all", void 0);
window.customElements.define('etools-prp-workspaces', EtoolsPrpWorkspaces);
