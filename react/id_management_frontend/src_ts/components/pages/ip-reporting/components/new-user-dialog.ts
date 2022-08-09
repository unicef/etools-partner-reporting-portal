import {LitElement, html, property, customElement} from 'lit-element';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-currency-amount-input';
import {translate} from 'lit-translate';
// import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
// import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
// import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';

/**
 * @customElement
 */
@customElement('new-user-dialog')
export class NewUserDialog extends ComponentBaseMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        etools-dialog::part(ed-scrollable) {
          margin: 0 8px;
        }
      </style>

      <etools-dialog
        id="addUserDialog"
        size="md"
        ?opened="${this.dialogOpened}"
        ?show-spinner="${this.requestInProcess}"
        dialog-title="${translate('ADD_NEW_USER')}"
        ok-btn-text="${translate('SAVE_AND_CONTINUE')}"
        cancel-btn-text=${translate('CANCEL')}
        keep-dialog-open
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this.onSaveClick}"
        @close="${() => this.onClose()}"
      >

      <div class="row-h flex-c">
        <div class="col col-6">
          <paper-input
            class="w100"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'title')}"
            label=${translate('FIRST_NAME')}
            type="text"
            placeholder="—"
            error-message=${translate('REQUIRED_FIELD')}
            auto-validate
            required
          >
        </div>
        <div class="col col-6">
          <paper-input
            class="w100"
            label=${translate('LAST_NAME')}
            placeholder="—"
            error-message=${translate('REQUIRED_FIELD')}
            required
            auto-validate
          >
          </paper-input>
        </div>
      </div>
      <div class="row-h flex-c">
        <div class="col col-6">
          <paper-input
            class="w100"
            label=${translate('EMAIL')}
            placeholder="—"
            error-message=${translate('REQUIRED_FIELD')}
            required
            auto-validate
          >
          </paper-input>
        </div>
         <div class="col col-6">
          <paper-input
            class="w100"
            label=${translate('POSITION')}
            placeholder="—"
            error-message=${translate('REQUIRED_FIELD')}
            auto-validate
          >
          </paper-input>
        </div>
      </div>`;
  }

  @property() protected dialogOpened = true;

  @property({type: Boolean})
  requestInProcess = false;

  set dialogData(_data: any) {
    // set dialog data
  }

  onSaveClick() {
    if (!this.validate()) {
      return;
    }
    // save()
  }

  validate() {
    return validateRequiredFields(this);
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
