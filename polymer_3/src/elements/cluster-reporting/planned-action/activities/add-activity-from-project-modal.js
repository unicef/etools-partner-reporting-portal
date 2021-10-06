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
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/paper-radio-group/paper-radio-group';
import '@polymer/paper-radio-button/paper-radio-button';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-item/paper-item';
import Endpoints from '../../../../endpoints';
import '@polymer/paper-input/paper-input';
import ModalMixin from '../../../../mixins/modal-mixin';
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import { buttonsStyles } from '../../../../styles/buttons-styles';
import { modalStyles } from '../../../../styles/modal-styles';
import '../../../etools-prp-permissions';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
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
class AddActivityFromProjectModal extends LocalizeMixin(UtilsMixin(ModalMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.updatePending = false;
        this.activitiesParams = {
            page_size: 99999
        };
        this.activities = [];
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
        --app-grid-gutter: 0px;
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

      paper-radio-group {
        display: block;
        padding-top: 16px;
      }

      paper-radio-group > .fields {
        padding: calc(var(--app-grid-gutter) / 2) 0;
      }

      paper-radio-group > .fields[empty] {
        padding: 0;
      }

      paper-radio-group .app-grid {
        margin: -var(--app-grid-gutter);
      }

      paper-radio-button {
        margin-left: -12px;
      }

      #mode {
        padding: 12px 0px 12px 0px;
      }

      #mode paper-radio-button {
        display: block;
      }

      etools-dropdown {
        width: 100%;
      }
      paper-dialog-scrollable {
        padding-bottom: 12px;
      }
    </style>

    <cluster-dropdown-content clusters="{{clusters}}"></cluster-dropdown-content>

    <etools-prp-permissions
      permissions="{{permissions}}">
    </etools-prp-permissions>

    <etools-prp-ajax
        id="activity"
        url="[[activityUrl]]"
        method="post"
        body="[[data]]"
        content-type="application/json">
    </etools-prp-ajax>

    <etools-prp-ajax
        id="activities"
        params="[[activitiesParams]]"
        url="[[activitiesUrl]]">
    </etools-prp-ajax>

    <etools-prp-ajax
        id="partnerActivities"
        params="[[activitiesParams]]"
        url="[[partnerActivitiesUrl]]">
    </etools-prp-ajax>

    <etools-prp-ajax
        id="objectives"
        params="[[objectivesParams]]"
        url="[[objectivesUrl]]">
    </etools-prp-ajax>

    <template
        is="dom-if"
        if="[[_displayPartner(permissions)]]"
        restamp="true">
      <partner-dropdown-content
          partners="{{partners}}">
      </partner-dropdown-content>
    </template>

    <paper-dialog
        id="dialog"
        with-backdrop
        on-iron-overlay-closed="_close"
        opened="{{opened}}">
      <div class="header layout horizontal justified">
        <h2>[[localize('add_new_project_activity')]]</h2>

        <paper-icon-button
            class="self-center"
            on-tap="_close"
            icon="icons:close">
        </paper-icon-button>
      </div>

      <paper-dialog-scrollable>
        <error-box errors="[[errors]]"></error-box>

        <paper-radio-group id="mode" selected="{{mode}}">
            <paper-radio-button name="cluster">
              <strong>[[localize('add_from_cluster_activities')]]</strong>
            </paper-radio-button>

            <paper-radio-button name="custom">
              <strong>[[localize('add_custom_activity')]]</strong>
            </paper-radio-button>
        </paper-radio-group>

          <div class="fields" empty$="[[!_equals(mode, 'cluster')]]">
            <template
                is="dom-if"
                if="[[_equals(mode, 'cluster')]]"
                restamp="true">
              <div class="app-grid">
                <div class="item">
                  <etools-dropdown
                    class="validate"
                    label="[[localize('cluster')]]"
                    options="[[clusters]]"
                    option-value="id"
                    option-label="title"
                    selected="{{data.cluster.cluster}}"
                    hide-search
                    required>
                  </etools-dropdown>
                </div>
                <div class="item">
                  <etools-dropdown
                    class="validate"
                    label="[[localize('activity')]]"
                    options="[[activities]]"
                    option-value="id"
                    option-label="title"
                    selected="{{data.cluster.cluster_activity}}"
                    disabled="[[_equals(activities.length, 0)]]"
                    required>
                  </etools-dropdown>
                </div>
              </div>

              <header class="item-wide">
                <h3>[[localize('projects')]] ([[data.cluster.projects.length]])</h3>
              </header>

              <template
                is="dom-repeat"
                items="{{data.cluster.projects}}">

                <div class="row layout horizontal">
                  <div class="flex">
                    <div class="app-grid">
                      <div class="item">
                        <etools-dropdown
                            class="validate"
                            label="[[localize('partner_project')]]"
                            options="[[data.cluster.projects]]"
                            option-value="project_id"
                            option-label="title"
                            selected="{{item.project_id}}"
                            disabled="[[_equals(projects.length, 0)]]"
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
                          hide-search
                          required
                          disabled>
                        </etools-dropdown>
                      </div>

                      <div class="item">
                        <datepicker-lite
                          disabled
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
                          disabled
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
            </template>
          </div>

          <div class="fields" empty$="[[!_equals(mode, 'custom')]]">
            <template
                is="dom-if"
                if="[[_equals(mode, 'custom')]]"
                restamp="true">
              <div class="app-grid">
                <div class="item">
                  <etools-dropdown
                      class="validate"
                      label="[[localize('cluster')]]"
                      options="[[clusters]]"
                      option-value="id"
                      option-label="title"
                      selected="{{data.custom.cluster}}"
                      hide-search
                      required>
                  </etools-dropdown>
                </div>
                <div class="item">
                  <etools-dropdown
                      class="validate"
                      label="[[localize('cluster_objective')]]"
                      options="[[objectives]]"
                      option-value="id"
                      option-label="title"
                      selected="{{data.custom.cluster_objective}}"
                      disabled="[[_equals(objectives.length, 0)]]"
                      auto-validate
                      required>
                  </etools-dropdown>
                </div>
                <div class="item item-wide">
                  <paper-input
                      class="validate"
                      label="[[localize('title')]]"
                      value="{{data.custom.title}}"
                      on-input="_validate"
                      always-float-label
                      required>
                  </paper-input>
                </div>

                <header class="item-wide">
                  <h3>[[localize('projects')]] ([[data.custom.projects.length]])</h3>
                </header>

                <template
                  is="dom-repeat"
                  items="{{data.custom.projects}}">

                  <div class="row layout horizontal item-wide">
                    <div class="flex">
                      <div class="app-grid">
                          <div class="item">
                          <etools-dropdown
                              class="validate"
                              label="[[localize('partner_project')]]"
                              options="[[data.custom.projects]]"
                              option-value="project_id"
                              option-label="title"
                              selected="[[item.project_id]]"
                              disabled="[[_equals(projects.length, 0)]]"
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
                              hide-search
                              required
                              disabled>
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
            '_fetchActivities(data.cluster.cluster)',
            '_fetchObjectives(data.custom.cluster)'
        ];
    }
    _computeLocalizedStatuses() {
        return [
            { title: this.localize('ongoing'), id: 'Ong' },
            { title: this.localize('planned'), id: 'Pla' },
            { title: this.localize('completed'), id: 'Com' }
        ];
    }
    _add() {
        if (this.mode === 'cluster') {
            this.push('data.cluster.projects', {});
        }
        else {
            this.push('data.custom.projects', {});
        }
        fireEvent(this, 'project-details-selection-refit');
    }
    _remove(e) {
        const currentIndex = +e.target.dataset.index;
        if (this.mode === 'cluster') {
            this.splice('data.cluster.projects', currentIndex, 1);
        }
        else {
            this.splice('data.custom.projects', currentIndex, 1);
        }
        fireEvent(this, 'project-details-selection-refit');
    }
    _setDefaults() {
        const simpleProjectData = {};
        simpleProjectData.project_id = this.projectData.id;
        simpleProjectData.title = this.projectData.title;
        simpleProjectData.status = this.projectData.status;
        simpleProjectData.start_date = moment(this.projectData.start_date).format(Settings.datepickerFormat);
        simpleProjectData.end_date = moment(this.projectData.end_date).format(Settings.datepickerFormat);
        this.set('data', {
            cluster: {
                projects: [simpleProjectData]
            },
            custom: {
                projects: [simpleProjectData]
            }
        });
        this.set('activities', []);
        this.set('objectives', []);
        this.set('errors', {});
    }
    _onOpenedChanged(opened) {
        if (opened) {
            // this.set('mode', 'cluster');
            // this.async(function () {
            //   this.set('mode', 'cluster');
            // });
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
    _displayPartner(permissions) {
        if (!permissions) {
            return;
        }
        return permissions.addPartnerToProject;
    }
    _computeActivityUrl(responsePlanId, mode) {
        if (!responsePlanId || !mode) {
            return;
        }
        return Endpoints.partnerActivity(responsePlanId, mode);
    }
    _computeObjectivesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.responseParametersClusterObjectives(responsePlanId);
    }
    _fetchActivities(clusterId) {
        if (!clusterId || !this.responsePlanId) {
            return;
        }
        const self = this;
        const thunk = this.$.activities.thunk();
        this.set('partnerActivitiesUrl', Endpoints.partnerActivityList(this.responsePlanId) +
            '?cluster_id=' + clusterId);
        this.set('activities', []);
        this.set('data.cluster.cluster_activity', undefined);
        this.set('activitiesParams.cluster_id', clusterId);
        this.set('activitiesUrl', Endpoints.responseParametersClusterActivities(this.responsePlanId) +
            '?cluster_id=' + clusterId);
        this.$.activities.abort();
        thunk()
            .then(function (res) {
            self.set('activities', res.data.results);
            return self.$.partnerActivities.thunk()();
        })
            .then((res) => {
            const adoptedClusterActivities = new Set();
            res.data.results.forEach(function (item) {
                if (item.cluster_activity !== null) {
                    adoptedClusterActivities.add(item.cluster_activity.id);
                }
            });
            self.set('activities', self.activities.filter((item) => {
                return adoptedClusterActivities.has(item.id) !== true;
            }));
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    _fetchObjectives(clusterId) {
        if (!clusterId || !this.objectivesUrl) {
            return;
        }
        const self = this;
        const thunk = this.$.objectives.thunk();
        this.set('objectivesParams.cluster_id', clusterId);
        this.set('objectives', []);
        this.set('data.custom.cluster_objective', undefined);
        this.$.objectives.abort();
        thunk()
            .then(function (res) {
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
        this.$.activity.body = Object.assign({
            partner: this.projectData.partner_id
        }, this.data[this.mode]);
        thunk()
            .then((res) => {
            fireEvent(self, 'activity-added', res.data);
            self.set('updatePending', false);
            self.set('errors', {});
            self._close('saved');
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
            this.set('mode', '');
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
        this.addEventListener('paper-radio-group-changed', this.adjustPosition);
        this.addEventListener('project-details-selection-refit', this.adjustPosition);
    }
    _removeEventListeners() {
        this.removeEventListener('paper-radio-group-changed', this.adjustPosition);
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
], AddActivityFromProjectModal.prototype, "data", void 0);
__decorate([
    property({ type: String })
], AddActivityFromProjectModal.prototype, "activitiesUrl", void 0);
__decorate([
    property({ type: String })
], AddActivityFromProjectModal.prototype, "partnerActivitiesUrl", void 0);
__decorate([
    property({ type: Object })
], AddActivityFromProjectModal.prototype, "projectData", void 0);
__decorate([
    property({ type: Boolean })
], AddActivityFromProjectModal.prototype, "updatePending", void 0);
__decorate([
    property({ type: String, observer: '_setDefaults' })
], AddActivityFromProjectModal.prototype, "mode", void 0);
__decorate([
    property({ type: Boolean, observer: '_onOpenedChanged' })
], AddActivityFromProjectModal.prototype, "opened", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], AddActivityFromProjectModal.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String, computed: '_computeActivityUrl(responsePlanId, mode)' })
], AddActivityFromProjectModal.prototype, "activityUrl", void 0);
__decorate([
    property({ type: Object })
], AddActivityFromProjectModal.prototype, "activitiesParams", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.responsePlans.current.clusters)' })
], AddActivityFromProjectModal.prototype, "clusters", void 0);
__decorate([
    property({ type: Array, computed: '_computeLocalizedStatuses(resources)' })
], AddActivityFromProjectModal.prototype, "statuses", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], AddActivityFromProjectModal.prototype, "locationId", void 0);
__decorate([
    property({ type: Array })
], AddActivityFromProjectModal.prototype, "activities", void 0);
__decorate([
    property({ type: Array })
], AddActivityFromProjectModal.prototype, "objectives", void 0);
__decorate([
    property({ type: Object })
], AddActivityFromProjectModal.prototype, "objectivesParams", void 0);
__decorate([
    property({ type: String })
], AddActivityFromProjectModal.prototype, "selectedPartner", void 0);
__decorate([
    property({ type: String, computed: '_computeObjectivesUrl(responsePlanId)' })
], AddActivityFromProjectModal.prototype, "objectivesUrl", void 0);
__decorate([
    property({ type: Object, computed: '_computePartner(storePartner, selectedPartner)' })
], AddActivityFromProjectModal.prototype, "partner", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partner.current)' })
], AddActivityFromProjectModal.prototype, "storePartner", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)' })
], AddActivityFromProjectModal.prototype, "profile", void 0);
__decorate([
    property({ type: String })
], AddActivityFromProjectModal.prototype, "dateFormat", void 0);
window.customElements.define('planned-action-add-activity-from-project-modal', AddActivityFromProjectModal);
export { AddActivityFromProjectModal as PlannedActionAddActivityFromProjectModalEl };
