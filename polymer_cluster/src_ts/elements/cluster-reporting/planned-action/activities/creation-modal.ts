import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {ReduxConnectedElement} from '../../../../etools-prp-common/ReduxConnectedElement';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import {PaperIconButtonElement} from '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/paper-radio-group/paper-radio-group';
import '@polymer/paper-radio-button/paper-radio-button';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-item/paper-item';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import Endpoints from '../../../../etools-prp-common/endpoints';
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
import {waitForIronOverlayToClose} from '../../../../etools-prp-common/utils/util';
import Settings from '../../../../etools-prp-common/settings';

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PlannedActionActivityModal extends UtilsMixin(ModalMixin(LocalizeMixin(ReduxConnectedElement))) {
  static get template() {
    return html`
      ${buttonsStyles} ${modalStyles}
      <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;

          --app-grid-columns: 2;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;
          --app-grid-gutter: 10px;

          --paper-dialog: {
            width: 740px;
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
          margin-right: 48px;
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
          display: block;
        }

        .full-width {
          @apply --app-grid-expandible-item;
        }
        etools-dropdown {
          width: 100%;
        }
        datepicker-lite {
          --paper-input-container: {
            width: 100%;
          }
        }
      </style>

      <cluster-dropdown-content clusters="{{clusters}}" partner="{{ partner }}"></cluster-dropdown-content>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <etools-prp-ajax
        id="activity"
        url="[[activityUrl]]"
        method="post"
        body="[[data]]"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <etools-prp-ajax id="activities" params="[[activitiesParams]]" url="[[activitiesUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="projects" params="[[projectsParams]]" url="[[projectsUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="objectives" params="[[objectivesParams]]" url="[[objectivesUrl]]"> </etools-prp-ajax>

      <template is="dom-if" if="[[_displayPartner(permissions)]]" restamp="true">
        <partner-dropdown-content partners="{{partners}}"> </partner-dropdown-content>
      </template>

      <paper-dialog id="dialog" modal on-iron-overlay-closed="_close" opened="{{opened}}">
        <div class="header layout horizontal justified">
          <h2>[[localize('add_activity')]]</h2>

          <paper-icon-button class="self-center" on-tap="_close" icon="icons:close"> </paper-icon-button>
        </div>

        <paper-dialog-scrollable>
          <error-box errors="[[errors]]"></error-box>
          <template is="dom-if" if="[[_displayPartner(permissions)]]" restamp="true">
            <etools-dropdown
              class="item validate full-width"
              label="[[localize('partner')]]"
              options="[[partners]]"
              option-value="id"
              option-label="title"
              selected="{{selectedPartner}}"
              with-backdrop
              required
            >
            </etools-dropdown>
          </template>

          <paper-radio-group id="mode" selected="{{mode}}">
            <paper-radio-button name="cluster">
              <strong>[[localize('add_from_cluster_activities')]]</strong>
            </paper-radio-button>
            <paper-radio-button name="custom">
              <strong>[[localize('add_custom_activity')]]</strong>
            </paper-radio-button>
          </paper-radio-group>

          <div class="fields" empty$="[[!_equals(mode, 'cluster')]]">
            <template is="dom-if" if="[[_equals(mode, 'cluster')]]" restamp="true">
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
                    with-backdrop
                    required
                  >
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
                    with-backdrop
                    required
                  >
                  </etools-dropdown>
                </div>
              </div>

              <template is="dom-if" if="[[data.cluster.cluster_activity]]" restamp="true">
                <header class="item-wide">
                  <h3>[[localize('projects')]] ([[data.cluster.projects.length]])</h3>
                </header>
              </template>

              <template is="dom-repeat" items="{{data.cluster.projects}}">
                <div class="row layout horizontal">
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
                          hide-search
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
                          selected-date-display-format="[[dateFormat]]"
                          error-message=""
                          required
                        >
                        </datepicker-lite>
                      </div>

                      <div class="item">
                        <datepicker-lite
                          class="end-date"
                          label="[[localize('end_date')]]"
                          value="{{item.end_date}}"
                          selected-date-display-format="[[dateFormat]]"
                          error-message=""
                          required
                        >
                        </datepicker-lite>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template is="dom-if" if="[[data.cluster.cluster_activity]]" restamp="true">
                <paper-button class="btn-primary add-project-btn" on-tap="_add">
                  [[localize('add_project')]]
                </paper-button>
              </template>
            </template>
          </div>

          <div class="fields" empty$="[[!_equals(mode, 'custom')]]">
            <template is="dom-if" if="[[_equals(mode, 'custom')]]" restamp="true">
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
                    selected="{{data.custom.cluster_objective}}"
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
                    value="{{data.custom.title}}"
                    on-input="_validate"
                    always-float-label
                    required
                  >
                  </paper-input>
                </div>

                <header class="item-wide">
                  <h3>[[localize('projects')]] ([[data.custom.projects.length]])</h3>
                </header>

                <template is="dom-repeat" items="{{data.custom.projects}}">
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
                            hide-search
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
                            selected-date-display-format="[[dateFormat]]"
                            error-message=""
                            required
                          >
                          </datepicker-lite>
                        </div>

                        <div class="item">
                          <datepicker-lite
                            class="end-date"
                            label="[[localize('end_date')]]"
                            value="{{item.end_date}}"
                            selected-date-display-format="[[dateFormat]]"
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
              </div>
            </template>
          </div>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button on-tap="_save" class="btn-primary" raised> [[localize('add_activity')]] </paper-button>

          <paper-button class="btn-cancel" on-tap="_close"> [[localize('cancel')]] </paper-button>
        </div>

        <etools-loading active="[[updatePending]]"></etools-loading>
      </paper-dialog>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: String})
  activitiesUrl!: string;

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
    page_size: 99999
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
  projects = [];

  @property({type: Object})
  projectsParams = {
    page_size: 99999
  };

  @property({type: String, computed: '_computeProjectsUrl(responsePlanId)'})
  projectsUrl!: string;

  @property({type: Array})
  objectives = [];

  @property({type: Object})
  objectivesParams = {
    page_size: 99999
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
      '_fetchProjects(partner, mode, data.cluster.cluster)',
      '_fetchProjects(partner, mode, data.custom.cluster)',
      '_fetchActivities(data.cluster.cluster)',
      '_fetchObjectives(data.custom.cluster)'
    ];
  }

  _computeLocalizedStatuses() {
    return [
      {title: this.localize('ongoing'), id: 'Ong'},
      {title: this.localize('planned'), id: 'Pla'},
      {title: this.localize('completed'), id: 'Com'}
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
    var currentIndex = +(e.target as PaperIconButtonElement).dataset.index!;

    if (this.mode === 'cluster') {
      this.splice('data.cluster.projects', currentIndex, 1);
    } else {
      this.splice('data.custom.projects', currentIndex, 1);
    }

    fireEvent(this, 'project-details-selection-refit');
  }

  _setDefaults() {
    this.set('data', {
      cluster: {
        projects: []
      },
      custom: {
        projects: []
      }
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
    (e.target as any).validate();
  }

  _computePartner(storePartner: GenericObject, selectedPartner: string) {
    if (!storePartner) {
      return;
    }
    return storePartner.id || selectedPartner || undefined;
  }

  _displayPartner(permissions: any) {
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

  _computeProjectsUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.plannedActions(responsePlanId);
  }

  _computeObjectivesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.responseParametersClusterObjectives(responsePlanId);
  }

  _fetchActivities(clusterId: string) {
    const thunk = (this.$.activities as EtoolsPrpAjaxEl).thunk();
    if (typeof clusterId === 'undefined') {
      return;
    }
    this.set('activities', []);
    this.set('data.cluster.cluster_activity', undefined);
    this.set('activitiesParams.cluster_id', clusterId);
    this.set('activitiesUrl', Endpoints.responseParametersClusterActivities(this.responsePlanId));
    (this.$.activities as EtoolsPrpAjaxEl).abort();

    thunk()
      .then((res: any) => {
        this.set('activities', res.data.results);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  // @ts-ignore
  _fetchProjects(partnerId: string, mode: string, clusterId: string) {
    if (this.data === undefined || !partnerId || !clusterId) {
      return;
    }

    this.set('projectsParams.cluster_id', clusterId);
    this.set('projectsParams.partner', partnerId);

    (this.$.projects as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        this.set('projects', res.data.results);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  _fetchObjectives(clusterId: string) {
    if (!clusterId) {
      return;
    }

    this.set('objectivesParams.cluster_id', clusterId);
    this.set('objectives', []);
    this.set('data.custom.cluster_objective', undefined);

    (this.$.objectives as EtoolsPrpAjaxEl).abort();

    (this.$.objectives as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        this.set('objectives', res.data.results);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  _save() {
    const thunk = (this.$.activity as EtoolsPrpAjaxEl).thunk();
    const valid = [this._fieldsAreValid(), this._dateRangeValid('.start-date', '.end-date')].every(Boolean);

    if (!valid || !this.mode) {
      return;
    }

    this.set('updatePending', true);
    (this.$.activity as EtoolsPrpAjaxEl).body = Object.assign(
      {
        partner: this.partner
      },
      this.data[this.mode]
    );
    thunk()
      .then((res: any) => {
        this.set('updatePending', false);
        this.set('errors', {});
        this._close('saved');
        waitForIronOverlayToClose(300).then(() => fireEvent(this, 'activity-added', res.data));
      })
      .catch((err: GenericObject) => {
        this.set('errors', err.data);
        this.set('updatePending', false);
        fireEvent(this, 'project-details-selection-refit');
      });
  }

  _close(e: CustomEvent & any) {
    if (
      e &&
      (e === 'saved' ||
        e.target.nodeName === 'PAPER-DIALOG' ||
        e.target.nodeName === 'PAPER-BUTTON' ||
        e.target.nodeName === 'PAPER-ICON-BUTTON')
    ) {
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
window.customElements.define('planned-action-activity-modal', PlannedActionActivityModal);

export {PlannedActionActivityModal as PlannedActionActivityModalEl};
