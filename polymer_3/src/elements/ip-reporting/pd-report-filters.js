var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '@polymer/paper-button/paper-button.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import { filterStyles } from '../../styles/filter-styles';
import '../../etools-prp-common/elements/filter-list';
import '../../elements/filters/dropdown-filter/dropdown-filter';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdReportFilters extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      ${filterStyles}
      <style include="app-grid-style">
        :host {
          display: block;
          background: white;

          --app-grid-columns: 3;
          --app-grid-item-height: auto;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <filter-list filters="{{filters}}">
        <div class="app-grid">
          <dropdown-filter
            class="item"
            label="[[localize('status')]]"
            name="status"
            value="[[_withDefault(queryParams.status, '')]]"
            data="[[statuses]]"
          >
          </dropdown-filter>
        </div>
      </filter-list>
    `;
    }
    _localizeStatuses() {
        return [
            { title: this.localize('overdue'), id: 'Ove' },
            { title: this.localize('sent_back'), id: 'Sen' },
            { title: this.localize('due'), id: 'Due' },
            { title: this.localize('all'), id: '' },
            { title: this.localize('submitted'), id: 'Sub' },
            { title: this.localize('accepted'), id: 'Acc' }
        ];
    }
}
__decorate([
    property({ type: String })
], PdReportFilters.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], PdReportFilters.prototype, "queryParams", void 0);
__decorate([
    property({ type: Object, notify: true })
], PdReportFilters.prototype, "filters", void 0);
__decorate([
    property({ type: Array, computed: '_localizeStatuses(resources)' })
], PdReportFilters.prototype, "statuses", void 0);
window.customElements.define('pd-report-filters', PdReportFilters);
export { PdReportFilters as PdReportFiltersEl };
