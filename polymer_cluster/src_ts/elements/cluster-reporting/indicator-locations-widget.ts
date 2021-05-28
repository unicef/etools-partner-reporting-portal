import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
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
import Settings from '../../etools-prp-common/settings';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import NotificationsMixin from '../../etools-prp-common/mixins/notifications-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {buttonsStyles} from '../../etools-prp-common/styles/buttons-styles';
import {sharedStyles} from '../../etools-prp-common/styles/shared-styles';
import '../json-field';
import '../../etools-prp-common/elements/etools-prp-ajax';
import '../etools-prp-reset';
import '../../etools-prp-common/elements/etools-prp-permissions';
import '../../etools-prp-common/elements/labelled-item';
import './message-imo-modal';
import {MessageImoModalEl} from './message-imo-modal';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';
import Endpoints from '../../endpoints';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';

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
          --app-grid-gutter: 16px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;
          --esmm-list-wrapper: {
            height: 350px;
          }
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

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <template is="dom-repeat" items="[[ajaxData]]">
        <etools-prp-ajax id="[[item.id]]" url="[[locationsUrl]]" params="[[item.params]]"> </etools-prp-ajax>
      </template>

      <etools-prp-ajax id="search"> </etools-prp-ajax>

      <template is="dom-if" if="[[canMessageIMO]]" restamp="true">
        <message-imo-modal id="messageModal" cluster-id="[[clusterId]]" indicator-id="[[indicatorId]]">
        </message-imo-modal>
      </template>

      <header>
        <h3>[[localize('locations_plural')]] ([[value.length]])</h3>
        <template is="dom-if" if="[[canMessageIMO]]" restamp="true">
          <div class="layout horizontal justified">
            <div class="imo-msg-label self-end">[[localize('to_propose_baseline')]]</div>
            <div>
              <paper-button class="imo-msg-btn btn-primary" on-tap="_msgIMO" noink>
                [[localize('send_message_imo')]]
              </paper-button>
            </div>
          </div>
        </template>
      </header>

      <template is="dom-repeat" items="[[value]]">
        <div class="row layout horizontal">
          <template is="dom-if" if="[[!_isLocked(item, lockedItems)]]" restamp="true">
            <etools-prp-reset trigger="[[item.loc_type]]" reset="{{item.location}}" skip-initial> </etools-prp-reset>

            <div class="flex-none layout vertical center-center col-actions">
              <div>
                <paper-icon-button
                  index="[[index]]"
                  class="remove-btn"
                  data-index$="[[index]]"
                  on-tap="_remove"
                  icon="icons:cancel"
                >
                </paper-icon-button>
                <paper-tooltip offset="5">[[localize('remove')]]</paper-tooltip>
              </div>
            </div>
          </template>

          <div class="flex">
            <div class="app-grid">
              <template is="dom-if" if="[[_isLocked(item, lockedItems)]]" restamp="true">
                <labelled-item class="item" label="Location - administrative level">
                  <span class="readonly">Admin [[_getLocationAdminLevel(item)]]</span>
                </labelled-item>
              </template>

              <template is="dom-if" if="[[!_isLocked(item, lockedItems)]]" restamp="true">
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
                  required
                >
                </etools-dropdown>
              </template>

              <template is="dom-if" if="[[_isLocked(item, lockedItems)]]" restamp="true">
                <labelled-item class="item item-2-col" label="[[localize('location')]]">
                  <span class="readonly">[[_getLocationTitle(item.id, index)]]</span>
                </labelled-item>
              </template>

              <template is="dom-if" if="[[!_isLocked(item, lockedItems)]]" restamp="true">
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
                  required
                >
                </etools-dropdown>
              </template>

              <template is="dom-if" if="[[indicatorType]]" restamp="true">
                <json-field
                  class="item validate"
                  type="[[indicatorType]]"
                  label="[[localize('baseline')]]"
                  on-input="_validate"
                  value="{{item.baseline}}"
                  allowed-pattern="[+\\-\\d]"
                  disabled="[[!canEditDetails]]"
                  required="[[baselineRequirement]]"
                >
                </json-field>

                <template is="dom-if" if="[[isNumber]]" restamp="true">
                  <json-field
                    class="item validate"
                    type="[[indicatorType]]"
                    label="[[localize('in_need')]]"
                    on-input="_validate"
                    value="{{item.in_need}}"
                    allowed-pattern="[+\\-\\d]"
                    disabled="[[!canEditDetails]]"
                  >
                  </json-field>
                </template>

                <json-field
                  class="item validate"
                  type="[[indicatorType]]"
                  label="[[localize('target')]]"
                  on-input="_validate"
                  value="{{item.target}}"
                  allowed-pattern="[+\\-\\d]"
                  required
                >
                </json-field>
              </template>
            </div>
          </div>
        </div>
      </template>

      <paper-button class="btn-primary" on-tap="_add"> [[localize('add_location')]] </paper-button>
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

  @property({type: Array})
  locations!: any[];

  @property({type: Array})
  savedLocations!: any[];

  @property({type: Array})
  pending!: any[];

  @property({type: Boolean})
  isPai = false;

  @property({type: String})
  searchLocationType!: string;

  @property({type: Boolean})
  editing = false;

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
  valueInitialized = false;

  @property({type: Boolean, notify: true})
  invalid = false;

  @property({type: Boolean})
  locationsInitialized = false;

  @property({type: Number})
  maxAdminLevel: number = Settings.cluster.maxLocType;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array, computed: '_computeLocationTypes(maxAdminLevel)'})
  locationTypes!: any[];

  @property({type: String, computed: '_computeLocationsUrl(responsePlanId)'})
  locationsUrl!: string;

  @property({type: String})
  locationTitle = '';

  @property({type: Array, computed: '_computeAjaxData(maxAdminLevel)'})
  ajaxData!: any[];

  @property({type: Boolean, computed: '_computeCanEditDetails(editing, parentIndicatorId, isPai, permissions)'})
  canEditDetails!: boolean;

  @property({type: Boolean, computed: '_computeCanMessageIMO(editing, parentIndicatorId, permissions)'})
  canMessageIMO!: boolean;

  private _debouncer!: Debouncer;

  _computeIsNumber(type: string) {
    return type === 'number';
  }

  _computeBaselineRequirement(isPai: boolean, editing: boolean) {
    return isPai && !editing;
  }

  _computeLocationsUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterLocationNames(responsePlanId);
  }

  _computeLocationTypes(maxAdminLevel: number) {
    return Array(maxAdminLevel + 1)
      .fill(0)
      .map((_, index) => {
        return {id: String(index), title: 'Admin' + index};
      });
  }

  _computeAjaxData(maxAdminLevel: number) {
    return Array(maxAdminLevel + 1)
      .fill(0)
      .map((_, index) => {
        return {
          id: 'locations' + index,
          params: {
            loc_type: String(index)
          }
        };
      });
  }

  _computeCanEditDetails(editing: boolean, parentIndicatorId: number, isPAI: boolean, permissions: GenericObject) {
    if (!permissions) {
      return;
    }
    return (
      !editing ||
      (permissions.createClusterEntities && !isPAI) ||
      (permissions.onlyEditOwnIndicatorDetails && !parentIndicatorId)
    );
  }

  _computeCanMessageIMO(editing: boolean, parentIndicatorId: number, permissions: GenericObject) {
    if (!permissions) {
      return;
    }
    return editing && permissions.onlyEditOwnIndicatorDetails && !!parentIndicatorId;
  }

  _lockItems(value: any[]) {
    if (this.valueInitialized) {
      return;
    }

    this.valueInitialized = true;

    setTimeout(() => {
      this.set('lockedItems', value.slice());
    });
  }

  _isLocked(item: any, locked: any[]) {
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

    value.forEach((location: GenericObject, index: number) => {
      if (location.location === undefined && newLocations[index] === undefined) {
        newLocations[index] = {0: []};
      }
    });

    this.set('locations', newLocations);

    const pending = this.pending;
    pending.push({initial: false});
    this.set('pending', pending);

    this._fetchLocations(String(initial), undefined, this.value.length - 1);
  }

  _remove(e: CustomEvent) {
    // @ts-ignore
    const toRemove = +e.target!.dataset.index;

    this.locations.splice(toRemove, 1);
    this.pending.splice(toRemove, 1);

    const newvalue = this.value.map((x: any) => x);
    newvalue.splice(toRemove, 1);
    this.set('value', newvalue);
  }

  _validate(e: CustomEvent) {
    (e.target as any).validate();
  }

  _onLocTypeChanged(e: CustomEvent) {
    if (!e.detail.selectedItem) {
      return;
    }

    const index = Number((e.target as EtoolsDropdownEl).dataset.index);
    this._fetchLocations(e.detail.selectedItem.id, undefined, index);
  }

  _fetchLocations(loc_type: string, title: any, index: number) {
    if (loc_type === undefined) {
      return;
    }

    this.set('searchLocationType', loc_type);

    this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(100), () => {
      this._setPending(loc_type, true, index);

      if (title !== undefined) {
        // @ts-ignore
        this.shadowRoot!.querySelector('#locations' + loc_type)!.params.title = title;
      }

      const thunk = (this.shadowRoot!.querySelector('#locations' + loc_type) as EtoolsPrpAjaxEl).thunk();
      thunk()
        .then((res: GenericObject) => {
          this.set('url', res.xhr.responseURL);
          this._setPending(loc_type, false, index);
          this._setLocations(loc_type, res.data.results, index);
        })
        .catch(() => {
          this._setPending(loc_type, false, index);
        });
    });
  }

  _fetchInitialLocations(lockedItems: any[]) {
    this.set('savedLocations', lockedItems);

    const newLocations = this.locations.map((x: any) => x);

    if (lockedItems.length > 0) {
      lockedItems.forEach(function (location, index) {
        if (location.admin_level === undefined) {
          newLocations[index] = {};
          newLocations[index][location.loc_type] = [location];
        } else {
          newLocations[index] = {};
          newLocations[index][location.admin_level] = [location];
        }
      });
    } else {
      // @ts-ignore
      lockedItems.forEach((location, index) => {
        newLocations[index] = {0: []};
      });
    }

    this.set('locations', newLocations);
  }

  _getPending(pending: GenericObject, loc_type: string, index: number) {
    return pending[index] ? !!pending[index][loc_type] : false;
  }

  _getLocations(locations: any[], loc_type: string, index: number) {
    return locations[index] ? locations[index][loc_type] : undefined;
  }

  _getLocationAdminLevel(location: GenericObject) {
    return location.loc_type >= 0 ? location.loc_type : location.admin_level;
  }

  // @ts-ignore
  _getLocationTitle(locationId: string, index: number) {
    if (!this.value || !this.value[index]) {
      return;
    }
    const targetLocation = this.value[index];
    return targetLocation ? targetLocation.title : '';
  }

  _setPending(loc_type: string, value: any, index: number) {
    const newPending = this.pending.map((x: any) => x);

    if (newPending[index] === undefined) {
      newPending[index] = {};
    }

    newPending[index][loc_type] = value;

    this.set('pending', newPending);
  }

  _setLocations(loc_type: string, value: any, index: number) {
    const newLocations = this.locations.map((x: any) => x);

    if (newLocations[index] === undefined) {
      newLocations[index] = {};
    }

    newLocations[index][loc_type] = value;

    this.set('locations', newLocations);
  }

  _msgIMO() {
    if (!this.messageModal) {
      this.messageModal = this.shadowRoot!.querySelector('#messageModal') as MessageImoModalEl;
      if (this.messageModal) {
        this._handleMessageSent = this._handleMessageSent.bind(this);
        this.messageModal.addEventListener('imo-message-sent', this._handleMessageSent as any);
      }
    }
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
    this.set('locations', []);
    this.set('pending', []);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const locTypeDebouncers = Array(this.maxAdminLevel)
      .fill('fetch-locations-')
      .map(function (item, index) {
        return item + ++index;
      });

    this._cancelDebouncers(locTypeDebouncers.concat('reset-location'));

    if (this.messageModal) {
      this.messageModal.removeEventListener('imo-message-sent', this._handleMessageSent as any);
      this.messageModal = null;
    }
  }
}

window.customElements.define('indicator-locations-widget', IndicatorLocationsWidget);
