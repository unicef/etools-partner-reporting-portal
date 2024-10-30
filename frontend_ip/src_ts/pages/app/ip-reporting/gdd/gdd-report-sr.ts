import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './gdd-report-sr/reporting.js';
import './gdd-report-hr-qpr/info.js';

@customElement('page-gdd-report-sr')
export class PageGddReportSr extends UtilsMixin(LitElement) {
  @property({type: String, attribute: true, reflect: true})
  selectedTab = 'info';

  render() {
    return html`
      <!-- ${this.selectedTab === 'reporting'
        ? html`<page-gdd-report-sr-reporting></page-gdd-report-sr-reporting>`
        : ''} -->
      ${this.selectedTab === 'info' ? html`<page-gdd-report-info></page-gdd-report-info>` : ''}
    `;
  }
}
