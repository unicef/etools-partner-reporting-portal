import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '../../etools-prp-common/elements/labelled-item';
import '../../etools-prp-common/elements/etools-prp-permissions';
import './report-attachments';
import '../../etools-prp-common/elements/filter-list';
import '../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from 'lit-translate';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import {programmeDocumentReportsCurrent} from '../../redux/selectors/programmeDocumentReports';
import {reportInfoCurrent} from '../../redux/selectors/reportInfo';
import {computeMode, computeUpdateUrl} from './js/pd-report-info-functions';
import {pdReportsUpdate} from '../../redux/actions/pdReports';
import {RootState} from '../../typings/redux.types';
import {formatServerErrorAsText} from '../../etools-prp-common/utils/error-parser';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
@customElement('pd-report-info')
export class PdReportInfo extends ProgressReportUtilsMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = [
    css`
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
    `
  ];

  @property({type: Object})
  localData: any = {};

  @property({type: Object})
  permissions!: any;

  @property({type: Boolean})
  noHeader!: boolean;

  @property({type: Boolean})
  showFaceMessage!: boolean;

  @property({type: Object})
  data: any = {};

  @property({type: String})
  pdId!: string;

  @property({type: String})
  locationId!: string;

  @property({type: String})
  reportId!: string;

  @property({type: Array})
  currencies!: any[];

  @property({type: String})
  updateUrl!: string;

  @property({type: String})
  overrideMode = '';

  @property({type: String})
  mode!: string;

  @property({type: String})
  computedMode!: string;

  @property({type: Object})
  currentReport!: any;

  stateChanged(state: RootState) {
    this.data = this._reportInfoCurrent(state);

    this.currentReport = this._programmeDocumentReportsCurrent(state);

    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }

    if (this.pdId !== state.programmeDocuments.current) {
      this.pdId = state.programmeDocuments.current;
    }

    if (this.reportId !== state.programmeDocumentReports.current.id) {
      this.reportId = state.programmeDocumentReports.current.id;
    }

    if (state.currencies.currenciesData && !isJsonStrMatch(this.currencies, state.currencies.currenciesData)) {
      this.currencies = state.currencies.currenciesData;
    }

    if (this.mode !== state.programmeDocumentReports.current.mode) {
      this.mode = state.programmeDocumentReports.current.mode;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('locationId') || changedProperties.has('reportId')) {
      this.updateUrl = this._computeUpdateUrl(this.locationId, this.reportId);
    }

    if (
      changedProperties.has('mode') ||
      changedProperties.has('overrideMode') ||
      changedProperties.has('currentReport') ||
      changedProperties.has('permissions')
    ) {
      this.computedMode = this._computeMode(this.mode, this.overrideMode, this.currentReport, this.permissions);
    }
  }

  render() {
    return html`
      <etools-prp-permissions .permissions="${this.permissions}" @permissions-changed="${(e) =>
      (this.permissions = e.detail.value)}"> </etools-prp-permissions>

      <etools-prp-ajax
        id="update"
        .url="${this.updateUrl}"
        .body="${this.localData}"
        content-type="application/json"
        method="put"
      >
      </etools-prp-ajax>

      <etools-content-panel panel-title="Other info" ?no-header="${this.noHeader}">
        <div class="app-grid">
          <div class="row">
            <labelled-item label="${translate('NON_FINANCIAL_CONTRIBUTION_DURING_REPORTING_PERIOD')}">
              ${
                this._equals(this.computedMode, 'view')
                  ? html`<span class="value">${this._withDefault(this.data.partner_contribution_to_date)}</span>`
                  : html`
                      <paper-input
                        id="partner_contribution_to_date"
                        .value="${this.localData?.partner_contribution_to_date}"
                        no-label-float
                        char-counter
                        maxlength="2000"
                      ></paper-input>
                    `
              }
            </labelled-item>
          </div>

          <div class="row">
            <span class="item-label">${translate('FINANCIAL_CONTRIBUTION_DURING_REPORTING_PERIOD')}</span>
            <div class="currency-row">
              <div class="currency-ammount">
                <etools-currency-amount-input
                  id="financial_contribution_to_date"
                  class="w100"
                  type="number"
                  .value="${this.localData?.financial_contribution_to_date}"
                  placeholder="&#8212;"
                  ?readonly="${this._equals(this.computedMode, 'view')}"
                  no-label-float
                ></etools-currency-amount-input>
              </div>
              <div class="currency">
                <etools-dropdown
                  id="financial_contribution_currency"
                  class="item validate full-width"
                  .options="${this.currencies}"
                  option-value="value"
                  option-label="label"
                  .selected="${this.localData?.financial_contribution_currency}"
                  ?readonly="${this._equals(this.computedMode, 'view')}"
                  ?required="${this._hasCurrencyAmmount(this.data.financial_contribution_to_date)}"
                  no-dynamic-align
                ></etools-dropdown>
              </div>
            </div>
          </div>

          <div class="row">
            <labelled-item label="${translate('CHALLENGES_BOTTLENECKS')}">
              ${
                this._equals(this.computedMode, 'view')
                  ? html`
                      <span class="value">${this._withDefault(this.data.challenges_in_the_reporting_period)}</span>
                    `
                  : html`
                      <paper-input
                        id="challenges_in_the_reporting_period"
                        .value="${this.localData?.challenges_in_the_reporting_period}"
                        no-label-float
                        char-counter
                        maxlength="2000"
                      ></paper-input>
                    `
              }
            </labelled-item>
          </div>

          <div class="row">
            <labelled-item label="${translate('PROPOSED_WAY_FORWARD')}">
              ${
                this._equals(this.computedMode, 'view')
                  ? html` <span class="value">${this._withDefault(this.data.proposed_way_forward)}</span> `
                  : html`
                      <paper-input
                        id="proposed_way_forward"
                        .value="${this.localData?.proposed_way_forward}"
                        no-label-float
                        char-counter
                        maxlength="2000"
                      ></paper-input>

                      ${this.showFaceMessage
                        ? html` <div class="face-form-message">${translate('FACE_FORM_SUBMITTED')}</div> `
                        : html``}
                    `
              }
            </labelled-item>
          </div>

          ${
            this._isFinalReport(this.currentReport)
              ? html`
                  <div class="row">
                    <labelled-item label="${translate('RELEASE_CASH_IN_TIME')}">
                      <paper-radio-group .selected="${this.localData?.final_review.release_cash_in_time_choice}">
                        <paper-radio-button name="yes" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('YES')}
                        </paper-radio-button>
                        <paper-radio-button name="no" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('NO')}
                        </paper-radio-button>
                      </paper-radio-group>

                      ${this._equals(this.computedMode, 'view')
                        ? html`
                            <div class="value">
                              ${this._withDefault(this.data.final_review.release_cash_in_time_comment)}
                            </div>
                          `
                        : html`
                            <paper-input
                              id="release_cash_in_time_comment"
                              .value="${this.localData?.final_review.release_cash_in_time_comment}"
                              no-label-float
                              placeholder="${translate('COMMENTS')}"
                              char-counter
                              maxlength="2000"
                            ></paper-input>
                          `}
                    </labelled-item>
                  </div>

                  <div class="row">
                    <labelled-item label="${translate('RELEASE_SUPPLIES_IN_TIME')}">
                      <paper-radio-group .selected="${this.localData?.final_review.release_supplies_in_time_choice}">
                        <paper-radio-button name="yes" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('YES')}
                        </paper-radio-button>
                        <paper-radio-button name="no" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('NO')}
                        </paper-radio-button>
                      </paper-radio-group>

                      ${this._equals(this.computedMode, 'view')
                        ? html`
                            <div class="value">
                              ${this._withDefault(this.data.final_review.release_supplies_in_time_comment)}
                            </div>
                          `
                        : html`
                            <paper-input
                              id="release_supplies_in_time_comment"
                              .value="${this.localData?.final_review.release_supplies_in_time_comment}"
                              no-label-float
                              placeholder="${translate('COMMENTS')}"
                              char-counter
                              maxlength="2000"
                            ></paper-input>
                          `}
                    </labelled-item>
                  </div>

                  <div class="row">
                    <labelled-item label="${translate('FEEDBACK_FACE_FORM_IN_TIME')}">
                      <paper-radio-group .selected="${this.localData?.final_review.feedback_face_form_in_time_choice}">
                        <paper-radio-button name="yes" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('YES')}
                        </paper-radio-button>
                        <paper-radio-button name="no" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('NO')}
                        </paper-radio-button>
                      </paper-radio-group>

                      ${this._equals(this.computedMode, 'view')
                        ? html`
                            <div class="value">
                              ${this._withDefault(this.data.final_review.feedback_face_form_in_time_comment)}
                            </div>
                          `
                        : html`
                            <paper-input
                              id="feedback_face_form_in_time_comment"
                              .value="${this.localData?.final_review.feedback_face_form_in_time_comment}"
                              no-label-float
                              placeholder="${translate('COMMENTS')}"
                              char-counter
                              maxlength="2000"
                            ></paper-input>
                          `}
                    </labelled-item>
                  </div>

                  <div class="row">
                    <labelled-item label="${translate('RESPOND_REQUESTS_IN_TIME')}">
                      <paper-radio-group .selected="${this.localData?.final_review.respond_requests_in_time_choice}">
                        <paper-radio-button name="yes" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('YES')}
                        </paper-radio-button>
                        <paper-radio-button name="no" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('NO')}
                        </paper-radio-button>
                      </paper-radio-group>

                      ${this._equals(this.computedMode, 'view')
                        ? html`
                            <div class="value">
                              ${this._withDefault(this.data.final_review.respond_requests_in_time_comment)}
                            </div>
                          `
                        : html`
                            <paper-input
                              id="respond_requests_in_time_comment"
                              .value="${this.localData?.final_review.respond_requests_in_time_comment}"
                              no-label-float
                              placeholder="${translate('COMMENTS')}"
                              char-counter
                              maxlength="2000"
                            ></paper-input>
                          `}
                    </labelled-item>
                  </div>

                  <div class="row">
                    <labelled-item label="${translate('IMPLEMENTED_AS_PLANNED')}">
                      <paper-radio-group .selected="${this.localData?.final_review.implemented_as_planned_choice}">
                        <paper-radio-button name="yes" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('YES')}
                        </paper-radio-button>
                        <paper-radio-button name="no" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('NO')}
                        </paper-radio-button>
                      </paper-radio-group>

                      ${this._equals(this.computedMode, 'view')
                        ? html`
                            <div class="value">
                              ${this._withDefault(this.data.final_review.implemented_as_planned_comment)}
                            </div>
                          `
                        : html`
                            <paper-input
                              id="implemented_as_planned_comment"
                              .value="${this.localData?.final_review.implemented_as_planned_comment}"
                              no-label-float
                              placeholder="${translate('COMMENTS')}"
                              char-counter
                              maxlength="2000"
                            ></paper-input>
                          `}
                    </labelled-item>
                  </div>

                  <div class="row">
                    <labelled-item label="${translate('ACTION_TO_ADDRESS')}">
                      <paper-radio-group .selected="${this.localData?.final_review.action_to_address_choice}">
                        <paper-radio-button name="yes" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('YES')}
                        </paper-radio-button>
                        <paper-radio-button name="no" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('NO')}
                        </paper-radio-button>
                      </paper-radio-group>

                      ${this._equals(this.computedMode, 'view')
                        ? html`
                            <div class="value">
                              ${this._withDefault(this.data.final_review.action_to_address_comment)}
                            </div>
                          `
                        : html`
                            <paper-input
                              id="action_to_address_comment"
                              .value="${this.localData?.final_review.action_to_address_comment}"
                              no-label-float
                              placeholder="${translate('COMMENTS')}"
                              char-counter
                              maxlength="2000"
                            ></paper-input>
                          `}
                    </labelled-item>
                  </div>

                  <div class="row">
                    <labelled-item label="${translate('OVERALL_SATISFACTION')}">
                      <paper-radio-group .selected="${this.localData?.final_review.overall_satisfaction_choice}">
                        <paper-radio-button
                          name="very_unsatisfied"
                          ?disabled="${this._equals(this.computedMode, 'view')}"
                        >
                          ${translate('VERY_UNSATISFIED')}
                        </paper-radio-button>
                        <paper-radio-button name="unsatisfied" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('UNSATISFIED')}
                        </paper-radio-button>
                        <paper-radio-button name="neutral" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('NEUTRAL')}
                        </paper-radio-button>
                        <paper-radio-button name="satisfied" ?disabled="${this._equals(this.computedMode, 'view')}">
                          ${translate('SATISFIED')}
                        </paper-radio-button>
                        <paper-radio-button
                          name="very_satisfied"
                          ?disabled="${this._equals(this.computedMode, 'view')}"
                        >
                          ${translate('VERY_SATISFIED')}
                        </paper-radio-button>
                      </paper-radio-group>

                      ${this._equals(this.computedMode, 'view')
                        ? html`
                            <div class="value">
                              ${this._withDefault(this.data.final_review.overall_satisfaction_comment)}
                            </div>
                          `
                        : html`
                            <paper-input
                              id="overall_satisfaction_comment"
                              .value="${this.localData?.final_review.overall_satisfaction_comment}"
                              no-label-float
                              placeholder="${translate('COMMENTS')}"
                              char-counter
                              maxlength="2000"
                            ></paper-input>
                          `}
                    </labelled-item>
                  </div>
                `
              : html``
          }
          <div class="toggle-button-container row">
          ${
            !this._equals(this.computedMode, 'view')
              ? html`
                  <paper-button class="btn-primary" id="toggle-button" @tap="${this._handleInput}" raised>
                    ${translate('SAVE')}
                  </paper-button>
                `
              : html``
          }
          </div>

          <div class="row">
            <report-attachments ?readonly="${this._equals(this.computedMode, 'view')}"></report-attachments>
          </div
        </div>
      </etools-content-panel>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.localData = {};
    this.addEventListener('attachments-loaded', this.attachmentsLoaded.bind(this) as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('attachments-loaded', this.attachmentsLoaded.bind(this) as any);
  }

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

    if (data.id === this.localData?.id) {
      return data;
    }

    this.localData = {...data};
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
    debounce(() => {
      const updateElement = this.shadowRoot!.getElementById('update') as any as EtoolsPrpAjaxEl;

      updateElement.abort();

      store
        .dispatch(pdReportsUpdate(updateElement.thunk(), this.pdId, this.reportId))
        // @ts-ignore
        .then(() => {
          fireEvent(this, 'toast', {
            text: translate('CHANGES_SAVED'),
            showCloseBtn: true
          });
        })
        // @ts-ignore
        .catch((err) => {
          fireEvent(this, 'toast', {
            text: formatServerErrorAsText(err, translate('AN_ERROR_OCCURRED') as any as string),
            showCloseBtn: true
          });
          console.log(err);
        });
    }, 250)();
  }

  _computeUpdateUrl(locationId: string, reportId: string) {
    return computeUpdateUrl(locationId, reportId);
  }

  _computeMode(mode: string, overrideMode: string, report: any, permissions: any) {
    return computeMode(mode, overrideMode, report, permissions);
  }

  attachmentsLoaded(e: CustomEvent) {
    this.showFaceMessage = !e.detail.hasFaceAttachment;
  }
}

export {PdReportInfo as PdReportInfoEl};
