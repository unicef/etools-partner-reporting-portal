import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../../elements/etools-prp-currency';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {currentProgrammeDocument} from '../../etools-prp-common/redux/selectors/programmeDocuments';
import {RootState} from '../../typings/redux.types';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../redux/store';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {valueWithDefault} from '@unicef-polymer/etools-utils/dist/general.util';
import {commaSeparatedDictValues} from '@unicef-polymer/etools-utils/dist/array.util';

@customElement('pd-modal')
export class PdModal extends connect(store)(LitElement) {
  @property({type: Object})
  pd!: any;

  stateChanged(state: RootState) {
    this.pd = currentProgrammeDocument(state);
  }

  render() {
    if (!this.pd) return html``;

    return html`
      <style>
        ${layoutStyles} etools-dialog {
          --divider-color: transparent;
        }
      </style>
      <etools-dialog id="dialog" size="lg" dialog-title="${this.pd.title}" hide-confirm-btn>
        <h3>${translate('PARTNERSHIP_INFO')}</h3>
        <div class="row">
          <div class="col-12 col-md-4">
            <labelled-item label="${translate('AGREEMENT')}">
              <span class="field-value">${valueWithDefault(this.pd.agreement)}</span>
            </labelled-item>
          </div>
          <div class="col-12 col-md-4">
            <labelled-item label="${translate('DOCUMENT_TYPE')}">
              <span class="field-value">${valueWithDefault(this.pd.document_type_display)}</span>
            </labelled-item>
          </div>
          <div class="col-12 col-md-4">
            <labelled-item label="${translate('REFERENCE_NUMBER')}">
              <span class="field-value">${valueWithDefault(this.pd.reference_number)}</span>
            </labelled-item>
          </div>
        </div>

        <br />

        <labelled-item label="${translate('TITLE')}">
          <span class="field-value">${valueWithDefault(this.pd.title)}</span>
        </labelled-item>

        <br />

        <div class="row">
          <div class="col-12 col-md-4">
            <labelled-item label="${translate('UNICEF_OFFICES')}">
              <span class="field-value">${valueWithDefault(this.pd.unicef_office)}</span>
            </labelled-item>
          </div>
          <div class="col-12 col-md-4">
            <labelled-item label="${translate('UNICEF_POINTS')}">
              <span class="field-value">${this._formatFocalPoint(this.pd.unicef_focal_point)}</span>
            </labelled-item>
          </div>
          <div class="col-12 col-md-4">
            <labelled-item label="${translate('PARTNER_POINTS')}">
              <span class="field-value">${this._formatFocalPoint(this.pd.partner_focal_point)}</span>
            </labelled-item>
          </div>
        </div>

        <h3>${translate('PD_SSFA_DETAILS')}</h3>
        <div class="row">
          <div class="col-12 col-sm-4 col-md-3">
            <labelled-item label="In response to an HRP">
              -
              <!-- TODO -->
            </labelled-item>
          </div>
          <div class="col-12 col-sm-4 col-md-3">
            <labelled-item label="${translate('START_DATE')}">
              <span class="field-value">${valueWithDefault(this.pd.start_date)}</span>
            </labelled-item>
          </div>
          <div class="col-12 col-sm-4 col-md-3">
            <labelled-item label="${translate('END_DATE')}">
              <span class="field-value">${valueWithDefault(this.pd.end_date)}</span>
            </labelled-item>
          </div>
          <div class="col-12 col-sm-4 col-md-3">
            <labelled-item label="${translate('CSO_CONTRIBUTION')}]">
              <span class="field-value">
                <etools-prp-currency
                  value="${this.pd.cso_contribution}"
                  currency="${this.pd.cso_contribution_currency}"
                >
                </etools-prp-currency>
              </span>
            </labelled-item>
          </div>
          <div class="col-12 col-sm-4 col-md-3">
            <labelled-item label="${translate('TOTAL_UNICEF_CASH')}">
              <span class="field-value">
                <etools-prp-currency
                  value="${this.pd.total_unicef_cash}"
                  currency="${this.pd.total_unicef_cash_currency}"
                >
                </etools-prp-currency>
              </span>
            </labelled-item>
          </div>
          <div class="col-12 col-sm-4 col-md-3">
            <labelled-item label="${translate('TOTAL_UNICEF_SUPPLIES')}">
              <span class="field-value">
                <etools-prp-currency
                  style="width: 100px"
                  value="${this.pd.total_unicef_supplies}"
                  currency="${this.pd.total_unicef_supplies_currency}"
                >
                </etools-prp-currency>
              </span>
            </labelled-item>
          </div>
          <div class="col-12 col-sm-4 col-md-3">
            <labelled-item label="${translate('TOTAL_BUDGET')}">
              <span class="field-value">
                <etools-prp-currency value="${this.pd.budget}" currency="${this.pd.budget_currency}">
                </etools-prp-currency>
              </span>
            </labelled-item>
          </div>
          <div class="col-12 col-sm-4 col-md-3">
            <labelled-item label="${translate('DISBURSEMENTS')}">
              <span class="field-value">${this.pd.funds_received_to_date} ${this.pd.cso_contribution_currency}</span>
              <etools-prp-progress-bar .number="${this._computeFunds(this.pd.funds_received_to_date_percentage)}">
              </etools-prp-progress-bar>
            </labelled-item>
          </div>
        </div>
        <labelled-item label="${translate('LOCATIONS')}">
          <span class="field-value">${commaSeparatedDictValues(this.pd.locations, 'name')}</span>
        </labelled-item>
      </etools-dialog>
    `;
  }

  _computeFunds(num) {
    if (num === null || num === -1) {
      return 'N/A';
    } else {
      return num / 100;
    }
  }

  _formatFocalPoint(items) {
    return valueWithDefault(commaSeparatedDictValues(items, 'name'), null);
  }
}

export {PdModal as PdModalEl};
