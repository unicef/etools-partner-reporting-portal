var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import { filterStyles } from '../../../../../styles/filter-styles';
import '../../../../filter-list';
import '../../../../filters/cluster-partner-filter/cluster-partner-filter';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PartnerActivitiesFilters extends UtilsMixin(PolymerElement) {
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
      </div>
    </filter-list>
    `;
    }
}
__decorate([
    property({ type: Object, notify: true })
], PartnerActivitiesFilters.prototype, "properties", void 0);
__decorate([
    property({ type: Array })
], PartnerActivitiesFilters.prototype, "locations", void 0);
window.customElements.define('partner-activities-filters', PartnerActivitiesFilters);
export { PartnerActivitiesFilters as PartnerActivitiesFiltersEl };
