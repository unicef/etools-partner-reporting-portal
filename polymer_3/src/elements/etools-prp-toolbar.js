var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-location/iron-location';
import UtilsMixin from '../etools-prp-common/mixins/utils-mixin';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/iron-location/iron-query-params';
import { buttonsStyles } from '../etools-prp-common/styles/buttons-styles';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpToolbar extends UtilsMixin(ReduxConnectedElement) {
    static get template() {
        return html `
      ${buttonsStyles}
      <style include="iron-flex iron-flex-reverse">
        :host {
          display: block;
          margin: 25px 0;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{params}}"> </iron-query-params>

      <div class="layout horizontal-reverse">
        <slot></slot>
      </div>
    `;
    }
}
__decorate([
    property({ type: String, notify: true })
], EtoolsPrpToolbar.prototype, "properties", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], EtoolsPrpToolbar.prototype, "_responsePlanId", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], EtoolsPrpToolbar.prototype, "_locationId", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)' })
], EtoolsPrpToolbar.prototype, "_pdId", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)' })
], EtoolsPrpToolbar.prototype, "_reportId", void 0);
__decorate([
    property({ type: String, computed: '_identity(_responsePlanId)', notify: true })
], EtoolsPrpToolbar.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String, computed: '_identity(_locationId)', notify: true })
], EtoolsPrpToolbar.prototype, "locationId", void 0);
__decorate([
    property({ type: String, computed: '_identity(_pdId)', notify: true })
], EtoolsPrpToolbar.prototype, "pdId", void 0);
__decorate([
    property({ type: String, computed: '_identity(_reportId)', notify: true })
], EtoolsPrpToolbar.prototype, "reportId", void 0);
__decorate([
    property({ type: String, notify: true })
], EtoolsPrpToolbar.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], EtoolsPrpToolbar.prototype, "params", void 0);
window.customElements.define('etools-prp-toolbar', EtoolsPrpToolbar);
