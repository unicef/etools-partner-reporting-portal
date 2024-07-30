import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../../elements/ip-reporting/pd-report-info.js';

@customElement('page-pd-report-info')
export class PagePdReportInfo extends LitElement {
  render() {
    return html` <pd-report-info no-header></pd-report-info> `;
  }
}
