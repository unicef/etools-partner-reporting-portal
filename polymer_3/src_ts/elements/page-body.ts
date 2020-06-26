import {PolymerElement, html} from '@polymer/polymer';

/**
 * @polymer
 * @customElement
 */
class PageBody extends PolymerElement {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
          padding: 25px 25px 75px;
        }
      </style>
      <slot><slot> </slot></slot>
    `;
  }
}

window.customElements.define('page-body', PageBody);
