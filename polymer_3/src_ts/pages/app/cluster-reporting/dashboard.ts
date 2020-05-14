import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../mixins/utils-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import '../../../elements/etools-prp-auth';
import '../../../elements/page-header';
import '../../../elements/page-body';
import '../../../elements/filters/cluster-filter/filter-list-by-cluster';
import '../../../elements/cluster-reporting/dashboard/indicators-by-status';
import '../../../elements/cluster-reporting/dashboard/number-of-partners';
import '../../../elements/cluster-reporting/dashboard/number-of-projects';
import '../../../elements/cluster-reporting/dashboard/number-of-due-reports';
import '../../../elements/cluster-reporting/dashboard/number-of-non-cluster-activities';
import '../../../elements/cluster-reporting/dashboard/reports-list';
import '../../../elements/cluster-reporting/dashboard/constrained-reports-list';
import '../../../elements/cluster-reporting/dashboard/activities-list';
import Constants from '../../../constants';
import Endpoints from '../../../endpoints';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {EtoolsPrpAjaxEl} from '../../../elements/etools-prp-ajax';
import {clusterDashboardDataFetch} from '../../../redux/actions/clusterDashboardData';
import {GenericObject} from '../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageClusterReportingDashboard extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  public static get template() {
    return html`
    <style include="app-grid-style">
      :host {
        display: block;

        --app-grid-columns: 2;
        --app-grid-gutter: 25px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 2;
      }

      .toolbar {
        position: relative;
        width: 225px;
      }

      filter-list-by-cluster {
        position: absolute;
        right: 0;
        top: -35px;
      }

      .row {
        margin-bottom: var(--app-grid-gutter);
      }

      .app-grid {
        margin: -var(--app-grid-gutter);
      }

      .item-wide {
        @apply --app-grid-expandible-item;
      }

      .no-padding-tl {
        padding-top: 0;
        padding-left: 0;
      }

      .max-w {
        max-width: 100%;
      }

      .max-h {
        max-height: 100%;
      }

      .zero-marg-r {
        margin-right: 0;
      }

      .zero-marg-b {
        margin-bottom: 0;
      }
    </style>

    <etools-prp-auth
      account-type="{{accountType}}">
    </etools-prp-auth>

    <iron-location
      query="{{query}}">
    </iron-location>

    <iron-query-params
      params-string="{{query}}"
      params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
      id="data"
      url="[[dataUrl]]"
      params="[[queryParams]]">
    </etools-prp-ajax>

    <page-header title="{{page_title}}">
      <div slot="toolbar" class="toolbar">
        <filter-list-by-cluster></filter-list-by-cluster>
      </div>
    </page-header>

    <page-body>
      <div class="row">
        <div class="app-grid no-padding-tl">
          <div class="item max-w">
            <indicators-by-status></indicators-by-status>
          </div>

          <div class="item max-w zero-marg-r max-h">
            <div class="app-grid no-padding-tl max-h">
              <div class="item max-w">
                <template
                  is="dom-if"
                  if="[[_equals(mode, 'cluster')]]"
                  restamp="true">
                  <number-of-partners></number-of-partners>
                </template>

                <template
                  is="dom-if"
                  if="[[_equals(mode, 'partner')]]"
                  restamp="true">
                  <number-of-projects></number-of-projects>
                </template>
              </div>
              <div class="item max-w zero-marg-r">
                <number-of-due-reports></number-of-due-reports>
              </div>
              <div class="item max-w max-h zero-marg-r zero-marg-b">
                <number-of-non-cluster-activities></number-of-non-cluster-activities>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <reports-list
          label="[[localize('list_of_overdue_indicator')]]"
          collection="overdue_indicator_reports">
        </reports-list>
      </div>

      <div class="row">
        <constrained-reports-list></constrained-reports-list>
      </div>

      <template
        is="dom-if"
        if="[[_equals(mode, 'partner')]]"
        restamp="true">
        <div class="row">
          <activities-list></activities-list>
        </div>
      </template>
    </page-body>

  `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String})
  route!: string;

  @property({type: String})
  query!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.auth.accountType)'})
  accountType!: string;

  @property({type: String, computed: '_computeMode(accountType)'})
  mode!: string;

  @property({type: String, computed: '_computePageTitle(mode, localize)'})
  page_title!: string;

  @property({type: String, computed: '_computeDataUrl(responsePlanId, mode, queryParams)'})
  dataUrl!: string;

  fetchDataDebouncer!: Debouncer;

  static get observers() {
    return [
      '_fetchData(dataUrl, queryParams)'
    ];
  }

  // @ts-ignore
  _computeMode(accountType: string) {
    if (!accountType) {
      return;
    }

    switch (accountType) {
      case Constants.ACCOUNT_TYPE_PARTNER:
        return 'partner';

      case Constants.ACCOUNT_TYPE_CLUSTER:
        return 'cluster';
    }
  }

  _computePageTitle(mode: string, localize: Function) {
    if (!mode) {
      return undefined;
    }

    switch (mode) {
      case 'partner':
        return localize('partner_dashboard');

      case 'cluster':
        return localize('cluster_dashboard');
    }
  }

  _computeDataUrl(responsePlanId: string, mode: string) {
    if (!responsePlanId || !mode) {
      return undefined;
    }
    return Endpoints.clusterDashboard(responsePlanId, mode);
  }

  _fetchData() {
    if (!this.dataUrl || !this.queryParams || Object.keys(this.queryParams).length === 0) {
      return;
    }
    const self = this;
    this.fetchDataDebouncer = Debouncer.debounce(this.fetchDataDebouncer,
      timeOut.after(300),
      () => {

        const dataThunk = (self.$.data as EtoolsPrpAjaxEl).thunk();
        (this.$.data as EtoolsPrpAjaxEl).abort();
        self.reduxStore.dispatch(clusterDashboardDataFetch(dataThunk));
      });
  }

  _addEventListeners() {
    this._fetchData = this._fetchData.bind(this);
    this.addEventListener('report-submitted', this._fetchData as any);
  }

  _removeEventListeners() {
    this.removeEventListener('report-submitted', this._fetchData as any);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.fetchDataDebouncer && this.fetchDataDebouncer.isActive()) {
      this.fetchDataDebouncer.cancel();
    }
  }

}
window.customElements.define('page-cluster-reporting-dashboard', PageClusterReportingDashboard);
