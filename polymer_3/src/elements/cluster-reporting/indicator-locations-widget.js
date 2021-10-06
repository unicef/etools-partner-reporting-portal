var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import Settings from '../../settings';
import UtilsMixin from '../../mixins/utils-mixin';
import NotificationsMixin from '../../mixins/notifications-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import { buttonsStyles } from '../../styles/buttons-styles';
import { sharedStyles } from '../../styles/shared-styles';
import '../json-field';
import '../etools-prp-ajax';
import '../etools-prp-reset';
import '../etools-prp-permissions';
import '../labelled-item';
import './message-imo-modal';
import Endpoints from '../../endpoints';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin LocalizeMixin
 */
class IndicatorLocationsWidget extends UtilsMixin(NotificationsMixin(LocalizeMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.isPai = false;
        this.editing = false;
        this.valueInitialized = false;
        this.invalid = false;
        this.locationsInitialized = false;
        this.maxAdminLevel = Settings.cluster.maxLocType;
        this.locationTitle = '';
    }
    static get template() {
        return html `
      ${buttonsStyles} ${sharedStyles}
      <style include="iron-flex iron-flex-alignment app-grid-style">
        :host {
          display: block;

          --app-grid-columns: 3;
          --app-grid-gutter: 16px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;
          --esmm-list-wrapper: {
            height: 350px;
          };
        }

        .app-grid {
          padding-top: 0;
          margin: 0 -var(--app-grid-gutter);
        }

        .item-2-col {
          @apply --app-grid-expandible-item;
        }

        header {
          background-color: var(--paper-grey-200);
          padding: 5px 10px;
          margin: 0 0 1em;
        }

        h3 {
          margin: 0;
          font-size: 14px;
        }

        .row {
          margin-bottom: 1em;
        }

        .col-actions {
          width: 40px;
          margin-right: 24px;
          border-right: 1px solid var(--paper-grey-400);
        }

        .remove-btn {
          width: 34px;
          height: 34px;
          color: var(--paper-deep-orange-a700);
        }

        labelled-item {
          padding: 8px 0;
        }

        .readonly {
          display: block;
          font-size: 16px;
          line-height: 1.5;
          color: var(--theme-primary-text-color-medium);

          @apply --truncate;
        }

        .imo-msg-label {
          font-size: 12px;
          color: var(--theme-secondary-text-color);
        }

        .imo-msg-btn {
          padding: 0;
          margin: 0;
        }
      </style>

      <etools-prp-permissions
          permissions="{{permissions}}">
      </etools-prp-permissions>

      <template
          is="dom-repeat"
          items="[[ajaxData]]">
        <etools-prp-ajax
            id="[[item.id]]"
            url="[[locationsUrl]]"
            params="[[item.params]]">
        </etools-prp-ajax>
      </template>

      <etools-prp-ajax
        id="search">
      </etools-prp-ajax>

      <template
          is="dom-if"
          if="[[canMessageIMO]]"
          restamp="true">
        <message-imo-modal
            id="message-modal"
            cluster-id="[[clusterId]]"
            indicator-id="[[indicatorId]]">
        </message-imo-modal>
      </template>

      <header>
        <h3>[[localize('locations_plural')]] ([[value.length]])</h3>
        <template
            is="dom-if"
            if="[[canMessageIMO]]"
            restamp="true">
          <div class="layout horizontal justified">
            <div class="imo-msg-label self-end">[[localize('to_propose_baseline')]]</div>
            <div>
              <paper-button
                  class="imo-msg-btn btn-primary"
                  on-tap="_msgIMO"
                  noink>
                [[localize('send_message_imo')]]
              </paper-button>
            </div>
          </div>
        </template>
      </header>

      <template is="dom-repeat" items="[[value]]">
        <div class="row layout horizontal">
          <template
              is="dom-if"
              if="[[!_isLocked(item, lockedItems)]]"
              restamp="true">
            <etools-prp-reset
                trigger="[[item.loc_type]]"
                reset="{{item.location}}"
                skip-initial>
            </etools-prp-reset>

            <div class="flex-none layout vertical center-center col-actions">
              <div>
                <paper-icon-button
                    index="[[index]]"
                    class="remove-btn"
                    data-index$="[[index]]"
                    on-tap="_remove"
                    icon="icons:cancel">
                </paper-icon-button>
                <paper-tooltip offset="5">[[localize('remove')]]</paper-tooltip>
              </div>
            </div>
          </template>

          <div class="flex">
            <div class="app-grid">
              <template
                  is="dom-if"
                  if="[[_isLocked(item, lockedItems)]]"
                  restamp="true">
                <labelled-item
                    class="item"
                    label="Location - administrative level">
                  <span class="readonly">Admin [[_getLocationAdminLevel(item)]]</span>
                </labelled-item>
              </template>

              <template
                  is="dom-if"
                  if="[[!_isLocked(item, lockedItems)]]"
                  restamp="true">
                  <etools-dropdown
                      class="item"
                      label="[[localize('location_administrative_level')]]"
                      options="[[locationTypes]]"
                      option-value="id"
                      option-label="title"
                      selected="{{item.loc_type}}"
                      trigger-value-change-event
                      on-etools-selected-item-changed="_onLocTypeChanged"
                      data-index$="[[index]]"
                      required>
                  </etools-dropdown>
              </template>

              <template
                  is="dom-if"
                  if="[[_isLocked(item, lockedItems)]]"
                  restamp="true">
                <labelled-item
                    class="item item-2-col"
                    label="[[localize('location')]]">
                  <span class="readonly">[[_getLocationTitle(item.id, index)]]</span>
                </labelled-item>
              </template>

              <template
                  is="dom-if"
                  if="[[!_isLocked(item, lockedItems)]]"
                  restamp="true">
                <etools-dropdown
                    class="item item-2-col validate"
                    label="[[localize('location')]]"
                    options="[[_getLocations(locations, item.loc_type, index)]]"
                    option-value="id"
                    option-label="title"
                    selected="{{item.location.id}}"
                    selected-item="{{item.location}}"
                    disabled$="[[_getPending(pending, item.loc_type, index)]]"
                    data-index$="[[index]]"
                    required>
                </etools-dropdown>
              </template>

              <template
                  is="dom-if"
                  if="[[indicatorType]]"
                  restamp="true">
                <json-field
                    class="item validate"
                    type="[[indicatorType]]"
                    label="[[localize('baseline')]]"
                    on-input="_validate"
                    value="{{item.baseline}}"
                    allowed-pattern="[+\\-\\d]"
                    disabled="[[!canEditDetails]]"
                    required="[[baselineRequirement]]">
                </json-field>

                <template
                    is="dom-if"
                    if="[[isNumber]]"
                    restamp="true">
                  <json-field
                      class="item validate"
                      type="[[indicatorType]]"
                      label="[[localize('in_need')]]"
                      on-input="_validate"
                      value="{{item.in_need}}"
                      allowed-pattern="[+\\-\\d]"
                      disabled="[[!canEditDetails]]">
                  </json-field>
                </template>

                <json-field
                    class="item validate"
                    type="[[indicatorType]]"
                    label="[[localize('target')]]"
                    on-input="_validate"
                    value="{{item.target}}"
                    allowed-pattern="[+\\-\\d]"
                    required>
                </json-field>
              </template>
            </div>
          </div>
        </div>
      </template>

      <paper-button
          class="btn-primary"
          on-tap="_add">
        [[localize('add_location')]]
      </paper-button>
    `;
    }
    _computeIsNumber(type) {
        return type === 'number';
    }
    _computeBaselineRequirement(isPai, editing) {
        return isPai && !editing;
    }
    _computeLocationsUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterLocationNames(responsePlanId);
    }
    _computeLocationTypes(maxAdminLevel) {
        return Array.apply(null, Array(maxAdminLevel + 1))
            .map(function (_, index) {
            return {
                id: String(index),
                title: 'Admin' + index,
            };
        });
    }
    _computeAjaxData(maxAdminLevel) {
        return Array.apply(null, Array(maxAdminLevel + 1))
            .map(function (_, index) {
            return {
                id: 'locations' + index,
                params: {
                    loc_type: String(index),
                },
            };
        });
    }
    _computeCanEditDetails(editing, parentIndicatorId, isPAI, permissions) {
        if (!permissions) {
            return;
        }
        return !editing ||
            (permissions.createClusterEntities && !isPAI) ||
            (permissions.onlyEditOwnIndicatorDetails && !parentIndicatorId);
    }
    _computeCanMessageIMO(editing, parentIndicatorId, permissions) {
        if (!permissions) {
            return;
        }
        return editing && permissions.onlyEditOwnIndicatorDetails && !!parentIndicatorId;
    }
    _lockItems(value) {
        if (this.valueInitialized) {
            return;
        }
        this.valueInitialized = true;
        setTimeout(() => {
            this.set('lockedItems', value.slice());
        });
    }
    _isLocked(item, locked) {
        if (!locked) {
            return false;
        }
        return locked.indexOf(item) !== -1;
    }
    _add() {
        const initial = 0;
        this.push('value', {
            loc_type: initial
        });
        this.set('searchLocationType', 0);
        this.set('locationsInitialized', true);
        const newLocations = this.locations;
        const value = this.value;
        value.forEach((location, index) => {
            if (location.location === undefined && newLocations[index] === undefined) {
                newLocations[index] = { 0: [] };
            }
        });
        this.set('locations', newLocations);
        const pending = this.pending;
        pending.push({ initial: false });
        this.set('pending', pending);
        this._fetchLocations(String(initial), undefined, this.value.length - 1);
    }
    _remove(e) {
        // @ts-ignore
        const toRemove = +e.target.dataset.index;
        this.locations.splice(toRemove, 1);
        this.pending.splice(toRemove, 1);
        const newvalue = this.value.map((x) => x);
        newvalue.splice(toRemove, 1);
        this.set('value', newvalue);
    }
    _validate(e) {
        e.target.validate();
    }
    _onLocTypeChanged(e) {
        if (!e.detail.selectedItem) {
            return;
        }
        const index = Number(e.target.dataset.index);
        this._fetchLocations(e.detail.selectedItem.id, undefined, index);
    }
    _fetchLocations(loc_type, title, index) {
        if (loc_type === undefined) {
            return;
        }
        this.set('searchLocationType', loc_type);
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(100), () => {
            const self = this;
            this._setPending(loc_type, true, index);
            if (title !== undefined) {
                // @ts-ignore
                this.shadowRoot.querySelector('#locations' + loc_type).params.title = title;
            }
            const thunk = this.shadowRoot.querySelector('#locations' + loc_type).thunk();
            thunk().then((res) => {
                self.set('url', res.xhr.responseURL);
                self._setPending(loc_type, false, index);
                self._setLocations(loc_type, res.data.results, index);
            })
                .catch(function () {
                self._setPending(loc_type, false, index);
            });
        });
    }
    _fetchInitialLocations(lockedItems) {
        this.set('savedLocations', lockedItems);
        const newLocations = this.locations.map((x) => x);
        if (lockedItems.length > 0) {
            lockedItems.forEach(function (location, index) {
                if (location.admin_level === undefined) {
                    newLocations[index] = {};
                    newLocations[index][location.loc_type] = [location];
                }
                else {
                    newLocations[index] = {};
                    newLocations[index][location.admin_level] = [location];
                }
            });
        }
        else {
            // @ts-ignore
            lockedItems.forEach((location, index) => {
                newLocations[index] = { 0: [] };
            });
        }
        this.set('locations', newLocations);
    }
    _getPending(pending, loc_type, index) {
        return pending[index] ? !!pending[index][loc_type] : false;
    }
    _getLocations(locations, loc_type, index) {
        return locations[index] ? locations[index][loc_type] : undefined;
    }
    _getLocationAdminLevel(location) {
        return location.loc_type >= 0 ? location.loc_type : location.admin_level;
    }
    _getLocationTitle(locationId, index) {
        if (!this.value || !this.value[index]) {
            return;
        }
        let targetLocation = this.value[index];
        return targetLocation ? targetLocation.title : '';
    }
    _setPending(loc_type, value, index) {
        const newPending = this.pending.map((x) => x);
        if (newPending[index] === undefined) {
            newPending[index] = {};
        }
        newPending[index][loc_type] = value;
        this.set('pending', newPending);
    }
    _setLocations(loc_type, value, index) {
        const newLocations = this.locations.map((x) => x);
        if (newLocations[index] === undefined) {
            newLocations[index] = {};
        }
        newLocations[index][loc_type] = value;
        this.set('locations', newLocations);
    }
    _msgIMO() {
        if (this.messageModal) {
            this.messageModal.open();
        }
    }
    _handleMessageSent(e) {
        e.stopPropagation();
        this._notifyMessageSent();
    }
    validate() {
        this.set('invalid', !this._fieldsAreValid());
    }
    connectedCallback() {
        super.connectedCallback();
        this.set('locations', []);
        this.set('pending', []);
        this._handleMessageSent = this._handleMessageSent.bind(this);
        this.messageModal = this.shadowRoot.querySelector('#message-modal');
        if (this.messageModal) {
            this.messageModal.addEventListener('imo-message-sent', this._handleMessageSent);
            document.body.appendChild(this.messageModal);
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        const locTypeDebouncers = Array(this.maxAdminLevel)
            .fill('fetch-locations-')
            .map(function (item, index) {
            return item + (++index);
        });
        this._cancelDebouncers(locTypeDebouncers.concat('reset-location'));
        if (this.messageModal) {
            document.body.removeChild(this.messageModal);
            this.messageModal.removeEventListener('imo-message-sent', this._handleMessageSent);
            this.messageModal = null;
        }
    }
}
__decorate([
    property({ type: Object })
], IndicatorLocationsWidget.prototype, "messageModal", void 0);
__decorate([
    property({ type: String })
], IndicatorLocationsWidget.prototype, "indicatorType", void 0);
__decorate([
    property({ type: Number })
], IndicatorLocationsWidget.prototype, "indicatorId", void 0);
__decorate([
    property({ type: Number })
], IndicatorLocationsWidget.prototype, "parentIndicatorId", void 0);
__decorate([
    property({ type: Number })
], IndicatorLocationsWidget.prototype, "clusterId", void 0);
__decorate([
    property({ type: Array })
], IndicatorLocationsWidget.prototype, "locations", void 0);
__decorate([
    property({ type: Array })
], IndicatorLocationsWidget.prototype, "savedLocations", void 0);
__decorate([
    property({ type: Array })
], IndicatorLocationsWidget.prototype, "pending", void 0);
__decorate([
    property({ type: Boolean })
], IndicatorLocationsWidget.prototype, "isPai", void 0);
__decorate([
    property({ type: String })
], IndicatorLocationsWidget.prototype, "searchLocationType", void 0);
__decorate([
    property({ type: Boolean })
], IndicatorLocationsWidget.prototype, "editing", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeBaselineRequirement(isPai, editing)' })
], IndicatorLocationsWidget.prototype, "baselineRequirement", void 0);
__decorate([
    property({ type: Array, observer: '_fetchInitialLocations' })
], IndicatorLocationsWidget.prototype, "lockedItems", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeIsNumber(indicatorType)' })
], IndicatorLocationsWidget.prototype, "isNumber", void 0);
__decorate([
    property({ type: String })
], IndicatorLocationsWidget.prototype, "url", void 0);
__decorate([
    property({ type: Array, notify: true, observer: '_lockItems' })
], IndicatorLocationsWidget.prototype, "value", void 0);
__decorate([
    property({ type: Boolean })
], IndicatorLocationsWidget.prototype, "valueInitialized", void 0);
__decorate([
    property({ type: Boolean, notify: true })
], IndicatorLocationsWidget.prototype, "invalid", void 0);
__decorate([
    property({ type: Boolean })
], IndicatorLocationsWidget.prototype, "locationsInitialized", void 0);
__decorate([
    property({ type: Number })
], IndicatorLocationsWidget.prototype, "maxAdminLevel", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], IndicatorLocationsWidget.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Array, computed: '_computeLocationTypes(maxAdminLevel)' })
], IndicatorLocationsWidget.prototype, "locationTypes", void 0);
__decorate([
    property({ type: String, computed: '_computeLocationsUrl(responsePlanId)' })
], IndicatorLocationsWidget.prototype, "locationsUrl", void 0);
__decorate([
    property({ type: String })
], IndicatorLocationsWidget.prototype, "locationTitle", void 0);
__decorate([
    property({ type: Array, computed: '_computeAjaxData(maxAdminLevel)' })
], IndicatorLocationsWidget.prototype, "ajaxData", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeCanEditDetails(editing, parentIndicatorId, isPai, permissions)' })
], IndicatorLocationsWidget.prototype, "canEditDetails", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeCanMessageIMO(editing, parentIndicatorId, permissions)' })
], IndicatorLocationsWidget.prototype, "canMessageIMO", void 0);
window.customElements.define('indicator-locations-widget', IndicatorLocationsWidget);
