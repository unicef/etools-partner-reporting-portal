import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if';
import {property} from '@polymer/decorators';
import Constants from '../constants';
import '../elements/numeral-js';

/**
 * @polymer
 * @customElement
 */
class EtoolsPrpNumber extends PolymerElement {
  static get template() {
    return html`
      <template is="dom-if" if="[[!_noValue(value)]]" restamp="true">
        <numeral-js number="[[value]]" format="[[_finalFormat]]" print></numeral-js>
      </template>
      <template is="dom-if" if="[[_noValue(value)]]" restamp="true">
        0
      </template>
    `;
  }

  @property({type: Number})
  value: number | null = null;

  @property({type: String})
  overrideFormat = '';

  @property({type: String})
  _defaultFormat: string = Constants.FORMAT_NUMBER_DEFAULT;

  @property({type: String, computed: '_computeFinalFormat(_defaultFormat, overrideFormat)'})
  _finalFormat!: string;

  _noValue(value: any) {
    return value == null;
  }

  _computeFinalFormat(_defaultFormat: string, overrideFormat: string) {
    return overrideFormat || _defaultFormat;
  }
}
window.customElements.define('etools-prp-number', EtoolsPrpNumber);

export {EtoolsPrpNumber as EtoolsPrpNumberEl};
