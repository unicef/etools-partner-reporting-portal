import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import Endpoints from '../../endpoints';
import {buttonsStyles} from '../../etools-prp-common/styles/buttons-styles';
import {RootState} from '../../typings/redux.types';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../redux/store';

@customElement('pd-report-export-button')
export class PdReportExportButton extends connect(store)(LitElement) {
  static styles = [
    css`
      a {
        color: var(--theme-primary-color);
        text-decoration: none;
      }

      etools-button {
        text-transform: uppercase;
      }
    `
  ];

  @property({type: String})
  locationId!: string;

  @property({type: String})
  reportId!: string;

  @property({type: String})
  fileUrl!: string;

  render() {
    return html`
      ${buttonsStyles}
      <a href="${this.fileUrl}" target="_blank" tabindex="-1">
        <etools-button variant="primary">Download report in standard template format</etools-button>
      </a>
    `;
  }

  stateChanged(state: RootState) {
    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }

    if (this.reportId !== state.programmeDocumentReports.current.id) {
      this.reportId = state.programmeDocumentReports.current.id;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('locationId') || changedProperties.has('reportId')) {
      this.fileUrl = Endpoints.reportExport(this.locationId, this.reportId);
    }
  }
}

export {PdReportExportButton as PdReportExportButtonEl};
