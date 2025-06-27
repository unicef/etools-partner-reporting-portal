import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AnyObject} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';

/*
 * @customElement
 * @LitElement
 */
@customElement('sent-bk-comments')
export class SentBkComments extends LitElement {
  render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-dialog
        @close="${this._onClose}"
        dialog-title="${translate('SENT_BACK_COMMENTS')}"
        size="md"
        hide-confirm-btn
      >
        <etools-input
          readonly
          placeholder="—"
          .label="${this._getHeading(this.report.review_date, this.report.reviewed_by_name)}"
          .value="${this.report.sent_back_feedback}"
        >
        </etools-input>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  report: AnyObject = {};

  set dialogData(data: any) {
    const {report}: any = data;
    this.report = report;
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  _getHeading(reviewDt: string, reviewedBy: string) {
    if (!reviewDt && !reviewedBy) {
      return '';
    }
    return (reviewDt ? reviewDt : 'N/A') + ' ' + (reviewedBy ? reviewedBy : 'N/A');
  }
}
