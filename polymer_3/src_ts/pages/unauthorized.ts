import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer/polymer-element.js';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-loading/etools-loading.js';
import '@polymer/paper-styles/typography.js';
import Endpoints from '../endpoints';
import LocalizeMixin from '../mixins/localize-mixin';
import '../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../elements/etools-prp-ajax';
import '../elements/message-box';
import '../elements/page-body';
import '../elements/user-profile/profile-dropdown';
import {fireEvent} from '../utils/fire-custom-event';

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

  <etools-prp-ajax
      id="userProfile"
      url="[[profileUrl]]">
  </etools-prp-ajax>

  <page-body>
    <div class="item">
      <span class="sign-out-button" on-tap="_logout">
        <paper-icon-button id="powerSettings" icon="power-settings-new"></paper-icon-button>
        [[localize('sign_out')]]
      </span>
    </div>

    <template
        is="dom-if"
        if="[[loading]]"
        restamp="true">
      <div class="loader">
        <etools-loading no-overlay></etools-loading>
      </div>
    </template>

    <template
        is="dom-if"
        if="[[!loading]]"
        restamp="true">
      <message-box type="warning">
        <span>
          It looks like you do not have the permissions assigned to enter the Partner Reporting Portal.
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


  _logout() {
    fireEvent(this, 'sign-out');
  }

  connectedCallback() {
    super.connectedCallback();
    var self = this;

    (this.$.userProfile as EtoolsPrpAjaxEl).thunk()()
      .then(function(res: any) {
        if (res.data.access.length) {
          location.href = '/';
        } else {
          self.set('loading', false);
        }
      });
  }

}
window.customElements.define('page-unauthorized', PageUnauthorized);
