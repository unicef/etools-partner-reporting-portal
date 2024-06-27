import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import {computePdUrl} from './js/pd-list-toolbar-functions.js';

@customElement('pd-list-toolbar')
export class PdListToolbar extends UtilsMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String})
  query!: string;

  @property({type: String})
  locationId!: string;

  @property({type: String, attribute: false})
  pdUrl!: string;

  @property({type: String, attribute: false})
  pdfExportUrl?: string;

  @property({type: String, attribute: false})
  xlsxExportUrl?: string;

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('locationId')) {
      this.pdUrl = computePdUrl(this.locationId);
    }

    if (changedProperties.has('pdUrl') || changedProperties.has('query')) {
      this.pdfExportUrl = this._appendQuery(this.pdUrl, this.query, 'export=pdf');
      this.xlsxExportUrl = this._appendQuery(this.pdUrl, this.query, 'export=xlsx');
    }
  }

  render() {
    return html`
      <etools-prp-toolbar query="${this.query}" location-id="${this.locationId}">
        <download-button url="${this.pdfExportUrl}" tracker="Programme Documents Export Pdf">PDF</download-button>
        <download-button url="${this.xlsxExportUrl}" tracker="Programme Documents Export Xlsx">XLS</download-button>
      </etools-prp-toolbar>
    `;
  }
}

export {PdListToolbar as PdListToolbarEl};
