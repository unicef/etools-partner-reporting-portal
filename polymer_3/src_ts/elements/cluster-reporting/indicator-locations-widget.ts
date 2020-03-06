import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import Settings from '../../settings';
import UtilsMixin from '../../mixins/utils-mixin';
import NotificationsMixin from '../../mixins/notifications-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {buttonsStyles} from '../../styles/buttons-styles';
import {sharedStyles} from '../../styles/shared-styles';
import '../json-field';
import '../etools-prp-ajax';
import '../etools-prp-reset';
import '../etools-prp-permissions';
import '../labelled-item';
import './message-imo-modal';
import {MessageImoModalEl} from './message-imo-modal';
import {GenericObject} from '../../typings/globals.types';
import Endpoints from '../../endpoints';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin LocalizeMixin
 */
class IndicatorLocationsWidget extends UtilsMixin(NotificationsMixin(LocalizeMixin(ReduxConnectedElement))) {
  public static get template() {
    return html`
      ${buttonsStyles} ${sharedStyles}
      <style include="iron-flex iron-flex-alignment app-grid-style">
        :host {
          display: block;

          --app-grid-columns: 3;
          --app-grid-gutter: 24px;
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

      <template
          is="dom-repeat"
          items="[[value]]">
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
                <!--
                <etools-single-selection-menu
                    class="item"
                    label="[[localize('location_administrative_level')]]"
                    options="[[locationTypes]]"
                    option-value="id"
                    option-label="title"
                    selected="{{item.loc_type}}"
                    data-index$="[[index]]"
                    on-selected-changed="_onLocTypeChanged"
                    required>
                </etools-single-selection-menu>
                -->
                <etools-dropdown
                    class="item"
                    label="[[localize('location_administrative_level')]]"
                    options="[[locationTypes]]"
                    option-value="id"
                    option-label="title"
                    selected="{{item.loc_type}}"
                    trigger-value-change-event
                    on-etools-selected-item-changed="_onLocTypeChanged"
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
                  <span class="readonly">[[_getLocationTitle(locations, item, item.id, index)]]</span>
                </labelled-item>
              </template>

              <template
                  is="dom-if"
                  if="[[!_isLocked(item, lockedItems)]]"
                  restamp="true">
                <!--
                <etools-single-selection-menu
                    class="item item-2-col validate"
                    label="[[localize('location')]]"
                    options="[[_getLocations(locations, item.loc_type, index)]]"
                    option-value="id"
                    option-label="title"
                    selected-item="{{item.location}}"
                    on-value-changed="_onValueChanged"
                    data-index$="[[index]]"
                    disabled="[[_getPending(pending, item.loc_type, index)]]"
                    required>
                </etools-single-selection-menu>
                -->
                <etools-dropdown
                    class="item item-2-col validate"
                    label="[[localize('location')]]"
                    options="[[_getLocations(locations, item.loc_type, index)]]"
                    option-value="id"
                    option-label="title"
                    selected-item="{{item.location}}"
                    disabled="[[_getPending(pending, item.loc_type, index)]]"
                    on-etools-selected-item-changed="_onValueChanged"
                    trigger-value-change-event
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

  @property({type: Object})
  messageModal!: MessageImoModalEl | null;

  @property({type: String})
  indicatorType!: string;

  @property({type: Number})
  indicatorId!: number;

  @property({type: Number})
  parentIndicatorId!: number;

  @property({type: Number})
  clusterId!: number;

  @property({type: Object})
  locations!: GenericObject;

  @property({type: Object})
  savedLocations!: GenericObject;

  @property({type: Object})
  pending!: GenericObject;

  @property({type: Boolean})
  isPai: boolean = false;

  @property({type: String})
  searchLocationType!: string;

  @property({type: Boolean})
  editing: boolean = false;

  @property({type: Boolean, computed: '_computeBaselineRequirement(isPai, editing)'})
  baselineRequirement!: boolean;

  @property({type: Array, observer: '_fetchInitialLocations'})
  lockedItems!: any[];

  @property({type: Boolean, computed: '_computeIsNumber(indicatorType)'})
  isNumber!: boolean;

  @property({type: String})
  url!: string;

  @property({type: Array, notify: true, observer: '_lockItems'})
  value!: any[];

  @property({type: Boolean})
  valueInitialized: boolean = false;

  @property({type: Boolean, notify: true})
  invalid: boolean = false;

  @property({type: Boolean})
  locationsInitialized: boolean = false;

  @property({type: Number})
  maxAdminLevel: number = Settings.cluster.maxLocType;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array, computed: '_computeLocationTypes(maxAdminLevel)'})
  locationTypes!: any[];

  @property({type: String, computed: '_computeLocationsUrl(responsePlanId)'})
  locationsUrl!: string;

  @property({type: String})
  locationTitle: string = '';

  @property({type: Array, computed: '_computeAjaxData(maxAdminLevel)'})
  ajaxData!: any[];

  @property({type: Boolean, computed: '_computeCanEditDetails(editing, parentIndicatorId, isPai, permissions)'})
  canEditDetails!: boolean;

  @property({type: Boolean, computed: '_computeCanMessageIMO(editing, parentIndicatorId, permissions)'})
  canMessageIMO!: boolean;


  private _debouncer!: Debouncer;

  _onValueChanged(event: CustomEvent) {  // This method runs whenever user begins searching in locations dropdown
    let loc_type = this.get('searchLocationType') || 0;
    let index = -1;

    if (event.detail.value === '') {
      return;
    }

    event.path.forEach((node: GenericObject) => {
      if (node.nodeName === 'ETOOLS-SINGLE-SELECTION-MENU') {
        index = node.dataset.index;  // Grab index of current location widget component
        return;
      }
    });

    if (loc_type === 0 && index === undefined) {
      index = 0;
    }

    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(100),
      () => {
        let self = this;

        let thunk = self.$.search;
        thunk.url = self.get('url');

        thunk.params = {
          loc_type: loc_type,
          title: event.detail.value
        };

        thunk.thunk()
          .then((res: GenericObject) => {
            self._setPending(loc_type, false, index);
            self._setLocations(loc_type, res.data.results, index);
          })
          .catch((err: GenericObject) => {
            console.error(err);
            self._setPending(loc_type, false, index);
          });
        return;
      });

  }

  _computeIsNumber(type: string) {
    return type === 'number';
  }

  _computeBaselineRequirement(isPai: boolean, editing: boolean) {
    return isPai && !editing;
  }

  _computeLocationsUrl(responsePlanId: string) {
    return Endpoints.clusterLocationNames(responsePlanId);
  }

  _computeLocationTypes(maxAdminLevel: number) {
    return Array.apply(null, Array(maxAdminLevel + 1))
      .map(function(_, index) {
        return {
          id: String(index),
          title: 'Admin' + index,
        };
      });
  }

  _computeAjaxData(maxAdminLevel: number) {
    return Array.apply(null, Array(maxAdminLevel + 1))
      .map(function(_, index) {
        return {
          id: 'locations' + index,
          params: {
            loc_type: String(index),
          },
        };
      });
  }

  _computeCanEditDetails(editing: boolean, parentIndicatorId: number, isPAI: boolean, permissions: GenericObject) {
    return !editing ||
      (permissions.createClusterEntities && !isPAI) ||
      (permissions.onlyEditOwnIndicatorDetails && !parentIndicatorId);
  }

  _computeCanMessageIMO(editing: boolean, parentIndicatorId: number, permissions: GenericObject) {
    return editing && permissions.onlyEditOwnIndicatorDetails && !!parentIndicatorId;
  }

  _lockItems(value) {
    if (this.get('valueInitialized')) {
      return;
    }

    this.set('valueInitialized', true);

    setTimeout(() => {
      this.set('lockedItems', value.slice());
    });
  }

  _isLocked(item, locked: any[]) {
    return locked.indexOf(item) !== -1;
  }

  _add() {
    let initial = 0;

    this.push('value', {
      loc_type: initial,
    });

    this.set('searchLocationType', 0);
    this.set('locationsInitialized', true);

    let newLocations = this.get('locations');
    let value = this.get('value');

    value.forEach(function(location, index) {
      if (location.location === undefined && newLocations[index] === undefined) {
        newLocations[index] = {0: []};
      }
    });

    this.set('locations', newLocations);

    let newPendingIndex = Object.keys(this.get('pending')).length;
    let pending = this.get('pending');

    pending[newPendingIndex] = {
      initial: false
    };

    this.set('pending', pending);

    this._fetchLocations(initial, undefined, this.get('value').length - 1);
  }

  _remove(e: CustomEvent) {
    let value = this.get('value');
    let toRemove = +e.target!.dataset.index;
    let pending = this.get('pending');
    let locations = this.get('locations');

    delete locations[toRemove];
    delete pending[toRemove];

    let newValue = value.slice(0, toRemove).concat(value.slice(toRemove + 1));

    this.set('pending', pending);
    this.set('value', newValue);
  }

  _validate(e: CustomEvent) {
    e.target!.validate();
  }

  _onLocTypeChanged(event: CustomEvent) {
    let index = -1;
    //(dci) need to check this
    event.path.forEach((node: GenericObject) => {
      if (node.nodeName === 'ETOOLS-SINGLE-SELECTION-MENU') {
        index = node.dataset.index;
        return;
      }
    });

    if (index === -1) {
      return;
    }

    this._fetchLocations(event.detail.selectedItem.value, undefined, index);//data.value
  }

  _fetchLocations(loc_type, title, index) {
    if (loc_type === undefined) {
      return;
    }

    this.set('searchLocationType', loc_type);

    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(100),
      () => {
        let self = this;

        this._setPending(loc_type, true, index);

        if (title !== undefined) {
          this.shadowRoot!.querySelector('#locations' + loc_type).params.title = title;
        }

        const thunk = (this.shadowRoot!.querySelector('#locations' + loc_type) as EtoolsPrpAjaxEl).thunk();
        thunk().then((res: GenericObject) => {
          self.set('url', res.xhr.responseURL);
          self._setPending(loc_type, false, index);
          self._setLocations(loc_type, res.data.results, index);
        })
          .catch(function() {
            self._setPending(loc_type, false, index);
          });
      });
  }

  _fetchInitialLocations(lockedItems: any[]) {
    this.set('savedLocations', lockedItems);

    let newLocations = Object.assign({}, this.get('locations'));

    if (lockedItems.length > 0) {
      lockedItems.forEach(function(location, index) {
        if (location.admin_level === undefined) {
          newLocations[index] = {};
          newLocations[index][location.loc_type] = [location];
        } else {
          newLocations[index] = {};
          newLocations[index][location.admin_level] = [location];
        }
      });
    } else {
      lockedItems.forEach(function(location, index) {
        newLocations[index] = {0: []};
      });
    }

    this.set('locations', newLocations);
  }

  _getPending(pending: GenericObject, loc_type: string, index: number) {
    return !!pending[index][loc_type];
  }

  _getLocations(locations: any[], loc_type: string, index: number) {
    return locations[index][loc_type] || [];
  }

  _getLocationAdminLevel(location: GenericObject) {
    return location.loc_type >= 0 ? location.loc_type : location.admin_level;
  }

  _getLocationTitle(locations: any[], location: GenericObject, locationId: string, index: number) {
    let loc_type = location.loc_type >= 0 ? location.loc_type : location.admin_level;
    let allLocations = this._getLocations(locations, loc_type, index);

    let targetLocation = allLocations.find(function(loc: GenericObject) {
      return String(loc.id) === String(locationId);
    });

    return targetLocation ? targetLocation.title : '';
  }

  _setPending(loc_type: string, value: any, index: number) {
    let newPending = Object.assign({}, this.get('pending'));

    if (newPending[index] === undefined) {
      newPending[index] = {};
    }

    newPending[index][loc_type] = value;

    this.set('pending', newPending);
  }

  _setLocations(loc_type: string, value: any, index: number) {
    let newLocations = Object.assign({}, this.get('locations'));

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

  _handleMessageSent(e: CustomEvent) {
    e.stopPropagation();

    this._notifyMessageSent();
  }

  validate() {
    this.set('invalid', !this._fieldsAreValid());
  }

  connectedCallback() {
    super.connectedCallback();
    this.set('locations', {});
    this.set('pending', {});

    this._handleMessageSent = this._handleMessageSent.bind(this);
    this.messageModal = this.shadowRoot!.querySelector('#message-modal') as MessageImoModalEl;

    if (this.messageModal) {
      this.messageModal.addEventListener('imo-message-sent', this._handleMessageSent as any);
      document.body.appendChild(this.messageModal);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    let locTypeDebouncers = Array(this.get('maxAdminLevel'))
      .fill('fetch-locations-')
      .map(function(item, index) {
        return item + (++index);
      });

    this._cancelDebouncers(locTypeDebouncers.concat('reset-location'));

    if (this.messageModal) {
      document.body.removeChild(this.messageModal);

      this.messageModal.removeEventListener('imo-message-sent', this._handleMessageSent as any);
      this.messageModal = null;
    }
  }

}

window.customElements.define('indicator-locations-widget', IndicatorLocationsWidget);
