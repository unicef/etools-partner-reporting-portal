import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../etools-prp-common/elements/page-body.js';
import '../../../../etools-prp-common/elements/page-header.js';
import '../../../../elements/ip-reporting/pd-filters.js';
import '../../../../elements/ip-reporting/pd-list-toolbar.js';
import '../../../../elements/ip-reporting/gdd-list.js';
import {translate} from 'lit-translate';
import {connect} from 'pwa-helpers';
import {store} from '../../../../redux/store.js';

@customElement('page-ip-reporting-gdd-index')
export class PageIpReportingGddIndex extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <page-header title="${translate('GDD')}"></page-header>

      <page-body>
        <pd-filters is-gdd></pd-filters>
        <pd-list-toolbar></pd-list-toolbar>
        <gdd-list></gdd-list>
      </page-body>
    `;
  }
}
