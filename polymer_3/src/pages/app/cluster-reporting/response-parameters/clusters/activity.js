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
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';
import '@polymer/iron-location/iron-location';
import '../../../../../elements/page-header';
import '../../../../../elements/page-body';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/activities/overview';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/activities/indicators';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/activities/contributing-partners';
import '../../../../../elements/project-status';
import Endpoints from '../../../../../endpoints';
import { sharedStyles } from '../../../../../styles/shared-styles';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
* @appliesMixin RoutingMixin
*/
class Activity extends LocalizeMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement))) {
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
      color: var(--theme-primary-color);
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
      id="activity"
      url="[[url]]"
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
        slot="above-title" name="[[localize('cluster_activity')]]">
      </page-badge>

      <div slot="toolbar">
        <project-status status="[[data.status]]"></project-status>
      </div>

      <div slot="tabs">
        <paper-tabs
            selected="{{routeData.tab}}"
            attr-for-selected="name"
            scrollable
            hide-scroll-buttons>
          <paper-tab name="overview">[[localize('overview')]]</paper-tab>
          <paper-tab name="indicators">[[localize('activity_indicators')]]</paper-tab>
          <paper-tab name="contributing-partners">[[localize('contributing_partners')]]</paper-tab>
        </paper-tabs>
      </div>
    </page-header>

    <template is="dom-if" if="[[_equals(tab, 'overview')]]" restamp="true">
      <rp-clusters-activity-overview data=[[data]]></rp-clusters-activity-overview>
    </template>

    <template is="dom-if" if="[[_equals(tab, 'indicators')]]" restamp="true">
      <rp-clusters-activity-indicators
        activity-data="[[data]]"
        activity-id="[[activityId]]"
        cluster-id="[[data.cluster]]">
      </rp-clusters-activity-indicators>
    </template>

    <template is="dom-if" if="[[_equals(tab, 'contributing-partners')]]" restamp="true">
      <rp-clusters-activity-contributing-partners
        activity-id=[[activityId]]>
      </rp-clusters-activity-contributing-partners>
    </template>
    `;
    }
    static get observers() {
        return [
            '_updateUrlTab(routeData.tab)',
            '_getActivityAjax(url)'
        ];
    }
    _onSuccess() {
        this._getActivityAjax();
    }
    _updateUrlTab(tab) {
        if (!tab) {
            tab = 'overview';
        }
        this.set('tab', tab);
        this.set('route.path', '/' + this.tab);
    }
    _computeUrl(activityId) {
        if (!activityId) {
            return;
        }
        return Endpoints.responseParamtersClustersActivityDetail(activityId);
    }
    _computeBackLink(query) {
        return '/response-parameters/clusters/activities' + '?' + query;
    }
    _getActivityAjax() {
        if (!this.url) {
            return;
        }
        const thunk = this.$.activity.thunk();
        const self = this;
        thunk()
            .then((res) => {
            self.updatePending = false;
            self.data = res.data;
        })
            .catch((_err) => {
            self.updatePending = false;
            // TODO: error handling
        });
    }
    _addEventListeners() {
        this._onSuccess = this._onSuccess.bind(this);
        this.addEventListener('activity-edited', this._onSuccess);
    }
    _removeEventListeners() {
        this.removeEventListener('activity-edited', this._onSuccess);
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
], Activity.prototype, "tab", void 0);
__decorate([
    property({ type: Object })
], Activity.prototype, "permissions", void 0);
__decorate([
    property({ type: String })
], Activity.prototype, "activityId", void 0);
__decorate([
    property({ type: Object })
], Activity.prototype, "data", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(activityId)' })
], Activity.prototype, "url", void 0);
__decorate([
    property({ type: String, computed: '_computeBackLink(query)' })
], Activity.prototype, "backLink", void 0);
__decorate([
    property({ type: Boolean })
], Activity.prototype, "updatePending", void 0);
window.customElements.define('clusters-activity-details', Activity);
export { Activity as ClustersActivityDetailsEl };
