import {html} from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
// <link rel='import' href='../../../bower_components/etools-datepicker/etools-datepicker-button.html'>
import {filterStyles} from '../../styles/filter-styles';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import '../../elements/filter-list';
import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../typings/globals.types';
// <link rel='import' href='../../elements/filters/text-filter/text-filter.html'>
// <link rel='import' href='../../elements/filters/checkbox-filter/checkbox-filter.html'>
// <link rel='import' href='../../elements/filters/dropdown-filter/dropdown-filter-multi.html'>
// <link rel='import' href='../../elements/filters/location-filter/location-filter.html'>
// <link rel='import' href='../../elements/filters/date-filter/date-filter.html'>


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ProgressReportsFilters extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)){
  public static get template(){
    return html`
      ${filterStyles}
      <style>
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
            name="pd_ref_title"
            value="[[queryParams.pd_ref_title]]">
          </text-filter>
  
          <location-filter
            class="item"
            value="[[_withDefault(queryParams.location, '')]]">
          </location-filter>
  
          <dropdown-filter-multi
              class="item item-2-col"
              label="[[localize('report_status')]]"
              name="status"
              value="[[_withDefault(queryParams.status, '')]]"
              data="[[statuses]]"
              disabled="[[_equals(queryParams.due, '1')]]"
              hide-search>
          </dropdown-filter-multi>
  
          <dropdown-filter-multi
            class="item item-2-col"
            label="[[localize('report_type')]]"
            name="report_type"
            value="[[_withDefault(queryParams.report_type, '')]]"
            data="[[types]]"
            hide-search>
          </dropdown-filter-multi>
        </div>
      </filter-list>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object, notify: true})
  filters!: GenericObject;

  @property({type: Array, computed: '_localizeStatuses(localize)'})
  statuses!: any[];

  @property({type: Array, computed: '_localizeTypes(localize)'})
  types!: any[];

  _localizeStatuses(localize) {
    return [
      {title: localize('overdue'), id: 'Ove'},
      {title: localize('sent_back'), id: 'Sen'},
      {title: localize('due'), id: 'Due'},
      {title: localize('submitted'), id: 'Sub'},
      {title: localize('accepted'), id: 'Acc'},
    ];
  }

  _localizeTypes(localize) {
    return [
      {title: localize('qpr'), id: 'QPR'},
      {title: localize('hr'), id: 'HR'},
      {title: localize('sr'), id: 'SR'},
    ];
  }

}

window.customElements.define('progress-reports-filters', ProgressReportsFilters);
