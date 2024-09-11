import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import {currentProgrammeDocument} from '../../etools-prp-common/redux/selectors/programmeDocuments';
import {pdReportsUpdateSingle} from '../../redux/actions/pdReports';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {computePostBody, computeAuthorizedPartners} from './js/authorized-officer-modal-functions';
import {RootState} from '../../typings/redux.types';
import {translate} from 'lit-translate';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';

@customElement('authorized-officer-modal')
export class AuthorizedOfficerModal extends UtilsMixin(connect(store)(LitElement)) {
  @property({type: Object})
  data!: any;

  @property({type: Array})
  emails: any[] = [];

  @property({type: String})
  userMail = '';

  @property({type: Boolean})
  busy = false;

  @property({type: String})
  selectedFocalPoint = '';

  @property({type: Object})
  currentPd!: any;

  @property({type: Array})
  currentAuthorizedPartners: any[] = [];

  @property({type: Object})
  postBody!: any;

  @property({type: String})
  pdId = '';

  @property({type: String})
  reportId = '';

  @property({type: String})
  submitUrl = '';

  @property({type: String})
  baseUrl = '';

  set dialogData(data: any) {
    const {pdId, reportId, currentReport, submitUrl}: any = data;

    this.pdId = pdId;
    this.reportId = reportId;
    this.data = currentReport;
    this.submitUrl = submitUrl;
  }

  render() {
    return html`
      <style>
        etools-dialog {
          --divider-color: transparent;
        }
      </style>

      <etools-dialog
        keep-dialog-open
        size="lg"
        dialog-title="${translate('SELECT_AUTHORIZED_OFFICER')}"
        .okBtnText="${translate('SUBMIT')}"
        @confirm-btn-clicked="${this._save}"
        ?disableConfirmBtn="${this.busy}"
        ?disableDismissBtn="${this.busy}"
      >
        <div class="dialog-content">
          <h3>${translate('COULD_NOT_BE_SUBMITTED')}</h3>
          <etools-dropdown
            id="officerDropdown"
            class="validate"
            label="${translate('AUTHORIZED_OFFICER')}"
            placeholder="${translate('SELECT')}"
            .options="${this.currentAuthorizedPartners}"
            option-value="value"
            option-label="title"
            required
            .selected="${this.selectedFocalPoint}"
            @etools-selected-item-changed="${(event: CustomEvent) => {
              if (this.selectedFocalPoint !== event.detail.selectedItem?.value) {
                this.selectedFocalPoint = event.detail.selectedItem?.value;
              }
            }}"
            with-backdrop
            hide-search
          >
          </etools-dropdown>
        </div>
      </etools-dialog>

      <error-modal id="error"></error-modal>
    `;
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.currentPd, currentProgrammeDocument(state))) {
      this.currentPd = currentProgrammeDocument(state);
    }

    if (state.workspaces?.baseUrl && state.workspaces.baseUrl !== this.baseUrl) {
      this.baseUrl = state.workspaces.baseUrl;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('currentPd')) {
      this.currentAuthorizedPartners = computeAuthorizedPartners(this.currentPd);
    }

    if (changedProperties.has('selectedFocalPoint')) {
      this.postBody = computePostBody(this.selectedFocalPoint);
    }
  }

  _save() {
    if (!this._fieldsAreValid()) {
      return;
    }

    this.busy = true;

    sendRequest({
      method: 'POST',
      endpoint: {url: this.submitUrl},
      body: this.postBody
    })
      .then((res: any) => {
        // TODO , should we redirect??
        store.dispatch(pdReportsUpdateSingle(this.pdId, this.reportId, res));
        this.busy = false;
        fireEvent(this, 'dialog-closed', {confirmed: true});
        EtoolsRouter.updateAppLocation(`${this.baseUrl}/pd/${this.pdId}/view/reports`);
      })
      .catch((err: any) => {
        fireEvent(this, 'dialog-closed', {confirmed: false});
        openDialog({
          dialog: 'error-modal',
          dialogData: {
            errors: err.response.non_field_errors
          }
        });
      })
      .finally(() => {
        this.busy = false;
      });
  }
}

export {AuthorizedOfficerModal as AuthorizedOfficerModalEl};
