var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/polymer/lib/elements/dom-if';
/**
 * @polymer
 * @customElement
 */
class NumeralJs extends PolymerElement {
    constructor() {
        super(...arguments);
        // Formatted manipulated output
        this.output = '';
        // Print output
        this.print = false;
    }
    static get template() {
        return html `
    <template is="dom-if" if="[[print]]">
      [[output]]
    </template>
  `;
    }
    _numberChanged() {
        this._format();
    }
    _formatChanged() {
        this._format();
    }
    _format() {
        if (this.format) {
            this._setOutput(numeral(this.number).format(this.format));
        }
        else {
            this._setOutput(this.number);
        }
    }
    _zeroFormatChanged() {
        numeral.zeroFormat(this.zeroFormat);
        this._format();
    }
    _unformatChanged() {
        this._setOutput(numeral().unformat(this.unformat));
    }
    _add() {
        this.set('number', numeral(this.number).add(this.add).value());
    }
    _subtract() {
        this.set('number', numeral(this.number).subtract(this.subtract).value());
    }
    _multiply() {
        this.set('number', numeral(this.number).multiply(this.multiply).value());
    }
    _divide() {
        this.set('number', numeral(this.number).divide(this.divide).value());
    }
}
__decorate([
    property({ type: Number, observer: '_numberChanged' })
], NumeralJs.prototype, "number", void 0);
__decorate([
    property({ type: String, readOnly: true, notify: true })
], NumeralJs.prototype, "output", void 0);
__decorate([
    property({ type: Boolean })
], NumeralJs.prototype, "print", void 0);
__decorate([
    property({ type: String, observer: '_formatChanged' })
], NumeralJs.prototype, "format", void 0);
__decorate([
    property({ type: String, observer: '_zeroFormatChanged' })
], NumeralJs.prototype, "zeroFormat", void 0);
__decorate([
    property({ type: String, observer: '_unformatChanged' })
], NumeralJs.prototype, "unformat", void 0);
__decorate([
    property({ type: Number, observer: '_add' })
], NumeralJs.prototype, "add", void 0);
__decorate([
    property({ type: Number, observer: '_subtract' })
], NumeralJs.prototype, "subtract", void 0);
__decorate([
    property({ type: Number, observer: '_multiply' })
], NumeralJs.prototype, "multiply", void 0);
__decorate([
    property({ type: Number, observer: '_divide' })
], NumeralJs.prototype, "divide", void 0);
window.customElements.define('numeral-js', NumeralJs);
export { NumeralJs as NumeralJsEl };
