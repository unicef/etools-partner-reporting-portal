import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import NotificationsMixin from '../../etools-prp-common/mixins/notifications-mixin';
import ProgressReportUtilsMixin from '../../mixins/progress-report-utils-mixin';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {
  computeReportableUrl,
  computeCompleteIndicator,
  computeIcon,
  toggle,
  calculationFormulaAcrossPeriods
} from './js/pd-output-functions';
import {programmeDocumentReportsCurrent} from '../../redux/selectors/programmeDocumentReports';
import {pdReportsUpdateReportable} from '../../redux/actions/pdReports';
import '../../etools-prp-common/elements/reportable-meta';
import '../../etools-prp-common/elements/labelled-item';
import '../../etools-prp-common/elements/etools-prp-number';
import '../../etools-prp-common/elements/report-status';
import '../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import '../../etools-prp-common/elements/etools-prp-permissions';
import '../../etools-prp-common/elements/indicator-details';
import {RootState} from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin ProgressReportUtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin LocalizeMixin
 */
class PdOutput extends LocalizeMixin(
  RoutingMixin(ProgressReportUtilsMixin(NotificationsMixin(UtilsMixin(ReduxConnectedElement))))
) {
  public static get template() {
    return html`
      <style include="iron-flex iron-flex-factors">
        :host {
          display: block;

          --paper-icon-button: {
            color: var(--theme-secondary-text-color);
          }
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

        .indicator:not(:last-child) {
          margin-bottom: 25px;
        }

        .indicator-toggle {
          width: 25px;
          position: relative;
          z-index: 1;
          color: white;
          cursor: pointer;
        }

        .indicator-toggle[type='default'] {
          background: #0099ff;
        }

        .indicator-toggle[type='cluster'] {
          background: #009d55;
        }

        .indicator-header {
          padding: 6px 25px 6px 10px;
          background: var(--paper-grey-300);
        }

        .indicator-header dl {
          margin: 0;
          text-align: right;
          font-size: 11px;
        }

        .indicator-header dt {
          color: var(--theme-secondary-text-color);
        }

        .indicator-header dd {
          margin: 0;
          font-weight: bold;
        }

        .indicator-header__title h3 {
          margin: 0 0 0.25em;
          font-size: 14px;
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
        }

        /* indicator-details {
        padding-top: 15px;
      } */
      </style>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <etools-prp-ajax
        id="update"
        url="[[reportableUrl]]"
        body="[[reportableMeta]]"
        content-type="application/json"
        method="patch"
      >
      </etools-prp-ajax>

      <div class="header">
        <labelled-item label="[[localize('title')]]">[[data.title]]</labelled-item>

        <template is="dom-if" if="[[showMeta]]">
          <reportable-meta
            data="[[reportableData]]"
            mode="[[computedMode]]"
            completed="[[_isFinalReport(currentReport)]]"
          >
          </reportable-meta>
        </template>
      </div>

      <template id="indicators" is="dom-repeat" items="[[data.indicator_reports]]" as="indicator">
        <div class="indicator">
          <div class="layout horizontal">
            <div
              class="indicator-toggle flex-none layout horizontal center-center"
              type$="[[_computeToggleType(indicator.is_related_to_cluster_reporting)]]"
              on-tap="_toggle"
              toggles="[[index]]"
              role="button"
              aria-expanded$="[[indicator.opened]]"
              aria-controls$="collapse-[[index]]"
              tabindex="-1"
            >
              <iron-icon icon="icons:expand-[[_computeIcon(indicator.opened)]]"> </iron-icon>
            </div>

            <div class="indicator-header flex layout horizontal">
              <div class="indicator-header__title flex-3 layout vertical center-justified">
                <div class="layout horizontal">
                  <div class="status-badge layout vertical center-justified">
                    <report-status status="[[_computeCompleteIndicator(indicator.is_complete)]]" no-label>
                    </report-status>
                  </div>
                  <div>
                    <h3>[[indicator.reportable.blueprint.title]]</h3>

                    <dl class="layout horizontal">
                      <dt>
                        <a href="[[calculationMethodUrl]]"
                          >[[localize('calculation_methods')]]
                          <paper-tooltip>[[localize('to_learn_more')]]</paper-tooltip></a
                        >:
                      </dt>
                      <dt>
                        <b
                          >[[_toLowerCaseLocalized(indicator.reportable.blueprint.calculation_formula_across_locations,
                          localize)]]</b
                        >
                        ([[_toLowerCaseLocalized('across_locations', localize)]]),
                        <b>[[_calculationFormulaAcrossPeriods(indicator, localize)]]</b>
                        ([[_toLowerCaseLocalized('across_reporting_periods', localize)]])
                      </dt>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="indicator-header__target flex-none layout vertical center-justified">
                <dl class="layout horizontal justified">
                  <dt class="flex-4">[[localize('target')]]:</dt>
                  <dd class="flex">
                    <template
                      is="dom-if"
                      if="[[_equals(indicator.reportable.blueprint.display_type, 'number')]]"
                      restamp="true"
                    >
                      <etools-prp-number value="[[indicator.reportable.target.v]]"></etools-prp-number>
                    </template>
                    <template
                      is="dom-if"
                      if="[[_equals(indicator.reportable.blueprint.display_type, 'percentage')]]"
                      restamp="true"
                    >
                      <span>[[indicator.reportable.target.v]]%</span>
                    </template>
                    <template
                      is="dom-if"
                      if="[[_equals(indicator.reportable.blueprint.display_type, 'ratio')]]"
                      restamp="true"
                    >
                      <span>[[indicator.reportable.target.v]]/[[indicator.reportable.target.d]]</span>
                    </template>
                  </dd>
                </dl>
                <dl class="layout horizontal justified">
                  <dt class="flex-4">[[localize('total_cumulative_progress_from_qpr')]]:</dt>
                  <template
                    is="dom-if"
                    if="[[_equals(indicator.reportable.blueprint.display_type, 'number')]]"
                    restamp="true"
                  >
                    <dd class="flex">
                      <etools-prp-number value="[[indicator.reportable.achieved.v]]"></etools-prp-number>
                    </dd>
                  </template>
                  <template
                    is="dom-if"
                    if="[[!_equals(indicator.reportable.blueprint.display_type, 'number')]]"
                    restamp="true"
                  >
                    <dd class="flex">
                      [[_formatIndicatorValue(indicator.reportable.blueprint.display_type,
                      indicator.reportable.achieved.c, 1)]]
                    </dd>
                  </template>
                </dl>
                <dl class="layout horizontal justified">
                  <dt class="flex-4">[[localize('achievement_in_reporting_period')]]:</dt>
                  <template
                    is="dom-if"
                    if="[[_equals(indicator.reportable.blueprint.display_type, 'number')]]"
                    restamp="true"
                  >
                    <dd class="flex">
                      <etools-prp-number value="[[indicator.total.v]]"></etools-prp-number>
                    </dd>
                  </template>
                  <template
                    is="dom-if"
                    if="[[!_equals(indicator.reportable.blueprint.display_type, 'number')]]"
                    restamp="true"
                  >
                    <dd class="flex">
                      [[_formatIndicatorValue(indicator.reportable.blueprint.display_type, indicator.total.c, 1)]]
                    </dd>
                  </template>
                </dl>
              </div>
            </div>
          </div>

          <iron-collapse
            id="collapse-[[index]]"
            opened="{{indicator.opened}}"
            on-opened-changed="_handleOpenedChanged"
            no-animation
          >
            <indicator-details
              report-is-qpr="[[_computeReportIsQpr(currentReport, indicator)]]"
              report-status="[[currentReport.status]]"
              reportable-id="[[data.id]]"
              indicator-name="[[indicator.reportable.blueprint.title]]"
              indicator-id="[[_computeIndicatorId(indicator)]]"
              indicator-status="[[indicator.report_status]]"
              reporting-period="[[currentReport.reporting_period]]"
              override-mode="[[computedMode]]"
              report-id="[[reportId]]"
              current-pd="[[currentPd]]"
              workspace-id="[[workspaceId]]"
            >
            </indicator-details>
          </iron-collapse>
        </div>
      </template>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Object})
  reportableMeta!: GenericObject;

  @property({type: Object, computed: '_computeReportableData(data)'})
  reportableData!: GenericObject;

  @property({type: String})
  overrideMode = '';

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.mode)'})
  mode!: string;

  @property({type: String, computed: '_computeMode(mode, overrideMode, currentReport, permissions)'})
  computedMode!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)'})
  pdId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  reportId!: string;

  @property({type: String, computed: '_computeReportableUrl(reportId, data)'})
  reportableUrl!: string;

  @property({type: String, computed: '_computeCalculationMethodUrl(_baseUrl, pdId)'})
  calculationMethodUrl!: string;

  @property({type: Object, computed: '_programmeDocumentReportsCurrent(rootState)'})
  currentReport!: GenericObject;

  @property({type: Boolean, computed: '_computeShowMeta(currentReport)'})
  showMeta = false;

  @property({type: String})
  workspaceId!: string;

  @property({type: Object})
  currentPd!: GenericObject;

  _calculationFormulaAcrossPeriods(indicator: GenericObject, localize: (x: string) => string) {
    return calculationFormulaAcrossPeriods(indicator, localize);
  }

  _programmeDocumentReportsCurrent(rootState: RootState) {
    return programmeDocumentReportsCurrent(rootState);
  }

  _toggle(e: CustomEvent) {
    const node = toggle(e) as any;

    (this.shadowRoot!.querySelector('#collapse-' + node!.toggles) as any).toggle();
  }

  _computeIcon(opened: boolean) {
    return computeIcon(opened);
  }

  _computeCompleteIndicator(complete: boolean) {
    return computeCompleteIndicator(complete);
  }

  _computeReportableUrl(reportId: string, data: GenericObject) {
    return computeReportableUrl(reportId, data);
  }

  _computeCalculationMethodUrl(baseUrl: string, pdId: string) {
    return this.buildUrl(baseUrl, 'pd/' + pdId + '/view/calculation-methods');
  }

  _computeReportIsQpr(currentReport: GenericObject, indicator: GenericObject) {
    if (currentReport && indicator) {
      return String(currentReport.report_type) === String('QPR');
    }
    return false;
  }

  _computeShowMeta(report: GenericObject) {
    return report.report_type === 'QPR';
  }

  _handleOpenedChanged(e: CustomEvent, data: GenericObject) {
    e.stopPropagation();

    if (data.value) {
      // @ts-ignore
      const indicatorDetails = e.srcElement!.querySelector('indicator-details');

      try {
        indicatorDetails.init();
      } catch (err) {
        console.error('pd-output.ts', err);
      }
    }
  }

  _computeIndicatorId(indicatorReport: GenericObject) {
    return indicatorReport.parent_ir_id ? indicatorReport.parent_ir_id : indicatorReport.id;
  }

  _updateMeta(e: CustomEvent) {
    e.stopPropagation();
    const data = e.detail;
    this.set('reportableMeta', data);

    const updateThunk = (this.$.update as EtoolsPrpAjaxEl).thunk();

    (this.$.update as EtoolsPrpAjaxEl).abort();

    this.reduxStore
      .dispatch(pdReportsUpdateReportable(updateThunk, this.pdId, this.reportId, this.data.id))
      // @ts-ignore
      .then(() => {
        this._notifyChangesSaved();
      })
      .catch((_err: GenericObject) => {
        //   // TODO: error handling
      });
  }

  // @ts-ignore
  _computeMode(mode: string, overrideMode: string, report: GenericObject, permissions: GenericObject) {
    return permissions && permissions.savePdReport ? overrideMode || mode : 'view';
  }

  _computeReportableData(data: GenericObject) {
    const first = data.indicator_reports[0] || {};

    return {
      overall_status: first.overall_status,
      narrative_assessment: first.narrative_assessment
    };
  }

  _computeToggleType(isCluster: boolean) {
    return isCluster ? 'cluster' : 'default';
  }

  _addEventListeners() {
    this._updateMeta = this._updateMeta.bind(this);
    this.addEventListener('reportable-meta-changed', this._updateMeta as any);
  }

  _removeEventListeners() {
    this.removeEventListener('reportable-meta-changed', this._updateMeta as any);
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
}

window.customElements.define('pd-output', PdOutput);

export {PdOutput as PdOutputEl};
