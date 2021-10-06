var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import LocalizeMixin from '../../../mixins/localize-mixin';
import Endpoints from '../../../endpoints';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class ClusterPartnerFilter extends LocalizeMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.data = [];
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax id="partnerNames" url="[[partnerNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter label="[[localize('partner')]]" name="partner" value="[[value]]" data="[[data]]">
    </searchable-dropdown-filter>
  `;
    }
    _computePartnerNamesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterPartnerNames(responsePlanId);
    }
    _fetchPartnerNames() {
        if (!this.partnerNamesUrl) {
            return;
        }
        const self = this;
        const thunk = this.$.partnerNames.thunk();
        this.$.partnerNames.abort();
        thunk()
            .then((res) => {
            self.set('data', [{
                    id: '',
                    title: 'All'
                }].concat(res.data || []));
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.partnerNames.abort();
    }
}
__decorate([
    property({ type: String, computed: '_computePartnerNamesUrl(responsePlanId)', observer: '_fetchPartnerNames' })
], ClusterPartnerFilter.prototype, "partnerNamesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterPartnerFilter.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Array })
], ClusterPartnerFilter.prototype, "data", void 0);
__decorate([
    property({ type: String })
], ClusterPartnerFilter.prototype, "value", void 0);
window.customElements.define('cluster-partner-filter', ClusterPartnerFilter);
