var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import DateMixin from '../../../../../mixins/date-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-form/iron-form';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-location/iron-location';
import '@polymer/paper-styles/typography';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-dialog/paper-dialog';
import '../../../../form-fields/dropdown-form-input';
import '../../../../form-fields/cluster-dropdown-content';
import '../../../../error-box';
import Endpoints from '../../../../../endpoints';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import { modalStyles } from '../../../../../styles/modal-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin DateMixin
 */
class CreationModalActivities extends LocalizeMixin(RoutingMixin(DateMixin(UtilsMixin(ReduxConnectedElement)))) {
    constructor() {
        super(...arguments);
        this.opened = false;
        this.updatePending = false;
        this.data = {};
        this.clusters = [];
        this.objectives = [];
        this.objectivesUrl = '';
        this.isObjectivesDisabled = true;
        this.objectivesParams = { cluster_id: '' };
        this.refresh = false;
    }
    static get template() {
        // language=HTML
        return html `
    ${buttonsStyles} ${modalStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;

        --app-grid-columns: 3;
        --app-grid-gutter: 15px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 3;
        --app-grid-gutter: 0px;

        --paper-dialog: {
            width: 700px;
        }
      }
    </style>

    <iron-location path="{{path}}"></iron-location>

    <cluster-dropdown-content clusters="{{clusters}}"></cluster-dropdown-content>

    <etools-prp-ajax
        id="createActivity"
        url="[[url]]"
        body="[[data]]"
        content-type="application/json"
        method="post">
    </etools-prp-ajax>

    <etools-prp-ajax
        id="objectivesByClusterID"
        url="[[objectivesUrl]]"
        params="[[objectivesParams]]">
    </etools-prp-ajax>

    <paper-dialog
        id="dialog"
        with-backdrop
        opened="{{opened}}">
      <div id="header" class="header layout horizontal justified">
        <h2>[[localize('add_cluster_activity')]]</h2>
          <paper-icon-button
              class="self-center"
              on-tap="close"
              icon="icons:close">
          </paper-icon-button>
        </div>
      </div>

      <paper-dialog-scrollable>
        <error-box errors="[[errors]]"></error-box>
        <template
            is="dom-if"
            if="[[refresh]]"
            restamp="true">
          <iron-form class="app-grid">
            <paper-input
              class="item validate full-width"
              id="title"
              label="[[localize('title')]]"
              value="{{data.title}}"
              type="string"
              on-input="_validate"
              required>
            </paper-input>

            <etools-dropdown
              class="item validate"
              label="[[localize('cluster')]]"
              id="cluster"
              options="[[clusters]]"
              option-value="id"
              option-label="title"
              selected="{{data.cluster}}"
              hide-search
              required>
            </etools-dropdown>

            <etools-dropdown
              id="objective"
              class="item validate"
              label="[[localize('cluster_objective')]]"
              options="[[objectives]]"
              option-value="id"
              option-label="title"
              selected="{{data.cluster_objective}}"
              disabled="[[isObjectivesDisabled]]"
              hide-search
              required>
            </etools-dropdown>


          </iron-form>
        </template>
      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button class="btn-primary" on-tap="_save" raised>
          [[localize('save')]]
        </paper-button>

        <paper-button class="btn-cancel" on-tap="close">
          [[localize('cancel')]]
        </paper-button>
      </div>

      <etools-loading active="[[updatePending]]"></etools-loading>

    </paper-dialog>
    `;
    }
    static get observers() {
        return [
            '_getObjectivesByClusterID(data.cluster, objectivesUrl)'
        ];
    }
    _computeUrl(responsePlanID) {
        if (!responsePlanID) {
            return;
        }
        return Endpoints.responseParametersClusterActivities(responsePlanID);
    }
    _computeObjectivesUrl(responsePlanID) {
        if (!responsePlanID) {
            return;
        }
        return Endpoints.responseParametersClusterObjectives(responsePlanID);
    }
    _isObjectivesDisabled(clusterID) {
        return !clusterID;
    }
    _getObjectivesByClusterID(clusterID, objectivesUrl) {
        const self = this;
        if (clusterID && objectivesUrl) {
            this.objectivesParams = { cluster_id: this.data.cluster };
            this.$.objectivesByClusterID.thunk()()
                .then((res) => {
                self.set('objectives', res.data.results);
            })
                .catch((_err) => {
                self.updatePending = false;
                // TODO: error handling
            });
        }
        else {
            self.set('objectives', []);
        }
    }
    close() {
        this.set('opened', false);
        this.set('refresh', false);
        this.set('errors', {});
    }
    open() {
        this.data = {};
        this.set('opened', true);
        this.set('refresh', true);
    }
    _validate(e) {
        e.target.validate();
    }
    _redirectToDetail(id) {
        const path = `/response-parameters/clusters/activity/${id}`;
        const url = this.buildUrl(this._baseUrlCluster, path);
        this.set('path', url);
    }
    _save() {
        if (!this._fieldsAreValid()) {
            return;
        }
        const self = this;
        self.updatePending = true;
        this.$.createActivity.thunk()()
            .then((res) => {
            self.updatePending = false;
            self.set('errors', {});
            self.close();
            setTimeout(() => {
                self._redirectToDetail(res.data.id);
            }, 100);
        })
            .catch((err) => {
            self.set('errors', err.data);
            self.updatePending = false;
        });
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], CreationModalActivities.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: Boolean })
], CreationModalActivities.prototype, "opened", void 0);
__decorate([
    property({ type: Boolean })
], CreationModalActivities.prototype, "updatePending", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanID)' })
], CreationModalActivities.prototype, "url", void 0);
__decorate([
    property({ type: Object })
], CreationModalActivities.prototype, "data", void 0);
__decorate([
    property({ type: Array })
], CreationModalActivities.prototype, "clusters", void 0);
__decorate([
    property({ type: Array })
], CreationModalActivities.prototype, "objectives", void 0);
__decorate([
    property({ type: String, computed: '_computeObjectivesUrl(responsePlanID, data.cluster)' })
], CreationModalActivities.prototype, "objectivesUrl", void 0);
__decorate([
    property({ type: Boolean, computed: '_isObjectivesDisabled(data.cluster)' })
], CreationModalActivities.prototype, "isObjectivesDisabled", void 0);
__decorate([
    property({ type: Object })
], CreationModalActivities.prototype, "objectivesParams", void 0);
__decorate([
    property({ type: Boolean })
], CreationModalActivities.prototype, "refresh", void 0);
window.customElements.define('cluster-activities-modal', CreationModalActivities);
export { CreationModalActivities as CreationModalActivitiesEl };
