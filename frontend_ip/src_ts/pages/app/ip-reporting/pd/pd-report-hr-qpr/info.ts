import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-pages/iron-pages';
import '../../../../../elements/ip-reporting/pd-report-info';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 */
class PagePdReportInfo extends PolymerElement {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <pd-report-info no-header></pd-report-info>
    `;
  }
}

window.customElements.define('page-pd-report-info', PagePdReportInfo);
