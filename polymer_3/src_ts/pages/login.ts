import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer/polymer-element.js';
import {property} from '@polymer/decorators';

import '@polymer/paper-card/paper-card.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-form/iron-form.js';

import Endpoints from '../endpoints';
import ResponsiveMixin from '../mixins/responsive-mixin'
import LocalizeMixin from '../mixins/localize-mixin';
import '../elements/etools-logo';
import {EtoolsPrpAjaxEl} from '../elements/etools-prp-ajax';
import '../elements/etools-prp-ajax';
import '../elements/page-title';
import {appThemeIpStyles} from '../styles/app-theme-ip-styles';


/**
 * @polymer
 * @customElement
 * @appliesMixin ResponsiveMixin
 * @appliesMixin LocalizeMixin
 */
class PageLogin extends LocalizeMixin(ResponsiveMixin(ReduxConnectedElement)) {

  public static get template() {
    return html`
    ${appThemeIpStyles}
    <style>
      :host {
        display: block;
        height: 100%;

        --login-container-inner-layout: {}

        --paper-button: {
          width: 220px;
          padding: 1em;
          background: #fff;
        };
        --paper-input-container-color: #fff;
        --paper-input-container-input-color: #fff;
        --paper-input-container-focus-underline-color: #fff;
      }

      @media (min-width: 600px) {
        :host {
          --login-container-inner-layout: {
            @apply --layout-vertical;
            @apply --layout-center-justified;
          };
        }
      }

      .login-container {
        @apply --layout-horizontal;
        @apply --layout-center-justified;

        box-sizing: border-box;
        min-height: 100%;
        padding: 1em;
        background: linear-gradient(#44b4ff, #0099ff);
      }

      .login-container-inner {
        @apply --login-container-inner-layout;
      }

      paper-card {
        width: 290px;
      }

      @media (min-width: 600px) {
        paper-card {
          width: 480px;
        }
      }

      .header {
        padding: 2em 0;
        text-align: center;
      }

      .header h1 {
        @apply --paper-font-subhead;

        margin: 0;
      }

      .login-buttons {
        padding: 3em 1em;
        background: var(--theme-primary-color);
      }

      .login-buttons-label {
        @apply --paper-font-headline;

        margin: 0 0 .75em;
        color: var(--theme-primary-text-color-light);
        text-align: center;
      }

      .login-buttons ul {
        @apply --layout-vertical;

        padding: 0;
        margin: 0;
        list-style: none;
      }

      .login-buttons li {
        @apply --layout-horizontal;
        @apply --layout-center-justified;
      }

      .login-buttons li:not(:last-child) {
        margin-bottom: 1em;
      }

      .login-buttons a {
        text-decoration: none;
        color: inherit;
      }

      p {
        color: #fff;
      }
      p.error-token {
        color: var(--paper-deep-orange-a700);
        font-size: 1.2em;
      }

    </style>

    <page-title title="[[localize('sign_in')]]"></page-title>

    <iron-media-query
        query="[[desktopLayoutQuery]]"
        query-matches="{{isDesktop}}">
    </iron-media-query>

    <etools-prp-ajax
      id="login"
      url="[[loginUrl]]"
      body="[[data]]"
      content-type="application/json"
      method="post">
    </etools-prp-ajax>

    <etools-prp-ajax
      id="getProfile"
      url="[[profileUrl]]">
    </etools-prp-ajax>

    <div class="login-container">
      <div class="login-container-inner">
        <paper-card>
          <div class="header">
            <etools-logo size="[[logoSize]]" text-color="#233944"></etools-logo>

            <h1>Partner Reporting Portal</h1>
          </div>
          <div class="login-buttons">
            <p class="login-buttons-label">Login via Active Directory</p>

            <ul>
              <template is="dom-if" if="{{emailSubmitted}}">
                <li><p>If this is a valid email address, please check your email for instructions to Sign In.<br>
                You can also try another email.</p></li>
              </template>

                <template is="dom-if" if="{{value}}">
                  <li><p class="error-token">Unable to login, invalid token, please try again.</p></li>
                </template>
              <li>
              <paper-button id="login-button" on-tap="_redirectAuth" class="btn-primary" raised>
                Sign in
              </paper-button>
          </li>

              <!-- <li>
                <a href="/todo">
                  <paper-button raised>
                    <img src="../../images/google.png" alt="Google" height="20">
                  </paper-button>
                </a>
              </li>
              <li>
                <a href="/todo">
                  <paper-button raised>
                    <img src="../../images/unicef.png" alt="Unicef" height="20">
                  </paper-button>
                </a>
              </li>
              <li>
                <a href="/todo">
                  <paper-button raised>
                    <img src="../../images/humanitarianid.png" alt="Humanitarian ID" height="20">
                  </paper-button>
                </a>
              </li> -->
            </ul>
          </div>
        </paper-card>
      </div>
    </div>
  `;
  }

  @property({type: Number, computed: '_computeLogoSize(isDesktop)'})
  logoSize!: number;

  @property({type: Object})
  data = {};

  @property({type: String})
  loginUrl: string = Endpoints.userLogin();

  @property({type: String})
  profileUrl: string = Endpoints.userProfile();

  @property({type: Boolean})
  emailSubmitted = false;

  @property({type: Boolean})
  error = false;

  @property({type: Object})
  keyEventTarget = () => document.body;

  // (dci)
  // keyBindings: {
  //   'enter': 'submit',
  // },

  _computeLogoSize(isDesktop: boolean) {
    return isDesktop ? 180 : 120;
  }

  _redirectAuth() {
    window.location.href = Endpoints.login();
  }

  connectedCallback() {
    super.connectedCallback();

    const thunk = (this.$.getProfile as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then(function(res: any) {
        if (res.status === 200) {
          window.location.href = '/app_poly3/';
        }
      })
      .catch(function(err: any) { // jshint ignore:line
        // TODO: error handling
      });
  }

  submit() {
    const self = this;
    this.shadowRoot!.querySelector('#email').validate();
    if (this.shadowRoot!.querySelector('#email').invalid) {
      return;
    }
    const thunk = (this.$.login as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then(function() {
        self.set('emailSubmitted', true);
        self.set('data.email', '');
      })
      .catch(function() {
        self.set('emailSubmitted', true);
        self.set('data.email', '');
      });
  }

}
window.customElements.define('page-login', PageLogin);
