import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {filterStyles} from '../../styles/filter-styles';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import '../../etools-prp-common/elements/filter-list';
import '../../elements/filters/text-filter/text-filter';
import '../../elements/filters/checkbox-filter/checkbox-filter';
import '../../elements/filters/dropdown-filter/dropdown-filter-multi';
import '../../elements/filters/location-filter/location-filter';
import {store} from '../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {RootState} from '../../typings/redux.types';
import {valueWithDefault} from '@unicef-polymer/etools-utils/dist/general.util';
import {valueWithDefaultStatuses} from '../../etools-prp-common/utils/util';

@customElement('progress-reports-filters')
export class ProgressReportsFilters extends connect(store)(LitElement) {
  @property({type: Object})
  queryParams!: any;

  @property({type: Object, attribute: false})
  filters!: any;

  @property({type: Array, attribute: false})
  statuses: any[] = [];

  @property({type: Boolean})
  isGpd = false;

  @property({type: Array, attribute: false})
  types: any[] = [];

  constructor() {
    super();
    this.statuses = this._localizeStatuses();
  }

  render() {
    return html`
      <style>
        ${layoutStyles} :host {
          display: block;
          background: white;
        }
        *[hidden] {
          display: none !important;
        }
        checkbox-filter {
          margin-top: 2em;
        }
      </style>
      ${filterStyles}
      <filter-list .filters="${this.filters}">
        <div class="row">
          <text-filter
            class="col-md-3 col-12"
            label="${translate(this.isGpd ? 'GPD_PD_REF_AND_TITLE' : 'PD_REF_AND_TITLE')}"
            name="pd_ref_title"
            .value="${this.queryParams?.pd_ref_title}"
          >
          </text-filter>
          <location-filter
            class="col-md-3 col-12"
            .value="${valueWithDefault(this.queryParams?.location, '-1')}"
          ></location-filter>
          <dropdown-filter-multi
            class="col-md-6 col-12"
            label="${translate('REPORT_STATUS')}"
            name="status"
            .value="${valueWithDefaultStatuses(this.queryParams?.status, '')}"
            .data="${this.statuses}"
            ?disabled="${this.queryParams?.due === '1'}"
            hide-search
          >
          </dropdown-filter-multi>
          <dropdown-filter-multi
            ?hidden="${this.isGpd}"
            class="col-md-6 col-12"
            label="${translate('REPORT_TYPE')}"
            name="report_type"
            .value="${valueWithDefault(this.queryParams?.report_type, '')}"
            .data="${this.types}"
            hide-search
          >
          </dropdown-filter-multi>
        </div>
      </filter-list>
    `;
  }

  stateChanged(state: RootState) {
    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('isGpd')) {
      this.types = this._localizeTypes(this.isGpd);
    }
  }

  _localizeStatuses() {
    return [
      {title: getTranslation('OVERDUE'), id: 'Ove'},
      {title: getTranslation('SENT_BACK'), id: 'Sen'},
      {title: getTranslation('DUE'), id: 'Due'},
      {title: getTranslation('SUBMITTED'), id: 'Sub'},
      {title: getTranslation('ACCEPTED'), id: 'Acc'},
      {title: getTranslation('NOT_YET_DUE'), id: 'Not'}
    ];
  }

  _localizeTypes(isGpd: boolean) {
    if (isGpd) {
      return [
        {title: getTranslation('GPD_PROGRESS_REPORTS'), id: 'QPR'},
        {title: getTranslation('GPD_SPECIAL_REPORT'), id: 'SR'}
      ];
    } else {
      return [
        {title: getTranslation('QPR'), id: 'QPR'},
        {title: getTranslation('HR'), id: 'HR'},
        {title: getTranslation('SR'), id: 'SR'}
      ];
    }
  }
}

export {ProgressReportsFilters as ProgressReportsFiltersEl};
