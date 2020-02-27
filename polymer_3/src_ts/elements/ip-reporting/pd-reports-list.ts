import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-loading/etools-loading.js';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '../report-status';
import '../list-placeholder';
import '../etools-prp-permissions';
import './pd-reports-report-title';
import {GenericObject} from '../../typings/globals.types';
import DataTableMixin from '../../mixins/data-table-mixin';
import PaginationMixin from '../../mixins/pagination-mixin';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import {programmeDocumentReportsAll, programmeDocumentReportsCount} from '../../redux/selectors/programmeDocumentReports';
import {getLink} from './js/pd-reports-list-functions';
import {tableStyles} from '../../styles/table-styles';
import {RootState} from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin DataTableMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin ProgressReportUtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdReportsList extends LocalizeMixin(ProgressReportUtilsMixin(RoutingMixin(
  UtilsMixin(PaginationMixin(DataTableMixin(ReduxConnectedElement)))))) {

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

    <etools-prp-permissions
        permissions="{{permissions}}">
    </etools-prp-permissions>

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
        <etools-data-table-column>
          <div class="table-column">[[localize('report_number')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="status" sortable>
          <div class="table-column">[[localize('report_status')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="due_date" sortable>
          <div class="table-column">[[localize('due_date')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="date_of_submission" sortable>
          <div class="table-column">[[localize('date_of_submission')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="reporting_period" sortable>
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
            <div class="table-cell table-cell--text cell-reports">
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
          loading="[[!loaded]]">
      </list-placeholder>

      <etools-data-table-footer
          page-size="[[pageSize]]"
          page-number="[[pageNumber]]"
          total-results="[[totalResults]]"
          visible-range="{{visibleRange}}"
          on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged">
      </etools-data-table-footer>

      <etools-loading active="[[!loaded]]"></etools-loading>
    </etools-content-panel>
  `;
  }


  @property({type: Boolean})
  loaded!: boolean;

  @property({type: Object, notify: true})
  filters!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)'})
  pdId!: string;

  @property({type: Array, computed: '_programmeDocumentReportsAll(rootState)'})
  data!: any[];

  @property({type: Number, computed: '_programmeDocumentReportsCount(rootState)'})
  totalResults!: any[];

  _getLink(report: GenericObject, permissions: GenericObject) {
    const suffix = this._getMode(report, permissions);
    return getLink(report, suffix, this.buildUrl, this._baseUrl);
  }

  _programmeDocumentReportsAll(rootState: RootState) {
    const aa = programmeDocumentReportsAll(rootState);
    console.log('_programmeDocumentReportsAll...');
    console.log(aa);
    return aa;
  }

  _programmeDocumentReportsCount(rootState: RootState) {
    return programmeDocumentReportsCount(rootState);
  }

}
window.customElements.define('pd-reports-list', PdReportsList);

export {PdReportsList as PdReportsListEl};
