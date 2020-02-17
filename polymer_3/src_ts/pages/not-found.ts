import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-button/paper-button.js';

/**
 * @polymer
 * @customElement
 */
class PageNotFound extends PolymerElement {

  static get template() {
    return html`
    <style>
      :host {
        display: block;
        padding: 25px;

        --paper-button: {
          background-color: #fff;
        };
      }

      h1 {
        @apply --paper-font-display1;
      }
    </style>

    <h1>Page not found</h1>

    <paper-button id="return" on-tap="_return" raised>Head back home</paper-button>
  `;
  }

  connectedCallback() {
    super.connectedCallback();

    this._return = this._return.bind(this);
    this.addEventListener('return.tap', this._return);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('return.tap', this._return);
  }

  _return() {
    window.location.href = '/';
  }

}
window.customElements.define('page-not-found', PageNotFound);

