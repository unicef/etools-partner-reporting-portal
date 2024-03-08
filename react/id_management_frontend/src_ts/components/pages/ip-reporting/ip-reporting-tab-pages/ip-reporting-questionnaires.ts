import {LitElement, html} from 'lit-element';
import {fireEvent} from '../../../utils/fire-custom-event';

/**
 * @customElement
 * @polymer
 */
class PageOneQuestionnaires extends LitElement {
  render() {
    // language=HTML
    return html`
      <style>
        /* CSS rules for your element */
      </style>

      Page One Questionnaires tab content...
    `;
  }

  static get properties() {
    return {};
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'demo-page'
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

window.customElements.define('ip-reporting-questionnaires', PageOneQuestionnaires);
