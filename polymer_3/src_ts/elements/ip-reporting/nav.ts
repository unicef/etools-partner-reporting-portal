import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-item/paper-item.js';
import '@polymer/app-layout/paper-divider/paper-divider.js';
import '@polymer/app-layout/iron-icon/iron-icon.js';
import '@polymer/app-layout/iron-icons/iron-icons.js';
import '@polymer/app-layout/iron-icons/social-icons.js';
import '@polymer/iron-pages/paper-listbox/paper-listbox.js';
import '@polymer/app-localize-behavior/app-localize-behavior.js';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import PageNavMixin from '../../mixins/page-nav-mixin';
import '../etools-prp-permissions';
// <link rel="import" href="../../styles/page-nav.html">

// (dci)
// behaviors: [
// App.Behaviors.UtilsBehavior,
// App.Behaviors.PageNavBehavior,
// App.Behaviors.ReduxBehavior,
// App.Behaviors.RoutingBehavior,
// App.Behaviors.LocalizeBehavior,
// Polymer.AppLocalizeBehavior,
// ]

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin PageNavMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin LocalizeMixin
 */
class IpReportingNav extends LocalizeMixin(RoutingMixin(PageNavMixin(UtilsMixin(ReduxConnectedElement)))) {

  static get template() {
    return html`
    <style include="page-nav-styles"></style>

    <etools-prp-permissions
      permissions="{{ permissions }}">
    </etools-prp-permissions>

    <paper-listbox
      id="menu"
      selected="{{selected}}"
      attr-for-selected="name"
      selectable="paper-item"
      key-event-target="null">

      <div class="nav-content">
        <div>
          <paper-item name="overview">
            <a href="[[overviewUrl]]">
              <span><iron-icon icon="social:public" role="presentation"></iron-icon>[[localize('overview')]]</span>
            </a>
          </paper-item>

          <paper-item name="pd">
            <a href="[[_appendQuery(pdUrl, pdQuery)]]">
            <span><iron-icon icon="description"
                             role="presentation"></iron-icon>[[localize('programme_documents')]]</span>
            </a>
          </paper-item>

          <paper-item name="progress-reports">
            <a href="[[_appendQuery(progressReportsUrl, reportsQuery)]]">
              <span><iron-icon icon="assignment" role="presentation"></iron-icon>[[localize('progress_reports')]]</span>
            </a>
          </paper-item>

          <paper-item name="indicators">
            <a href="[[_appendQuery(indicatorsReportsUrl, indicatorsQuery)]]">
              <span><iron-icon icon="trending-up" role="presentation"></iron-icon>[[localize('indicators')]]</span>
            </a>
          </paper-item>

          <template is="dom-if" if="[[permissions.accessIpIdManagement]]" restamp="true">
            <paper-divider></paper-divider>

            <paper-item name="id-management" on-tap="goToIdManagement">
              <a href="/id-management/ip-reporting/">
                <span><iron-icon icon="social:people"
                                 role="presentation"></iron-icon>[[localize('id_management')]]</span>
              </a>
            </paper-item>
          </template>

        </div>

        <div>
          <paper-divider></paper-divider>
          <paper-item name="indicators">
            <a href="https://prphelp.zendesk.com/" target="_blank">
              <span><iron-icon icon="communication:import-contacts" role="presentation"></iron-icon>[[localize('knowledge_base')]]</span>
            </a>
          </paper-item>
        </div>
      </div>
    </paper-listbox>
  `;
  }

  goToIdManagement(e: CustomEvent) {
    e.preventDefault();
    window.location.href = '/id-management/ip-reporting/';
  }

  @property({type: String, computed: 'buildUrl(_baseUrl, \'overview\')'})
  overviewUrl!: string;

  @property({type: String, computed: 'buildUrl(_baseUrl, \'pd\')'})
  pdUrl!: string;

  @property({type: String, computed: 'buildUrl(_baseUrl, \'progress-reports\')'})
  progressReportsUrl!: string;

  @property({type: String, computed: 'buildUrl(_baseUrl, \'indicators\')'})
  indicatorsReportsUrl!: string;

  @property({type: Object})
  pdQuery = {status: String(['Sig', 'Act', 'Sus'])};

  @property({type: Object})
  reportsQuery = {status: String(['Due', 'Ove', 'Sen'])};

  @property({type: Object})
  indicatorsQuery = {pd_statuses: String(['Act'])};

}

window.customElements.define('ip-reporting-nav', IpReportingNav);
