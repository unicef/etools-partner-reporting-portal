import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {filterStyles} from '../../styles/filter-styles';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import '../../etools-prp-common/elements/filter-list';
import '../../elements/filters/text-filter/text-filter';
import '../../elements/filters/checkbox-filter/checkbox-filter';
import '../../elements/filters/dropdown-filter/dropdown-filter-multi';
import '../../elements/filters/location-filter/location-filter';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';

@customElement('progress-reports-filters')
export class ProgressReportsFilters extends LocalizeMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = [
    css`
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
    `
  ];

  @property({type: String})
  query!: string;

  @property({type: Object})
  queryParams!: any;

  @property({type: Object, attribute: false})
  filters!: any;

  @property({type: Array, attribute: false})
  statuses!: any[];

  @property({type: Array, attribute: false})
  types!: any[];

  render() {
    return html`
      ${filterStyles}
      <iron-location .query="${this.query}"></iron-location>
      <iron-query-params .paramsString="${this.query}" .paramsObject="${this.queryParams}"></iron-query-params>
      <filter-list .filters="${this.filters}">
        <div class="app-grid">
          <text-filter
            class="item"
            label="${this.localize('pd_ref_and_title')}"
            name="pd_ref_title"
            .value="${this.queryParams.pd_ref_title}"
          >
          </text-filter>
          <location-filter
            class="item"
            .value="${this._withDefault(this.queryParams.location, '-1')}"
          ></location-filter>
          <dropdown-filter-multi
            class="item item-2-col"
            label="${this.localize('report_status')}"
            name="status"
            .value="${this._withDefault(this.queryParams.status, '')}"
            .data="${this.statuses}"
            ?disabled="${this._equals(this.queryParams.due, '1')}"
            hide-search
          >
          </dropdown-filter-multi>
          <dropdown-filter-multi
            class="item item-2-col"
            label="${this.localize('report_type')}"
            name="report_type"
            .value="${this._withDefault(this.queryParams.report_type, '')}"
            .data="${this.types}"
            hide-search
          >
          </dropdown-filter-multi>
        </div>
      </filter-list>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('resources')) {
      this.statuses = this._localizeStatuses();
      this.types = this._localizeTypes();
    }
  }

  _localizeStatuses() {
    return [
      {title: this.localize('overdue'), id: 'Ove'},
      {title: this.localize('sent_back'), id: 'Sen'},
      {title: this.localize('due'), id: 'Due'},
      {title: this.localize('submitted'), id: 'Sub'},
      {title: this.localize('accepted'), id: 'Acc'},
      {title: this.localize('not_yet_due'), id: 'Not'}
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

export {ProgressReportsFilters as ProgressReportsFiltersEl};
