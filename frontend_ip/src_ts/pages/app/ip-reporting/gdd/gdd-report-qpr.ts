import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './gdd-report-hr-qpr/reporting.js'; // Assuming this is the correct path to your component
import './gdd-report-hr-qpr/info.js'; // Assuming this is the correct path to your component

@customElement('page-gdd-report-qpr')
export class PageGddReportQpr extends UtilsMixin(LitElement) {
  @property({type: String, attribute: true, reflect: true})
  selectedTab = 'info';

  render() {
    return html`
      <!-- ${this.selectedTab === 'reporting' ? html`<page-gdd-report-reporting></page-gdd-report-reporting>` : ''} -->
      ${this.selectedTab === 'info' ? html`<page-gdd-report-info></page-gdd-report-info>` : ''}
    `;
  }
}
