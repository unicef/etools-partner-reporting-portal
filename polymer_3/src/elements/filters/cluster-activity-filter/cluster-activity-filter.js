var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../etools-prp-ajax';
import UtilsMixin from '../../../mixins/utils-mixin';
import FilterMixin from '../../../mixins/filter-mixin';
import Endpoints from '../../../endpoints';
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin FilterMixin
 * @appliesMixin FilterDependenciesMixin
 */
class ClusterActivityFilter extends UtilsMixin(FilterMixin(FilterDependenciesMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.activitiesUrl = '';
        this.data = [];
        this.defaultParams = { page_size: 99999 };
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
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
        id="activities"
        url="[[activitiesUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="Activity"
        name="activity"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  `;
    }
    static get observers() {
        return ['_fetchActivities(activitiesUrl, params)'];
    }
    _computeActivitiesUrl(responsePlanId) {
        return Endpoints.partnerActivityList(responsePlanId);
    }
    _fetchActivities() {
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
            var self = this;
            //activities.abort();
            this.$.activities.abort();
            this.$.activities.thunk()()
                .then(function (res) {
                self.set('data', [{
                        id: '',
                        title: 'All',
                    }].concat(res.data.results || []));
            })
                // @ts-ignore
                .catch(function (err) {
                // TODO: error handling
            });
        });
    }
    disconnectedCallback() {
        super.connectedCallback();
        this.$.activities.abort();
        if (this._debouncer && this._debouncer.isActive()) {
            this._debouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], ClusterActivityFilter.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: '_computeActivitiesUrl(responsePlanId)' })
], ClusterActivityFilter.prototype, "activitiesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterActivityFilter.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Array })
], ClusterActivityFilter.prototype, "data", void 0);
__decorate([
    property({ type: Object })
], ClusterActivityFilter.prototype, "defaultParams", void 0);
__decorate([
    property({ type: String })
], ClusterActivityFilter.prototype, "value", void 0);
window.customElements.define('cluster-activity-filter', ClusterActivityFilter);
