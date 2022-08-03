import {html, LitElement, customElement, property} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {fireEvent} from '../../utils/fire-custom-event';
import {translate} from 'lit-translate';

@customElement('are-you-sure')
export class AreYouSure extends LitElement {
  render() {
    return html` <style>
        .content {
          margin-top: 16px;
          padding-left: 24px;
        }
      </style>
      <etools-dialog
        id="infoDialog"
        size="md"
        no-padding
        opened
        theme="confirmation"
        .okBtnText="${this.confirmBtnText}"
        cancel-btn-text=${this.cancelBtnText}
        @close="${(e: CustomEvent) => this.handleDialogClosed(e)}"
        @confirm-btn-clicked="${(e: CustomEvent) => this.handleDialogClosed(e)}"
      >
        <div class="content">${this.content}</div>
      </etools-dialog>`;
  }

  @property({type: String})
  content = (translate('ARE_YOU_SURE_DEL') as unknown) as string;

  @property({type: String})
  confirmBtnText = 'OK';

  @property({type: String})
  cancelBtnText = (translate('CANCEL') as unknown) as string;

  set dialogData({content, confirmBtnText, cancelBtnText}: any) {
    this.content = content;
    if (confirmBtnText) {
      this.confirmBtnText = confirmBtnText;
    }
    if (cancelBtnText) {
      this.cancelBtnText = cancelBtnText;
    }
  }

  handleDialogClosed(e: CustomEvent): void {
    fireEvent(this, 'dialog-closed', {confirmed: e.detail.confirmed});
  }
}
