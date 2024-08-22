import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-collapse/etools-collapse';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import {translate, get as getTranslation} from 'lit-translate';
import {
  computeReportableUrl,
  computeCompleteIndicator,
  calculationFormulaAcrossPeriods
} from './js/pd-output-functions';
import {programmeDocumentReportsCurrent} from '../../redux/selectors/programmeDocumentReports';
import {pdReportsUpdateReportable} from '../../redux/actions/pdReports';
import '../../etools-prp-common/elements/reportable-meta';
import '../../etools-prp-common/elements/labelled-item';
import '../../etools-prp-common/elements/etools-prp-number';
import '../../etools-prp-common/elements/report-status';
import '../../etools-prp-common/elements/etools-prp-permissions';
import '../../etools-prp-common/elements/indicator-details';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';

@customElement('pd-output')
export class PdOutput extends RoutingMixin(ProgressReportUtilsMixin(UtilsMixin(connect(store)(LitElement)))) {
  static styles = [
    layoutStyles,
    css`
      :host {
        display: block;
        margin-block-end: 30px;
      }
      etools-icon-button {
        color: var(--theme-secondary-text-color);
      }
      .card-container {
        width: 100%;
        margin-bottom: 25px;
      }
      .header {
        padding: 25px;
      }
      a {
        color: var(--theme-primary-color);
      }
      labelled-item {
        margin-bottom: 25px;
      }
      .indicator-toggle {
        width: 25px;
        position: relative;
        z-index: 1;
        color: white;
        cursor: pointer;
      }
      .indicator-toggle {
        background: #0099ff;
      }
      .indicator-header {
        padding: 6px 25px 6px 10px;
        background: var(--sl-color-gray-200);
      }
      .indicator-header dl {
        margin: 0;
        font-size: 11px;
      }
      .indicator-header dt {
        color: var(--theme-secondary-text-color);
      }
      .indicator-header dt.no-wrap {
        white-space: nowrap;
      }
      .indicator-header dd {
        margin: 0;
        font-weight: bold;
        min-width: 60px;
      }
      .indicator-header__title h3 {
        margin: 0 0 0.25em;
        font-size: 14px;
        text-align: left;
      }
      .indicator-header__title dt {
        margin-right: 1em;
      }
      .status-badge {
        margin-right: 10px;
      }
      .indicator-header__target {
        width: 320px;
        padding-left: 10px;
      }
      .indicator-header__target dl {
        text-align: right;
        width: 100%;
      }
      .indicatorType {
        font-weight: 600;
        font-size: 16px;
        margin-right: 4px;
      }
      .flex {
        flex: 1;
        flex-basis: 0.000000001px;
      }
      .flex-4 {
        flex: 4;
      }
      .w100 {
        width: 100%;
      }
      .justified {
        justify-content: space-between;
      }
    `
  ];

  @property({type: Object})
  data!: any;

  @property({type: Object})
  permissions!: any;

  @property({type: Object})
  reportableMeta!: any;

  @property({type: String})
  overrideMode = '';

  @property({type: String})
  workspaceId = '';

  @property({type: Object})
  currentPd!: any;

  @property({type: Object})
  reportableData: any = {};

  @property({type: String})
  mode = '';

  @property({type: String})
  disaggregationsByIndicator = '';

  @property({type: String})
  computedMode = '';

  @property({type: String})
  pdId = '';

  @property({type: String})
  reportId = '';

  @property({type: String})
  reportableUrl = '';

  @property({type: String})
  calculationMethodUrl = '';

  @property({type: Object})
  currentReport: any = {};

  @property({type: Boolean})
  showMeta = false;

  @property({type: Array})
  openedArr: boolean[] = [];

  render() {
    return html`
      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      >
      </etools-prp-permissions>

      <div class="header">
        <labelled-item label="${translate('TITLE')}">${this.data?.title}</labelled-item>

        ${this.showMeta
          ? html`
              <reportable-meta
                .data="${this.reportableData}"
                .mode="${this.computedMode}"
                .completed="${this._isFinalReport(this.currentReport)}"
              >
              </reportable-meta>
            `
          : ''}
      </div>

      ${repeat(
        this.data?.indicator_reports,
        (indicator: any) => indicator.id,
        (indicator, index) => html`
           <section class="card-container">
              <div class="layout-horizontal indicator">

                <div class="layout-horizontal indicator-toggle">
                  <etools-icon
                    name="${this.openedArr[index] ? 'expand-less' : 'expand-more'}"
                    @click="${(e) => this._handleOpenedChanged(e, indicator, index)}"
                  ></etools-icon>
                </div>

                <div class="layout-horizontal w100">
                  <div
                    class="flex-none layout-horizontal center-center"
                    type=${this._computeToggleType(indicator.is_related_to_cluster_reporting)}
                    toggles="${index}"
                    role="button"
                    aria-expanded="${indicator.opened}"
                    aria-controls="collapse-${index}"
                    tabindex="-1"
                  >            
                  </div>

                  <div class="indicator-header layout-horizontal w100 justified">
                    <div class="indicator-header__title layout-vertical center-align">
                      <div class="layout-horizontal">
                        <div class="status-badge layout-vertical center-align">
                          <report-status
                            .status="${this._computeCompleteIndicator(
                              indicator.is_complete,
                              indicator.id,
                              this.disaggregationsByIndicator
                            )}"
                            no-label
                          ></report-status>
                        </div>
                        <div>
                          <div class="layout-horizontal">
                            <label class="indicatorType">
                              ${this.getIndicatorDisplayType(
                                indicator.reportable.blueprint.unit,
                                indicator.reportable.blueprint.display_type
                              )}
                            </label>
                            <h3>${indicator.reportable.blueprint.title}</h3>
                          </div>
                          <dl class="layout-horizontal">
                            <dt>                            
                              <sl-tooltip content="${translate('TO_LEARN_MORE')}" placement="top">
                                <span class="ripple-wrapper main">
                                  <a href=${this.calculationMethodUrl}>
                                    ${translate('CALCULATION_METHODS')}
                                  </a>  
                                </span>
                              </sl-tooltip>                              
                            </dt>
                            <dt class="no-wrap">
                              <b
                                >${this._toLowerCaseLocalized(
                                  indicator.reportable.blueprint.calculation_formula_across_locations
                                )}</b
                              >
                              (${this._toLowerCaseLocalized('across_locations')}),
                              <b>${this._calculationFormulaAcrossPeriods(indicator)}</b>
                              (${this._toLowerCaseLocalized('across_reporting_periods')})
                            </dt>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div class="indicator-header__target layout-vertical center-align">
                      <dl class="layout-horizontal right-align">
                        <dt class="flex-4">${translate('TARGET')}:</dt>
                        <dd class="flex">
                          ${
                            this._equals(indicator.reportable.blueprint.display_type, 'number')
                              ? html` <etools-prp-number value=${indicator.reportable.target.v}></etools-prp-number> `
                              : this._equals(indicator.reportable.blueprint.display_type, 'percentage')
                              ? html` <span>${indicator.reportable.target.v}%</span> `
                              : this._equals(indicator.reportable.blueprint.display_type, 'ratio')
                              ? html` <span>${indicator.reportable.target.v}/${indicator.reportable.target.d}</span> `
                              : html``
                          }
                        </dd>
                      </dl>
                      <dl class="layout-horizontal right-align">
                        <dt class="flex-4">${translate('TOTAL_CUMULATIVE_PROGRESS_FROM_QPR')}:</dt>
                        ${
                          this._equals(indicator.reportable.blueprint.display_type, 'number')
                            ? html`
                                <dd class="flex">
                                  <etools-prp-number value=${indicator.reportable.achieved.v}></etools-prp-number>
                                </dd>
                              `
                            : html`
                                <dd class="flex">
                                  ${this._formatIndicatorValue(
                                    indicator.reportable.blueprint.display_type,
                                    indicator.reportable.achieved.c,
                                    1
                                  )}
                                </dd>
                              `
                        }
                      </dl>
                      <dl class="layout-horizontal right-align">
                        <dt class="flex-4">${translate('ACHIEVEMENT_IN_REPORTING_PERIOD')}:</dt>
                        ${
                          this._equals(indicator.reportable.blueprint.display_type, 'number')
                            ? html`
                                <dd class="flex">
                                  <etools-prp-number value=${indicator.total.v}></etools-prp-number>
                                </dd>
                              `
                            : html`
                                <dd class="flex">
                                  ${this._formatIndicatorValue(
                                    indicator.reportable.blueprint.display_type,
                                    indicator.total.c,
                                    1
                                  )}
                                </dd>
                              `
                        }
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
                <etools-collapse ?opened="${indicator.opened}" id="collapse-${indicator.id}-${index}">
                    <indicator-details
                      id="collapse-${index}"
                      .reportIsQpr="${this._computeReportIsQpr(this.currentReport, indicator)}"
                      .reportStatus="${this.currentReport.status}"
                      .reportableId="${this.data?.id}"
                      .indicatorName="${indicator.reportable.blueprint.title}"
                      .indicatorId="${indicator.parent_ir_id ? indicator.parent_ir_id : indicator.id}"
                      .indicatorStatus="${indicator.report_status}"
                      .reportingPeriod="${this.currentReport.reporting_period}"
                      .overrideMode="${this.computedMode}"
                      .reportId="${this.reportId}"
                      .currentPd="${this.currentPd}"
                      .workspaceId="${this.workspaceId}"
                    ></indicator-details>
                </etools-collapse>
            </section>


          </div>
        `
      )}
    `;
  }

  stateChanged(state: RootState) {
    if (this.currentReport !== programmeDocumentReportsCurrent(state)) {
      this.currentReport = programmeDocumentReportsCurrent(state);
    }

    if (this.pdId !== state.programmeDocuments.currentPdId) {
      this.pdId = state.programmeDocuments.currentPdId;
    }

    if (this.reportId !== state.programmeDocumentReports.current.id) {
      this.reportId = state.programmeDocumentReports.current.id;
    }

    if (this.mode !== state.programmeDocumentReports.current.mode) {
      this.mode = state.programmeDocumentReports.current.mode;
    }

    if (this.disaggregationsByIndicator !== state.disaggregations.byIndicator) {
      this.disaggregationsByIndicator = state.disaggregations.byIndicator;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (
      changedProperties.has('mode') ||
      changedProperties.has('overrideMode') ||
      changedProperties.has('currentReport') ||
      changedProperties.has('permissions')
    ) {
      this.computedMode = this._computeMode(this.mode, this.overrideMode, this.currentReport, this.permissions);
    }

    if (changedProperties.has('currentReport')) {
      this.showMeta = this.currentReport.report_type === 'QPR';
    }

    if (changedProperties.has('data')) {
      this.reportableData = this._computeReportableData(this.data);
    }

    if (changedProperties.has('data') || changedProperties.has('reportId')) {
      this.reportableUrl = computeReportableUrl(this.reportId, this.data);
    }

    if (changedProperties.has('_baseUrldata') || changedProperties.has('pdId')) {
      this.calculationMethodUrl = this.buildUrl(this._baseUrl, 'pd/' + this.pdId + '/view/calculation-methods');
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._removeEventListeners();
    this.shadowRoot!.querySelectorAll('[id^="collapse-"]').forEach((section: any) => {
      section.opened = false;
    });
  }

  _addEventListeners() {
    this._updateMeta = this._updateMeta.bind(this);
    this.addEventListener('reportable-meta-changed', this._updateMeta as any);
  }

  _removeEventListeners() {
    this.removeEventListener('reportable-meta-changed', this._updateMeta as any);
  }

  _calculationFormulaAcrossPeriods(indicator: any) {
    return calculationFormulaAcrossPeriods(indicator);
  }

  _computeCompleteIndicator(complete: boolean, indicatorId: string, disaggregationsByIndicator: any) {
    let status = computeCompleteIndicator(complete);
    if (status === 'Ove') {
      // trigger computation after data entered for a location

      if (
        disaggregationsByIndicator &&
        disaggregationsByIndicator[indicatorId]?.indicator_location_data.every((l) => l.is_complete)
      ) {
        status = 'Met';
      }
    }
    return status;
  }

  _computeReportIsQpr(currentReport: any, indicator: any) {
    if (currentReport && indicator) {
      return String(currentReport.report_type) === String('QPR');
    }
    return false;
  }

  _handleOpenedChanged(e: CustomEvent, indicator: any, index: number) {
    e.stopPropagation();
    // @dci
    // if (data.value) {
    // @ts-ignore
    this.openedArr[index] = !this.openedArr[index];
    this.openedArr = [...this.openedArr];
    const indicatorDetails = this.shadowRoot?.querySelector(`#collapse-${index}`) as any;
    // e.srcElement!.querySelector('indicator-details');

    // try {
    indicatorDetails.init();
    (this.shadowRoot!.querySelector(`#collapse-${indicator.id}-${index}`) as any).toggle();
    // } catch (err) {
    //  console.error('pd-output.ts', err);
    // }
    // }
  }

  _updateMeta(e: CustomEvent) {
    e.stopPropagation();

    const data = e.detail;
    this.reportableMeta = data;

    store
      .dispatch(
        pdReportsUpdateReportable(
          sendRequest({
            method: 'PATCH',
            endpoint: {url: this.reportableUrl},
            body: this.reportableMeta
          }),
          this.pdId,
          this.reportId,
          this.data.id
        )
      )
      // @ts-ignore
      .then(() => {
        fireEvent(this, 'toast', {
          text: getTranslation('CHANGES_SAVED'),
          showCloseBtn: true
        });
      })
      .catch((_err: any) => {
        //   // TODO: error handling
      });
  }

  // @ts-ignore
  _computeMode(mode: string, overrideMode: string, report: any, permissions: any) {
    return permissions && permissions.savePdReport ? overrideMode || mode : 'view';
  }

  _computeReportableData(data: any) {
    const first = data.indicator_reports[0] || {};

    return {
      id: data.id,
      overall_status: first.overall_status,
      narrative_assessment: first.narrative_assessment
    };
  }

  _computeToggleType(isCluster: boolean) {
    return isCluster ? 'cluster' : 'default';
  }

  getIndicatorDisplayType(unit: string, displayType: string) {
    if (!unit) {
      return '';
    }

    switch (unit) {
      case 'number':
        return '# ';
      case 'percentage':
        if (displayType === 'percentage') {
          return '% ';
        } else if (displayType === 'ratio') {
          return '÷ ';
        }
        return '';
      default:
        return '';
    }
  }
}

export {PdOutput as PdOutputEl};
