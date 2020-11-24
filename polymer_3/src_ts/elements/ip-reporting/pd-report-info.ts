import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '../labelled-item';
import '../etools-prp-permissions';
import './report-attachments';
import '../../elements/filter-list';
import '../../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../elements/etools-prp-ajax';

import {GenericObject} from '../../typings/globals.types';
import UtilsMixin from '../../mixins/utils-mixin';
import NotificationsMixin from '../../mixins/notifications-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {programmeDocumentReportsCurrent} from '../../redux/selectors/programmeDocumentReports';
import {reportInfoCurrent} from '../../redux/selectors/reportInfo';
import {computeMode, computeUpdateUrl} from './js/pd-report-info-functions';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {pdReportsUpdate} from '../../redux/actions/pdReports';
import {RootState} from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdReportInfo extends LocalizeMixin(NotificationsMixin(UtilsMixin(ReduxConnectedElement))) {
  public static get template() {
    return html`
      <style include="app-grid-style">
        :host {
          display: block;
          margin-bottom: 25px;

          --app-grid-columns: 8;
          --app-grid-gutter: 25px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 7;
        }

        .app-grid {
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .toggle-button-container {
          max-width: calc((100% - 0.1px) / 8 * 7 - 25px);

          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        #toggle-button {
          background-color: #0099ff;
          color: #fff;
          font-size: 14px;
        }

        .row {
          @apply --app-grid-expandible-item;
        }

        .value {
          font-size: 16px;
        }

        .currency-row {
          display: flex;
          align-items: flex-end;
          margin-bottom: 10px;
          margin-top: -20px;
          flex-wrap: wrap;
        }
        .currency-ammount {
          width: 242px;
          margin-right: 40px;
          margin-top: 20px;
        }
        .item-label {
          font-size: 12px;
          color: #737373;
          display: block;
          @apply --truncate;
          margin-bottom: 0px;
        }
        etools-dropdown {
          --app-grid-gutter: 0px;
        }

        etools-dropdown[readonly],
        etools-currency-amount-input[readonly] {
          --paper-input-container-underline: {
            display: none;
          }
          --paper-input-container-underline-focus: {
            display: none;
          }
          --paper-input-container-underline-disabled: {
            display: none;
          }
        }
      </style>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <etools-prp-ajax
        id="update"
        url="[[updateUrl]]"
        body="[[localData]]"
        content-type="application/json"
        method="put"
      >
      </etools-prp-ajax>

      <etools-content-panel panel-title="Other info" no-header="[[noHeader]]">
        <div class="app-grid">
          <div class="row">
            <labelled-item label="[[localize('non_financial_contribution_during_reporting_period')]]">
              <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                <span class="value">[[_withDefault(data.partner_contribution_to_date)]]</span>
              </template>

              <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                <paper-input
                  id="partner_contribution_to_date"
                  value="[[data.partner_contribution_to_date]]"
                  no-label-float
                  char-counter
                  maxlength="2000"
                >
                </paper-input>
              </template>
            </labelled-item>
          </div>

          <div class="row">
            <span class="item-label">[[localize('financial_contribution_during_reporting_period')]]</span>
            <div class="currency-row">
              <div class="currency-ammount">
                <etools-currency-amount-input
                  id="financial_contribution_to_date"
                  class="w100"
                  type="number"
                  value="{{data.financial_contribution_to_date}}"
                  placeholder="&#8212;"
                  readonly="[[_equals(computedMode, 'view')]]"
                  no-label-float
                >
                </etools-currency-amount-input>
              </div>
              <div class="currency">
                <etools-dropdown
                  id="financial_contribution_currency"
                  class="item validate full-width"
                  options="[[currencies]]"
                  option-value="value"
                  option-label="label"
                  selected="[[data.financial_contribution_currency]]"
                  readonly="[[_equals(computedMode, 'view')]]"
                  required="[[_hasCurrencyAmmount(data.financial_contribution_to_date)]]"
                  no-dynamic-align
                >
                </etools-dropdown>
              </div>
            </div>
          </div>

          <div class="row">
            <labelled-item label="[[localize('challenges_bottlenecks')]]">
              <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                <span class="value">[[_withDefault(data.challenges_in_the_reporting_period)]]</span>
              </template>

              <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                <paper-input
                  id="challenges_in_the_reporting_period"
                  value="[[data.challenges_in_the_reporting_period]]"
                  no-label-float
                  char-counter
                  maxlength="2000"
                >
                </paper-input>
              </template>
            </labelled-item>
          </div>

          <div class="row">
            <labelled-item label="[[localize('proposed_way_forward')]]">
              <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                <span class="value">[[_withDefault(data.proposed_way_forward)]]</span>
              </template>

              <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                <paper-input
                  id="proposed_way_forward"
                  value="[[data.proposed_way_forward]]"
                  no-label-float
                  char-counter
                  maxlength="2000"
                >
                </paper-input>
              </template>
            </labelled-item>
          </div>

          <div class="toggle-button-container row">
            <template is="dom-if" if="[[!_equals(computedMode, 'view')]]">
              <paper-button class="btn-primary" id="toggle-button" on-tap="_handleInput" raised>
                [[localize('save')]]
              </paper-button>
            </template>
          </div>

          <div class="row">
            <report-attachments readonly="[[_equals(computedMode, 'view')]]"> </report-attachments>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  localData!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Boolean})
  noHeader!: boolean;

  @property({type: Object, computed: '_reportInfoCurrent(rootState)'})
  data!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)'})
  pdId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  reportId!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.currencies)'})
  currencies!: any[];

  @property({type: String, computed: '_computeUpdateUrl(locationId, reportId)'})
  updateUrl!: string;

  @property({type: String})
  overrideMode = '';

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.mode)'})
  mode!: string;

  @property({type: String, computed: '_computeMode(mode, overrideMode, currentReport, permissions)'})
  computedMode!: string;

  @property({type: Object, computed: '_programmeDocumentReportsCurrent(rootState)'})
  currentReport!: GenericObject;

  updateDebouncer!: Debouncer | null;

  public static get observers() {
    return ['_updateData(localData.*)'];
  }

  _reportInfoCurrent(rootState: RootState) {
    return reportInfoCurrent(rootState);
  }

  _programmeDocumentReportsCurrent(rootState: RootState) {
    return programmeDocumentReportsCurrent(rootState);
  }

  _hasCurrencyAmmount(currencyAmmount: number) {
    return currencyAmmount && currencyAmmount > 0;
  }

  _handleInput() {
    if (!this._fieldsAreValid()) {
      return;
    }

    const textInputs = this.shadowRoot!.querySelectorAll('paper-input, etools-currency-amount-input');
    const dropDowns = this.shadowRoot!.querySelectorAll('etools-dropdown');

    textInputs.forEach((input: any) => {
      if (input.value && String(input.value).trim()) {
        this.set(['localData', input.id], String(input.value).trim());
      }
    });
    dropDowns.forEach((dropDown: any) => {
      if (dropDown.selectedItem && dropDown.selectedItem[dropDown.optionValue]) {
        this.set(['localData', dropDown.id], dropDown.selectedItem[dropDown.optionValue]);
      }
    });
  }

  _updateData(change: GenericObject) {
    if (change.path.split('.').length < 2) {
      // Skip the initial assignment
      return;
    }

    this.updateDebouncer = Debouncer.debounce(this.updateDebouncer, timeOut.after(250), () => {
      const updateThunk = (this.$.update as EtoolsPrpAjaxEl).thunk();

      (this.$.update as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(pdReportsUpdate(updateThunk, this.pdId, this.reportId))
        // @ts-ignore
        .then(() => {
          this._notifyChangesSaved();
        })
        // @ts-ignore
        .catch((err) => {
          this._notifyErrorMessage({text: this.localize('an_error_occurred')});
          console.log(err);
        });
    });
  }

  _computeUpdateUrl(locationId: string, reportId: string) {
    return computeUpdateUrl(locationId, reportId);
  }

  _computeMode(mode: string, overrideMode: string, report: any, permissions: GenericObject) {
    return computeMode(mode, overrideMode, report, permissions);
  }

  connectedCallback() {
    super.connectedCallback();

    this.set('localData', {});
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.updateDebouncer && this.updateDebouncer.isActive()) {
      this.updateDebouncer.cancel();
    }
  }
}

window.customElements.define('pd-report-info', PdReportInfo);

export {PdReportInfo as PdReportInfoEl};
