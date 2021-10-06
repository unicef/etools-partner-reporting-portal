var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-card/paper-card';
import '@polymer/iron-media-query/iron-media-query';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-input/paper-input';
import '@polymer/iron-form/iron-form';
import Endpoints from '../endpoints';
import ResponsiveMixin from '../etools-prp-common/mixins/responsive-mixin';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import '../etools-prp-common/elements/etools-logo';
import '../etools-prp-common/elements/etools-prp-ajax';
import '../etools-prp-common/elements/page-title';
import { appThemeIpStyles } from '../styles/app-theme-ip-styles';
import { BASE_PATH } from '../etools-prp-common/config';
/**
 * @polymer
 * @customElement
 * @appliesMixin ResponsiveMixin
 * @appliesMixin LocalizeMixin
 */
class PageLogin extends LocalizeMixin(ResponsiveMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.data = {};
        this.loginUrl = Endpoints.userLogin();
        this.profileUrl = Endpoints.userProfile();
        this.emailSubmitted = false;
        this.error = false;
        this.keyEventTarget = () => document.body;
        this.keyBindings = { enter: 'submit' };
    }
    static get template() {
        return html `
      ${appThemeIpStyles}
      <style>
        :host {
          display: block;
          height: 100%;

          --login-container-inner-layout: {
          }

          --paper-button: {
            width: 220px;
            padding: 1em;
            background: #fff;
          }
          --paper-input-container-color: #fff;
          --paper-input-container-input-color: #fff;
          --paper-input-container-focus-underline-color: #fff;
        }

        @media (min-width: 600px) {
          :host {
            --login-container-inner-layout: {
              @apply --layout-vertical;
              @apply --layout-center-justified;
            }
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

          margin: 0 0 0.75em;
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

      <iron-media-query query="[[desktopLayoutQuery]]" query-matches="{{isDesktop}}"> </iron-media-query>

      <etools-prp-ajax id="login" url="[[loginUrl]]" body="[[data]]" content-type="application/json" method="post">
      </etools-prp-ajax>

      <etools-prp-ajax id="getProfile" url="[[profileUrl]]"> </etools-prp-ajax>

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
                  <li>
                    <p>
                      If this is a valid email address, please check your email for instructions to Sign In.<br />
                      You can also try another email.
                    </p>
                  </li>
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
    _computeLogoSize(isDesktop) {
        return isDesktop ? 180 : 120;
    }
    _redirectAuth() {
        window.location.href = Endpoints.login();
    }
    connectedCallback() {
        super.connectedCallback();
        const thunk = this.$.getProfile.thunk();
        thunk()
            .then((res) => {
            if (res.status === 200) {
                window.location.href = `/${BASE_PATH}/`;
            }
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    submit() {
        this.shadowRoot.querySelector('#email').validate();
        if (this.shadowRoot.querySelector('#email').invalid) {
            return;
        }
        const thunk = this.$.login.thunk();
        thunk()
            .then(() => {
            this.set('emailSubmitted', true);
            this.set('data.email', '');
        })
            .catch(() => {
            this.set('emailSubmitted', true);
            this.set('data.email', '');
        });
    }
}
__decorate([
    property({ type: Number, computed: '_computeLogoSize(isDesktop)' })
], PageLogin.prototype, "logoSize", void 0);
__decorate([
    property({ type: Object })
], PageLogin.prototype, "data", void 0);
__decorate([
    property({ type: String })
], PageLogin.prototype, "loginUrl", void 0);
__decorate([
    property({ type: String })
], PageLogin.prototype, "profileUrl", void 0);
__decorate([
    property({ type: Boolean })
], PageLogin.prototype, "emailSubmitted", void 0);
__decorate([
    property({ type: Boolean })
], PageLogin.prototype, "error", void 0);
__decorate([
    property({ type: Object })
], PageLogin.prototype, "keyEventTarget", void 0);
window.customElements.define('page-login', PageLogin);
