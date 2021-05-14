import {PolymerElement, html} from '@polymer/polymer';
import '../../../../../elements/ip-reporting/pd-output-list';
import '../../../../../elements/ip-reporting/pd-output-list-toolbar';
import '../../../../../elements/ip-reporting/report-filters';
import '../pd-sent-back';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 */
class PagePdReportReporting extends PolymerElement {
  public static get template() {
    return html`
      <pd-sent-back></pd-sent-back>
      <report-filters></report-filters>
      <pd-output-list-toolbar></pd-output-list-toolbar>
      <pd-output-list></pd-output-list>
    `;
  }
}

window.customElements.define('page-pd-report-reporting', PagePdReportReporting);
