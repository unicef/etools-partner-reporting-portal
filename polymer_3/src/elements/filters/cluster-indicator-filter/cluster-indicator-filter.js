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
import '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';
import Endpoints from '../../../endpoints';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ClusterIndicatorFilter extends LocalizeMixin(ReduxConnectedElement) {
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
        id="indicatorNames"
        url="[[indicatorNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('indicator')]]"
        name="indicator"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  `;
    }
    _computeIndicatorNamesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterNames(responsePlanId);
    }
    _fetchIndicatorNames() {
        if (!this.indicatorNamesUrl) {
            return;
        }
        const self = this;
        const thunk = this.$.indicatorNames.thunk();
        this.$.indicatorNames.abort();
        thunk()
            .then(function (res) {
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
        this.$.indicatorNames.abort();
    }
}
__decorate([
    property({ type: String, computed: '_computeIndicatorNamesUrl(responsePlanId)', observer: '_fetchIndicatorNames' })
], ClusterIndicatorFilter.prototype, "indicatorNamesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterIndicatorFilter.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Array })
], ClusterIndicatorFilter.prototype, "data", void 0);
__decorate([
    property({ type: String })
], ClusterIndicatorFilter.prototype, "value", void 0);
window.customElements.define('cluster-indicator-filter', ClusterIndicatorFilter);
