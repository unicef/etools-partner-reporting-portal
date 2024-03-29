import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {ReduxConnectedElement} from '../../../../etools-prp-common/ReduxConnectedElement';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/paper-radio-button/paper-radio-button';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-item/paper-item';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import Endpoints from '../../../../endpoints';
import ModalMixin from '../../../../etools-prp-common/mixins/modal-mixin';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../etools-prp-common/mixins/localize-mixin';
import {buttonsStyles} from '../../../../etools-prp-common/styles/buttons-styles';
import {modalStyles} from '../../../../etools-prp-common/styles/modal-styles';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../../etools-prp-common/elements/etools-prp-permissions';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '../../../form-fields/partner-dropdown-content';
import '../../../form-fields/cluster-dropdown-content';
import '../../../../etools-prp-common/elements/error-box-errors';
import {GenericObject} from '../../../../etools-prp-common/typings/globals.types';
import {fireEvent} from '../../../../etools-prp-common/utils/fire-custom-event';
import {PaperIconButtonElement} from '@polymer/paper-icon-button/paper-icon-button';
import Settings from '../../../../etools-prp-common/settings';

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PlannedActionActivityEditingModal extends UtilsMixin(ModalMixin(LocalizeMixin(ReduxConnectedElement))) {
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
            width: 700px;
          }
        }

        .app-grid {
          margin: 0 -var(--app-grid-gutter);
          padding-bottom: 24px;
          padding-right: 24px;
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
          width: 100px;
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

        etools-dropdown {
          width: 100%;
        }
      </style>

      <etools-prp-ajax
        id="editActivity"
        url="[[activityUrl]]"
        method="patch"
        body="[[data]]"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <etools-prp-ajax id="activities" params="[[activitiesParams]]" url="[[activitiesUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="objectives" params="[[objectivesParams]]" url="[[objectivesUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="projects" params="[[projectsParams]]" url="[[projectsUrl]]"> </etools-prp-ajax>

      <paper-dialog id="dialog" modal opened="{{opened}}">
        <div class="header layout horizontal justified">
          <h2>[[localize('edit_activity')]]</h2>

          <paper-icon-button class="self-center" on-tap="close" icon="icons:close"> </paper-icon-button>
        </div>

        <paper-dialog-scrollable>
          <error-box errors="[[errors]]"></error-box>
          <template is="dom-if" if="[[_equals(mode, 'cluster')]]" restamp="true">
            <iron-form class="app-grid">
              <div class="item">
                <etools-dropdown
                  class="validate"
                  label="[[localize('cluster')]]"
                  options="[[clusters]]"
                  option-value="id"
                  option-label="title"
                  selected="{{data.cluster}}"
                  disabled
                  with-backdrop
                  required
                >
                </etools-dropdown>
              </div>
              <div class="item">
                <etools-dropdown
                  class="validate"
                  label="[[localize('cluster_activity')]]"
                  options="[[activities]]"
                  option-value="id"
                  option-label="title"
                  selected="{{data.cluster_activity}}"
                  disabled
                  with-backdrop
                  required
                >
                </etools-dropdown>
              </div>

              <header class="item-wide">
                <h3>[[localize('projects')]] ([[data.projects.length]])</h3>
              </header>
              <template is="dom-repeat" items="{{data.projects}}">
                <div class="row layout horizontal item-wide">
                  <div class="flex-none layout vertical center-center col-actions">
                    <paper-icon-button
                      index="[[index]]"
                      class="remove-btn"
                      data-index$="[[index]]"
                      on-tap="_remove"
                      icon="icons:cancel"
                    >
                    </paper-icon-button>
                    <paper-tooltip offset="5">[[localize('remove')]]</paper-tooltip>
                  </div>

                  <div class="flex">
                    <div class="app-grid">
                      <div class="item">
                        <etools-dropdown
                          class="validate"
                          label="[[localize('partner_project')]]"
                          options="[[projects]]"
                          option-value="id"
                          option-label="title"
                          selected="{{item.project_id}}"
                          disabled="[[_equals(projects.length, 0)]]"
                          auto-validate
                          with-backdrop
                          required
                        >
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
                          with-backdrop
                          required
                        >
                        </etools-dropdown>
                      </div>

                      <div class="item">
                        <datepicker-lite
                          class="start-date"
                          label="[[localize('start_date')]]"
                          input-date-format="[[dateFormat]]"
                          selected-date-display-format="[[dateFormat]]"
                          value="{{item.start_date}}"
                          error-message=""
                          required
                        >
                        </datepicker-lite>
                      </div>

                      <div class="item">
                        <datepicker-lite
                          class="end-date"
                          label="[[localize('end_date')]]"
                          input-date-format="[[dateFormat]]"
                          selected-date-display-format="[[dateFormat]]"
                          value="{{item.end_date}}"
                          error-message=""
                          required
                        >
                        </datepicker-lite>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <paper-button class="btn-primary add-project-btn" on-tap="_add">
                [[localize('add_project')]]
              </paper-button>
            </iron-form>
          </template>

          <template is="dom-if" if="[[_equals(mode, 'custom')]]" restamp="true">
            <iron-form class="app-grid">
              <div class="item">
                <etools-dropdown
                  class="validate"
                  label="[[localize('cluster')]]"
                  options="[[clusters]]"
                  option-value="id"
                  option-label="title"
                  selected="{{data.cluster}}"
                  with-backdrop
                  required
                >
                </etools-dropdown>
              </div>

              <div class="item">
                <etools-dropdown
                  class="validate"
                  label="[[localize('cluster_objective')]]"
                  options="[[objectives]]"
                  option-value="id"
                  option-label="title"
                  selected="{{data.cluster_objective}}"
                  disabled="[[_equals(objectives.length, 0)]]"
                  with-backdrop
                  required
                >
                </etools-dropdown>
              </div>

              <div class="item item-wide">
                <paper-input
                  class="validate"
                  label="[[localize('title')]]"
                  value="{{data.title}}"
                  on-input="_validate"
                  always-float-label
                  required
                >
                </paper-input>
              </div>

              <header class="item-wide">
                <h3>[[localize('projects')]] ([[data.projects.length]])</h3>
              </header>
              <template is="dom-repeat" items="{{data.projects}}">
                <div class="row layout horizontal item-wide">
                  <div class="flex-none layout vertical center-center col-actions">
                    <paper-icon-button
                      index="[[index]]"
                      class="remove-btn"
                      data-index$="[[index]]"
                      on-tap="_remove"
                      icon="icons:cancel"
                    >
                    </paper-icon-button>
                    <paper-tooltip offset="5">[[localize('remove')]]</paper-tooltip>
                  </div>

                  <div class="flex">
                    <div class="app-grid">
                      <div class="item">
                        <etools-dropdown
                          class="validate"
                          label="[[localize('partner_project')]]"
                          options="[[projects]]"
                          option-value="id"
                          option-label="title"
                          selected="{{item.project_id}}"
                          disabled="[[_equals(projects.length, 0)]]"
                          auto-validate
                          with-backdrop
                          required
                        >
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
                          with-backdrop
                          required
                        >
                        </etools-dropdown>
                      </div>

                      <div class="item">
                        <datepicker-lite
                          class="start-date"
                          label="[[localize('start_date')]]"
                          value="{{item.start_date}}"
                          error-message=""
                          input-date-format="[[dateFormat]]"
                          selected-date-display-format="[[dateFormat]]"
                          required
                        >
                        </datepicker-lite>
                      </div>

                      <div class="item">
                        <datepicker-lite
                          class="end-date"
                          label="[[localize('end_date')]]"
                          value="{{item.end_date}}"
                          error-message=""
                          input-date-format="[[dateFormat]]"
                          selected-date-display-format="[[dateFormat]]"
                          required
                        >
                        </datepicker-lite>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <paper-button class="btn-primary add-project-btn" on-tap="_add">
                [[localize('add_project')]]
              </paper-button>
            </iron-form>
          </template>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button on-tap="_save" class="btn-primary" raised> [[localize('save')]] </paper-button>

          <paper-button class="btn-cancel" on-tap="close"> [[localize('cancel')]] </paper-button>
        </div>

        <etools-loading active="[[updatePending]]"></etools-loading>
      </paper-dialog>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: String})
  activitiesUrl!: string;

  @property({type: Object})
  editData: GenericObject = {};

  @property({type: Boolean})
  updatePending = false;

  @property({type: String, computed: '_setMode(editData)'})
  mode!: string;

  @property({type: Boolean})
  opened = false;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String, computed: '_computeActivityUrl(responsePlanId, data.id)'})
  activityUrl!: string;

  @property({type: Object})
  activitiesParams = {
    page_size: 99999
  };

  @property({type: Array, computed: '_computeLocalizedStatuses(resources)'})
  statuses!: any[];

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.responsePlans.current.clusters)'})
  clusters!: any[];

  @property({type: Array})
  objectives = [];

  @property({type: Object})
  objectivesParams = {
    page_size: 99999
  };

  @property({type: String, computed: '_computeObjectivesUrl(responsePlanId)'})
  objectivesUrl!: string;

  @property({type: Array})
  projects = [];

  @property({type: Object})
  projectsParams = {
    page_size: 99999
  };

  @property({type: String, computed: '_computeProjectsUrl(responsePlanId)'})
  projectsUrl!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.partner.current)'})
  partner!: GenericObject;

  @property({type: Number, computed: '_computePartnerId(partner, editData.partner)'})
  partnerId!: number;

  @property({type: String})
  dateFormat: string = Settings.dateFormat;

  static get observers() {
    return ['_fetchProjects(partnerId)', '_fetchActivities(data.cluster)', '_fetchObjectives(data.cluster)'];
  }

  _computeLocalizedStatuses() {
    return [
      {title: this.localize('ongoing'), id: 'Ong'},
      {title: this.localize('planned'), id: 'Pla'},
      {title: this.localize('completed'), id: 'Com'}
    ];
  }

  _add() {
    this.push('data.projects', {});
    fireEvent(this, 'project-details-selection-refit');
  }

  _remove(e: CustomEvent) {
    const currentIndex = +(e.target as PaperIconButtonElement).dataset.index!;
    this.splice('data.projects', currentIndex, 1);
    fireEvent(this, 'project-details-selection-refit');
  }

  _setDefaults() {
    this.set(
      'data',
      Object.assign(
        {},
        {
          id: this.editData.id,
          cluster: this.editData.cluster.id,
          cluster_activity: null,
          cluster_objective: this.editData.cluster_objective.id,
          title: this.editData.title,
          is_custom: this.editData.is_custom,
          partner: this.editData.partner,
          reportables: this.editData.reportables,
          projects: this.editData.projects
        }
      )
    );

    if (this.editData.is_custom) {
      this.set('data.title', this.editData.title);
    } else {
      this.set('data.cluster_activity', this.editData.cluster_activity.id);
    }
  }

  open() {
    this.set('opened', true);
    this.set('refresh', true);
    this._setDefaults();
  }

  close() {
    this.set('data', {});
    this.set('opened', false);
    this.set('refresh', false);
    this.set('errors', {});
  }

  _validate(e: CustomEvent) {
    (e.target as any).validate();
  }

  _computePartnerId(partner: GenericObject, editPartner: GenericObject) {
    if (!partner || !editPartner) {
      return;
    }
    return partner.id || editPartner.id;
  }

  _computeActivityUrl(responsePlanId: string, activityId: string) {
    return Endpoints.partnerActivityUpdate(responsePlanId, activityId);
  }

  _computeObjectivesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.responseParametersClusterObjectives(responsePlanId);
  }

  _computeProjectsUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.plannedActions(responsePlanId);
  }

  _setMode(editActivityData: GenericObject) {
    if (editActivityData.is_custom) {
      return 'custom';
    } else {
      return 'cluster';
    }
  }

  _fetchActivities(clusterId: string) {
    if (!clusterId) {
      return;
    }
    const thunk = (this.$.activities as EtoolsPrpAjaxEl).thunk();

    this.set('activities', []);
    this.set('activitiesParams.cluster_id', clusterId);
    this.set(
      'activitiesUrl',
      Endpoints.responseParametersClusterActivities(this.responsePlanId) + '?cluster_id=' + clusterId
    );
    (this.$.activities as EtoolsPrpAjaxEl).abort();

    thunk()
      .then((res: any) => {
        this.set('activities', res.data.results);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  _fetchObjectives(clusterId: string) {
    if (!clusterId) {
      return;
    }

    const thunk = (this.$.objectives as EtoolsPrpAjaxEl).thunk();

    this.set('objectivesParams.cluster_id', clusterId);
    this.set('objectives', []);

    (this.$.objectives as EtoolsPrpAjaxEl).abort();

    thunk()
      .then((res: any) => {
        this.set('objectives', res.data.results);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  _fetchProjects(partnerId: string) {
    if (!partnerId) {
      return;
    }
    const thunk = (this.$.projects as EtoolsPrpAjaxEl).thunk();

    this.set('projectsParams.partner', partnerId);

    thunk()
      .then((res: any) => {
        this.set('projects', res.data.results);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  _save() {
    const thunk = (this.$.editActivity as EtoolsPrpAjaxEl).thunk();
    const valid = [this._fieldsAreValid(), this._dateRangeValid('.start-date', '.end-date')].every(Boolean);

    if (!valid) {
      return;
    }

    this.set('updatePending', true);

    thunk()
      .then((res: any) => {
        fireEvent(this, 'pa-activity-edited', res.data);
        this.set('updatePending', false);
        this.set('errors', {});
        this.close();
      })
      .catch((err: GenericObject) => {
        this.set('errors', err.data);
        this.set('updatePending', false);
      });
  }

  _addEventListeners() {
    this.adjustPosition = this.adjustPosition.bind(this);
    this.addEventListener('project-details-selection-refit', this.adjustPosition as any);
  }

  _removeEventListeners() {
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
window.customElements.define('planned-action-activity-editing-modal', PlannedActionActivityEditingModal);

export {PlannedActionActivityEditingModal as PlannedActionActivityEditingModalEl};
