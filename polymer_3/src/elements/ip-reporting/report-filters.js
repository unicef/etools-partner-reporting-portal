var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import { filterStyles } from '../../styles/filter-styles';
import '../../etools-prp-common/elements/filter-list';
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import '../../elements/filters/reportable-filter/reportable-filter';
import '../../elements/filters/checkbox-filter/checkbox-filter';
import '../../elements/filters/report-location-filter/report-location-filter';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class ReportFilters extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      ${filterStyles}
      <style include="app-grid-style">
        :host {
          display: block;
          background: white;

          --app-grid-columns: 4;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 4;
        }

        .incomplete {
          @apply --app-grid-expandible-item;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <filter-list filters="{{filters}}">
        <div class="app-grid">
          <reportable-filter class="item" value="[[_withDefault(queryParams.llo, '')]]"> </reportable-filter>

          <report-location-filter class="item" value="[[_withDefault(queryParams.location, '')]]">
          </report-location-filter>

          <checkbox-filter class="incomplete" name="incomplete" value="[[_withDefault(queryParams.incomplete, '')]]">
            <span class="checkbox-label">[[localize('show_incomplete_only')]]</span>
          </checkbox-filter>
        </div>
      </filter-list>
    `;
    }
}
__decorate([
    property({ type: Object })
], ReportFilters.prototype, "queryParams", void 0);
__decorate([
    property({ type: Object })
], ReportFilters.prototype, "filters", void 0);
window.customElements.define('report-filters', ReportFilters);
