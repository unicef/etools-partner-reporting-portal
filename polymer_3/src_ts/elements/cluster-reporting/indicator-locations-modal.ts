import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-data-table/etools-data-table';
import Endpoints from '../../endpoints';
import ModalMixin from '../../mixins/modal-mixin';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import '../../elements/etools-prp-ajax';
import {buttonsStyles} from '../../styles/buttons-styles';
import {modalStyles} from '../../styles/modal-styles';
import {sharedStyles} from '../../styles/shared-styles';
import '../error-box';
import '../json-field';
import '../labelled-item';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../typings/globals.types';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import {fireEvent} from '../../utils/fire-custom-event';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin LocalizeMixin
 */
class IndicatorLocationsModal extends ModalMixin(UtilsMixin(LocalizeMixin(ReduxConnectedElement))) {
  public static get template() {
    return html`
      ${buttonsStyles} ${modalStyles} ${sharedStyles}
      <style include="iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;

          --paper-dialog: {
            width: 800px;
          }

          --json-field-label: {
            display: none;
          }
        }

        .row {
          margin: 16px 0;
        }

        table {
          width: 100%;
          table-layout: fixed;
        }

        th {
          padding: 5px 10px;
          background: var(--paper-grey-200);
        }

        td {
          padding: 0 10px;
        }

        th:first-of-type {
          text-align: left;
        }

        td:nth-of-type(1),
        td:nth-of-type(2) {
          background: var(--paper-grey-100);
        }

        th:nth-of-type(1),
        td:nth-of-type(1) {
          width: 150px;
        }

        .text {
          @apply --truncate;
        }

        json-field {
          text-align: center;
        }

        .data-key {
          margin: 0;
          font-size: 12px;
          color: var(--theme-secondary-text-color);
        }

        .data-key dt,
        .data-key dd {
          display: inline;
        }

        .data-key dd {
          margin: 0;
        }
      </style>

      <etools-prp-ajax
        id="update"
        url="[[updateUrl]]"
        body="[[data.locations]]"
        method="patch"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <paper-dialog id="dialog" modal opened="{{opened}}">
        <div class="header layout horizontal justified">
          <h2>[[localize('location_settings_for_indicator')]]</h2>

          <paper-icon-button class="self-center" on-tap="close" icon="icons:close"> </paper-icon-button>
        </div>

        <paper-dialog-scrollable>
          <template is="dom-if" if="[[opened]]" restamp="true">
            <error-box errors="[[errors]]"></error-box>

            <div class="row">
              <div class="layout horizontal justified">
                <labelled-item label="[[localize('title')]]">
                  [[data.blueprint.title]]
                </labelled-item>

                <dl class="data-key">
                  <dt>[[localize('label')]] -</dt>
                  <template is="dom-if" if="[[_equals(data.blueprint.display_type, 'number')]]" restamp="true">
                    <dd>[[_withDefault(data.label)]]</dd>
                  </template>
                  <template is="dom-if" if="[[!_equals(data.blueprint.display_type, 'number')]]" restamp="true">
                    <dd>
                      [[_withDefault(data.numerator_label)]] / [[_withDefault(data.denominator_label)]]
                    </dd>
                  </template>
                </dl>
              </div>
            </div>

            <div class="row">
              <table>
                <thead>
                  <tr>
                    <th>[[localize('location_admin_level')]]</th>
                    <th>[[localize('location')]]</th>
                    <th>[[localize('baseline')]]</th>
                    <template is="dom-if" if="[[isNumber]]" restamp="true">
                      <th>[[localize('in_need')]]</th>
                    </template>
                  </tr>
                </thead>

                <tbody>
                  <template is="dom-repeat" items="[[data.locations]]" as="location">
                    <tr>
                      <td>Admin [[location.loc_type]]</td>
                      <td>
                        <div class="text">[[location.title]]</div>
                      </td>
                      <td>
                        <json-field
                          class="validate"
                          type="[[data.blueprint.display_type]]"
                          on-input="_validate"
                          value="{{location.baseline}}"
                          allowed-pattern="[+\\-\\d]"
                          hide-label
                        >
                        </json-field>
                      </td>
                      <template is="dom-if" if="[[isNumber]]" restamp="true">
                        <td>
                          <json-field
                            class="validate"
                            type="[[data.blueprint.display_type]]"
                            on-input="_validate"
                            value="{{location.in_need}}"
                            allowed-pattern="[+\\-\\d]"
                            hide-label
                          >
                          </json-field>
                        </td>
                      </template>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </template>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button on-tap="_save" class="btn-primary" raised>
            [[localize('save')]]
          </paper-button>

          <paper-button class="btn-cancel" on-tap="close">
            [[localize('cancel')]]
          </paper-button>
        </div>

        <etools-loading active="[[pending]]"></etools-loading>
      </paper-dialog>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  editData!: GenericObject;

  @property({type: Object})
  errors!: GenericObject;

  @property({type: Boolean})
  pending = false;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String, computed: '_computeUpdateUrl(data)'})
  updateUrl!: string;

  @property({type: Boolean, computed: '_computeIsNumber(data.blueprint.display_type)'})
  isNumber!: boolean;

  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  app!: string;

  static get observers() {
    return ['_setDefaults(opened)'];
  }

  _computeUpdateUrl(data: GenericObject) {
    setTimeout(() => {
      fireEvent(self, 'indicator-locations-modal-refit');
    }, 200);
    return Endpoints.indicatorPerLocationVars(data.id);
  }

  _computeIsNumber(type: any) {
    return type === 'number';
  }

  _setDefaults(opened: boolean) {
    if (!opened) {
      return;
    }

    this.set('errors', {});
    this.set('data', this._clone(this.get('editData')));
  }

  _validate(e: CustomEvent) {
    (e.target as any).validate();
  }

  _save() {
    const self = this;

    if (!this._fieldsAreValid()) {
      return;
    }

    this.set('pending', true);

    const updateThunk = (this.$.update as EtoolsPrpAjaxEl).thunk();
    updateThunk()
      .then(() => {
        self.set('pending', false);
        self.set('editData.locations', self.get('data.locations'));
        self.close();
      })
      .catch((err: GenericObject) => {
        self.set('pending', false);
        self.set('errors', err.data);
      });
  }

  _addEventListeners() {
    this.adjustPosition = this.adjustPosition.bind(this);
    this.addEventListener('indicator-locations-modal-refit', this.adjustPosition as any);
  }

  _removeEventListeners() {
    this.removeEventListener('indicator-locations-modal-refit', this.adjustPosition as any);
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

window.customElements.define('indicator-locations-modal', IndicatorLocationsModal);
