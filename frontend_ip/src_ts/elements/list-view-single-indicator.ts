import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { PaperButtonElement } from '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/iron-icons/iron-icons';
import { tableStyles } from '../etools-prp-common/styles/table-styles';
import { sharedStyles } from '../etools-prp-common/styles/shared-styles';
import '../etools-prp-common/elements/etools-prp-permissions';
import '../etools-prp-common/elements/status-badge';
import { store } from '../redux/store';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../etools-prp-common/mixins/routing-mixin';
import UtilsMixin from '../etools-prp-common/mixins/utils-mixin';
import { RootState } from '../typings/redux.types';
import { fireEvent } from '@unicef-polymer/etools-utils/dist/fire-event.util';

@customElement('list-view-single-indicator')
export class ListViewSingleIndicator extends LocalizeMixin(RoutingMixin(UtilsMixin(connect(store)(LitElement)))) {
  static styles = css`
    :host {
      display: block;
      --etools-prp-progress-bar-height: 14px;
      --list-row-collapse-wrapper: {
        padding: 0;
        background: white;
      }
      --etools-prp-progress-bar: {
        display: block;
        width: calc(100% - 35px);
      }
      --iron-icon: {
        vertical-align: text-bottom;
      }
      --iron-icon-width: 16px;
      --iron-icon-height: 16px;
    }
    a {
      @apply --link;
    }
    .button-link {
      @apply --link;
      font-size: 13px;
      text-transform: none;
    }
    .indicator-progress {
      margin: 0;
      font-size: 11px;
      line-height: 1;
    }
    .indicator-progress:not(:last-child) {
      margin-bottom: 6px;
    }
    .indicator-progress dt {
      width: 100px;
      margin-right: 10px;
      text-align: right;
      color: var(--theme-secondary-text-color);
    }
    .indicator-progress dd {
      margin: 0;
    }
    etools-prp-progress-bar {
      @apply --etools-prp-progress-bar;
    }
    .table-cell--action {
      text-align: right;
    }
    .locations-warning {
      color: #ffcc00;
    }
  `;

  @property({type: Object})
  indicator!: any;

  @property({type: Object})
  permissions!: any;

  @property({type: Boolean})
  detailsOpened = false;

  @property({type: Boolean})
  isCustom!: boolean;

  @property({type: String})
  type = '';

  render() {
    return html`
      ${tableStyles} ${sharedStyles}
      <etools-prp-permissions .permissions=${this.permissions}></etools-prp-permissions>

      <etools-data-table-row .detailsOpened=${this.detailsOpened} @opened-changed=${this.onDetailsOpenedChanged}>
        <div slot="row-data">
          <span class="table-cell table-cell--text self-center">
            ${this._flagIndicator(this.indicator?.target, this.indicator?.baseline, this.isCustom)
              ? html`<status-badge type="error"></status-badge>`
              : html``}
            ${this.indicator?.blueprint?.title}
            <paper-tooltip>${this.indicator?.blueprint?.title}</paper-tooltip>
          </span>
          ${this._equals(this.indicator?.content_type_key, 'partner.partneractivityprojectcontext')
            ? html`<span class="table-cell table-cell--text self-center">${this.indicator?.content_object_title}</span>`
            : html``}
          <span class="table-cell table-cell--text self-center"
            >${this.indicator?.blueprint?.calculation_formula_across_locations}</span
          >
          <span class="table-cell table-cell--text self-center"
            >${this.indicator?.blueprint?.calculation_formula_across_periods}</span
          >
          <span class="table-cell table-cell--text self-center">
            ${this._equals(this.indicator?.blueprint?.display_type, 'number')
              ? html`<etools-prp-number .value="${this.indicator?.baseline.v}"></etools-prp-number>`
              : this._equals(this.indicator?.blueprint?.display_type, 'percentage')
              ? html`<span><etools-prp-number .value="${this.indicator?.baseline.v}"></etools-prp-number>%</span>`
              : this._equals(this.indicator?.blueprint?.display_type, 'ratio')
              ? html`<span
                  ><etools-prp-number .value="${this.indicator?.baseline.v}"></etools-prp-number>
                  /
                  <etools-prp-number .value="${this.indicator?.baseline.d}"></etools-prp-number
                ></span>`
              : html``}
          </span>
          <span class="table-cell table-cell--text self-center">
            ${this._equals(this.indicator?.blueprint?.display_type, 'number')
              ? html`<etools-prp-number .value="${this.indicator?.target.v}"></etools-prp-number>`
              : this._equals(this.indicator?.blueprint?.display_type, 'percentage')
              ? html`<span><etools-prp-number .value="${this.indicator?.target.v}"></etools-prp-number>%</span>`
              : this._equals(this.indicator?.blueprint?.display_type, 'ratio')
              ? html`<span
                  ><etools-prp-number .value="${this.indicator?.target.v}"></etools-prp-number>
                  /
                  <etools-prp-number .value="${this.indicator?.target.d}"></etools-prp-number
                ></span>`
              : html``}
          </span>
          <span class="table-cell table-cell--text self-center"
            ><etools-prp-number .value=${this.indicator?.achieved.c}></etools-prp-number
          ></span>
          <span class="table-cell table-cell--text self-center flex-2">
            <div class="self-center flex-none">
              <dl class="indicator-progress layout horizontal">
                <dt class="flex-none self-center">${this.localize('against_target')}</dt>
                <dd class="flex-none">
                  ${this._equals(this.progressBarType, 'cluster')
                    ? html`<etools-prp-progress-bar-cluster
                        .display-type=${this.indicator?.blueprint?.display_type}
                        .number=${this.indicator?.total_against_target}
                      ></etools-prp-progress-bar-cluster>`
                    : this._equals(this.progressBarType, 'default')
                    ? html`<etools-prp-progress-bar
                        .display-type=${this.indicator?.blueprint?.display_type}
                        .number=${this.indicator?.total_against_target}
                      ></etools-prp-progress-bar>`
                    : html``}
                </dd>
              </dl>

              ${this.isClusterApp
                ? html`
                    <dl class="indicator-progress layout horizontal">
                      <dt class="flex-none self-center">${this.localize('against_in_need')}:</dt>
                      <dd class="flex-none">
                        <etools-prp-progress-bar-alt
                          .display-type=${this.indicator?.blueprint?.display_type}
                          .number=${this.indicator?.total_against_in_need}
                        ></etools-prp-progress-bar-alt>
                      </dd>
                    </dl>
                  `
                : html``}
            </div>
          </span>

          ${this.canEdit
            ? html`
                <span class="table-cell table-cell--text table-cell--action self-center">
                  <paper-button class="button-link" @click=${this._openModal} data-modal-type="edit"
                    >${this.localize('edit')}
                    ${this._showLocationsWarning(this.indicator, this.type)
                      ? html`<iron-icon
                          class="locations-warning"
                          data-modal-type="edit"
                          icon="icons:error"
                        ></iron-icon>`
                      : ''}
                  </paper-button>
                </span>
              `
            : html``}
        </div>
        <div slot="row-data-details">
          <ip-reporting-indicator-details
            .indicator=${this.indicator}
            .isOpen=${this.detailsOpened}
          ></ip-reporting-indicator-details>
        </div>
      </etools-data-table-row>
    `;
  }

  stateChanged(state: RootState) {
    if (this.appName !== state.app.current) {
      this.appName = state.app.current;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('_baseUrlCluster') || changedProperties.has('indicator')) {
      this.indicatorReportsUrl = this._computeIndicatorReportsUrl(this._baseUrlCluster, this.indicator);
    }

    if (changedProperties.has('indicator') || changedProperties.has('indicator')) {
      this.progressBarType = this._computeProgressBarType(this.indicator);
    }
  }

  _flagIndicator(target: number, baseline: number, isCustom: boolean) {
    return !isCustom && (!target || !baseline);
  }

  _openModal(e: CustomEvent) {
    (this.shadowRoot!.querySelector('#modal-' + (e.target as PaperButtonElement).dataset.modalType) as any).open();
  }

  _computeIndicatorReportsUrl(baseUrl: string, indicator: any) {
    if (!baseUrl || !indicator) {
      return '';
    }

    let query_params = 'results?page_size=10&page=1&indicator_type=';

    switch (indicator.content_type_key) {
      case 'cluster.clusterobjective':
        query_params += 'cluster_objective';
        break;
      case 'cluster.clusteractivity':
        query_params += 'cluster_activity';
        break;
      case 'partner.partnerproject':
        query_params += 'partner_project';
        break;
      case 'partner.partneractivity':
        query_params += 'partner_activity';
        break;
    }

    query_params += '&indicator=' + indicator.id.toString();

    return this.buildUrl(baseUrl, query_params); // Assuming buildUrl method is defined somewhere
  }

  _computeProgressBarType(indicator: any) {
    if (!indicator) {
      return '';
    }

    return indicator.ca_indicator_used_by_reporting_entity ? 'cluster' : 'default';
  }

  _showLocationsWarning(indicator: any, type: string) {
    return !indicator.locations.length && type !== 'ca';
  }

  onDetailsOpenedChanged(event: CustomEvent) {
    this.detailsOpened = event.detail.opened;
    fireEvent(this, 'details-opened-changed', {row: event.target, detailsOpened: event.detail.opened});
  }
}