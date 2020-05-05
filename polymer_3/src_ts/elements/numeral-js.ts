import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/polymer/lib/elements/dom-if';
declare const numeral: any;

/**
 * @polymer
 * @customElement
 */
class NumeralJs extends PolymerElement {
  static get template() {
    return html`
    <template is="dom-if" if="[[print]]">
      [[output]]
    </template>
  `;
  }

  // Input number
  @property({type: Number, observer: '_numberChanged'})
  number!: number;

  // Formatted manipulated output
  @property({type: String, readOnly: true, notify: true})
  output: string = ''

  // Print output
  @property({type: Boolean})
  print: boolean = false;

  // Format of output.
  @property({type: String, observer: '_formatChanged'})
  format!: string;

  // Custom Zero Formatting. Set a custom output when formatting numerals with a value of 0.
  @property({type: String, observer: '_zeroFormatChanged'})
  zeroFormat!: string;

  //  Un-format the value
  @property({type: String, observer: '_unformatChanged'})
  unformat!: string;

  // The add function will be executed with the given number to this parameter.
  @property({type: Number, observer: '_add'})
  add!: number;

  // The subtract function will be executed with the given number to this parameter.
  @property({type: Number, observer: '_subtract'})
  subtract!: number;

  // The multiply function will be executed with the given number to this parameter.
  @property({type: Number, observer: '_multiply'})
  multiply!: number;

  // The divide function will be executed with the given number to this parameter
  @property({type: Number, observer: '_divide'})
  divide!: number;

  _numberChanged() {
    this._format();
  }

  _formatChanged() {
    this._format();
  }

  _format() {
    if (this.format) {
      this._setOutput(numeral(this.number).format(this.format));
    } else {
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
window.customElements.define('numeral-js', NumeralJs);

export {NumeralJs as NumeralJsEl};
