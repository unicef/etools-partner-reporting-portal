import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import '@polymer/paper-tooltip/paper-tooltip';
import LocalizeMixin from '../../mixins/localize-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import {sharedStyles} from '../../styles/shared-styles';

/**
* @polymer
* @customElement
* @appliesMixin LocalizeMixin
* @appliesMixin RoutingMixin
*/
class ChangeResponsePlan extends LocalizeMixin(RoutingMixin(ReduxConnectedElement)) {
  public static get template() {
    // language=HTML
    return html`
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

  @property({type: Array, computed: 'getReduxStateArray(rootState.responsePlans.all)'})
  responsePlans!: any[];

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: String, computed: '_getCurrentPlanTitle(responsePlans, responsePlanID)'})
  currentPlanTitle!: string;

  @property({type: String, computed: '_computeChangePlanUrl(_baseUrl, responsePlanID)'})
  changePlanUrl!: string;


  _getCurrentPlanTitle(plans: any, id: string) {
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

  _computeChangePlanUrl(_baseUrl: string, id: string) {
    return this.buildUrl(_baseUrl, '/select-plan/?previous=' + id);
  }
}

window.customElements.define('change-response-plan', ChangeResponsePlan);
