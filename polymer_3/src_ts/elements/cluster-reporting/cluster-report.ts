import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import '@polymer/iron-collapse/iron-collapse';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-item/paper-icon-item';
import '@polymer/paper-listbox/paper-listbox';
import Endpoints from '../../endpoints';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import NotificationsMixin from '../../mixins/notifications-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import './send-back-modal';
import {SendBackModalEl} from './send-back-modal';
import './feedback-modal';
import {FeedbackModalEl} from './feedback-modal';
import '../error-modal';
import {ErrorModalEl} from '../error-modal';
import '../report-status';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import '../etools-prp-number';
import '../etools-prp-permissions';
import '../indicator-details';
import {IndicatorDetailsEl} from '../indicator-details';
import '../reportable-meta';
import {sharedStyles} from '../../styles/shared-styles';
import {buttonsStyles} from '../../styles/buttons-styles';
import {
  clusterIndicatorReportsSubmit,
  clusterIndicatorReportsUpdate
} from '../../redux/actions/clusterIndicatorReports';

import {GenericObject} from '../../typings/globals.types';
import {fireEvent} from '../../utils/fire-custom-event';
import {PaperListboxElement} from '@polymer/paper-listbox/paper-listbox';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin RoutingMixin
 */
class ClusterReport extends UtilsMixin(LocalizeMixin(NotificationsMixin(RoutingMixin(ReduxConnectedElement)))) {
  public static get template() {
    // language=HTML
    return html`
      ${sharedStyles} ${buttonsStyles}
      <style include="iron-flex iron-flex-alignment iron-flex-factors">
        :host {
          display: block;

          --paper-item-icon-width: auto;
        }

        a {
          color: var(--theme-primary-color);
        }

        .report {
          background: var(--paper-grey-200);
        }

        .report__meta {
          padding: 10px;
          color: var(--paper-grey-600);
        }

        .report__meta .first-column {
          flex-basis: 40%;
        }

        .report__meta .column {
          box-sizing: border-box;
          min-width: 0;
        }

        .report__meta .column:not(:first-child) {
          padding-left: 1em;
        }

        .report__meta a {
          color: var(--theme-primary-color);
          text-decoration: none;
        }

        .report__meta paper-button {
          margin: 0;
        }

        .report__meta report-status {
          --status-badge-size: 12px;

          margin-right: 1.5em;
          font-size: 11px;
          color: var(--theme-primary-text-color-dark);
        }

        .report__meta report-status + dl {
          display: inline;
        }

        .report__meta dl {
          margin: 0;
          font-size: 11px;
        }

        .report__meta dl:not(:first-of-type) {
          margin-top: 0.5em;
        }

        .report__meta dt,
        .report__meta dd {
          display: inline;
          margin: 0;
        }

        .report__toggle {
          width: 25px;
          position: relative;
          z-index: 1;
          color: white;
          background: var(--theme-primary-color);
          cursor: pointer;
        }

        .special-report-cluster .report__toggle {
          background: #0099ff;
        }

        .special-report-ip .report__toggle {
          background: #009d55;
        }

        .reportable {
          padding: 6px 25px 6px 10px;
          background: var(--paper-grey-300);
        }

        .reportable__title h3 {
          margin: 0;
          font-size: 14px;
        }

        .status-badge {
          margin-right: 10px;
        }

        .reportable__target {
          width: 250px;
          padding-left: 10px;
        }

        .reportable__target dl {
          margin: 0;
          text-align: right;
          font-size: 11px;
        }

        .reportable__target dt {
          color: var(--theme-secondary-text-color);
        }

        .reportable__target dd {
          margin: 0;
          font-weight: bold;
        }

        .iron-collapse-opened {
          @apply --cluster-report-content;

          background: white;
        }

        .draft-badge {
          display: inline-block;
          padding: 0 5px;
          border-radius: 2px;
          font-size: 10px;
          text-transform: uppercase;
          color: white;
          background: var(--paper-grey-500);
        }

        reportable-meta {
          padding: 25px;
        }

        paper-listbox {
          white-space: nowrap;
        }

        paper-listbox a {
          color: inherit;
        }

        paper-listbox iron-icon {
          margin-right: 0.25em;
        }

        indicator-details {
          padding-top: 15px;
        }
      </style>

      <etools-prp-permissions permissions="{{ permissions }}"> </etools-prp-permissions>

      <iron-location query="{{ query }}"> </iron-location>

      <iron-query-params params-string="{{ query }}" params-object="{{ queryParams }}"> </iron-query-params>

      <iron-query-params params-string="{{ exportQuery }}" params-object="{{ exportParams }}"> </iron-query-params>

      <etools-prp-ajax id="submit" url="[[reportUrl]]" method="post"> </etools-prp-ajax>

      <etools-prp-ajax
        id="update"
        url="[[reportUrl]]"
        body="[[reportMeta]]"
        method="patch"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <div class$="report [[containerClassName]]">
        <div class="layout horizontal">
          <div
            class="report__toggle flex-none layout horizontal center-center"
            on-tap="_toggle"
            toggles="[[index]]"
            role="button"
            aria-expanded$="[[opened]]"
            aria-controls$="collapse"
            tabindex="-1"
          >
            <iron-icon icon="icons:expand-[[_computeIcon(opened)]]"> </iron-icon>
          </div>

          <div class="flex layout vertical">
            <div class="report__meta layout horizontal">
              <div class="first-column column flex-none">
                <report-status status="[[data.report_status]]"></report-status>
                <dl>
                  <template is="dom-if" if="[[!_equals(mode, 'view')]]" restamp="true">
                    <dt>[[localize('due_date')]]:</dt>
                    <dd>[[data.due_date]]</dd>
                  </template>
                  <template is="dom-if" if="[[_equals(mode, 'view')]]" restamp="true">
                    <dt>[[localize('date_of_submission')]]:</dt>
                    <dd>[[data.submission_date]]</dd>
                  </template>
                </dl>
                <dl>
                  <dt>[[localize('reporting_period')]]:</dt>
                  <dd>[[data.reporting_period]]</dd>
                </dl>
                <dl>
                  <dt>[[localize('calculation_methods')]]:</dt>
                  <dd>
                    [[data.reportable.blueprint.calculation_formula_across_locations]] (across locations),
                    [[_calculationFormulaAcrossPeriods(data)]] (across reporting periods)
                  </dd>
                </dl>
              </div>
              <div class="column flex">
                <template is="dom-if" if="[[data.partner]]" restamp="true">
                  <dl>
                    <dt>[[localize('partner')]]:</dt>
                    <dd>[[_withDefault(data.partner.title)]]</dd>
                  </dl>
                </template>
                <template is="dom-if" if="[[data.project]]" restamp="true">
                  <dl>
                    <dt>[[localize('project')]]:</dt>
                    <dd>
                      <a href="[[partnerProjectDetailUrl]]">
                        [[_withDefault(data.project.title)]]
                      </a>
                    </dd>
                  </dl>
                </template>
                <template is="dom-if" if="[[data.partner_activity]]" restamp="true">
                  <dl>
                    <dt>[[localize('activity')]]:</dt>
                    <dd>
                      <a href="[[partnerActivityDetailUrl]]">
                        [[_withDefault(data.partner_activity.title)]]
                      </a>
                    </dd>
                  </dl>
                </template>
                <template is="dom-if" if="[[data.cluster_objective]]" restamp="true">
                  <dl>
                    <dt>[[localize('cluster_objective')]]:</dt>
                    <dd>
                      <a href="[[clusterObjectiveDetailUrl]]">
                        [[_withDefault(data.cluster_objective.title)]]
                      </a>
                    </dd>
                  </dl>
                </template>
                <template is="dom-if" if="[[data.cluster_activity]]" restamp="true">
                  <dl>
                    <dt>[[localize('cluster_activity')]]:</dt>
                    <dd>
                      <a href="[[clusterActivityDetailUrl]]">
                        [[_withDefault(data.cluster_activity.title)]]
                      </a>
                    </dd>
                  </dl>
                </template>
              </div>
              <template is="dom-if" if="[[data.is_draft]]" restamp="true">
                <div class="column layout horizontal center-center flex-none">
                  <span class="draft-badge">[[localize('draft')]]</span>
                </div>
              </template>
              <div class="column layout horizontal center-center flex-none">
                <template is="dom-if" if="[[!_equals(submitMode, 'view')]]" restamp="true">
                  <paper-button class="btn-primary" disabled="[[!canSubmit]]" on-tap="_submit" raised>
                    [[localize('submit')]]
                  </paper-button>
                </template>

                <template is="dom-if" if="[[_equals(mode, 'view')]]" restamp="true">
                  <send-back-modal id="sendBackModal" report="[[data]]"> </send-back-modal>

                  <paper-menu-button dynamic-align>
                    <paper-icon-button icon="icons:more-vert" class="dropdown-trigger"></paper-icon-button>
                    <paper-listbox id="viewMenu" class="dropdown-content" selected="2">
                      <template is="dom-if" if="[[canSendBack]]">
                        <paper-icon-item on-tap="_sendBack">
                          <iron-icon icon="icons:reply" item-icon></iron-icon>
                          [[localize('send_back_to_partner')]]
                        </paper-icon-item>
                      </template>

                      <a href="[[exportUrl]]" target="_blank" tabindex="-1">
                        <paper-icon-item>
                          <iron-icon icon="icons:file-download" item-icon></iron-icon>
                          [[localize('export')]]
                        </paper-icon-item>
                      </a>

                      <div></div>
                    </paper-listbox>
                  </paper-menu-button>
                </template>

                <template is="dom-if" if="[[showFeedback]]" restamp="true">
                  <feedback-modal id="feedbackModal" report="[[data]]"> </feedback-modal>
                  <paper-menu-button dynamic-align>
                    <paper-icon-button icon="icons:more-vert" class="dropdown-trigger"></paper-icon-button>
                    <paper-listbox id="nonViewMenu" class="dropdown-content" selected="1">
                      <paper-icon-item on-tap="_viewFeedback">
                        <iron-icon icon="icons:announcement" item-icon></iron-icon>
                        [[localize('view_feedback')]]
                      </paper-icon-item>

                      <div></div>
                    </paper-listbox>
                  </paper-menu-button>
                </template>
              </div>
            </div>
            <div class="reportable layout horizontal">
              <div class="reportable__title flex-3 layout vertical center-justified">
                <div class="layout horizontal">
                  <template is="dom-if" if="[[!_equals(mode, 'view')]]" restamp="true">
                    <div class="status-badge layout vertical center-justified">
                      <report-status status="[[_computeCompleteIndicator(data.is_complete)]]" no-label> </report-status>
                    </div>
                  </template>
                  <h3>[[data.indicator_name]]</h3>
                </div>
              </div>
              <div class="reportable__target flex-none layout vertical center-justified">
                <dl class="layout horizontal justified">
                  <dt class="flex-3">[[localize('target')]]:</dt>
                  <dd class="flex">
                    <template is="dom-if" if="[[_equals(indicatorType, 'number')]]" restamp="true">
                      <etools-prp-number value="[[data.reportable.target.v]]"></etools-prp-number>
                    </template>
                    <template is="dom-if" if="[[_equals(indicatorType, 'percentage')]]" restamp="true">
                      <span>[[data.reportable.target.v]]%</span>
                    </template>
                    <template is="dom-if" if="[[_equals(indicatorType, 'ratio')]]" restamp="true">
                      <span>
                        <etools-prp-number value="[[data.reportable.target.v]]"></etools-prp-number>
                        /
                        <etools-prp-number value="[[data.reportable.target.d]]"></etools-prp-number>
                      </span>
                    </template>
                  </dd>
                </dl>
                <dl class="layout horizontal justified">
                  <dt class="flex-3">[[localize('total_cumulative_progress')]]:</dt>
                  <template is="dom-if" if="[[_equals(indicatorType, 'number')]]" restamp="true">
                    <dd class="flex">
                      <etools-prp-number value="[[data.reportable.achieved.v]]"></etools-prp-number>
                    </dd>
                  </template>
                  <template is="dom-if" if="[[!_equals(indicatorType, 'number')]]" restamp="true">
                    <dd class="flex">[[_formatIndicatorValue(indicatorType, data.reportable.achieved.c, 1)]]</dd>
                  </template>
                </dl>
                <dl class="layout horizontal justified">
                  <dt class="flex-3">[[localize('achievement_in_reporting_period')]]:</dt>
                  <template is="dom-if" if="[[_equals(indicatorType, 'number')]]" restamp="true">
                    <dd class="flex">
                      <etools-prp-number value="[[data.total.v]]"></etools-prp-number>
                    </dd>
                  </template>
                  <template is="dom-if" if="[[!_equals(indicatorType, 'number')]]" restamp="true">
                    <dd class="flex">[[_formatIndicatorValue(indicatorType, data.total.c, 1)]]</dd>
                  </template>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div>
          <iron-collapse id="collapse" opened="{{opened}}" on-opened-changed="_handleOpenedChanged" no-animation>
            <reportable-meta data="[[data]]" mode="[[editMode]]" allow-no-status is-cluster> </reportable-meta>

            <indicator-details
              reportable-id="[[data.reportable.id]]"
              indicator-name="[[data.indicator_name]]"
              indicator-id="[[data.id]]"
              reporting-period="[[data.reporting_period]]"
              override-mode="[[editMode]]"
            >
            </indicator-details>
          </iron-collapse>
        </div>
      </div>

      <error-modal id="error"></error-modal>
    `;
  }

  @property({type: Object})
  projects!: GenericObject;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Boolean})
  opened!: boolean;

  @property({type: String})
  mode!: string;

  @property({type: Object})
  reportMeta!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  app!: string;

  @property({type: Boolean})
  busy = false;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Object, computed: '_computeExportParams(queryParams, data)'})
  exportParams!: GenericObject;

  @property({type: Boolean, computed: '_computeCanSubmit(data, busy)'})
  canSubmit!: boolean;

  @property({type: String, computed: '_computeClusterObjectiveDetailUrl(_baseUrlCluster, data.cluster_objective.id)'})
  clusterObjectiveDetailUrl!: string;

  @property({type: String, computed: '_computeClusterActivityDetailUrl(_baseUrlCluster, data.cluster_activity.id)'})
  clusterActivityDetailUrl!: string;

  @property({type: String, computed: '_computePartnerProjectDetailUrl(_baseUrlCluster, data.project.id)'})
  partnerProjectDetailUrl!: string;

  @property({type: String, computed: '_computePartnerActivityDetailUrl(_baseUrlCluster, data.partner_activity.id)'})
  partnerActivityDetailUrl!: string;

  @property({type: String, computed: '_computeReportUrl(data)'})
  reportUrl!: string;

  @property({type: String, computed: '_computeExportUrl(responsePlanId, exportQuery)'})
  exportUrl!: string;

  @property({type: String, computed: '_computeIndicatorType(data)'})
  indicatorType!: string;

  @property({type: String, computed: '_computeEditMode(mode, data, permissions)'})
  editMode!: string;

  @property({type: String, computed: '_computeSubmitMode(mode, data, permissions)'})
  submitMode!: string;

  @property({type: Boolean, computed: '_computeCanSendBack(data, permissions)'})
  canSendBack!: boolean;

  @property({type: Boolean, computed: '_computeShowFeedback(data, permissions)'})
  showFeedback!: boolean;

  @property({type: String, computed: '_computeContainerClassName(data, app)'})
  containerClassName!: string;

  _calculationFormulaAcrossPeriods(indicator: any) {
    return indicator.reportable.blueprint.display_type === 'ratio'
      ? 'latest'
      : indicator.reportable.blueprint.calculation_formula_across_periods;
  }

  _computeIcon(opened: string) {
    return opened ? 'less' : 'more';
  }

  _computeCanSubmit(data: any, busy: boolean) {
    if (!data) {
      return;
    }
    return data.can_submit && !busy;
  }

  _computeClusterObjectiveDetailUrl(baseUrl: string, coId: any) {
    if (!coId) {
      return;
    }
    return this.buildUrl(baseUrl, 'response-parameters/clusters/objective/' + String(coId) + '/overview');
  }

  _computeClusterActivityDetailUrl(baseUrl: string, caId: any) {
    if (!caId) {
      return;
    }
    return this.buildUrl(baseUrl, 'response-parameters/clusters/activity/' + String(caId) + '/overview');
  }

  _computePartnerProjectDetailUrl(baseUrl: string, paId: any) {
    if (!paId) {
      return;
    }
    return this.buildUrl(baseUrl, 'response-parameters/partners/project/' + String(paId) + '/overview');
  }

  _computePartnerActivityDetailUrl(baseUrl: string, paId: any) {
    if (!paId) {
      return;
    }
    return this.buildUrl(baseUrl, 'response-parameters/partners/activity/' + String(paId) + '/overview');
  }

  _computeReportUrl(data: GenericObject) {
    if (!data) {
      return;
    }
    return Endpoints.indicatorData(data.id);
  }

  _computeExportUrl(responsePlanId: string, query: any) {
    if (!responsePlanId) {
      return;
    }

    return [Endpoints.clusterIndicatorReportsExport(responsePlanId), '?', query].join('');
  }

  _computeIndicatorType(data: GenericObject) {
    return data ? data.reportable.blueprint.display_type : undefined;
  }

  _computeCompleteIndicator(complete: string) {
    return complete ? 'Met' : 'Ove';
  }

  _toggle() {
    (this.$.collapse as any).toggle();
  }

  _handleOpenedChanged(e: CustomEvent, data: GenericObject) {
    e.stopPropagation();

    if (data && data.value) {
      const indicatorDetails = (e.target as HTMLElement)!.querySelector('indicator-details') as IndicatorDetailsEl;
      try {
        if (indicatorDetails) {
          indicatorDetails.init();
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  _submit() {
    this.set('busy', true);

    this._confirmIntent()
      .then(this._commit.bind(this))
      .catch((_err: any) => {
        this._revert.bind(this);
      });
  }

  _confirmIntent() {
    const deferred = this._deferred();
    fireEvent(this, 'report-submit-confirm', deferred);
    this.set('busy', false);

    return deferred.promise;
  }

  _commit() {
    const submitThunk = (this.$.submit as EtoolsPrpAjaxEl).thunk();
    const self = this;

    return (
      this.reduxStore
        .dispatch(clusterIndicatorReportsSubmit(submitThunk))
        // @ts-ignore
        .then(function () {
          self.set('busy', false);
          fireEvent(self, 'report-submitted', self.data.id);
        })
        .catch((res: any) => {
          const errors = res.data.non_field_errors;

          return (self.$.error as ErrorModalEl).open(errors).then(() => {
            return Promise.reject(); // Revert
          });
        })
    );
  }

  _revert() {
    this.set('busy', false);
  }

  _onReportComplete(e: CustomEvent) {
    e.stopPropagation();
    // update `can_submit` property from `data` to enable Submit button,
    // `data` is coming from `redux clusterDashboardData.overdue_indicator_reports`,
    // this will not be updated because will trigger re-rendering of all
    // cluster-reports (`List of overdue indicator reports` from dashboard)
    this.set('data', {...this.data, can_submit: true});
  }

  _updateMeta(e: CustomEvent) {
    const self = this;
    const updateThunk = (this.$.update as EtoolsPrpAjaxEl).thunk();

    e.stopPropagation();
    const reportMetaData = e.detail;
    this.set('reportMeta', reportMetaData);

    (this.$.update as EtoolsPrpAjaxEl).abort();
    this.reduxStore
      .dispatch(clusterIndicatorReportsUpdate(updateThunk, this.data.id))
      // @ts-ignore
      .then(() => {
        // update `data` property with changes from `reportable-meta`
        this.set('data', {...this.data, ...reportMetaData});
        self._notifyChangesSaved();
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  _computeExportParams(queryParams: any, data: GenericObject) {
    return Object.assign({}, queryParams, {
      indicator: data.reportable.id
    });
  }

  _computeEditMode(mode: string, data: GenericObject, permissions: any) {
    if (mode === 'view') {
      return mode;
    }
    if (!permissions || !data) {
      return;
    }

    const canEdit = permissions.editIndicatorReport(data);

    return canEdit ? mode : 'view';
  }

  _computeSubmitMode(mode: string, data: GenericObject, permissions: any) {
    if (mode === 'view') {
      return mode;
    }
    if (!permissions || !data) {
      return;
    }

    const canSubmit = permissions.submitIndicatorReport(data);
    return canSubmit ? mode : 'view';
  }

  _computeCanSendBack(data: GenericObject, permissions: any) {
    if (!data || !permissions) {
      return;
    }
    return (data.report_status === 'Sub' || data.report_status === 'Acc') && permissions.sendBackIndicatorReport;
  }

  _computeShowFeedback(data: GenericObject, permissions: any) {
    if (!data || !permissions) {
      return;
    }
    return data.report_status === 'Sen' && permissions.editIndicatorReport(data);
  }

  _sendBack() {
    (this.shadowRoot!.querySelector('#sendBackModal') as SendBackModalEl).open();

    setTimeout(() => {
      (this.shadowRoot!.querySelector('#viewMenu') as PaperListboxElement).select(2);
    });
  }

  _viewFeedback() {
    (this.shadowRoot!.querySelector('#feedbackModal') as FeedbackModalEl).open();

    setTimeout(() => {
      (this.shadowRoot!.querySelector('#nonViewMenu') as PaperListboxElement).select(1);
    });
  }

  _computeContainerClassName(data: GenericObject, app: string) {
    if (!data) {
      return;
    }
    switch (true) {
      case !!data.child_ir_ids && app === 'cluster-reporting':
        return 'special-report-cluster';

      case !!data.parent_ir_id && app === 'ip-reporting':
        return 'special-report-ip';

      default:
        return '';
    }
  }

  _addEventListeners() {
    this._onReportComplete = this._onReportComplete.bind(this);

    this.addEventListener('report-complete', this._onReportComplete as any);
    this._updateMeta = this._updateMeta.bind(this);
    this.addEventListener('reportable-meta-changed', this._updateMeta as any);
  }

  _removeEventListeners() {
    this.removeEventListener('report-complete', this._onReportComplete as any);
    this.removeEventListener('reportable-meta-changed', this._updateMeta as any);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.submit as EtoolsPrpAjaxEl).abort();

    (this.$.error as ErrorModalEl).close();
    (this.$.update as EtoolsPrpAjaxEl).abort();
    this._removeEventListeners();
  }
}

window.customElements.define('cluster-report', ClusterReport);
