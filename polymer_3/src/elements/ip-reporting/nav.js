var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-item/paper-item';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/social-icons';
import '@polymer/iron-selector/iron-selector';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../../etools-prp-common/mixins/routing-mixin';
import PageNavMixin from '../../etools-prp-common/mixins/page-nav-mixin';
import '../../etools-prp-common/elements/etools-prp-permissions';
import { pageNavStyles } from '../../styles/page-nav-styles';
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
    constructor() {
        super(...arguments);
        this.pdQuery = { status: String(['Sig', 'Act', 'Sus']) };
        this.reportsQuery = { status: String(['Due', 'Ove', 'Sen']) };
        this.indicatorsQuery = { pd_statuses: String(['Act']) };
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

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <div class="nav-menu">
        <iron-selector selected="[[selected]]" attr-for-selected="name" selectable="paper-item" role="navigation">
          <paper-item name="overview" class="nav-menu-item">
            <a href="[[overviewUrl]]">
              <span><iron-icon icon="social:public" role="presentation"></iron-icon>[[localize('overview')]]</span>
            </a>
          </paper-item>

          <paper-item name="pd" class="nav-menu-item">
            <a href="[[_appendQuery(pdUrl, pdQuery)]]">
              <span
                ><iron-icon icon="description" role="presentation"></iron-icon>[[localize('programme_documents')]]</span
              >
            </a>
          </paper-item>

          <paper-item name="progress-reports" class="nav-menu-item">
            <a href="[[_appendQuery(progressReportsUrl, reportsQuery)]]">
              <span><iron-icon icon="assignment" role="presentation"></iron-icon>[[localize('progress_reports')]]</span>
            </a>
          </paper-item>

          <paper-item name="indicators" class="nav-menu-item">
            <a href="[[_appendQuery(indicatorsReportsUrl, indicatorsQuery)]]">
              <span><iron-icon icon="trending-up" role="presentation"></iron-icon>[[localize('indicators')]]</span>
            </a>
          </paper-item>

          <template is="dom-if" if="[[permissions.accessIpIdManagement]]" restamp="true">
            <hr />

            <paper-item name="id-management" on-tap="goToIdManagement">
              <a href="/id-management/ip-reporting/">
                <span
                  ><iron-icon icon="social:people" role="presentation"></iron-icon>[[localize('id_management')]]</span
                >
              </a>
            </paper-item>
          </template>
        </iron-selector>

        <div class="nav-menu-item section-title">
          <hr />
          <paper-item name="indicators">
            <a href="https://prphelp.zendesk.com/" target="_blank">
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
    goToIdManagement(e) {
        e.preventDefault();
        window.location.href = '/id-management/ip-reporting/';
    }
}
__decorate([
    property({ type: String })
], IpReportingNav.prototype, "selected", void 0);
__decorate([
    property({ type: String, computed: "buildUrl(_baseUrl, 'overview')" })
], IpReportingNav.prototype, "overviewUrl", void 0);
__decorate([
    property({ type: String, computed: "buildUrl(_baseUrl, 'pd')" })
], IpReportingNav.prototype, "pdUrl", void 0);
__decorate([
    property({ type: String, computed: "buildUrl(_baseUrl, 'progress-reports')" })
], IpReportingNav.prototype, "progressReportsUrl", void 0);
__decorate([
    property({ type: String, computed: "buildUrl(_baseUrl, 'indicators')" })
], IpReportingNav.prototype, "indicatorsReportsUrl", void 0);
__decorate([
    property({ type: Object })
], IpReportingNav.prototype, "pdQuery", void 0);
__decorate([
    property({ type: Object })
], IpReportingNav.prototype, "reportsQuery", void 0);
__decorate([
    property({ type: Object })
], IpReportingNav.prototype, "indicatorsQuery", void 0);
window.customElements.define('ip-reporting-nav', IpReportingNav);
