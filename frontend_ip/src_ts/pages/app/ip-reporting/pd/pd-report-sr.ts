import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './pd-report-sr/reporting.js';

@customElement('page-pd-report-sr')
export class PagePdReportSr extends UtilsMixin(LitElement) {
  @property({type: String, attribute: true, reflect: true})
  selectedTab = 'reporting';

  render() {
    return html`
      ${this.selectedTab === 'reporting' ? html`<page-pd-report-sr-reporting></page-pd-report-sr-reporting>` : ''}
    `;
  }
}
