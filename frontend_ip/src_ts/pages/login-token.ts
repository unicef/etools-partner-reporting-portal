import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/iron-location/iron-location.js';
import '../etools-prp-common/elements/etools-prp-ajax.js';
import {EtoolsPrpAjaxEl} from '../etools-prp-common/elements/etools-prp-ajax.js';
import Endpoints from '../endpoints.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util.js';
import {BASE_PATH} from '../etools-prp-common/config.js';

@customElement('page-login-token')
export class PageLoginToken extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;
    }

    h3 {
      font-size: var(--paper-font-display1_-_font-size);
    }
  `;

  @property({type: String})
  query = '';

  @property({type: Object})
  data = {};

  @property({type: String})
  tokenUrl = Endpoints.userLoginToken();

  connectedCallback() {
    super.connectedCallback();
    const token = this.query.split('=')[1];
    this.data = {token: token};
    const thunk = (this.shadowRoot!.getElementById('validateToken') as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then((res: any) => {
        if (res.data.success) {
          window.location.href = `/${BASE_PATH}/`;
        }
      })
      .catch(() => {
        fireEvent(this, 'token-error');
      });
  }

  render() {
    return html`
      <style>
        :host {
          display: block;
          padding: 25px;
        }

        h3 {
          font-size: var(--paper-font-display1_-_font-size);
        }
      </style>

      <iron-location .query="${this.query}"></iron-location>

      <etools-prp-ajax
        id="validateToken"
        url="${this.tokenUrl}"
        .body="${this.data}"
        content-type="application/json"
        method="post"
      >
      </etools-prp-ajax>

      <h3>The page is loading...</h3>
    `;
  }
}
