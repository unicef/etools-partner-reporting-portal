var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import { property } from '@polymer/decorators/lib/decorators';
import { computePdReportsUrl, canExport } from './js/progress-reports-toolbar-functions';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class ProgressReportsToolbar extends UtilsMixin(ReduxConnectedElement) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-toolbar query="{{query}}" location-id="{{locationId}}">
        <template is="dom-if" if="[[canExport]]" restamp="true">
          <download-button url="[[pdfExportUrl]]">PDF</download-button>
          <download-button url="[[xlsExportUrl]]">XLS</download-button>
        </template>
      </etools-prp-toolbar>
    `;
    }
    _computePdReportsUrl(locationId) {
        return computePdReportsUrl(locationId);
    }
    _canExport(totalResults) {
        return canExport(totalResults);
    }
}
__decorate([
    property({ type: String })
], ProgressReportsToolbar.prototype, "query", void 0);
__decorate([
    property({ type: String })
], ProgressReportsToolbar.prototype, "locationId", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.progressReports.count)' })
], ProgressReportsToolbar.prototype, "totalResults", void 0);
__decorate([
    property({ type: Boolean, computed: '_canExport(totalResults)' })
], ProgressReportsToolbar.prototype, "canExport", void 0);
__decorate([
    property({ type: String, computed: '_computePdReportsUrl(locationId)' })
], ProgressReportsToolbar.prototype, "pdReportsUrl", void 0);
__decorate([
    property({ type: String, computed: "_appendQuery(pdReportsUrl, query, 'export=xlsx')" })
], ProgressReportsToolbar.prototype, "xlsExportUrl", void 0);
__decorate([
    property({ type: String, computed: "_appendQuery(pdReportsUrl, query, 'export=pdf')" })
], ProgressReportsToolbar.prototype, "pdfExportUrl", void 0);
window.customElements.define('progress-reports-toolbar', ProgressReportsToolbar);
