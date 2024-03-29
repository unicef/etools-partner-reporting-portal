import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../etools-prp-common/elements/filter-list';
import '../filters/text-filter/text-filter';
import '../filters/dropdown-filter/dropdown-filter-multi';
import '../filters/location-filter/location-filter';
import '../filters/pd-filter/pd-dropdown-filter';
import '../filters/checkbox-filter/checkbox-filter';

import '@polymer/paper-styles/typography';
import '../../etools-prp-common/elements/error-modal';
import {filterStyles} from '../../styles/filter-styles';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class IndicatorsFilters extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  static get template() {
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

        .item-2-col {
          @apply --app-grid-expandible-item;
        }

        checkbox-filter {
          margin-top: 2em;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <filter-list filters="{{filters}}">
        <div class="app-grid">
          <dropdown-filter-multi
            class="item item-2-col"
            label="[[localize('pd_status')]]"
            name="pd_statuses"
            value="[[_withDefault(queryParams.pd_statuses, '')]]"
            data="[[pd_statuses]]"
            hide-search
          >
          </dropdown-filter-multi>

          <pd-dropdown-filter class="item item-2-col" value="[[_withDefault(queryParams.pds, '')]]">
          </pd-dropdown-filter>

          <location-filter class="item" value="[[_withDefault(queryParams.location, '-1')]]"> </location-filter>

          <text-filter
            class="item"
            label="[[localize('indicator_title')]]"
            name="blueprint__title"
            value="[[queryParams.blueprint__title]]"
          >
          </text-filter>
        </div>
      </filter-list>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Array, computed: '_initStatuses(resources)'})
  pd_statuses!: any;

  @property({type: Object, computed: '_computePostBody(selectedFocalPoint)'})
  postBody!: GenericObject;

  _initStatuses() {
    return [
      {title: this.localize('signed'), id: 'signed'},
      {title: this.localize('active'), id: 'active'},
      {title: this.localize('suspended'), id: 'suspended'},
      {title: this.localize('ended'), id: 'ended'},
      {title: this.localize('closed'), id: 'closed'},
      {title: this.localize('terminated'), id: 'terminated'}
    ];
  }
}

window.customElements.define('indicators-filters', IndicatorsFilters);
