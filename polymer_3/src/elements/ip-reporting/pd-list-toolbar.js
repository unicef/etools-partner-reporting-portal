var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import { computePdUrl } from './js/pd-list-toolbar-functions';
class PdListToolbar extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-toolbar query="{{query}}" location-id="{{locationId}}">
        <!-- TODO: Possibly use https://www.webcomponents.org/element/Collaborne/iron-file-icons for different files? -->
        <download-button url="[[pdfExportUrl]]">PDF</download-button>
        <download-button url="[[xlsxExportUrl]]">XLS</download-button>
      </etools-prp-toolbar>
    `;
    }
    _computePdUrl(locationId) {
        return computePdUrl(locationId);
    }
}
__decorate([
    property({ type: String })
], PdListToolbar.prototype, "query", void 0);
__decorate([
    property({ type: String })
], PdListToolbar.prototype, "locationId", void 0);
__decorate([
    property({ type: String, computed: '_computePdUrl(locationId)' })
], PdListToolbar.prototype, "pdUrl", void 0);
__decorate([
    property({ type: String, computed: "_appendQuery(pdUrl, query, 'export=xlsx')" })
], PdListToolbar.prototype, "xlsxExportUrl", void 0);
__decorate([
    property({ type: String, computed: "_appendQuery(pdUrl, query, 'export=pdf')" })
], PdListToolbar.prototype, "pdfExportUrl", void 0);
window.customElements.define('pd-list-toolbar', PdListToolbar);
export { PdListToolbar as PdListToolbarEl };
