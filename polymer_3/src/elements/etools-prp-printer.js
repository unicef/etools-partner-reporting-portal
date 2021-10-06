var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import UtilsMixin from '../mixins/utils-mixin';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpPrinter extends (UtilsMixin(PolymerElement)) {
    static get template() {
        return html `
      <slot></slot>
    `;
    }
    _onTap(e) {
        if (!e.target.classList.contains('print-btn')) {
            return;
        }
        // @ts-ignore
        let parent = this.shadowRoot.parentNode;
        const toPrint = this.shadowRoot.querySelectorAll(this.selector);
        const style = document.createElement('style');
        style.innerHTML = 'body { color: #212121; font: 14px/1.5 Roboto, Noto, sans-serif; }';
        if (this.printWindow) {
            return this.printWindow.focus();
        }
        this.set('printWindow', window.open('', '', [
            'width=640',
            'height=480',
            'left=0',
            'top=0'
        ].join()));
        this.printWindow.document.head.appendChild(style);
        toPrint.forEach((node) => {
            this.printWindow.document.body.appendChild(this._cloneNode(node));
        }, this);
        setTimeout(() => {
            this.printWindow.print();
            this.printWindow.close();
            this.set('printWindow', null);
        }, 100);
    }
}
__decorate([
    property({ type: String })
], EtoolsPrpPrinter.prototype, "selector", void 0);
__decorate([
    property({ type: Object })
], EtoolsPrpPrinter.prototype, "printWindow", void 0);
window.customElements.define('etools-prp-printer', EtoolsPrpPrinter);
