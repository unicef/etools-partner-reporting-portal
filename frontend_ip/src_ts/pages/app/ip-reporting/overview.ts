import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../etools-prp-common/elements/page-header.js';
import '../../../etools-prp-common/elements/page-body.js';
import '../../../elements/ip-reporting/partner-details.js';
import '../../../elements/ip-reporting/risk-rating.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../../redux/store.js';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';

@customElement('page-ip-reporting-overview')
export class PageIpReportingOverview extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <page-header .title="${translate('OVERVIEW')}"></page-header>
      <page-body>
        <partner-details></partner-details>
        <risk-rating></risk-rating>
      </page-body>
    `;
  }
}
