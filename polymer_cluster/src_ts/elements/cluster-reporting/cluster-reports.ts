import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import Endpoints from '../../endpoints';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import './cluster-report-toolbar';
import './cluster-report-list';
import '../../etools-prp-common/elements/etools-prp-ajax';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import {
  clusterIndicatorReportsFetch,
  clusterIndicatorReportsFetchSingle
} from '../../redux/actions/clusterIndicatorReports';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class ClusterReports extends UtilsMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="reports" url="[[reportsUrl]]" params="[[params]]"> </etools-prp-ajax>

      <etools-prp-ajax id="refresh"> </etools-prp-ajax>

      <cluster-report-toolbar submitted="[[submitted]]"> </cluster-report-toolbar>

      <cluster-report-list mode="[[mode]]"></cluster-report-list>
    `;
  }

  @property({type: String})
  mode!: string;

  @property({type: Number})
  submitted!: number;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String, computed: '_computeReportsUrl(responsePlanId)'})
  reportsUrl!: string;

  @property({type: Object, computed: '_computeParams(queryParams)'})
  params!: GenericObject;

  private _debouncer!: Debouncer;

  static get observers() {
    return ['_onParamsChanged(reportsUrl, params)'];
  }

  _computeParams(queryParams: GenericObject) {
    return Object.assign({}, queryParams, {
      submitted: this.submitted + ''
    });
  }

  _computeReportsUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }

    return Endpoints.clusterIndicatorReports(responsePlanId);
  }

  _fetchData(reset?: boolean) {
    if (!this.reportsUrl) {
      return;
    }

    const reportsThunk = (this.$.reports as EtoolsPrpAjaxEl).thunk();
    (this.$.reports as EtoolsPrpAjaxEl).abort();

    this.reduxStore
      .dispatch(clusterIndicatorReportsFetch(reportsThunk, reset))
      // @ts-ignore
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  _onParamsChanged() {
    this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(100), () => {
      this._fetchData();
    });
  }

  _onContentsChanged(e: CustomEvent) {
    e.stopPropagation();

    this._fetchData();
  }

  _onRefreshReport(e: CustomEvent) {
    e.stopPropagation();

    const reportId = e.detail;
    const refreshAjaxEl = this.$.refresh as EtoolsPrpAjaxEl;
    refreshAjaxEl.url = Endpoints.clusterIndicatorReport(this.responsePlanId, reportId);
    const refreshThunk = refreshAjaxEl.thunk();
    refreshAjaxEl.abort();

    this.reduxStore
      .dispatch(clusterIndicatorReportsFetchSingle(refreshThunk, reportId))
      // @ts-ignore
      .catch((_err) => {
        // TODO: error handling
      });
  }

  _onTemplateFileUploaded(e: CustomEvent) {
    e.stopPropagation();

    this._fetchData(true);
  }

  _addEventListeners() {
    this._onContentsChanged = this._onContentsChanged.bind(this);
    this.addEventListener('report-submitted', this._onContentsChanged as any);
    this.addEventListener('report-reviewed', this._onContentsChanged as any);
    this._onTemplateFileUploaded = this._onTemplateFileUploaded.bind(this);
    this.addEventListener('template-file-uploaded', this._onTemplateFileUploaded as any);
    this._onRefreshReport = this._onRefreshReport.bind(this);
    this.addEventListener('refresh-report', this._onRefreshReport as any);
  }

  _removeEventListeners() {
    this.removeEventListener('report-submitted', this._onContentsChanged as any);
    this.removeEventListener('report-reviewed', this._onContentsChanged as any);
    this.removeEventListener('template-file-uploaded', this._onTemplateFileUploaded as any);
    this.removeEventListener('refresh-report', this._onRefreshReport as any);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.reports as EtoolsPrpAjaxEl).abort();
    this._removeEventListeners();
    if (this._debouncer && this._debouncer.isActive()) {
      this._debouncer.cancel();
    }
  }
}

window.customElements.define('cluster-reports', ClusterReports);
