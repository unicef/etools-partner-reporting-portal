var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-progress/paper-progress';
import UtilsMixin from '../mixins/utils-mixin';
import { property } from '@polymer/decorators/lib/decorators';
import { progressBarStyles } from '../styles/progress-bar-styles';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpProgressBar extends (UtilsMixin(PolymerElement)) {
    constructor() {
        super(...arguments);
        this.displayType = '';
        this.number = 0;
    }
    static get template() {
        return html `
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
    _computePercentage(num) {
        if (num === 'N/A') {
            return 'N/A';
        }
        // round to two decimal places, more info here: https://stackoverflow.com/a/29494612
        return this.displayType === 'percentage' ? Math.round(num) : Math.round(num * 100 * 1e2) / 1e2;
    }
}
__decorate([
    property({ type: String })
], EtoolsPrpProgressBar.prototype, "displayType", void 0);
__decorate([
    property({ type: Number })
], EtoolsPrpProgressBar.prototype, "number", void 0);
__decorate([
    property({ type: Number, computed: '_computePercentage(number)' })
], EtoolsPrpProgressBar.prototype, "percentage", void 0);
window.customElements.define('etools-prp-progress-bar', EtoolsPrpProgressBar);
