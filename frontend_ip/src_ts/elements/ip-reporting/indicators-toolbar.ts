import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import {computeIndicatorsUrl} from './js/indicators-toolbar-functions';

@customElement('indicators-toolbar')
export class IndicatorsToolbar extends UtilsMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String})
  query = '';

  @property({type: String})
  locationId = '';

  @property({type: String})
  indicatorsUrl = '';

  @property({type: String})
  xlsExportUrl?: string;

  @property({type: String})
  pdfExportUrl?: string;

  render() {
    return html`
      <etools-prp-toolbar .query="${this.query}" .locationId="${this.locationId}">
        <download-button url="${this.xlsExportUrl}" tracker="Indicators Export Xls">XLS</download-button>
        <download-button url="${this.pdfExportUrl}" tracker="Indicators Export Pdf">PDF</download-button>
      </etools-prp-toolbar>
    `;
  }

  updated(changedProperties: any) {
    super.updated(changedProperties);

    if (changedProperties.has('locationId')) {
      this.indicatorsUrl = computeIndicatorsUrl(this.locationId);
    }

    if (changedProperties.has('indicatorsUrl') || changedProperties.has('query')) {
      this.xlsExportUrl = this._appendQuery(this.indicatorsUrl, this.query, 'export=xlsx');
      this.pdfExportUrl = this._appendQuery(this.indicatorsUrl, this.query, 'export=pdf');
    }
  }
}
