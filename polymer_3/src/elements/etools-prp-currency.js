var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../etools-prp-common/elements/etools-prp-number';
/**
 * @polymer
 * @customElement
 */
class EtoolsPrpCurrency extends PolymerElement {
    constructor() {
        super(...arguments);
        this.currencies = {
            USD: {
                prefix: '$ '
            },
            EUR: {
                prefix: '€ '
            }
        };
    }
    static get template() {
        return html ` [[meta.prefix]]<etools-prp-number value="[[value]]"></etools-prp-number>[[meta.suffix]] `;
    }
    _computeMeta(currency) {
        return (this.currencies[currency] || {
            suffix: ' ' + currency
        });
    }
}
__decorate([
    property({ type: Number })
], EtoolsPrpCurrency.prototype, "value", void 0);
__decorate([
    property({ type: String })
], EtoolsPrpCurrency.prototype, "currency", void 0);
__decorate([
    property({ type: Object, computed: '_computeMeta(currency)' })
], EtoolsPrpCurrency.prototype, "meta", void 0);
window.customElements.define('etools-prp-currency', EtoolsPrpCurrency);
export { EtoolsPrpCurrency as EtoolsPrpCurrencyEl };
