import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import PageNavMixin from '../../etools-prp-common/mixins/page-nav-mixin';
import '../../etools-prp-common/elements/etools-prp-permissions';
import {getCorrespondingEtoolsEnvironment} from '../../etools-prp-common/config';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {pageNavStyles} from '../../styles/page-nav-styles';

// TODO add: MatomoMixin
@customElement('ip-reporting-nav')
export class IpReportingNav extends RoutingMixin(
  MatomoMixin(LocalizeMixin(PageNavMixin(UtilsMixin(connect(store)(LitElement)))))
) {
  @property({type: String})
  selected!: any;

  @property({type: Object})
  pdQuery = {status: String(['signed', 'active', 'suspended'])};

  @property({type: Object})
  reportsQuery = {status: String(['Due', 'Ove', 'Sen'])};

  @property({type: Object})
  indicatorsQuery = {pd_statuses: String(['active'])};

  @property({type: String})
  overviewUrl!: string;

  @property({type: String})
  pdUrl!: string;

  @property({type: String})
  progressReportsUrl!: string;

  @property({type: String})
  indicatorsReportsUrl!: string;

  render() {
    return html`
      ${pageNavStyles}
      <style>
        hr {
          color: #212121;
          opacity: 0.2;
        }
      </style>

      <etools-prp-permissions .permissions="${this.permissions}"> </etools-prp-permissions>

      <div class="nav-menu">
        <iron-selector .selected="${this.selected}" attr-for-selected="name" selectable="paper-item" role="navigation">
          <paper-item name="overview" class="nav-menu-item">
            <a href="${this.overviewUrl}" @click="${this.trackAnalytics}" tracker="Overview">
              <span><iron-icon icon="social:public" role="presentation"></iron-icon>${this.localize('overview')}</span>
            </a>
          </paper-item>

          <paper-item name="pd" class="nav-menu-item">
            <a
              href="${this._appendQuery(this.pdUrl, this.pdQuery)}"
              @click="${this.trackAnalytics}"
              tracker="Programme Documents"
            >
              <span
                ><iron-icon icon="description" role="presentation"></iron-icon>${this.localize(
                  'programme_documents'
                )}</span
              >
            </a>
          </paper-item>

          <paper-item name="progress-reports" class="nav-menu-item">
            <a
              href="${this._appendQuery(this.progressReportsUrl, this.reportsQuery)}"
              @click="${this.trackAnalytics}"
              tracker="Progress Reports"
            >
              <span
                ><iron-icon icon="assignment" role="presentation"></iron-icon>${this.localize('progress_reports')}</span
              >
            </a>
          </paper-item>

          <paper-item name="indicators" class="nav-menu-item">
            <a
              href="${this._appendQuery(this.indicatorsReportsUrl, this.indicatorsQuery)}"
              @click="${this.trackAnalytics}"
              tracker="Indicators"
            >
              <span><iron-icon icon="trending-up" role="presentation"></iron-icon>${this.localize('indicators')}</span>
            </a>
          </paper-item>

          <hr />
          <paper-item name="id-management" class="nav-menu-item">
            <a href="${this.getAMPUrl()}" target="_blank">
              <span><iron-icon icon="social:people" role="presentation"></iron-icon>${this.localize('amp')}</span>
            </a>
          </paper-item>
        </iron-selector>

        <div class="nav-menu-item section-title">
          <hr />
          <paper-item name="indicators">
            <a
              href="https://prphelp.zendesk.com/"
              target="_blank"
              @click="${this.trackAnalytics}"
              tracker="Knowledge base"
            >
              <span
                ><iron-icon icon="communication:import-contacts" role="presentation"></iron-icon>${this.localize(
                  'knowledge_base'
                )}</span
              >
            </a>
          </paper-item>
        </div>
      </div>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('_baseUrl')) {
      this.overviewUrl = this.buildUrl(this._baseUrl, 'overview');
      this.pdUrl = this.buildUrl(this._baseUrl, 'pd');
      this.progressReportsUrl = this.buildUrl(this._baseUrl, 'progress-reports');
      this.indicatorsReportsUrl = this.buildUrl(this._baseUrl, 'indicators');
    }
  }

  getAMPUrl(): string {
    return `${getCorrespondingEtoolsEnvironment()}/amp/`;
  }
}
