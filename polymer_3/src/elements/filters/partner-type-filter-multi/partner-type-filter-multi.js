var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '../dropdown-filter/dropdown-filter-multi';
import LocalizeMixin from '../../../mixins/localize-mixin';
import { property } from '@polymer/decorators';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class PartnerTypeFilterMulti extends LocalizeMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.data = [
            {
                id: 'B/M',
                title: 'Bilateral / Multilateral'
            },
            {
                id: 'CSO',
                title: 'Civil Society Organization'
            },
            {
                id: 'Gov',
                title: 'Government'
            },
            {
                id: 'UNA',
                title: 'UN Agency'
            }
        ];
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <dropdown-filter-multi
        label="[[localize('partner_type')]]"
        name="partner_types"
        value="[[value]]"
        data="[[data]]"
        hide-search>
    </dropdown-filter-multi>
  `;
    }
}
__decorate([
    property({ type: String })
], PartnerTypeFilterMulti.prototype, "value", void 0);
__decorate([
    property({ type: Array })
], PartnerTypeFilterMulti.prototype, "data", void 0);
window.customElements.define('partner-type-filter-multi', PartnerTypeFilterMulti);
