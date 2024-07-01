import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-data-table/data-table-styles';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import DataTableMixin from '../../etools-prp-common/mixins/data-table-mixin';
import PaginationMixin from '../../etools-prp-common/mixins/pagination-mixin';
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
export class PdList extends MatomoMixin(
  LocalizeMixin(RoutingMixin(UtilsMixin(PaginationMixin(DataTableMixin(connect(store)(LitElement))))))
) {
  static styles = css`
    :host {
      display: block;
    }

    etools-content-panel::part(ecp-content) {
      padding: 0;
    }

    .cell-reports {
      text-align: right;
      text-transform: uppercase;
    }
  `;

  @property({type: Boolean})
  loading = false;

  @property({type: Array})
  data: any[] = [];

  @property({type: Number})
  totalResults = 0;

  stateChanged(state: RootState) {
    if (this.loading !== state.programmeDocuments.loading) {
      this.loading = state.programmeDocuments.loading;
    }

    if (this.data !== state.programmeDocuments.all) {
      this.data = state.programmeDocuments.all;
    }

    if (this.totalResults !== state.programmeDocuments.count) {
      this.totalResults = state.programmeDocuments.count;
    }
  }

  render() {
    return html`
      ${tableStyles}

      <etools-content-panel panel-title="${this.localize('list_pds')}">
        <etools-data-table-header
          no-collapse
          label="${this.visibleRange[0]}-${this.visibleRange[1]} of ${this.totalResults} ${this.localize(
            'results_to_show'
          )}"
        >
          <etools-data-table-column field="reference_number" sortable>
            <div class="table-column">${this.localize('pd_ref_number')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="status" sortable>
            <div class="table-column">${this.localize('pd_ssfa_status')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="start_date" sortable>
            <div class="table-column">${this.localize('start_date')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="end_date" sortable>
            <div class="table-column">${this.localize('end_date')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="cso_contribution" sortable>
            <div class="table-column">${this.localize('cso_contribution')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="total_unicef_cash" sortable>
            <div class="table-column">${this.localize('unicef_cash')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="total_unicef_supplies" sortable>
            <div class="table-column">${this.localize('unicef_supplies')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="budget" sortable>
            <div class="table-column">${this.localize('planned_budget')}</div>
          </etools-data-table-column>
          <etools-data-table-column field="funds_received_to_date" sortable>
            <div class="table-column">${this.localize('cash_transfers')}</div>
          </etools-data-table-column>
          <etools-data-table-column></etools-data-table-column>
        </etools-data-table-header>

        ${(this.data || []).map(
          (pd) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="table-cell table-cell--text">
                  <a
                    @click="${this.trackAnalytics}"
                    tracker="${this._getPdRefNumberTracker(pd.reference_number)}"
                    href="${this.getLinkUrl(pd.id, 'details')}"
                  >
                    ${this._withDefault(pd.reference_number)}
                    <paper-tooltip>${pd.title}</paper-tooltip>
                  </a>
                </div>
                <div class="table-cell table-cell--text">${this._withDefault(pd.status, '', this.localize)}</div>
                <div class="table-cell table-cell--text">${this._withDefault(pd.start_date)}</div>
                <div class="table-cell table-cell--text">${this._withDefault(pd.end_date)}</div>
                <div class="table-cell table-cell--text">
                  <etools-prp-currency value="${pd.cso_contribution}" currency="${pd.cso_contribution_currency}">
                  </etools-prp-currency>
                </div>
                <div class="table-cell table-cell--text">
                  <etools-prp-currency value="${pd.total_unicef_cash}" currency="${pd.total_unicef_cash_currency}">
                  </etools-prp-currency>
                </div>
                <div class="table-cell table-cell--text">
                  <etools-prp-currency
                    value="${pd.total_unicef_supplies}"
                    currency="${pd.total_unicef_supplies_currency}"
                  >
                  </etools-prp-currency>
                </div>
                <div class="table-cell table-cell--text">
                  <etools-prp-currency value="${pd.budget}" currency="${pd.budget_currency}"> </etools-prp-currency>
                </div>
                <div class="table-cell table-cell--text">
                  <etools-prp-currency
                    value="${pd.funds_received_to_date}"
                    currency="${pd.funds_received_to_date_currency}"
                  >
                  </etools-prp-currency>
                  (${this._computeFundsReceivedToDateCurrency(pd.funds_received_to_date_percentage)})
                </div>
                <div class="table-cell table-cell--text cell-reports">
                  <a @click="${this.trackAnalytics}" tracker="Reports" href="${this.getLinkUrl(pd.id, 'reports')}">
                    ${this.localize('reports')}
                  </a>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}

        <list-placeholder .data="${this.data}" .loading="${this.loading}"> </list-placeholder>

        <etools-loading ?active="${this.loading}"></etools-loading>
      </etools-content-panel>
    `;
  }

  _computeFundsReceivedToDateCurrency(percentage) {
    if (percentage === null || percentage === -1) {
      return 'N/A';
    } else {
      return `${percentage}%`;
    }
  }

  getLinkUrl(id, page) {
    return this.buildUrl(this._baseUrl, `pd/${id}/view/${page}`);
  }

  _getPdRefNumberTracker(pdRefNumber) {
    return `PD reference number: ${pdRefNumber}`;
  }
}

export {PdList as PdListEl};
