var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if';
import { property } from '@polymer/decorators';
import Constants from '../constants';
import '../elements/numeral-js';
/**
 * @polymer
 * @customElement
 */
class EtoolsPrpNumber extends PolymerElement {
    constructor() {
        super(...arguments);
        this.value = null;
        this.overrideFormat = '';
        this._defaultFormat = Constants.FORMAT_NUMBER_DEFAULT;
    }
    static get template() {
        return html `
    <template
        is="dom-if"
        if="[[!_noValue(value)]]"
        restamp="true">
      <numeral-js number="[[value]]" format="[[_finalFormat]]" print></numeral-js>
    </template>
    <template
        is="dom-if"
        if="[[_noValue(value)]]"
        restamp="true">
      0
    </template>
`;
    }
    _noValue(value) {
        return value == null;
    }
    _computeFinalFormat(_defaultFormat, overrideFormat) {
        return overrideFormat || _defaultFormat;
    }
}
__decorate([
    property({ type: Number })
], EtoolsPrpNumber.prototype, "value", void 0);
__decorate([
    property({ type: String })
], EtoolsPrpNumber.prototype, "overrideFormat", void 0);
__decorate([
    property({ type: String })
], EtoolsPrpNumber.prototype, "_defaultFormat", void 0);
__decorate([
    property({ type: String, computed: '_computeFinalFormat(_defaultFormat, overrideFormat)' })
], EtoolsPrpNumber.prototype, "_finalFormat", void 0);
window.customElements.define('etools-prp-number', EtoolsPrpNumber);
export { EtoolsPrpNumber as EtoolsPrpNumberEl };
