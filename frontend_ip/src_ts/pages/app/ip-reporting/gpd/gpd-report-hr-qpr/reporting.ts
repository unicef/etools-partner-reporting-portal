import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../../elements/ip-reporting/pd-output-list.js';
import '../../../../../elements/ip-reporting/pd-output-list-toolbar.js';
import '../../../../../elements/ip-reporting/report-filters.js';
import '../gpd-sent-back.js';
import '../gpd-accepted.js';
@customElement('page-gpd-report-reporting')
export class PageGpdReportReporting extends LitElement {
  render() {
    return html`
      <gpd-sent-back></gpd-sent-back>
      <gpd-accepted></gpd-accepted>
      <report-filters></report-filters>
      <pd-output-list-toolbar></pd-output-list-toolbar>
      <pd-output-list></pd-output-list>
    `;
  }
}
