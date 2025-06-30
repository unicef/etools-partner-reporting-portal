import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../../elements/ip-reporting/pd-output-list.js';
import '../../../../../elements/ip-reporting/pd-output-list-toolbar.js';
import '../../../../../elements/ip-reporting/report-filters.js';
import '../pd-sent-back.js';
import '../pd-accepted.js';
@customElement('page-pd-report-reporting')
export class PagePdReportReporting extends LitElement {
  render() {
    return html`
      <pd-sent-back></pd-sent-back>
      <pd-accepted></pd-accepted>
      <report-filters></report-filters>
      <pd-output-list-toolbar></pd-output-list-toolbar>
      <pd-output-list></pd-output-list>
    `;
  }
}
