import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../../elements/ip-reporting/pd-report-info.js';

@customElement('page-gdd-report-info')
export class PageGddReportInfo extends LitElement {
  render() {
    return html` <pd-report-info no-header></pd-report-info> `;
  }
}
