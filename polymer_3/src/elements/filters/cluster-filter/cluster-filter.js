var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/dropdown-filter';
import '../../etools-prp-ajax';
import UtilsMixin from '../../../mixins/utils-mixin';
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import Endpoints from '../../../endpoints';
import { property } from '@polymer/decorators';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin FilterMixin
 * @appliesMixin LocalizeMixin
 */
class ClusterFilter extends LocalizeMixin(FilterDependenciesMixin(UtilsMixin(ReduxConnectedElement))) {
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
        id="clusterNames"
        url="[[clusterNamesUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <dropdown-filter
        label="[[localize('cluster')]]"
        name="cluster_id"
        value="[[value]]"
        data="[[data]]">
    </dropdown-filter>
  `;
    }
    static get observers() {
        return ['_fetchClusterNames(clusterNamesUrl, params)'];
    }
    _computeClusterNamesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterNames(responsePlanId);
    }
    _fetchClusterNames() {
        if (!this.clusterNamesUrl || !this.params) {
            return;
        }
        const self = this;
        this.clusterNamesDebouncer = Debouncer.debounce(this.clusterNamesDebouncer, timeOut.after(250), () => {
            self.$.clusterNames.abort();
            this.$.clusterNames.thunk()()
                .then((res) => {
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
        this.$.clusterNames.abort();
        if (this.clusterNamesDebouncer && this.clusterNamesDebouncer.isActive()) {
            this.clusterNamesDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: String })
], ClusterFilter.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], ClusterFilter.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: '_computeClusterNamesUrl(responsePlanId)' })
], ClusterFilter.prototype, "clusterNamesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterFilter.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Array })
], ClusterFilter.prototype, "data", void 0);
__decorate([
    property({ type: String })
], ClusterFilter.prototype, "value", void 0);
window.customElements.define('cluster-filter', ClusterFilter);
