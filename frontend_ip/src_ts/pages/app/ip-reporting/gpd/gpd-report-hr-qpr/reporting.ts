import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../../elements/ip-reporting/pd-output-list.js';
import '../../../../../elements/ip-reporting/pd-output-list-toolbar.js';
import '../../../../../elements/ip-reporting/report-filters.js';
import '../gpd-sent-back.js';

@customElement('page-gpd-report-reporting')
export class PageGpdReportReporting extends LitElement {
  render() {
    return html`
      <gpd-sent-back></gpd-sent-back>
      <report-filters></report-filters>
      <pd-output-list-toolbar></pd-output-list-toolbar>
      <pd-output-list></pd-output-list>
    `;
  }
}
