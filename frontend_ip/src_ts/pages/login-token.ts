import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import Endpoints from '../endpoints.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util.js';
import {BASE_PATH} from '../etools-prp-common/config.js';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request.js';

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

  @property({type: Object})
  data = {};

  @property({type: String})
  tokenUrl = Endpoints.userLoginToken();

  connectedCallback() {
    super.connectedCallback();
    this.checkToken();
  }

  checkToken() {
    const token = window.location.search.split('=')?.[1];

    if (!token) {
      fireEvent(this, 'token-error');
      return;
    }

    this.data = {token};
    sendRequest({
      method: 'POST',
      endpoint: {url: this.tokenUrl},
      body: this.data
    })
      .then((res: any) => {
        if (res.success) {
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

      <h3>The page is loading...</h3>
    `;
  }
}
