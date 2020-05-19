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
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-item/paper-item';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import Endpoints from '../../../../endpoints';
import ModalMixin from '../../../../mixins/modal-mixin';
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import {buttonsStyles} from '../../../../styles/buttons-styles';
import {modalStyles} from '../../../../styles/modal-styles';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-ajax';
import '../../../etools-prp-permissions';
import '../../../form-fields/partner-dropdown-content';
import '../../../form-fields/cluster-dropdown-content';
import '../../../error-box-errors';
import {GenericObject} from '../../../../typings/globals.types';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {waitForIronOverlayToClose} from '../../../../utils/util';
import Settings from '../../../../settings';


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
          width: 700px;
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

      datepicker-lite {
        --paper-input-container: {
          width: 100%;
        };
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
              with-backdrop
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
                with-backdrop
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
                      with-backdrop
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
                      with-backdrop
                      required>
                    </etools-dropdown>
                  </div>

                  <div class="item">
                    <datepicker-lite
                      class="start-date"
                      label="[[localize('start_date')]]"
                      value="{{item.start_date}}"
                      input-date-format="[[dateFormat]]"
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
                      input-date-format="[[dateFormat]]"
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
  partnerActivities: GenericObject[] = [];

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
      '_fetchPartnerActivities(data.cluster)',
      '_fetchActivityUpdateUrl(responsePlanId, data.partner_activity)',
    ];
  }

  _computeLocalizedStatuses() {
    return [
      {title: this.localize('ongoing'), id: 'Ong'},
      {title: this.localize('planned'), id: 'Pla'},
      {title: this.localize('completed'), id: 'Com'},
    ];
  }

  _setDefaults() {
    const simpleProjectData: GenericObject = {};
    simpleProjectData.project_id = this.projectData.id;
    simpleProjectData.title = this.projectData.title;
    simpleProjectData.status = this.projectData.status;

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
    (e.target as any).validate();
  }

  _computePartner(storePartner: GenericObject, selectedPartner: any) {
    if (!storePartner) {
      return;
    }
    return storePartner.id || selectedPartner || undefined;
  }

  _fetchActivityUpdateUrl(responsePlanId: string, activityId: string) {
    this.set('activityUrl', Endpoints.partnerActivityUpdate(responsePlanId, activityId));
  }

  _computeObjectivesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.responseParametersClusterObjectives(responsePlanId);
  }

  _fetchPartnerActivities(clusterId: string) {
    const self = this;
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
      .then((res: any) => {
        const filteredActivities = res.data.results.filter((item: any) => {
          return item.projects.find(function(element: any) {
            return element.project_id === parseInt(self.projectData.id);
          }) === undefined;
        });
        self.set('partnerActivities', filteredActivities);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  _fetchObjectives(clusterId: string) {
    const self = this;
    const thunk = (this.$.objectives as EtoolsPrpAjaxEl).thunk();
    if (typeof clusterId === 'undefined') {
      return;
    }

    this.set('objectivesParams.cluster_id', clusterId);
    this.set('objectives', []);
    this.set('data.custom.cluster_objective', undefined);

    (this.$.objectives as EtoolsPrpAjaxEl).abort();

    thunk()
      .then((res: any) => {
        self.set('objectives', res.data.results);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  _save() {
    const self = this;
    const thunk = (this.$.activity as EtoolsPrpAjaxEl).thunk();
    const valid = [
      this._fieldsAreValid(),
      this._dateRangeValid('.start-date', '.end-date')
    ].every(Boolean);

    if (!valid) {
      return;
    }

    this.set('updatePending', true);

    const clonedData = this._clone(this.data); // make copy of data
    const selectedPartnerActivity: GenericObject | undefined = this.partnerActivities.find(function(item: any) {
      return item.id === self.data.partner_activity;
    });
    if (selectedPartnerActivity && selectedPartnerActivity.projects) {
      // assign combined projects to cloned data instead of data directly to fix visual glitch
      clonedData.projects = selectedPartnerActivity.projects.concat(this.data.projects);
    }

    // save cloned data and not regular data, since cloned data has the combined projects
    (this.$.activity as EtoolsPrpAjaxEl).body = Object.assign({
      partner: this.partner
    }, clonedData);

    thunk()
      .then(() => {
        self.set('updatePending', false);
        self.set('errors', {});
        self._close('saved');
        waitForIronOverlayToClose(300).then(() => window.location.reload());
      })
      .catch((err: GenericObject) => {
        self.set('errors', err.data);
        self.set('updatePending', false);
        fireEvent(self, 'project-details-selection-refit');
      });
  }

  _close(e: CustomEvent & any) {
    if (e && (e === 'saved' ||
      e.target.nodeName === 'PAPER-DIALOG' ||
      e.target.nodeName === 'PAPER-BUTTON' ||
      e.target.nodeName === 'PAPER-ICON-BUTTON')) {
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
window.customElements.define('planned-action-add-existing-activity-from-project-modal', AddExistingActivityFromProjectModal);

export {AddExistingActivityFromProjectModal as PlannedActioAddExistingActivityFromProjectModalEl};
