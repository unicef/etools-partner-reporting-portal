var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@unicef-polymer/etools-loading/etools-loading';
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
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '../../../etools-prp-ajax';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '../../../form-fields/dropdown-form-input';
import '../../../form-fields/cluster-dropdown-content';
import RoutingMixin from '../../../../mixins/routing-mixin';
import UtilsMixin from '../../../../mixins/utils-mixin';
import { buttonsStyles } from '../../../../styles/buttons-styles';
import { modalStyles } from '../../../../styles/modal-styles';
import { property } from '@polymer/decorators/lib/decorators';
import Endpoints from '../../../../endpoints';
import { fireEvent } from '../../../../utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin RoutingMixin
 * @appliesMixin UtilsMixin
 */
class PlannedActionProjectsEditingModal extends RoutingMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.opened = false;
        this.updatePending = false;
        this.data = {};
        this.refresh = false;
        this.clusters = [];
        this.statuses = [
            { title: 'Ongoing', id: 'Ong' },
            { title: 'Planned', id: 'Pla' },
            { title: 'Completed', id: 'Com' }
        ];
        this.frequencies = [
            { title: 'Weekly', id: 'Wee' },
            { title: 'Monthly', id: 'Mon' },
            { title: 'Quarterly', id: 'Qua' }
        ];
    }
    static get template() {
        return html `
      ${buttonsStyles} ${modalStyles}
      <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;

          --app-grid-columns: 2;
          --app-grid-gutter: 15px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;

          --paper-dialog: {
            width: 700px;
            margin: 0;
            }

        }

        .full-width {
          @apply --app-grid-expandible-item;
        }

        .header {
          height: 48px;
          padding: 0 24px;
          margin: 0;
          color: white;
          background: var(--theme-primary-color);
        }

        .header h2 {
          @apply --paper-font-title;

          margin: 0;
          line-height: 48px;
        }

        .header paper-icon-button {
          margin: 0 -13px 0 20px;
          color: white;
        }

        .buttons {
          padding: 24px;
        }
      </style>

      <iron-location path="{{path}}"></iron-location>

      <cluster-dropdown-content clusters="{{clusters}}"></cluster-dropdown-content>

      <etools-prp-ajax
          id="editProject"
          url="[[url]]"
          body="[[data]]"
          content-type="application/json"
          method="patch">
      </etools-prp-ajax>

      <paper-dialog
          id="dialog"
          with-backdrop
          opened="{{opened}}">
        <div class="header layout horizontal justified">
          <h2>Edit Project</h2>
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
                label="Title"
                value="{{data.title}}"
                type="string"
                required
                on-input="_validate">
              </paper-input>

              <div class="row">
                <etools-dropdown-multi
                  class="validate"
                  label="Clusters"
                  options="[[formattedClusters]]"
                  selected-values="{{selectedClusters}}"
                  auto-validate
                  required>
                </etools-dropdown-multi>
              </div>

              <div class="item">
                 <datepicker-lite
                    class="start-date"
                    label="Start date"
                    value="{{data.start_date}}"
                    error-message=""
                    required>
                </datepicker-lite>
              </div>

              <div class="item">
                <datepicker-lite
                    class="end-date"
                    label="End date"
                    value="{{data.end_date}}"
                    error-message=""
                    required>
                </datepicker-lite>
              </div>

              <etools-dropdown
                class="item validate"
                label="Status"
                options="[[statuses]]"
                option-value="id"
                option-label="title"
                selected="{{data.status}}"
                required>
              </etools-dropdown>

              <paper-input
                class="item validate"
                id="total_budget"
                label="Total Budget"
                value="{{data.total_budget}}"
                type="number"
                allowed-pattern="[+\\-\\d.]"
                step="0.01"
                on-input="_validate">
              </paper-input>

              <paper-input
                class="item validate full-width"
                id="funding_source"
                label="Funding Source"
                value="{{data.funding_source}}"
                type="string"
                on-input="_validate">
              </paper-input>

              <paper-input
                class="item validate full-width"
                id="description"
                label="Description"
                value="{{data.description}}"
                type="string"
                on-input="_validate">
              </paper-input>

              <paper-input
                class="item validate full-width"
                id="additional_information"
                label="Additional information (e.g. links)"
                value="{{data.additional_information}}"
                type="string"
                on-input="_validate">
              </paper-input>
            </iron-form>
          </template>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button class="btn-primary" on-tap="_save" raised>
            Save
          </paper-button>

          <paper-button  on-tap="close">
            Cancel
          </paper-button>
        </div>

        <etools-loading active="[[updatePending]]"></etools-loading>
      </paper-dialog>
    `;
    }
    _computeUrl(projectID) {
        if (!projectID) {
            return;
        }
        return Endpoints.plannedActionsProjectOverview(projectID);
    }
    close() {
        this.set('data', {});
        this.set('opened', false);
        this.set('refresh', false);
    }
    open() {
        this.set('data', Object.assign({}, this.editData));
        this.selectedClusters = this.editData.clusters.map((item) => {
            return item.id;
        });
        this.set('opened', true);
        this.set('refresh', true);
    }
    _validate(e) {
        e.target.validate();
    }
    _formatForMultiselect(list) {
        return list.map((item) => {
            return {
                id: item.id,
                value: item.id,
                label: item.title
            };
        });
    }
    _save() {
        const self = this;
        const valid = [
            this._fieldsAreValid(),
            this._dateRangeValid('.start-date', '.end-date')
        ].every(Boolean);
        if (!valid) {
            return;
        }
        this.data.clusters = this.selectedClusters.map((item) => {
            return { id: Number(item) };
        });
        this.data.partner = this.partnerID;
        this.updatePending = true;
        const thunk = this.$.editProject.thunk();
        thunk()
            .then((res) => {
            self.updatePending = false;
            fireEvent(self, 'project-edited', res.data);
            self.close();
        })
            .catch((_err) => {
            self.updatePending = false;
            // TODO: error handling
        });
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], PlannedActionProjectsEditingModal.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: String })
], PlannedActionProjectsEditingModal.prototype, "path", void 0);
__decorate([
    property({ type: String })
], PlannedActionProjectsEditingModal.prototype, "reportingPeriod", void 0);
__decorate([
    property({ type: Boolean })
], PlannedActionProjectsEditingModal.prototype, "opened", void 0);
__decorate([
    property({ type: Boolean })
], PlannedActionProjectsEditingModal.prototype, "updatePending", void 0);
__decorate([
    property({ type: Object })
], PlannedActionProjectsEditingModal.prototype, "data", void 0);
__decorate([
    property({ type: Boolean })
], PlannedActionProjectsEditingModal.prototype, "refresh", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(data.id)' })
], PlannedActionProjectsEditingModal.prototype, "url", void 0);
__decorate([
    property({ type: Array })
], PlannedActionProjectsEditingModal.prototype, "clusters", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.partner.current.id)' })
], PlannedActionProjectsEditingModal.prototype, "partnerID", void 0);
__decorate([
    property({ type: Array, computed: '_formatForMultiselect(clusters)' })
], PlannedActionProjectsEditingModal.prototype, "formattedClusters", void 0);
__decorate([
    property({ type: Array })
], PlannedActionProjectsEditingModal.prototype, "statuses", void 0);
__decorate([
    property({ type: Array })
], PlannedActionProjectsEditingModal.prototype, "frequencies", void 0);
__decorate([
    property({ type: Array })
], PlannedActionProjectsEditingModal.prototype, "selectedClusters", void 0);
window.customElements.define('planned-action-projects-editing-modal', PlannedActionProjectsEditingModal);
export { PlannedActionProjectsEditingModal as PlannedActionProjectsEditingModalEl };
