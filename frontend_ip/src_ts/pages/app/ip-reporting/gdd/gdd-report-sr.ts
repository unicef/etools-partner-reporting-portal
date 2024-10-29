import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './gdd-report-sr/reporting.js';

@customElement('page-gdd-report-sr')
export class PageGddReportSr extends UtilsMixin(LitElement) {
  @property({type: String, attribute: true, reflect: true})
  selectedTab = 'reporting';

  render() {
    return html`
      ${this.selectedTab === 'reporting' ? html`<page-gdd-report-sr-reporting></page-gdd-report-sr-reporting>` : ''}
    `;
  }
}
