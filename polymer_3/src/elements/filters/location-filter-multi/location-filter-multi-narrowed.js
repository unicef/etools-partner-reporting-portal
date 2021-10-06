var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/dropdown-filter-multi';
import '../../etools-prp-ajax';
import LocalizeMixin from '../../../mixins/localize-mixin';
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import Endpoints from '../../../endpoints';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { property } from '@polymer/decorators';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin FilterDependenciesMixin
 */
class LocationFilterMultiNarrowed extends LocalizeMixin(FilterDependenciesMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.locationsUrl = '';
        this.data = [];
        this.pending = false;
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="locations"
        url="[[locationsUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
        label="[[localize('location')]]"
        name="locs"
        value="[[value]]"
        on-value-changed="_onValueChanged"
        data="[[data]]"
        disabled="[[pending]]">
    </dropdown-filter-multi>
  `;
    }
    static get observers() {
        return ['_fetchLocations(locationsUrl, params)'];
    }
    _computeLocationsUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterLocationNames(responsePlanId);
    }
    _fetchLocations() {
        if (!this.locationsUrl || !this.params) {
            return;
        }
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
            const self = this;
            this.set('pending', true);
            this.$.locations.abort();
            this.$.locations.thunk()()
                .then((res) => {
                self.set('pending', false);
                self.set('data', res.data.results);
            })
                .catch((_err) => {
                // TODO: error handling
                self.set('pending', false);
            });
        });
    }
    _onValueChanged(e) {
        if (e.detail.value === '') {
            return;
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.locations.abort();
        if (this._debouncer && this._debouncer.isActive()) {
            this._debouncer.cancel();
        }
    }
}
__decorate([
    property({ type: String, computed: '_computeLocationsUrl(responsePlanId)' })
], LocationFilterMultiNarrowed.prototype, "locationsUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], LocationFilterMultiNarrowed.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Array })
], LocationFilterMultiNarrowed.prototype, "data", void 0);
__decorate([
    property({ type: Boolean })
], LocationFilterMultiNarrowed.prototype, "pending", void 0);
__decorate([
    property({ type: Object })
], LocationFilterMultiNarrowed.prototype, "params", void 0);
__decorate([
    property({ type: String })
], LocationFilterMultiNarrowed.prototype, "value", void 0);
window.customElements.define('location-filter-multi-narrowed', LocationFilterMultiNarrowed);
