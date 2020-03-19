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
import '@polymer/paper-listbox/paper-listbox';
import '../../../../form-fields/cluster-dropdown-content';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-ajax';
import {buttonsStyles} from '../../../../../styles/buttons-styles';
import {modalStyles} from '../../../../../styles/modal-styles';
import Endpoints from '../../../../../endpoints';
import {GenericObject} from '../../../../../typings/globals.types';


/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 */
class ClusterObjectivesModal extends LocalizeMixin(UtilsMixin(RoutingMixin(ReduxConnectedElement))) {
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
    </style>

    <iron-location path="{{path}}"></iron-location>

    <cluster-dropdown-content clusters="{{clusters}}"></cluster-dropdown-content>

    <etools-prp-ajax
        id="createObjective"
        url="[[url]]"
        body="[[data]]"
        content-type="application/json"
        method="post">
    </etools-prp-ajax>

    <paper-dialog
        id="dialog"
        with-backdrop
        opened="{{opened}}">
      <div class="header layout horizontal justified">
        <h2>[[localize('add_cluster_objective')]]</h2>
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

  @property({type: String, computed: '_computeUrl(responsePlanID)'})
  url!: string;

  @property({type: Array})
  clusters = [];

  @property({type: Boolean})
  refresh = false;

  @property({type: Object})
  data!: GenericObject;

  _computeUrl(responsePlanID: string) {
    if (!responsePlanID) {
      return;
    }
    return Endpoints.responseParametersClusterObjectives(responsePlanID);
  }

  close() {
    this.set('opened', false);
    this.set('refresh', false);
  }

  open() {
    this.data = {};
    this.set('opened', true);
    this.set('refresh', true);
  }

  _redirectToDetail(id: number) {
    let path = '/response-parameters/clusters/objective/' + String(id);
    let url = this.buildUrl(this._baseUrlCluster, path);
    this.set('path', url);
  }

  _validate(e: CustomEvent) {
    (e.target as any).validate();
  }

  _save() {
    if (!this._fieldsAreValid()) {
      return;
    }
    const thunk = (this.$.createObjective as EtoolsPrpAjaxEl).thunk();
    let self = this;
    thunk()
      .then((res: any) => {
        self.updatePending = false;
        self._redirectToDetail(res.data.id);
      })
      .catch((err: GenericObject) => {
        self.updatePending = false;
        console.error(err);
        // TODO: error handling
      });
  }
}

window.customElements.define('cluster-objectives-modal', ClusterObjectivesModal);

export {ClusterObjectivesModal as ClusterObjectivesModalEl};
