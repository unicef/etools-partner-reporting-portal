var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import './dropdown-form-input';
import '../etools-prp-ajax';
import Endpoints from '../../endpoints';
/**
 * @polymer
 * @customElement
 */
class ClusterDropdownContent extends ReduxConnectedElement {
    constructor() {
        super(...arguments);
        this.clusters = [];
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
      id="clusterNames"
      url="[[clusterNamesUrl]]"
      params="[[params]]">
    </etools-prp-ajax>
  `;
    }
    static get observers() {
        return [
            '_fetchClusterNames(clusterNamesUrl, params)'
        ];
    }
    _computeClusterNamesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterNames(responsePlanId);
    }
    _computeParams(partner) {
        if (partner) {
            return { partner: partner };
        }
        return {};
    }
    _fetchClusterNames() {
        if (!this.clusterNamesUrl) {
            return;
        }
        const self = this;
        this.$.clusterNames.abort();
        this.$.clusterNames.thunk()()
            .then((res) => {
            self.set('clusters', res.data);
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.clusterNames.abort();
    }
}
__decorate([
    property({ type: String })
], ClusterDropdownContent.prototype, "partner", void 0);
__decorate([
    property({ type: Object, computed: '_computeParams(partner)' })
], ClusterDropdownContent.prototype, "params", void 0);
__decorate([
    property({ type: String, computed: '_computeClusterNamesUrl(responsePlanId)', observer: '_fetchClusterNames' })
], ClusterDropdownContent.prototype, "clusterNamesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterDropdownContent.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)' })
], ClusterDropdownContent.prototype, "responsePlanCurrent", void 0);
__decorate([
    property({ type: Array, notify: true })
], ClusterDropdownContent.prototype, "clusters", void 0);
window.customElements.define('cluster-dropdown-content', ClusterDropdownContent);
export { ClusterDropdownContent as ClusterDropdownContentEl };
