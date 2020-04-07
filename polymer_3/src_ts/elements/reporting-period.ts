import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import UtilsMixin from '../mixins/utils-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import {ReduxConnectedElement} from '../ReduxConnectedElement';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ReportingPeriod extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      <style>
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

        [[localize('reporting_period')]]: <span class="range">[[_withDefault(range)]]</span>`
      ;
  }

  @property({type: String})
  range = null;
}

window.customElements.define('reporting-period', ReportingPeriod);
