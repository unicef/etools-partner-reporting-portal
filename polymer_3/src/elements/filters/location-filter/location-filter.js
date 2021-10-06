var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import { ReduxConnectedElement } from '../../../etools-prp-common/ReduxConnectedElement';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class LocationFilter extends LocalizeMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.value = '';
        this.data = [];
    }
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-ajax id="locations" url="[[locationsUrl]]"> </etools-prp-ajax>

      <searchable-dropdown-filter label="[[localize('location')]]" name="location" value="[[value]]" data="[[data]]">
      </searchable-dropdown-filter>
    `;
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
            this.set('data', [
                {
                    id: '',
                    title: 'All'
                }
            ].concat(res.data || []));
        })
            .catch((err) => {
            console.log(err);
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.locations.abort();
    }
}
__decorate([
    property({ type: String, computed: '_computeLocationsUrl(locationId)', observer: '_fetchLocations' })
], LocationFilter.prototype, "locationsUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], LocationFilter.prototype, "locationId", void 0);
__decorate([
    property({ type: String })
], LocationFilter.prototype, "value", void 0);
__decorate([
    property({ type: Array })
], LocationFilter.prototype, "data", void 0);
window.customElements.define('location-filter', LocationFilter);
