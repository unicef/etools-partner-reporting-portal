import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../../etools-prp-common/elements/download-button';
import {computeIndicatorsUrl} from './js/indicators-toolbar-functions';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {store} from '../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

@customElement('indicators-toolbar')
export class IndicatorsToolbar extends UtilsMixin(connect(store)(LitElement)) {
  static styles = css`
    ${layoutStyles}
    :host {
      display: block;
      margin-bottom: 25px;
    }
  `;

  @property({type: Object})
  queryParams: any;

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
      <div class="layout-horizontal right-align">
        <download-button .url="${this.xlsExportUrl}" tracker="Indicators Export Xls">XLS</download-button>
        <download-button .url="${this.pdfExportUrl}" tracker="Indicators Export Pdf">PDF</download-button>
      </div>
    `;
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

  updated(changedProperties: any) {
    super.updated(changedProperties);

    if (changedProperties.has('locationId')) {
      this.indicatorsUrl = computeIndicatorsUrl(this.locationId);
    }

    if (changedProperties.has('indicatorsUrl') || changedProperties.has('queryParams')) {
      this.xlsExportUrl = this._appendQuery(this.indicatorsUrl, this.queryParams, 'export=xlsx');
      this.pdfExportUrl = this._appendQuery(this.indicatorsUrl, this.queryParams, 'export=pdf');
    }
  }
}
