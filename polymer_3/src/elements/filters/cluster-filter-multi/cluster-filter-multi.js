var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter-multi';
import '../../etools-prp-ajax';
import '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';
import Endpoints from '../../../endpoints';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ClusterFilterMulti extends LocalizeMixin(ReduxConnectedElement) {
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

    <etools-prp-ajax
        id="clusters"
        url="[[clustersUrl]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
        label="[[localize('clusters')]]"
        name="clusters"
        value="[[value]]"
        data="[[data]]">
    </dropdown-filter-multi>
  `;
    }
    _computeClustersUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterNames(responsePlanId);
    }
    _fetchClusters() {
        if (!this.clustersUrl) {
            return;
        }
        const self = this;
        const thunk = this.$.clusters.thunk();
        this.$.clusters.abort();
        thunk()
            .then((res) => {
            self.set('data', res.data);
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.clusters.abort();
    }
}
__decorate([
    property({ type: String, computed: '_computeClustersUrl(responsePlanId)', observer: '_fetchClusters' })
], ClusterFilterMulti.prototype, "clustersUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterFilterMulti.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Array })
], ClusterFilterMulti.prototype, "data", void 0);
__decorate([
    property({ type: String })
], ClusterFilterMulti.prototype, "value", void 0);
window.customElements.define('cluster-filter-multi', ClusterFilterMulti);
