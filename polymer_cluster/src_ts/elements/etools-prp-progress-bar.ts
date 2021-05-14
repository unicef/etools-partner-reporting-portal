import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-progress/paper-progress';
import UtilsMixin from '../mixins/utils-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {progressBarStyles} from '../styles/progress-bar-styles';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpProgressBar extends UtilsMixin(PolymerElement) {
  public static get template() {
    return html`
      ${progressBarStyles}
      <style>
        .percentage {
          vertical-align: middle;
          line-height: 15px;
        }
      </style>
      <paper-progress value="[[percentage]]"></paper-progress>
      <span class="percentage">[[percentage]]%</span>
    `;
  }

  @property({type: String})
  displayType = '';

  @property({type: String})
  number = '0';

  @property({type: Number, computed: '_computePercentage(number)'})
  percentage!: number;

  _computePercentage(num: string) {
    if (num === 'N/A') {
      return 'N/A';
    }

    // round to two decimal places, more info here: https://stackoverflow.com/a/29494612
    return this.displayType === 'percentage' ? Math.round(Number(num)) : Math.round(Number(num) * 100 * 1e2) / 1e2;
  }
}

window.customElements.define('etools-prp-progress-bar', EtoolsPrpProgressBar);
