var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter-multi';
import '../../etools-prp-ajax';
import LocalizeMixin from '../../../mixins/localize-mixin';
import Endpoints from '../../../endpoints';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ClusterLocationFilter extends LocalizeMixin(ReduxConnectedElement) {
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
  </template>
  `;
    }
    _computeLocationNamesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterLocationNames(responsePlanId);
    }
    _fetchLocationNames() {
        const self = this;
        const thunk = this.$.locationNames.thunk();
        this.$.locationNames.abort();
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
        this.$.locationNames.abort();
    }
}
__decorate([
    property({ type: String, computed: '_computeLocationNamesUrl(responsePlanId)', observer: '_fetchLocationNames' })
], ClusterLocationFilter.prototype, "locationNamesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterLocationFilter.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Array })
], ClusterLocationFilter.prototype, "data", void 0);
__decorate([
    property({ type: String })
], ClusterLocationFilter.prototype, "value", void 0);
window.customElements.define('cluster-location-filter', ClusterLocationFilter);
