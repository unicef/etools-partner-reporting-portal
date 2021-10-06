var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import { computeIndicatorsUrl } from './js/indicators-toolbar-functions';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class IndicatorsToolbar extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-toolbar query="{{query}}" location-id="{{locationId}}">
        <download-button url="[[xlsExportUrl]]">XLS</download-button>
        <download-button url="[[pdfExportUrl]]">PDF</download-button>
      </etools-prp-toolbar>
    `;
    }
    _computeIndicatorsUrl(locationId) {
        return computeIndicatorsUrl(locationId);
    }
}
__decorate([
    property({ type: String })
], IndicatorsToolbar.prototype, "query", void 0);
__decorate([
    property({ type: String })
], IndicatorsToolbar.prototype, "locationId", void 0);
__decorate([
    property({ type: String, computed: '_computeIndicatorsUrl(locationId)' })
], IndicatorsToolbar.prototype, "indicatorsUrl", void 0);
__decorate([
    property({ type: String, computed: "_appendQuery(indicatorsUrl, query, 'export=xlsx')" })
], IndicatorsToolbar.prototype, "xlsExportUrl", void 0);
__decorate([
    property({ type: String, computed: "_appendQuery(indicatorsUrl, query, 'export=pdf')" })
], IndicatorsToolbar.prototype, "pdfExportUrl", void 0);
window.customElements.define('indicators-toolbar', IndicatorsToolbar);
