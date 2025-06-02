import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './gpd-report-hr-qpr/reporting.js';
import './gpd-report-hr-qpr/info.js';

@customElement('page-gpd-report-hr')
export class PageGpdReportHr extends UtilsMixin(LitElement) {
  @property({type: String, attribute: true, reflect: true})
  selectedTab = 'info';

  render() {
    return html`
      <!-- ${this.selectedTab === 'reporting' ? html`<page-gpd-report-reporting></page-gpd-report-reporting>` : ''} -->
      ${this.selectedTab === 'info' ? html`<page-gpd-report-info></page-gpd-report-info>` : ''}
    `;
  }
}
