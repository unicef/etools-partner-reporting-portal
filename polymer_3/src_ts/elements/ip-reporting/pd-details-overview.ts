import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {property} from '@polymer/decorators';
import {html} from '@polymer/polymer';
import '@polymer/iron-icons/communication-icons';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-icon/iron-icon';

import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-data-table/etools-data-table';

import './pd-details-reporting-requirements';
import './pd-details-doc-download';

import '../page-body';
import '../list-placeholder';
import '../../settings';
import {tableStyles} from '../../styles/table-styles';
import {pdFetch} from '../../redux/actions/pd';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';


import '../../elements/labelled-item';
import '../../elements/etools-prp-currency';
import '../../elements/etools-prp-progress-bar';
import {GenericObject} from '../../typings/globals.types';
import Endpoints from '../../endpoints';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import Settings from '../../settings';
declare const moment: any;
import {currentProgrammeDocument} from '../../redux/selectors/programmeDocuments';
import {computeLoaded, hasAmendments, computeReportingRequirements} from './js/pd-details-overview-functions';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdDetailsOverview extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
  //not sure about data table styles....
  static get template() {
    return html`
    ${tableStyles}
    <style include="app-grid-style data-table-styles">
      :host {
        display: block;
        margin-bottom: 25px;

        --app-grid-columns: 6;
        --app-grid-gutter: 25px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 2;

        --header-title: {
          display: none;
        };

        --data-table-header: {
          height: auto;
        };
      }

      :host etools-content-panel {
        margin-bottom:25px;
      }

      .app-grid {
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .item-2-col {
        @apply --app-grid-expandible-item;
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

      .amendments {
        --ecp-content: {
          padding: 0;
        };
      }

      .reporting-requirements {
        --ecp-content: {
          padding-left: 0;
          padding-right: 0;
        };
      }

      pd-details-reporting-requirements:not(:last-of-type) {
        margin-bottom: 50px;
      }
    </style>

    <etools-prp-ajax
        id="programmeDocuments"
        url="[[programmeDocumentsUrl]]">
    </etools-prp-ajax>

    <page-body>
      <etools-content-panel panel-title="[[localize('partnership_info')]]">
        <etools-loading active="[[!loaded]]"></etools-loading>
        <ul class="app-grid">
          <li class="item item-2-col">
            <labelled-item label="[[localize('agreement')]]">
              <span class="field-value">[[_withDefault(pd.agreement)]]</span>
            </labelled-item>
          </li>
          <li class="item item-2-col">
            <labelled-item label="[[localize('document_type')]]">
              <span class="field-value">[[_withDefault(pd.document_type_display)]]</span>
            </labelled-item>
          </li>
          <li class="item item-2-col">
            <labelled-item label="[[localize('reference_number')]]">
              <span class="field-value">[[_withDefault(pd.reference_number)]]</span>
            </labelled-item>
          </li>
        </ul>

        <labelled-item label="[[localize('title')]]">
          <span class="field-value">[[_withDefault(pd.title)]]</span>
        </labelled-item>

        <br />

        <ul class="app-grid">
          <li class="item item-2-col">
            <labelled-item label="[[localize('unicef_offices')]]">
              <span class="field-value">[[_withDefault(pd.unicef_office)]]</span>
            </labelled-item>
          </li>
          <li class="item item-2-col">
            <labelled-item label="[[localize('unicef_points')]]">
              <span class="field-value">[[_formatFocalPoint(pd.unicef_focal_point)]]</span>
            </labelled-item>
          </li>
          <li class="item item-2-col">
            <labelled-item label="[[localize('partner_points')]]">
              <span class="field-value">[[_formatFocalPoint(pd.partner_focal_point)]]</span>
            </labelled-item>
          </li>
        </ul>
      </etools-content-panel>

      <etools-content-panel panel-title="[[localize('pd_ssfa_details')]]">
        <etools-loading active="[[!loaded]]"></etools-loading>
        <ul class="app-grid">
          <li class="item">
            <labelled-item label="[[localize('pd_ssfa_document')]]">
              <pd-details-doc-download></pd-details-doc-download>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('start_date')]]">
              <span class="field-value">[[_withDefault(pd.start_date)]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('end_date')]]">
              <span class="field-value">[[_withDefault(pd.end_date)]]</span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('cso_contribution')]]">
              <span class="field-value">
                <etools-prp-currency
                    value="[[pd.cso_contribution]]"
                    currency="[[pd.cso_contribution_currency]]">
                </etools-prp-currency>
              </span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('total_unicef_cash')]]">
              <span class="field-value">
                <etools-prp-currency
                    value="[[pd.total_unicef_cash]]"
                    currency="[[pd.total_unicef_cash_currency]]">
                </etools-prp-currency>
              </span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('total_unicef_supplies')]]">
              <span class="field-value">
                <etools-prp-currency
                    value="[[pd.total_unicef_supplies]]"
                    currency="[[pd.total_unicef_supplies_currency]]">
                </etools-prp-currency>
              </span>
            </labelled-item>
          </li>
          <li class="item">
            <labelled-item label="[[localize('total_budget')]]">
              <span class="field-value">
                <etools-prp-currency
                    value="[[pd.budget]]"
                    currency="[[pd.budget_currency]]">
                </etools-prp-currency>
              </span>
            </labelled-item>
          </li>
          <li class="item item-2-col">
            <labelled-item label="[[localize('disbursements')]]">
              <span class="field-value">[[pd.funds_received_to_date]] [[pd.cso_contribution_currency]]</span>
              <etools-prp-progress-bar
                number="[[_computeFunds(pd.funds_received_to_date_percentage)]]">
              </etools-prp-progress-bar>
            </labelled-item>
          </li>
        </ul>
        <labelled-item label="[[localize('locations')]]">
          <span class="field-value">[[_commaSeparatedDictValues(pd.locations, 'title')]]</span>
        </labelled-item>
      </etools-content-panel>

      <template
          is="dom-if"
          if="[[_hasAmendments(pd)]]"
          restamp="true">
        <etools-content-panel panel-title="[[localize('amendments')]]" class="amendments">
          <etools-loading active="[[!loaded]]"></etools-loading>

          <etools-data-table-header no-collapse no-title>
            <etools-data-table-column field="">
              [[localize('amendment_types')]]
            </etools-data-table-column>
            <etools-data-table-column field="">
              [[localize('signed_date')]]
            </etools-data-table-column>
          </etools-data-table-header>

          <template
              id="list"
              is="dom-repeat"
              items="[[pd.amendments]]"
              as="amendment">
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="table-cell">
                  [[_displayFullName(amendment.types)]]
                </div>
                <div class="table-cell">
                  [[amendment.signed_date]]
                </div>
              </div>
            </etools-data-table-row>
          </template>
        </etools-content-panel>
      </template>

      <etools-content-panel panel-title="[[localize('reporting_requirements')]]" class="reporting-requirements">
        <etools-loading active="[[!loaded]]"></etools-loading>
          <pd-details-reporting-requirements
              title="[[localize('qpr_short')]]"
              data="[[reportingRequirements.qpr]]"
              loading="[[!loaded]]">
          </pd-details-reporting-requirements>

          <pd-details-reporting-requirements
              title="[[localize('hr_short')]]"
              data="[[reportingRequirements.hr]]"
              loading="[[!loaded]]">
          </pd-details-reporting-requirements>

          <pd-details-reporting-requirements
              title="[[localize('sr_short')]]"
              data="[[reportingRequirements.sr]]"
              loading="[[!loaded]]">
          </pd-details-reporting-requirements>
        </template>
      </etools-content-panel>
    </page-body>
  `;
  }

  @property({type: Object, computed: 'currentProgrammeDocument(rootState)'})
  pd = {};

  @property({type: Object})
  amendmentTypes: GenericObject = {
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

  @property({type: Boolean, computed: '_computeLoaded(pd)'})
  loaded = false;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: Object, computed: '_computeReportingRequirements(pd.reporting_periods)'})
  reportingRequirements!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)'})
  pdId!: string;

  @property({type: String, computed: '_computeProgrammeDocumentsUrl(locationId)'})
  programmeDocumentsUrl!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.programmeDocumentReports.countByPD)'})
  pdReportsCount!: GenericObject;

  private _debouncer!: Debouncer;

  _computeFunds(num: number) {
    if (num === null || num === -1) {
      return 'N/A';
    } else {
      return num / 100;
    }
  }

  _computeLoaded(pd: GenericObject) {
    return computeLoaded(pd);
  }

  _formatFocalPoint(items: any) {
    return this._withDefault(this._commaSeparatedDictValues(items, 'name'));
  }

  _hasAmendments(pd: GenericObject) {
    return hasAmendments(pd);
  }

  _computeReportingRequirements(reportingPeriods: any) {
    return computeReportingRequirements(reportingPeriods, moment, Settings.dateFormat);
  }

  _computeProgrammeDocumentsUrl(locationId: string) {
    return locationId ? Endpoints.programmeDocuments(locationId) : '';
  }

  _displayFullName(types: any[]) {
    const self = this;

    if (!types) {
      return '';
    }

    return types
      .map(function(type: string) {
        return self.amendmentTypes[type] ? self.amendmentTypes[type] : type;
      })
      .join(', ');
  }

  _getPdReports() {
    // Status being present prevents Redux / res.data from getting reports,
    // preventing pd-details title from rendering. In that case (which we
    // check by seeing if this.pdReportsCount is present), just get the reports again
    if (this.pdReportsCount[this.pdId] === undefined) {
      const self = this;
      this._debouncer = Debouncer.debounce(this._debouncer,
        timeOut.after(250),
        () => {
          const pdThunk = this.$.programmeDocuments as EtoolsPrpAjaxEl;
          pdThunk.params = {
            page: 1,
            page_size: 10,
            programme_document: this.pdId
          };

          // Cancel the pending request, if any
          (this.$.programmeDocuments as EtoolsPrpAjaxEl).abort();
          //@Lajos not sure if connect function
          self.reduxStore.dispatch(pdFetch(pdThunk.thunk()))
            .catch(function(err) { // jshint ignore:line
              // TODO: error handling
            });
        });
    }
  }

}

window.customElements.define('pd-details-overview', PdDetailsOverview);
