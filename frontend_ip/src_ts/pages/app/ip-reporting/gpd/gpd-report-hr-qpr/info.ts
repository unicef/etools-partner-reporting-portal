import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../../elements/ip-reporting/gpd-report-info.js';
import '../gpd-sent-back.js';
import '../gpd-accepted.js';

@customElement('page-gpd-report-info')
export class PageGdpReportInfo extends LitElement {
  render() {
    return html`
      <gpd-sent-back></gpd-sent-back>
      <gpd-accepted></gpd-accepted>
      <gpd-report-info no-header></gpd-report-info>
    `;
  }
}
