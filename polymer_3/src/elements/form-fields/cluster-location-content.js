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
class ClusterLocationContent extends ReduxConnectedElement {
    constructor() {
        super(...arguments);
        this.locations = [];
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="locationNames"
        url="[[locationNamesUrl]]">
    </etools-prp-ajax>
  `;
    }
    _computeLocationNamesUrl(responsePlanID) {
        if (!responsePlanID) {
            return;
        }
        return Endpoints.clusterLocationNames(responsePlanID);
    }
    _fetchLocationNames() {
        if (!this.locationNamesUrl) {
            return;
        }
        const self = this;
        this.$.locationNames.abort();
        this.$.locationNames.thunk()()
            .then((res) => {
            self.set('locations', res.data);
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.locationNames.abort();
    }
}
__decorate([
    property({ type: Array, notify: true })
], ClusterLocationContent.prototype, "locations", void 0);
__decorate([
    property({ type: String, computed: '_computeLocationNamesUrl(responsePlanID)', observer: '_fetchLocationNames' })
], ClusterLocationContent.prototype, "locationNamesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterLocationContent.prototype, "responsePlanID", void 0);
window.customElements.define('cluster-location-content', ClusterLocationContent);
export { ClusterLocationContent as ClusterLocationContentEl };
