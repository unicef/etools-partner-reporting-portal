import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './pd-report-hr-qpr/reporting.js';

@customElement('page-pd-report-hr')
export class PagePdReportHr extends UtilsMixin(LitElement) {
  @property({type: String, attribute: true, reflect: true})
  selectedTab = 'reporting';

  render() {
    return html`
      ${this.selectedTab === 'reporting' ? html`<page-pd-report-reporting></page-pd-report-reporting>` : ''}
    `;
  }
}
