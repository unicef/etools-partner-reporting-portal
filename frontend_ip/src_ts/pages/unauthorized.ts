import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../etools-prp-common/elements/etools-prp-ajax';
import '../etools-prp-common/elements/message-box';
import '../etools-prp-common/elements/page-body';
import '../etools-prp-common/elements/user-profile/profile-dropdown';
import {BASE_PATH} from '../etools-prp-common/config';
import Endpoints from '../endpoints';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import {connect} from 'pwa-helpers';
import {store} from '../redux/store';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

@customElement('page-unauthorized')
export class PageUnauthorized extends LocalizeMixin(connect(store)(LitElement)) {
  @property({type: Boolean})
  loading = true;

  @property({type: String})
  profileUrl = Endpoints.userProfile();

  @property({type: Boolean})
  isAccessError = true;

  static styles = css`
    :host {
      display: block;
    }

    .item {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 18px 54px 18px 0px;
    }

    .sign-out-button {
      cursor: pointer;
    }

    message-box {
      max-width: 600px;
      margin: 0 auto;
    }

    message-box span {
      font-size: var(--paper-font-subhead_-_font-size);
    }

    .loader {
      text-align: center;
    }
  `;

  render() {
    return html`
      <etools-prp-ajax id="userProfile" .url="${this.profileUrl}"> </etools-prp-ajax>

      <page-body>
        <div class="item">
          <span class="sign-out-button" @click="${this._logout}">
            <paper-icon-button id="powerSettings" icon="power-settings-new"></paper-icon-button>
            ${this.localize('sign_out')}
          </span>
        </div>

        ${this.loading
          ? html`<div class="loader">
              <etools-loading no-overlay></etools-loading>
            </div>`
          : html`<message-box type="warning">
              <span ?hidden="${!this.isAccessError}"> It looks like you do not have workspace assigned. </span>
              <span ?hidden="${this.isAccessError}">
                It looks like you do not have the permissions assigned to enter the Partner Reporting Portal.
              </span>
              <span>
                Please contact <a href="mailto:support@prphelp.zendesk.com">support@prphelp.zendesk.com</a>
                and include your full name, email and the name of the organization you are from.
              </span>
            </message-box>`}
      </page-body>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.checkAccessRights();
  }

  checkAccessRights() {
    const thunk = (this.shadowRoot!.getElementById('userProfile') as EtoolsPrpAjaxEl).thunk();

    thunk()
      .then((res: any) => {
        if (res.data && (res.data.access || []).includes('ip-reporting')) {
          this.checkWorkspaceExistence(res.data.workspace);
        } else {
          this.showMessage(true);
        }
      })
      .catch(() => {
        this.showMessage(true);
      });
  }

  checkWorkspaceExistence(workspace: any) {
    if (workspace && workspace.id) {
      window.location.href = `/${BASE_PATH}/`;
    } else {
      this.showMessage(false);
    }
  }

  showMessage(isAccessError: boolean) {
    this.isAccessError = isAccessError;
    this.loading = false;
  }

  _logout() {
    fireEvent(this, 'sign-out');
  }
}
