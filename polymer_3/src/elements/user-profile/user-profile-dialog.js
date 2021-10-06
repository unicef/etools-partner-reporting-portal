var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import UtilsMixin from '../../mixins/utils-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '../labelled-item';
import { modalStyles } from '../../styles/modal-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 */
class UserProfileDialog extends RoutingMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.opened = false;
    }
    static get template() {
        return html `
    ${modalStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;
        --app-grid-columns: 3;
        --app-grid-gutter: 15px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 3;

        --paper-dialog: {
          width: 700px;
        }

      }

      .full-width {
        @apply --app-grid-expandible-item;
      }

      .header {
        height: 48px;
        padding: 0 24px;
        margin: 0;
        color: white;
        background: var(--theme-primary-color, #0099ff);
      }

      .header h2 {
        @apply --paper-font-title;
        margin: 0;
        line-height: 48px;
      }

      .header paper-icon-button {
        margin: 0 -13px 0 20px;
        color: white;
      }

      .clusters {
        margin: 0;
      }

      .clusters dt,
      .clusters dd {
        display: inline;
        margin: 0;
      }

      .clusters dd::after {
        content: "\A";
        white-space: pre;
      }

      .caption {
        @apply --paper-font-caption;
        color: var(--secondary-text-color);
      }

      hr {
        color: #737373;
        margin-top: 5px;
        opacity: 1;
      }
    </style>

    <paper-dialog id="userProfileDialog" opened="{{opened}}" with-backdrop>
      <div class="header layout horizontal justified">
        <h2>My Profile</h2>

        <paper-icon-button
          class="self-center"
          on-tap="close"
          icon="icons:close">
        </paper-icon-button>
      </div>

      <paper-dialog-scrollable>
        <iron-form class="app-grid">
          <div class="full-width">
            <paper-input label="First Name" value="{{profile.first_name}}" placeholder="---" readonly
                         always-float-label></paper-input>
          </div>

          <div class="full-width">
            <paper-input label="Last Name" value="{{profile.last_name}}" placeholder="---" readonly
                         always-float-label></paper-input>
          </div>

          <div class="full-width">
            <paper-input label="Email" value="{{profile.email}}" placeholder="---" always-float-label
                         readonly></paper-input>
          </div>

          <div class="full-width">
            <div class="caption">My roles</div>
              <template is="dom-repeat"
                        items="[[prpRoles]]"
                        as="role">
                <div>
                  [[ role ]]
                </div>
              </template>
            <hr>
          </div>

          <template is="dom-if" if="{{profile.partner}}">
            <div class="full-width">
              <paper-input label="Partner" value="{{profile.partner.title}}" placeholder="---" readonly
                           always-float-label></paper-input>
            </div>
          </template>

          <template is="dom-if" if="{{profile.organization}}">
            <div class="full-width">
              <paper-input label="My Organization" value="{{profile.organization}}" placeholder="---" readonly
                           always-float-label></paper-input>
            </div>
          </template>

        </iron-form>
      </paper-dialog-scrollable>
    </paper-dialog>
  `;
    }
    close() {
        this.set('opened', false);
    }
    open() {
        this.set('opened', true);
    }
    _computePrpRoles(profile, portal) {
        if (!profile) {
            return;
        }
        return (profile.prp_roles || []).map(function (role) {
            let result = '';
            if (role.cluster && portal === 'cluster-reporting') {
                result += role.cluster.full_title;
            }
            else if (role.workspace) {
                result += role.workspace.title;
            }
            if (result) {
                result += ' / ';
            }
            return result + role.role_display;
        });
    }
}
__decorate([
    property({ type: Boolean })
], UserProfileDialog.prototype, "opened", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)' })
], UserProfileDialog.prototype, "profile", void 0);
__decorate([
    property({ type: Array, computed: '_computePrpRoles(profile, portal)' })
], UserProfileDialog.prototype, "prpRoles", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.app.current)' })
], UserProfileDialog.prototype, "portal", void 0);
window.customElements.define('user-profile-dialog', UserProfileDialog);
export { UserProfileDialog as UserProfileDialogEl };
