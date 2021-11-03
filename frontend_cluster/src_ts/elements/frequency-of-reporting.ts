import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @customElement
 */
class FrequencyOfReporting extends PolymerElement {
  static get template() {
    return html` <span>[[label]]</span> `;
  }

  @property({type: String})
  type!: string;

  @property({type: String, computed: '_computeLabel(type)'})
  label!: string;

  _computeLabel(type: string) {
    switch (type) {
      case 'Wee':
        return 'Weekly';

      case 'Mon':
        return 'Monthly';

      case 'Qua':
        return 'Quarterly';

      case 'Csd':
        return 'Custom specific dates';
    }
    return '';
  }
}
window.customElements.define('frequency-of-reporting', FrequencyOfReporting);

export {FrequencyOfReporting as FilterListEl};
