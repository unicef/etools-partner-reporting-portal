import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {programmeDocumentReportsCount} from '../../redux/selectors/programmeDocumentReports';
import {computePdReportsUrl, canExport, computePdQuery} from './js/pd-reports-toolbar-functions';
import {RootState} from '../../typings/redux.types';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';

@customElement('pd-reports-toolbar')
class PdReportsToolbar extends UtilsMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String})
  query!: string;

  @property({type: String})
  pdId!: string;

  @property({type: Number, attribute: false})
  totalResults!: number;

  @property({type: Boolean, attribute: false})
  canExport!: boolean;

  @property({type: String, attribute: false})
  pdReportsUrl!: string;

  @property({type: Object, attribute: false})
  pdQuery!: any;

  @property({type: String, attribute: false})
  xlsExportUrl?: string;

  @property({type: String, attribute: false})
  pdfExportUrl?: string;

  render() {
    return html`
      <etools-prp-toolbar .query="${this.query}" .pdId="${this.pdId}" .locationId="${this.locationId}">
        ${this.canExport
          ? html`
              <download-button .url="${this.xlsExportUrl}" tracker="PD Reports Export Xls">XLS</download-button>
              <download-button .url="${this.pdfExportUrl}" tracker="PD Reports Export Pdf">PDF</download-button>
            `
          : ''}
      </etools-prp-toolbar>
    `;
  }

  stateChanged(state: RootState) {
    this.totalResults = programmeDocumentReportsCount(state);
  }

  updated(changedProperties) {
    if (changedProperties.has('totalResults')) {
      this.canExport = canExport(this.totalResults);
    }
    if (changedProperties.has('locationId')) {
      this.pdReportsUrl = computePdReportsUrl(this.locationId);
    }
    if (changedProperties.has('pdId')) {
      this.pdQuery = computePdQuery(this.pdId);
    }
    if (changedProperties.has('pdReportsUrl') || changedProperties.has('query') || changedProperties.has('pdQuery')) {
      this.xlsExportUrl = this._appendQuery(this.pdReportsUrl, this.query, this.pdQuery, 'export=xlsx');
      this.pdfExportUrl = this._appendQuery(this.pdReportsUrl, this.query, this.pdQuery, 'export=pdf');
    }
  }
}

export {PdReportsToolbar as PdReportsToolbarEl};
