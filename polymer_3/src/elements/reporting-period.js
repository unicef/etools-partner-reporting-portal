var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import UtilsMixin from '../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import { ReduxConnectedElement } from '../etools-prp-common/ReduxConnectedElement';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ReportingPeriod extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.range = null;
    }
    static get template() {
        return html ` <style>
        :host {
          display: inline-block;
          padding: 1px 3px;
          border: 1px solid var(--paper-grey-500);
          font-size: 10px;
          text-transform: uppercase;
          white-space: nowrap;
          color: var(--paper-grey-500);
        }

        .range {
          color: var(--theme-primary-text-color-dark);
        }
      </style>

      [[localize('reporting_period')]]: <span class="range">[[_withDefault(range)]]</span>`;
    }
}
__decorate([
    property({ type: String })
], ReportingPeriod.prototype, "range", void 0);
window.customElements.define('reporting-period', ReportingPeriod);
