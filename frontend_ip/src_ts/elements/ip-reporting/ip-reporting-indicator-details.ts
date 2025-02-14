import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../redux/store';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {fetchIndicatorDetails} from '../../redux/actions/indicators';
import '../../etools-prp-common/elements/labelled-item';
import '../../etools-prp-common/elements/report-status';
import '../../etools-prp-common/elements/disaggregations/disaggregation-table';
import '../../etools-prp-common/elements/list-placeholder';
import {
  computeParams,
  computeIndicatorReportsUrl,
  bucketByLocation,
  computeHidden
} from './js/ip-reporting-indicator-details-functions';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {debounce} from 'lodash-es';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-tabs';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

@customElement('ip-reporting-indicator-details')
export class IpReportingIndicatorDetails extends UtilsMixin(connect(store)(LitElement)) {
  @property({type: String})
  indicatorDetailUrl = '';

  @property({type: String})
  selected = '';

  @property({type: Boolean})
  isOpen = false;

  @property({type: Object})
  indicator: any | null = null;

  @property({type: Boolean})
  loading = false;

  @property({type: Array})
  data: any[] = [];

  @property({type: Object})
  dataDict: any | null = null;

  @property({type: Array})
  locations: any[] = [];

  @property({type: String})
  appName?: string;

  @property({type: Object})
  params: any | null = null;

  @property({type: Object})
  tabs: any[] = [];

  render() {
    return html`
      <style>
        ${layoutStyles} :host {
          display: block;
          width: 100%;
        }

        .item {
          padding: 0;
        }

        .loading-wrapper {
          padding: 15px;
        }

        h4 {
          margin: 0 0 1em;
          font-size: 12px;
          font-weight: normal;
        }

        h4 > span:last-child {
          padding-left: 10px;
          text-align: right;
        }

        .reporting-period {
          color: var(--theme-primary-text-color-medium);
        }

        .report-meta {
          font-size: 12px;
          background: var(--sl-color-neutral-100);
        }

        .report-meta dt,
        .report-meta dd {
          display: inline;
          margin: 0;
        }

        .report-meta dt {
          font-weight: bold;
        }

        .report-meta dd {
          color: var(--sl-color-neutral-600);
        }

        .report-meta labelled-item {
          margin: 1em 0;
        }
      </style>

      ${this.loading
        ? html`
            <div class="loading-wrapper">
              <etools-loading no-overlay></etools-loading>
            </div>
          `
        : ''}
      ${computeHidden(this.data, this.loading)
        ? html`
            <div class="report-meta layout-horizontal row">
              ${(this.data || []).map(
                (report) => html`
                  <div class="item col-6">
                    <dl>
                      <dt>${translate('SUBMITTED')}:</dt>
                      <dd>${report.submission_date}</dd>
                    </dl>
                    <dl>
                      <dt>${translate('TOTAL_PROGRESS')}:</dt>
                      <dd>
                        ${report.display_type === 'number'
                          ? html`<etools-prp-number value="${report.total.v}"></etools-prp-number>`
                          : html`${this._formatIndicatorValue(report.display_type, report.total.c, 1)}`}
                      </dd>
                    </dl>
                    <dl>
                      <dt>${translate('PROGRESS_IN_REPORTING_PERIOD')}:</dt>
                      <dd class="reporting-period">${report.time_period_start} - ${report.time_period_end}</dd>
                    </dl>
                  </div>
                `
              )}
            </div>
          `
        : html``}

      <list-placeholder .data="${this.data}" .loading="${this.loading}" .message="${translate('NO_REPORT_DATA')}">
      </list-placeholder>

      ${computeHidden(this.locations, this.loading) && this.tabs.length
        ? html`<etools-tabs-lit
            id="tabs"
            slot="tabs"
            .tabs="${this.tabs}"
            @sl-tab-show="${({detail}: any) => (this.selected = detail.name)}"
            .activeTab="${this.selected}"
          ></etools-tabs-lit> `
        : html``}
      ${(this.locations || []).map(
        (location) =>
          html` <div
            name="location-${location.current.id}"
            ?hidden="${this.selected.toString() !== location.current.id.toString()}"
          >
            <div class="layout-horizontal row">
              ${location.current
                ? html`
                    <div class="item col-6">
                      <disaggregation-table
                        .data="${location.current}"
                        .mapping="${location.reportInfo.current.disagg_lookup_map}"
                      >
                      </disaggregation-table>
                    </div>
                  `
                : html``}
              ${location.previous
                ? html`
                    <div class="item col-6">
                      <disaggregation-table
                        .data="${location.previous}"
                        .mapping="${location.reportInfo.previous.disagg_lookup_map}"
                      >
                      </disaggregation-table>
                    </div>
                  `
                : html``}
            </div>
          </div>`
      )}
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._openChanged = debounce(this._openChanged.bind(this), 100);
  }

  stateChanged(state: RootState) {
    if (this.loading !== state.indicators.loadingDetails) {
      this.loading = state.indicators.loadingDetails;
    }

    if (state.indicators.details && !isJsonStrMatch(this.dataDict, state.indicators.details)) {
      this.dataDict = state.indicators.details;
    }

    if (this.appName !== state.app.current) {
      this.appName = state.app.current;
    }

    this.params = computeParams(false);
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('indicator')) {
      this.indicatorDetailUrl = computeIndicatorReportsUrl(this.indicator!);
    }

    if (changedProperties.has('dataDict') && this.dataDict?.details?.[this.indicator!.id]) {
      this.data = this.dataDict.details?.[this.indicator!.id];
    }

    if (changedProperties.has('data')) {
      if (!isJsonStrMatch(this.locations, bucketByLocation(this.data))) {
        this.locations = bucketByLocation(this.data);
        this.tabs = this.locations.map((location: any) => ({
          tab: location.current.id,
          tabLabel: location.name,
          hidden: false
        }));
        setTimeout(() => {
          this.selected = String(this.locations[0]?.current.id);
        }, 0);
      }
    }

    if (changedProperties.has('data') || changedProperties.has('loading')) {
      computeHidden(this.data, this.loading);
    }

    if (changedProperties.has('isOpen')) {
      this._openChanged();
    }
  }

  private _openChanged(): void {
    if (this.isOpen) {
      store.dispatch(
        fetchIndicatorDetails(
          sendRequest({
            method: 'GET',
            endpoint: {url: this.indicatorDetailUrl},
            params: this.params
          }),
          this.indicator!.id
        )
      );
    }
  }
}
