var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from "../../../ReduxConnectedElement";
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/dropdown-filter-multi';
import LocalizeMixin from '../../../mixins/localize-mixin';
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import Endpoints from '../../../endpoints';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin FilterDependenciesMixin
 */
class ClusterObjectiveFilterMulti extends LocalizeMixin(FilterDependenciesMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.data = [];
        this.pending = false;
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
        id="objectives"
        url="[[objectivesUrl]]"
        params="[[objectivesParams]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
        label="[[localize('cluster_objective')]]"
        name="cluster_objectives"
        value="[[value]]"
        data="[[data]]"
        disabled="[[pending]]">
    </dropdown-filter-multi>
  `;
    }
    static get observers() {
        return [
            '_fetchObjectives(objectivesParams, objectivesUrl)'
        ];
    }
    _computeObjectivesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.responseParametersClusterObjectives(responsePlanId);
    }
    _computeObjectivesParams(params) {
        const objectivesParams = {
            page_size: 99999
        };
        if (params.clusters) {
            objectivesParams.cluster_ids = params.clusters;
        }
        return objectivesParams;
    }
    _fetchObjectives() {
        if (!this.objectivesParams || !this.objectivesUrl) {
            return;
        }
        const self = this;
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), function () {
            const thunk = self.$.objectives.thunk();
            self.set('pending', true);
            self.$.objectives.abort();
            thunk()
                .then((res) => {
                self.set('pending', false);
                self.set('data', res.data.results);
            })
                .catch((_err) => {
                // TODO: error handling
                self.set('pending', false);
            });
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._debouncer && this._debouncer.isActive()) {
            this._debouncer.cancel();
        }
    }
}
__decorate([
    property({ type: String, computed: '_computeObjectivesUrl(responsePlanId)' })
], ClusterObjectiveFilterMulti.prototype, "objectivesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterObjectiveFilterMulti.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Array })
], ClusterObjectiveFilterMulti.prototype, "data", void 0);
__decorate([
    property({ type: Object, computed: '_computeObjectivesParams(params)' })
], ClusterObjectiveFilterMulti.prototype, "objectivesParams", void 0);
__decorate([
    property({ type: String })
], ClusterObjectiveFilterMulti.prototype, "value", void 0);
__decorate([
    property({ type: Boolean })
], ClusterObjectiveFilterMulti.prototype, "pending", void 0);
window.customElements.define('cluster-objective-filter-multi', ClusterObjectiveFilterMulti);
