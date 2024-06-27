import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {sharedStyles} from '../../../../etools-prp-common/styles/shared-styles.js';
import {buttonsStyles} from '../../../../etools-prp-common/styles/buttons-styles.js';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '@polymer/app-route/app-route.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/iron-pages/iron-pages.js';
import '../../../../etools-prp-common/elements/etools-prp-ajax.js';
import '../../../../etools-prp-common/elements/etools-prp-permissions.js';
import '../../../../etools-prp-common/elements/page-header.js';
import '../../../../etools-prp-common/elements/page-body.js';
import '../../../../elements/reporting-period.js';
import '../../../../etools-prp-common/elements/report-status.js';
import '../../../../etools-prp-common/elements/message-box.js';
import '../../../../etools-prp-common/elements/error-modal.js';
import {ErrorModalEl} from '../../../../etools-prp-common/elements/error-modal.js';
import '../../../../elements/ip-reporting/pd-reports-report-title.js';
import '../../../../elements/ip-reporting/pd-report-export-button.js';
import '../../../../elements/ip-reporting/pd-modal.js';
import {PdModalEl} from '../../../../elements/ip-reporting/pd-modal.js';
import '../../../../elements/ip-reporting/authorized-officer-modal.js';
import {AuthorizedOfficerModalEl} from '../../../../elements/ip-reporting/authorized-officer-modal.js';
import './pd-report-sr.js';
import './pd-report-hr.js';
import './pd-report-qpr.js';
import {programmeDocumentReportsCurrent} from '../../../../redux/selectors/programmeDocumentReports.js';
import {currentProgrammeDocument} from '../../../../etools-prp-common/redux/selectors/programmeDocuments.js';
import {pdReportsSetCurrent, pdReportsFetchSingle, pdReportsUpdateSingle} from '../../../../redux/actions/pdReports.js';
import Endpoints from '../../../../endpoints.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import ProgressReportUtilsMixin from '../../../../mixins/progress-report-utils-mixin.js';
import RoutingMixin from '../../../../etools-prp-common/mixins/routing-mixin.js';
import LocalizeMixin from '../../../../etools-prp-common/mixins/localize-mixin.js';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-common/elements/etools-prp-ajax.js';
import {store} from '../../../../redux/store.js';
import {RootState} from '../../../../typings/redux.types.js';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util.js';

@customElement('page-ip-reporting-pd-report')
export class PageIpReportingPdReport extends LocalizeMixin(
  RoutingMixin(ProgressReportUtilsMixin(UtilsMixin(LitElement)))
) {
  static styles = [
    css`
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
  refreshUrl = Endpoints.reportProgressReset();

  @property({type: Boolean})
  busy = false;

  render() {
    return html`
      ${sharedStyles} ${buttonsStyles}

      <etools-prp-permissions .permissions=${this.permissions}></etools-prp-permissions>
      <iron-location .query=${this.query}></iron-location>
      <iron-query-params .paramsString=${this.query} .paramsObject=${this.queryParams}></iron-query-params>
      <app-route .route=${this.route} pattern="/:report_id/:mode" .data=${this.routeData}></app-route>
      <etools-prp-ajax id="report" .url=${this.reportUrl} .params=${this.queryParams}></etools-prp-ajax>
      <etools-prp-ajax id="submit" .url=${this.submitUrl} method="post"></etools-prp-ajax>

      <page-header title=${this.headingPrefix} back=${this.backLink}>
        <reporting-period slot="above-title" .range=${this.currentReport.reporting_period}></reporting-period>
        <pd-reports-report-title slot="above-title" .report=${this.currentReport}></pd-reports-report-title>
        <paper-button class="btn-primary" slot="in-title" role="button" @click=${this._showPdDetails}>
          ${this.currentReport.programme_document.reference_number}
        </paper-button>

        ${this._equals(this.currentPd.status, 'Suspended')
          ? html`
              <message-box slot="header-content" type="warning">
                This report belongs to a suspended PD. Please contact UNICEF programme focal person to confirm reporting
                requirement.
              </message-box>
            `
          : html``}

        <div slot="toolbar">
          <report-status .status=${this.currentReport.status}></report-status>

          ${this._canExport(this.currentReport, this.mode, this.permissions)
            ? html`<pd-report-export-button></pd-report-export-button>`
            : html``}
          ${this.canSubmit
            ? html`
                <paper-button class="btn-primary" @click=${this._submit} ?disabled=${this.busy} raised>
                  ${this.localize('submit')}
                </paper-button>
              `
            : html``}
        </div>

        <div slot="toolbar">
          ${this.submittedOnBehalf
            ? html`
                <p>${this.localize('submitted_by')}: ${this.currentReport.submitting_user}</p>
                <p>${this.localize('on_behalf_of')}: ${this.currentReport.submitted_by}</p>
                <p>${this.localize('date_of_submission')}: ${this.currentReport.submission_date}</p>
              `
            : html``}
        </div>

        <div slot="tabs">
          <paper-tabs
            .selected=${this.selectedTab}
            attr-for-selected="name"
            scrollable
            hide-scroll-buttons
            @selected-changed=${this._selectedTabChanged}
          >
            ${this._equals(this.currentReport.report_type, 'HR')
              ? html`<paper-tab name="reporting">${this.localize('reporting_on_indicators')}</paper-tab>`
              : html``}
            ${this._equals(this.currentReport.report_type, 'QPR')
              ? html`
                  <paper-tab name="reporting">${this.localize('reporting_on_results')}</paper-tab>
                  <paper-tab name="info">${this.localize('other_info')}</paper-tab>
                `
              : html``}
            ${this._equals(this.currentReport.report_type, 'SR')
              ? html`<paper-tab name="reporting">${this.localize('reporting_on_data')}</paper-tab>`
              : html``}
          </paper-tabs>
        </div>
      </page-header>

      <page-body>
        ${this._equals(this.currentReport.report_type, 'HR')
          ? html`<page-pd-report-hr
              selected-tab="${this.selectedTab}"
              report="${this.currentReport}"
            ></page-pd-report-hr>`
          : html``}
        ${this._equals(this.currentReport.report_type, 'QPR')
          ? html`<page-pd-report-qpr
              selected-tab="${this.selectedTab}"
              report="${this.currentReport}"
            ></page-pd-report-qpr>`
          : html``}
        ${this._equals(this.currentReport.report_type, 'SR')
          ? html`<page-pd-report-sr
              selected-tab="${this.selectedTab}"
              report="${this.currentReport}"
            ></page-pd-report-sr>`
          : html``}
      </page-body>

      <pd-modal id="pdDetails"></pd-modal>
      <error-modal id="error"></error-modal>
      <authorized-officer-modal
        id="officer"
        pd-id="${this.pdId}"
        report-id="${this.reportId}"
        data="${this.currentReport}"
        submit-url="${this.submitUrl}"
      >
      </authorized-officer-modal>
    `;
  }

  stateChanged(state: RootState) {
    if (this.currentPd !== currentProgrammeDocument(state)) {
      this.currentPd = currentProgrammeDocument(state);
    }

    if (this.currentReport !== programmeDocumentReportsCurrent(state)) {
      this.currentReport = programmeDocumentReportsCurrent(state);
    }

    if (this.mode !== state.programmeDocumentReports.current.mode) {
      this.mode = state.programmeDocumentReports.current.mode;
    }

    if (this.reportId !== state.programmeDocumentReports.current.id) {
      this.reportId = state.programmeDocumentReports.current.id;
    }

    if (this.pdId !== state.programmeDocuments.current) {
      this.pdId = state.programmeDocuments.current;
    }

    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('reportUrl') || changedProperties.has('queryParams')) {
      this._fetchReport();
    }

    if (changedProperties.has('routeData')) {
      this._onReportChanged(this.routeData.report_id, this.routeData.mode);
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
      this._handlePermissions(this.permissions, this.mode, this.baseUrl, this.backLink);
    }

    if (changedProperties.has('locationId') || changedProperties.has('reportId') || changedProperties.has('pdId')) {
      this.reportUrl = this._computeReportUrl(this.locationId, this.reportId, this.pdId);
    }

    if (changedProperties.has('mode') || changedProperties.has('localize')) {
      this.headingPrefix = this._computeHeadingPrefix(this.mode, this.localize);
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
  }

  _onReportStatusChanged(currentReport: any, mode: any) {
    if (!currentReport) {
      return;
    }

    if (currentReport.status === 'Sen') {
      this.routeData = {...this.routeData, mode: 'edit'};
    }

    if (this._isReadOnlyReport(currentReport) && (mode || '').toLowerCase() !== 'view') {
      this.routeData = {...this.routeData, mode: 'view'};
    }
  }

  _fetchReport() {
    if (!this.pdId || !this.reportUrl) {
      return;
    }

    debounce(() => {
      const elem = this.shadowRoot!.querySelector('#report') as EtoolsPrpAjaxEl;
      elem.abort();
      store.dispatch(pdReportsFetchSingle(elem.thunk(), this.pdId));
    }, 250);
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

    (this.shadowRoot!.getElementById('pdDetails') as PdModalEl).open();
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

  _handlePermissions(permissions: any, mode: string, baseUrl: string, tail: string) {
    if (!permissions) {
      return;
    }
    if (!permissions.editProgressReport && mode === 'edit') {
      window.history.pushState(null, document.title, this.buildUrl(baseUrl, tail));
    }
  }

  _submit() {
    this.busy = true;
    (this.shadowRoot!.getElementById('submit') as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        const newPath = this.buildUrl(this._baseUrl, 'pd/' + this.pdId + '/view/reports');

        store.dispatch(pdReportsUpdateSingle(this.pdId, this.reportId, res.data));

        this.busy = false;
        this.path = newPath;
      })
      .catch((res: any) => {
        const authorizedError = res.data.error_codes.filter((error: string) => {
          return error === 'PR_SUBMISSION_FAILED_USER_NOT_AUTHORIZED_OFFICER';
        });

        this.busy = false;

        if (authorizedError.length > 0) {
          return (this.shadowRoot!.getElementById('officer') as AuthorizedOfficerModalEl).open();
        }
        return (this.shadowRoot!.getElementById('error') as ErrorModalEl).open(res.data.non_field_errors);
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    (this.shadowRoot!.getElementById('report') as EtoolsPrpAjaxEl).abort();
    (this.shadowRoot!.getElementById('error') as ErrorModalEl).close();
    (this.shadowRoot!.getElementById('officer') as AuthorizedOfficerModalEl).close();
  }
}
