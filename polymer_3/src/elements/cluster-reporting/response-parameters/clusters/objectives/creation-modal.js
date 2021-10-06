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
import RoutingMixin from '../../../../../mixins/routing-mixin';
import '@polymer/polymer/lib/elements/dom-if';
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
import '@polymer/paper-dialog/paper-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '../../../../form-fields/cluster-dropdown-content';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import { modalStyles } from '../../../../../styles/modal-styles';
import Endpoints from '../../../../../endpoints';
/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 */
class ClusterObjectivesModal extends LocalizeMixin(UtilsMixin(RoutingMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.opened = false;
        this.updatePending = false;
        this.formatDate = 'DD MMM YYYY';
        this.clusters = [];
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
        id="createObjective"
        url="[[url]]"
        body="[[data]]"
        content-type="application/json"
        method="post">
    </etools-prp-ajax>

    <paper-dialog
        id="dialog"
        with-backdrop
        opened="{{opened}}">
      <div class="header layout horizontal justified">
        <h2>[[localize('add_cluster_objective')]]</h2>
          <paper-icon-button
              class="self-center"
              on-tap="close"
              icon="icons:close">
          </paper-icon-button>
        </div>
      </div>

      <paper-dialog-scrollable>
        <template
            is="dom-if"
            if="[[refresh]]"
            restamp="true">
          <iron-form class="app-grid">
              <paper-input
                class="item validate full-width"
                id="title"
                label="[[localize('cluster_objective_title')]]"
                value="{{data.title}}"
                type="string"
                on-input="_validate"
                required>
              </paper-input>

              <etools-dropdown
                class="item validate"
                label="[[localize('cluster')]]"
                options="[[clusters]]"
                option-value="id"
                option-label="title"
                selected="{{data.cluster}}"
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

    </paper-dialog>
    `;
    }
    _computeUrl(responsePlanID) {
        if (!responsePlanID) {
            return;
        }
        return Endpoints.responseParametersClusterObjectives(responsePlanID);
    }
    close() {
        this.set('opened', false);
        this.set('refresh', false);
    }
    open() {
        this.data = {};
        this.set('opened', true);
        this.set('refresh', true);
    }
    _redirectToDetail(id) {
        const path = '/response-parameters/clusters/objective/' + String(id);
        const url = this.buildUrl(this._baseUrlCluster, path);
        this.set('path', url);
    }
    _validate(e) {
        e.target.validate();
    }
    _save() {
        if (!this._fieldsAreValid()) {
            return;
        }
        const thunk = this.$.createObjective.thunk();
        const self = this;
        thunk()
            .then((res) => {
            self.updatePending = false;
            self.close();
            setTimeout(() => {
                self._redirectToDetail(res.data.id);
            }, 100);
        })
            .catch((_err) => {
            self.updatePending = false;
            // TODO: error handling
        });
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], ClusterObjectivesModal.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: Boolean })
], ClusterObjectivesModal.prototype, "opened", void 0);
__decorate([
    property({ type: Boolean })
], ClusterObjectivesModal.prototype, "updatePending", void 0);
__decorate([
    property({ type: String })
], ClusterObjectivesModal.prototype, "formatDate", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanID)' })
], ClusterObjectivesModal.prototype, "url", void 0);
__decorate([
    property({ type: Array })
], ClusterObjectivesModal.prototype, "clusters", void 0);
__decorate([
    property({ type: Boolean })
], ClusterObjectivesModal.prototype, "refresh", void 0);
__decorate([
    property({ type: Object })
], ClusterObjectivesModal.prototype, "data", void 0);
window.customElements.define('cluster-objectives-modal', ClusterObjectivesModal);
export { ClusterObjectivesModal as ClusterObjectivesModalEl };
