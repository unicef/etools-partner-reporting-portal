var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import '../../../../filter-list';
import '../../../../filters/partner-filter/partner-filter';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import { filterStyles } from '../../../../../styles/filter-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class ContributingPartnersFilters extends UtilsMixin(PolymerElement) {
    static get template() {
        // language=HTML
        return html `
    ${filterStyles}
    <style include="app-grid-style">
      :host {
        display: block;
        background: white;

        --app-grid-columns: 1;
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
        <partner-filter
            value="[[_withDefault(queryParams.partner, '')]]">
        </partner-filter>
      </div>
    </filter-list>
    `;
    }
}
__decorate([
    property({ type: Object })
], ContributingPartnersFilters.prototype, "queryParams", void 0);
window.customElements.define('cluster-activities-contributing-partners-filters', ContributingPartnersFilters);
export { ContributingPartnersFilters as ClusterActivitiesContributingPartnersFiltersEl };
