import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../../elements/ip-reporting/pd-report-info.js';
import '../pd-sent-back.js';
import '../pd-accepted.js';

@customElement('page-pd-report-info')
export class PagePdReportInfo extends LitElement {
  render() {
    return html`
      <pd-sent-back></pd-sent-back>
      <pd-accepted></pd-accepted>
      <pd-report-info no-header></pd-report-info>
    `;
  }
}
