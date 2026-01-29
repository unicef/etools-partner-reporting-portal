import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {sharedStyles} from '../../../../etools-prp-common/styles/shared-styles.js';
import {buttonsStyles} from '../../../../etools-prp-common/styles/buttons-styles.js';
import '../../../../etools-prp-common/elements/etools-prp-permissions.js';
import '../../../../etools-prp-common/elements/page-header.js';
import '../../../../etools-prp-common/elements/page-body.js';
import '../../../../elements/reporting-period.js';
import '../../../../etools-prp-common/elements/report-status.js';
import '../../../../etools-prp-common/elements/message-box.js';
import '../../../../etools-prp-common/elements/error-modal.js';
import '../../../../elements/ip-reporting/pd-reports-report-title.js';
import '../../../../elements/ip-reporting/pd-report-export-button.js';
import '../../../../elements/ip-reporting/pd-modal.js';
import '../../../../elements/ip-reporting/authorized-officer-modal.js';
import './pd-report-sr.js';
import './pd-report-hr.js';
import './pd-report-qpr.js';
import {programmeDocumentReportsCurrent} from '../../../../redux/selectors/programmeDocumentReports.js';
import {currentProgrammeDocument} from '../../../../etools-prp-common/redux/selectors/programmeDocuments.js';
import {pdReportsSetCurrent, pdReportsFetchSingle, pdReportsUpdateSingle} from '../../../../redux/actions/pdReports.js';
import Endpoints from '../../../../endpoints.js';
import ProgressReportUtilsMixin from '../../../../mixins/progress-report-utils-mixin.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../../../redux/store.js';
import {RootState} from '../../../../typings/redux.types.js';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request.js';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util.js';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router.js';
import {buildUrl} from '../../../../etools-prp-common/utils/util.js';

@customElement('page-ip-reporting-pd-report')
export class PageIpReportingPdReport extends ProgressReportUtilsMixin(connect(store)(LitElement)) {
  static styles = [
    css`
      :host {
        display: block;
        --page-header-above-title: {
          position: absolute;
          left: 0;
          top: -23px;
        };
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

      .pd-details-link {
        margin-left: 0.5em;
        /* apply --link styles */
      }
    `
  ];

  @property({type: String})
  path = '';

  @property({type: Object})
  routeData: any;

  @property({type: Object})
  permissions: any;

  @property({type: Object})
  currentPd: any;

  @property({type: String})
  selectedTab = 'reporting';

  @property({type: String})
  mode!: string;

  @property({type: String})
  reportId!: string;

  @property({type: String})
  locationId!: string;

  @property({type: String})
  pdId!: string;

  @property({type: String})
  reportUrl!: string;

  @property({type: Object})
  queryParams: any;

  @property({type: Object})
  currentReport: any;

  @property({type: String})
  headingPrefix = '';

  @property({type: String})
  backLink = '';

  @property({type: Boolean})
  canSubmit = false;

  @property({type: Boolean})
  submittedOnBehalf?: boolean;

  @property({type: String})
  submitUrl = '';

  @property({type: String})
  baseUrl!: string;

  @property({type: String})
  refreshUrl = Endpoints.reportProgressReset();

  @property({type: Boolean})
  busy = false;

  @property({type: Array})
  tabs: any[] = [];

  render() {
    return html`
      ${sharedStyles} ${buttonsStyles}

      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      ></etools-prp-permissions>

      <page-header title=${this.headingPrefix} back=${this.backLink}>
        <reporting-period slot="above-title" .range=${this.currentReport?.reporting_period}></reporting-period>
        <pd-reports-report-title slot="above-title" .report=${this.currentReport}></pd-reports-report-title>
        <etools-button variant="text" slot="in-title" role="button" @click=${this._showPdDetails}>
          ${this.currentReport?.programme_document?.reference_number}
        </etools-button>

        ${this.currentPd?.status === 'Suspended'
          ? html`
              <message-box slot="header-content" type="warning">
                This report belongs to a suspended PD. Please contact UNICEF programme focal person to confirm reporting
                requirement.
              </message-box>
            `
          : html``}

        <div slot="toolbar">
          <report-status .status=${this.currentReport?.status}></report-status>

          ${this._canExport(this.currentReport, this.mode, this.permissions)
            ? html`<pd-report-export-button></pd-report-export-button>`
            : html``}
          ${this.canSubmit
            ? html`
                <etools-button variant="primary" @click=${this._submit} ?disabled=${this.busy}>
                  ${translate('SUBMIT')}
                </etools-button>
              `
            : html``}
        </div>

        <div slot="toolbar">
          ${this.submittedOnBehalf
            ? html`
                <p>${translate('SUBMITTED_BY')}: ${this.currentReport?.submitting_user}</p>
                <p>${translate('ON_BEHALF_OF')}: ${this.currentReport?.submitted_by}</p>
                <p>${translate('DATE_OF_SUBMISSION')}: ${this.currentReport?.submission_date}</p>
              `
            : html``}
        </div>

        <div slot="tabs">
          <etools-tabs-lit
            id="tabs"
            slot="tabs"
            .tabs="${this.tabs}"
            @sl-tab-show="${({detail}: any) => (this.selectedTab = detail.name)}"
            .activeTab="${this.selectedTab}"
          >
          </etools-tabs-lit>
        </div>
      </page-header>

      <page-body>
        ${this.currentReport?.report_type === 'HR'
          ? html`<page-pd-report-hr
              .selectedTab="${this.selectedTab}"
              .report="${this.currentReport}"
            ></page-pd-report-hr>`
          : html``}
        ${this.currentReport?.report_type === 'QPR'
          ? html`<page-pd-report-qpr
              .selectedTab="${this.selectedTab}"
              .report="${this.currentReport}"
            ></page-pd-report-qpr>`
          : html``}
        ${this.currentReport?.report_type === 'SR'
          ? html`<page-pd-report-sr
              .selectedTab="${this.selectedTab}"
              .report="${this.currentReport}"
            ></page-pd-report-sr>`
          : html``}
      </page-body>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._fetchReport = debounce(this._fetchReport.bind(this), 250);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  stateChanged(state: RootState) {
    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }

    if (state.workspaces.baseUrl && this.baseUrl !== state.workspaces.baseUrl) {
      this.baseUrl = state.workspaces.baseUrl;
    }

    if (state.app.routeDetails && !isJsonStrMatch(this.routeData, state.app.routeDetails?.params)) {
      this.routeData = state.app.routeDetails?.params;
    }

    if (!isJsonStrMatch(this.currentPd, currentProgrammeDocument(state))) {
      this.currentPd = currentProgrammeDocument(state);
    }

    if (!isJsonStrMatch(this.currentReport, programmeDocumentReportsCurrent(state))) {
      this.currentReport = programmeDocumentReportsCurrent(state);
      this.tabs = [
        {
          tab: 'reporting',
          tabLabel:
            this.currentReport.report_type === 'HR'
              ? translate('REPORTING_ON_INDICATORS')
              : this.currentReport.report_type === 'QPR'
                ? translate('REPORTING_ON_RESULTS')
                : (translate('REPORTING_ON_DATA') as any as string),
          hidden: false
        }
      ];

      if (this.currentReport.report_type === 'QPR') {
        this.tabs = [
          ...this.tabs,
          {
            tab: 'info',
            tabLabel: translate('OTHER_INFO') as any as string,
            hidden: false
          }
        ];
      }
    }

    if (this.mode !== state.programmeDocumentReports.current.mode) {
      this.mode = state.programmeDocumentReports.current.mode;
    }

    if (this.reportId !== state.programmeDocumentReports?.current?.id) {
      this.reportId = state.programmeDocumentReports?.current?.id;
    }

    if (this.pdId !== state.programmeDocuments.currentPdId) {
      this.pdId = state.programmeDocuments.currentPdId;
    }

    if (this.locationId !== state.location?.id) {
      this.locationId = state.location?.id;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('reportUrl') || changedProperties.has('queryParams')) {
      this._fetchReport();
    }

    if (changedProperties.has('routeData')) {
      this._onReportChanged(this.routeData?.reportId, this.routeData?.mode);
    }

    if (changedProperties.has('currentReport') || changedProperties.has('routeData')) {
      this._onReportStatusChanged(this.currentReport, this.routeData.mode);
    }

    if (
      changedProperties.has('permissions') ||
      changedProperties.has('mode') ||
      changedProperties.has('baseUrl') ||
      changedProperties.has('backLink')
    ) {
      this._handlePermissions();
    }

    if (changedProperties.has('locationId') || changedProperties.has('reportId') || changedProperties.has('pdId')) {
      this.reportUrl = this._computeReportUrl(this.locationId, this.reportId, this.pdId);
    }

    if (changedProperties.has('mode')) {
      this.headingPrefix = this._computeHeadingPrefix(this.mode);
    }

    if (changedProperties.has('pdId')) {
      this.backLink = this._computeBackLink(this.pdId);
    }

    if (
      changedProperties.has('mode') ||
      changedProperties.has('currentReport') ||
      changedProperties.has('permissions')
    ) {
      this.canSubmit = this._computeCanSubmit(this.mode, this.currentReport, this.permissions);
    }

    if (changedProperties.has('currentReport')) {
      this.submittedOnBehalf = this._computeSubmittedOnBehalf(this.currentReport);
    }

    if (changedProperties.has('locationId') || changedProperties.has('currentReport')) {
      this.submitUrl = this._computeSubmitUrl(this.locationId, this.currentReport.id, this.currentReport.report_type);
    }
  }

  _computeReportUrl(locationId: string, reportId: string, _: any) {
    return locationId && reportId ? Endpoints.programmeDocumentReport(locationId, reportId) : '';
  }

  _computeSubmitUrl(locationId: string, reportId: string, reportType: string) {
    if (!locationId || !reportId) return '';

    switch (reportType) {
      case 'SR':
        return Endpoints.programmeDocumentReportSubmitSpecial(locationId, reportId);

      default:
        return Endpoints.programmeDocumentReportSubmit(locationId, reportId);
    }
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
    store.dispatch(pdReportsSetCurrent(reportId, mode));
    this._handlePermissions();
  }

  _onReportStatusChanged(currentReport: any, mode: any) {
    if (!currentReport) {
      return;
    }

    if (currentReport.status === 'Sen' && (mode || '').toLowerCase() !== 'edit') {
      this.routeData = {...this.routeData, mode: 'edit'};
      return;
    }

    if (this._isReadOnlyReport(currentReport) && (mode || '').toLowerCase() !== 'view') {
      const newRoute = {...this.routeData, mode: 'view'};
      if (!isJsonStrMatch(newRoute, this.routeData)) {
        this.routeData = newRoute;
      }
    }
  }

  _fetchReport() {
    if (!this.pdId || !this.reportUrl) {
      return;
    }

    store.dispatch(
      pdReportsFetchSingle(
        sendRequest({
          method: 'GET',
          endpoint: {url: this.reportUrl},
          params: this.queryParams
        }),
        this.pdId
      )
    );
  }

  _computeHeadingPrefix(mode: string) {
    switch (mode) {
      case 'view':
        return translate('REPORT_FOR') as any as string;

      case 'edit':
        return translate('ENTER_DATA_FOR') as any as string;

      default:
        return '';
    }
  }

  _computeBackLink(pdId: string) {
    return 'pd/' + pdId + '/view/reports';
  }

  _showPdDetails(e: CustomEvent) {
    e.preventDefault();

    openDialog({
      dialog: 'pd-modal',
      dialogData: {}
    });
  }

  _canExport(report: any, mode: string, permissions: any) {
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

  _computeCanSubmit(mode: string, report: any, permissions: any) {
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

  _computeSubmittedOnBehalf(currentReport: any) {
    if (!currentReport || currentReport.submitted_by === undefined) {
      return;
    }
    return currentReport.submitted_by !== currentReport.submitting_user;
  }

  _handlePermissions() {
    if (!this.permissions) {
      return;
    }

    if (!this.permissions.editProgressReport && this.mode === 'edit') {
      EtoolsRouter.updateAppLocation(buildUrl(this.baseUrl, this.backLink));
    }
  }

  _submit() {
    this.busy = true;
    sendRequest({
      method: 'POST',
      endpoint: {url: this.submitUrl}
    })
      .then((res: any) => {
        store.dispatch(pdReportsUpdateSingle(this.pdId, this.reportId, res));
        this.busy = false;
        EtoolsRouter.updateAppLocation(`${this.baseUrl}/pd/${this.pdId}/view/reports`);
      })
      .catch((err: any) => {
        const authorizedError = err.response.error_codes.filter((error: string) => {
          return error === 'PR_SUBMISSION_FAILED_USER_NOT_AUTHORIZED_OFFICER';
        });

        this.busy = false;

        if (authorizedError.length > 0) {
          openDialog({
            dialog: 'authorized-officer-modal',
            dialogData: {
              pdId: this.pdId,
              reportId: this.reportId,
              data: this.currentReport,
              submitUrl: this.submitUrl,
              isGpd: false
            }
          });
          return;
        }

        openDialog({
          dialog: 'error-modal',
          dialogData: {
            errors: err.response.non_field_errors
          }
        });
        return;
      });
  }
}
