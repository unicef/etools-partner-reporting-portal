import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import DateMixin from '../../../../../mixins/date-mixin';
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
import '@polymer/paper-dialog/paper-dialog';
import '../../../../form-fields/dropdown-form-input';
import '../../../../form-fields/cluster-dropdown-content';
import '../../../../error-box';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-ajax';
import Endpoints from '../../../../../endpoints';
import {buttonsStyles} from '../../../../../styles/buttons-styles';

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin DateMixin
 */
class CreationModal extends LocalizeMixin(UtilsMixin(DateMixin(ReduxConnectedElement))) {
  public static get template() {
    // language=HTML
    return html`
    ${buttonsStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;

        --app-grid-columns: 3;
        --app-grid-gutter: 15px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 3;

        --paper-dialog: {
          width: 700px;

          & > * {
            margin: 0;
          }
        };
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
      <div class="header layout horizontal justified">
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

            <paper-dropdown-menu
                class="item validate"
                label="[[localize('cluster')]]"
                id="cluster"
                on-value-changed="_validate"
                always-float-label
                required>
                <paper-listbox
                    selected="{{data.cluster}}"
                    attr-for-selected="value"
                    slot="dropdown-content"
                    class="dropdown-content">
                  <template
                      id="clusters"
                      is="dom-repeat"
                      items="[[clusters]]">
                    <paper-item value="[[item.id]]">[[item.title]]</paper-item>
                  </template>
                </paper-listbox>
            </paper-dropdown-menu>

            <paper-dropdown-menu
                class="item validate"
                label="[[localize('cluster_objective')]]"
                id="objective"
                on-value-changed="_validate"
                disabled="[[isObjectivesDisabled]]"
                always-float-label
                required>
                <paper-listbox
                    selected="{{data.cluster_objective}}"
                    attr-for-selected="value"
                    slot="dropdown-content"
                    class="dropdown-content">
                  <template
                      id="objectives"
                      is="dom-repeat"
                      items="[[objectives]]">
                    <paper-item value="[[item.id]]">[[item.title]]</paper-item>
                  </template>
                </paper-listbox>
            </paper-dropdown-menu>
          </iron-form>
        </template>
      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button class="btn-primary" on-tap="_save" raised>
          [[localize('save')]]
        </paper-button>

        <paper-button  on-tap="close">
          [[localize('cancel')]]
        </paper-button>
      </div>

      <etools-loading active="[[updatePending]]"></etools-loading>

    </paper-dialog>
    `;
  }

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: Boolean})
  opened = false;

  @property({type: Boolean})
  updatePending = false;

  @property({type: String, computed: '_computeUrl(responsePlanID)'})
  url!: string;

  @property({type: Object})
  data = {};

  @property({type: Array})
  clusters = [];

  @property({type: Array})
  objectives = [];

  @property({type: String, computed: '_computeObjectivesUrl(responsePlanID, data.cluster)'})
  objectivesUrl = '';

  @property({type: Boolean, computed: '_isObjectivesDisabled(data.cluster)'})
  isObjectivesDisabled = true;

  @property({type: Object})
  objectivesParams = {cluster_id: ''};

  @property({type: Boolean})
  refresh = false;

  static get observers() {
    return [
      '_getObjectivesByClusterID(data.cluster)',
    ];
  }

  _computeUrl(responsePlanID: string) {
    return Endpoints.responseParametersClusterActivities(responsePlanID);
  }

  _computeObjectivesUrl(responsePlanID: string) {
    return Endpoints.responseParametersClusterObjectives(responsePlanID);
  }

  //@Lajos: not sure
  _isObjectivesDisabled(clusterID: number) {
    return !clusterID;
  }

  _getObjectivesByClusterID(clusterID: number) {
    let self = this;
    if (clusterID) {
      const thunk = (this.$.objectivesByClusterID as EtoolsPrpAjaxEl).thunk();
      this.objectivesParams = {cluster_id: this.data.cluster};

      thunk()
        .then(function(res: any) {
          self.set('objectives', res.data.results);
        })
        .catch(function(err) { // jshint ignore:line
          self.updatePending = false;
          // TODO: error handling
        });
    } else {
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

  _validate(e: CustomEvent) {
    e.target.validate();
  }

  _redirectToDetail(id: number) {
    const path = '/response-parameters/clusters/activity/' + String(id);
    const url = this.buildUrl(this._baseUrlCluster, path);
    this.set('path', url);
  }

  _save() {
    let self = this;
    const thunk = (this.$.createActivity as EtoolsPrpAjaxEl).thunk();

    if (!this._fieldsAreValid()) {
      return;
    }

    self.updatePending = true;
    thunk()
      .then(function(res: any) {
        self.updatePending = false;
        self.set('errors', {});
        self._redirectToDetail(res.data.id);
      })
      .catch(function(err: any) {
        self.set('errors', err.data);
        self.updatePending = false;
      });
  }
}

window.customElements.define('cluster-activities-modal', CreationModal);

export {CreationModal as ClusterActivitiesModalEl};
