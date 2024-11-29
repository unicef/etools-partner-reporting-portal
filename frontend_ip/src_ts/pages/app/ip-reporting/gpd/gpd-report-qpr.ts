import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './gpd-report-hr-qpr/reporting.js'; // Assuming this is the correct path to your component
import './gpd-report-hr-qpr/info.js'; // Assuming this is the correct path to your component

@customElement('page-gpd-report-qpr')
export class PageGpdReportQpr extends UtilsMixin(LitElement) {
  @property({type: String, attribute: true, reflect: true})
  selectedTab = 'info';

  render() {
    return html`
      <!-- ${this.selectedTab === 'reporting' ? html`<page-gpd-report-reporting></page-gpd-report-reporting>` : ''} -->
      ${this.selectedTab === 'info' ? html`<page-gpd-report-info></page-gpd-report-info>` : ''}
    `;
  }
}
