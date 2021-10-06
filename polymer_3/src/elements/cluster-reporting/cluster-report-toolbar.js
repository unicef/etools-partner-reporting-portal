var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import Endpoints from '../../endpoints';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import '../etools-prp-toolbar';
import '../download-button';
import '../upload-button';
import '../../elements/etools-prp-permissions';
import { property } from '@polymer/decorators/lib/decorators';
import { fireEvent } from '../../utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ClusterReportToolbar extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-permissions
        permissions="{{ permissions }}">
      </etools-prp-permissions>

      <etools-prp-toolbar
        query="{{ query }}"
        response-plan-id="{{responsePlanId}}">
        <download-button url="[[exportUrl]]">[[localize('export')]]</download-button>

        <template
          is="dom-if"
          if="[[_equals(submitted, 0)]]"
          restamp="true">
          <upload-button
            url="[[importUrl]]"
            modal-title="Import Template">
            [[localize('import_template')]]
          </upload-button>
        </template>
        <template
          is="dom-if"
          if="[[_equals(submitted, 0)]]"
          restamp="true">
          <download-button url="[[exportTemplateUrl]]">[[localize('generate_uploader')]]</download-button>
        </template>
      </etools-prp-toolbar>

    `;
    }
    _computeImportTemplateUrl(responsePlanId, query, submitted) {
        return this._appendQuery(Endpoints.clusterIndicatorReportsImportTemplate(responsePlanId), query, { submitted: submitted });
    }
    _computeExportUrl(responsePlanId, query, submitted) {
        return this._appendQuery(Endpoints.clusterIndicatorReportsExport(responsePlanId), query, { submitted: submitted });
    }
    _computeImportUrl(responsePlanId) {
        return Endpoints.clusterIndicatorReportsImport(responsePlanId);
    }
    _onFileUploaded(e) {
        e.stopPropagation();
        fireEvent(this, 'template-file-uploaded');
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
    }
}
__decorate([
    property({ type: Number })
], ClusterReportToolbar.prototype, "submitted", void 0);
__decorate([
    property({ type: String })
], ClusterReportToolbar.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String, computed: '_computeImportTemplateUrl(responsePlanId, query, submitted)' })
], ClusterReportToolbar.prototype, "exportTemplateUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeExportUrl(responsePlanId, query, submitted)' })
], ClusterReportToolbar.prototype, "exportUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeImportUrl(responsePlanId)' })
], ClusterReportToolbar.prototype, "importUrl", void 0);
window.customElements.define('cluster-report-toolbar', ClusterReportToolbar);
