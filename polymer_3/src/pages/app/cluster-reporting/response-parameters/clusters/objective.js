var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-location/iron-location';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-location/iron-query-params';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/objectives/overview';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/objectives/indicators';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/objectives/activities';
import '../../../../../elements/page-header';
import '../../../../../elements/page-body';
import '../../../../../elements/page-badge';
import '../../../../../elements/project-status';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import Endpoints from '../../../../../endpoints';
import { sharedStyles } from '../../../../../styles/shared-styles';
/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
* @appliesMixin RoutingMixin
*/
class Objective extends LocalizeMixin(UtilsMixin(RoutingMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.data = {};
        this.updatePending = false;
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

    <etools-prp-ajax
      id="objective"
      url="[[objectiveUrl]]"
      params="[[queryParams]]">
    </etools-prp-ajax>

    <app-route
      route="{{route}}"
      pattern="/:tab"
      subroute="{{subroute}}"
      data="{{routeData}}">
    </app-route>

    <page-header
        title="[[data.title]]"
        back="[[backLink]]">

      <page-badge
          slot="above-title" name="[[localize('objective')]]">
      </page-badge>

      <div class="toolbar">
        <project-status status="[[data.status]]"></project-status>
      </div>

      <div slot="tabs">
        <paper-tabs
            selected="{{routeData.tab}}"
            attr-for-selected="name"
            scrollable
            hide-scroll-buttons>
          <paper-tab name="overview">[[localize('overview')]]</paper-tab>
          <paper-tab name="indicators">[[localize('cluster_objective_indicators')]]</paper-tab>
          <paper-tab name="activities">[[localize('cluster_activity')]]</paper-tab>
        </paper-tabs>
      </div>
    </page-header>

    <template is="dom-if" if="[[_equals(tab, 'overview')]]" restamp="true">
      <rp-clusters-details-overview data=[[data]]></rp-clusters-details-overview>
    </template>

    <template is="dom-if" if="[[_equals(tab, 'indicators')]]" restamp="true">
      <rp-clusters-details-indicators
        objective-id="[[objectiveId}}"
        activity-data="[[data]]"
        cluster-id="[[data.cluster]]">
      </rp-clusters-details-indicators>
    </template>

    <template is="dom-if" if="[[_equals(tab, 'activities')]]" restamp="true">
      <rp-clusters-details-activities
        objective-id="{{objectiveId}}">
      </rp-clusters-details-activities>
    </template>
    `;
    }
    static get observers() {
        return [
            '_updateUrlTab(routeData.tab)',
            '_getObjectiveAjax(objectiveUrl)'
        ];
    }
    _onSuccess() {
        this._getObjectiveAjax();
    }
    _updateUrlTab(tab) {
        if (!tab) {
            tab = 'overview';
        }
        this.set('tab', tab);
        this.set('route.path', '/' + this.tab);
    }
    _computeObjectiveUrl(objectiveId) {
        if (!objectiveId) {
            return;
        }
        return Endpoints.responseParametersClustersObjectiveDetail(objectiveId);
    }
    _computeBackLink(query) {
        return '/response-parameters/clusters/objectives' + '?' + query;
    }
    _getObjectiveAjax() {
        if (!this.objectiveUrl) {
            return;
        }
        const thunk = this.$.objective.thunk();
        const self = this;
        thunk()
            .then((res) => {
            self.updatePending = false;
            self.data = res.data;
        })
            .catch((_err) => {
            self.updatePending = false;
            //   // TODO: error handling
        });
    }
    _addEventListeners() {
        this._onSuccess = this._onSuccess.bind(this);
        this.addEventListener('objective-edited', this._onSuccess);
    }
    _removeEventListeners() {
        this.removeEventListener('objective-edited', this._onSuccess);
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
], Objective.prototype, "tab", void 0);
__decorate([
    property({ type: Object })
], Objective.prototype, "route", void 0);
__decorate([
    property({ type: Object })
], Objective.prototype, "routeData", void 0);
__decorate([
    property({ type: String })
], Objective.prototype, "objectiveId", void 0);
__decorate([
    property({ type: Object })
], Objective.prototype, "data", void 0);
__decorate([
    property({ type: String, computed: '_computeObjectiveUrl(objectiveId)' })
], Objective.prototype, "objectiveUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeBackLink(query)' })
], Objective.prototype, "backLink", void 0);
__decorate([
    property({ type: Boolean })
], Objective.prototype, "updatePending", void 0);
window.customElements.define('clusters-objective-details', Objective);
export { Objective as ClustersObjectiveDetailsEl };
