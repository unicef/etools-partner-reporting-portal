import {LitElement, html, customElement} from 'lit-element';
import '@polymer/paper-toast/paper-toast';
import '@polymer/paper-button/paper-button';
import {PaperToastElement} from '@polymer/paper-toast/paper-toast';
import {PaperButtonElement} from '@polymer/paper-button/paper-button';
import {AnyObject} from '../../../types/globals';

/**
 * @LitElement
 * @customElement
 */
@customElement('etools-toast')
export class EtoolsToast extends LitElement {
  public render() {
    // main template
    // language=HTML
    return html`
      <style>
        .toast-dismiss-btn {
          --paper-button: {
            padding: 8px;
            min-width: 16px;
            margin: 0 -8px 0 24px;
          }
        }

        .toast-dismiss-btn-general-style {
          text-transform: uppercase;
          color: var(--primary-color);
        }

        .toast-dismiss-btn-multi-line {
          --paper-button: {
            padding: 8px;
            min-width: 16px;
            margin: 16px -8px -8px 0;
            align-self: flex-end;
          }
        }

        .toast-general-style {
          max-width: 568px !important;
          min-height: 40px;
          max-height: 70vh !important;
        }

        .toast {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }

        .toast-multi-line {
          display: flex;
          flex-direction: column;
          text-align: justify;
        }
      </style>
      <paper-toast id="toast" class="toast-general-style" @iron-overlay-closed="${() => this.toastClosed()}">
        <paper-button id="confirmBtn" @tap="${() => this.confirmToast()}" class="toast-dismiss-btn-general-style">
          Ok
        </paper-button>
      </paper-toast>
    `;
  }

  private toast: PaperToastElement | null = null;
  public toastLabelEl: HTMLSpanElement | null = null;
  private confirmBtn: PaperButtonElement | null = null;

  public fitInto: AnyObject | null = null;

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => {
      this.toast = this.shadowRoot!.querySelector('#toast') as PaperToastElement;
      if (this.toast) {
        this.toastLabelEl = this.toast!.shadowRoot!.querySelector('#label');
      }
      this.confirmBtn = this.shadowRoot!.querySelector('#confirmBtn');
    }, 200);
  }

  public show(details: AnyObject) {
    if (!this.toast) {
      return;
    }
    return this.toast.show(details);
  }

  public toggle() {
    if (!this.toast) {
      return;
    }
    return this.toast.toggle();
  }

  public confirmToast() {
    this.dispatchEvent(
      new CustomEvent('toast-confirm', {
        bubbles: true,
        composed: true
      })
    );
  }

  public toastClosed() {
    this.dispatchEvent(
      new CustomEvent('toast-closed', {
        bubbles: true,
        composed: true
      })
    );
  }

  protected isMultiLine(message: string) {
    return !message ? false : message.toString().length > 80;
  }

  private applyMultilineStyle() {
    if (this.toast) {
      this.toast.classList.remove('toast');
      this.toast.classList.add('toast-multi-line');
    }

    if (this.confirmBtn) {
      this.confirmBtn.classList.remove('toast-dismiss-btn');
      this.confirmBtn.classList.add('toast-dismiss-btn-multi-line');
    }
  }

  private removeMultilineStyle() {
    if (this.toast) {
      this.toast.classList.remove('toast-multi-line');
      this.toast.classList.add('toast');
    }

    if (this.confirmBtn) {
      this.confirmBtn.classList.remove('toast-dismiss-btn-multi-line');
      this.confirmBtn.classList.add('toast-dismiss-btn');
    }
  }

  public prepareToastAndGetShowProperties(detail: AnyObject) {
    if (this.isMultiLine(detail.text)) {
      this.applyMultilineStyle();
    } else {
      this.removeMultilineStyle();
    }
    if (this.confirmBtn) {
      this.confirmBtn.updateStyles();
    }

    // clone detail obj
    const toastProperties: AnyObject = JSON.parse(JSON.stringify(detail));

    toastProperties.duration = 0;
    if (detail) {
      if (detail.showCloseBtn === true) {
        if (this.confirmBtn) {
          this.confirmBtn.removeAttribute('hidden');
        }
      } else {
        if (this.confirmBtn) {
          this.confirmBtn.setAttribute('hidden', '');
        }
        if (!detail.duration) {
          toastProperties.duration = 5000;
        }
      }
      delete toastProperties.showCloseBtn;
    } else {
      if (this.confirmBtn) {
        this.confirmBtn.setAttribute('hidden', '');
      }
    }

    return toastProperties;
  }
}
