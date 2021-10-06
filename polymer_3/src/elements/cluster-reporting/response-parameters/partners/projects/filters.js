var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import { filterStyles } from '../../../../../styles/filter-styles';
import '../../../../filter-list';
import '../../../../filters/text-filter/text-filter';
import '../../../../filters/dropdown-filter/dropdown-filter';
import '../../../../filters/checkbox-filter/checkbox-filter';
import '../../../../filters/date-filter/date-filter';
import '../../../../filters/status-filter/project-status-filter';
import '../../../../filters/cluster-location-filter/cluster-location-filter';
import '../../../../filters/cluster-partner-filter/cluster-partner-filter';
import '../../../../filters/cluster-project-filter/cluster-project-filter';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PartnerProjectsFilters extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.locations = [
            {
                title: 'All',
                id: ''
            }
        ];
    }
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

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <filter-list filters="{{filters}}">
      <div class="app-grid">
        <cluster-partner-filter
            class="item"
            value="[[_withDefault(queryParams.partner, '')]]">
        </cluster-partner-filter>

        <text-filter
          class="item"
          label="[[localize('project')]]"
          name="title"
          value="[[queryParams.title]]">
        </text-filter>

        <project-status-filter
          value="[[_withDefault(queryParams.status, '')]]">
        </project-status-filter>

        <cluster-location-filter
          class="item"
          value="[[_withDefault(queryParams.location, '')]]">
        </cluster-location-filter>
      </div>
    </filter-list>
    `;
    }
}
__decorate([
    property({ type: Object, notify: true })
], PartnerProjectsFilters.prototype, "filters", void 0);
__decorate([
    property({ type: Array })
], PartnerProjectsFilters.prototype, "locations", void 0);
window.customElements.define('partner-projects-filters', PartnerProjectsFilters);
export { PartnerProjectsFilters as PartnerProjectsFiltersEl };
