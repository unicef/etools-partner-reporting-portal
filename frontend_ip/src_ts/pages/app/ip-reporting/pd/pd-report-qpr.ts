import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './pd-report-hr-qpr/reporting.js'; // Assuming this is the correct path to your component
import './pd-report-hr-qpr/info.js'; // Assuming this is the correct path to your component

@customElement('page-pd-report-qpr')
export class PagePdReportQpr extends UtilsMixin(LitElement) {
  @property({type: String, attribute: true, reflect: true})
  selectedTab = 'reporting';

  render() {
    return html`
      <div>
        <div name="reporting" ?hidden=${this.selectedTab !== 'reporting'}>
          <page-pd-report-reporting></page-pd-report-reporting>
        </div>
        <div name="info" ?hidden=${this.selectedTab !== 'info'}>
          <page-pd-report-info></page-pd-report-info>
        </div>
      </div>
    `;
  }
}
