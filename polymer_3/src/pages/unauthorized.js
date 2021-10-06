var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-styles/typography';
import Endpoints from '../endpoints';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import '../etools-prp-common/elements/etools-prp-ajax';
import '../etools-prp-common/elements/message-box';
import '../etools-prp-common/elements/page-body';
import '../etools-prp-common/elements/user-profile/profile-dropdown';
import { fireEvent } from '../etools-prp-common/utils/fire-custom-event';
import { BASE_PATH } from '../etools-prp-common/config';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class PageUnauthorized extends LocalizeMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.loading = true;
        this.profileUrl = Endpoints.userProfile();
        this.workspacesUrl = Endpoints.interventions();
        this.isAccessError = true;
    }
    static get template() {
        return html `
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
            <span hidden$="[[isAccessError]]"> It looks like you do not have workspace assigned. </span>
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
    _logout() {
        fireEvent(this, 'sign-out');
    }
    connectedCallback() {
        super.connectedCallback();
        this.checkAccessRights();
    }
    checkAccessRights() {
        this.$.userProfile
            .thunk()()
            .then((res) => {
            if (res.data && (res.data.access || []).includes('ip-reporting')) {
                this.checkWorkspaceExistence();
            }
            else {
                this.showMessage(true);
            }
        })
            .catch(() => {
            this.showMessage(true);
        });
    }
    checkWorkspaceExistence() {
        this.$.workspaces
            .thunk()()
            .then((res) => {
            if (res.data && res.data.length) {
                window.location.href = `/${BASE_PATH}/`;
            }
            else {
                this.showMessage(false);
            }
        })
            .catch(() => {
            this.showMessage(false);
        });
    }
    showMessage(isAccessError) {
        this.isAccessError = isAccessError;
        this.set('loading', false);
    }
}
__decorate([
    property({ type: Boolean })
], PageUnauthorized.prototype, "loading", void 0);
__decorate([
    property({ type: String })
], PageUnauthorized.prototype, "profileUrl", void 0);
__decorate([
    property({ type: String })
], PageUnauthorized.prototype, "workspacesUrl", void 0);
__decorate([
    property({ type: Boolean })
], PageUnauthorized.prototype, "isAccessError", void 0);
window.customElements.define('page-unauthorized', PageUnauthorized);
