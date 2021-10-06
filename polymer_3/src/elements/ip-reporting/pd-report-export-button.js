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
import Endpoints from '../../endpoints';
import { buttonsStyles } from '../../etools-prp-common/styles/buttons-styles';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 */
class PdReportExportButton extends ReduxConnectedElement {
    constructor() {
        super(...arguments);
        this._computeFileUrl = Endpoints.reportExport.bind(Endpoints);
    }
    static get template() {
        return html `
      ${buttonsStyles}
      <style>
        a {
          color: var(--theme-primary-color);
          text-decoration: none;
        }

        paper-button {
          text-transform: uppercase;
        }
      </style>

      <a href="[[fileUrl]]" target="_blank" tabindex="-1">
        <paper-button class="btn-primary">Download report in standard template format</paper-button>
      </a>
    `;
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PdReportExportButton.prototype, "locationId", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)' })
], PdReportExportButton.prototype, "reportId", void 0);
__decorate([
    property({ type: String, computed: '_computeFileUrl(locationId, reportId)' })
], PdReportExportButton.prototype, "fileUrl", void 0);
window.customElements.define('pd-report-export-button', PdReportExportButton);
export { PdReportExportButton as PdReportExportButtonEl };
