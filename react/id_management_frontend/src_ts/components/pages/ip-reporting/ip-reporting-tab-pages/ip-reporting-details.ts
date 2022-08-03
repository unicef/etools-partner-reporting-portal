import {LitElement, html} from 'lit-element';
import {fireEvent} from '../../../utils/fire-custom-event';

/**
 * @customElement
 * @polymer
 */
class PageOneDetails extends LitElement {
  render() {
    // language=HTML
    return html`
      <style>
        /* CSS rules for your element */
      </style>

      Page One Details tab content
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'demo-page'
    });
  }
}

window.customElements.define('ip-reporting-details', PageOneDetails);
