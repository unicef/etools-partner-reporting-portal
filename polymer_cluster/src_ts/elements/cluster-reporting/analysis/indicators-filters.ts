import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import {filterStyles} from '../../../styles/filter-styles';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import '../../../etools-prp-common/elements/filter-list';
import '../../filters/cluster-indicator-type-filter/cluster-indicator-type-filter';
import '../../filters/partner-project-filter-multi/partner-project-filter-multi';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class IndicatorFilters extends UtilsMixin(PolymerElement) {
  static get template() {
    return html`
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

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <filter-list filters="{{filters}}" hide-clear>
        <div class="app-grid">
          <cluster-indicator-type-filter class="item" value="[[_withDefault(queryParams.indicator_type, '')]]">
          </cluster-indicator-type-filter>

          <template is="dom-if" if="[[_correctIndicatorType(queryParams.indicator_type)]]">
            <partner-project-filter-multi
              class="item filter-3-col"
              value="[[_withDefault(queryParams.partner_projects, '')]]"
            >
            </partner-project-filter-multi>
          </template>
        </div>
      </filter-list>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object, notify: true})
  filters!: GenericObject;

  _correctIndicatorType(indicatorType: string) {
    return indicatorType === 'partner_activity' || indicatorType === 'partner_project';
  }
}

window.customElements.define('analysis-indicators-filters', IndicatorFilters);
