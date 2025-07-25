import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import DataTableMixin from '../../etools-prp-common/mixins/data-table-mixin';
import PaginationMixin from '@unicef-polymer/etools-unicef/src/mixins/pagination-mixin';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import '../../etools-prp-common/elements/report-status';
import '../../etools-prp-common/elements/etools-prp-number';
import '../etools-prp-currency';
import '../../etools-prp-common/elements/list-placeholder';
import {store} from '../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {RootState} from '../../typings/redux.types';
import {buildUrl, valueWithDefaultStatuses} from '../../etools-prp-common/utils/util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {valueWithDefault} from '@unicef-polymer/etools-utils/dist/general.util';

@customElement('pd-list')
export class PdList extends MatomoMixin(DataTableMixin(PaginationMixin(connect(store)(LitElement)))) {
  @property({type: Boolean})
  loading = false;

  @property({type: Array})
  data: any[] = [];

  @property({type: String})
  baseUrl!: string;

  @property({type: Boolean}) lowResolutionLayout = false;

  stateChanged(state: RootState) {
    if (state.app?.routeDetails.subSubRouteName !== 'pd') {
      return;
    }

    if (this.loading !== state.programmeDocuments?.loading) {
      this.loading = state.programmeDocuments.loading;
    }

    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
      if (parseInt(this.queryParams?.page) === 1 && this.paginator.page !== 1) {
        // reset paginator because of search
        this.paginator = {...this.paginator, page: 1};
      }
    }

    if (state.workspaces.baseUrl && this.baseUrl !== state.workspaces.baseUrl) {
      this.baseUrl = state.workspaces.baseUrl;
    }

    if (state.programmeDocuments?.all !== undefined && this.data !== state.programmeDocuments?.all) {
      this.data = state.programmeDocuments.all;
    }

    if (state.programmeDocuments?.count !== undefined && this.paginator?.count !== state.programmeDocuments.count) {
      this.paginator = {...this.paginator, count: state.programmeDocuments.count};
    }

    super.stateChanged(state);
  }

  render() {
    return html`
      <style>
        ${layoutStyles}
      </style>
      ${tableStyles}
      <style>
        ${dataTableStylesLit} :host {
          display: block;
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
        }

        .cell-reports {
          text-transform: uppercase;
        }
      </style>
      <etools-media-query
        query="(max-width: 1200px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-content-panel panel-title="${translate('LIST_PDS')}">
        <etools-data-table-header
          no-collapse
          .lowResolutionLayout="${this.lowResolutionLayout}"
          .label="${this.paginator.visible_range[0]} - ${this.paginator.visible_range[1]} of ${this.paginator
            .count} ${translate('RESULTS_TO_SHOW')}"
        >
          <etools-data-table-column field="reference_number" class="col-2" sortable>
            <div class="table-column">${translate('PD_REF_NUMBER')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="status" sortable class="col-1">
            <div class="table-column">${translate(this.isGpd ? 'GPD_STATUS' : 'PD_SSFA_STATUS')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="start_date" sortable class="col-1">
            <div class="table-column">${translate('START_DATE')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="end_date" sortable class="col-1">
            <div class="table-column">${translate('END_DATE')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="cso_contribution" sortable class="col-1">
            <div class="table-column">${translate('CSO_CONTRIBUTION')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="total_unicef_cash" sortable class="col-1">
            <div class="table-column">${translate('UNICEF_CASH')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="total_unicef_supplies" class="col-1">
            <div class="table-column">${translate('UNICEF_SUPPLIES')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="budget" sortable class="col-1">
            <div class="table-column">${translate('PLANNED_BUDGET')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="funds_received_to_date" sortable class="col-2">
            <div class="table-column">${translate('CASH_TRANSFERS')}</div>
          </etools-data-table-column>
          <etools-data-table-column class="col-1"></etools-data-table-column>
        </etools-data-table-header>

        ${repeat(
          this.data || [],
          (pd: any) => pd.id,
          (pd, _index) => html`
            <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data">
                <div
                  class="col-data col-2 table-cell table-cell--text"
                  data-col-header-label="${translate('PD_REF_NUMBER')}"
                >
                  <sl-tooltip placement="top-end" .content="${pd.title}">
                    <a
                      @click="${this.trackAnalytics}"
                      tracker="${this._getPdRefNumberTracker(pd.reference_number)}"
                      href="${this.getLinkUrl(this.baseUrl, pd.id, 'details')}"
                      class="truncate"
                    >
                      ${valueWithDefault(pd.reference_number)}
                    </a>
                  </sl-tooltip>
                </div>
                <div
                  class="col-data col-1 table-cell table-cell--text"
                  data-col-header-label="${translate(this.isGpd ? 'GPD_STATUS' : 'PD_SSFA_STATUS')}"
                >
                  ${valueWithDefaultStatuses(pd.status, '')}
                </div>
                <div
                  class="col-data col-1 table-cell table-cell--text"
                  data-col-header-label="${translate('START_DATE')}"
                >
                  ${valueWithDefault(pd.start_date)}
                </div>
                <div
                  class="col-data col-1 table-cell table-cell--text"
                  data-col-header-label="${translate('END_DATE')}"
                >
                  ${valueWithDefault(pd.end_date)}
                </div>
                <div
                  class="col-data col-1 table-cell table-cell--text"
                  data-col-header-label="${translate('CSO_CONTRIBUTION')}"
                >
                  <etools-prp-currency value="${pd.cso_contribution}" currency="${pd.cso_contribution_currency}">
                  </etools-prp-currency>
                </div>
                <div
                  class="col-data col-1 table-cell table-cell--text"
                  data-col-header-label="${translate('UNICEF_CASH')}"
                >
                  <etools-prp-currency value="${pd.total_unicef_cash}" currency="${pd.total_unicef_cash_currency}">
                  </etools-prp-currency>
                </div>
                <div
                  class="col-data col-1 table-cell table-cell--text"
                  data-col-header-label="${translate('UNICEF_SUPPLIES')}"
                >
                  <etools-prp-currency
                    value="${pd.total_unicef_supplies}"
                    currency="${pd.total_unicef_supplies_currency}"
                  >
                  </etools-prp-currency>
                </div>
                <div
                  class="col-data col-1 table-cell table-cell--text"
                  data-col-header-label="${translate('PLANNED_BUDGET')}"
                >
                  <etools-prp-currency value="${pd.budget}" currency="${pd.budget_currency}"> </etools-prp-currency>
                </div>
                <div
                  class="col-data col-2 table-cell table-cell--text"
                  data-col-header-label="${translate('CASH_TRANSFERS')}"
                >
                  <etools-prp-currency
                    value="${pd.funds_received_to_date}"
                    currency="${pd.funds_received_to_date_currency}"
                  >
                  </etools-prp-currency>
                  (${this._computeFundsReceivedToDateCurrency(pd.funds_received_to_date_percentage)})
                </div>
                <div class="col-data col-1 table-cell table-cell--text cell-reports">
                  <a
                    @click="${this.trackAnalytics}"
                    tracker="Reports"
                    href="${this.getLinkUrl(this.baseUrl, pd.id, 'reports')}"
                  >
                    ${translate('REPORTS')}
                  </a>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}

        <list-placeholder .data="${this.data}" .loading="${this.loading}"> </list-placeholder>

        <etools-data-table-footer
          .pageSize="${this.paginator.page_size}"
          .pageNumber="${this.paginator.page}"
          .totalResults="${this.paginator.count}"
          .visibleRange="${this.paginator.visible_range}"
          @visible-range-changed="${this.visibleRangeChanged}"
          @page-size-changed="${this.pageSizeChanged}"
          @page-number-changed="${this.pageNumberChanged}"
        >
        </etools-data-table-footer>

        <etools-loading ?active="${this.loading}"></etools-loading>
      </etools-content-panel>
    `;
  }

  paginatorChanged() {
    this._paginatorChanged();
  }

  _computeFundsReceivedToDateCurrency(percentage) {
    if (percentage === null || percentage === -1) {
      return 'N/A';
    } else {
      return `${percentage}%`;
    }
  }

  getLinkUrl(baseUrl, id, page) {
    return buildUrl(baseUrl, `pd/${id}/view/${page}`);
  }

  _getPdRefNumberTracker(pdRefNumber) {
    return `PD reference number: ${pdRefNumber}`;
  }
}

export {PdList as PdListEl};
