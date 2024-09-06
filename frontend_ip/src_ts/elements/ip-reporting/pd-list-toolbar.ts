import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../../etools-prp-common/elements/download-button';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import {translate} from 'lit-translate';
import {computePdUrl} from './js/pd-list-toolbar-functions.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

@customElement('pd-list-toolbar')
export class PdListToolbar extends UtilsMixin(connect(store)(LitElement)) {
  static styles = css`
    ${layoutStyles}
    :host {
      display: block;
      margin: 25px 0;
    }
    .right-align {
      text-align: left;
    }
  `;

  @property({type: Object})
  queryParams: any;

  @property({type: String})
  locationId!: string;

  @property({type: String, attribute: false})
  pdUrl!: string;

  @property({type: String, attribute: false})
  pdfExportUrl?: string;

  @property({type: String, attribute: false})
  xlsxExportUrl?: string;

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('locationId')) {
      this.pdUrl = computePdUrl(this.locationId);
    }

    if (changedProperties.has('pdUrl') || changedProperties.has('queryParams')) {
      this.pdfExportUrl = this._appendQuery(this.pdUrl, this.queryParams, 'export=pdf');
      this.xlsxExportUrl = this._appendQuery(this.pdUrl, this.queryParams, 'export=xlsx');
    }
  }

  stateChanged(state: any) {
    if (
      state.app?.routeDetails?.queryParams &&
      !isJsonStrMatch(this.queryParams, state.app?.routeDetails?.queryParams)
    ) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }

    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
  }

  render() {
    return html`
      <div class="layout-horizontal right-align">
        <sl-tooltip content="${translate('PROGRESS_REPORTS_EXPORT_STATUS')}">
          <download-button .url="${this.xlsxExportUrl}" tracker="Programme Documents Export Xlsx">XLS</download-button>
        </sl-tooltip>
        <sl-tooltip content="${translate('PROGRESS_REPORTS_EXPORT_STATUS')}">
          <download-button .url="${this.pdfExportUrl}" tracker="Programme Documents Export Pdf">PDF</download-button>
        </sl-tooltip>
      </div>
    `;
  }
}

export {PdListToolbar as PdListToolbarEl};
