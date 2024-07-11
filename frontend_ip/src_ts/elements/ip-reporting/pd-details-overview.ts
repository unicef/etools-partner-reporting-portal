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
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
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
import { isJsonStrMatch } from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

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

  static styles = [layoutStyles,
    css`     
      :host {
        display: block;
        margin-bottom: 25px;

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
      page-body > * {
        display: block;
        margin-bottom: 25px;
      }
      pd-details-reporting-requirements:not(:last-of-type) {
        margin-bottom: 50px;
      }
    `
  ];

  render() {
    return html`
      ${tableStyles}
      <style>${dataTableStylesLit}</style>
      <page-body>
        <etools-content-panel panel-title="${this.localize('partnership_info')}">
          <etools-loading ?active="${!this.loaded}"></etools-loading>
          <div class="row padding-v">
            <div class="item col-4">
              <labelled-item label="${this.localize('agreement')}">
                <span class="field-value">${this._withDefault(this.pd.agreement)}</span>
              </labelled-item>
            </div>
            <div class="item col-4">
              <labelled-item label="${this.localize('document_type')}">
                <span class="field-value">${this._withDefault(this.pd.document_type_display)}</span>
              </labelled-item>
            </div>
            <div class="item col-4">
              <labelled-item label="${this.localize('reference_number')}">
                <span class="field-value">${this._withDefault(this.pd.reference_number)}</span>
              </labelled-item>
            </div>
          </div>
          <div  class="row padding-v">
            <div class="item col-12">
              <labelled-item label="${this.localize('title')}">
                <span class="field-value">${this._withDefault(this.pd.title)}</span>
              </labelled-item>
            </div>
          </div>
          <div class="row padding-v">
            <div class="item col-4">
              <labelled-item label="${this.localize('unicef_offices')}">
                <span class="field-value">${this._withDefault(this.pd.unicef_office)}</span>
              </labelled-item>
            </div>
            <div class="item col-4">
              <labelled-item label="${this.localize('unicef_points')}">
                <span class="field-value">${this._formatFocalPoint(this.pd.unicef_focal_point)}</span>
              </labelled-item>
            </div>
            <div class="item col-4">
              <labelled-item label="${this.localize('partner_points')}">
                <span class="field-value">${this._formatFocalPoint(this.pd.partner_focal_point)}</span>
              </labelled-item>
            </div>
          </div>
                     
        </etools-content-panel>

        <etools-content-panel panel-title="${this.localize('pd_ssfa_details')}">
          <etools-loading ?active="${!this.loaded}"></etools-loading>
         <div class="row padding-v">
            <div class="col-2">
              <labelled-item label="${this.localize('pd_ssfa_document')}">
                <pd-details-doc-download></pd-details-doc-download>
              </labelled-item>
            </div>
             <div class="col-2">
              <labelled-item label="${this.localize('start_date')}">
                <span class="field-value">${this._withDefault(this.pd.start_date)}</span>
              </labelled-item>
            </div>
            <div class="col-2">
              <labelled-item label="${this.localize('end_date')}">
                <span class="field-value">${this._withDefault(this.pd.end_date)}</span>
              </labelled-item>
            </div>
            <div class="col-2">
              <labelled-item label="${this.localize('cso_contribution')}">
                <span class="field-value">
                  <etools-prp-currency
                    value="${this.pd.cso_contribution}"
                    currency="${this.pd.cso_contribution_currency}"
                  ></etools-prp-currency>
                </span>
              </labelled-item>
            </div>
            <div class="col-2">
              <labelled-item label="${this.localize('total_unicef_cash')}">
                <span class="field-value">
                  <etools-prp-currency
                    value="${this.pd.total_unicef_cash}"
                    currency="${this.pd.total_unicef_cash_currency}"
                  ></etools-prp-currency>
                </span>
              </labelled-item>
            </div>
             <div class="col-2">
              <labelled-item label="${this.localize('total_unicef_supplies')}">
                <span class="field-value">
                  <etools-prp-currency
                    value="${this.pd.total_unicef_supplies}"
                    currency="${this.pd.total_unicef_supplies_currency}"
                  ></etools-prp-currency>
                </span>
              </labelled-item>
            </div>
          </div>
          <div class="row padding-v">
           <div class="col-2">
              <labelled-item label="${this.localize('total_budget')}">
                <span class="field-value">
                  <etools-prp-currency
                    value="${this.pd.budget}"
                    currency="${this.pd.budget_currency}"
                  ></etools-prp-currency>
                </span>
              </labelled-item>
            </div>
           <div class="col-10">
              <labelled-item label="${this.localize('disbursements')}">
                <span class="field-value">${this.pd.funds_received_to_date} ${this.pd.cso_contribution_currency}</span>
                <etools-prp-progress-bar
                  .number="${this._computeFunds(this.pd.funds_received_to_date_percentage)}"
                ></etools-prp-progress-bar>
              </labelled-item>
            </div>
          </div>
          <div class="row padding-v">
           <div class="col-12">
            <labelled-item label="${this.localize('locations')}">
              <span class="field-value">${this._commaSeparatedDictValues(this.pd.locations, 'name')}</span>
            </labelled-item>
           </div> 
          </div>
        </etools-content-panel>

        ${hasAmendments(this.pd)
          ? html`
              <etools-content-panel panel-title="${this.localize('amendments')}" class="amendments">
                <etools-loading ?active="${!this.loaded}"></etools-loading>

                <etools-data-table-header no-collapse no-title>
                  <etools-data-table-column class="col-6" field=""> ${this.localize('amendment_types')} </etools-data-table-column>
                  <etools-data-table-column class="col-6" field=""> ${this.localize('signed_date')} </etools-data-table-column>
                </etools-data-table-header>

                ${(this.pd.amendments || []).map(
                  (amendment) => html`
                    <etools-data-table-row no-collapse>
                      <div slot="row-data">
                        <div class="col-data col-6 table-cell">${this._displayFullName(amendment.types)}</div>
                        <div class="col-data col-6 table-cell">${amendment.signed_date}</div>
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
            .data="${this.reportingRequirements?.qpr}"
            ?loading="${!this.loaded}"
          >
          </pd-details-reporting-requirements>

          <pd-details-reporting-requirements
            title="${this.localize('hr_short')}"
            .data="${this.reportingRequirements?.hr}"
            ?loading="${!this.loaded}"
          >
          </pd-details-reporting-requirements>

          <pd-details-reporting-requirements
            title="${this.localize('sr_short')}"
            .data="${this.reportingRequirements?.sr}"
            ?loading="${!this.loaded}"
          >
          </pd-details-reporting-requirements>
        </etools-content-panel>
      </page-body>
    `;
  }

  stateChanged(state: RootState) {
    const pd = currentProgrammeDocument(state);
    if (!isJsonStrMatch(pd, this.pd)) {
      this.pd = pd;
    }
    this.loaded = computeLoaded(this.pd);
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('pd') && this.pd && Object.keys(this.pd).length) {
      this.reportingRequirements = computeReportingRequirements(this.pd.reporting_periods, Settings.dateFormat);
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
