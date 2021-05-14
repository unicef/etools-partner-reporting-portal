import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/element-styles/paper-material-styles';
import '@polymer/iron-collapse/iron-collapse';
import '@polymer/iron-icons/social-icons';
import {property} from '@polymer/decorators';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {GenericObject} from '../../typings/globals.types';
import {fireEvent} from '../../utils/fire-custom-event';
import './user-profile-dialog';
import {UserProfileDialogEl} from './user-profile-dialog';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ProfileDropdown extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
      <style>
        :host {
          @apply --layout-horizontal;
          @apply --layout-center;
          @apply --layout-center-justified;
          position: relative;
          width: 60px;
          height: 60px;
        }
        :host([dropdownOpened='open']) {
          background: var(--primary-background-color, #ffffff);
        }
        :host([dropdownOpened='open']) #profile,
        #accountProfile,
        #powerSettings {
          color: var(--dark-scondary-text-color, rgba(0, 0, 0, 0.54));
        }
        #profile {
          color: var(--header-secondary-text-color, rgba(255, 255, 255, 0.7));
        }
        .dropdown-content {
          position: absolute;
          top: 60px;
          z-index: 100;
          background: var(--primary-background-color, #ffffff);
          padding: 8px 0;
          right: 0px;
        }
        .dropdown-content .item {
          @apply --layout-horizontal;
          @apply --layout-center;
          height: 48px;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.87);
          padding: 0 16px 0 8px;
          cursor: pointer;
          white-space: nowrap;
        }
        .dropdown-content .item:hover {
          background: var(--medium-theme-background-color, #eeeeee);
        }
      </style>

      <user-profile-dialog id="userProfileDialog"></user-profile-dialog>
      <paper-icon-button
        id="profile"
        icon="social:person"
        role="button"
        on-tap="_handleTap"
        aria-disabled="false"
      ></paper-icon-button>
      <iron-collapse id="userDropdown" opened="[[dropdownOpened]]">
        <div class="paper-material dropdown-content" elevation="5" id="user-dropdown">
          <div class="item" on-tap="_openModal">
            <paper-icon-button id="accountProfile" icon="account-circle"></paper-icon-button>
            [[localize('profile')]]
          </div>
          <div class="item" on-tap="_logout">
            <paper-icon-button id="powerSettings" icon="power-settings-new"></paper-icon-button>
            [[localize('sign_out')]]
          </div>
        </div>
      </iron-collapse>
    `;
  }

  @property({type: String, reflectToAttribute: true})
  dropdownOpened = '';

  @property({type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)'})
  profile!: GenericObject;

  _logout() {
    fireEvent(this, 'sign-out');
  }

  _openModal() {
    this._handleTap();
    (this.$.userProfileDialog as UserProfileDialogEl).open();
  }

  _handleTap() {
    if (this.dropdownOpened === '') {
      this.set('dropdownOpened', 'open');
      this.set('opened', false);
    } else {
      this.set('dropdownOpened', '');
    }
  }
}

window.customElements.define('profile-dropdown', ProfileDropdown);
