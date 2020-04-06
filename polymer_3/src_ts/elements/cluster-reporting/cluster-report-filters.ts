import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../../mixins/utils-mixin';
import {filterStyles} from '../../styles/filter-styles';
import '../filter-list';
import '../filters/cluster-indicator-filter/cluster-indicator-filter';
import '../filters/cluster-project-filter/cluster-project-filter';
import '../filters/cluster-partner-filter/cluster-partner-filter';
import '../filters/indicator-location-filter/indicator-location-filter';
import '../filters/cluster-filter/cluster-filter';
import '../filters/cluster-indicator-type-filter/cluster-indicator-type-filter';
import '../filters/cluster-indicator-filter/cluster-indicator-filter';
import {GenericObject} from '../../typings/globals.types';

/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
*/
class ClusterReportFilters extends UtilsMixin(PolymerElement) {
  public static get template() {
    // language=HTML
    return html`
    ${filterStyles}
    <style include="app-grid-style">
      :host {
        display: block;
        background: white;

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
        <cluster-filter
            class="item"
            value="[[_withDefault(queryParams.cluster_id, '')]]">
        </cluster-filter>

        <cluster-partner-filter
            class="item"
            value="[[_withDefault(queryParams.partner, '')]]">
        </cluster-partner-filter>

        <cluster-indicator-type-filter
            class="item filter-col"
            is-partner="[[_computeIsPartner(queryParams)]]"
            value="[[_withDefault(queryParams.indicator_type, '')]]">
        </cluster-indicator-type-filter>

        <cluster-indicator-filter
          class="item filter-col"
          value="[[_withDefault(queryParams.indicator, '')]]">
        </cluster-indicator-filter>

        <cluster-project-filter
            class="item filter-2-col"
            value="[[_withDefault(queryParams.project, '')]]">
        </cluster-project-filter>

        <indicator-location-filter
            class="item filter-2-col"
            value="[[_withDefault(queryParams.location, '')]]">
        </indicator-location-filter>
      </div>
    </filter-list>
  `;
  }
  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object})
  properties!: GenericObject;

  @property({type: Object, notify: true})
  filters!: GenericObject;


  _setDefaults(adding: any) {
    if (!adding) {
      return;
    }

    this.set('_value', '');
  }

  _computeIsPartner(queryParams: GenericObject) {
    return !!queryParams.partner;
  }
}

window.customElements.define('cluster-report-filters', ClusterReportFilters);
