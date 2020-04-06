import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {GenericObject} from '../typings/globals.types';
import './etools-prp-number';

/**
 * @polymer
 * @customElement
 */
class EtoolsPrpCurrency extends PolymerElement {

  static get template() {
    return html`
      [[meta.prefix]]<etools-prp-number value="[[value]]"></etools-prp-number>[[meta.suffix]]
    `;
  }

  private currencies: GenericObject = {
    USD: {
      prefix: '$ ',
    },
    EUR: {
      prefix: '€ ',
    },
  };

  @property({type: Number})
  value!: number;

  @property({type: String})
  currency!: string;

  @property({type: Object, computed: '_computeMeta(currency)'})
  meta!: string;


  _computeMeta(currency: string) {
    return this.currencies[currency] || {
      suffix: ' ' + currency,
    };
  }

}
window.customElements.define('etools-prp-currency', EtoolsPrpCurrency);

export {EtoolsPrpCurrency as EtoolsPrpCurrencyEl};
