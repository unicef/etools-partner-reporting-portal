var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/paper-tabs/paper-tab';
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import RoutingMixin from '../../../../mixins/routing-mixin';
import Endpoints from '../../../../endpoints';
import '../../../../elements/cluster-reporting/planned-action/projects/overview';
import '../../../../elements/cluster-reporting/planned-action/projects/indicators';
import '../../../../elements/cluster-reporting/planned-action/projects/activities';
import '../../../../elements/etools-prp-ajax';
import '../../../../elements/page-header';
import '../../../../elements/project-status';
import '../../../../elements/page-badge';
import { sharedStyles } from '../../../../styles/shared-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin LocalizeMixin
 */
class PlannedActionProjectsDetails extends LocalizeMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.projectData = {};
    }
    static get template() {
        return html `
    ${sharedStyles}
    <style>
    :host {
      display: block;

      --page-header-above-title: {
        position: absolute;
        display: block;
        left: 0;
        top: -23px;
      };
    }

    .toolbar report-status {
      margin-right: 1em;
    }

    .toolbar a {
      text-decoration: none;
    }

    .tabs paper-tab {
      text-transform: uppercase;
    }
  </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
      params-string="{{query}}"
      params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
      id="overview"
      url="[[overviewUrl]]"
      params="[[queryParams]]">
    </etools-prp-ajax>

    <app-route
      route="{{route}}"
      pattern="/:tab"
      subroute="{{subroute}}"
      data="{{routeData}}">
    </app-route>

    <page-header
        title="[[projectData.title]]"
        back="[[backLink]]">

      <page-badge
        slot="above-title" name="[[localize('project')]]">
      </page-badge>

      <div slot="toolbar">
        <project-status status="[[projectData.status]]"></project-status>
      </div>

      <div slot="tabs">
        <paper-tabs
            selected="{{ routeData.tab }}"
            attr-for-selected="name"
            scrollable
            hide-scroll-buttons>
          <paper-tab name="overview">[[localize('overview')]]</paper-tab>
          <paper-tab name="indicators">[[localize('project_indicators')]]</paper-tab>
          <paper-tab name="activities">[[localize('project_activities')]]</paper-tab>
        </paper-tabs>
      </div>
    </page-header>

    <template is="dom-if" if="[[_equals(tab, 'overview')]]" restamp="true">
      <pa-project-details-overview project-data="[[projectData]]"></pa-project-details-overview>
    </template>

    <template is="dom-if" if="[[_equals(tab, 'indicators')]]" restamp="true">
      <pa-project-details-indicators
        project-id="[[projectId]]">
      </pa-project-details-indicators>
    </template>

    <template is="dom-if" if="[[_equals(tab, 'activities')]]" restamp="true">
      <pa-project-details-activities
        project-data="[[projectData]]"
        project-id="[[projectId]]">
      </pa-project-details-activities>
    </template>
`;
    }
    static get observers() {
        return [
            '_updateUrlTab(routeData.tab)',
            '_getProjectAjax(overviewUrl)'
        ];
    }
    _onSuccess() {
        this._getProjectAjax();
    }
    _computeBackLink() {
        return '/planned-action/projects' + '?' + this.query;
    }
    _updateUrlTab(tab) {
        if (!tab) {
            tab = 'overview';
        }
        this.set('tab', tab);
        this.set('queryParams.page', 1);
        this.set('route.path', '/' + this.tab);
    }
    _computeOverviewUrl(projectId) {
        return Endpoints.plannedActionsProjectOverview(projectId);
    }
    _getProjectAjax() {
        if (!this.overviewUrl) {
            return;
        }
        const self = this;
        const thunk = this.$.overview.thunk();
        thunk()
            .then((res) => {
            self.updatePending = false;
            self.projectData = res.data;
        })
            .catch((_err) => {
            self.updatePending = false;
            // TODO: error handling
        });
    }
    _addEventListeners() {
        this._onSuccess = this._onSuccess.bind(this);
        this.addEventListener('project-edited', this._onSuccess);
    }
    _removeEventListeners() {
        this.removeEventListener('project-edited', this._onSuccess);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: String })
], PlannedActionProjectsDetails.prototype, "tab", void 0);
__decorate([
    property({ type: Object })
], PlannedActionProjectsDetails.prototype, "routeData", void 0);
__decorate([
    property({ type: String })
], PlannedActionProjectsDetails.prototype, "projectId", void 0);
__decorate([
    property({ type: String })
], PlannedActionProjectsDetails.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], PlannedActionProjectsDetails.prototype, "projectData", void 0);
__decorate([
    property({ type: String, computed: '_computeOverviewUrl(projectId)' })
], PlannedActionProjectsDetails.prototype, "overviewUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeBackLink(query)' })
], PlannedActionProjectsDetails.prototype, "backLink", void 0);
window.customElements.define('planned-action-projects-details', PlannedActionProjectsDetails);
