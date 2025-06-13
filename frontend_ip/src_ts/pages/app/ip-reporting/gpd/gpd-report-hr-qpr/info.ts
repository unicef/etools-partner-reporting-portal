import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../../elements/ip-reporting/gpd-report-info.js';

@customElement('page-gpd-report-info')
export class PageGdpReportInfo extends LitElement {
  render() {
    return html` <gpd-report-info no-header></gpd-report-info> `;
  }
}
