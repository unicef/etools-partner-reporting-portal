import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../etools-prp-common/elements/page-body.js';
import '../../../../etools-prp-common/elements/page-header.js';
import '../../../../elements/ip-reporting/pd-filters.js';
import '../../../../elements/ip-reporting/pd-list-toolbar.js';
import '../../../../elements/ip-reporting/pd-list.js';
import {translate} from 'lit-translate';
import {connect} from 'pwa-helpers';
import {store} from '../../../../redux/store';

@customElement('page-ip-reporting-pd-index')
export class PageIpReportingPdIndex extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <page-header title="${translate('PROGRAMME_DOCUMENTS')}"></page-header>

      <page-body>
        <pd-filters></pd-filters>
        <pd-list-toolbar></pd-list-toolbar>
        <pd-list></pd-list>
      </page-body>
    `;
  }
}
