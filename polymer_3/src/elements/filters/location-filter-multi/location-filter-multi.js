var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter-multi';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import FilterDependenciesMixin from '../../../etools-prp-common/mixins/filter-dependencies-mixin';
import Endpoints from '../../../endpoints';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin FilterDependenciesMixin
 */
class LocationFilterMulti extends LocalizeMixin(FilterDependenciesMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.locationsUrl = '';
        this.pending = false;
    }
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-ajax id="locations" url="[[locationsUrl]]"> </etools-prp-ajax>

      <dropdown-filter-multi label="[[localize('location')]]" name="location" value="[[value]]" data="[[data]]">
      </dropdown-filter-multi>
    `;
    }
    static get observers() {
        return ['_fetchLocations(locationsUrl, params)'];
    }
    _computeLocationsUrl(locationId) {
        return locationId ? Endpoints.locations(locationId) : '';
    }
    _fetchLocations(url) {
        if (!url) {
            return;
        }
        this.$.locations.abort();
        this.$.locations
            .thunk()()
            .then((res) => {
            this.set('data', res.data);
        })
            // @ts-ignore
            .catch((_err) => {
            // TODO: error handling
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.locations.abort();
    }
}
__decorate([
    property({ type: String, computed: '_computeLocationsUrl(locationId)', observer: '_fetchLocations' })
], LocationFilterMulti.prototype, "locationsUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], LocationFilterMulti.prototype, "locationId", void 0);
__decorate([
    property({ type: Array })
], LocationFilterMulti.prototype, "data", void 0);
__decorate([
    property({ type: Boolean })
], LocationFilterMulti.prototype, "pending", void 0);
__decorate([
    property({ type: String })
], LocationFilterMulti.prototype, "value", void 0);
window.customElements.define('location-filter-multi', LocationFilterMulti);
