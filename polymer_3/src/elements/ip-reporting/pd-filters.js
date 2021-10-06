var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import { filterStyles } from '../../styles/filter-styles';
import '../../etools-prp-common/elements/filter-list';
import '../../elements/filters/text-filter/text-filter';
import '../../elements/filters/dropdown-filter/dropdown-filter-multi';
import '../../elements/filters/location-filter-multi/location-filter-multi';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdFilters extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      ${filterStyles}
      <style include="app-grid-style">
        :host {
          display: block;
          background: white;

          --app-grid-columns: 5;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;
        }

        .filter-2-col {
          @apply --app-grid-expandible-item;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <filter-list filters="{{filters}}">
        <div class="app-grid">
          <text-filter
            class="item"
            label="[[localize('pd_ref_and_title')]]"
            name="ref_title"
            value="[[queryParams.ref_title]]"
          >
          </text-filter>

          <dropdown-filter-multi
            class="item filter-2-col"
            label="[[localize('pd_ssfa_status')]]"
            name="status"
            value="[[_withDefault(queryParams.status, '')]]"
            data="[[statuses]]"
            hide-search
          >
          </dropdown-filter-multi>

          <location-filter-multi class="item filter-2-col" value="[[_withDefault(queryParams.location, '')]]">
          </location-filter-multi>
        </div>
      </filter-list>
    `;
    }
    _initStatuses() {
        return [
            { title: this.localize('signed'), id: 'Sig' },
            { title: this.localize('active'), id: 'Act' },
            { title: this.localize('suspended'), id: 'Sus' },
            { title: this.localize('ended'), id: 'End' },
            { title: this.localize('closed'), id: 'Clo' },
            { title: this.localize('terminated'), id: 'Ter' }
        ];
    }
}
__decorate([
    property({ type: Object })
], PdFilters.prototype, "queryParams", void 0);
__decorate([
    property({ type: Array, computed: '_initStatuses(resources)' })
], PdFilters.prototype, "statuses", void 0);
__decorate([
    property({ type: Object, notify: true })
], PdFilters.prototype, "filters", void 0);
window.customElements.define('pd-filters', PdFilters);
export { PdFilters as PdFiltersEl };
