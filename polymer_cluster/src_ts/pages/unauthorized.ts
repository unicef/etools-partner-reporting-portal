import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-styles/typography';
import Endpoints from '../endpoints';
import LocalizeMixin from '../mixins/localize-mixin';
import '../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../elements/etools-prp-ajax';
import '../elements/message-box';
import '../elements/page-body';
import '../elements/user-profile/profile-dropdown';
import {fireEvent} from '../utils/fire-custom-event';
import {BASE_PATH} from '../config';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class PageUnauthorized extends LocalizeMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      <style>
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
          @apply --paper-font-subhead;
        }

        .loader {
          text-align: center;
        }
      </style>

      <etools-prp-ajax id="userProfile" url="[[profileUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="workspaces" url="[[workspacesUrl]]"> </etools-prp-ajax>

      <page-body>
        <div class="item">
          <span class="sign-out-button" on-tap="_logout">
            <paper-icon-button id="powerSettings" icon="power-settings-new"></paper-icon-button>
            [[localize('sign_out')]]
          </span>
        </div>

        <template is="dom-if" if="[[loading]]" restamp="true">
          <div class="loader">
            <etools-loading no-overlay></etools-loading>
          </div>
        </template>

        <template is="dom-if" if="[[!loading]]" restamp="true">
          <message-box type="warning">
            <span hidden$="[[isAccessError]]">
              It looks like you do not have workspace assigned.
            </span>
            <span hidden$="[[!isAccessError]]">
              It looks like you do not have the permissions assigned to enter the Partner Reporting Portal.
            </span>
            <span>
              Please contact <a href="mailto:support@prphelp.zendesk.com">support@prphelp.zendesk.com</a>
              and include your full name, email and the name of the organization you are from.
            </span>
          </message-box>
        </template>
      </page-body>
    `;
  }

  @property({type: Boolean})
  loading = true;

  @property({type: String})
  profileUrl = Endpoints.userProfile();

  @property({type: String})
  workspacesUrl = Endpoints.interventions();

  @property({type: Boolean})
  isAccessError = true;

  _logout() {
    fireEvent(this, 'sign-out');
  }

  connectedCallback() {
    super.connectedCallback();

    this.checkAccessRights();
  }

  checkAccessRights() {
    (this.$.userProfile as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        if (res.data && res.data.access && res.data.access.length) {
          this.checkWorkspaceExistence();
        } else {
          this.showMessage(true);
        }
      })
      .catch(() => {
        this.showMessage(true);
      });
  }

  checkWorkspaceExistence() {
    (this.$.workspaces as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        if (res.data && res.data.length) {
          window.location.href = `/${BASE_PATH}/`;
        } else {
          this.showMessage(false);
        }
      })
      .catch(() => {
        this.showMessage(false);
      });
  }

  showMessage(isAccessError: boolean) {
    this.isAccessError = isAccessError;
    this.set('loading', false);
  }
}

window.customElements.define('page-unauthorized', PageUnauthorized);
