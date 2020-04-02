import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import '@polymer/polymer/lib/elements/dom-if';
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
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '../../../../form-fields/cluster-dropdown-content';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-ajax';
import {buttonsStyles} from '../../../../../styles/buttons-styles';
import {modalStyles} from '../../../../../styles/modal-styles';
import Endpoints from '../../../../../endpoints';
import {GenericObject} from '../../../../../typings/globals.types';
import {fireEvent} from '../../../../../utils/fire-custom-event';


/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 */
class ClusterObjectivesEditingModal extends LocalizeMixin(UtilsMixin(RoutingMixin(ReduxConnectedElement))) {
  public static get template() {
    // language=HTML
    return html`
    ${buttonsStyles} ${modalStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;

        --app-grid-columns: 3;
        --app-grid-gutter: 15px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 3;

        --paper-dialog: {
          width: 700px;
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


    <etools-prp-ajax
        id="editObjective"
        url="[[url]]"
        body="[[data]]"
        content-type="application/json"
        method="patch">
    </etools-prp-ajax>

    <paper-dialog
        id="dialog"
        with-backdrop
        opened="[[opened]]">
      <div class="header layout horizontal justified">
        <h2>[[localize('edit_cluster_objective')]]</h2>
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
                label="[[localize('cluster_objective_title')]]"
                value="{{data.title}}"
                type="string"
                on-input="_validate"
                required>
              </paper-input>
          </iron-form>
        </template>
      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button class="btn-primary" on-tap="_save" raised>
          [[localize('save')]]
        </paper-button>

        <paper-button class="btn-cancel" on-tap="close">
          [[localize('cancel')]]
        </paper-button>
      </div>

    </paper-dialog>
    `;
  }

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: Boolean})
  opened = false;

  @property({type: Boolean})
  updatePending = false;

  @property({type: String})
  formatDate = 'DD MMM YYYY';

  @property({type: String, computed: '_computeUrl(data.id)'})
  url!: string;

  @property({type: Object})
  editData!: GenericObject;

  @property({type: Boolean})
  refresh = false;

  @property({type: Object})
  data = {};

  _computeUrl(objectiveId: string) {
    return Endpoints.responseParametersClustersObjectiveDetail(objectiveId);
  }

  close() {
    this.set('data', {});
    this.set('opened', false);
    this.set('refresh', false);
  }

  open() {
    this.set('data', Object.assign({}, {id: this.editData.id, title: this.editData.title}));
    this.set('opened', true);
    this.set('refresh', true);
  }

  _validate(e: CustomEvent) {
    e.target.validate();
  }

  _save() {
    if (!this._fieldsAreValid()) {
      return;
    }

    let self = this;
    const thunk = (this.$.editObjective as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then(function(res: any) {
        self.updatePending = false;
        fireEvent(self, 'objective-edited', res.data);
        self.close();
      })
      .catch(function(err) {
        self.updatePending = false;
        // TODO: error handling
      });
  }
}

window.customElements.define('cluster-objectives-editing-modal', ClusterObjectivesEditingModal);

export {ClusterObjectivesEditingModal as ClusterObjectivesEditingModalEl};
