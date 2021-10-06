var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import { filterStyles } from '../../../../styles/filter-styles';
import '../../../filter-list';
import '../../../filters/text-filter/text-filter';
import '../../../filters/dropdown-filter/dropdown-filter';
import '../../../filters/checkbox-filter/checkbox-filter';
import '../../../filters/date-filter/date-filter';
import '../../../filters/status-filter/project-status-filter';
import '../../../filters/cluster-location-filter/cluster-location-filter';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PlannedActionProjectsFilters extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      ${filterStyles}
      <style include="app-grid-style">
        :host {
          padding: 0;
          display: block;
          --app-grid-columns: 4;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;
        }

        .filter-2-col {
          @apply --app-grid-expandible-item;
        }

      </style>

      <iron-location
          query="{{query}}">
      </iron-location>

      <iron-query-params
          params-string="{{query}}"
          params-object="{{queryParams}}">
      </iron-query-params>

      <filter-list filters="{{filters}}">
        <div class="app-grid">
          <text-filter
            class="item filter-2-col"
            label="[[localize('project')]]"
            name="title"
            value="[[queryParams.title]]">
          </text-filter>

          <!-- FIXME: Bug #209 -->
          <!-- <cluster-location-filter
            class="item filter-2-col"
            value="[[_withDefault(queryParams.location, '')]]">
          </cluster-location-filter> -->

          <!-- <project-status-filter
            value="[[_withDefault(queryParams.status, '')]]">
          </project-status-filter> -->

          <date-filter
            format="YYYY-MM-DD"
            class="item"
            label="[[localize('start_date')]]"
            name="start_date"
            value="[[_withDefault(queryParams.start_date, '')]]">
          </date-filter>

          <date-filter
            format="YYYY-MM-DD"
            class="item"
            label="[[localize('end_date')]]"
            name="end_date"
            value="[[_withDefault(queryParams.end_date, '')]]">
          </date-filter>
        </div>
      </filter-list>
    `;
    }
}
__decorate([
    property({ type: Object })
], PlannedActionProjectsFilters.prototype, "queryParams", void 0);
__decorate([
    property({ type: Object, notify: true })
], PlannedActionProjectsFilters.prototype, "filters", void 0);
window.customElements.define('planned-action-projects-filters', PlannedActionProjectsFilters);
export { PlannedActionProjectsFilters as PlannedActionProjectsFiltersEl };
