import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import './etools-prp-number';

@customElement('etools-prp-currency')
export class EtoolsPrpCurrency extends LitElement {
  @property({type: Number})
  value!: number;

  @property({type: String})
  currency!: string;

  private currencies: any = {
    USD: {
      prefix: '$ '
    },
    EUR: {
      prefix: '€ '
    }
  };

  @property({type: Object})
  meta: {prefix?: string; suffix?: string} = {};

  render() {
    const meta = this.meta || {};
    return html`
      ${meta.prefix || ''}<etools-prp-number .value="${this.value}"></etools-prp-number>${meta.suffix || ''}
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('currency')) {
      this.meta = this._computeMeta(this.currency);
    }
  }

  _computeMeta(currency: string) {
    return (
      this.currencies[currency] || {
        suffix: ' ' + currency
      }
    );
  }
}

export {EtoolsPrpCurrency as EtoolsPrpCurrencyEl};
