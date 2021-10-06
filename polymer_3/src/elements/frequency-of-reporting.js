var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
/**
 * @polymer
 * @customElement
 */
class FrequencyOfReporting extends PolymerElement {
    static get template() {
        return html `
    <span>[[label]]</span>
  `;
    }
    _computeLabel(type) {
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
__decorate([
    property({ type: String })
], FrequencyOfReporting.prototype, "type", void 0);
__decorate([
    property({ type: String, computed: '_computeLabel(type)' })
], FrequencyOfReporting.prototype, "label", void 0);
window.customElements.define('frequency-of-reporting', FrequencyOfReporting);
export { FrequencyOfReporting as FilterListEl };
