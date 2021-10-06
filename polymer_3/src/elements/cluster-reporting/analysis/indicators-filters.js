var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import { filterStyles } from '../../../styles/filter-styles';
import UtilsMixin from '../../../mixins/utils-mixin';
import '../../filter-list';
import '../../filters/cluster-indicator-type-filter/cluster-indicator-type-filter';
import '../../filters/partner-project-filter-multi/partner-project-filter-multi';
/**
* @polymer
* @customElement
* @mixinFunction
* @appliesMixin UtilsMixin
*/
class IndicatorFilters extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
    ${filterStyles}
    <style include="app-grid-style">
      :host {
        display: block;
        background: white;

        --app-grid-columns: 4;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 3;
      }

      .filter-3-col {
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

    <filter-list
        filters="{{filters}}"
        hide-clear>
      <div class="app-grid">
        <cluster-indicator-type-filter
            class="item"
            value="[[_withDefault(queryParams.indicator_type, '')]]">
        </cluster-indicator-type-filter>

        <template
            is="dom-if"
            if="[[_correctIndicatorType(queryParams.indicator_type)]]">
          <partner-project-filter-multi
              class="item filter-3-col"
              value="[[_withDefault(queryParams.partner_projects, '')]]">
          </partner-project-filter-multi>
        </template>
      </div>
    </filter-list>
    `;
    }
    _correctIndicatorType(indicatorType) {
        return indicatorType === 'partner_activity' || indicatorType === 'partner_project';
    }
}
__decorate([
    property({ type: Object })
], IndicatorFilters.prototype, "queryParams", void 0);
__decorate([
    property({ type: Object, notify: true })
], IndicatorFilters.prototype, "filters", void 0);
window.customElements.define('analysis-indicators-filters', IndicatorFilters);
