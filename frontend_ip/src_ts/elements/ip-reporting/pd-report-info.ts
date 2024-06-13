import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '../../etools-prp-common/elements/labelled-item';
import '../../etools-prp-common/elements/etools-prp-permissions';
import './report-attachments';
import '../../etools-prp-common/elements/filter-list';
import '../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';

import {GenericObject} from '../../etools-prp-common/typings/globals.types';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import {programmeDocumentReportsCurrent} from '../../redux/selectors/programmeDocumentReports';
import {reportInfoCurrent} from '../../redux/selectors/reportInfo';
import {computeMode, computeUpdateUrl} from './js/pd-report-info-functions';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {pdReportsUpdate} from '../../redux/actions/pdReports';
import {RootState} from '../../typings/redux.types';
import {formatServerErrorAsText} from '../../etools-prp-common/utils/error-parser';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdReportInfo extends ProgressReportUtilsMixin(LocalizeMixin(UtilsMixin(ReduxConnectedElement))) {
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
        .face-form-message {
          color: var(--theme-primary-color);
          font-size: 16px;
          font-style: italic;
          margin: 10px 80px 0 0;
        }

        :host etools-content-panel {
          margin-bottom: 25px;
        }

        :host labelled-item paper-radio-group paper-radio-button:first-child {
          padding-left: 0;
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
                  value="{{localData.partner_contribution_to_date}}"
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
                  value="{{localData.financial_contribution_to_date}}"
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
                  selected="{{localData.financial_contribution_currency}}"
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
                  value="{{localData.challenges_in_the_reporting_period}}"
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
                  value="{{localData.proposed_way_forward}}"
                  no-label-float
                  char-counter
                  maxlength="2000"
                >
                </paper-input>

                <template is="dom-if" if="[[showFaceMessage]]">
                  <div class="face-form-message">[[localize('face_form_submitted')]]</div>
                </template>
              </template>
            </labelled-item>
          </div>

          <template is="dom-if" if="[[_isFinalReport(currentReport)]]" restamp="true">
            <div class="row">
              <labelled-item label="[[localize('release_cash_in_time')]]">
                <paper-radio-group selected="{{localData.final_review.release_cash_in_time_choice}}">
                  <paper-radio-button name="yes" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('yes')]]
                  </paper-radio-button>

                  <paper-radio-button name="no" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('no')]]
                  </paper-radio-button>
                </paper-radio-group>

                <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                  <div class="value">[[_withDefault(data.final_review.release_cash_in_time_comment)]]</div>
                </template>

                <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                  <paper-input
                    id="release_cash_in_time_comment"
                    value="{{localData.final_review.release_cash_in_time_comment}}"
                    no-label-float
                    placeholder="[[localize('comments')]]"
                    char-counter
                    maxlength="2000"
                  >
                  </paper-input>
                </template>
              </labelled-item>
            </div>

            <div class="row">
              <labelled-item label="[[localize('release_supplies_in_time')]]">
                <paper-radio-group selected="{{localData.final_review.release_supplies_in_time_choice}}">
                  <paper-radio-button name="yes" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('yes')]]
                  </paper-radio-button>

                  <paper-radio-button name="no" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('no')]]
                  </paper-radio-button>
                </paper-radio-group>

                <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                  <div class="value">[[_withDefault(data.final_review.release_supplies_in_time_comment)]]</div>
                </template>

                <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                  <paper-input
                    id="release_supplies_in_time_comment"
                    value="{{localData.final_review.release_supplies_in_time_comment}}"
                    no-label-float
                    placeholder="[[localize('comments')]]"
                    char-counter
                    maxlength="2000"
                  >
                  </paper-input>
                </template>
              </labelled-item>
            </div>

            <div class="row">
              <labelled-item label="[[localize('feedback_face_form_in_time')]]">
                <paper-radio-group selected="{{localData.final_review.feedback_face_form_in_time_choice}}">
                  <paper-radio-button name="yes" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('yes')]]
                  </paper-radio-button>

                  <paper-radio-button name="no" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('no')]]
                  </paper-radio-button>
                </paper-radio-group>

                <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                  <div class="value">[[_withDefault(data.final_review.feedback_face_form_in_time_comment)]]</div>
                </template>

                <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                  <paper-input
                    id="feedback_face_form_in_time_comment"
                    value="{{localData.final_review.feedback_face_form_in_time_comment}}"
                    no-label-float
                    placeholder="[[localize('comments')]]"
                    char-counter
                    maxlength="2000"
                  >
                  </paper-input>
                </template>
              </labelled-item>
            </div>

            <div class="row">
              <labelled-item label="[[localize('respond_requests_in_time')]]">
                <paper-radio-group selected="{{localData.final_review.respond_requests_in_time_choice}}">
                  <paper-radio-button name="yes" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('yes')]]
                  </paper-radio-button>

                  <paper-radio-button name="no" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('no')]]
                  </paper-radio-button>
                </paper-radio-group>

                <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                  <div class="value">[[_withDefault(data.final_review.respond_requests_in_time_comment)]]</div>
                </template>

                <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                  <paper-input
                    id="respond_requests_in_time_comment"
                    value="{{localData.final_review.respond_requests_in_time_comment}}"
                    no-label-float
                    placeholder="[[localize('comments')]]"
                    char-counter
                    maxlength="2000"
                  >
                  </paper-input>
                </template>
              </labelled-item>
            </div>

            <div class="row">
              <labelled-item label="[[localize('implemented_as_planned')]]">
                <paper-radio-group selected="{{localData.final_review.implemented_as_planned_choice}}">
                  <paper-radio-button name="yes" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('yes')]]
                  </paper-radio-button>

                  <paper-radio-button name="no" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('no')]]
                  </paper-radio-button>
                </paper-radio-group>

                <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                  <div class="value">[[_withDefault(data.final_review.implemented_as_planned_comment)]]</div>
                </template>

                <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                  <paper-input
                    id="implemented_as_planned_comment"
                    value="{{localData.final_review.implemented_as_planned_comment}}"
                    no-label-float
                    placeholder="[[localize('comments')]]"
                    char-counter
                    maxlength="2000"
                  >
                  </paper-input>
                </template>
              </labelled-item>
            </div>

            <div class="row">
              <labelled-item label="[[localize('action_to_address')]]">
                <paper-radio-group selected="{{localData.final_review.action_to_address_choice}}">
                  <paper-radio-button name="yes" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('yes')]]
                  </paper-radio-button>

                  <paper-radio-button name="no" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('no')]]
                  </paper-radio-button>
                </paper-radio-group>

                <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                  <div class="value">[[_withDefault(data.final_review.action_to_address_comment)]]</div>
                </template>

                <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                  <paper-input
                    id="action_to_address_comment"
                    value="{{localData.final_review.action_to_address_comment}}"
                    no-label-float
                    placeholder="[[localize('comments')]]"
                    char-counter
                    maxlength="2000"
                  >
                  </paper-input>
                </template>
              </labelled-item>
            </div>

            <div class="row">
              <labelled-item label="[[localize('overall_satisfaction')]]">
                <paper-radio-group selected="{{localData.final_review.overall_satisfaction_choice}}">
                  <paper-radio-button name="very_unsatisfied" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('very_unsatisfied')]]
                  </paper-radio-button>
                  <paper-radio-button name="unsatisfied" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('unsatisfied')]]
                  </paper-radio-button>
                  <paper-radio-button name="neutral" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('neutral')]]
                  </paper-radio-button>
                  <paper-radio-button name="satisfied" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('satisfied')]]
                  </paper-radio-button>
                  <paper-radio-button name="very_satisfied" disabled$="[[_equals(computedMode, 'view')]]">
                    [[localize('very_satisfied')]]
                  </paper-radio-button>
                </paper-radio-group>

                <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                  <div class="value">[[_withDefault(data.final_review.overall_satisfaction_comment)]]</div>
                </template>

                <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                  <paper-input
                    id="overall_satisfaction_comment"
                    value="{{localData.final_review.overall_satisfaction_comment}}"
                    no-label-float
                    placeholder="[[localize('comments')]]"
                    char-counter
                    maxlength="2000"
                  >
                  </paper-input>
                </template>
              </labelled-item>
            </div>
          </template>
          <div class="toggle-button-container row">
            <template is="dom-if" if="[[!_equals(computedMode, 'view')]]">
              <paper-button class="btn-primary" id="toggle-button" on-tap="_handleInput" raised>
                [[localize('save')]]
              </paper-button>
            </template>
          </div>

          <div class="row">
            <report-attachments readonly="[[_equals(computedMode, 'view')]]"></report-attachments>
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

  @property({type: Boolean})
  showFaceMessage!: boolean;

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

  _reportInfoCurrent(rootState: RootState) {
    const data = reportInfoCurrent(rootState);

    if (!data.final_review) {
      data.final_review = {};
    } else {
      Object.keys(data.final_review).forEach((key) => {
        data.final_review[key] =
          data.final_review[key] === true ? 'yes' : data.final_review[key] === false ? 'no' : data.final_review[key];
      });
    }

    if (data.id === this.localData.id) {
      return data;
    }

    this.set('localData', {...data});
    return data;
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
    this._updateData();
  }

  _updateData() {
    this.updateDebouncer = Debouncer.debounce(this.updateDebouncer, timeOut.after(250), () => {
      const updateThunk = (this.$.update as EtoolsPrpAjaxEl).thunk();

      (this.$.update as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(pdReportsUpdate(updateThunk, this.pdId, this.reportId))
        // @ts-ignore
        .then(() => {
          fireEvent(this, 'toast', {
            text: this.localize('changes_saved'),
            showCloseBtn: true
          });
        })
        // @ts-ignore
        .catch((err) => {
          fireEvent(this, 'toast', {
            text: formatServerErrorAsText(err, this.localize('an_error_occurred')),
            showCloseBtn: true
          });
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
    this.addEventListener('attachments-loaded', this.attachmentsLoaded as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('error', this.attachmentsLoaded as any);
    if (this.updateDebouncer && this.updateDebouncer.isActive()) {
      this.updateDebouncer.cancel();
    }
  }

  attachmentsLoaded(e: CustomEvent) {
    this.set('showFaceMessage', !e.detail.hasFaceAttachment);
  }
}

window.customElements.define('pd-report-info', PdReportInfo);

export {PdReportInfo as PdReportInfoEl};
