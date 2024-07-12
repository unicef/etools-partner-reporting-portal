import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '@polymer/paper-button/paper-button.js';
import {filterStyles} from '../../styles/filter-styles';
import '../../etools-prp-common/elements/filter-list';
import '../../elements/filters/dropdown-filter/dropdown-filter';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

@customElement('pd-report-filters')
export class PdReportFilters extends LocalizeMixin(UtilsMixin(connect(store)(LitElement))) {
  static get styles() { 
    return [layoutStyles]
  };

  @property({type: Object})
  queryParams: any = {};

  @property({type: Object, attribute: false})
  filters: any[] = [];

  @property({type: Array})
  statuses: any[] = [];

  _localizeStatuses() {
    return [
      {title: this.localize('overdue'), id: 'Ove'},
      {title: this.localize('sent_back'), id: 'Sen'},
      {title: this.localize('due'), id: 'Due'},
      {title: this.localize('all'), id: '-1'},
      {title: this.localize('submitted'), id: 'Sub'},
      {title: this.localize('accepted'), id: 'Acc'},
      {title: this.localize('not_yet_due'), id: 'Not'}
    ];
  }

  render() {
    return html`
      ${filterStyles}

      <filter-list .filters=${this.filters} @filters-changed=${(e) => (this.filters = e.detail.value)}>
        <div class="row">
          <dropdown-filter
            class="col-md-4 col-12"
            .label=${this.localize('status')}
            name="status"
            .value=${this._withDefault(this.queryParams?.status, '-1')}
            .data=${this.statuses}
          ></dropdown-filter>
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

  firstUpdated(changedProperties) {
    super.updated(changedProperties);

    this.statuses = this._localizeStatuses();
  }
}

export {PdReportFilters as PdReportFiltersEl};
