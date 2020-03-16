import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-data-table/data-table-styles';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import DataTableMixin from '../../mixins/data-table-mixin';
import PaginationMixin from '../../mixins/pagination-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import {tableStyles} from '../../styles/table-styles';
import '../report-status';
import '../etools-prp-number';
import '../etools-prp-currency';
import '../list-placeholder';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin DataTableMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdList extends LocalizeMixin(RoutingMixin(UtilsMixin(PaginationMixin(DataTableMixin(ReduxConnectedElement))))) {

  public static get template() {
    return html`
    ${tableStyles}
    <style include="data-table-styles">
      :host {
        display: block;

        --ecp-content: {
          padding: 0;
        };
      }

      .cell-reports {
        text-align: right;
        text-transform: uppercase;
      }
    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-content-panel panel-title="[[localize('list_pds')]]">

      <etools-data-table-header
          no-collapse
          label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] [[localize('results_to_show')]]">
        <etools-data-table-column field="reference_number" sortable>
          <div class="table-column">[[localize('pd_ref_number')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="status" sortable>
          <div class="table-column">[[localize('pd_ssfa_status')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="start_date" sortable>
          <div class="table-column">[[localize('start_date')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="end_date" sortable>
          <div class="table-column">[[localize('end_date')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="cso_contribution" sortable>
          <div class="table-column">[[localize('cso_contribution')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="total_unicef_cash" sortable>
          <div class="table-column">[[localize('unicef_cash')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="total_unicef_supplies" sortable>
          <div class="table-column">[[localize('unicef_supplies')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="budget" sortable>
            <div class="table-column">[[localize('planned_budget')]]</div>
          </etools-data-table-column>
        <etools-data-table-column field="funds_received_to_date" sortable>
          <div class="table-column">[[localize('cash_transfers')]]</div>
        </etools-data-table-column>
        <etools-data-table-column></etools-data-table-column>
      </etools-data-table-header>

      <etools-data-table-footer
          page-size="[[pageSize]]"
          page-number="[[pageNumber]]"
          total-results="[[totalResults]]"
          visible-range="{{visibleRange}}"
          on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged">
      </etools-data-table-footer>

      <template
          id="list"
          is="dom-repeat"
          items="[[data]]"
          as="pd"
          initial-count="[[pageSize]]">
        <etools-data-table-row no-collapse>
          <div slot="row-data">
            <div class="table-cell table-cell--text">
              <a href="[[getLinkUrl(pd.id, 'details')]]">
                [[_withDefault(pd.reference_number)]]
                <paper-tooltip>[[pd.title]]</paper-tooltip>
              </a>
            </div>
            <div class="table-cell table-cell--text">
              [[_withDefault(pd.status, '', localize)]]
            </div>
            <div class="table-cell table-cell--text">
              [[_withDefault(pd.start_date)]]
            </div>
            <div class="table-cell table-cell--text">
              [[_withDefault(pd.end_date)]]
            </div>
            <div class="table-cell table-cell--text">
              <etools-prp-currency
                  value="[[pd.cso_contribution]]"
                  currency="[[pd.cso_contribution_currency]]">
              </etools-prp-currency>
            </div>
            <div class="table-cell table-cell--text">
              <etools-prp-currency
                  value="[[pd.total_unicef_cash]]"
                  currency="[[pd.total_unicef_cash_currency]]">
              </etools-prp-currency>
            </div>
            <div class="table-cell table-cell--text">
              <etools-prp-currency
                  value="[[pd.total_unicef_supplies]]"
                  currency="[[pd.total_unicef_supplies_currency]]">
              </etools-prp-currency>
            </div>
            <div class="table-cell table-cell--text">
              <etools-prp-currency
                  value="[[pd.budget]]"
                  currency="[[pd.budget_currency]]">
              </etools-prp-currency>
            </div>
            <div class="table-cell table-cell--text">
              <etools-prp-currency
                  value="[[pd.funds_received_to_date]]"
                  currency="[[pd.funds_received_to_date_currency]]">
              </etools-prp-currency>
              ([[_computeFundsReceivedToDateCurrency(pd.funds_received_to_date_percentage)]])
            </div>
            <div class="table-cell table-cell--text cell-reports">
              <a href="[[getLinkUrl(pd.id, 'reports')]]">[[localize('reports')]]</a>
            </div>
          </div>
        </etools-data-table-row>
      </template>

      <list-placeholder
          data="[[data]]"
          loading="[[loading]]">
      </list-placeholder>

      <etools-data-table-footer
          page-size="[[pageSize]]"
          page-number="[[pageNumber]]"
          total-results="[[totalResults]]"
          visible-range="{{visibleRange}}"
          on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged">
      </etools-data-table-footer>

      <etools-loading active="[[loading]]"></etools-loading>
    </etools-content-panel>
`;
  }

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.programmeDocuments.loading)'})
  loading!: boolean;

  @property({type: Array, computed: 'getReduxStateArray(rootState.programmeDocuments.all)'})
  data!: any[];

  @property({type: Number, computed: 'getReduxStateValue(rootState.programmeDocuments.count)'})
  totalResults!: number;

  _computeFundsReceivedToDateCurrency(percentage?: number) {
    if (percentage === null || percentage === -1) {
      return 'N/A';
    } else {
      return percentage + '%';
    }
  }

  getLinkUrl(id: string, page: string) {
    return this.buildUrl(this._baseUrl, `pd/${id}/view/${page}`);
  }

}

window.customElements.define('pd-list', PdList);

export {PdList as PdListEl};
