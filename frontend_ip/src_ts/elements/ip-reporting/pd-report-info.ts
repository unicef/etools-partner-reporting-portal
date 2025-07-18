import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../redux/store';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-radio/etools-radio-group';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '../../etools-prp-common/elements/labelled-item';
import '../../etools-prp-common/elements/etools-prp-permissions';
import './report-attachments';
import '../../etools-prp-common/elements/filter-list';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import {programmeDocumentReportsCurrent} from '../../redux/selectors/programmeDocumentReports';
import {reportInfoCurrent} from '../../redux/selectors/reportInfo';
import {computeMode, computeUpdateUrl} from './js/pd-report-info-functions';
import {pdReportsUpdate} from '../../redux/actions/pdReports';
import {RootState} from '../../typings/redux.types';
import cloneDeep from 'lodash-es/cloneDeep';
import {formatServerErrorAsText} from '../../etools-prp-common/utils/error-parser';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import {valueWithDefault} from '@unicef-polymer/etools-utils/dist/general.util';
import {fieldsAreValid} from '@unicef-polymer/etools-utils/dist/validation.util';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
@customElement('pd-report-info')
export class PdReportInfo extends ProgressReportUtilsMixin(connect(store)(LitElement)) {
  static styles = [
    layoutStyles,
    css`
      :host {
        display: block;
        margin-bottom: 25px;
      }

      #toggle-button {
        background-color: #0099ff;
        color: #fff;
        font-size: 14px;
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
        width: 240px;
        margin-right: 40px;
        margin-top: 20px;
      }
      .item-label {
        font-size: 12px;
        color: #737373;
        display: block;
        margin-bottom: 0px;
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

      :host labelled-item etools-radio-group sl-radio:first-child {
        padding-left: 0;
      }
      .r-ml {
        margin-inline-start: 6px;
      }
      .currency {
        width: 240px;
      }
    `
  ];

  @property({type: Object})
  localData: any = {};

  @property({type: Object})
  permissions!: any;

  @property({type: Boolean, attribute: 'no-header'})
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

    if (this.pdId !== state.programmeDocuments.currentPdId) {
      this.pdId = state.programmeDocuments.currentPdId;
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
      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      >
      </etools-prp-permissions>

      <etools-content-panel panel-title="Other info" ?no-header="${this.noHeader}">
        <div class="row">
          <div class="col-12 padding-v">
            <labelled-item label="${translate('NON_FINANCIAL_CONTRIBUTION_DURING_REPORTING_PERIOD')}">
              ${this.computedMode === 'view'
                ? html`<span class="value">${valueWithDefault(this.data.partner_contribution_to_date)}</span>`
                : html`
                    <etools-input
                      id="partner_contribution_to_date"
                      .value="${this.localData?.partner_contribution_to_date}"
                      @value-changed="${({detail}: CustomEvent) =>
                        (this.localData.partner_contribution_to_date = detail.value)}"
                      no-label-float
                      char-counter
                      .charCount=${this.localData?.partner_contribution_to_date?.length}
                      maxlength="2000"
                    ></etools-input>
                  `}
            </labelled-item>
          </div>

          <div class="col-12 padding-v">
            <span class="item-label">${translate('FINANCIAL_CONTRIBUTION_DURING_REPORTING_PERIOD')}</span>
            <div class="currency-row">
              <div class="currency-ammount">
                <etools-currency
                  id="financial_contribution_to_date"
                  type="number"
                  .value="${this.localData?.financial_contribution_to_date}"
                  @value-changed="${({detail}: CustomEvent) =>
                    (this.localData.financial_contribution_to_date = detail.value)}"
                  placeholder="&#8212;"
                  no-label-float
                  ?readonly="${this.computedMode === 'view'}"
                >
                </etools-currency>
              </div>
              <div class="currency">
                <etools-dropdown
                  id="financial_contribution_currency"
                  .options="${this.currencies}"
                  option-value="value"
                  option-label="label"
                  .selected="${this.localData?.financial_contribution_currency}"
                  ?readonly="${this.computedMode === 'view'}"
                  ?required="${this._hasCurrencyAmmount(this.data.financial_contribution_to_date)}"
                  trigger-value-change-event
                  @etools-selected-item-changed="${(event: CustomEvent) => {
                    if (this.localData?.financial_contribution_currency !== event.detail.selectedItem?.value) {
                      this.localData.financial_contribution_currency = event.detail.selectedItem?.value;
                    }
                  }}"
                ></etools-dropdown>
              </div>
            </div>
          </div>

          <div class="col-12 padding-v">
            <labelled-item label="${translate('CHALLENGES_BOTTLENECKS')}">
              ${this.computedMode === 'view'
                ? html` <span class="value">${valueWithDefault(this.data.challenges_in_the_reporting_period)}</span> `
                : html`
                    <etools-input
                      id="challenges_in_the_reporting_period"
                      .value="${this.localData?.challenges_in_the_reporting_period}"
                      @value-changed="${({detail}: CustomEvent) =>
                        (this.localData.challenges_in_the_reporting_period = detail.value)}"
                      no-label-float
                      char-counter
                      .charCount=${this.localData?.challenges_in_the_reporting_period?.length}
                      maxlength="2000"
                    ></etools-input>
                  `}
            </labelled-item>
          </div>

          <div class="col-12 padding-v">
            <labelled-item label="${translate('PROPOSED_WAY_FORWARD')}">
              ${this.computedMode === 'view'
                ? html` <span class="value">${valueWithDefault(this.data.proposed_way_forward)}</span> `
                : html`
                    <etools-input
                      id="proposed_way_forward"
                      .value="${this.localData?.proposed_way_forward}"
                      @value-changed="${({detail}: CustomEvent) =>
                        (this.localData.proposed_way_forward = detail.value)}"
                      no-label-float
                      char-counter
                      .charCount=${this.localData?.proposed_way_forward?.length}
                      maxlength="2000"
                    ></etools-input>

                    ${this.showFaceMessage
                      ? html` <div class="face-form-message">${translate('FACE_FORM_SUBMITTED')}</div> `
                      : html``}
                  `}
            </labelled-item>
          </div>

          ${this._isFinalReport(this.currentReport)
            ? html`
                <div class="col-12 padding-v">
                  <labelled-item label="${translate('RELEASE_CASH_IN_TIME')}">
                    <etools-radio-group
                      .value="${this.localData?.final_review?.release_cash_in_time_choice}"
                      @sl-change="${(e: any) => {
                        this.localData.final_review.release_cash_in_time_choice = e.target.value;
                      }}"
                    >
                      <sl-radio value="yes" ?disabled="${this.computedMode === 'view'}"> ${translate('YES')} </sl-radio>
                      <sl-radio value="no" ?disabled="${this.computedMode === 'view'}"> ${translate('NO')} </sl-radio>
                    </etools-radio-group>

                    ${this.computedMode === 'view'
                      ? html`
                          <div class="value">
                            ${valueWithDefault(this.data?.final_review?.release_cash_in_time_comment)}
                          </div>
                        `
                      : html`
                          <etools-input
                            id="release_cash_in_time_comment"
                            .value="${this.localData?.final_review?.release_cash_in_time_comment}"
                            @value-changed="${({detail}: CustomEvent) =>
                              (this.localData.final_review.release_cash_in_time_comment = detail.value)}"
                            no-label-float
                            placeholder="${translate('COMMENTS')}"
                            char-counter
                            .charCount=${this.localData?.final_review?.release_cash_in_time_comment?.length}
                            maxlength="2000"
                          ></etools-input>
                        `}
                  </labelled-item>
                </div>

                <div class="col-12 padding-v">
                  <labelled-item label="${translate('RELEASE_SUPPLIES_IN_TIME')}">
                    <etools-radio-group
                      .value="${this.localData?.final_review?.release_supplies_in_time_choice}"
                      @sl-change="${(e: any) => {
                        this.localData.final_review.release_supplies_in_time_choice = e.target.value;
                      }}"
                    >
                      <sl-radio value="yes" ?disabled="${this.computedMode === 'view'}"> ${translate('YES')} </sl-radio>
                      <sl-radio value="no" ?disabled="${this.computedMode === 'view'}"> ${translate('NO')} </sl-radio>
                    </etools-radio-group>

                    ${this.computedMode === 'view'
                      ? html`
                          <div class="value">
                            ${valueWithDefault(this.data?.final_review?.release_supplies_in_time_comment)}
                          </div>
                        `
                      : html`
                          <etools-input
                            id="release_supplies_in_time_comment"
                            .value="${this.localData?.final_review?.release_supplies_in_time_comment}"
                            @value-changed="${({detail}: CustomEvent) =>
                              (this.localData.final_review.release_supplies_in_time_comment = detail.value)}"
                            no-label-float
                            placeholder="${translate('COMMENTS')}"
                            char-counter
                            .charCount=${this.localData?.final_review?.release_supplies_in_time_comment?.length}
                            maxlength="2000"
                          ></etools-input>
                        `}
                  </labelled-item>
                </div>

                <div class="col-12 padding-v">
                  <labelled-item label="${translate('FEEDBACK_FACE_FORM_IN_TIME')}">
                    <etools-radio-group
                      .value="${this.localData?.final_review?.feedback_face_form_in_time_choice}"
                      @sl-change="${(e: any) => {
                        this.localData.final_review.feedback_face_form_in_time_choice = e.target.value;
                      }}"
                    >
                      <sl-radio value="yes" ?disabled="${this.computedMode === 'view'}"> ${translate('YES')} </sl-radio>
                      <sl-radio value="no" ?disabled="${this.computedMode === 'view'}"> ${translate('NO')} </sl-radio>
                    </etools-radio-group>

                    ${this.computedMode === 'view'
                      ? html`
                          <div class="value">
                            ${valueWithDefault(this.data?.final_review?.feedback_face_form_in_time_comment)}
                          </div>
                        `
                      : html`
                          <etools-input
                            id="feedback_face_form_in_time_comment"
                            .value="${this.localData?.final_review?.feedback_face_form_in_time_comment}"
                            @value-changed="${({detail}: CustomEvent) =>
                              (this.localData.final_review.feedback_face_form_in_time_comment = detail.value)}"
                            no-label-float
                            placeholder="${translate('COMMENTS')}"
                            char-counter
                            .charCount=${this.localData?.final_review?.feedback_face_form_in_time_comment?.length}
                            maxlength="2000"
                          ></etools-input>
                        `}
                  </labelled-item>
                </div>

                <div class="col-12 padding-v">
                  <labelled-item label="${translate('RESPOND_REQUESTS_IN_TIME')}">
                    <etools-radio-group
                      .value="${this.localData?.final_review?.respond_requests_in_time_choice}"
                      @sl-change="${(e: any) => {
                        this.localData.final_review.respond_requests_in_time_choice = e.target.value;
                      }}"
                    >
                      <sl-radio value="yes" ?disabled="${this.computedMode === 'view'}"> ${translate('YES')} </sl-radio>
                      <sl-radio value="no" ?disabled="${this.computedMode === 'view'}"> ${translate('NO')} </sl-radio>
                    </etools-radio-group>

                    ${this.computedMode === 'view'
                      ? html`
                          <div class="value">
                            ${valueWithDefault(this.data?.final_review?.respond_requests_in_time_comment)}
                          </div>
                        `
                      : html`
                          <etools-input
                            id="respond_requests_in_time_comment"
                            .value="${this.localData?.final_review?.respond_requests_in_time_comment}"
                            @value-changed="${({detail}: CustomEvent) =>
                              (this.localData.final_review.respond_requests_in_time_comment = detail.value)}"
                            no-label-float
                            placeholder="${translate('COMMENTS')}"
                            char-counter
                            .charCount=${this.localData?.final_review?.respond_requests_in_time_comment?.length}
                            maxlength="2000"
                          ></etools-input>
                        `}
                  </labelled-item>
                </div>

                <div class="col-12 padding-v">
                  <labelled-item label="${translate('IMPLEMENTED_AS_PLANNED')}">
                    <etools-radio-group
                      .value="${this.localData?.final_review?.implemented_as_planned_choice}"
                      @sl-change="${(e: any) => {
                        this.localData.final_review.implemented_as_planned_choice = e.target.value;
                      }}"
                    >
                      <sl-radio value="yes" ?disabled="${this.computedMode === 'view'}"> ${translate('YES')} </sl-radio>
                      <sl-radio value="no" ?disabled="${this.computedMode === 'view'}"> ${translate('NO')} </sl-radio>
                    </etools-radio-group>

                    ${this.computedMode === 'view'
                      ? html`
                          <div class="value">
                            ${valueWithDefault(this.data?.final_review?.implemented_as_planned_comment)}
                          </div>
                        `
                      : html`
                          <etools-input
                            id="implemented_as_planned_comment"
                            .value="${this.localData?.final_review?.implemented_as_planned_comment}"
                            @value-changed="${({detail}: CustomEvent) =>
                              (this.localData.final_review.implemented_as_planned_comment = detail.value)}"
                            no-label-float
                            placeholder="${translate('COMMENTS')}"
                            char-counter
                            .charCount=${this.localData?.final_review?.implemented_as_planned_comment?.length}
                            maxlength="2000"
                          ></etools-input>
                        `}
                  </labelled-item>
                </div>

                <div class="col-12 padding-v">
                  <labelled-item label="${translate('ACTION_TO_ADDRESS')}">
                    <etools-radio-group
                      .value="${this.localData?.final_review?.action_to_address_choice}"
                      @sl-change="${(e: any) => {
                        this.localData.final_review.action_to_address_choice = e.target.value;
                      }}"
                    >
                      <sl-radio value="yes" ?disabled="${this.computedMode === 'view'}"> ${translate('YES')} </sl-radio>
                      <sl-radio value="no" ?disabled="${this.computedMode === 'view'}"> ${translate('NO')} </sl-radio>
                    </etools-radio-group>

                    ${this.computedMode === 'view'
                      ? html`
                          <div class="value">
                            ${valueWithDefault(this.data?.final_review?.action_to_address_comment)}
                          </div>
                        `
                      : html`
                          <etools-input
                            id="action_to_address_comment"
                            .value="${this.localData?.final_review?.action_to_address_comment}"
                            @value-changed="${({detail}: CustomEvent) =>
                              (this.localData.final_review.action_to_address_comment = detail.value)}"
                            no-label-float
                            placeholder="${translate('COMMENTS')}"
                            char-counter
                            .charCount=${this.localData?.final_review?.action_to_address_comment?.length}
                            maxlength="2000"
                          ></etools-input>
                        `}
                  </labelled-item>
                </div>

                <div class="col-12 padding-v">
                  <labelled-item label="${translate('OVERALL_SATISFACTION')}">
                    <etools-radio-group
                      .value="${this.localData?.final_review?.overall_satisfaction_choice}"
                      @sl-change="${(e: any) => {
                        this.localData.final_review.overall_satisfaction_choice = e.target.value;
                      }}"
                    >
                      <div class="layout-horizontal">
                        <sl-radio class="r-ml" value="very_unsatisfied" ?disabled="${this.computedMode === 'view'}">
                          ${translate('VERY_UNSATISFIED')}
                        </sl-radio>
                        <sl-radio class="r-ml" value="unsatisfied" ?disabled="${this.computedMode === 'view'}">
                          ${translate('UNSATISFIED')}
                        </sl-radio>
                        <sl-radio class="r-ml" value="neutral" ?disabled="${this.computedMode === 'view'}">
                          ${translate('NEUTRAL')}
                        </sl-radio>
                        <sl-radio class="r-ml" value="satisfied" ?disabled="${this.computedMode === 'view'}">
                          ${translate('SATISFIED')}
                        </sl-radio>
                        <sl-radio class="r-ml" value="very_satisfied" ?disabled="${this.computedMode === 'view'}">
                          ${translate('VERY_SATISFIED')}
                        </sl-radio>
                      </div>
                    </etools-radio-group>

                    ${this.computedMode === 'view'
                      ? html`
                          <div class="value">
                            ${valueWithDefault(this.data?.final_review?.overall_satisfaction_comment)}
                          </div>
                        `
                      : html`
                          <etools-input
                            id="overall_satisfaction_comment"
                            .value="${this.localData?.final_review?.overall_satisfaction_comment}"
                            @value-changed="${({detail}: CustomEvent) =>
                              (this.localData.final_review.overall_satisfaction_comment = detail.value)}"
                            no-label-float
                            placeholder="${translate('COMMENTS')}"
                            char-counter
                            .charCount=${this.localData?.final_review?.overall_satisfaction_comment?.length}
                            maxlength="2000"
                          ></etools-input>
                        `}
                  </labelled-item>
                </div>
              `
            : html``}
          <div class="col-12 right-align padding-v">
            ${this.computedMode !== 'view'
              ? html`
                  <etools-button variant="primary" id="toggle-button" @click="${this._handleInput}">
                    ${translate('SAVE')}
                  </etools-button>
                `
              : html``}
          </div>

          <div class="col-12 padding-v">
            <report-attachments ?readonly="${this.computedMode === 'view'}"></report-attachments>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this._updateData = debounce(this._updateData.bind(this), 250);

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

    if (isJsonStrMatch(data, this.localData)) {
      return data;
    }

    this.localData = cloneDeep(data);
    return data;
  }

  _programmeDocumentReportsCurrent(rootState: RootState) {
    return programmeDocumentReportsCurrent(rootState);
  }

  _hasCurrencyAmmount(currencyAmmount: number) {
    return currencyAmmount && currencyAmmount > 0;
  }

  _handleInput() {
    if (!fieldsAreValid(this.shadowRoot)) {
      return;
    }
    this._updateData();
  }

  _updateData() {
    store
      .dispatch(
        pdReportsUpdate(
          sendRequest({
            method: 'PUT',
            endpoint: {url: this.updateUrl},
            body: this.localData
          }),
          this.pdId,
          this.reportId
        )
      )
      // @ts-ignore
      .then(() => {
        fireEvent(this, 'toast', {
          text: getTranslation('CHANGES_SAVED'),
          showCloseBtn: true
        });
      })
      // @ts-ignore
      .catch((err) => {
        fireEvent(this, 'toast', {
          text: formatServerErrorAsText(err.response, getTranslation('AN_ERROR_OCCURRED') as any as string),
          showCloseBtn: true
        });
        console.log(err);
      });
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
