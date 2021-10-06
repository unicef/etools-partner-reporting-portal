var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-route/app-route';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/iron-pages/iron-pages';
import '../../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../../etools-prp-common/elements/etools-prp-permissions';
import '../../../../etools-prp-common/elements/page-header';
import '../../../../etools-prp-common/elements/page-body';
import '../../../../elements/reporting-period';
import '../../../../etools-prp-common/elements/report-status';
import '../../../../etools-prp-common/elements/message-box';
import '../../../../etools-prp-common/elements/error-modal';
import '../../../../elements/ip-reporting/pd-reports-report-title';
import '../../../../elements/ip-reporting/pd-report-export-button';
import '../../../../elements/ip-reporting/pd-modal';
import '../../../../elements/ip-reporting/authorized-officer-modal';
import './pd-report-sr';
import './pd-report-hr';
import './pd-report-qpr';
import { programmeDocumentReportsCurrent } from '../../../../redux/selectors/programmeDocumentReports';
import { currentProgrammeDocument } from '../../../../etools-prp-common/redux/selectors/programmeDocuments';
import { pdReportsSetCurrent, pdReportsFetchSingle, pdReportsUpdateSingle } from '../../../../redux/actions/pdReports';
import Endpoints from '../../../../endpoints';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';
import ProgressReportUtilsMixin from '../../../../mixins/progress-report-utils-mixin';
import RoutingMixin from '../../../../etools-prp-common/mixins/routing-mixin';
import LocalizeMixin from '../../../../etools-prp-common/mixins/localize-mixin';
import { sharedStyles } from '../../../../etools-prp-common/styles/shared-styles';
import { buttonsStyles } from '../../../../etools-prp-common/styles/buttons-styles';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class PageIpReportingPdReport extends LocalizeMixin(RoutingMixin(ProgressReportUtilsMixin(UtilsMixin(ReduxConnectedElement)))) {
    constructor() {
        super(...arguments);
        this.selectedTab = 'reporting';
        this.canSubmit = false;
        this.refreshUrl = Endpoints.reportProgressReset();
        this.busy = false;
    }
    static get template() {
        return html `
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
    static get observers() {
        return [
            '_fetchReport(reportUrl, queryParams)',
            '_onReportChanged(routeData.report_id, routeData.mode)',
            '_onReportStatusChanged(currentReport, routeData.mode)',
            '_handlePermissions(permissions, mode, _baseUrl, backLink)'
        ];
    }
    _computeReportUrl(locationId, reportId, _) {
        return Endpoints.programmeDocumentReport(locationId, reportId);
    }
    _computeSubmitUrl(locationId, reportId, reportType) {
        switch (reportType) {
            case 'SR':
                return Endpoints.programmeDocumentReportSubmitSpecial(locationId, reportId);
            default:
                return Endpoints.programmeDocumentReportSubmit(locationId, reportId);
        }
    }
    _currentProgrammeDocument(rootState) {
        return currentProgrammeDocument(rootState);
    }
    _programmeDocumentReportsCurrent(rootState) {
        const currentReport = programmeDocumentReportsCurrent(rootState);
        if (currentReport && Object.keys(currentReport).length) {
            return currentReport;
        }
    }
    _onReportChanged(reportId, mode) {
        if (!reportId || !mode) {
            return;
        }
        this.reduxStore.dispatch(pdReportsSetCurrent(reportId, mode));
    }
    _onReportStatusChanged(currentReport, mode) {
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
            const reportThunk = this.$.report.thunk();
            this.$.report.abort();
            this.reduxStore.dispatch(pdReportsFetchSingle(reportThunk, this.pdId));
        });
    }
    _computeHeadingPrefix(mode, localize) {
        switch (mode) {
            case 'view':
                return localize('report_for');
            case 'edit':
                return localize('enter_data_for');
            default:
                return '';
        }
    }
    _computeBackLink(pdId) {
        return 'pd/' + pdId + '/view/reports';
    }
    _showPdDetails(e) {
        e.preventDefault();
        this.$.pdDetails.open();
    }
    _canExport(report, mode, permissions) {
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
    _computeCanSubmit(mode, report, permissions) {
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
    _computeSubmittedOnBehalf(currentReport) {
        if (!currentReport || currentReport.submitted_by === undefined) {
            return;
        }
        return currentReport.submitted_by !== currentReport.submitting_user;
    }
    _handlePermissions(permissions, mode, baseUrl, tail) {
        if (!permissions) {
            return;
        }
        if (!permissions.editProgressReport && mode === 'edit') {
            window.history.pushState(null, document.title, this.buildUrl(baseUrl, tail));
        }
    }
    _submit() {
        this.set('busy', true);
        this.$.submit
            .thunk()()
            .then((res) => {
            const newPath = this.buildUrl(this._baseUrl, 'pd/' + this.pdId + '/view/reports');
            this.reduxStore.dispatch(pdReportsUpdateSingle(this.pdId, this.reportId, res.data));
            this.set('busy', false);
            this.set('path', newPath);
        })
            .catch((res) => {
            const authorizedError = res.data.error_codes.filter((error) => {
                return error === 'PR_SUBMISSION_FAILED_USER_NOT_AUTHORIZED_OFFICER';
            });
            this.set('busy', false);
            if (authorizedError.length > 0) {
                return this.$.officer.open();
            }
            return this.$.error.open(res.data.non_field_errors);
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.fetchReportDebouncer && this.fetchReportDebouncer.isActive) {
            this.fetchReportDebouncer.cancel();
        }
        this.$.report.abort();
        this.$.error.close();
        this.$.officer.close();
    }
}
__decorate([
    property({ type: String })
], PageIpReportingPdReport.prototype, "path", void 0);
__decorate([
    property({ type: Object })
], PageIpReportingPdReport.prototype, "routeData", void 0);
__decorate([
    property({ type: Object })
], PageIpReportingPdReport.prototype, "permissions", void 0);
__decorate([
    property({ type: Object, computed: '_currentProgrammeDocument(rootState)' })
], PageIpReportingPdReport.prototype, "currentPd", void 0);
__decorate([
    property({ type: String })
], PageIpReportingPdReport.prototype, "selectedTab", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.mode)' })
], PageIpReportingPdReport.prototype, "mode", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)' })
], PageIpReportingPdReport.prototype, "reportId", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PageIpReportingPdReport.prototype, "locationId", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)' })
], PageIpReportingPdReport.prototype, "pdId", void 0);
__decorate([
    property({ type: String, computed: '_computeReportUrl(locationId, reportId, pdId)' })
], PageIpReportingPdReport.prototype, "reportUrl", void 0);
__decorate([
    property({ type: Object, computed: '_programmeDocumentReportsCurrent(rootState)' })
], PageIpReportingPdReport.prototype, "currentReport", void 0);
__decorate([
    property({ type: String, computed: '_computeHeadingPrefix(mode, localize)' })
], PageIpReportingPdReport.prototype, "headingPrefix", void 0);
__decorate([
    property({ type: String, computed: '_computeBackLink(pdId)' })
], PageIpReportingPdReport.prototype, "backLink", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeCanSubmit(mode, currentReport, permissions)' })
], PageIpReportingPdReport.prototype, "canSubmit", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeSubmittedOnBehalf(currentReport)' })
], PageIpReportingPdReport.prototype, "submittedOnBehalf", void 0);
__decorate([
    property({ type: String, computed: '_computeSubmitUrl(locationId, currentReport.id, currentReport.report_type)' })
], PageIpReportingPdReport.prototype, "submitUrl", void 0);
__decorate([
    property({ type: String })
], PageIpReportingPdReport.prototype, "refreshUrl", void 0);
__decorate([
    property({ type: Boolean })
], PageIpReportingPdReport.prototype, "busy", void 0);
window.customElements.define('page-ip-reporting-pd-report', PageIpReportingPdReport);
