var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
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
import { buttonsStyles } from '../../styles/buttons-styles';
import { modalStyles } from '../../styles/modal-styles';
import { sharedStyles } from '../../styles/shared-styles';
import '../error-box';
import '../json-field';
import '../labelled-item';
import { property } from '@polymer/decorators/lib/decorators';
import { fireEvent } from '../../utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin LocalizeMixin
 */
class IndicatorLocationsModal extends ModalMixin(UtilsMixin(LocalizeMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.pending = false;
    }
    static get template() {
        return html `
      ${buttonsStyles} ${modalStyles} ${sharedStyles}
      <style include="iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;

          --paper-dialog: {
            width: 800px;
          }

          --json-field-label: {
            display: none;
          };
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
          id="locations"
          url="[[locationsUrl]]">
      </etools-prp-ajax>

      <etools-prp-ajax
          id="update"
          url="[[updateUrl]]"
          body="[[data.locations]]"
          method="patch"
          content-type="application/json">
      </etools-prp-ajax>

      <paper-dialog
          id="dialog"
          with-backdrop
          opened="{{opened}}">
        <div class="header layout horizontal justified">
          <h2>[[localize('location_settings_for_indicator')]]</h2>

          <paper-icon-button
              class="self-center"
              on-tap="close"
              icon="icons:close">
          </paper-icon-button>
        </div>

        <paper-dialog-scrollable>
          <template
              is="dom-if"
              if="[[opened]]"
              restamp="true">
            <error-box errors="[[errors]]"></error-box>

            <div class="row">
              <div class="layout horizontal justified">
                <labelled-item label="[[localize('title')]]">
                  [[data.blueprint.title]]
                </labelled-item>

                <dl class="data-key">
                  <dt>[[localize('label')]] -</dt>
                  <template
                      is="dom-if"
                      if="[[_equals(data.blueprint.display_type, 'number')]]"
                      restamp="true">
                    <dd>[[_withDefault(data.label)]]</dd>
                  </template>
                  <template
                      is="dom-if"
                      if="[[!_equals(data.blueprint.display_type, 'number')]]"
                      restamp="true">
                    <dd>
                      [[_withDefault(data.numerator_label)]]
                      /
                      [[_withDefault(data.denominator_label)]]
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
                    <template
                        is="dom-if"
                        if="[[isNumber]]"
                        restamp="true">
                      <th>[[localize('in_need')]]</th>
                    </template>
                  </tr>
                </thead>

                <tbody>
                  <template
                      is="dom-repeat"
                      items="[[data.locations]]"
                      as="location">
                    <tr>
                      <td>Admin [[location.loc_type]]</td>
                      <td>
                        <div class="text">[[_getLocationName(location.location, locations)]]</div>
                      </td>
                      <td>
                        <json-field
                            class="validate"
                            type="[[data.blueprint.display_type]]"
                            on-input="_validate"
                            value="{{location.baseline}}"
                            allowed-pattern="[+\\-\\d]"
                            hide-label>
                        </json-field>
                      </td>
                      <template
                          is="dom-if"
                          if="[[isNumber]]"
                          restamp="true">
                        <td>
                          <json-field
                              class="validate"
                              type="[[data.blueprint.display_type]]"
                              on-input="_validate"
                              value="{{location.in_need}}"
                              allowed-pattern="[+\\-\\d]"
                              hide-label>
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
          <paper-button
              on-tap="_save"
              class="btn-primary"
              raised>
            [[localize('save')]]
          </paper-button>

          <paper-button
              class="btn-cancel"
              on-tap="close">
            [[localize('cancel')]]
          </paper-button>
        </div>

        <etools-loading active="[[pending]]"></etools-loading>
      </paper-dialog>

    `;
    }
    static get observers() {
        return ['_setDefaults(opened)'];
    }
    _computeUpdateUrl(data) {
        return Endpoints.indicatorPerLocationVars(data.id);
    }
    _computeLocationsUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterLocationNames(responsePlanId);
    }
    _computeIsNumber(type) {
        return type === 'number';
    }
    _getLocationName(locationId, locations) {
        if (!locations) {
            return;
        }
        const location = (locations.results || []).find((loc) => {
            return String(loc.id) === String(locationId);
        });
        return location ? location.title : 'Invalid location';
    }
    _setDefaults(opened) {
        if (!opened) {
            return;
        }
        this.set('errors', {});
        this.set('data', this._clone(this.get('editData')));
        this._fetchLocations();
    }
    _fetchLocations() {
        const self = this;
        this.set('pending', true);
        const locThunk = this.$.locations.thunk();
        locThunk().then((res) => {
            self.set('pending', false);
            self.set('locations', res.data);
            fireEvent(self, 'indicator-locations-modal-refit');
        })
            .catch(() => {
            self.set('pending', false);
        });
    }
    _validate(e) {
        e.target.validate();
    }
    _save() {
        const self = this;
        if (!this._fieldsAreValid()) {
            return;
        }
        this.set('pending', true);
        const updateThunk = this.$.update.thunk();
        updateThunk().then(() => {
            self.set('pending', false);
            self.set('editData.locations', self.get('data.locations'));
            self.close();
        })
            .catch((err) => {
            self.set('pending', false);
            self.set('errors', err.data);
        });
    }
    _addEventListeners() {
        this.adjustPosition = this.adjustPosition.bind(this);
        this.addEventListener('indicator-locations-modal-refit', this.adjustPosition);
    }
    _removeEventListeners() {
        this.removeEventListener('indicator-locations-modal-refit', this.adjustPosition);
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
__decorate([
    property({ type: Object })
], IndicatorLocationsModal.prototype, "data", void 0);
__decorate([
    property({ type: Object })
], IndicatorLocationsModal.prototype, "editData", void 0);
__decorate([
    property({ type: Array })
], IndicatorLocationsModal.prototype, "locations", void 0);
__decorate([
    property({ type: Object })
], IndicatorLocationsModal.prototype, "errors", void 0);
__decorate([
    property({ type: Boolean })
], IndicatorLocationsModal.prototype, "pending", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], IndicatorLocationsModal.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String, computed: '_computeLocationsUrl(responsePlanId)' })
], IndicatorLocationsModal.prototype, "locationsUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeUpdateUrl(data)' })
], IndicatorLocationsModal.prototype, "updateUrl", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeIsNumber(data.blueprint.display_type)' })
], IndicatorLocationsModal.prototype, "isNumber", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.app.current)' })
], IndicatorLocationsModal.prototype, "app", void 0);
window.customElements.define('indicator-locations-modal', IndicatorLocationsModal);
