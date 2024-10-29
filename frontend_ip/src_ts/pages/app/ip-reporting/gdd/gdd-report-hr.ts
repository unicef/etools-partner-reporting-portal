import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './gdd-report-hr-qpr/reporting.js';

@customElement('page-gdd-report-hr')
export class PageGddReportHr extends UtilsMixin(LitElement) {
  @property({type: String, attribute: true, reflect: true})
  selectedTab = 'reporting';

  render() {
    return html`
      ${this.selectedTab === 'reporting' ? html`<page-gdd-report-reporting></page-gdd-report-reporting>` : ''}
    `;
  }
}
