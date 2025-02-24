import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../etools-prp-common/elements/message-box';
import '../etools-prp-common/elements/page-body';
import {BASE_PATH} from '../etools-prp-common/config';
import Endpoints from '../endpoints';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../redux/store';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

@customElement('page-unauthorized')
export class PageUnauthorized extends connect(store)(LitElement) {
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
      <page-body>
        <div class="item">
          <span class="sign-out-button" @click="${this._logout}">
            <etools-icon-button id="powerSettings" name="power-settings-new"></etools-icon-button>
            ${translate('SIGN_OUT')}
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
    if (!this.profileUrl) {
      return;
    }
    this.showMessage(true);
    sendRequest({
      method: 'GET',
      endpoint: {url: this.profileUrl}
    })
      .then((res: any) => {
        if (res && (res.access || []).includes('ip-reporting')) {
          this.checkWorkspaceExistence(res.workspace);
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
