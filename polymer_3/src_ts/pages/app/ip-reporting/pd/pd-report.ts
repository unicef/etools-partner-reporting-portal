import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-route/app-route';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/iron-pages/iron-pages';

import '../../../../elements/etools-prp-ajax';
import '../../../../elements/etools-prp-permissions';
import '../../../../elements/page-header';
import '../../../../elements/page-body';
import '../../../../elements/reporting-period';
import '../../../../elements/report-status';
import '../../../../elements/message-box';
import '../../../../elements/error-modal';
import {ErrorModalEl} from '../../../../elements/error-modal';
import '../../../../elements/ip-reporting/pd-reports-report-title';
import '../../../../elements/ip-reporting/pd-report-export-button';
import '../../../../elements/ip-reporting/pd-modal';
import {PdModalEl} from '../../../../elements/ip-reporting/pd-modal';
import '../../../../elements/ip-reporting/authorized-officer-modal';
import {AuthorizedOfficerModalEl} from '../../../../elements/ip-reporting/authorized-officer-modal';
import './pd-report-sr';
import './pd-report-hr';
import './pd-report-qpr';

import {programmeDocumentReportsCurrent} from '../../../../redux/selectors/programmeDocumentReports';
import {currentProgrammeDocument} from '../../../../redux/selectors/programmeDocuments';
import {pdReportsSetCurrent, pdReportsFetchSingle, pdReportsUpdateSingle} from '../../../../redux/actions/pdReports';

import Endpoints from '../../../../endpoints';
import UtilsMixin from '../../../../mixins/utils-mixin';
import ProgressReportUtilsMixin from '../../../../mixins/progress-report-utils-mixin';
import RoutingMixin from '../../../../mixins/routing-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import {sharedStyles} from '../../../../styles/shared-styles';
import {buttonsStyles} from '../../../../styles/buttons-styles';
import {GenericObject} from '../../../../typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {EtoolsPrpAjaxEl} from '../../../../elements/etools-prp-ajax';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {RootState} from '../../../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class PageIpReportingPdReport extends LocalizeMixin(
  RoutingMixin(ProgressReportUtilsMixin(UtilsMixin(ReduxConnectedElement)))
) {
  public static get template() {
    return html`
      ${sharedStyles} ${buttonsStyles}
      <style>
        :host {
          display: block;

          --page-header-above-title: {
            position: absolute;
            left: 0;
            top: -23px;
          }
        }

        pd-reports-report-title {
          margin-left: 5px;
          font-size: 10px;
          padding: 1px 3px;
        }

        .header-content {
          margin: 0.5em 0;
        }

        .toolbar report-status {
          margin-right: 0.5em;
        }

        .toolbar a {
          text-decoration: none;
        }

        .tabs paper-tab {
          text-transform: uppercase;
        }

        .pd-details-link {
          margin-left: 0.5em;

          @apply --link;
        }
      </style>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <app-route route="{{route}}" pattern="/:report_id/:mode" data="{{routeData}}"> </app-route>

      <etools-prp-ajax id="report" url="[[reportUrl]]" params="[[queryParams]]"> </etools-prp-ajax>

      <etools-prp-ajax id="submit" url="[[submitUrl]]" method="post"> </etools-prp-ajax>

      <page-header title="[[headingPrefix]]" back="[[backLink]]">
        <reporting-period slot="above-title" range="[[currentReport.reporting_period]]"> </reporting-period>

        <pd-reports-report-title slot="above-title" report="[[currentReport]]"> </pd-reports-report-title>

        <paper-button class="btn-primary" slot="in-title" role="button" on-tap="_showPdDetails">
          [[currentReport.programme_document.reference_number]]
        </paper-button>

        <template is="dom-if" if="[[_equals(currentPd.status, 'Suspended')]]" restamp="true">
          <message-box slot="header-content" type="warning">
            This report belongs to a suspended PD. Please contact UNICEF programme focal person to confirm reporting
            requirement.
          </message-box>
        </template>

        <div slot="toolbar">
          <report-status status="[[currentReport.status]]"></report-status>

          <template is="dom-if" if="[[_canExport(currentReport, mode, permissions)]]" restamp="true">
            <pd-report-export-button></pd-report-export-button>
          </template>

          <template is="dom-if" if="[[canSubmit]]" restamp="true">
            <paper-button class="btn-primary" on-tap="_submit" disabled="[[busy]]" raised>
              [[localize('submit')]]
            </paper-button>
          </template>
        </div>

        <div slot="toolbar">
          <template is="dom-if" if="[[submittedOnBehalf]]" restamp="true">
            <p>[[localize('submitted_by')]]: [[currentReport.submitting_user]]</p>
            <p>[[localize('on_behalf_of')]]: [[currentReport.submitted_by]]</p>
            <p>[[localize('date_of_submission')]]: [[currentReport.submission_date]]</p>
          </template>
        </div>

        <div slot="tabs">
          <paper-tabs selected="{{selectedTab}}" attr-for-selected="name" scrollable hide-scroll-buttons>
            <template is="dom-if" if="[[_equals(currentReport.report_type, 'HR')]]" restamp="true">
              <paper-tab name="reporting">[[localize('reporting_on_indicators')]]</paper-tab>
            </template>

            <template is="dom-if" if="[[_equals(currentReport.report_type, 'QPR')]]" restamp="true">
              <paper-tab name="reporting">[[localize('reporting_on_results')]]</paper-tab>
              <paper-tab name="info">[[localize('other_info')]]</paper-tab>
            </template>

            <template is="dom-if" if="[[_equals(currentReport.report_type, 'SR')]]" restamp="true">
              <paper-tab name="reporting">[[localize('reporting_on_data')]]</paper-tab>
            </template>
          </paper-tabs>
        </div>
      </page-header>

      <page-body>
        <template is="dom-if" if="[[_equals(currentReport.report_type, 'HR')]]" restamp="true">
          <page-pd-report-hr selected-tab="[[selectedTab]]" report="[[currentReport]]"> </page-pd-report-hr>
        </template>

        <template is="dom-if" if="[[_equals(currentReport.report_type, 'QPR')]]" restamp="true">
          <page-pd-report-qpr selected-tab="[[selectedTab]]" report="[[currentReport]]"> </page-pd-report-qpr>
        </template>

        <template is="dom-if" if="[[_equals(currentReport.report_type, 'SR')]]" restamp="true">
          <page-pd-report-sr selected-tab="[[selectedTab]]" report="[[currentReport]]"> </page-pd-report-sr>
        </template>
      </page-body>

      <pd-modal id="pdDetails"></pd-modal>

      <error-modal id="error"></error-modal>

      <authorized-officer-modal
        id="officer"
        pd-id="[[pdId]]"
        report-id="[[reportId]]"
        data="[[currentReport]]"
        submit-url="[[submitUrl]]"
      >
      </authorized-officer-modal>
    `;
  }

  @property({type: String})
  path!: string;

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Object, computed: '_currentProgrammeDocument(rootState)'})
  currentPd!: GenericObject;

  @property({type: String})
  selectedTab = 'reporting';

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.mode)'})
  mode!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  reportId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)'})
  pdId!: string;

  @property({type: String, computed: '_computeReportUrl(locationId, reportId, pdId)'})
  reportUrl!: string;

  @property({type: Object, computed: '_programmeDocumentReportsCurrent(rootState)'})
  currentReport!: GenericObject;

  @property({type: String, computed: '_computeHeadingPrefix(mode, localize)'})
  headingPrefix!: string;

  @property({type: String, computed: '_computeBackLink(pdId)'})
  backLink!: string;

  @property({type: Boolean, computed: '_computeCanSubmit(mode, currentReport, permissions)'})
  canSubmit = false;

  @property({type: Boolean, computed: '_computeSubmittedOnBehalf(currentReport)'})
  submittedOnBehalf!: boolean;

  @property({type: String, computed: '_computeSubmitUrl(locationId, currentReport.id, currentReport.report_type)'})
  submitUrl!: string;

  @property({type: String})
  refreshUrl = Endpoints.reportProgressReset();

  @property({type: Boolean})
  busy = false;

  fetchReportDebouncer!: Debouncer | null;

  static get observers() {
    return [
      '_fetchReport(reportUrl, queryParams)',
      '_onReportChanged(routeData.report_id, routeData.mode)',
      '_onReportStatusChanged(currentReport, routeData.mode)',
      '_handlePermissions(permissions, mode, _baseUrl, backLink)'
    ];
  }

  _computeReportUrl(locationId: string, reportId: string, _: any) {
    return Endpoints.programmeDocumentReport(locationId, reportId);
  }

  _computeSubmitUrl(locationId: string, reportId: string, reportType: string) {
    switch (reportType) {
      case 'SR':
        return Endpoints.programmeDocumentReportSubmitSpecial(locationId, reportId);

      default:
        return Endpoints.programmeDocumentReportSubmit(locationId, reportId);
    }
  }

  _currentProgrammeDocument(rootState: RootState) {
    return currentProgrammeDocument(rootState);
  }

  _programmeDocumentReportsCurrent(rootState: RootState) {
    const currentReport = programmeDocumentReportsCurrent(rootState);
    if (currentReport && Object.keys(currentReport).length) {
      return currentReport;
    }
  }

  _onReportChanged(reportId: string, mode: any) {
    if (!reportId || !mode) {
      return;
    }
    this.reduxStore.dispatch(pdReportsSetCurrent(reportId, mode));
  }

  _onReportStatusChanged(currentReport: GenericObject, mode: any) {
    if (!currentReport) {
      return;
    }

    if (currentReport.status === 'Sen') {
      this.set('routeData.mode', 'edit');
    }
    if (this._isReadOnlyReport(currentReport) && (mode || '').toLowerCase !== 'view') {
      this.set('routeData.mode', 'view');
    }
  }

  _fetchReport() {
    if (!this.pdId || !this.reportUrl) {
      return;
    }

    this.fetchReportDebouncer = Debouncer.debounce(this.fetchReportDebouncer, timeOut.after(300), () => {
      const reportThunk = (this.$.report as EtoolsPrpAjaxEl).thunk();
      (this.$.report as EtoolsPrpAjaxEl).abort();
      this.reduxStore.dispatch(pdReportsFetchSingle(reportThunk, this.pdId));
    });
  }

  _computeHeadingPrefix(mode: string, localize: (x: string) => string) {
    switch (mode) {
      case 'view':
        return localize('report_for');

      case 'edit':
        return localize('enter_data_for');

      default:
        return '';
    }
  }

  _computeBackLink(pdId: string) {
    return 'pd/' + pdId + '/view/reports';
  }

  _showPdDetails(e: CustomEvent) {
    e.preventDefault();

    (this.$.pdDetails as PdModalEl).open();
  }

  _canExport(report: GenericObject, mode: string, permissions: GenericObject) {
    if (!report || !permissions) {
      return false;
    }
    switch (true) {
      case report.status === 'Sub' && (!permissions || !permissions.exportSubmittedProgressReport):
      case mode === 'edit':
        return false;

      default:
        return true;
    }
  }

  _computeCanSubmit(mode: string, report: GenericObject, permissions: GenericObject) {
    if (!report) {
      return false;
    }
    const isEnded = report.programme_document && report.programme_document.status === 'End';
    switch (true) {
      case mode === 'view' && !isEnded:
      case report.programme_document &&
        (report.programme_document.status === 'Sig' || report.programme_document.status === 'Clo'):
      case !permissions || !permissions.editProgressReport:
        return false;

      default:
        return true;
    }
  }

  _computeSubmittedOnBehalf(currentReport: GenericObject) {
    if (!currentReport || currentReport.submitted_by === undefined) {
      return;
    }
    return currentReport.submitted_by !== currentReport.submitting_user;
  }

  _handlePermissions(permissions: GenericObject, mode: string, baseUrl: string, tail: string) {
    if (!permissions) {
      return;
    }
    if (!permissions.editProgressReport && mode === 'edit') {
      window.history.pushState(null, document.title, this.buildUrl(baseUrl, tail));
    }
  }

  _submit() {
    this.set('busy', true);
    (this.$.submit as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        const newPath = this.buildUrl(this._baseUrl, 'pd/' + this.pdId + '/view/reports');

        this.reduxStore.dispatch(pdReportsUpdateSingle(this.pdId, this.reportId, res.data));

        this.set('busy', false);
        this.set('path', newPath);
      })
      .catch((res: GenericObject) => {
        const authorizedError = res.data.error_codes.filter((error: string) => {
          return error === 'PR_SUBMISSION_FAILED_USER_NOT_AUTHORIZED_OFFICER';
        });

        this.set('busy', false);

        if (authorizedError.length > 0) {
          return (this.$.officer as AuthorizedOfficerModalEl).open();
        }
        return (this.$.error as ErrorModalEl).open(res.data.non_field_errors);
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.fetchReportDebouncer && this.fetchReportDebouncer.isActive) {
      this.fetchReportDebouncer.cancel();
    }

    (this.$.report as EtoolsPrpAjaxEl).abort();
    (this.$.error as ErrorModalEl).close();
    (this.$.officer as AuthorizedOfficerModalEl).close();
  }
}

window.customElements.define('page-ip-reporting-pd-report', PageIpReportingPdReport);
