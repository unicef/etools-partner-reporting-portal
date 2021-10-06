var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/paper-item/paper-item';
import '@polymer/app-route/app-route';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/av-icons';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import LocalizeMixin from '../../mixins/localize-mixin';
import '@polymer/iron-collapse/iron-collapse';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/iron-selector/iron-selector';
import UtilsMixin from '../../mixins/utils-mixin';
import PageNavMixin from '../../mixins/page-nav-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import '../etools-prp-permissions';
import { pageNavStyles } from '../../styles/page-nav-styles';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin PageNavMixin
 * @appliesMixin RoutingMixin
 */
class ClusterReportingNav extends LocalizeMixin(PageNavMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement)))) {
    constructor() {
        super(...arguments);
        this.subMenuOpened = false;
        this.analysisQuery = {
            loc_type: 0,
        };
    }
    static get template() {
        return html `
        ${pageNavStyles}
        <style>
          hr {
            color: #212121;
            opacity: 0.2;
          }
        </style>

        <etools-prp-permissions
          permissions="{{ permissions }}">
        </etools-prp-permissions>

        <app-route route="{{route}}"></app-route>

        <iron-location
          query="{{query}}">
        </iron-location>

        <iron-query-params
          params-string="{{query}}"
          params-object="{{queryParams}}">
        </iron-query-params>


        <div class="nav-menu">
          <iron-selector selected="[[selected]]" attr-for-selected="name" selectable="paper-item" role="navigation">

              <paper-item name="dashboard" class="nav-menu-item">
                <a href="[[_appendQuery(dashboardUrl, clusterQuery)]]">
                  <span><iron-icon icon="view-quilt" role="presentation"></iron-icon>[[localize('dashboard')]]</span>
                </a>
              </paper-item>

              <paper-item opened="{{subMenuOpened}}" class$="menu-trigger [[computeMenuTriggerCss(subMenuOpened)]]">
                <a href="[[_appendQuery(responseParametersUrl, clusterQuery)]]">
                  <span><iron-icon icon="compare-arrows" role="presentation"></iron-icon>[[localize('response_parameters')]]</span>
                </a>
             </paper-item>

              <iron-collapse id="details" opened="{{subMenuOpened}}">
                  <paper-listbox class="menu-content">
                    <paper-item name="response-parameters" id="clustersSubmenu" class$="sub-menu-item [[clustersSelected]]">
                      <a href="[[_appendQuery(clustersUrl, clusterQuery)]]">[[localize('clusters')]]</a>
                    </paper-item>
                    <paper-item name="response-parameters" id="partnersSubmenu" class$="sub-menu-item [[partnersSelected]]">
                      <a href="[[_appendQuery(partnersUrl, clusterQuery)]]">[[localize('partners')]]</a>
                      </a>
                    </paper-item>
                  </paper-listbox>
              </iron-collapse>

              <template
                is="dom-if"
                if="[[canViewPlannedAction]]"
                restamp="true">
                <paper-item name="planned-action" class="nav-menu-item">
                  <a href="[[_appendQuery(plannedActionUrl, clusterQuery)]]">
                <span><iron-icon icon="av:playlist-add"
                                 role="presentation"></iron-icon>[[localize('my_planned_action')]]</span>
                  </a>
                </paper-item>
              </template>

              <paper-item name="results" class="nav-menu-item">
                <a href="[[_appendQuery(resultsUrl, clusterQuery, partnerQuery)]]">
                  <span><iron-icon icon="trending-up"
                                   role="presentation"></iron-icon>[[localize('reporting_results')]]</span>
                </a>
              </paper-item>

              <paper-item name="analysis" class="nav-menu-item">
                <a href="[[_appendQuery(analysisUrl, clusterQuery, analysisQuery, partnerQuery)]]">
                  <span><iron-icon icon="av:equalizer" role="presentation"></iron-icon>[[localize('analysis')]]</span>
                </a>
              </paper-item>

              <template is="dom-if" if="[[permissions.accessClusterIdManagement]]" restamp="true">
                <hr>
                <paper-item name="id-management" id="id-management" on-tap="goToIdManagement">
                  <a href="/id-management/cluster-reporting/">
                    <span><iron-icon icon="social:people"
                                     role="presentation"></iron-icon>[[localize('id_management')]]</span>
                  </a>
                </paper-item>
              </template>
            </div>

          </iron-selector>

          <div class="nav-menu-item section-title">
            <hr>
            <paper-item name="indicators">
              <a href="https://prphelp.zendesk.com/" target="_blank">
                <span><iron-icon icon="communication:import-contacts" role="presentation"></iron-icon>[[localize('knowledge_base')]]</span>
              </a>
            </paper-item>
          </div>

       </div>
      `;
    }
    static get observers() {
        return ['_routeChanged(route)'];
    }
    goToIdManagement(e) {
        e.preventDefault();
        window.location.href = '/id-management/cluster-reporting/';
    }
    _computeViewPlannedAction(permissions) {
        return permissions.viewPlannedAction;
    }
    // Shows the submenu item selected upon initial load.
    _routeChanged() {
        if (this.route.path.indexOf('partners') >= 0) {
            this.partnersSelected = 'iron-selected';
            this.clustersSelected = '';
        }
        else {
            this.clustersSelected = 'iron-selected';
            this.partnersSelected = '';
        }
    }
    _computePartnerQuery(partner) {
        const query = {};
        if (partner && partner.id) {
            query.partner = partner.id;
        }
        return query;
    }
    _computeClusterQuery(queryParams) {
        const query = {};
        if (queryParams.cluster_id) {
            query.cluster_id = queryParams.cluster_id;
        }
        return query;
    }
    computeMenuTriggerCss(subMenuOpened) {
        return subMenuOpened ? ' menu-trigger-opened' : '';
    }
}
__decorate([
    property({ type: Boolean })
], ClusterReportingNav.prototype, "subMenuOpened", void 0);
__decorate([
    property({ type: String })
], ClusterReportingNav.prototype, "selected", void 0);
__decorate([
    property({ type: Object })
], ClusterReportingNav.prototype, "route", void 0);
__decorate([
    property({ type: String })
], ClusterReportingNav.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], ClusterReportingNav.prototype, "queryParams", void 0);
__decorate([
    property({ type: String })
], ClusterReportingNav.prototype, "clustersSelected", void 0);
__decorate([
    property({ type: String })
], ClusterReportingNav.prototype, "partnersSelected", void 0);
__decorate([
    property({ type: Object })
], ClusterReportingNav.prototype, "permissions", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partner.current)' })
], ClusterReportingNav.prototype, "partner", void 0);
__decorate([
    property({ type: Object, computed: '_computePartnerQuery(partner)' })
], ClusterReportingNav.prototype, "partnerQuery", void 0);
__decorate([
    property({ type: Object, computed: '_computeClusterQuery(queryParams)' })
], ClusterReportingNav.prototype, "clusterQuery", void 0);
__decorate([
    property({ type: Object })
], ClusterReportingNav.prototype, "analysisQuery", void 0);
__decorate([
    property({ type: String, computed: 'buildUrl(_baseUrlCluster, \'dashboard\')' })
], ClusterReportingNav.prototype, "dashboardUrl", void 0);
__decorate([
    property({ type: String, computed: 'buildUrl(_baseUrlCluster, \'response-parameters\')' })
], ClusterReportingNav.prototype, "responseParametersUrl", void 0);
__decorate([
    property({ type: String, computed: 'buildUrl(_baseUrlCluster, \'response-parameters/clusters\')' })
], ClusterReportingNav.prototype, "clustersUrl", void 0);
__decorate([
    property({ type: String, computed: 'buildUrl(_baseUrlCluster, \'response-parameters/partners\')' })
], ClusterReportingNav.prototype, "partnersUrl", void 0);
__decorate([
    property({ type: String, computed: 'buildUrl(_baseUrlCluster, \'planned-action\')' })
], ClusterReportingNav.prototype, "plannedActionUrl", void 0);
__decorate([
    property({ type: String, computed: 'buildUrl(_baseUrlCluster, \'results\')' })
], ClusterReportingNav.prototype, "resultsUrl", void 0);
__decorate([
    property({ type: String, computed: 'buildUrl(_baseUrlCluster, \'analysis\')' })
], ClusterReportingNav.prototype, "analysisUrl", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeViewPlannedAction(permissions)' })
], ClusterReportingNav.prototype, "canViewPlannedAction", void 0);
window.customElements.define('cluster-reporting-nav', ClusterReportingNav);
