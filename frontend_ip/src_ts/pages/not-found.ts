import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-button/paper-button.js';

@customElement('page-not-found')
export class PageNotFound extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;

      --paper-button: {
        background-color: #fff;
      }
    }

    h1 {
      font-size: var(--paper-font-display1_-_font-size);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._return = this._return.bind(this);
    this.addEventListener('return.tap', this._return as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('return.tap', this._return as EventListener);
  }

  render() {
    return html`
      <h1>Page not found</h1>

      <paper-button id="return" @click="${this._return}" raised>Head back home</paper-button>
    `;
  }

  private _return() {
    window.location.href = '/';
  }
}
