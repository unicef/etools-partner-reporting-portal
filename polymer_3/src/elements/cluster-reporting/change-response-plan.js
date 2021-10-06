var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import '@polymer/paper-tooltip/paper-tooltip';
import LocalizeMixin from '../../mixins/localize-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import { sharedStyles } from '../../styles/shared-styles';
/**
* @polymer
* @customElement
* @appliesMixin LocalizeMixin
* @appliesMixin RoutingMixin
*/
class ChangeResponsePlan extends LocalizeMixin(RoutingMixin(ReduxConnectedElement)) {
    static get template() {
        // language=HTML
        return html `
    ${sharedStyles}
    <style>
      :host {
        display: block;
        font-size: 15px;
        font-weight: 200;
        color: var(--theme-primary-text-color-medium);
      }

      span {
        @apply --truncate;

        display: inline-block;
        vertical-align: middle;
        max-width: 150px;
        cursor: default;
      }

      a {
        color: var(--theme-primary-color);
        font-size: 13px;
      }
    </style>

    <span>
      [[currentPlanTitle]]
      <paper-tooltip>[[currentPlanTitle]]</paper-tooltip>
    </span>
    <a href="[[changePlanUrl]]">[[localize('change')]]</a>
  `;
    }
    _getCurrentPlanTitle(plans, id) {
        let i = 0;
        let plan;
        while (i < plans.length) {
            plan = plans[i];
            i += 1;
            if (String(plan.id) === id) {
                break;
            }
        }
        return (plan || {}).title;
    }
    _computeChangePlanUrl(_baseUrl, id) {
        return this.buildUrl(_baseUrl, '/select-plan/?previous=' + id);
    }
}
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.responsePlans.all)' })
], ChangeResponsePlan.prototype, "responsePlans", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ChangeResponsePlan.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: String, computed: '_getCurrentPlanTitle(responsePlans, responsePlanID)' })
], ChangeResponsePlan.prototype, "currentPlanTitle", void 0);
__decorate([
    property({ type: String, computed: '_computeChangePlanUrl(_baseUrl, responsePlanID)' })
], ChangeResponsePlan.prototype, "changePlanUrl", void 0);
window.customElements.define('change-response-plan', ChangeResponsePlan);
