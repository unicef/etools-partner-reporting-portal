import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import '@polymer/polymer/lib/elements/dom-if';
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
import '../../../../etools-prp-chips';
import '../../../chip-disagg-value';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-ajax';
import {buttonsStyles} from '../../../../../styles/buttons-styles';
import {GenericObject} from '../../../../../typings/globals.types';
import Endpoints from '../../../../../endpoints';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {PaperInputElement} from '@polymer/paper-input/paper-input';

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 */
class CreationModal extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    // language=HTML
    return html`
    ${buttonsStyles}
    <style include="app-grid-style button-styles iron-flex iron-flex-alignment iron-flex-reverse">
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

    <etools-prp-ajax
        id="createDisaggregation"
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
        <h2>[[localize('add_disaggregation')]]</h2>
        <paper-icon-button
            class="self-center"
            on-tap="close"
            icon="icons:close">
        </paper-icon-button>
      </div>

      <paper-dialog-scrollable>
        <template
            is="dom-if"
            if="[[refresh]]"
            restamp="true">
          <iron-form class="app-grid">

            <div class="flex col-name">
              <paper-input
                  class="validate"
                  id="name"
                  name="name"
                  label="[[localize('disaggregation')]]"
                  value="{{data.name}}"
                  on-input="_onInput"
                  on-blur="_formatName"
                  always-float-label
                  required>
              </paper-input>
            </div>
            <div class="flex col-values">
              <etools-prp-chips
                  class="validate"
                  index="0"
                  name="values"
                  label="[[localize('disaggregation_groups')]]"
                  value="{{data.choices}}"
                  on-selected-chips-updated="_onInput"
                  required>
                <chip-disagg-value></chip-disagg-value>
              </etools-prp-chips>
            </div>

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

  @property({type: Array, notify: true})
  choices = [];

  @property({type: String, notify: true})
  name = '';

  @property({type: Boolean})
  opened = false;

  @property({type: Boolean})
  updatePending = false;

  @property({type: String, computed: '_computeUrl(responsePlanID)'})
  url!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.clusterDisaggregations.all)'})
  disaggregations!: GenericObject;

  @property({type: Object})
  editData!: GenericObject;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Boolean})
  refresh = false;

  _computeUrl(responsePlanID: string) {
    return Endpoints.responseParametersClusterDisaggregations(responsePlanID);
  }

  close() {
    this.set('opened', false);
    this.set('refresh', false);
  }

  open() {
    this.data = {'response_plan': +this.responsePlanID, 'choices': [], 'active': true};
    this.set('opened', true);
    this.set('refresh', true);
  }

  _save() {
    if (!this._fieldsAreValid()) {
      return;
    }
    if (!this._checkMatchingName()) {
      (this.shadowRoot!.querySelector('#name') as PaperInputElement).set('invalid', true);
      return;
    }
    let self = this;
    const thunk = (this.$.createDisaggregation as EtoolsPrpAjaxEl).thunk();
    let newChoices = [];
    for (var i = 0; i < this.data.choices.length; i++) {
      newChoices.push({'value': this.data.choices[i], 'active': true});
    }
    this.data.choices = newChoices;
    thunk()
      .then(function(res: any) {
        fireEvent(self, 'disaggregation-added', res.data);
        self.updatePending = false;
        self.close();

      })
      .catch(function(err) {
        // TODO: error handling
        self.updatePending = false;
      });
  }

  _checkMatchingName() {
    let disaggregations = this.disaggregations;
    for (var i = 0; i < disaggregations.length; i++) {
      if (disaggregations[i].name === this.data.name.trim()) {
        return false;
      }
    }
    return true;
  }

  _onInput(e: CustomEvent) {
    let el = e.target;

    (el as any).validate();
  }

  _formatName(e: CustomEvent) {
    let el = e.target as any;

    el.value = el.value.trim();
    el.validate();
  }
}

window.customElements.define('cluster-disaggregations-modal', CreationModal);

export {CreationModal as CreationModalEl};
