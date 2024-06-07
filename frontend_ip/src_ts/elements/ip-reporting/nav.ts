import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-item/paper-item';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/social-icons';
import '@polymer/iron-selector/iron-selector';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import PageNavMixin from '../../etools-prp-common/mixins/page-nav-mixin';
import '../../etools-prp-common/elements/etools-prp-permissions';
import {pageNavStyles} from '../../styles/page-nav-styles';
import {getCorrespondingEtoolsEnvironment} from '../../etools-prp-common/config';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin PageNavMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin LocalizeMixin
 */
class IpReportingNav extends MatomoMixin(LocalizeMixin(RoutingMixin(PageNavMixin(UtilsMixin(ReduxConnectedElement))))) {
  static get template() {
    return html`
      ${pageNavStyles}
      <style>
        hr {
          color: #212121;
          opacity: 0.2;
        }
      </style>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <div class="nav-menu">
        <iron-selector selected="[[selected]]" attr-for-selected="name" selectable="paper-item" role="navigation">
          <paper-item name="overview" class="nav-menu-item">
            <a href="[[overviewUrl]]" on-tap="trackAnalytics" tracker="Overview">
              <span><iron-icon icon="social:public" role="presentation"></iron-icon>[[localize('overview')]]</span>
            </a>
          </paper-item>

          <paper-item name="pd" class="nav-menu-item">
            <a href="[[_appendQuery(pdUrl, pdQuery)]]" on-tap="trackAnalytics" tracker="Programme Documents">
              <span
                ><iron-icon icon="description" role="presentation"></iron-icon>[[localize('programme_documents')]]</span
              >
            </a>
          </paper-item>

          <paper-item name="progress-reports" class="nav-menu-item">
            <a
              href="[[_appendQuery(progressReportsUrl, reportsQuery)]]"
              on-tap="trackAnalytics"
              tracker="Progress Reports"
            >
              <span><iron-icon icon="assignment" role="presentation"></iron-icon>[[localize('progress_reports')]]</span>
            </a>
          </paper-item>

          <paper-item name="indicators" class="nav-menu-item">
            <a
              href="[[_appendQuery(indicatorsReportsUrl, indicatorsQuery)]]"
              on-tap="trackAnalytics"
              tracker="Indicators"
            >
              <span><iron-icon icon="trending-up" role="presentation"></iron-icon>[[localize('indicators')]]</span>
            </a>
          </paper-item>

          <hr />
          <paper-item name="id-management" class="nav-menu-item">
            <a href="[[getAMPUrl()]]" target="_blank">
              <span><iron-icon icon="social:people" role="presentation"></iron-icon>[[localize('amp')]]</span>
            </a>
          </paper-item>
        </iron-selector>

        <div class="nav-menu-item section-title">
          <hr />
          <paper-item name="indicators">
            <a href="https://prphelp.zendesk.com/" target="_blank" on-tap="trackAnalytics" tracker="Knowledge base">
              <span
                ><iron-icon icon="communication:import-contacts" role="presentation"></iron-icon
                >[[localize('knowledge_base')]]</span
              >
            </a>
          </paper-item>
        </div>
      </div>
    `;
  }

  @property({type: String})
  selected!: any;

  @property({type: String, computed: "buildUrl(_baseUrl, 'overview')"})
  overviewUrl!: string;

  @property({type: String, computed: "buildUrl(_baseUrl, 'pd')"})
  pdUrl!: string;

  @property({type: String, computed: "buildUrl(_baseUrl, 'progress-reports')"})
  progressReportsUrl!: string;

  @property({type: String, computed: "buildUrl(_baseUrl, 'indicators')"})
  indicatorsReportsUrl!: string;

  @property({type: Object})
  pdQuery = {status: String(['signed', 'active', 'suspended'])};

  @property({type: Object})
  reportsQuery = {status: String(['Due', 'Ove', 'Sen'])};

  @property({type: Object})
  indicatorsQuery = {pd_statuses: String(['active'])};

  getAMPUrl() {
    return `${getCorrespondingEtoolsEnvironment()}/amp/`;
  }
}

window.customElements.define('ip-reporting-nav', IpReportingNav);
