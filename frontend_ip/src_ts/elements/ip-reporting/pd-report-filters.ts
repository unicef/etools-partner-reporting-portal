import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {filterStyles} from '../../styles/filter-styles';
import '../../etools-prp-common/elements/filter-list';
import '../../elements/filters/dropdown-filter/dropdown-filter';
import {get as getTranslation, translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {store} from '../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {valueWithDefaultStatuses} from '../../etools-prp-common/utils/util';

@customElement('pd-report-filters')
export class PdReportFilters extends connect(store)(LitElement) {
  @property({type: Object})
  queryParams: any = {};

  @property({type: Object, attribute: false})
  filters: any[] = [];

  @property({type: Array})
  statuses: any[] = [];

  _localizeStatuses() {
    return [
      {title: getTranslation('OVERDUE'), id: 'Ove'},
      {title: getTranslation('SENT_BACK'), id: 'Sen'},
      {title: getTranslation('DUE'), id: 'Due'},
      {title: getTranslation('ALL'), id: '-1'},
      {title: getTranslation('SUBMITTED'), id: 'Sub'},
      {title: getTranslation('ACCEPTED'), id: 'Acc'},
      {title: getTranslation('NOT_YET_DUE'), id: 'Not'}
    ];
  }

  render() {
    return html`
      <style>
        ${layoutStyles}
      </style>

      ${filterStyles}

      <filter-list .filters=${this.filters} @filters-changed=${(e) => (this.filters = e.detail.value)}>
        <div class="row">
          <dropdown-filter
            class="col-md-4 col-12"
            .label=${translate('GPD_STATUS')}
            name="status"
            .value=${valueWithDefaultStatuses(this.queryParams?.status, '-1')}
            .data=${this.statuses}
          ></dropdown-filter>
        </div>
      </filter-list>
    `;
  }

  stateChanged(state: RootState) {
    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }
  }

  firstUpdated(changedProperties) {
    super.updated(changedProperties);

    this.statuses = this._localizeStatuses();
  }
}

export {PdReportFilters as PdReportFiltersEl};
