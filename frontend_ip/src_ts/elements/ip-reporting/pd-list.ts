import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from 'lit-translate';
import DataTableMixin from '../../etools-prp-common/mixins/data-table-mixin';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import '../../etools-prp-common/elements/report-status';
import '../../etools-prp-common/elements/etools-prp-number';
import '../etools-prp-currency';
import '../../etools-prp-common/elements/list-placeholder';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';
import {RootState} from '../../typings/redux.types';

@customElement('pd-list')
export class PdList extends RoutingMixin(
  MatomoMixin(DataTableMixin(PaginationMixin(UtilsMixin(connect(store)(LitElement)))))
) {
  @property({type: Boolean})
  loading = false;

  @property({type: Array})
  data: any[] = [];

  stateChanged(state: RootState) {
    if (this.loading !== state.programmeDocuments?.loading) {
      this.loading = state.programmeDocuments.loading;
    }

    if (state.programmeDocuments?.all && this.data !== state.programmeDocuments?.all) {
      this.data = state.programmeDocuments.all;
    }

    if (state.programmeDocuments?.count && this.paginator?.count !== state.programmeDocuments.count) {
      this.paginator = {...this.paginator, count: state.programmeDocuments.count};
    }

    super.stateChanged(state);
  }

  static get styles() {
    return [layoutStyles];
  }

  render() {
    return html`
      ${tableStyles}
      <style>
        ${dataTableStylesLit} :host {
          display: block;
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
        }

        .cell-reports {
          text-align: right;
          text-transform: uppercase;
        }
      </style>
      <etools-content-panel panel-title="${translate('LIST_PDS')}">
        <etools-data-table-header
          no-collapse
          label="${this.paginator.visible_range[0]} - ${this.paginator.visible_range[1]} of ${this.paginator
            .count} ${translate('RESULTS_TO_SHOW')}"
        >
          <etools-data-table-column field="reference_number" class="col-2" sortable>
            <div class="table-column">${translate('PD_REF_NUMBER')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="status" sortable class="col-1">
            <div class="table-column">${translate('PD_SSFA_STATUS')}</div>
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
          <etools-data-table-column field="total_unicef_supplies" sortable class="col-1">
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
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="col-data col-2 table-cell table-cell--text truncate">
                  <sl-tooltip placement="top-end" .content="${pd.title}" hoist>
                    <a
                      @click="${this.trackAnalytics}"
                      tracker="${this._getPdRefNumberTracker(pd.reference_number)}"
                      href="${this.getLinkUrl(this._baseUrl, pd.id, 'details')}"
                    >
                      ${this._withDefault(pd.reference_number)}
                    </a>
                  </sl-tooltip>
                </div>
                <div class="col-data col-1 table-cell table-cell--text">${this._withDefault(pd.status, '')}</div>
                <div class="col-data col-1 table-cell table-cell--text">${this._withDefault(pd.start_date)}</div>
                <div class="col-data col-1 table-cell table-cell--text">${this._withDefault(pd.end_date)}</div>
                <div class="col-data col-1 table-cell table-cell--text">
                  <etools-prp-currency value="${pd.cso_contribution}" currency="${pd.cso_contribution_currency}">
                  </etools-prp-currency>
                </div>
                <div class="col-data col-1 table-cell table-cell--text">
                  <etools-prp-currency value="${pd.total_unicef_cash}" currency="${pd.total_unicef_cash_currency}">
                  </etools-prp-currency>
                </div>
                <div class="col-data col-1 table-cell table-cell--text">
                  <etools-prp-currency
                    value="${pd.total_unicef_supplies}"
                    currency="${pd.total_unicef_supplies_currency}"
                  >
                  </etools-prp-currency>
                </div>
                <div class="col-data col-1 table-cell table-cell--text">
                  <etools-prp-currency value="${pd.budget}" currency="${pd.budget_currency}"> </etools-prp-currency>
                </div>
                <div class="col-data col-2 table-cell table-cell--text">
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
                    href="${this.getLinkUrl(this._baseUrl, pd.id, 'reports')}"
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
    return this.buildUrl(baseUrl, `pd/${id}/view/${page}`);
  }

  _getPdRefNumberTracker(pdRefNumber) {
    return `PD reference number: ${pdRefNumber}`;
  }
}

export {PdList as PdListEl};
