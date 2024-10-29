import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../../elements/ip-reporting/pd-output-list.js';
import '../../../../../elements/ip-reporting/pd-output-list-toolbar.js';
import '../../../../../elements/ip-reporting/report-filters.js';
import '../gdd-sent-back.js';

@customElement('page-gdd-report-reporting')
export class PageGddReportReporting extends LitElement {
  render() {
    return html`
      <gdd-sent-back></gdd-sent-back>
      <report-filters></report-filters>
      <pd-output-list-toolbar></pd-output-list-toolbar>
      <pd-output-list></pd-output-list>
    `;
  }
}
