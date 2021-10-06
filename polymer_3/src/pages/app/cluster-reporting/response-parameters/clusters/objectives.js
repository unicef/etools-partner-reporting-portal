var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-flex-layout/iron-flex-layout';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import SortingMixin from '../../../../../mixins/sorting-mixin';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/objectives/filters';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/objectives/creation-modal';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/objectives/objectives-list';
import '../../../../../elements/etools-prp-ajax';
import '../../../../../elements/etools-prp-permissions';
import '../../../../../elements/page-body';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import { tableStyles } from '../../../../../styles/table-styles';
import Endpoints from '../../../../../endpoints';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { fetchClusterObjectivesList } from '../../../../../redux/actions/clusterObjectives';
/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
* @appliesMixin RoutingMixin
* @appliesMixin SortingMixin
*/
class Objectives extends LocalizeMixin(RoutingMixin(SortingMixin(UtilsMixin(ReduxConnectedElement)))) {
    static get template() {
        return html `
    ${tableStyles} ${buttonsStyles}
    <style include="iron-flex data-table-styles">
      :host {
        display: block;
      }

      div#action {
        margin: 25px 0;
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }

      a {
        color: var(--theme-primary-color);
      }
    </style>

    <etools-prp-permissions
        permissions="{{permissions}}">
    </etools-prp-permissions>

    <iron-location query="{{query}}"></iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="objectives"
        url="[[objectivesUrl]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <page-body>
      <cluster-objectives-filters></cluster-objectives-filters>


      <template
          is="dom-if"
          if="[[permissions.createClusterEntities]]"
          restamp="true">
        <cluster-objectives-modal id="modal"></cluster-objectives-modal>

        <div id="action">
          <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
            [[localize('add_cluster_objective')]]
          </paper-button>
        </div>
      </template>

      <clusters-objectives-list></clusters-objectives-list>
    </page-body>
    `;
    }
    static get observers() {
        return [
            '_clusterObjectivesAjax(queryParams, objectivesUrl)'
        ];
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _computeUrl(responsePlanID) {
        if (!responsePlanID) {
            return;
        }
        return Endpoints.responseParametersClusterObjectives(responsePlanID);
    }
    _clusterObjectivesAjax(queryParams) {
        this._clusterObjectivesAjaxDebouncer = Debouncer.debounce(this._clusterObjectivesAjaxDebouncer, timeOut.after(300), () => {
            const thunk = this.$.objectives.thunk();
            if (!Object.keys(queryParams).length) {
                return;
            }
            this.$.objectives.abort();
            this.reduxStore.dispatch(fetchClusterObjectivesList(thunk))
                // @ts-ignore
                .catch((_err) => {
                //   // TODO: error handling.
            });
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._clusterObjectivesAjaxDebouncer && this._clusterObjectivesAjaxDebouncer.isActive()) {
            this._clusterObjectivesAjaxDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], Objectives.prototype, "permissions", void 0);
__decorate([
    property({ type: Object })
], Objectives.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], Objectives.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanID)' })
], Objectives.prototype, "objectivesUrl", void 0);
window.customElements.define('clusters-objectives', Objectives);
export { Objectives as ClustersObjectivesEl };
