var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-pages/iron-pages';
import './pd-report-hr-qpr/reporting';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class PagePdReportHr extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-pages attr-for-selected="name" selected="{{selectedTab}}">
        <template is="dom-if" if="[[_equals(selectedTab, 'reporting')]]" restamp="true">
          <page-pd-report-reporting name="reporting"> </page-pd-report-reporting>
        </template>
      </iron-pages>
    `;
    }
}
__decorate([
    property({ type: String, notify: true })
], PagePdReportHr.prototype, "selectedTab", void 0);
window.customElements.define('page-pd-report-hr', PagePdReportHr);
