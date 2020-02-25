import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import {html} from '@polymer/polymer';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/paper-tooltip/paper-tooltip';
import '../report-status';
import '../list-placeholder';
import './pd-reports-report-title';
import UtilsMixin from '../../mixins/utils-mixin';
import DataTableMixin from '../../mixins/data-table-mixin';
import PaginationMixin from '../../mixins/pagination-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import SortingMixin from '../../mixins/sorting-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {tableStyles} from '../../styles/table-styles';
import {GenericObject} from '../../typings/globals.types';
import {getReportTitle} from './js/progress-reports-list-functions';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin DataTableMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin ProgressReportUtilsMixin
 * @appliesMixin SortingMixin
 * @appliesMixin LocalizeMixin
 */
class ProgressReportsList extends LocalizeMixin(SortingMixin(ProgressReportUtilsMixin(
  RoutingMixin(PaginationMixin(DataTableMixin(UtilsMixin(ReduxConnectedElement))))))) {

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
      </style>

      <iron-location
          query="{{query}}">
      </iron-location>

      <iron-query-params
          params-string="{{query}}"
          params-object="{{queryParams}}">
      </iron-query-params>

      <etools-content-panel panel-title="[[localize('list_of_reports')]]">
        <etools-data-table-header
            no-collapse
            label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] [[localize('results_to_show')]]">
          <etools-data-table-column field="programme_document__reference_number" sortable>
            <div class="table-column">[[localize('pd_ref_number')]]</div>
          </etools-data-table-column>
          <etools-data-table-column>
            <div class="table-column">[[localize('report_number')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="status" sortable>
            <div class="table-column">[[localize('report_status')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="due_date" sortable>
            <div class="table-column">[[localize('due_date')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="submission_date" sortable>
            <div class="table-column">[[localize('date_of_submission')]]</div>
          </etools-data-table-column>
          <etools-data-table-column field="start_date" sortable>
            <div class="table-column">[[localize('reporting_period')]]</div>
          </etools-data-table-column>
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
          as="report"
          initial-count="[[pageSize]]">
          <etools-data-table-row no-collapse>
            <div slot="row-data">
              <div class="table-cell table-cell--text">
                <span>
                  [[_withDefault(report.programme_document.reference_number, '-')]]
                  <paper-tooltip>[[report.programme_document.title]]</paper-tooltip>
                </span>
              </div>
              <div class="table-cell table-cell--text">
                <pd-reports-report-title display-link report="[[report]]"></pd-reports-report-title>
              </div>
              <div class="table-cell table-cell--text">
                <report-status
                    status="[[report.status]]"
                    report-type="[[report.report_type]]">
                </report-status>
              </div>
              <div class="table-cell table-cell--text">
                [[_withDefault(report.due_date, '-')]]
              </div>
              <div class="table-cell table-cell--text">
                [[_withDefault(report.submission_date)]]
              </div>
              <div class="table-cell table-cell--text">
                [[_withDefault(report.reporting_period)]]
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

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.progressReports.loading)'})
  loading!: boolean;

  @property({type: Array, computed: 'getReduxStateValue(rootState.progressReports.all)'})
  data!: GenericObject[];

  @property({type: Number, computed: 'getReduxStateValue(rootState.progressReports.count)'})
  totalResults!: number;

  _getReportTitle(report: GenericObject) {
    return getReportTitle(report);
  }

}

window.customElements.define('progress-reports-list', ProgressReportsList);
