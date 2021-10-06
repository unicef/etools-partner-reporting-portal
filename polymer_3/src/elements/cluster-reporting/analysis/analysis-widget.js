var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@unicef-polymer/etools-loading';
import { analysisWidgetStyles } from '../../../styles/analysis-widget-styles';
/**
* @polymer
* @customElement
* @mixinFunction
* @appliesMixin UtilsMixin
*/
class AnalysisWidget extends PolymerElement {
    constructor() {
        super(...arguments);
        this.loading = false;
    }
    static get template() {
        return html `
    ${analysisWidgetStyles}
    <div class="analysis-widget">
      <h3 class="analysis-widget__header">[[widgetTitle]]</h3>
      <div class="analysis-widget__body">
        <slot name="map"></slot>
      </div>
      <etools-loading active="[[loading]]"></etools-loading>
    </div>
    `;
    }
}
__decorate([
    property({ type: String })
], AnalysisWidget.prototype, "widgetTitle", void 0);
__decorate([
    property({ type: Boolean })
], AnalysisWidget.prototype, "loading", void 0);
window.customElements.define('analysis-widget', AnalysisWidget);
