import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '../../elements/etools-prp-currency';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from 'lit-translate';
import ModalMixin from '../../etools-prp-common/mixins/modal-mixin';
import {buttonsStyles} from '../../etools-prp-common/styles/buttons-styles';
import {modalStyles} from '../../etools-prp-common/styles/modal-styles';
import {currentProgrammeDocument} from '../../etools-prp-common/redux/selectors/programmeDocuments';
import {RootState} from '../../typings/redux.types';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';

@customElement('pd-modal')
export class PdModal extends ModalMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
    }

    :host {
      --app-grid-columns: 6;
      --app-grid-gutter: 25px;
      --app-grid-item-height: auto;
      --app-grid-expandible-item-columns: 2;

      --paper-dialog: {
        width: 900px;
      }
    }

    .app-grid {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .item-2-col {
      @apply --app-grid-expandible-item;
    }

    h3 {
      @apply --paper-font-title;
    }
  `;

  @property({type: Boolean})
  opened = false;

  @property({type: Object})
  pd!: any;

  stateChanged(state: RootState) {
    this.pd = currentProgrammeDocument(state);
  }

  render() {
    if (!this.pd) return html``;

    return html`
      ${buttonsStyles} ${modalStyles}

      <paper-dialog id="dialog" modal ?opened="${this.opened}">
        <div class="header layout horizontal justified">
          <h2>${this.pd.title}</h2>
          <paper-icon-button class="self-center" @click="${this.close}" icon="icons:close"> </paper-icon-button>
        </div>

        <paper-dialog-scrollable>
          <h3>${translate('PARTNERSHIP_INFO')}</h3>
          <ul class="app-grid">
            <li class="item item-2-col">
              <labelled-item label="${translate('AGREEMENT')}">
                <span class="field-value">${this._withDefault(this.pd.agreement)}</span>
              </labelled-item>
            </li>
            <li class="item item-2-col">
              <labelled-item label="${translate('DOCUMENT_TYPE')}">
                <span class="field-value">${this._withDefault(this.pd.document_type_display)}</span>
              </labelled-item>
            </li>
            <li class="item item-2-col">
              <labelled-item label="${translate('REFERENCE_NUMBER')}">
                <span class="field-value">${this._withDefault(this.pd.reference_number)}</span>
              </labelled-item>
            </li>
          </ul>

          <labelled-item label="${translate('TITLE')}">
            <span class="field-value">${this._withDefault(this.pd.title)}</span>
          </labelled-item>

          <br />

          <ul class="app-grid">
            <li class="item item-2-col">
              <labelled-item label="${translate('UNICEF_OFFICES')}">
                <span class="field-value">${this._withDefault(this.pd.unicef_office)}</span>
              </labelled-item>
            </li>
            <li class="item item-2-col">
              <labelled-item label="${translate('UNICEF_POINTS')}">
                <span class="field-value">${this._formatFocalPoint(this.pd.unicef_focal_point)}</span>
              </labelled-item>
            </li>
            <li class="item item-2-col">
              <labelled-item label="${translate('PARTNER_POINTS')}">
                <span class="field-value">${this._formatFocalPoint(this.pd.partner_focal_point)}</span>
              </labelled-item>
            </li>
          </ul>

          <h3>${translate('PD_SSFA_DETAILS')}</h3>
          <ul class="app-grid">
            <li class="item">
              <labelled-item label="In response to an HRP">
                -
                <!-- TODO -->
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="${translate('START_DATE')}">
                <span class="field-value">${this._withDefault(this.pd.start_date)}</span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="${translate('END_DATE')}">
                <span class="field-value">${this._withDefault(this.pd.end_date)}</span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="${translate('CSO_CONTRIBUTION')}]">
                <span class="field-value">
                  <etools-prp-currency
                    value="${this.pd.cso_contribution}"
                    currency="${this.pd.cso_contribution_currency}"
                  >
                  </etools-prp-currency>
                </span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="${translate('TOTAL_UNICEF_CASH')}">
                <span class="field-value">
                  <etools-prp-currency
                    value="${this.pd.total_unicef_cash}"
                    currency="${this.pd.total_unicef_cash_currency}"
                  >
                  </etools-prp-currency>
                </span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="${translate('TOTAL_UNICEF_SUPPLIES')}">
                <span class="field-value">
                  <etools-prp-currency
                    value="${this.pd.total_unicef_supplies}"
                    currency="${this.pd.total_unicef_supplies_currency}"
                  >
                  </etools-prp-currency>
                </span>
              </labelled-item>
            </li>
            <li class="item item-2-col">
              <labelled-item label="${translate('TOTAL_BUDGET')}">
                <span class="field-value">
                  <etools-prp-currency value="${this.pd.budget}" currency="${this.pd.budget_currency}">
                  </etools-prp-currency>
                </span>
              </labelled-item>
            </li>
            <li class="item item-2-col">
              <labelled-item label="${translate('DISBURSEMENTS')}">
                <span class="field-value">${this.pd.funds_received_to_date} ${this.pd.cso_contribution_currency}</span>
                <etools-prp-progress-bar .number="${this._computeFunds(this.pd.funds_received_to_date_percentage)}">
                </etools-prp-progress-bar>
              </labelled-item>
            </li>
          </ul>
          <labelled-item label="${translate('LOCATIONS')}">
            <span class="field-value">${this._commaSeparatedDictValues(this.pd.locations, 'name')}</span>
          </labelled-item>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button dialog-dismiss>${translate('CANCEL')}</paper-button>
        </div>
      </paper-dialog>
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
    return this._withDefault(this._commaSeparatedDictValues(items, 'name'), null);
  }
}

export {PdModal as PdModalEl};
