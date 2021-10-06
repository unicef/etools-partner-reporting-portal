var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '../../../../../etools-prp-common/elements/labelled-item';
import '../../../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../../../etools-prp-common/elements/etools-prp-permissions';
import '../../../../../elements/ip-reporting/report-attachments';
import '../pd-sent-back';
import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import NotificationsMixin from '../../../../../etools-prp-common/mixins/notifications-mixin';
import LocalizeMixin from '../../../../../etools-prp-common/mixins/localize-mixin';
import Endpoints from '../../../../../endpoints';
import { reportInfoCurrent } from '../../../../../redux/selectors/reportInfo';
import { currentProgrammeDocument } from '../../../../../etools-prp-common/redux/selectors/programmeDocuments';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { pdReportsUpdate } from '../../../../../redux/actions/pdReports';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin LocalizeMixin
 */
class PagePdReportSrReporting extends LocalizeMixin(NotificationsMixin(UtilsMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.overrideMode = '';
    }
    static get template() {
        return html `
      <style include="app-grid-style">
        :host {
          display: block;
          margin-bottom: 25px;

          --app-grid-columns: 8;
          --app-grid-gutter: 25px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 7;
        }

        .row {
          @apply --app-grid-expandible-item;
        }

        .value {
          font-size: 16px;
          word-wrap: break-word;
        }

        .toggle-button-container {
          max-width: calc((100% - 0.1px) / 8 * 7 - 25px);

          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        #toggle-button {
          background-color: #0099ff;
          color: #fff;
          font-size: 14px;
        }
      </style>

      <pd-sent-back></pd-sent-back>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <etools-prp-ajax
        id="update"
        url="[[updateUrl]]"
        body="[[localData]]"
        content-type="application/json"
        method="put"
      >
      </etools-prp-ajax>

      <etools-content-panel no-header>
        <div class="app-grid">
          <div class="row">
            <labelled-item label="[[localize('description')]]">
              <span class="value">[[srDescription]]</span>
            </labelled-item>
          </div>

          <div class="row">
            <labelled-item label="[[localize('narrative')]]">
              <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                <span class="value">[[_withDefault(data.narrative)]]</span>
              </template>

              <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                <paper-input id="narrative" value="[[data.narrative]]" no-label-float char-counter maxlength="2000">
                </paper-input>
              </template>
            </labelled-item>
          </div>

          <div class="toggle-button-container row">
            <template is="dom-if" if="[[!_equals(computedMode, 'view')]]">
              <paper-button class="btn-primary" id="toggle-button" on-tap="_handleInput" raised>
                [[localize('save')]]
              </paper-button>
            </template>
          </div>

          <div class="row">
            <report-attachments readonly="[[_equals(computedMode, 'view')]]"> </report-attachments>
          </div>
        </div>
      </etools-content-panel>
    `;
    }
    static get observers() {
        return ['_updateData(localData.*)'];
    }
    _reportInfoCurrent(rootState) {
        return reportInfoCurrent(rootState);
    }
    _currentProgrammeDocument(rootState) {
        return currentProgrammeDocument(rootState);
    }
    _handleInput() {
        const textInput = this.shadowRoot.querySelector('#narrative');
        if (textInput && textInput.value && textInput.value.trim()) {
            this.set(['localData', textInput.id], textInput.value.trim());
        }
    }
    _updateData(change) {
        if (change.path.split('.').length < 2) {
            // Skip the initial assignment
            return;
        }
        this.updateDataDebouncer = Debouncer.debounce(this.updateDataDebouncer, timeOut.after(250), () => {
            if (!this.localData.narrative) {
                return;
            }
            const updateThunk = this.$.update.thunk();
            this.$.update.abort();
            this.reduxStore
                .dispatch(pdReportsUpdate(updateThunk, this.pdId, this.reportId))
                // @ts-ignore
                .then(() => {
                this._notifyChangesSaved();
            })
                // @ts-ignore
                .catch(function (err) {
                console.log(err);
            });
        });
    }
    _computeUpdateUrl(locationId, reportId) {
        if (!locationId || !reportId) {
            return;
        }
        return Endpoints.programmeDocumentReportUpdate(locationId, reportId);
    }
    _computeSrDescription(pdId, programmeDocuments, allPdReports, reportId) {
        // for some reason method was getting run on detach, so catch that
        if (!allPdReports || !allPdReports[pdId]) {
            return;
        }
        // get the current progress report's due date
        const progressReport = allPdReports[pdId].find((report) => {
            return report.id === parseInt(reportId);
        });
        const progressReportDueDate = progressReport && progressReport.due_date ? progressReport.due_date : null;
        // get the current programme document
        const currentPdReport = (programmeDocuments || []).find((report) => {
            return report.id === pdId;
        });
        if (!progressReportDueDate || !currentPdReport) {
            return '...';
        }
        // get the current SR reporting_period object from the current programme document's reporting_periods array
        const currentSrReport = (currentPdReport.reporting_periods || []).find((reporting_period) => {
            return (reporting_period.report_type === 'SR' && new Date(reporting_period.due_date) <= new Date(progressReportDueDate));
        });
        if (currentSrReport !== undefined && currentSrReport.description !== undefined) {
            return currentSrReport.description;
        }
        else {
            return '...';
        }
    }
    // @ts-ignore
    _computeMode(mode, overrideMode, report, permissions) {
        return permissions && permissions.savePdReport ? overrideMode || mode : 'view';
    }
    connectedCallback() {
        super.connectedCallback();
        this.set('localData', {});
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.updateDataDebouncer && this.updateDataDebouncer.isActive) {
            this.updateDataDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], PagePdReportSrReporting.prototype, "localData", void 0);
__decorate([
    property({ type: Object })
], PagePdReportSrReporting.prototype, "permissions", void 0);
__decorate([
    property({ type: Object, computed: '_reportInfoCurrent(rootState)' })
], PagePdReportSrReporting.prototype, "data", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)' })
], PagePdReportSrReporting.prototype, "pdId", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.programmeDocuments.all)' })
], PagePdReportSrReporting.prototype, "programmeDocuments", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.programmeDocumentReports.byPD)' })
], PagePdReportSrReporting.prototype, "allPdReports", void 0);
__decorate([
    property({ type: String, computed: '_computeSrDescription(pdId, programmeDocuments, allPdReports, reportId)' })
], PagePdReportSrReporting.prototype, "srDescription", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PagePdReportSrReporting.prototype, "locationId", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)' })
], PagePdReportSrReporting.prototype, "reportId", void 0);
__decorate([
    property({ type: String, computed: '_computeUpdateUrl(locationId, reportId)' })
], PagePdReportSrReporting.prototype, "updateUrl", void 0);
__decorate([
    property({ type: String })
], PagePdReportSrReporting.prototype, "overrideMode", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.mode)' })
], PagePdReportSrReporting.prototype, "mode", void 0);
__decorate([
    property({ type: String, computed: '_computeMode(mode, overrideMode, currentReport, permissions)' })
], PagePdReportSrReporting.prototype, "computedMode", void 0);
__decorate([
    property({ type: Object, computed: '_currentProgrammeDocument(rootState)' })
], PagePdReportSrReporting.prototype, "currentReport", void 0);
window.customElements.define('page-pd-report-sr-reporting', PagePdReportSrReporting);
