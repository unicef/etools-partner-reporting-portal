import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-button/paper-button.js';
import Endpoints from '../../endpoints';
import {buttonsStyles} from '../../etools-prp-common/styles/buttons-styles';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 */
class PdReportExportButton extends ReduxConnectedElement {
  public static get template() {
    return html`
      ${buttonsStyles}
      <style>
        a {
          color: var(--theme-primary-color);
          text-decoration: none;
        }

        paper-button {
          text-transform: uppercase;
        }
      </style>

      <a href="[[fileUrl]]" target="_blank" tabindex="-1">
        <paper-button class="btn-primary">Download report in standard template format</paper-button>
      </a>
    `;
  }

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  reportId!: string;

  @property({type: String, computed: '_computeFileUrl(locationId, reportId)'})
  fileUrl!: string;

  _computeFileUrl = Endpoints.reportExport.bind(Endpoints);
}

window.customElements.define('pd-report-export-button', PdReportExportButton);

export {PdReportExportButton as PdReportExportButtonEl};
