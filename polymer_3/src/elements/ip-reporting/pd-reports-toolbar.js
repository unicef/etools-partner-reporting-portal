var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import { programmeDocumentReportsCount } from '../../redux/selectors/programmeDocumentReports';
import { computePdReportsUrl, canExport, computePdQuery } from './js/pd-reports-toolbar-functions';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class PdReportsToolbar extends UtilsMixin(ReduxConnectedElement) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-toolbar query="{{query}}" pd-id="{{pdId}}" location-id="{{locationId}}">
        <template is="dom-if" if="[[canExport]]" restamp="true">
          <download-button url="[[xlsExportUrl]]">XLS</download-button>
          <download-button url="[[pdfExportUrl]]">PDF</download-button>
        </template>
      </etools-prp-toolbar>
    `;
    }
    _programmeDocumentReportsCount(rootState) {
        return programmeDocumentReportsCount(rootState);
    }
    _computePdReportsUrl(locationId) {
        return computePdReportsUrl(locationId);
    }
    _canExport(totalResults) {
        return canExport(totalResults);
    }
    _computePdQuery(pdId) {
        return computePdQuery(pdId);
    }
}
__decorate([
    property({ type: String })
], PdReportsToolbar.prototype, "query", void 0);
__decorate([
    property({ type: String })
], PdReportsToolbar.prototype, "pdId", void 0);
__decorate([
    property({ type: Number, computed: '_programmeDocumentReportsCount(rootState)' })
], PdReportsToolbar.prototype, "totalResults", void 0);
__decorate([
    property({ type: Boolean, computed: '_canExport(totalResults)' })
], PdReportsToolbar.prototype, "canExport", void 0);
__decorate([
    property({ type: String, computed: '_computePdReportsUrl(locationId)' })
], PdReportsToolbar.prototype, "pdReportsUrl", void 0);
__decorate([
    property({ type: Object, computed: '_computePdQuery(pdId)' })
], PdReportsToolbar.prototype, "pdQuery", void 0);
__decorate([
    property({ type: String, computed: "_appendQuery(pdReportsUrl, query, pdQuery, 'export=xlsx')" })
], PdReportsToolbar.prototype, "xlsExportUrl", void 0);
__decorate([
    property({ type: String, computed: "_appendQuery(pdReportsUrl, query, pdQuery, 'export=pdf')" })
], PdReportsToolbar.prototype, "pdfExportUrl", void 0);
window.customElements.define('pd-reports-toolbar', PdReportsToolbar);
