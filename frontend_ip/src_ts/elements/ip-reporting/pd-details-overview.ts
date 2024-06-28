import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {currentProgrammeDocument} from '../../etools-prp-common/redux/selectors/programmeDocuments';
import {computeLoaded, hasAmendments, computeReportingRequirements} from './js/pd-details-overview-functions';
import {RootState} from '../../typings/redux.types';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';

import '@polymer/iron-icons/communication-icons';
import '@polymer/iron-icon/iron-icon';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import './pd-details-reporting-requirements';
import './pd-details-doc-download';
import '../../etools-prp-common/elements/page-body';
import '../../etools-prp-common/elements/list-placeholder';
import '../../etools-prp-common/elements/labelled-item';
import '../../elements/etools-prp-currency';
import '../../etools-prp-common/elements/etools-prp-progress-bar';
import Settings from '../../etools-prp-common/settings';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';

@customElement('pd-details-overview')
export class PdDetailsOverview extends UtilsMixin(LocalizeMixin(connect(store)(LitElement))) {
  @property({type: Object})
  pd: any = {};

  @property({type: Object})
  amendmentTypes: any = {
    dates: 'Dates',
    results: 'Results',
    budget: 'Budget',
    admin_error: 'Type 1: Administrative error (correction)',
    budget_lte_20: 'Type 2: Budget <= 20%',
    budget_gt_20: 'Type 3: Budget > 20%',
    change: 'Type 4: Changes to planned results',
    no_cost: 'Type 5: No cost extension',
    other: 'Type 6: Other'
  };

  @property({type: Boolean})
  loaded = false;

  @property({type: Object})
  reportingRequirements: any = {};

  static styles = [
    css`
      :host {
        display: block;
        margin-bottom: 25px;

        --app-grid-columns: 6;
        --app-grid-gutter: 25px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 2;

        --header-title: {
          display: none;
        }

        --data-table-header: {
          height: auto;
        }
      }

      :host etools-content-panel {
        margin-bottom: 25px;
      }

      .app-grid {
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .item-2-col {
        grid-column: span var(--app-grid-expandible-item-columns);
      }

      .field-value {
        display: block;
        word-wrap: break-word;
      }

      .field-value[has-icon] {
        position: relative;
        padding-left: 2em;
      }

      .field-value iron-icon {
        position: absolute;
        left: 0;
        top: 0;
        color: var(--paper-grey-600);
      }

      etools-content-panel.amendments::part(ecp-content) {
        padding: 0px;
      }

      etools-content-panel.reporting-requirements::part(ecp-content) {
        padding: 0px;
      }

      pd-details-reporting-requirements:not(:last-of-type) {
        margin-bottom: 50px;
      }
    `
  ];

  render() {
    return html`
      ${tableStyles}
      <page-body>
        <etools-content-panel panel-title="${this.localize('partnership_info')}">
          <etools-loading ?active="${!this.loaded}"></etools-loading>
          <ul class="app-grid">
            <li class="item item-2-col">
              <labelled-item label="${this.localize('agreement')}">
                <span class="field-value">${this._withDefault(this.pd.agreement)}</span>
              </labelled-item>
            </li>
            <li class="item item-2-col">
              <labelled-item label="${this.localize('document_type')}">
                <span class="field-value">${this._withDefault(this.pd.document_type_display)}</span>
              </labelled-item>
            </li>
            <li class="item item-2-col">
              <labelled-item label="${this.localize('reference_number')}">
                <span class="field-value">${this._withDefault(this.pd.reference_number)}</span>
              </labelled-item>
            </li>
          </ul>

          <labelled-item label="${this.localize('title')}">
            <span class="field-value">${this._withDefault(this.pd.title)}</span>
          </labelled-item>

          <br />

          <ul class="app-grid">
            <li class="item item-2-col">
              <labelled-item label="${this.localize('unicef_offices')}">
                <span class="field-value">${this._withDefault(this.pd.unicef_office)}</span>
              </labelled-item>
            </li>
            <li class="item item-2-col">
              <labelled-item label="${this.localize('unicef_points')}">
                <span class="field-value">${this._formatFocalPoint(this.pd.unicef_focal_point)}</span>
              </labelled-item>
            </li>
            <li class="item item-2-col">
              <labelled-item label="${this.localize('partner_points')}">
                <span class="field-value">${this._formatFocalPoint(this.pd.partner_focal_point)}</span>
              </labelled-item>
            </li>
          </ul>
        </etools-content-panel>

        <etools-content-panel panel-title="${this.localize('pd_ssfa_details')}">
          <etools-loading ?active="${!this.loaded}"></etools-loading>
          <ul class="app-grid">
            <li class="item">
              <labelled-item label="${this.localize('pd_ssfa_document')}">
                <pd-details-doc-download></pd-details-doc-download>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="${this.localize('start_date')}">
                <span class="field-value">${this._withDefault(this.pd.start_date)}</span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="${this.localize('end_date')}">
                <span class="field-value">${this._withDefault(this.pd.end_date)}</span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="${this.localize('cso_contribution')}">
                <span class="field-value">
                  <etools-prp-currency
                    value="${this.pd.cso_contribution}"
                    currency="${this.pd.cso_contribution_currency}"
                  ></etools-prp-currency>
                </span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="${this.localize('total_unicef_cash')}">
                <span class="field-value">
                  <etools-prp-currency
                    value="${this.pd.total_unicef_cash}"
                    currency="${this.pd.total_unicef_cash_currency}"
                  ></etools-prp-currency>
                </span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="${this.localize('total_unicef_supplies')}">
                <span class="field-value">
                  <etools-prp-currency
                    value="${this.pd.total_unicef_supplies}"
                    currency="${this.pd.total_unicef_supplies_currency}"
                  ></etools-prp-currency>
                </span>
              </labelled-item>
            </li>
            <li class="item">
              <labelled-item label="${this.localize('total_budget')}">
                <span class="field-value">
                  <etools-prp-currency
                    value="${this.pd.budget}"
                    currency="${this.pd.budget_currency}"
                  ></etools-prp-currency>
                </span>
              </labelled-item>
            </li>
            <li class="item item-2-col">
              <labelled-item label="${this.localize('disbursements')}">
                <span class="field-value">${this.pd.funds_received_to_date} ${this.pd.cso_contribution_currency}</span>
                <etools-prp-progress-bar
                  number="${this._computeFunds(this.pd.funds_received_to_date_percentage)}"
                ></etools-prp-progress-bar>
              </labelled-item>
            </li>
          </ul>
          <labelled-item label="${this.localize('locations')}">
            <span class="field-value">${this._commaSeparatedDictValues(this.pd.locations, 'name')}</span>
          </labelled-item>
        </etools-content-panel>

        ${hasAmendments(this.pd)
          ? html`
              <etools-content-panel panel-title="${this.localize('amendments')}" class="amendments">
                <etools-loading ?active="${!this.loaded}"></etools-loading>

                <etools-data-table-header no-collapse no-title>
                  <etools-data-table-column field=""> ${this.localize('amendment_types')} </etools-data-table-column>
                  <etools-data-table-column field=""> ${this.localize('signed_date')} </etools-data-table-column>
                </etools-data-table-header>

                ${this.pd.amendments.map(
                  (amendment) => html`
                    <etools-data-table-row no-collapse>
                      <div slot="row-data">
                        <div class="table-cell">${this._displayFullName(amendment.types)}</div>
                        <div class="table-cell">${amendment.signed_date}</div>
                      </div>
                    </etools-data-table-row>
                  `
                )}
              </etools-content-panel>
            `
          : ''}

        <etools-content-panel panel-title="${this.localize('reporting_requirements')}" class="reporting-requirements">
          <etools-loading ?active="${!this.loaded}"></etools-loading>

          <pd-details-reporting-requirements
            title="${this.localize('qpr_short')}"
            .data="${this.reportingRequirements.qpr}"
            ?loading="${!this.loaded}"
          >
          </pd-details-reporting-requirements>

          <pd-details-reporting-requirements
            title="${this.localize('hr_short')}"
            .data="${this.reportingRequirements.hr}"
            ?loading="${!this.loaded}"
          >
          </pd-details-reporting-requirements>

          <pd-details-reporting-requirements
            title="${this.localize('sr_short')}"
            .data="${this.reportingRequirements.sr}"
            ?loading="${!this.loaded}"
          >
          </pd-details-reporting-requirements>
        </etools-content-panel>
      </page-body>
    `;
  }

  _stateChanged(state: RootState) {
    this.pd = currentProgrammeDocument(state);
    this.loaded = computeLoaded(this.pd);
  }

  updated(changedProperties) {
    if (changedProperties.has('pd')) {
      this.reportingRequirements = computeReportingRequirements(this.pd, Settings.dateFormat);
    }
  }

  _formatFocalPoint(items: any): string {
    return this._withDefault(this._commaSeparatedDictValues(items, 'name'));
  }

  _displayFullName(types: any[]) {
    if (!types) {
      return '';
    }

    return types
      .map((type: string) => {
        return this.amendmentTypes[type] ? this.amendmentTypes[type] : type;
      })
      .join(', ');
  }

  _computeFunds(num: number) {
    if (num === null || num === -1) {
      return 'N/A';
    } else {
      return num / 100;
    }
  }
}
