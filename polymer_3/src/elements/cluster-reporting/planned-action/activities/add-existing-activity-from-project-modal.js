var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import { ReduxConnectedElement } from '../../../../ReduxConnectedElement';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-item/paper-item';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import Endpoints from '../../../../endpoints';
import ModalMixin from '../../../../mixins/modal-mixin';
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import { buttonsStyles } from '../../../../styles/buttons-styles';
import { modalStyles } from '../../../../styles/modal-styles';
import '../../../etools-prp-permissions';
import '../../../form-fields/partner-dropdown-content';
import '../../../form-fields/cluster-dropdown-content';
import '../../../error-box-errors';
import { fireEvent } from '../../../../utils/fire-custom-event';
import Settings from '../../../../settings';
/**
* @polymer
* @customElement
* @appliesMixin ModalMixin
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
*/
class AddExistingActivityFromProjectModal extends UtilsMixin(ModalMixin(LocalizeMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.updatePending = false;
        this.activityUrl = '';
        this.activitiesParams = {
            page_size: 99999
        };
        this.activities = [];
        this.partnerActivities = [];
        this.objectives = [];
        this.objectivesParams = {
            page_size: 99999
        };
        this.selectedPartner = '';
        this.dateFormat = Settings.dateFormat;
    }
    static get template() {
        return html `
    ${buttonsStyles} ${modalStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;

        --app-grid-columns: 2;
        --app-grid-gutter: 24px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 2;

        --paper-dialog: {
          width: 600px;
          margin: 0;
          }
      }

      .app-grid {
        margin: 0 -var(--app-grid-gutter);
        padding-bottom: 24px;
      }

      .row {
        margin-bottom: 1em;
      }

      .remove-btn {
        width: 34px;
        height: 34px;
        color: var(--paper-deep-orange-a700);
      }

      .fields {
        margin-left: 24px;
      }

      .add-project-btn {
        margin: 0;
        text-align: start;

        justify-content: flex-start;
      }

      h3 {
        font-size: 14px;
      }

      header.item-wide {
        background-color: var(--paper-grey-200);
        padding: 2px 10px;
        margin: 0 0 1em;
        height: 24px;

        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      .item-wide {
        @apply --app-grid-expandible-item;
      }

      .col-actions {
        width: 40px;
        margin-right: 24px;
        border-right: 1px solid var(--paper-grey-400);
      }

      etools-dropdown {
        width: 100%;
      }
    </style>

    <cluster-dropdown-content clusters="{{clusters}}"></cluster-dropdown-content>

    <etools-prp-permissions
      permissions="{{permissions}}">
    </etools-prp-permissions>

    <etools-prp-ajax
        id="activity"
        url="[[activityUrl]]"
        method="patch"
        body="[[data]]"
        content-type="application/json">
    </etools-prp-ajax>

    <etools-prp-ajax
        id="activities"
        params="[[activitiesParams]]"
        url="[[activitiesUrl]]">
    </etools-prp-ajax>

    <etools-prp-ajax
        id="objectives"
        params="[[objectivesParams]]"
        url="[[objectivesUrl]]">
    </etools-prp-ajax>

    <partner-dropdown-content
        partners="{{partners}}">
    </partner-dropdown-content>

    <paper-dialog
        id="dialog"
        with-backdrop
        on-iron-overlay-closed="_close"
        opened="{{opened}}">
      <div class="header layout horizontal justified">
        <h2>[[localize('add_existing_project_activity')]]</h2>

        <paper-icon-button
            class="self-center"
            on-tap="_close"
            icon="icons:close">
        </paper-icon-button>
      </div>

      <paper-dialog-scrollable>
        <error-box errors="[[errors]]"></error-box>

        <div class="app-grid">
          <div class="item">
            <etools-dropdown
              class="validate"
              label="[[localize('cluster')]]"
              selected="{{data.cluster}}"
              options="[[clusters]]"
              option-value="id"
              option-label="title"
              required>
            </etools-dropdown>
          </div>
          <div class="item">
            <etools-dropdown
                class="validate"
                label="[[localize('partner_activity')]]"
                options="[[partnerActivities]]"
                option-value="id"
                option-label="title"
                selected="{{data.partner_activity}}"
                disabled="[[_equals(partnerActivities.length, 0)]]"
                auto-validate
                required>
             </etools-dropdown>
          </div>

          <header class="item-wide">
            <h3>[[localize('projects')]] ([[data.projects.length]])</h3>
          </header>

          <template
            is="dom-repeat"
            items="{{data.projects}}">

            <div class="row layout horizontal item-wide">
              <div class="flex">
                <div class="app-grid">
                  <div class="item">
                    <etools-dropdown
                      class="validate"
                      label="[[localize('partner_project')]]"
                      options="[[data.projects]]"
                      option-value="project_id"
                      option-label="title"
                      selected="[[item.project_id]]"
                      data-index$="[[index]]"
                      auto-validate
                      disabled
                      required>
                    </etools-dropdown>
                  </div>

                  <div class="item">
                    <etools-dropdown
                      class="validate"
                      label="[[localize('status')]]"
                      options="[[statuses]]"
                      option-value="id"
                      option-label="title"
                      selected="{{item.status}}"
                      disabled
                      required>
                    </etools-dropdown>
                  </div>

                  <div class="item">
                    <datepicker-lite
                      class="start-date"
                      label="[[localize('start_date')]]"
                      value="{{item.start_date}}"
                      selected-date-display-format="[[dateFormat]]"
                      error-message=""
                      required>
                    </datepicker-lite>
                  </div>

                  <div class="item">
                    <datepicker-lite
                      class="end-date"
                      label="[[localize('end_date')]]"
                      value="{{item.end_date}}"
                      selected-date-display-format="[[dateFormat]]"
                      error-message=""
                      required>
                    </datepicker-lite>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button
            on-tap="_save"
            class="btn-primary"
            raised>
          [[localize('add_activity')]]
        </paper-button>

        <paper-button class="btn-cancel" on-tap="_close">
          [[localize('cancel')]]
        </paper-button>
      </div>

      <etools-loading active="[[updatePending]]"></etools-loading>
    </paper-dialog>
    `;
    }
    static get observers() {
        return [
            '_fetchPartnerActivities(data.cluster)',
            '_fetchActivityUpdateUrl(responsePlanId, data.partner_activity)',
        ];
    }
    _computeLocalizedStatuses() {
        return [
            { title: this.localize('ongoing'), id: 'Ong' },
            { title: this.localize('planned'), id: 'Pla' },
            { title: this.localize('completed'), id: 'Com' },
        ];
    }
    _setDefaults() {
        const simpleProjectData = {};
        simpleProjectData.project_id = this.projectData.id;
        simpleProjectData.title = this.projectData.title;
        simpleProjectData.status = this.projectData.status;
        simpleProjectData.start_date = moment(this.projectData.start_date).format(Settings.datepickerFormat);
        simpleProjectData.end_date = moment(this.projectData.end_date).format(Settings.datepickerFormat);
        this.set('data', {
            projects: [simpleProjectData]
        });
        this.set('activities', []);
        this.set('objectives', []);
        this.set('errors', {});
    }
    _onOpenedChanged(opened) {
        if (opened) {
            this._setDefaults();
        }
    }
    _validate(e) {
        e.target.validate();
    }
    _computePartner(storePartner, selectedPartner) {
        if (!storePartner) {
            return;
        }
        return storePartner.id || selectedPartner || undefined;
    }
    _fetchActivityUpdateUrl(responsePlanId, activityId) {
        this.set('activityUrl', Endpoints.partnerActivityUpdate(responsePlanId, activityId));
    }
    _computeObjectivesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.responseParametersClusterObjectives(responsePlanId);
    }
    _fetchPartnerActivities(clusterId) {
        const self = this;
        const thunk = this.$.activities.thunk();
        if (typeof clusterId === 'undefined') {
            return;
        }
        this.set('partnerActivities', []);
        this.set('data.partner_activity', undefined);
        this.set('activitiesParams.cluster_id', clusterId);
        this.set('activitiesUrl', Endpoints.partnerActivityList(this.responsePlanId)
            + '?cluster_id=' + clusterId);
        this.$.activities.abort();
        thunk()
            .then((res) => {
            const filteredActivities = res.data.results.filter((item) => {
                return item.projects.find(function (element) {
                    return element.project_id === parseInt(self.projectData.id);
                }) === undefined;
            });
            self.set('partnerActivities', filteredActivities);
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    _fetchObjectives(clusterId) {
        const self = this;
        const thunk = this.$.objectives.thunk();
        if (typeof clusterId === 'undefined') {
            return;
        }
        this.set('objectivesParams.cluster_id', clusterId);
        this.set('objectives', []);
        this.set('data.custom.cluster_objective', undefined);
        this.$.objectives.abort();
        thunk()
            .then((res) => {
            self.set('objectives', res.data.results);
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    _save() {
        const self = this;
        const thunk = this.$.activity.thunk();
        const valid = [
            this._fieldsAreValid(),
            this._dateRangeValid('.start-date', '.end-date')
        ].every(Boolean);
        if (!valid) {
            return;
        }
        this.set('updatePending', true);
        const clonedData = this._clone(this.data); // make copy of data
        const selectedPartnerActivity = this.partnerActivities.find(function (item) {
            return item.id === self.data.partner_activity;
        });
        if (selectedPartnerActivity && selectedPartnerActivity.projects) {
            // assign combined projects to cloned data instead of data directly to fix visual glitch
            clonedData.projects = selectedPartnerActivity.projects.concat(this.data.projects);
        }
        // save cloned data and not regular data, since cloned data has the combined projects
        this.$.activity.body = Object.assign({
            partner: this.partner
        }, clonedData);
        thunk()
            .then(() => {
            self.set('updatePending', false);
            self.set('errors', {});
            self._close('saved');
            setTimeout(() => {
                window.location.reload();
            }, 100);
        })
            .catch((err) => {
            self.set('errors', err.data);
            self.set('updatePending', false);
            fireEvent(self, 'project-details-selection-refit');
        });
    }
    _close(e) {
        if (e && (e === 'saved' ||
            e.target.nodeName === 'PAPER-DIALOG' ||
            e.target.nodeName === 'PAPER-BUTTON' ||
            e.target.nodeName === 'PAPER-ICON-BUTTON')) {
            this.set('data', {});
            this.set('objectives', []);
            this.set('activities', []);
            this.set('errors', {});
            this.close();
        }
        else {
            return;
        }
    }
    _addEventListeners() {
        this.adjustPosition = this.adjustPosition.bind(this);
        this.addEventListener('project-details-selection-refit', this.adjustPosition);
    }
    _removeEventListeners() {
        this.removeEventListener('project-details-selection-refit', this.adjustPosition);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: Object })
], AddExistingActivityFromProjectModal.prototype, "data", void 0);
__decorate([
    property({ type: String })
], AddExistingActivityFromProjectModal.prototype, "activitiesUrl", void 0);
__decorate([
    property({ type: String })
], AddExistingActivityFromProjectModal.prototype, "partnerActivitiesUrl", void 0);
__decorate([
    property({ type: Object })
], AddExistingActivityFromProjectModal.prototype, "projectData", void 0);
__decorate([
    property({ type: Boolean })
], AddExistingActivityFromProjectModal.prototype, "updatePending", void 0);
__decorate([
    property({ type: Boolean, observer: '_onOpenedChanged' })
], AddExistingActivityFromProjectModal.prototype, "opened", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], AddExistingActivityFromProjectModal.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String })
], AddExistingActivityFromProjectModal.prototype, "activityUrl", void 0);
__decorate([
    property({ type: Object })
], AddExistingActivityFromProjectModal.prototype, "activitiesParams", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.responsePlans.current.clusters)' })
], AddExistingActivityFromProjectModal.prototype, "clusters", void 0);
__decorate([
    property({ type: Array, computed: '_computeLocalizedStatuses(resources)' })
], AddExistingActivityFromProjectModal.prototype, "statuses", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], AddExistingActivityFromProjectModal.prototype, "locationId", void 0);
__decorate([
    property({ type: Array })
], AddExistingActivityFromProjectModal.prototype, "activities", void 0);
__decorate([
    property({ type: Array })
], AddExistingActivityFromProjectModal.prototype, "partnerActivities", void 0);
__decorate([
    property({ type: Array })
], AddExistingActivityFromProjectModal.prototype, "objectives", void 0);
__decorate([
    property({ type: Object })
], AddExistingActivityFromProjectModal.prototype, "objectivesParams", void 0);
__decorate([
    property({ type: String })
], AddExistingActivityFromProjectModal.prototype, "selectedPartner", void 0);
__decorate([
    property({ type: String, computed: '_computeObjectivesUrl(responsePlanId)' })
], AddExistingActivityFromProjectModal.prototype, "objectivesUrl", void 0);
__decorate([
    property({ type: Object, computed: '_computePartner(storePartner, selectedPartner)' })
], AddExistingActivityFromProjectModal.prototype, "partner", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partner.current)' })
], AddExistingActivityFromProjectModal.prototype, "storePartner", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)' })
], AddExistingActivityFromProjectModal.prototype, "profile", void 0);
__decorate([
    property({ type: String })
], AddExistingActivityFromProjectModal.prototype, "dateFormat", void 0);
window.customElements.define('planned-action-add-existing-activity-from-project-modal', AddExistingActivityFromProjectModal);
export { AddExistingActivityFromProjectModal as PlannedActioAddExistingActivityFromProjectModalEl };
