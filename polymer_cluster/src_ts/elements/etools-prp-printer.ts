import {PolymerElement, html} from '@polymer/polymer';
import UtilsMixin from '../mixins/utils-mixin';
import {property} from '@polymer/decorators/lib/decorators';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpPrinter extends UtilsMixin(PolymerElement) {
  public static get template() {
    return html` <slot></slot> `;
  }

  @property({type: String})
  selector!: string;

  @property({type: Object})
  printWindow!: Window;

  _onTap(e: CustomEvent) {
    if (!(e.target! as HTMLElement).classList.contains('print-btn')) {
      return;
    }

    // let parent = this.shadowRoot!.parentNode;
    const toPrint = this.shadowRoot!.querySelectorAll(this.selector);
    const style = document.createElement('style');

    style.innerHTML = 'body { color: #212121; font: 14px/1.5 Roboto, Noto, sans-serif; }';

    if (this.printWindow) {
      return this.printWindow.focus();
    }

    this.set('printWindow', window.open('', '', ['width=640', 'height=480', 'left=0', 'top=0'].join()));

    this.printWindow!.document.head.appendChild(style);

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

window.customElements.define('etools-prp-printer', EtoolsPrpPrinter);
