var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { property } from '@polymer/decorators';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class PartnerFilter extends LocalizeMixin(ReduxConnectedElement) {
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

    <etools-prp-ajax
        id="partnerNames"
        url="[[partnerNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
      label="[[localize('partner')]]"
      name="partner"
      value="[[computedValue]]"
      data="[[data]]">
    </searchable-dropdown-filter>
  `;
    }
    static get observers() {
        return ['_computeValue(data, value)'];
    }
    _computeLocationNamesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterIndicatorLocations(responsePlanId);
    }
    _computeUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterPartnerNames(responsePlanId);
    }
    _computeValue(data, value) {
        const self = this;
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
            const index = data.findIndex((item) => {
                return value === String(item.id);
            });
            const item = data[index === -1 ? 0 : index];
            self.set('computedValue', item ? item.id : '');
        });
    }
    _fetchPartnerNames() {
        const self = this;
        // this.$.partnerNames.abort();
        this.$.partnerNames.abort();
        this.$.partnerNames.thunk()()
            .then((res) => {
            const data = (self.required ? [] : [{
                    id: '',
                    title: 'All'
                }]).concat(res.data || []);
            self.set('data', data);
        })
            // @ts-ignore
            .catch((_err) => {
            // TODO: error handling
        });
    }
    disconnectedCallback() {
        super.connectedCallback();
        this.$.partnerNames.abort();
        if (this._debouncer && this._debouncer.isActive()) {
            this._debouncer.cancel();
        }
    }
}
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanId)', observer: '_fetchPartnerNames' })
], PartnerFilter.prototype, "partnerNamesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], PartnerFilter.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String })
], PartnerFilter.prototype, "computedValue", void 0);
__decorate([
    property({ type: String })
], PartnerFilter.prototype, "value", void 0);
__decorate([
    property({ type: Array })
], PartnerFilter.prototype, "data", void 0);
__decorate([
    property({ type: Boolean })
], PartnerFilter.prototype, "required", void 0);
window.customElements.define('partner-filter', PartnerFilter);
