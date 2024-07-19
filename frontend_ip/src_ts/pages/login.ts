import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-form/iron-form.js';
import '../etools-prp-common/elements/etools-logo.js';
import '../etools-prp-common/elements/etools-prp-ajax.js';
import Endpoints from '../endpoints.js';
import ResponsiveMixin from '../etools-prp-common/mixins/responsive-mixin.js';
import {EtoolsPrpAjaxEl} from '../etools-prp-common/elements/etools-prp-ajax.js';
import '../etools-prp-common/elements/page-title.js';
import {BASE_PATH} from '../etools-prp-common/config.js';
import {connect} from 'pwa-helpers';
import {store} from '../redux/store.js';
import {appThemeIpStyles} from '../styles/app-theme-ip-styles.js';
import {translate} from 'lit-translate';

@customElement('page-login')
export class PageLogin extends ResponsiveMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      box-sizing: border-box;
      padding: 1em;
      background: linear-gradient(#44b4ff, #0099ff);
    }

    .login-container-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 100%;
      width: 290px;
    }

    @media (min-width: 600px) {
      .login-container-inner {
        width: 480px;
      }
    }

    .header {
      padding: 2em 0;
      text-align: center;
    }

    .header h1 {
      font-size: var(--paper-font-subhead_-_font-size);
      margin: 0;
    }

    .login-buttons {
      padding: 3em 1em;
      background: var(--theme-primary-color);
    }

    .login-buttons-label {
      font-size: var(--paper-font-headline_-_font-size);
      margin: 0 0 0.75em;
      color: var(--theme-primary-text-color-light);
      text-align: center;
    }

    .login-buttons ul {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .login-buttons li {
      display: flex;
      justify-content: center;
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
  `;

  @property({type: Number})
  logoSize = 120;

  @property({type: Object})
  data: any = {};

  @property({type: String})
  loginUrl = Endpoints.userLogin();

  @property({type: String})
  profileUrl = Endpoints.userProfile();

  @property({type: Boolean})
  emailSubmitted = false;

  @property({type: Boolean})
  error = false;

  @property({attribute: false})
  keyEventTarget = () => document.body;

  keyBindings = {enter: 'submit'};

  render() {
    return html`
      ${appThemeIpStyles}
      <page-title title="${translate('SIGN_IN')}"></page-title>

      <iron-media-query
        query="${this.desktopLayoutQuery}"
        query-matches="${this.isDesktop}"
        @query-matches-changed="${this._handleMediaQuery}"
      ></iron-media-query>

      <etools-prp-ajax
        id="login"
        .url="${this.loginUrl}"
        .body="${this.data}"
        content-type="application/json"
        method="post"
      >
      </etools-prp-ajax>

      <etools-prp-ajax id="getProfile" url="${this.profileUrl}"></etools-prp-ajax>

      <div class="login-container">
        <div class="login-container-inner">
          <paper-card>
            <div class="header">
              <etools-logo .size="${this.logoSize}" text-color="#233944"></etools-logo>
              <h1>Partner Reporting Portal</h1>
            </div>
            <div class="login-buttons">
              <p class="login-buttons-label">Login via Active Directory</p>
              <ul>
                ${this.emailSubmitted
                  ? html`
                      <li>
                        <p>
                          If this is a valid email address, please check your email for instructions to Sign In.<br />
                          You can also try another email.
                        </p>
                      </li>
                    `
                  : html``}
                ${this.error
                  ? html` <li><p class="error-token">Unable to login, invalid token, please try again.</p></li> `
                  : html``}
                <li>
                  <paper-button id="login-button" @click="${this._redirectAuth}" class="btn-primary" raised
                    >Sign in</paper-button
                  >
                </li>
              </ul>
            </div>
          </paper-card>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    const thunk = (this.shadowRoot!.getElementById('getProfile') as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then((res: any) => {
        if (res.status === 200) {
          window.location.href = `/${BASE_PATH}/`;
        }
      })
      .catch((_err: any) => {
        // TODO: error handling
      });
  }

  submit() {
    const emailInput = this.shadowRoot!.querySelector('#email') as any;
    if (emailInput) {
      emailInput.validate();
      if (emailInput.invalid) {
        return;
      }
    }
    const thunk = (this.shadowRoot!.getElementById('login') as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then(() => {
        this.emailSubmitted = true;
        this.data.email = '';
      })
      .catch(() => {
        this.emailSubmitted = true;
        this.data.email = '';
      });
  }

  _redirectAuth() {
    window.location.href = Endpoints.login();
  }

  private _handleMediaQuery(event: CustomEvent) {
    this.isDesktop = event.detail.value;
    this.logoSize = this.isDesktop ? 180 : 120;
  }
}
