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
import '../../etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class IndicatorLocationFilter extends LocalizeMixin(ReduxConnectedElement) {
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
        id="locationNames"
        url="[[locationNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('location')]]"
        name="location"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  `;
    }
    _computeLocationNamesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterIndicatorLocations(responsePlanId);
    }
    _fetchLocationNames() {
        if (!this.locationNamesUrl) {
            return;
        }
        const self = this;
        this.$.locationNames.abort();
        this.$.locationNames.thunk()()
            .then((res) => {
            self.set('data', [{
                    id: '',
                    title: 'All'
                }].concat(res.data || []));
        })
            // @ts-ignore
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
    property({ type: String, computed: '_computeLocationNamesUrl(responsePlanId)', observer: '_fetchLocationNames' })
], IndicatorLocationFilter.prototype, "locationNamesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], IndicatorLocationFilter.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String })
], IndicatorLocationFilter.prototype, "value", void 0);
__decorate([
    property({ type: Array })
], IndicatorLocationFilter.prototype, "data", void 0);
window.customElements.define('indicator-location-filter', IndicatorLocationFilter);
