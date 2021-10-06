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
import '../../../../../elements/cluster-reporting/response-parameters/partners/activities/overview';
import '../../../../../elements/cluster-reporting/response-parameters/partners/activities/indicators';
import '../../../../../elements/page-body';
import '../../../../../elements/page-header';
import '../../../../../elements/page-badge';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import Endpoints from '../../../../../endpoints';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
*/
class Activity extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.activityData = {};
        this.updatePending = false;
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
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
      url="[[overviewUrl]]">
    </etools-prp-ajax>

    <app-route
      route="{{parentRoute}}"
      pattern="/:id"
      data="{{parentRouteData}}"
      tail="{{route}}">
    </app-route>

    <app-route
      route="{{route}}"
      pattern="/:tab"
      data="{{routeData}}">
    </app-route>


    <page-header
        title="[[activityData.title]]"
        back="[[backLink]]">

      <page-badge
        slot="above-title" name="[[localize('partner_activity')]]">
      </page-badge>

      <div slot="toolbar">
        <project-status status="[[activityData.status]]"></project-status>
      </div>

      <div slot="tabs">
        <paper-tabs
            selected="{{routeData.tab}}"
            attr-for-selected="name"
            scrollable
            hide-scroll-buttons>
          <paper-tab name="overview">[[localize('overview')]]</paper-tab>
          <paper-tab name="indicators">[[localize('activity_indicators')]]</paper-tab>
        </paper-tabs>
      </div>
    </page-header>

    <template is="dom-if" if="[[_equals(tab, 'overview')]]" restamp="true">
      <rp-partner-activity-details-overview
          activity-data="[[activityData]]">
      </rp-partner-activity-details-overview>
    </template>

    <template is="dom-if" if="[[_equals(tab, 'indicators')]]" restamp="true">
      <rp-partner-activity-details-indicators
        activity-id="[[parentRouteData.id]]"
        activity-data="[[activityData]]"
        is_custom="[[activityData.is_custom]]">
      </rp-partner-activity-details-indicators>
    </template>
    `;
    }
    static get observers() {
        return [
            '_updateUrlTab(routeData.tab)'
        ];
    }
    _onSuccess() {
        this._getActivityAjax();
    }
    _computeBackLink(query) {
        return '/response-parameters/partners/activities' + '?' + query;
    }
    _computeOverviewUrl(responsePlanID, activityId) {
        if (!responsePlanID || !activityId) {
            return;
        }
        return Endpoints.plannedActionsActivityOverview(responsePlanID, activityId);
    }
    _updateUrlTab(tab) {
        if (!tab) {
            tab = 'overview';
        }
        this.set('tab', tab);
        this.set('route.path', '/' + this.tab);
    }
    _getActivityAjax() {
        if (!this.overviewUrl) {
            return;
        }
        this._activityAjaxDebouncer = Debouncer.debounce(this._activityAjaxDebouncer, timeOut.after(100), () => {
            const thunk = this.$.activity.thunk();
            const self = this;
            thunk()
                .then((res) => {
                self.updatePending = false;
                self.activityData = res.data;
            })
                .catch((_err) => {
                self.updatePending = false;
                // TODO: error handling
            });
        });
    }
    _addEventListeners() {
        this._onSuccess = this._onSuccess.bind(this);
        this.addEventListener('pa-activity-edited', this._onSuccess);
    }
    _removeEventListeners() {
        this.removeEventListener('pa-activity-edited', this._onSuccess);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
        if (this._activityAjaxDebouncer && this._activityAjaxDebouncer.isActive()) {
            this._activityAjaxDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: String })
], Activity.prototype, "tab", void 0);
__decorate([
    property({ type: Object })
], Activity.prototype, "route", void 0);
__decorate([
    property({ type: Object })
], Activity.prototype, "routeData", void 0);
__decorate([
    property({ type: Object })
], Activity.prototype, "parentRouteData", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], Activity.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: Object })
], Activity.prototype, "activityData", void 0);
__decorate([
    property({ type: String, computed: '_computeOverviewUrl(responsePlanID, parentRouteData.id)', observer: '_getActivityAjax' })
], Activity.prototype, "overviewUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeBackLink(query)' })
], Activity.prototype, "backLink", void 0);
__decorate([
    property({ type: Boolean })
], Activity.prototype, "updatePending", void 0);
window.customElements.define('rp-partners-activity-detail', Activity);
export { Activity as RpPartnersActivityDetailEl };
