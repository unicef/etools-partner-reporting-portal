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
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class PDDropdownFilter extends LocalizeMixin(ReduxConnectedElement) {
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

      <etools-prp-ajax id="programmeDocuments" url="[[programmeDocumentsUrl]]"> </etools-prp-ajax>

      <dropdown-filter-multi class="item" label="[[localize('pd')]]" name="pds" value="[[value]]" data="[[data]]">
      </dropdown-filter-multi>
    `;
    }
    _computeProgrammeDocumentsUrl(locationId) {
        return locationId ? Endpoints.programmeDocuments(locationId) : '';
    }
    _fetchPDs(url) {
        if (!url) {
            return;
        }
        this.$.programmeDocuments.abort();
        this.$.programmeDocuments
            .thunk()()
            .then((res) => {
            this.set('data', res.data.results);
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    disconnectedCallback() {
        super.connectedCallback();
        this.$.programmeDocuments.abort();
    }
}
__decorate([
    property({ type: String, computed: '_computeProgrammeDocumentsUrl(locationId)', observer: '_fetchPDs' })
], PDDropdownFilter.prototype, "programmeDocumentsUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PDDropdownFilter.prototype, "locationId", void 0);
__decorate([
    property({ type: String })
], PDDropdownFilter.prototype, "computedValue", void 0);
__decorate([
    property({ type: String })
], PDDropdownFilter.prototype, "value", void 0);
__decorate([
    property({ type: Array })
], PDDropdownFilter.prototype, "data", void 0);
window.customElements.define('pd-dropdown-filter', PDDropdownFilter);
