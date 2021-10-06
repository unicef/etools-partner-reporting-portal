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
import LocalizeMixin from '../../../mixins/localize-mixin';
import Endpoints from '../../../endpoints';
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin FilterDependenciesMixin
 */
class ClusterProjectFilter extends LocalizeMixin(FilterDependenciesMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.data = [];
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
        id="projectNames"
        url="[[projectNamesUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('project')]]"
        name="project"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  `;
    }
    static get observers() {
        return ['_fetchProjectNames(projectNamesUrl, params)'];
    }
    _computeProjectNamesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterProjectNames(responsePlanId);
    }
    _fetchProjectNames() {
        if (!this.projectNamesUrl) {
            return;
        }
        const self = this;
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), function () {
            const thunk = self.$.projectNames.thunk();
            self.$.projectNames.abort();
            thunk()
                .then(function (res) {
                self.set('data', [{
                        id: '',
                        title: 'All'
                    }].concat(res.data || []));
            })
                .catch((_err) => {
                // TODO: error handling
            });
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.projectNames.abort();
        if (this._debouncer && this._debouncer.isActive()) {
            this._debouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], ClusterProjectFilter.prototype, "params", void 0);
__decorate([
    property({ type: Object })
], ClusterProjectFilter.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: '_computeProjectNamesUrl(responsePlanId)' })
], ClusterProjectFilter.prototype, "projectNamesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterProjectFilter.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Array })
], ClusterProjectFilter.prototype, "data", void 0);
__decorate([
    property({ type: String })
], ClusterProjectFilter.prototype, "value", void 0);
window.customElements.define('cluster-project-filter', ClusterProjectFilter);
