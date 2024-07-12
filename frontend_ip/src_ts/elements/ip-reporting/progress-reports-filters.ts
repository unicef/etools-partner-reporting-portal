import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
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
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {RootState} from '../../typings/redux.types';

@customElement('progress-reports-filters')
export class ProgressReportsFilters extends LocalizeMixin(UtilsMixin(connect(store)(LitElement))) {
  static get styles() { 
    return [layoutStyles,
      css`
        :host {
          display: block;
          background: white;
        }      
        checkbox-filter {
          margin-top: 2em;
        }
        `]
    };

  @property({type: Object})
  queryParams!: any;

  @property({type: Object, attribute: false})
  filters!: any;

  @property({type: Array, attribute: false})
  statuses: any[] = this._localizeStatuses();

  @property({type: Array, attribute: false})
  types: any[] = this._localizeTypes();

  render() {
    return html`
      ${filterStyles}
      <filter-list .filters="${this.filters}">
        <div class="row">
          <text-filter
            class="col-md-3 col-12"
            label="${this.localize('pd_ref_and_title')}"
            name="pd_ref_title"
            .value="${this.queryParams?.pd_ref_title}"
          >
          </text-filter>
          <location-filter
            class="col-md-3 col-12"
            .value="${this._withDefault(this.queryParams?.location, '-1')}"
          ></location-filter>
          <dropdown-filter-multi
            class="col-md-6 col-12"
            label="${this.localize('report_status')}"
            name="status"
            .value="${this._withDefault(this.queryParams?.status, '')}"
            .data="${this.statuses}"
            ?disabled="${this._equals(this.queryParams?.due, '1')}"
            hide-search
          >
          </dropdown-filter-multi>
          <dropdown-filter-multi
            class="col-md-6 col-12"
            label="${this.localize('report_type')}"
            name="report_type"
            .value="${this._withDefault(this.queryParams?.report_type, '')}"
            .data="${this.types}"
            hide-search
          >
          </dropdown-filter-multi>
        </div>
      </filter-list>
    `;
  }

  stateChanged(state: RootState) {
    if (
      state.app?.routeDetails?.queryParams &&
      !isJsonStrMatch(this.routeDetails, state.app.routeDetails.queryParams)
    ) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
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
