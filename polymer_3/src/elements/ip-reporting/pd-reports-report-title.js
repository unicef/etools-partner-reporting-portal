var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '../../etools-prp-common/elements/etools-prp-permissions';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import { shouldDisplayLink, getReportTitleFull, getReportTitle, getReportLink } from './js/pd-reports-report-title-functions';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdReportsReportTitle extends LocalizeMixin(ProgressReportUtilsMixin(UtilsMixin(RoutingMixin(ReduxConnectedElement)))) {
    constructor() {
        super(...arguments);
        this.displayLink = false;
    }
    static get template() {
        return html `
      <style>
        .final-badge {
          display: inline-block;
          border-radius: 1px;
          padding: 1px 6px;
          font-size: 10px;
          text-transform: uppercase;
          background-color: var(--paper-grey-300);
          margin-left: 5px;
          font-weight: bold;
        }
      </style>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <template is="dom-if" if="[[showLink]]" restamp="true">
        <a href="[[_getReportLink(report, permissions)]]">[[_getReportTitle(report, localize)]]</a>
      </template>
      <template is="dom-if" if="[[!showLink]]" restamp="true"> [[_getReportTitleFull(report, localize)]] </template>
      <template is="dom-if" if="[[_isFinalReport(report)]]" restamp="true">
        <div class="final-badge">final</div>
      </template>
    `;
    }
    _shouldDisplayLink(displayLink, report, permissions) {
        if (!permissions) {
            return;
        }
        return shouldDisplayLink(displayLink, report, permissions, this._canNavigateToReport);
    }
    _getReportTitleFull(report, localize) {
        return report ? getReportTitleFull(report, localize) : '';
    }
    _getReportTitle(report, localize) {
        return getReportTitle(report, localize);
    }
    _getReportLink(report, permissions) {
        if (!permissions) {
            return;
        }
        const suffix = this._getMode(report, permissions);
        return getReportLink(report, suffix, this.buildUrl, this._baseUrl);
    }
}
__decorate([
    property({ type: Object })
], PdReportsReportTitle.prototype, "permissions", void 0);
__decorate([
    property({ type: Object })
], PdReportsReportTitle.prototype, "report", void 0);
__decorate([
    property({ type: Boolean })
], PdReportsReportTitle.prototype, "displayLink", void 0);
__decorate([
    property({ type: Boolean, computed: '_shouldDisplayLink(displayLink, report, permissions)' })
], PdReportsReportTitle.prototype, "showLink", void 0);
window.customElements.define('pd-reports-report-title', PdReportsReportTitle);
export { PdReportsReportTitle as PdReportsReportTitleEl };
