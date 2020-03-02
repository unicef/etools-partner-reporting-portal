import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
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
// <link rel='import' href='../../../../../bower_components/etools-searchable-multiselection-menu/etools-multi-selection-menu.html'>
import '../../../etools-prp-ajax';
// <link rel='import' href='../../../etools-prp-date-input.html'>
import '../../../form-fields/dropdown-form-input';
import '../../../form-fields/cluster-dropdown-content';
import RoutingMixin from '../../../../mixins/routing-mixin';
import UtilsMixin from '../../../../mixins/utils-mixin';
import {buttonsStyles} from '../../../../styles/buttons-styles';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../typings/globals.types';
import Endpoints from '../../../../endpoints';
import {EtoolsPrpAjaxEl} from '../../../../elements/etools-prp-ajax';
import {fireEvent} from '../../../../utils/fire-custom-event';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin RoutingMixin
 * @appliesMixin UtilsMixin
 */
class EditingModal extends RoutingMixin(UtilsMixin(ReduxConnectedElement)){
  public static get template(){
    return html`
      ${buttonsStyles}
      <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;
  
          --app-grid-columns: 2;
          --app-grid-gutter: 15px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;
  
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
                <etools-multi-selection-menu
                    class="validate"
                    label="Clusters"
                    options="[[formattedClusters]]"
                    selected-values="{{selectedClusters}}"
                    on-selected-values-changed="_validate"
                    trigger-value-change-event
                    required>
                </etools-multi-selection-menu>
              </div>
  
              <div class="item">
                 <etools-prp-date-input
                    class="start-date"
                    label="Start date"
                    value="{{data.start_date}}"
                    error-message=""
                    required
                    no-init>
                 </etools-prp-date-input>
              </div>
  
              <div class="item">
                <etools-prp-date-input
                    class="end-date"
                    label="End date"
                    value="{{data.end_date}}"
                    error-message=""
                    required
                    no-init>
                </etools-prp-date-input>
              </div>
  
              <paper-dropdown-menu
                  class="item validate"
                  label="Status"
                  on-value-changed="_validate"
                  always-float-label
                  required>
                <paper-listbox
                    selected="{{data.status}}"
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

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: String})
  path!: string;

  @property({type: String})
  reportingPeriod!: string;

  @property({type: Boolean})
  opened: boolean = false;

  @property({type: Boolean})
  updatePending: boolean = false;

  @property({type: Object})
  data: GenericObject = {};

  @property({type: Boolean})
  refresh: boolean = false;

  @property({type: String, computed: '_computeUrl(data.id)'})
  url!: string;

  @property({type: Array})
  clusters: any[] = [];

  @property({type: String, computed: 'getReduxStateValue(rootState.partner.current.id)'})
  partnerID!: string;

  @property({type: Array, computed: '_formatForMultiselect(clusters)'})
  formattedClusters!: any[];

  @property({type: Array})
  statuses: GenericObject[] = [
      {title: 'Ongoing', id: 'Ong'},
      {title: 'Planned', id: 'Pla'},
      {title: 'Completed', id: 'Com'},
    ];

  @property({type: Array})
  frequencies: GenericObject =  [
      {title: 'Weekly', id: 'Wee'},
      {title: 'Monthly', id: 'Mon'},
      {title: 'Quarterly', id: 'Qua'},
    ];

  @property({type: Array})
  selectedClusters!: any[];


  _computeUrl(projectID: string) {
    return Endpoints.plannedActionsProjectOverview(projectID);
  }

  close() {
    this.set('data', {});
    this.set('opened', false);
    this.set('refresh', false);
  }

  open() {
    this.set('data', Object.assign({}, this.editData));
    this.selectedClusters = this.editData.clusters.map(function(item) {
      return item.id;
    });
    this.set('opened', true);
    this.set('refresh', true);
  }

  _validate(e: CustomEvent) {
    e.target!.validate();
  }

  _formatForMultiselect(list) {
    return list.map((item: GenericObject) => {
      return {
        id: item.id,
        value: item.id,
        label: item.title,
      };
    });
  }

  _save() {
    let self = this;

    let valid = [
      this._fieldsAreValid(),
      this._dateRangeValid('.start-date', '.end-date'),
    ].every(Boolean);

    if (!valid) {
      return;
    }

    this.data.clusters = this.selectedClusters.map(function(item) {
      return {id: Number(item)};
    });

    this.data.partner = this.partnerID;

    this.updatePending = true;
    let thunk = (this.$.editProject as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then( (res: GenericObject) => {
        self.updatePending = false;
        fireEvent(self, 'project-edited', res.data);
        self.close();
      })
      .catch( (err: GenericObject) => { // jshint ignore:line
        self.updatePending = false;
        // TODO: error handling
      });
  }

}

window.customElements.define('editing-modal', EditingModal);
