var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import { llosAll } from '../../../redux/selectors/llos';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class ReportableFilters extends LocalizeMixin(ReduxConnectedElement) {
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

      <searchable-dropdown-filter
        class="item"
        label="[[localize('pd_output')]]"
        name="llo"
        value="[[value]]"
        data="[[options]]"
      >
      </searchable-dropdown-filter>
    `;
    }
    _llosAll(rootState) {
        return llosAll(rootState);
    }
    _computeOptions(data) {
        const other = data.map((item) => {
            return {
                id: String(item.id),
                title: item.title
            };
        });
        return [
            {
                id: '',
                title: 'All'
            }
        ].concat(other);
    }
}
__decorate([
    property({ type: Array, computed: '_computeOptions(data)' })
], ReportableFilters.prototype, "options", void 0);
__decorate([
    property({ type: String })
], ReportableFilters.prototype, "value", void 0);
__decorate([
    property({ type: Array, computed: '_llosAll(rootState)' })
], ReportableFilters.prototype, "data", void 0);
window.customElements.define('reportable-filter', ReportableFilters);
