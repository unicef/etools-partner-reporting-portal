import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './gpd-report-sr/reporting.js';
import './gpd-report-hr-qpr/info.js';

@customElement('page-gpd-report-sr')
export class PageGpdReportSr extends UtilsMixin(LitElement) {
  @property({type: String, attribute: true, reflect: true})
  selectedTab = 'info';

  render() {
    return html`
      <!-- ${this.selectedTab === 'reporting'
        ? html`<page-gpd-report-sr-reporting></page-gpd-report-sr-reporting>`
        : ''} -->
      ${this.selectedTab === 'info' ? html`<page-gpd-report-info></page-gpd-report-info>` : ''}
    `;
  }
}
