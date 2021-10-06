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
class ClusterDropdownInput extends ReduxConnectedElement {
    constructor() {
        super(...arguments);
        this.loading = true;
        this.required = false;
        this.invalid = true;
        this.data = [];
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
        url="[[clusterNamesUrl]]">
    </etools-prp-ajax>

    <template is="dom-if" if="[[!loading]]">
      <dropdown-form-input
        id="field"
        label="Cluster"
        name="cluster"
        disabled="[[disabled]]"
        required="[[required]]"
        value="{{value}}"
        data="[[data]]">
      </dropdown-forn-input>
    </template>
  `;
    }
    _computeClusterNamesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterNames(responsePlanId);
    }
    _computeLoading(data) {
        return !data.length;
    }
    _fetchClusterNames() {
        if (!this.clusterNamesUrl) {
            return;
        }
        const self = this;
        this.$.clusterNames.abort();
        this.$.clusterNames.thunk()()
            .then((res) => {
            self.set('data', res.data);
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    _computeInvalid(required, value) {
        return required && !value;
    }
    validate() {
        return this.shadowRoot.querySelector('#field').validate();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.clusterNames.abort();
    }
}
__decorate([
    property({ type: String, computed: '_computeClusterNamesUrl(responsePlanId)', observer: '_fetchClusterNames' })
], ClusterDropdownInput.prototype, "clusterNamesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterDropdownInput.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeLoading(data)' })
], ClusterDropdownInput.prototype, "loading", void 0);
__decorate([
    property({ type: Boolean })
], ClusterDropdownInput.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, notify: true, computed: '_computeInvalid(required, value)' })
], ClusterDropdownInput.prototype, "invalid", void 0);
__decorate([
    property({ type: Array })
], ClusterDropdownInput.prototype, "data", void 0);
__decorate([
    property({ type: Number, notify: true })
], ClusterDropdownInput.prototype, "value", void 0);
window.customElements.define('cluster-dropdown-input', ClusterDropdownInput);
export { ClusterDropdownInput as ClusterDropdownInputEl };
