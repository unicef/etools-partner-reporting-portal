import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
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
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
//<link rel="import" href = "../../../../../bower_components/etools-searchable-multiselection-menu/etools-single-selection-menu.html" >
//<link rel="import"href = "../../../../../bower_components/etools-searchable-multiselection-menu/etools-single-selection-menu.html" >
//<link rel="import" href = "../../../../polyfills/es6-shim.html" >
import Endpoints from '../../../../endpoints';

import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-input';
import ModalMixin from '../../../../mixins/modal-mixin';
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import {buttonsStyles} from '../../../../styles/buttons-styles';
import {modalStyles} from '../../../../styles/modal-styles';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-ajax';
import '../../../etools-prp-permissions';
//@Lajos: bellow was not found!!!!!!!!!!
import '../../../etools-prp-date-input';
import '../../../form-fields/partner-dropdown-content';
import '../../../form-fields/cluster-dropdown-content';
//@Lajos: bellow was originally
// <link rel="import" href = "../../../error-box.html" > but assumed bellow:
import '../../../error-box-errors';
//@Lajos: unable to find bellow
import '../../paper-radio-group-custom';
import {GenericObject} from '../../../../typings/globals.types';
import {fireEvent} from '../../../../utils/fire-custom-event';




/**
* @polymer
* @customElement
* @appliesMixin ModalMixin
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
*/
class AddExistingActivityFromProjectModal extends UtilsMixin(ModalMixin(LocalizeMixin(ReduxConnectedElement))) {

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

          & > * {
            margin: 0;
          }
        };
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

      paper-dropdown-menu {
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
            <paper-dropdown-menu
                class="validate"
                label="[[localize('cluster')]]"
                on-value-changed="_validate"
                always-float-label
                required>
              <paper-listbox
                  selected="{{data.cluster}}"
                  attr-for-selected="value"
                  slot="dropdown-content"
                  class="dropdown-content">
                <template
                    is="dom-repeat"
                    items="[[clusters]]">
                  <paper-item value="[[item.id]]">[[item.title]]</paper-item>
                </template>
              </paper-listbox>
            </paper-dropdown-menu>
          </div>
          <div class="item">
            <etools-single-selection-menu
                class="validate"
                label="[[localize('partner_activity')]]"
                options="[[partnerActivities]]"
                option-value="id"
                option-label="title"
                selected="{{data.partner_activity}}"
                on-iron-activate="_validate"
                disabled="[[_equals(partnerActivities.length, 0)]]"
                trigger-value-change-event
                required>
            </etools-single-selection-menu>
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
                    <etools-single-selection-menu
                        disabled
                        class="validate"
                        label="[[localize('partner_project')]]"
                        options="[[data.projects]]"
                        option-value="project_id"
                        option-label="title"
                        selected="[[item.project_id]]"
                        data-index$="[[index]]"
                        on-iron-activate="_validate"
                        trigger-value-change-event
                        required>
                    </etools-single-selection-menu>
                  </div>

                  <div class="item">
                    <paper-dropdown-menu
                        disabled
                        class="validate"
                        label="[[localize('status')]]"
                        on-value-changed="_validate"
                        always-float-label
                        required>
                      <paper-listbox
                          selected="{{item.status}}"
                          attr-for-selected="value"
                          slot="dropdown-content"
                          class="dropdown-content">
                        <template
                            is="dom-repeat"
                            items="[[statuses]]">
                          <paper-item value="[[item.id]]">[[item.title]]</paper-item>
                        </template>
                      </paper-listbox>
                    </paper-dropdown-menu>
                  </div>

                  <div class="item">
                    <etools-prp-date-input
                        class="start-date"
                        label="[[localize('start_date')]]"
                        value="{{item.start_date}}"
                        error-message=""
                        required
                        no-init>
                    </etools-prp-date-input>
                    </etools-date-input>
                  </div>

                  <div class="item">
                    <etools-prp-date-input
                        class="end-date"
                        label="[[localize('end_date')]]"
                        value="{{item.end_date}}"
                        error-message=""
                        required
                        no-init>
                    </etools-prp-date-input>
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

        <paper-button
            on-tap="_close">
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

  @property({type: Boolean, observer: '_onOpenedChanged'})
  opened!: boolean;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String})
  activityUrl = '';

  @property({type: Object})
  activitiesParams = {
    page_size: 99999,
  };

  @property({type: Array, computed: 'getReduxStateArray(rootState.responsePlans.current.clusters)'})
  clusters!: any[];

  @property({type: Array, computed: '_computeLocalizedStatuses(localize)'})
  statuses!: any[];

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: Array})
  activities = [];

  @property({type: Array})
  partnerActivities = [];

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

  static get observers() {
    return [
      '_fetchPartnerActivities(data.cluster)',
      '_fetchActivityUpdateUrl(responsePlanId, data.partner_activity)',
    ];
  }

  _computeLocalizedStatuses(localize: any) {
    return [
      {title: localize('ongoing'), id: 'Ong'},
      {title: localize('planned'), id: 'Pla'},
      {title: localize('completed'), id: 'Com'},
    ];
  }

  _setDefaults() {
    var simpleProjectData = {};

    simpleProjectData.project_id = this.projectData.id;
    simpleProjectData.title = this.projectData.title;
    simpleProjectData.status = this.projectData.status;
    simpleProjectData.start_date = this.projectData.start_date;
    simpleProjectData.end_date = this.projectData.end_date;

    this.set('data', {
      projects: [simpleProjectData]
    });
    this.set('activities', []);
    this.set('objectives', []);
    this.set('errors', {});
  }

  _onOpenedChanged(opened: boolean) {
    if (opened) {
      this._setDefaults();
    }
  }

  _validate(e: CustomEvent) {
    e.target.validate();
  }

  _computePartner(storePartner: GenericObject, selectedPartner: any) {
    return storePartner.id || selectedPartner || undefined;
  }

  _fetchActivityUpdateUrl(responsePlanId: string, activityId: string) {
    this.set('activityUrl', Endpoints.partnerActivityUpdate(responsePlanId, activityId));
  }

  _computeObjectivesUrl(responsePlanId: string) {
    return Endpoints.responseParametersClusterObjectives(responsePlanId);
  }

  _fetchPartnerActivities(clusterId: string) {
    var self = this;
    const thunk = (this.$.activities as EtoolsPrpAjaxEl).thunk();
    if (typeof clusterId === 'undefined') {
      return;
    }
    this.set('partnerActivities', []);
    this.set('data.partner_activity', undefined);
    this.set('activitiesParams.cluster_id', clusterId);
    this.set('activitiesUrl',
      Endpoints.partnerActivityList(this.responsePlanId)
      + '?cluster_id=' + clusterId);
    (this.$.activities as EtoolsPrpAjaxEl).abort();

    thunk()
      .then(function(res: any) {
        var filteredActivities = res.data.results.filter(function(item: any) {
          return item.projects.find(function(element: any) {
            return element.project_id === parseInt(self.projectData.id);
          }) === undefined;
        });
        self.set('partnerActivities', filteredActivities);
      })
      .catch(function(err) { // jshint ignore:line
        // TODO: error handling
      });
  }

  _fetchObjectives(clusterId: string) {
    var self = this;
    const thunk = (this.$.objectives as EtoolsPrpAjaxEl).thunk();
    if (typeof clusterId === 'undefined') {
      return;
    }

    this.set('objectivesParams.cluster_id', clusterId);
    this.set('objectives', []);
    this.set('data.custom.cluster_objective', undefined);

    (this.$.objectives as EtoolsPrpAjaxEl).abort();

    thunk()
      .then(function(res: any) {
        self.set('objectives', res.data.results);
      })
      .catch(function(err) { // jshint ignore:line
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

    var clonedData = this._clone(this.data); // make copy of data
    var selectedPartnerActivity = this.partnerActivities.find(function(item: any) {
      return item.id === self.data.partner_activity;
    });
    //@Lajos: did not find a wat to give default value before asignation
    var combinedProjects = selectedPartnerActivity.projects.concat(this.data.projects);

    // assign combined projects to cloned data instead of data directly to fix visual glitch
    clonedData.projects = combinedProjects;

    // save cloned data and not regular data, since cloned data has the combined projects
    //@Lajos not sure if bellow is correct
    this.$.activity.body = Object.assign({
      partner: this.partner,
    }, clonedData);

    thunk()
      .then(function() {
        self.set('updatePending', false);
        self.set('errors', {});
        self._close('saved');
        window.location.reload();
      })
      .catch(function(err) {
        self.set('errors', err.data);
        self.set('updatePending', false);
        fireEvent(self, 'project-details-selection-refit');
      });
  }

  _close(e: CustomEvent) {
    if (e === 'saved' ||
      e.target.nodeName === 'PAPER-DIALOG' ||
      e.target.nodeName === 'PAPER-BUTTON' ||
      e.target.nodeName === 'PAPER-ICON-BUTTON'
    ) {
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
    //@Lajos: bellow gives error
    this.addEventListener('project-details-selection-refit', this.adjustPosition as any);
  }

  _removeEventListeners() {
    //@Lajos: bellow gives error
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
window.customElements.define('planned-action-add-existing-activity-from-project-modal', AddExistingActivityFromProjectModal);

export {AddExistingActivityFromProjectModal as PlannedActioAddExistingActivityFromProjectModalEl};
