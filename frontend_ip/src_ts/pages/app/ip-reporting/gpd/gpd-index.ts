import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../../../etools-prp-common/elements/page-body.js';
import '../../../../etools-prp-common/elements/page-header.js';
import '../../../../elements/ip-reporting/pd-filters.js';
import '../../../../elements/ip-reporting/pd-list-toolbar.js';
import '../../../../elements/ip-reporting/gpd-list.js';
import {translate} from 'lit-translate';
import {connect} from 'pwa-helpers';
import {store} from '../../../../redux/store.js';

@customElement('page-ip-reporting-gpd-index')
export class PageIpReportingGpdIndex extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <page-header title="${translate('GDD')}"></page-header>

      <page-body>
        <pd-filters is-gpd></pd-filters>
        <pd-list-toolbar></pd-list-toolbar>
        <gpd-list></gpd-list>
      </page-body>
    `;
  }
}
