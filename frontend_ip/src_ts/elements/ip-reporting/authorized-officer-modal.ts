import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import {buttonsStyles} from '../../etools-prp-common/styles/buttons-styles';
import {modalStyles} from '../../etools-prp-common/styles/modal-styles';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import {ErrorModalEl} from '../../etools-prp-common/elements/error-modal';
import '../../etools-prp-common/elements/app-switcher';
import '../../etools-prp-common/elements/workspace-dropdown';
import '../organization-dropdown';
import '../language-dropdown';
import '../../etools-prp-common/elements/user-profile/profile-dropdown';
import {currentProgrammeDocument} from '../../etools-prp-common/redux/selectors/programmeDocuments';
import {pdReportsUpdateSingle} from '../../redux/actions/pdReports';
import ModalMixin from '../../etools-prp-common/mixins/modal-mixin';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {computePostBody, computeAuthorizedPartners} from './js/authorized-officer-modal-functions';
import {RootState} from '../../typings/redux.types';
import {waitForIronOverlayToClose} from '../../etools-prp-common/utils/util';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';

@customElement('authorized-officer-modal')
export class AuthorizedOfficerModal extends LocalizeMixin(
  ModalMixin(RoutingMixin(UtilsMixin(connect(store)(LitElement))))
) {
  static styles = css`
    :host {
      display: block;
      --paper-dialog: {
        width: 750px;
      }
    }

    .dialog-content {
      padding-bottom: 24px;
    }

    .buttons {
      justify-content: flex-start;
    }

    paper-dialog-scrollable {
      margin-top: 0px;
    }
  `;

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

  render() {
    return html`
      ${buttonsStyles} ${modalStyles}

      <iron-location path="${this.path}"> </iron-location>

      <etools-prp-ajax
        id="submit"
        .url="${this.submitUrl}"
        .body="${this.postBody}"
        content-type="application/json"
        method="post"
      >
      </etools-prp-ajax>

      <paper-dialog modal opened="${this.opened}">
        <div class="header layout horizontal justified">
          <h2>${this.localize('select_authorized_officer')}</h2>
          <paper-icon-button class="self-center" @click="${this.close}" icon="icons:close"> </paper-icon-button>
        </div>

        <paper-dialog-scrollable>
          <div class="dialog-content">
            <h3>${this.localize('could_not_be_submitted')}</h3>
            <etools-dropdown
              id="officerDropdown"
              class="validate"
              label="${this.localize('authorized_officer')}"
              placeholder="${this.localize('select')}"
              .options="${this.currentAuthorizedPartners}"
              option-value="value"
              option-label="title"
              required
              selected="${this.selectedFocalPoint}"
              with-backdrop
              hide-search
            >
            </etools-dropdown>
          </div>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button class="btn-primary" @click="${this._save}" ?disabled="${this.busy}" raised>
            ${this.localize('submit')}
          </paper-button>
          <paper-button class="btn-primary" @click="${this._cancel}" ?disabled="${this.busy}">
            ${this.localize('cancel')}
          </paper-button>
        </div>
      </paper-dialog>

      <error-modal id="error"></error-modal>
    `;
  }

  stateChanged(state: RootState) {
    if (this.currentPd !== currentProgrammeDocument(state)) {
      this.currentPd = currentProgrammeDocument(state);
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

    (this.shadowRoot!.getElementById('submit') as any as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        const newPath = this.buildUrl(this._baseUrl, 'pd/' + this.pdId + '/view/reports');
        store.dispatch(pdReportsUpdateSingle(this.pdId, this.reportId, res.data));
        this.busy = false;
        this.close();
        waitForIronOverlayToClose(300).then(() => (this.path = newPath));
      })
      .catch((res: any) => {
        const errors = res.data.non_field_errors;
        this.close();
        (this.shadowRoot!.getElementById('error') as ErrorModalEl).open(errors);
      })
      .then(() => {
        this.busy = false;
      });
  }

  _cancel() {
    this.close();
  }
}

export {AuthorizedOfficerModal as AuthorizedOfficerModalEl};
