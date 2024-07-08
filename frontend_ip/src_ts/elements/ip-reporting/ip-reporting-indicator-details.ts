import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
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

@customElement('ip-reporting-indicator-details')
export class IpReportingIndicatorDetails extends LocalizeMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    /* Insert component-specific styles here */
  `;

  @property({type: String})
  indicatorDetailUrl = '';

  @property({type: Number})
  selected = 0;

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

  stateChanged(state: RootState) {
    if (this.loading != state.indicators.loadingDetails) {
      this.loading = state.indicators.loadingDetails;
    }
    if (this.dataDict != state.indicators.details) {
      this.dataDict = state.indicators.details;
    }

    if (this.appName != state.app.current) {
      this.appName = state.app.current;
    }

    if (this.locations != bucketByLocation(this.data)) {
      this.locations = bucketByLocation(this.data);
    }

    this.params = computeParams(false);
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('indicator')) {
      this.indicatorDetailUrl = computeIndicatorReportsUrl(this.indicator!);
    }

    if (changedProperties.has('dataDict') && this.dataDict) {
      this.data = this.dataDict.details[this.indicator!.id];
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
      const ajaxElement = this.shadowRoot!.querySelector('#indicatorDetail') as any as EtoolsPrpAjaxEl;
      const thunk = ajaxElement.thunk();
      store.dispatch(fetchIndicatorDetails(thunk, this.indicator!.id));
    } else {
      (this.shadowRoot!.querySelector('#indicatorDetail') as any as EtoolsPrpAjaxEl).abort();
    }
  }

  render() {
    return html`
      <style include="iron-flex iron-flex-alignment iron-flex-factors app-grid-style">
        :host {
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
          background: var(--paper-grey-100);
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
          color: var(--paper-grey-600);
        }

        .report-meta labelled-item {
          margin: 1em 0;
        }
      </style>

      <etools-prp-ajax id="indicatorDetail" url="${this.indicatorDetailUrl}" .params="${this.params}">
      </etools-prp-ajax>

      ${
        this.loading
          ? html`
              <div class="loading-wrapper">
                <etools-loading no-overlay></etools-loading>
              </div>
            `
          : ''
      }
      ${
        computeHidden(this.data, true)
          ? html`
              <div class="report-meta app-grid">
                ${(this.data || []).map(
                  (report) => html`
                    <div class="item">
                      <dl>
                        <dt>${this.localize('submitted')}:</dt>
                        <dd>${report.submission_date}</dd>
                      </dl>
                      <dl>
                        <dt>${this.localize('total_progress')}:</dt>
                        <dd>
                          ${report.display_type === 'number'
                            ? html`<etools-prp-number value="${report.total.v}"></etools-prp-number>`
                            : html`${this._formatIndicatorValue(report.display_type, report.total.c, 1)}`}
                        </dd>
                      </dl>
                      <dl>
                        <dt>${this.localize('progress_in_reporting_period')}:</dt>
                        <dd class="reporting-period">${report.time_period_start} - ${report.time_period_end}</dd>
                      </dl>
                    </div>
                  `
                )}
              </div>
            `
          : html``
      }

      <list-placeholder .data="${this.data}" .loading="${this.loading}" .message="${this.localize('no_report_data')}">
      </list-placeholder>

      ${
        computeHidden(this.locations, true)
          ? html`
              <paper-tabs
                .selected="${this.selected}"
                .fallbackSelection="location-${this.locations[0]?.current.id}"
                attr-for-selected="name"
                scrollable
              >
                ${(this.locations || []).map(
                  (location) => html` <paper-tab name="location-${location.current.id}"> ${location.name} </paper-tab>`
                )}
              </paper-tabs>
            `
          : html``
      }

      ${(this.locations || []).map(
        (location) => html`<div name="location-${location.current.id}">
          <div class="app-grid">
            ${location.current
              ? html`
                  <div class="item">
                    <disaggregation-table
                      .data="${JSON.stringify(location.current)}"
                      .mapping="${JSON.stringify(location.reportInfo.current.disagg_lookup_map)}"
                    >
                    </disaggregation-table>
                  </div>
                `
              : html``}
            ${location.previous
              ? html`
                  <div class="item">
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
      </template>
    `;
  }
}
