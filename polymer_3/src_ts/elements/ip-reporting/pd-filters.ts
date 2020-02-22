import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import {GenericObject} from '../../typings/globals.types';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {filterStyles} from '../../styles/filter-styles';
import '../../elements/filter-list';
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

  public static get template() {
    return html`
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
            class="item"
            label="[[localize('pd_ref_and_title')]]"
            name="ref_title"
            value="[[queryParams.ref_title]]">
        </text-filter>

        <dropdown-filter-multi
            class="item filter-2-col"
            label="[[localize('pd_ssfa_status')]]"
            name="status"
            value="[[_withDefault(queryParams.status, '')]]"
            data="[[statuses]]"
            hide-search>
        </dropdown-filter-multi>

        <location-filter-multi
          class="item filter-2-col"
          value="[[_withDefault(queryParams.location, '')]]">
        </location-filter-multi>
      </div>
    </filter-list>
  `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Array, computed: '_initStatuses(localize)'})
  statuses!: GenericObject;

  @property({type: Object, notify: true})
  filters!: GenericObject;

  _initStatuses(localize: Function) {
    const statuses = [
      {title: localize('signed'), id: 'Sig'},
      {title: localize('active'), id: 'Act'},
      {title: localize('suspended'), id: 'Sus'},
      {title: localize('ended'), id: 'End'},
      {title: localize('closed'), id: 'Clo'},
      {title: localize('terminated'), id: 'Ter'},
    ];

    return statuses;
  }

}

window.customElements.define('pd-filters', PdFilters);

export {PdFilters as PdFiltersEl};
