var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/paper-button/paper-button.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import Endpoints from '../../endpoints';
import { buttonsStyles } from '../../etools-prp-common/styles/buttons-styles';
import { programmeDocumentReportsCurrent } from '../../redux/selectors/programmeDocumentReports';
import { computeImportTemplateUrl, computeImportUrl, computeShowImportButtons, computePdReportUrl, computeRefreshData, computeCanRefresh, computeShowRefresh } from './js/pd-output-list-toolbar-functions';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/etools-prp-ajax';
import '../../etools-prp-common/elements/refresh-report-modal';
import '../../etools-prp-common/elements/download-button';
import '../../etools-prp-common/elements/upload-button';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdOutputListToolbar extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.canRefresh = false;
        this.showRefresh = false;
        this.refreshUrl = Endpoints.reportProgressReset();
    }
    static get template() {
        return html `
      ${buttonsStyles}
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-ajax
        id="refreshReport"
        url="[[refreshUrl]]"
        body="[[refreshData]]"
        method="post"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <refresh-report-modal id="refresh" data="[[refreshData]]" refresh-url="[[refreshUrl]]"> </refresh-report-modal>

      <etools-prp-toolbar query="{{query}}" report-id="{{reportId}}" location-id="{{locationId}}">
        <download-button url="[[pdfExportUrl]]">PDF</download-button>
        <download-button url="[[xlsExportUrl]]">XLS</download-button>

        <template is="dom-if" if="[[showImportButtons]]" restamp="true">
          <upload-button url="[[importUrl]]" modal-title="Import Template">
            [[localize('import_template')]]
          </upload-button>
          <download-button url="[[importTemplateUrl]]">[[localize('generate_uploader')]]</download-button>
          <template is="dom-if" if="[[showRefresh]]" restamp="true">
            <paper-button class="btn-primary" on-tap="_refresh" disabled="[[busy]]" raised>
              [[localize('refresh')]]
            </paper-button>
          </template>
        </template>
      </etools-prp-toolbar>
    `;
    }
    _programmeDocumentReportsCurrent(rootState) {
        return programmeDocumentReportsCurrent(rootState);
    }
    _computeImportTemplateUrl(locationId, reportId) {
        return computeImportTemplateUrl(locationId, reportId);
    }
    _computeImportUrl(locationId, reportId) {
        return computeImportUrl(locationId, reportId);
    }
    _computeShowImportButtons(programmeDocument) {
        return computeShowImportButtons(programmeDocument);
    }
    _computePdReportUrl(locationId, reportId) {
        return computePdReportUrl(locationId, reportId);
    }
    _computeRefreshData(reportId) {
        return computeRefreshData(reportId);
    }
    _computeCanRefresh(report, programmeDocument) {
        return computeCanRefresh(report, programmeDocument);
    }
    _computeShowRefresh(canRefresh, currentUserRoles) {
        return canRefresh && computeShowRefresh(currentUserRoles);
    }
    _refresh() {
        this.$.refresh.open();
    }
    _onFileUploaded(e) {
        e.stopPropagation();
        window.location.reload();
    }
    _addEventListeners() {
        this._onFileUploaded = this._onFileUploaded.bind(this);
        this.addEventListener('file-uploaded', this._onFileUploaded);
    }
    _removeEventListeners() {
        this.removeEventListener('file-uploaded', this._onFileUploaded);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
        this.$.refresh.close();
    }
}
__decorate([
    property({ type: String })
], PdOutputListToolbar.prototype, "query", void 0);
__decorate([
    property({ type: String })
], PdOutputListToolbar.prototype, "locationId", void 0);
__decorate([
    property({ type: Object, computed: '_programmeDocumentReportsCurrent(rootState)' })
], PdOutputListToolbar.prototype, "programmeDocument", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeShowImportButtons(programmeDocument)' })
], PdOutputListToolbar.prototype, "showImportButtons", void 0);
__decorate([
    property({ type: String, computed: '_computeImportTemplateUrl(locationId, reportId)' })
], PdOutputListToolbar.prototype, "importTemplateUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeImportUrl(locationId, reportId)' })
], PdOutputListToolbar.prototype, "importUrl", void 0);
__decorate([
    property({ type: String, computed: '_computePdReportUrl(locationId, reportId)' })
], PdOutputListToolbar.prototype, "pdReportUrl", void 0);
__decorate([
    property({ type: String, computed: "_appendQuery(pdReportUrl, query, 'export=pdf')" })
], PdOutputListToolbar.prototype, "pdfExportUrl", void 0);
__decorate([
    property({ type: String, computed: "_appendQuery(pdReportUrl, query, 'export=xlsx')" })
], PdOutputListToolbar.prototype, "xlsExportUrl", void 0);
__decorate([
    property({ type: Object, computed: '_programmeDocumentReportsCurrent(rootState)' })
], PdOutputListToolbar.prototype, "currentReport", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.userProfile.profile.prp_roles)' })
], PdOutputListToolbar.prototype, "currentUserRoles", void 0);
__decorate([
    property({ type: Object, computed: '_computeRefreshData(reportId)' })
], PdOutputListToolbar.prototype, "refreshData", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeCanRefresh(currentReport, programmeDocument)' })
], PdOutputListToolbar.prototype, "canRefresh", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeShowRefresh(canRefresh, currentUserRoles)' })
], PdOutputListToolbar.prototype, "showRefresh", void 0);
__decorate([
    property({ type: String })
], PdOutputListToolbar.prototype, "reportId", void 0);
__decorate([
    property({ type: String })
], PdOutputListToolbar.prototype, "refreshUrl", void 0);
window.customElements.define('pd-output-list-toolbar', PdOutputListToolbar);
export { PdOutputListToolbar as PdOutputListToolbarEl };
