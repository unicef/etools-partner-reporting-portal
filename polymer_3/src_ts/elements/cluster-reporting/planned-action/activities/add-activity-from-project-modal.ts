import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
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
import {buttonsStyles} from '../../../../styles/buttons-styles';
import {modalStyles} from '../../../../styles/modal-styles';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-ajax';
import '../../../etools-prp-permissions';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '../../../form-fields/partner-dropdown-content';
import '../../../form-fields/cluster-dropdown-content';
import '../../../error-box-errors';
import {GenericObject} from '../../../../typings/globals.types';
import {fireEvent} from '../../../../utils/fire-custom-event';
import Settings from '../../../../settings';
declare const moment: any;

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class AddActivityFromProjectModal extends LocalizeMixin(UtilsMixin(ModalMixin(ReduxConnectedElement))) {

  static get template() {
    return html`
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

  @property({type: Object})
  data!: GenericObject;

  @property({type: String})
  activitiesUrl!: string;

  @property({type: String})
  partnerActivitiesUrl!: string;

  @property({type: Object})
  projectData!: GenericObject;

  @property({type: Boolean})
  updatePending = false;

  @property({type: String, observer: '_setDefaults'})
  mode!: string;

  @property({type: Boolean, observer: '_onOpenedChanged'})
  opened!: boolean;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String, computed: '_computeActivityUrl(responsePlanId, mode)'})
  activityUrl!: string;

  @property({type: Object})
  activitiesParams = {
    page_size: 99999,
  };

  @property({type: Array, computed: 'getReduxStateArray(rootState.responsePlans.current.clusters)'})
  clusters!: any[];

  @property({type: Array, computed: '_computeLocalizedStatuses(resources)'})
  statuses!: any[];

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: Array})
  activities = [];

  @property({type: Array})
  objectives = [];

  @property({type: Object})
  objectivesParams = {
    page_size: 99999,
  };

  @property({type: String})
  selectedPartner = '';

  @property({type: String, computed: '_computeObjectivesUrl(responsePlanId)'})
  objectivesUrl!: string;

  @property({type: Object, computed: '_computePartner(storePartner, selectedPartner)'})
  partner!: GenericObject;

  @property({type: Object, computed: 'getReduxStateObject(rootState.partner.current)'})
  storePartner!: GenericObject;

  @property({type: Object, computed: 'getReduxStateObject(rootState.userProfile.profile)'})
  profile!: GenericObject;

  @property({type: String})
  dateFormat = Settings.dateFormat;

  static get observers() {
    return [
      '_fetchActivities(data.cluster.cluster)',
      '_fetchObjectives(data.custom.cluster)',
    ];
  }

  _computeLocalizedStatuses() {

    return [
      {title: this.localize('ongoing'), id: 'Ong'},
      {title: this.localize('planned'), id: 'Pla'},
      {title: this.localize('completed'), id: 'Com'},
    ];
  }

  _add() {
    if (this.mode === 'cluster') {
      this.push('data.cluster.projects', {});
    } else {
      this.push('data.custom.projects', {});
    }
    fireEvent(this, 'project-details-selection-refit');
  }

  _remove(e: CustomEvent) {
    const currentIndex = +(e.target as any).dataset.index;

    if (this.mode === 'cluster') {
      this.splice('data.cluster.projects', currentIndex, 1);
    } else {
      this.splice('data.custom.projects', currentIndex, 1);
    }

    fireEvent(this, 'project-details-selection-refit');
  }

  _setDefaults() {
    const simpleProjectData: GenericObject = {};

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
      },
    });
    this.set('activities', []);
    this.set('objectives', []);
    this.set('errors', {});
  }

  _onOpenedChanged(opened: boolean) {
    if (opened) {
      // this.set('mode', 'cluster');

      // this.async(function () {
      //   this.set('mode', 'cluster');
      // });
    }
  }

  _validate(e: CustomEvent) {
    e.target.validate();
  }

  _computePartner(storePartner: GenericObject, selectedPartner: string) {
    if (!storePartner) {
      return;
    }
    return storePartner.id || selectedPartner || undefined;
  }

  _displayPartner(permissions: GenericObject) {
    if (!permissions) {
      return;
    }
    return permissions.addPartnerToProject;
  }

  _computeActivityUrl(responsePlanId: string, mode: string) {
    if (!responsePlanId || !mode) {
      return;
    }
    return Endpoints.partnerActivity(responsePlanId, mode);
  }

  _computeObjectivesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.responseParametersClusterObjectives(responsePlanId);
  }

  _fetchActivities(clusterId: string) {
    if (!clusterId || !this.responsePlanId) {
      return;
    }

    const self = this;
    const thunk = (this.$.activities as EtoolsPrpAjaxEl).thunk();
    this.set('partnerActivitiesUrl', Endpoints.partnerActivityList(this.responsePlanId)
      + '?cluster_id=' + clusterId);

    this.set('activities', []);
    this.set('data.cluster.cluster_activity', undefined);
    this.set('activitiesParams.cluster_id', clusterId);
    this.set('activitiesUrl',
      Endpoints.responseParametersClusterActivities(this.responsePlanId)
      + '?cluster_id=' + clusterId);

    (this.$.activities as EtoolsPrpAjaxEl).abort();

    thunk()
      .then(function(res: any) {
        self.set('activities', res.data.results);

        return (self.$.partnerActivities as EtoolsPrpAjaxEl).thunk()();
      })
      .then(function(res: any) {
        var adoptedClusterActivities = new Set();
        res.data.results.forEach(function(item: any) {
          if (item.cluster_activity !== null) {
            adoptedClusterActivities.add(item.cluster_activity.id);
          }
        });

        self.set('activities', self.activities.filter(function(item) {
          return adoptedClusterActivities.has(item.id) !== true;
        }));

      })
      .catch(function(err) {
        // TODO: error handling
      });
  }

  _fetchObjectives(clusterId: string) {
    if (!clusterId || !this.objectivesUrl) {
      return;
    }

    const self = this;
    const thunk = (this.$.objectives as EtoolsPrpAjaxEl).thunk();

    this.set('objectivesParams.cluster_id', clusterId);
    this.set('objectives', []);
    this.set('data.custom.cluster_objective', undefined);

    (this.$.objectives as EtoolsPrpAjaxEl).abort();

    thunk()
      .then(function(res: any) {
        self.set('objectives', res.data.results);
      })
      .catch(function(err) {
        // TODO: error handling
      });
  }

  _save() {
    var self = this;
    var thunk = (this.$.activity as EtoolsPrpAjaxEl).thunk();
    var valid = [
      this._fieldsAreValid(),
      this._dateRangeValid('.start-date', '.end-date'),
    ].every(Boolean);

    if (!valid) {
      return;
    }

    this.set('updatePending', true);

    this.$.activity.body = Object.assign({
      partner: this.projectData.partner_id,
    }, this.data[this.mode]);
    thunk()
      .then(function(res: any) {
        fireEvent(self, 'activity-added', res.data);
        self.set('updatePending', false);
        self.set('errors', {});
        self._close('saved');
      })
      .catch(function(err: any) {
        self.set('errors', err.data);
        self.set('updatePending', false);
        fireEvent(self, 'project-details-selection-refit');
      });
  }

  _close(e: CustomEvent) {
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
    } else {
      return;
    }
  }

  _addEventListeners() {
    this.adjustPosition = this.adjustPosition.bind(this);

    this.addEventListener('paper-radio-group-changed', this.adjustPosition as any);
    this.addEventListener('project-details-selection-refit', this.adjustPosition as any);
  }

  _removeEventListeners() {

    this.removeEventListener('paper-radio-group-changed', this.adjustPosition as any);
    this.removeEventListener('project-details-selection-refit', this.adjustPosition as any);
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
window.customElements.define('planned-action-add-activity-from-project-modal', AddActivityFromProjectModal);

export {AddActivityFromProjectModal as PlannedActionAddActivityFromProjectModalEl};
