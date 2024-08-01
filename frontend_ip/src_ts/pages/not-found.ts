import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';

@customElement('page-not-found')
export class PageNotFound extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;
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

      <etools-button id="return" @click="${this._return}">Head back home</etools-button>
    `;
  }

  private _return() {
    window.location.href = '/';
  }
}
