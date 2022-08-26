import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {filterStyles} from '../../styles/filter-styles';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import '../../etools-prp-common/elements/filter-list';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';
import '../../elements/filters/text-filter/text-filter';
import '../../elements/filters/checkbox-filter/checkbox-filter';
import '../../elements/filters/dropdown-filter/dropdown-filter-multi';
import '../../elements/filters/location-filter/location-filter';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ProgressReportsFilters extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
  public static get template() {
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
          <text-filter
            class="item"
            label="[[localize('pd_ref_and_title')]]"
            name="pd_ref_title"
            value="[[queryParams.pd_ref_title]]"
          >
          </text-filter>

          <location-filter class="item" value="[[_withDefault(queryParams.location, '')]]"> </location-filter>

          <dropdown-filter-multi
            class="item item-2-col"
            label="[[localize('report_status')]]"
            name="status"
            value="[[_withDefault(queryParams.status, '')]]"
            data="[[statuses]]"
            disabled="[[_equals(queryParams.due, '1')]]"
            hide-search
          >
          </dropdown-filter-multi>

          <dropdown-filter-multi
            class="item item-2-col"
            label="[[localize('report_type')]]"
            name="report_type"
            value="[[_withDefault(queryParams.report_type, '')]]"
            data="[[types]]"
            hide-search
          >
          </dropdown-filter-multi>
        </div>
      </filter-list>
    `;
  }

  @property({type: String})
  query!: string;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object, notify: true})
  filters!: GenericObject;

  @property({type: Array, computed: '_localizeStatuses(resources)'})
  statuses!: any[];

  @property({type: Array, computed: '_localizeTypes(resources)'})
  types!: any[];

  _localizeStatuses() {
    return [
      {title: this.localize('overdue'), id: 'Ove'},
      {title: this.localize('sent_back'), id: 'Sen'},
      {title: this.localize('due'), id: 'Due'},
      {title: this.localize('submitted'), id: 'Sub'},
      {title: this.localize('accepted'), id: 'Acc'},
      {title: this.localize('not_due_yet'), id: 'Not'}
    ];
  }

  _localizeTypes() {
    return [
      {title: this.localize('qpr'), id: 'QPR'},
      {title: this.localize('hr'), id: 'HR'},
      {title: this.localize('sr'), id: 'SR'}
    ];
  }
}

window.customElements.define('progress-reports-filters', ProgressReportsFilters);
