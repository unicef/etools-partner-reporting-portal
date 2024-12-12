import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query.js';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button.js';
import Endpoints from '../endpoints.js';
import '../etools-prp-common/elements/page-title.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../redux/store.js';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/index.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import {BASE_PATH} from '../etools-prp-common/config.js';
import {etoolsLogo} from '../etools-prp-common/elements/etools-logo.js';

@customElement('page-login')
export class PageLogin extends connect(store)(LitElement) {
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
      color: black;
    }

    .login-buttons-label {
      font-size: var(--paper-font-headline_-_font-size);
      margin: 0 0 0.75em;
      color: black;
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
      color: var(--sl-color-warning-700);
      font-size: 1.2em;
    }

    #logo {
      fill: black;
    }
  `;

  @property({type: Boolean})
  isDesktop = false;

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
      <page-title title="${translate('SIGN_IN')}"></page-title>

      <div class="login-container">
        <div class="login-container-inner">
          <etools-content-panel no-header>
            <div class="header">
              ${etoolsLogo}
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
                  <etools-button id="login-button" @click="${this._redirectAuth}" variant="primary"
                    >Sign in</etools-button
                  >
                </li>
              </ul>
            </div>
          </etools-content-panel>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    sendRequest({
      method: 'GET',
      endpoint: {url: this.profileUrl}
    })
      .then((res: any) => {
        if (res) {
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
    sendRequest({
      method: 'GET',
      endpoint: {url: this.loginUrl},
      body: this.data
    })
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
}
